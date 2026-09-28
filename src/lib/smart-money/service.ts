import { formatEther, isAddress, zeroAddress } from "viem";
import { getNativeBalance, getWalletTransactionCount } from "@/lib/web3/onchain";
import { getChainId, getNetworkFromChainId } from "./config";
import type {
  SmartMoneyActivity,
  SmartMoneyDirection,
  SmartMoneyFlow,
  SmartMoneyNetwork,
  SmartMoneyStatus,
  SmartMoneyWallet,
  SmartMoneyWalletConfig,
  SmartMoneyWindow,
} from "./types";

const ETHERSCAN_API_BASE = "https://api.etherscan.io/v2/api";
const ACTIVITY_LIMIT = 100;

interface EtherscanTransaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  isError: string;
  txreceipt_status?: string;
}

function directionFor(transaction: EtherscanTransaction, address: string): SmartMoneyDirection {
  const wallet = address.toLowerCase();
  const from = transaction.from?.toLowerCase();
  const to = transaction.to?.toLowerCase();
  if (!from || !to) return "unknown";
  if (from === wallet && to === wallet) return "self";
  if (to === wallet) return "in";
  if (from === wallet) return transaction.to === zeroAddress ? "contract" : "out";
  return "unknown";
}

function statusFor(transaction: EtherscanTransaction): SmartMoneyStatus {
  if (transaction.isError === "1" || transaction.txreceipt_status === "0") return "failed";
  if (transaction.isError === "0" || transaction.txreceipt_status === "1") return "success";
  return "unknown";
}

function toActivity(transaction: EtherscanTransaction, address: string): SmartMoneyActivity {
  const amount = transaction.value === undefined ? null : Number(formatEther(BigInt(transaction.value)));
  return {
    hash: transaction.hash,
    timestamp: transaction.timeStamp ? new Date(Number(transaction.timeStamp) * 1000).toISOString() : null,
    direction: directionFor(transaction, address),
    amount: Number.isFinite(amount) ? amount : null,
    from: transaction.from || "",
    to: transaction.to || "",
    blockNumber: Number(transaction.blockNumber) || 0,
    status: statusFor(transaction),
  };
}

async function fetchEtherscanTransactions(address: string, network: SmartMoneyNetwork): Promise<EtherscanTransaction[] | null> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    chainid: String(getChainId(network)),
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: String(ACTIVITY_LIMIT),
    sort: "desc",
    apikey: apiKey,
  });
  const response = await fetch(`${ETHERSCAN_API_BASE}?${params}`, { next: { revalidate: 30 } });
  if (!response.ok) throw new Error("Etherscan request failed");
  const data = await response.json() as { status?: string; result?: EtherscanTransaction[] | string };
  if (data.status === "1" && Array.isArray(data.result)) return data.result;
  if (typeof data.result === "string" && data.result.toLowerCase().includes("no transactions")) return [];
  throw new Error("Etherscan returned no usable transaction data");
}

export async function getSmartMoneyActivity(address: string, network: SmartMoneyNetwork): Promise<{ activities: SmartMoneyActivity[]; source: string }> {
  if (!isAddress(address)) throw new Error("INVALID WALLET ADDRESS");
  const transactions = await fetchEtherscanTransactions(address, network);
  if (transactions) return { activities: transactions.map((transaction) => toActivity(transaction, address)), source: "etherscan" };
  return { activities: [], source: "rpc" };
}

function summarize(activities: SmartMoneyActivity[]) {
  let inflow = 0;
  let outflow = 0;
  for (const activity of activities) {
    if (activity.amount === null || activity.status === "failed") continue;
    if (activity.direction === "in") inflow += activity.amount;
    if (activity.direction === "out" || activity.direction === "contract") outflow += activity.amount;
  }
  const timestamps = activities.flatMap((activity) => activity.timestamp ? [activity.timestamp] : []);
  return {
    inflow,
    outflow,
    netFlow: inflow - outflow,
    firstActivity: timestamps.length ? timestamps.reduce((earliest, value) => earliest < value ? earliest : value) : null,
    lastActivity: timestamps.length ? timestamps.reduce((latest, value) => latest > value ? latest : value) : null,
  };
}

export async function getSmartMoneyWallet(address: string, network: SmartMoneyNetwork, label = "Unlabelled wallet"): Promise<SmartMoneyWallet> {
  if (!isAddress(address)) throw new Error("INVALID WALLET ADDRESS");
  const chainId = getChainId(network);
  const [balance, transactionCount, activity] = await Promise.all([
    getNativeBalance(address, chainId),
    getWalletTransactionCount(address, chainId),
    getSmartMoneyActivity(address, network),
  ]);
  const flow = summarize(activity.activities);
  return {
    address,
    label,
    network,
    balance: balance ? Number(balance.native.formattedBalance) : null,
    transactionCount,
    ...flow,
    source: activity.source === "etherscan" ? "etherscan + rpc" : "rpc",
  };
}

function windowStart(window: SmartMoneyWindow): number {
  const hours: Record<SmartMoneyWindow, number> = { "24H": 24, "7D": 168, "30D": 720, "90D": 2160 };
  return Date.now() - hours[window] * 60 * 60 * 1000;
}

export async function getSmartMoneyFlow(address: string, network: SmartMoneyNetwork, window: SmartMoneyWindow): Promise<SmartMoneyFlow> {
  const activity = await getSmartMoneyActivity(address, network);
  const filtered = activity.activities.filter((item) => item.timestamp && new Date(item.timestamp).getTime() >= windowStart(window));
  const totals = summarize(filtered);
  const buckets = new Map<string, { inflow: number; outflow: number }>();
  for (const item of filtered) {
    if (!item.timestamp || item.amount === null || item.status === "failed") continue;
    const time = item.timestamp.slice(0, 10);
    const bucket = buckets.get(time) || { inflow: 0, outflow: 0 };
    if (item.direction === "in") bucket.inflow += item.amount;
    if (item.direction === "out" || item.direction === "contract") bucket.outflow += item.amount;
    buckets.set(time, bucket);
  }
  return {
    window,
    totalInflow: filtered.length ? totals.inflow : null,
    totalOutflow: filtered.length ? totals.outflow : null,
    netFlow: filtered.length ? totals.netFlow : null,
    points: [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([time, values]) => ({
      time,
      inflow: values.inflow,
      outflow: values.outflow,
      netFlow: values.inflow - values.outflow,
    })),
    source: activity.source,
  };
}

export function parseNetwork(value: string | null): SmartMoneyNetwork | null {
  if (value === "ethereum" || value === "sepolia") return value;
  if (value) return null;
  return getNetworkFromChainId(1);
}

export async function getTrackedWallets(config: SmartMoneyWalletConfig[]): Promise<SmartMoneyWallet[]> {
  return Promise.all(config.map((wallet) => getSmartMoneyWallet(wallet.address, wallet.network, wallet.label)));
}

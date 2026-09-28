import { PublicClient, createPublicClient, http } from "viem";
import { getBalance, getTransactionCount } from "viem/actions";
import { mainnet, sepolia } from "viem/chains";

export type SupportedChain = typeof mainnet | typeof sepolia;

const publicClients: Record<number, PublicClient> = {
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  [sepolia.id]: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
};

export function getPublicClient(chainId: number): PublicClient | null {
  return publicClients[chainId] || null;
}

export interface WalletBalance {
  native: {
    address: string;
    balance: bigint;
    formattedBalance: string;
    decimals: number;
  };
}

export async function getNativeBalance(address: string, chainId: number): Promise<WalletBalance | null> {
  const client = getPublicClient(chainId);
  if (!client) return null;

  try {
    const balance = await getBalance(client, { address: address as `0x${string}` });
    return {
      native: {
        address,
        balance,
        formattedBalance: (Number(balance) / 1e18).toFixed(4),
        decimals: 18,
      },
    };
  } catch (error) {
    console.error("Error fetching native balance:", error);
    return null;
  }
}

export async function getWalletTransactionCount(address: string, chainId: number): Promise<number | null> {
  const client = getPublicClient(chainId);
  if (!client) return null;

  try {
    const count = await getTransactionCount(client, { address: address as `0x${string}` });
    return count;
  } catch (error) {
    console.error("Error fetching transaction count:", error);
    return null;
  }
}

export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: bigint;
  blockNumber: number;
  timestamp: number;
  gasUsed?: bigint;
  gasPrice?: bigint;
  type: "incoming" | "outgoing" | "contract";
}

export function classifyTransaction(
  from: string,
  to: string | null,
  walletAddress: string
): "incoming" | "outgoing" | "contract" {
  const fromLower = from?.toLowerCase() || "";
  const toLower = to?.toLowerCase() || "";
  const wallet = walletAddress.toLowerCase();

  if (fromLower === wallet) return "outgoing";
  if (toLower === wallet) return "incoming";
  return "contract";
}

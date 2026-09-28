export type SmartMoneyNetwork = "ethereum" | "sepolia";

export type SmartMoneyDirection = "in" | "out" | "self" | "contract" | "unknown";

export type SmartMoneyStatus = "success" | "failed" | "unknown";

export type SmartMoneySort = "activity" | "transactionCount" | "netFlow";

export type SmartMoneyWindow = "24H" | "7D" | "30D" | "90D";

export interface SmartMoneyWalletConfig {
  address: `0x${string}`;
  label: string;
  network: SmartMoneyNetwork;
}

export interface SmartMoneyWallet {
  address: string;
  label: string;
  network: SmartMoneyNetwork;
  balance: number | null;
  transactionCount: number | null;
  inflow: number | null;
  outflow: number | null;
  netFlow: number | null;
  firstActivity: string | null;
  lastActivity: string | null;
  source: string;
}

export interface SmartMoneyActivity {
  hash: string;
  timestamp: string | null;
  direction: SmartMoneyDirection;
  amount: number | null;
  from: string;
  to: string;
  blockNumber: number;
  status: SmartMoneyStatus;
}

export interface SmartMoneyFlowPoint {
  time: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

export interface SmartMoneyFlow {
  window: SmartMoneyWindow;
  totalInflow: number | null;
  totalOutflow: number | null;
  netFlow: number | null;
  points: SmartMoneyFlowPoint[];
  source: string;
}

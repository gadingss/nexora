import { WalletActivity } from "@/lib/types";

export const WALLET_ACTIVITY: WalletActivity[] = [
  {
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d89712",
    type: "BUY",
    token: "ETH",
    value: 42120,
    label: "2m ago",
  },
  {
    address: "0x821aEa9a521D373BC59613281e5c5421511Bf02a",
    type: "BUY",
    token: "AAVE",
    value: 18420,
    label: "8m ago",
  },
  {
    address: "0x442C236EC7ab88b098defB751B7401B5f6d8900C",
    type: "SELL",
    token: "UNI",
    value: 31200,
    label: "14m ago",
  },
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    type: "BUY",
    token: "SOL",
    value: 12400,
    label: "20m ago",
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    type: "SELL",
    token: "BTC",
    value: 98000,
    label: "25m ago",
  },
];

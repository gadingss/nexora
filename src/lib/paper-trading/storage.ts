import { PaperAccount } from "./types";

const STORAGE_KEY = "nexora_paper_trading_account";

export function getStoredAccount(): PaperAccount {
  try {
    if (typeof localStorage === "undefined") {
        return {
            balance: 10000,
            positions: [],
            trades: [],
            realizedPnl: 0,
        };
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load paper trading account", e);
  }
  return {
    balance: 10000,
    positions: [],
    trades: [],
    realizedPnl: 0,
  };
}

export function saveStoredAccount(account: PaperAccount) {
  try {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    }
  } catch (e) {
    console.error("Failed to save paper trading account", e);
  }
}

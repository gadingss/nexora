import { isAddress } from "viem";
import type { SmartMoneyNetwork, SmartMoneyWalletConfig } from "./types";

const networkByName: Record<SmartMoneyNetwork, number> = {
  ethereum: 1,
  sepolia: 11155111,
};

function parseConfiguredWallets(): SmartMoneyWalletConfig[] {
  const raw = process.env.SMART_MONEY_WALLETS;
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((wallet): wallet is SmartMoneyWalletConfig => {
      if (!wallet || typeof wallet !== "object") return false;
      const item = wallet as Partial<SmartMoneyWalletConfig>;
      return typeof item.address === "string" && isAddress(item.address) &&
        typeof item.label === "string" &&
        (item.network === "ethereum" || item.network === "sepolia");
    }).map((wallet) => ({
      address: wallet.address,
      label: wallet.label,
      network: wallet.network,
    }));
  } catch {
    return [];
  }
}

export const SMART_MONEY_WALLETS = parseConfiguredWallets();

export function getChainId(network: SmartMoneyNetwork): number {
  return networkByName[network];
}

export function getNetworkFromChainId(chainId: number): SmartMoneyNetwork | null {
  if (chainId === 1) return "ethereum";
  if (chainId === 11155111) return "sepolia";
  return null;
}

export function getExplorerUrl(network: SmartMoneyNetwork): string {
  return network === "sepolia" ? "https://sepolia.etherscan.io" : "https://etherscan.io";
}

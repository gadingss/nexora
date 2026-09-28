import { Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";

export const supportedChains: readonly [Chain, ...Chain[]] = [mainnet, sepolia];

export const defaultChain = mainnet;

export function getChainName(chainId: number | undefined): string {
  if (!chainId) return "Unknown";
  
  const chain = supportedChains.find((c) => c.id === chainId);
  return chain?.name || "Unknown";
}

export function isChainSupported(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return supportedChains.some((c) => c.id === chainId);
}

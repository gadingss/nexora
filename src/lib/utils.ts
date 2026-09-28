import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "—";
  }
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatAddress(address: string | undefined | null): string {
  if (!address || address === "0x") {
    return "0x...";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Deterministic number formatting without locale
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

// Deterministic relative time from a fixed base date (for mock data)
export function formatRelativeTime(timestamp: Date): string {
  // Use a fixed base date for consistency between server and client
  const base = new Date("2024-01-01T00:00:00Z");
  const diffMs = base.getTime() - timestamp.getTime();
  const diffMins = Math.floor(Math.abs(diffMs) / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
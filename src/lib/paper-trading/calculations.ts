import { PaperPosition, StoredPosition, PaperTrade } from "./types";

export function calculateAverageEntry(
  existingPosition: StoredPosition | PaperPosition | undefined,
  newQuantity: number,
  newPrice: number
): number {
  if (!existingPosition) return newPrice;
  
  const totalQuantity = existingPosition.quantity + newQuantity;
  const totalCost = (existingPosition.averageEntryPrice * existingPosition.quantity) + (newPrice * newQuantity);
  return totalCost / totalQuantity;
}

export function calculatePositionValue(quantity: number, currentPrice: number): number {
  return quantity * currentPrice;
}

export function calculateUnrealizedPnl(
  position: StoredPosition | PaperPosition,
  currentPrice: number
): number {
  return (currentPrice - position.averageEntryPrice) * position.quantity;
}

export function calculateRealizedPnl(sellPrice: number, averageEntryPrice: number, soldQuantity: number): number {
  return (sellPrice - averageEntryPrice) * soldQuantity;
}

export function calculateTotalEquity(
  balance: number,
  positions: (StoredPosition | PaperPosition)[],
  prices: Record<string, number>
): number {
  const marketValue = positions.reduce((sum, pos) => {
    const currentPrice = prices[pos.symbol] || 0;
    return sum + (currentPrice * pos.quantity);
  }, 0);
  return balance + marketValue;
}

export function calculateWinRate(trades: PaperTrade[]): {
  totalTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number | null;
} {
  const totalTrades = trades.length;
  const closedTradesList = trades.filter((t) => t.side === "SELL" && t.realizedPnl !== undefined);
  const closedTrades = closedTradesList.length;
  
  const winningTrades = closedTradesList.filter((t) => (t.realizedPnl || 0) > 0).length;
  const losingTrades = closedTradesList.filter((t) => (t.realizedPnl || 0) < 0).length;
  
  const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : null;

  return {
    totalTrades,
    closedTrades,
    winningTrades,
    losingTrades,
    winRate,
  };
}

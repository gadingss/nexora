import { NextResponse } from "next/server";
import { marketService } from "@/lib/api/market";
import { MARKET_ASSETS } from "@/lib/mock-data/markets";

export async function GET() {
  try {
    const symbols = ["BTC", "ETH", "SOL", "AAVE", "UNI"];
    const data = await marketService.fetchMarketData(symbols);
    const stats = await marketService.fetchMarketStats(data);

    return NextResponse.json({
      data,
      stats,
      source: "coingecko",
      updatedAt: new Date().toISOString(),
      isFallback: false,
    });
  } catch {
    return NextResponse.json({
      data: MARKET_ASSETS,
      stats: null,
      source: "fallback",
      updatedAt: new Date().toISOString(),
      isFallback: true,
    });
  }
}

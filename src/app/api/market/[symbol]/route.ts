import { NextRequest, NextResponse } from "next/server";
import { marketService } from "@/lib/api/market";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();
    const supportedSymbols = await marketService.fetchSupportedAssets();

    if (!supportedSymbols.includes(normalizedSymbol)) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    const asset = await marketService.fetchTokenDetail(normalizedSymbol);

    if (!asset) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: asset,
      source: "coingecko",
      updatedAt: new Date().toISOString(),
      isFallback: false,
    });
  } catch {
    const { MARKET_ASSETS } = await import("@/lib/mock-data/markets");
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();
    const fallback = MARKET_ASSETS.find((a) => a.symbol === normalizedSymbol);

    if (fallback) {
      return NextResponse.json({
        data: fallback,
        source: "fallback",
        updatedAt: new Date().toISOString(),
        isFallback: true,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 }
    );
  }
}

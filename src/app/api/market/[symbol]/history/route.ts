import { NextRequest, NextResponse } from "next/server";
import { marketService } from "@/lib/api/market";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "1", 10);

    const supportedSymbols = await marketService.fetchSupportedAssets();

    if (!supportedSymbols.includes(normalizedSymbol)) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    const history = await marketService.fetchMarketHistory(normalizedSymbol, days);

    return NextResponse.json({
      data: history,
      source: "coingecko",
      updatedAt: new Date().toISOString(),
      isFallback: false,
    });
  } catch {
    const { TOKEN_CHARTS } = await import("@/lib/mock-data/charts");
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();
    const fallback = TOKEN_CHARTS[normalizedSymbol] || TOKEN_CHARTS.BTC;

    return NextResponse.json({
      data: fallback,
      source: "fallback",
      updatedAt: new Date().toISOString(),
      isFallback: true,
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getSmartMoneyFlow, parseNetwork } from "@/lib/smart-money/service";
import type { SmartMoneyWindow } from "@/lib/smart-money/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(req.url);
    const network = parseNetwork(searchParams.get("network"));
    const window = (searchParams.get("window") || "24H") as SmartMoneyWindow;

    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "INVALID WALLET ADDRESS" },
        { status: 400 }
      );
    }

    if (!network) {
      return NextResponse.json(
        { error: "Invalid or missing network" },
        { status: 400 }
      );
    }

    if (!["24H", "7D", "30D", "90D"].includes(window)) {
      return NextResponse.json(
        { error: "Invalid window. Use 24H, 7D, 30D, or 90D" },
        { status: 400 }
      );
    }

    const flow = await getSmartMoneyFlow(address, network, window);

    return NextResponse.json({
      flow,
      source: flow.source,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "INVALID WALLET ADDRESS") {
      return NextResponse.json(
        { error: "INVALID WALLET ADDRESS" },
        { status: 400 }
      );
    }
    console.error("Smart money flow error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flow data" },
      { status: 500 }
    );
  }
}

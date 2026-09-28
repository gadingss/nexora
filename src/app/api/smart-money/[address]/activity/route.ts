import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getSmartMoneyActivity, parseNetwork } from "@/lib/smart-money/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(req.url);
    const network = parseNetwork(searchParams.get("network"));

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

    const { activities, source } = await getSmartMoneyActivity(address, network);

    return NextResponse.json({
      activities,
      count: activities.length,
      source,
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
    console.error("Smart money activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}

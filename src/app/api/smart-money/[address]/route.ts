import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getSmartMoneyWallet, parseNetwork } from "@/lib/smart-money/service";

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

    const wallet = await getSmartMoneyWallet(address, network);

    return NextResponse.json({
      wallet,
      source: wallet.source,
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
    console.error("Smart money wallet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}

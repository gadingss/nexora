import { NextResponse } from "next/server";
import { SMART_MONEY_WALLETS } from "@/lib/smart-money/config";
import { getSmartMoneyWallet } from "@/lib/smart-money/service";

export async function GET() {
  try {
    const wallets = await Promise.all(
      SMART_MONEY_WALLETS.map((w) => getSmartMoneyWallet(w.address, w.network, w.label))
    );

    return NextResponse.json({
      wallets,
      count: wallets.length,
      source: "etherscan+rpc",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Smart money list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch smart money data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getNativeBalance, getWalletTransactionCount } from "@/lib/web3/onchain";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const chainId = parseInt(searchParams.get("chainId") || "1", 10);

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const [balance, txCount] = await Promise.all([
      getNativeBalance(address, chainId),
      getWalletTransactionCount(address, chainId),
    ]);

    return NextResponse.json({
      balance: balance ? {
        ...balance,
        native: {
          ...balance.native,
          balance: balance.native.balance.toString(),
        },
      } : null,
      transactionCount: txCount,
      source: "rpc",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("On-chain data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch on-chain data" },
      { status: 500 }
    );
  }
}

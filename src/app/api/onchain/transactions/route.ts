import { NextRequest, NextResponse } from "next/server";
import { getPublicClient } from "@/lib/web3/onchain";
import { zeroAddress } from "viem";

const ETHERSCAN_API_BASE = "https://api.etherscan.io/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const chainId = parseInt(searchParams.get("chainId") || "1", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const offset = parseInt(searchParams.get("offset") || "20", 10);

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const client = getPublicClient(chainId);
    if (!client) {
      return NextResponse.json({ error: "Unsupported network" }, { status: 400 });
    }

    const apiKey = process.env.ETHERSCAN_API_KEY;

    if (apiKey) {
      try {
        const esModule = "account";
        const esAction = "txlist";
        const url = `${ETHERSCAN_API_BASE}?module=${esModule}&action=${esAction}&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=desc&apikey=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Etherscan API error");

        const data = await response.json();
        if (data.status === "1" && data.result) {
          return NextResponse.json({
            transactions: data.result,
            totalPages: 10,
            source: "etherscan",
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Etherscan API failed, using RPC fallback:", err);
      }
    }

    const latestBlock = await client.getBlock();
    const currentBlock = latestBlock?.number || BigInt(0);

    const recentTransactions: Array<{ hash: string; from: string; to: string; value: string; blockNumber: number; timestamp: number; type: string }> = [];

    for (let i = 0; i < 10; i++) {
      const blockNum = Number(currentBlock - BigInt(i));
      if (blockNum < 0) break;

      try {
        const block = await client.getBlock({ blockNumber: BigInt(blockNum), includeTransactions: true });
        if (block?.transactions) {
          for (const tx of block.transactions) {
            const rawTx = tx as { hash: string; from: string; to: string | null; value: bigint; blockNumber: bigint | null };
            if (rawTx.from.toLowerCase() === address.toLowerCase() || 
                (rawTx.to && rawTx.to.toLowerCase() === address.toLowerCase())) {
              recentTransactions.push({
                hash: rawTx.hash,
                from: rawTx.from,
                to: rawTx.to || (zeroAddress as string),
                value: rawTx.value.toString(),
                blockNumber: Number(rawTx.blockNumber || 0),
                timestamp: Number(block.timestamp || 0),
                type: "unknown",
              });
            }
          }
        }
      } catch {
        // skip block
      }

      if (recentTransactions.length >= offset) break;
    }

    return NextResponse.json({
      transactions: recentTransactions,
      totalPages: 1,
      source: "rpc-fallback",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    return NextResponse.json({ error: "Failed to fetch transaction history" }, { status: 500 });
  }
}

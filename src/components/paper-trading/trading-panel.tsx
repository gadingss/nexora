"use client";

import { useState } from "react";
import { MarketAsset } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { StoredPosition } from "@/lib/paper-trading/types";

interface Props {
  assets: MarketAsset[];
  balance: number;
  positions: StoredPosition[];
  loading?: boolean;
  onExecuteTrade: (
    symbol: string,
    side: "BUY" | "SELL",
    quantity: number,
    price: number
  ) => { success: boolean; message: string };
}

export function TradingPanel({ assets, balance, positions, loading = false, onExecuteTrade }: Props) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantityStr, setQuantityStr] = useState<string>("");
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];
  const price = selectedAsset?.price || 0;
  const quantity = parseFloat(quantityStr) || 0;
  const totalValue = quantity * price;

  const currentPosition = positions.find((p) => p.symbol === selectedSymbol);
  const ownedQuantity = currentPosition ? currentPosition.quantity : 0;

  if (loading) {
    return (
      <div className="bg-[#121212] border border-[#1f1f1f] p-6 rounded mb-6 text-center">
        <p className="text-zinc-500 text-xs font-mono">LOADING MARKET PRICES...</p>
      </div>
    );
  }

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || price <= 0) {
      setFeedback({ message: "INVALID MARKET PRICE", isError: true });
      return;
    }

    if (quantity <= 0) {
      setFeedback({ message: "INVALID QUANTITY", isError: true });
      return;
    }

    if (side === "BUY" && totalValue > balance) {
      setFeedback({ message: "INSUFFICIENT BALANCE", isError: true });
      return;
    }

    if (side === "SELL" && quantity > ownedQuantity) {
      setFeedback({ message: "INSUFFICIENT POSITION", isError: true });
      return;
    }

    const res = onExecuteTrade(selectedSymbol, side, quantity, price);
    setFeedback({ message: res.message, isError: !res.success });
    if (res.success) {
      setQuantityStr("");
    }
  };

  return (
    <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded mb-6">
      <h3 className="text-sm font-semibold mb-4 text-white">TRADING PANEL</h3>
      
      {feedback && (
        <div
          className={`p-3 mb-4 rounded text-xs font-mono uppercase ${
            feedback.isError
              ? "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-green-500/10 border border-green-500/30 text-green-400"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleExecute} className="space-y-4">
        {/* Asset Selection */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1">ASSET</label>
          <select
            value={selectedSymbol}
            onChange={(e) => {
              setSelectedSymbol(e.target.value);
              setFeedback(null);
            }}
            aria-label="Select Asset"
            className="w-full bg-[#181818] border border-[#2b2b2b] text-white rounded p-2 text-sm focus:outline-none focus:border-zinc-500"
          >
            {assets.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol} - {asset.name} ({formatCurrency(asset.price)})
              </option>
            ))}
          </select>
        </div>

        {/* Side Tabs */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1">SIDE</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSide("BUY");
                setFeedback(null);
              }}
              className={`p-2 rounded text-xs font-bold font-mono transition-colors ${
                side === "BUY"
                  ? "bg-green-600 text-white"
                  : "bg-[#181818] text-zinc-400 border border-[#2b2b2b] hover:text-white"
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => {
                setSide("SELL");
                setFeedback(null);
              }}
              className={`p-2 rounded text-xs font-bold font-mono transition-colors ${
                side === "SELL"
                  ? "bg-red-600 text-white"
                  : "bg-[#181818] text-zinc-400 border border-[#2b2b2b] hover:text-white"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-zinc-500">QUANTITY</label>
            {side === "SELL" && (
              <span className="text-xs text-zinc-500">
                Owned: <span className="font-mono text-white">{ownedQuantity}</span>
              </span>
            )}
            {side === "BUY" && (
              <span className="text-xs text-zinc-500">
                Balance: <span className="font-mono text-white">{formatCurrency(balance)}</span>
              </span>
            )}
          </div>
          <input
            type="number"
            step="any"
            value={quantityStr}
            onChange={(e) => {
              setQuantityStr(e.target.value);
              setFeedback(null);
            }}
            placeholder="0.00"
            aria-label="Quantity"
            className="w-full bg-[#181818] border border-[#2b2b2b] text-white rounded p-2 text-sm font-mono focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Estimation info */}
        <div className="bg-[#181818] p-3 rounded space-y-1 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Estimated Price:</span>
            <span className="font-mono text-white">{formatCurrency(price)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Estimated Value:</span>
            <span className="font-mono text-white">{formatCurrency(totalValue)}</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={price <= 0}
          className={`w-full p-2.5 rounded font-bold font-mono text-xs uppercase tracking-wider transition-colors ${
            side === "BUY"
              ? "bg-green-600 hover:bg-green-500 text-white"
              : "bg-red-600 hover:bg-red-500 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          EXECUTE {side} {selectedSymbol}
        </button>
      </form>
    </div>
  );
}

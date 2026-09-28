"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { getChainName, isChainSupported } from "@/lib/web3/chains";
import { Wallet, LogOut, Check, Copy, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSupported = isChainSupported(chainId);

  if (!mounted) {
    return <div className="h-9 w-20 rounded-full bg-white animate-pulse" />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {isConnected && address ? (
        <button
          onClick={() => setOpen(!open)}
          className="h-9 px-3 rounded-full bg-zinc-900 border border-zinc-700 text-white text-xs font-mono flex items-center gap-2 hover:border-zinc-500 transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${isSupported ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span>{formatAddress(address)}</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="h-9 px-4 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Connect</span>
        </button>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-[#121212] border border-[#1f1f1f] rounded-lg shadow-xl p-4 z-50 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              {isConnected ? "Wallet Identity" : "Connect Wallet"}
            </span>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white text-xs">
              ✕
            </button>
          </div>

          {isConnected && address ? (
            <div className="space-y-3">
              <div className="bg-[#0c0c0c] p-3 rounded border border-[#1f1f1f] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Address</p>
                  <p className="text-xs font-mono text-white mt-0.5">{formatAddress(address)}</p>
                </div>
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-[#0c0c0c] p-3 rounded border border-[#1f1f1f] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Network</p>
                  <p className={`text-xs font-mono mt-0.5 flex items-center gap-1.5 ${isSupported ? "text-emerald-400" : "text-rose-400"}`}>
                    {!isSupported && <AlertTriangle className="w-3.5 h-3.5" />}
                    {getChainName(chainId)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="w-full h-9 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector });
                  }}
                  className="w-full h-10 px-4 rounded bg-zinc-900 border border-zinc-800 text-white text-xs font-medium hover:border-zinc-700 hover:bg-zinc-800 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    {connector.name || "Injected Wallet"}
                  </span>
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />}
                </button>
              ))}
              {connectors.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-2">No wallet connectors found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

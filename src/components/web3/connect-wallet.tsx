"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { getChainName, isChainSupported } from "@/lib/web3/chains";
import { Wallet, LogOut, CheckCircle, AlertCircle, Copy, Loader2 } from "lucide-react";
import { useState } from "react";

export function ConnectWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && address) {
    const isSupported = isChainSupported(chainId);
    return (
      <div className="flex flex-col gap-2 p-2 bg-[#121212] border border-[#1f1f1f] rounded">
        <div className="flex items-center justify-between text-xs px-2 py-1">
          <span className="font-mono text-zinc-400">STATUS</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle className="w-3 h-3" /> CONNECTED
          </span>
        </div>
        
        <div className="flex items-center justify-between bg-[#0c0c0c] p-2 rounded border border-[#1f1f1f]">
          <span className="font-mono text-white text-xs">{formatAddress(address)}</span>
          <button onClick={copyAddress} className="text-zinc-500 hover:text-white">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs px-2 py-1">
          <span className="font-mono text-zinc-400">NETWORK</span>
          <div className="flex items-center gap-1.5">
            {!isSupported && <AlertCircle className="w-3 h-3 text-rose-500" />}
            <span className={isSupported ? "text-zinc-200" : "text-rose-500"}>
              {getChainName(chainId)}
            </span>
          </div>
        </div>

        <button
          onClick={() => disconnect()}
          className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded transition-colors"
        >
          <LogOut className="w-3 h-3" /> DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          disabled={isPending}
          onClick={() => connect({ connector })}
          className="h-9 px-4 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wallet className="w-3.5 h-3.5" />}
          {isPending ? "CONNECTING..." : "CONNECT WALLET"}
        </button>
      ))}
    </div>
  );
}

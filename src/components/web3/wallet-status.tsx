"use client";

import { useAccount } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { getChainName, isChainSupported } from "@/lib/web3/chains";
import { useEffect, useState } from "react";

export function WalletStatus() {
  const { address, isConnected, chainId } = useAccount();
  const [mounted, setMounted] = useState(false);
  const isSupported = isChainSupported(chainId);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-3 animate-pulse">
        <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
          Wallet
        </span>
        <div className="h-4 bg-zinc-800 rounded w-32" />
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded p-4 space-y-3">
      <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
        Wallet
      </span>
      {isConnected && address ? (
        <div className="space-y-2">
          <p className="text-sm font-mono text-white">{formatAddress(address)}</p>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase">Network</span>
            <span className={isSupported ? "text-emerald-400" : "text-rose-400"}>
              {getChainName(chainId)}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">Disconnected</p>
      )}
    </div>
  );
}

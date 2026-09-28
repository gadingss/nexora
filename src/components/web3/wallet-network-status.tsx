"use client";

import { useAccount } from "wagmi";
import { getChainName, isChainSupported } from "@/lib/web3/chains";
import { useEffect, useState } from "react";

export function WalletNetworkStatus() {
  const { chainId, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>NETWORK</span>
        <span className="flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          SYNCING...
        </span>
      </div>
    );
  }

  const supported = isChainSupported(chainId);
  const currentChain = getChainName(chainId);

  return (
    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
      <span>NETWORK</span>
      <span className="flex items-center gap-1.5">
        {isConnected ? (
          <>
            <span className={`w-1.5 h-1.5 rounded-full ${supported ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span className={supported ? "text-emerald-400" : "text-rose-400"}>
              {currentChain}
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span className="text-zinc-500">NOT CONNECTED</span>
          </>
        )}
      </span>
    </div>
  );
}

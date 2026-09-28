"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Terminal } from "lucide-react";
import { WalletButton } from "@/components/web3/wallet-button";

export function AppNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <header className="h-14 bg-[#0c0c0c] border-b border-[#1f1f1f] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded hover:bg-zinc-900 text-zinc-400"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/dashboard" className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-wider text-white">NEXORA</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end max-w-xl ml-4">
          <div className="relative flex-1 max-w-sm hidden sm:flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              placeholder="Search tokens, wallets..."
              className="w-full h-9 pl-9 pr-4 bg-zinc-900 border border-zinc-800 rounded text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
          </div>
          <WalletButton />
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full bg-[#0c0c0c] border-r border-[#1f1f1f] flex flex-col">
            <div className="p-6 border-b border-[#1f1f1f] flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-bold tracking-wider text-sm text-white">NEXORA</h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest">TERMINAL V0.1</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <nav className="space-y-1">
                {[
                  { name: "Overview", href: "/dashboard" },
                  { name: "Markets", href: "/markets" },
                  { name: "Smart Money", href: "/smart-money" },
                  { name: "Portfolio", href: "/portfolio" },
                  { name: "Wallet Explorer", href: "/wallet-explorer" },
                  { name: "Paper Trading", href: "/paper-trading" },
                  { name: "Risk Terminal", href: "/risk-terminal" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded text-sm text-zinc-400 hover:text-white hover:bg-zinc-900"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

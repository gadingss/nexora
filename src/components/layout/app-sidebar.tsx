"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  SearchCode, 
  BarChart3, 
  ShieldAlert, 
  Terminal 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Markets", href: "/markets", icon: TrendingUp },
  { name: "Smart Money", href: "/smart-money", icon: Wallet },
  { name: "Portfolio", href: "/portfolio", icon: PieChart },
];

const tools = [
  { name: "Wallet Explorer", href: "/wallet-explorer", icon: SearchCode },
  { name: "Paper Trading", href: "/paper-trading", icon: BarChart3 },
  { name: "Risk Terminal", href: "/risk-terminal", icon: ShieldAlert },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0c0c0c] border-r border-[#1f1f1f] flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
      <div className="p-6 border-b border-[#1f1f1f] flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Terminal className="w-4 h-4" />
        </div>
        <div>
          <h1 className="font-bold tracking-wider text-sm text-white">NEXORA</h1>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest">TERMINAL V0.1</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        <div>
          <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
            Overview
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors",
                    isActive
                      ? "bg-zinc-800 text-white border-l-2 border-emerald-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-zinc-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
            Tools
          </p>
          <nav className="space-y-1">
            {tools.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors",
                    isActive
                      ? "bg-zinc-800 text-white border-l-2 border-emerald-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-zinc-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>NETWORK</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MAINNET
          </span>
        </div>
      </div>
    </aside>
  );
}

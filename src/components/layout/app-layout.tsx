"use client";

import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./app-navbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] min-h-screen flex flex-col">
      <AppNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}

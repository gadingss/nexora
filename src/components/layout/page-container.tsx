import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ title, subtitle, children, className }: PageContainerProps) {
  return (
    <div className={cn("p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full", className)}>
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}

interface DataSourceIndicatorProps {
  source?: string;
  updatedAt?: string;
  isFallback?: boolean;
}

export function DataSourceIndicator({
  source = "CoinGecko",
  updatedAt,
  isFallback = false,
}: DataSourceIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 bg-[#0c0c0c] border border-[#1f1f1f] px-3 py-1.5 rounded self-start">
      <span className={`w-2 h-2 rounded-full ${isFallback ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
      <span>
        {isFallback ? "FALLBACK DATA" : `MARKET DATA — Source: ${source}`}
      </span>
      {updatedAt && (
        <>
          <span className="text-zinc-700">•</span>
          <span>{updatedAt}</span>
        </>
      )}
    </div>
  );
}

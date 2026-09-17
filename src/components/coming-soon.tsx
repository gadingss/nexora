export function ComingSoon({ title = "Coming Soon" }: { title?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-zinc-500 text-sm">
          This module is part of the NEXORA roadmap and will be available soon.
        </p>
      </div>
    </div>
  );
}

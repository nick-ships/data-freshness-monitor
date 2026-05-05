import type { SourceResult } from "@/lib/fetch-source";

export const SummaryBar = ({ results }: { results: SourceResult[] }) => {
  const counts = {
    fresh: 0,
    aging: 0,
    stale: 0,
    unknown: 0,
  };
  for (const r of results) counts[r.status]++;

  const items: Array<{
    label: string;
    count: number;
    dot: string;
  }> = [
    { label: "Fresh", count: counts.fresh, dot: "bg-emerald-600" },
    { label: "Aging", count: counts.aging, dot: "bg-amber-500" },
    { label: "Stale", count: counts.stale, dot: "bg-[#C8401A]" },
    { label: "Unknown", count: counts.unknown, dot: "bg-stone-400" },
  ];

  return (
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-y border-[#1A1814]/10 py-5">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline gap-2">
          <span className={`h-2 w-2 translate-y-[-2px] rounded-full ${it.dot}`} />
          <span className="font-serif text-3xl text-[#1A1814]">{it.count}</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#1A1814]/55">
            {it.label}
          </span>
        </div>
      ))}
      <div className="ml-auto text-[10px] font-medium uppercase tracking-[0.18em] text-[#1A1814]/55">
        {results.length} source{results.length === 1 ? "" : "s"} monitored
      </div>
    </div>
  );
};

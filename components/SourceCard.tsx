import type { SourceResult } from "@/lib/fetch-source";
import {
  formatAbsolute,
  formatOverdue,
  formatRelative,
} from "@/lib/fetch-source";

const statusStyles: Record<
  SourceResult["status"],
  { dot: string; label: string; text: string }
> = {
  fresh: { dot: "bg-emerald-600", label: "Fresh", text: "text-emerald-700" },
  aging: { dot: "bg-amber-500", label: "Aging", text: "text-amber-700" },
  stale: { dot: "bg-[#C8401A]", label: "Stale", text: "text-[#C8401A]" },
  unknown: { dot: "bg-stone-400", label: "Unknown", text: "text-stone-500" },
};

export const SourceCard = ({ result }: { result: SourceResult }) => {
  const { source, lastUpdated, status, cadence, overdueDays, error } = result;
  const style = statusStyles[status];
  const overdueLabel = formatOverdue(overdueDays);

  return (
    <article className="group flex flex-col gap-5 rounded-sm border border-[#1A1814]/10 bg-white/60 p-6 transition-colors hover:border-[#1A1814]/25">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#1A1814]/55">
          {source.name}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] ${style.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      <h3 className="font-serif text-2xl leading-tight text-[#1A1814]">
        {source.dataset}
      </h3>

      <div className="flex-1" />

      <div className="space-y-1">
        <div className="text-base text-[#1A1814]">
          {formatRelative(lastUpdated)}
        </div>
        <div className="text-xs text-[#1A1814]/55">
          {lastUpdated
            ? `Last updated ${formatAbsolute(lastUpdated)}`
            : error || "No data available"}
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-[#1A1814]/10 pt-4 text-xs">
        <dt className="text-[#1A1814]/55">Expected</dt>
        <dd className="text-right text-[#1A1814]">
          {cadence ? (
            <span title={cadence.source === "fallback" ? "Cadence not declared in API — inferred from public schedule" : "Declared in source metadata"}>
              {cadence.label}
              {cadence.source === "fallback" ? "*" : ""}
            </span>
          ) : (
            <span className="text-[#1A1814]/40">not declared</span>
          )}
        </dd>
        <dt className="text-[#1A1814]/55">Actual</dt>
        <dd
          className={`text-right ${overdueLabel ? "text-[#C8401A]" : "text-[#1A1814]"}`}
        >
          {overdueLabel
            ? overdueLabel
            : lastUpdated && cadence?.expectedDays != null
            ? "On schedule"
            : "—"}
        </dd>
      </dl>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[#1A1814]/55">{source.category}</span>
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#C8401A] underline-offset-4 hover:underline"
        >
          View source →
        </a>
      </div>
    </article>
  );
};

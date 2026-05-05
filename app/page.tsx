import { SourceCard } from "@/components/SourceCard";
import { SummaryBar } from "@/components/SummaryBar";
import { fetchAllSources } from "@/lib/fetch-source";
import { sources } from "@/lib/sources";

export const revalidate = 300;

export default async function Home() {
  const results = await fetchAllSources(sources);

  const statusOrder = { stale: 0, aging: 1, fresh: 2, unknown: 3 };
  const sorted = [...results].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div className="flex-1 bg-[#F7F4EF] text-[#1A1814]">
      <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
        <header className="mb-12 max-w-3xl">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#C8401A]">
            Australian Government Open Data
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Data Freshness Monitor
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#1A1814]/70">
            A live look at when key Australian government datasets were last
            updated. Built to keep civic data products honest about the age of
            the layers underneath them.
          </p>
        </header>

        <SummaryBar results={results} />

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((r) => (
            <SourceCard key={r.source.id} result={r} />
          ))}
        </section>

        <footer className="mt-20 flex flex-col gap-2 border-t border-[#1A1814]/10 pt-6 text-xs text-[#1A1814]/55 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Built by Nick Tierney with Claude Code ·{" "}
            <a
              href="https://github.com/nick-ships/data-freshness-monitor"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:text-[#C8401A] hover:underline"
            >
              GitHub
            </a>
          </div>
          <div>
            Data fetched live · cached 5 min · Page rendered{" "}
            {new Date().toLocaleString("en-AU", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </footer>
      </main>
    </div>
  );
}

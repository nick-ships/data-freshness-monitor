# Data Freshness Monitor

A single-page dashboard that monitors how recently key Australian government open-data sources were last updated. Each source is a card with the dataset name, a human-readable "X days ago" timestamp, a fresh/aging/stale status indicator, and a link back to the official portal.

## Why I built it

I'm building a civic-data product called **StreetLens** that layers government datasets (addresses, crime, planning, weather) on top of one another. The whole platform is only as trustworthy as the freshness of those layers — and there's no single dashboard that tells you, at a glance, which government datasets are current and which are months stale.

So I built one. I now use it as a pre-flight check before relying on any layer in StreetLens.

## Live demo

[Deployed on Vercel](https://) — _link to be added after first deploy_.

## Tech stack

- **Next.js (App Router)** — server components fetch every source in parallel on each request
- **TypeScript**
- **Tailwind CSS** — editorial design with a single coral accent on a cream background
- **Vercel** — zero-config deployment, edge caching of the page (5 min revalidate)

No database. No auth. No client-side state. The page is a server component that calls `Promise.allSettled` over the configured CKAN endpoints, so a single broken source never crashes the dashboard — it just renders that card in an "unknown" state.

Built with **Claude Code** in approximately 4 hours.

## How it works

1. Sources are declared in [`lib/sources.ts`](lib/sources.ts) as a typed `DataSource[]`. Adding a new dataset is one config entry.
2. [`lib/fetch-source.ts`](lib/fetch-source.ts) fetches each source's metadata API (CKAN `package_show` for most), parses the last-modified timestamp, and bins the dataset into `fresh` (<30d), `aging` (30–90d), `stale` (90d+), or `unknown`.
3. [`app/page.tsx`](app/page.tsx) is a server component that calls `fetchAllSources()` and renders `<SourceCard>` for each result.

## Local dev

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sources currently monitored

- **data.gov.au** — G-NAF (Geocoded National Address File)
- **data.gov.au** — Measuring Broadband Australia
- **data.nsw.gov.au** — Air Quality Monitoring Data
- **discover.data.vic.gov.au** — Victoria Crime Statistics (Unique Victims)
- **data.qld.gov.au** — Queensland Traffic Census
- **Bureau of Meteorology** — Sydney Weather Observations

## Future scope

Things I'd add if this went past the portfolio stage:

- **Scheduled background checks** instead of fetching live on every page load (cron + KV cache)
- **Alerting** when a source crosses from fresh → aging → stale (email or webhook)
- **Historical freshness graphs** so you can see whether a dataset is in a healthy update cadence or quietly being abandoned
- **Custom dataset adding** via a form, persisted in a lightweight DB
- **Multi-state EPA water-quality monitoring** as a first dedicated vertical — right now StreetLens cares most about environment & infrastructure layers, and water quality is a natural extension

---

Built by **Nik Tierney** with [Claude Code](https://claude.com/claude-code).

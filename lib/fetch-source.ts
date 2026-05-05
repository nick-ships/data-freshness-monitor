import type { DataSource } from "./sources";

export type FreshnessStatus = "fresh" | "aging" | "stale" | "unknown";

export type Cadence = {
  label: string;
  expectedDays: number | null;
  source: "declared" | "fallback";
};

export type SourceResult = {
  source: DataSource;
  lastUpdated: Date | null;
  status: FreshnessStatus;
  cadence: Cadence | null;
  overdueDays: number | null;
  error?: string;
};

export const computeStatus = (lastUpdated: Date | null): FreshnessStatus => {
  if (!lastUpdated) return "unknown";
  const ageDays = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return "fresh";
  if (ageDays < 90) return "aging";
  return "stale";
};

const FREQUENCY_DAYS: Array<[RegExp, number, string]> = [
  [/real[\s-]?time|continuous|every\s*\d+\s*min|live/i, 1 / 24, "real-time"],
  [/hourly/i, 1 / 24, "hourly"],
  [/daily|every\s*day/i, 1, "daily"],
  [/weekly|fortnight/i, 7, "weekly"],
  [/biweekly|every\s*two\s*weeks/i, 14, "biweekly"],
  [/monthly/i, 30, "monthly"],
  [/quarter/i, 90, "quarterly"],
  [/bi[\s-]?annual|semi[\s-]?annual/i, 180, "biannual"],
  [/annual|year/i, 365, "annually"],
];

export const parseCadence = (
  declared: string | null,
  fallback: string | undefined
): Cadence | null => {
  const raw = declared || fallback;
  if (!raw) return null;
  const lower = raw.toLowerCase();
  for (const [re, days, canonical] of FREQUENCY_DAYS) {
    if (re.test(lower)) {
      return {
        label: canonical,
        expectedDays: days,
        source: declared ? "declared" : "fallback",
      };
    }
  }
  return {
    label: raw,
    expectedDays: null,
    source: declared ? "declared" : "fallback",
  };
};

export const computeOverdue = (
  lastUpdated: Date | null,
  cadence: Cadence | null
): number | null => {
  if (!lastUpdated || !cadence || cadence.expectedDays == null) return null;
  const ageDays = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(ageDays - cadence.expectedDays));
};

export const fetchSource = async (source: DataSource): Promise<SourceResult> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(source.apiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        source,
        lastUpdated: null,
        status: "unknown",
        cadence: parseCadence(null, source.fallbackFrequency),
        overdueDays: null,
        error: `HTTP ${res.status}`,
      };
    }

    const json = await res.json();
    const parsed = source.parseSource(json);
    const cadence = parseCadence(parsed.declaredFrequency, source.fallbackFrequency);
    const overdueDays = computeOverdue(parsed.lastUpdated, cadence);
    return {
      source,
      lastUpdated: parsed.lastUpdated,
      status: computeStatus(parsed.lastUpdated),
      cadence,
      overdueDays,
      error: parsed.lastUpdated ? undefined : "Could not parse last-updated date",
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Request timed out"
          : err.message
        : "Unknown error";
    return {
      source,
      lastUpdated: null,
      status: "unknown",
      cadence: parseCadence(null, source.fallbackFrequency),
      overdueDays: null,
      error: message,
    };
  }
};

export const fetchAllSources = async (
  sources: DataSource[]
): Promise<SourceResult[]> => {
  const settled = await Promise.allSettled(sources.map(fetchSource));
  return settled.map((s, i) => {
    if (s.status === "fulfilled") return s.value;
    return {
      source: sources[i],
      lastUpdated: null,
      status: "unknown" as const,
      cadence: parseCadence(null, sources[i].fallbackFrequency),
      overdueDays: null,
      error: s.reason instanceof Error ? s.reason.message : "Unknown error",
    };
  });
};

export const formatRelative = (d: Date | null): string => {
  if (!d) return "—";
  const ms = Date.now() - d.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor(ms / (1000 * 60));
  if (days > 365) {
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }
  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes >= 1) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  return "just now";
};

export const formatAbsolute = (d: Date | null): string => {
  if (!d) return "Unknown";
  return d.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatOverdue = (overdueDays: number | null): string | null => {
  if (overdueDays == null || overdueDays === 0) return null;
  if (overdueDays >= 365) {
    const years = Math.floor(overdueDays / 365);
    return `${years} year${years === 1 ? "" : "s"} overdue`;
  }
  if (overdueDays >= 30) {
    const months = Math.floor(overdueDays / 30);
    return `${months} month${months === 1 ? "" : "s"} overdue`;
  }
  return `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`;
};

import type { DataSource } from "./sources";

export type FreshnessStatus = "fresh" | "aging" | "stale" | "unknown";

export type SourceResult = {
  source: DataSource;
  lastUpdated: Date | null;
  status: FreshnessStatus;
  error?: string;
};

export const computeStatus = (lastUpdated: Date | null): FreshnessStatus => {
  if (!lastUpdated) return "unknown";
  const ageDays = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return "fresh";
  if (ageDays < 90) return "aging";
  return "stale";
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
        error: `HTTP ${res.status}`,
      };
    }

    const json = await res.json();
    const lastUpdated = source.parseLastUpdated(json);
    return {
      source,
      lastUpdated,
      status: computeStatus(lastUpdated),
      error: lastUpdated ? undefined : "Could not parse last-updated date",
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Request timed out"
          : err.message
        : "Unknown error";
    return { source, lastUpdated: null, status: "unknown", error: message };
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

export type ParsedSource = {
  lastUpdated: Date | null;
  declaredFrequency: string | null;
};

export type DataSource = {
  id: string;
  name: string;
  dataset: string;
  category: string;
  apiUrl: string;
  sourceUrl: string;
  parseSource: (response: unknown) => ParsedSource;
  fallbackFrequency?: string;
};

const parseCkanPackageShow = (response: unknown): ParsedSource => {
  const empty: ParsedSource = { lastUpdated: null, declaredFrequency: null };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  if (r.success !== true) return empty;
  const result = r.result as Record<string, unknown> | undefined;
  if (!result) return empty;

  const candidates = [
    result.data_last_updated,
    result.metadata_modified,
    result.last_modified,
    result.modified,
  ];

  let latest: Date | null = null;
  for (const c of candidates) {
    if (typeof c === "string") {
      const d = new Date(c);
      if (!isNaN(d.getTime()) && (!latest || d > latest)) latest = d;
    }
  }

  const resources = result.resources as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(resources)) {
    for (const res of resources) {
      const fields = [res.last_modified, res.metadata_modified, res.created];
      for (const f of fields) {
        if (typeof f === "string") {
          const d = new Date(f);
          if (!isNaN(d.getTime()) && (!latest || d > latest)) latest = d;
        }
      }
    }
  }

  let declaredFrequency: string | null = null;
  for (const k of [
    "update_frequency",
    "accrual_periodicity",
    "frequency",
    "update_freq",
  ]) {
    const v = result[k];
    if (typeof v === "string" && v.trim()) {
      declaredFrequency = v.trim();
      break;
    }
  }
  if (!declaredFrequency) {
    const extras = result.extras as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(extras)) {
      for (const e of extras) {
        const key = String(e.key || "").toLowerCase();
        const value = e.value;
        if (
          typeof value === "string" &&
          value.trim() &&
          (key.includes("freq") || key.includes("period"))
        ) {
          declaredFrequency = value.trim();
          break;
        }
      }
    }
  }

  return { lastUpdated: latest, declaredFrequency };
};

export const sources: DataSource[] = [
  {
    id: "data-gov-au-gnaf",
    name: "data.gov.au",
    dataset: "G-NAF (Geocoded National Address File)",
    category: "Addresses",
    apiUrl:
      "https://data.gov.au/data/api/3/action/package_show?id=geocoded-national-address-file-g-naf",
    sourceUrl:
      "https://data.gov.au/data/dataset/geocoded-national-address-file-g-naf",
    parseSource: parseCkanPackageShow,
    fallbackFrequency: "quarterly",
  },
  {
    id: "data-nsw-air-quality",
    name: "data.nsw.gov.au",
    dataset: "Air Quality Monitoring Data",
    category: "Environment",
    apiUrl:
      "https://data.nsw.gov.au/data/api/3/action/package_show?id=2-air-quality-data",
    sourceUrl: "https://data.nsw.gov.au/data/dataset/2-air-quality-data",
    parseSource: parseCkanPackageShow,
  },
  {
    id: "data-vic-crime",
    name: "discover.data.vic.gov.au",
    dataset: "Victoria Crime Statistics — Victims",
    category: "Crime",
    apiUrl:
      "https://discover.data.vic.gov.au/api/3/action/package_show?id=crime-statistics-agency-data-tables-unique-victims",
    sourceUrl:
      "https://discover.data.vic.gov.au/dataset/crime-statistics-agency-data-tables-unique-victims",
    parseSource: parseCkanPackageShow,
  },
  {
    id: "data-qld-traffic",
    name: "data.qld.gov.au",
    dataset: "Queensland Traffic Census",
    category: "Transport",
    apiUrl:
      "https://www.data.qld.gov.au/api/3/action/package_show?id=traffic-census-for-the-queensland-state-declared-road-network",
    sourceUrl:
      "https://www.data.qld.gov.au/dataset/traffic-census-for-the-queensland-state-declared-road-network",
    parseSource: parseCkanPackageShow,
  },
  {
    id: "bom-sydney-obs",
    name: "Bureau of Meteorology",
    dataset: "Sydney Weather Observations",
    category: "Weather",
    apiUrl: "https://reg.bom.gov.au/fwo/IDN60901/IDN60901.94768.json",
    sourceUrl: "http://www.bom.gov.au/products/IDN60901/IDN60901.94768.shtml",
    fallbackFrequency: "every 30 minutes",
    parseSource: (response: unknown): ParsedSource => {
      const empty: ParsedSource = { lastUpdated: null, declaredFrequency: null };
      if (!response || typeof response !== "object") return empty;
      const r = response as Record<string, unknown>;
      const observations = r.observations as Record<string, unknown> | undefined;
      if (!observations) return empty;
      const data = observations.data as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(data) || data.length === 0) return empty;
      const first = data[0];
      const utc = first.aifstime_utc;
      if (typeof utc !== "string") return empty;
      const isoLike = `${utc.slice(0, 4)}-${utc.slice(4, 6)}-${utc.slice(6, 8)}T${utc.slice(8, 10)}:${utc.slice(10, 12)}:${utc.slice(12, 14)}Z`;
      const d = new Date(isoLike);
      return {
        lastUpdated: isNaN(d.getTime()) ? null : d,
        declaredFrequency: null,
      };
    },
  },
  {
    id: "data-gov-au-broadband",
    name: "data.gov.au",
    dataset: "Measuring Broadband Australia",
    category: "Telecommunications",
    apiUrl:
      "https://data.gov.au/data/api/3/action/package_show?id=measuring-broadband-australia-report-26-dataset-release",
    sourceUrl:
      "https://data.gov.au/data/dataset/measuring-broadband-australia-report-26-dataset-release",
    parseSource: parseCkanPackageShow,
  },
];

import type { SourceResult } from "@/lib/fetch-source";

const formatAvgAge = (days: number): string => {
  if (days >= 365) {
    const years = days / 365;
    return `${years.toFixed(1)} year${years >= 1.5 ? "s" : ""}`;
  }
  if (days >= 30) {
    const months = Math.round(days / 30);
    return `${months} month${months === 1 ? "" : "s"}`;
  }
  return `${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`;
};

export const AggregateInsight = ({ results }: { results: SourceResult[] }) => {
  const withDates = results.filter((r) => r.lastUpdated);
  const total = results.length;
  const stale = results.filter((r) => r.status === "stale").length;
  const overdue = results.filter(
    (r) => r.overdueDays != null && r.overdueDays > 0
  ).length;
  const withCadence = results.filter(
    (r) => r.cadence && r.cadence.expectedDays != null
  ).length;

  const avgAgeDays =
    withDates.length > 0
      ? withDates.reduce(
          (acc, r) =>
            acc + (Date.now() - r.lastUpdated!.getTime()) / (1000 * 60 * 60 * 24),
          0
        ) / withDates.length
      : null;

  const sentences: string[] = [];

  if (overdue > 0 && withCadence > 0) {
    sentences.push(
      `${overdue} of ${withCadence} dataset${withCadence === 1 ? "" : "s"} with a declared cadence ${overdue === 1 ? "is" : "are"} past due.`
    );
  } else if (stale > 0) {
    sentences.push(
      `${stale} of ${total} sources have not updated in over 90 days.`
    );
  }

  if (avgAgeDays != null) {
    sentences.push(`Average dataset age: ${formatAvgAge(avgAgeDays)}.`);
  }

  if (sentences.length === 0) return null;

  return (
    <p className="mb-2 max-w-3xl font-serif text-xl italic leading-snug text-[#1A1814]/80">
      {sentences.join(" ")}
    </p>
  );
};

// frontend/components/control/AnalyticsPanel.tsx
"use client";

import { CaseFile } from "@/lib/cases";

interface Props {
  cases: CaseFile[];
}

function calculateAnalytics(cases: CaseFile[]) {
  const now = new Date();

  const solved = cases.filter((c) => c.status === "solved");
  let avgSolveHours = 0;
  if (solved.length) {
    const totalMs = solved.reduce((sum, c) => {
      const open = new Date(c.reportedAt).getTime();
      const solvedAt = new Date(c.lastUpdatedAt).getTime();
      return sum + (solvedAt - open);
    }, 0);
    avgSolveHours = totalMs / solved.length / (1000 * 60 * 60);
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const openedLast7 = cases.filter(
    (c) => new Date(c.reportedAt) >= sevenDaysAgo
  ).length;

  const solvedLast7 = cases.filter(
    (c) =>
      c.status === "solved" &&
      new Date(c.lastUpdatedAt) >= sevenDaysAgo
  ).length;

  const counts: Record<string, number> = {};
  for (const c of cases) {
    counts[c.area] = (counts[c.area] ?? 0) + 1;
  }
  const topAreas = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area, count]) => ({ area, count }));

  return { avgSolveHours, openedLast7, solvedLast7, topAreas };
}

export function AnalyticsPanel({ cases }: Props) {
  const analytics = calculateAnalytics(cases);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
      <h2 className="text-sm font-semibold">Intelligence & Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] text-slate-400">Avg. time to solve</p>
          <p className="text-xl font-semibold">
            {analytics.avgSolveHours ? analytics.avgSolveHours.toFixed(1) : "--"}{" "}
            <span className="text-xs text-slate-400">hours</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Opened last 7 days</p>
          <p className="text-xl font-semibold">{analytics.openedLast7}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Solved last 7 days</p>
          <p className="text-xl font-semibold">{analytics.solvedLast7}</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] text-slate-400 mb-1">
          Top areas by case volume
        </p>
        <ul className="space-y-1 text-xs">
          {analytics.topAreas.map((a) => (
            <li
              key={a.area}
              className="flex justify-between text-slate-200"
            >
              <span>{a.area}</span>
              <span className="font-medium">{a.count}</span>
            </li>
          ))}
          {analytics.topAreas.length === 0 && (
            <li className="text-slate-500 text-xs">No data yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

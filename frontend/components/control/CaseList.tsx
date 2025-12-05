// frontend/components/control/CaseList.tsx
"use client";

import { CaseFile, Detective } from "@/lib/cases";
import { formatDateTime, statusColor } from "@/lib/control-utils";

interface Props {
  cases: CaseFile[];
  detectives: Detective[];
  selectedCaseId: string | null;
  onSelectCase: (id: string) => void;
}

export function CaseList({
  cases,
  detectives,
  selectedCaseId,
  onSelectCase,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-semibold">Top Unassigned Cases</h2>
        <span className="text-xs text-slate-400">{cases.length} visible</span>
      </div>
      <div className="space-y-2 overflow-y-auto pr-1">
        {cases.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCase(c.id)}
            className={`w-full text-left rounded-lg border px-3 py-3 transition hover:border-sky-500/60 hover:bg-slate-900
              ${
                c.id === selectedCaseId
                  ? "border-sky-500/70 bg-slate-900"
                  : "border-slate-800 bg-slate-950/40"
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium line-clamp-1">
                    {c.title}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(
                      c.status
                    )}`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {c.caseNumber} • {c.type}
                </p>
                <p className="text-[11px] text-slate-400">Area: {c.area}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-300">
                  {formatDateTime(c.reportedAt)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Updated {formatDateTime(c.lastUpdatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <p>
                Detective:{" "}
                {c.assignedDetectiveId
                  ? detectives.find((d) => d.id === c.assignedDetectiveId)
                      ?.name ?? "Unknown"
                  : "Unassigned"}
              </p>
              <p className="italic">
                {c.status === "solved"
                  ? "Case closed"
                  : c.status === "pending"
                  ? "Under investigation"
                  : "Needs attention"}
              </p>
            </div>
          </button>
        ))}

        {cases.length === 0 && (
          <p className="text-xs text-slate-500 px-2 py-4">
            No unassigned cases right now.
          </p>
        )}
      </div>
    </div>
  );
}

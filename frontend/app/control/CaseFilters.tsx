// frontend/components/control/CaseFilters.tsx
"use client";

import { CaseStatus } from "@/lib/cases";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | CaseStatus;
  onStatusFilterChange: (value: "all" | CaseStatus) => void;
  sortOrder: "newest" | "oldest";
  onSortOrderChange: (value: "newest" | "oldest") => void;
}

export function CaseFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
      <h2 className="text-sm font-semibold">Case Filters</h2>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by title, ID, area or type…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 min-w-[180px] rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as "all" | CaseStatus)
          }
          className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="unsolved">Unsolved</option>
          <option value="solved">Solved</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) =>
            onSortOrderChange(e.target.value as "newest" | "oldest")
          }
          className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
    </div>
  );
}

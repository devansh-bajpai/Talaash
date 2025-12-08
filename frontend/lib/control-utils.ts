// frontend/lib/control-utils.ts
import { CaseStatus } from "./cases";

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusColor(status: CaseStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-300 border-amber-500/40";
    case "unsolved":
      return "bg-red-500/10 text-red-300 border-red-500/40";
    case "solved":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    default:
      return "bg-slate-700 text-slate-100 border-slate-600";
  }
}

// // frontend/app/control/dashboard/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { LogoutButton } from "@/components/LogoutButton";
// import {
//   CaseFile,
//   CaseStatus,
//   Detective,
//   demoCases,
// } from "@/lib/cases";
// import { apiGet } from "@/lib/api";
// import { AnalyticsPanel } from "@/components/control/AnalyticsPanel";
// import { CaseFilters } from "@/app/control/CaseFilters";
// import { CaseList } from "@/app/control/CaseList";
// import { CaseDetail } from "@/app/control/CaseDetail";

// export default function ControlCenterDashboard() {
//   const [cases, setCases] = useState<CaseFile[]>(demoCases);

//   const [detectives, setDetectives] = useState<Detective[]>([]);
//   const [isLoadingDetectives, setIsLoadingDetectives] = useState(true);
//   const [detectiveError, setDetectiveError] = useState<string | null>(null);

//   const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
//     demoCases[0]?.id ?? null
//   );
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"all" | CaseStatus>("all");
//   const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

//   const selectedCase = useMemo(
//     () => cases.find((c) => c.id === selectedCaseId) ?? null,
//     [cases, selectedCaseId]
//   );

//   const filteredCases = useMemo(() => {
//     let data = [...cases];

//     if (search.trim()) {
//       const term = search.toLowerCase();
//       data = data.filter(
//         (c) =>
//           c.title.toLowerCase().includes(term) ||
//           c.caseNumber.toLowerCase().includes(term) ||
//           c.area.toLowerCase().includes(term) ||
//           c.type.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== "all") {
//       data = data.filter((c) => c.status === statusFilter);
//     }

//     data.sort((a, b) => {
//       const aTime = new Date(a.reportedAt).getTime();
//       const bTime = new Date(b.reportedAt).getTime();
//       return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
//     });

//     return data;
//   }, [cases, search, statusFilter, sortOrder]);

//   const totalActive = cases.filter(
//     (c) => c.status === "pending" || c.status === "unsolved"
//   ).length;
//   const totalAlerts = cases.filter((c) => c.status === "unsolved").length;

//   // ─────────── Load detectives from backend ───────────
//   useEffect(() => {
//     let cancelled = false;

//     async function loadDetectives() {
//       try {
//         setIsLoadingDetectives(true);
//         setDetectiveError(null);

//         // Backend should return array of detectives:
//         // [{ id, name, badgeId, avatarInitials }, ...]
//         const data = await apiGet<Detective[]>("/admin/detectives");
//         if (!cancelled) {
//           setDetectives(data);
//         }
//       } catch (err) {
//         console.error(err);
//         if (!cancelled) setDetectiveError("Failed to load detectives");
//       } finally {
//         if (!cancelled) setIsLoadingDetectives(false);
//       }
//     }

//     loadDetectives();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // ─────────── Optional: real-time online/offline via WebSocket ───────────
//   useEffect(() => {
//     const wsUrl =
//       process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/control-stream";

//     let ws: WebSocket | null = null;

//     try {
//       ws = new WebSocket(wsUrl);
//     } catch {
//       // fail silently if WS URL not available
//       return;
//     }

//     ws.onmessage = (event) => {
//       try {
//         const msg = JSON.parse(event.data);

//         if (msg.type === "detective-online") {
//           const d: Detective = msg.payload;
//           setDetectives((prev) => {
//             if (prev.some((x) => x.id === d.id)) return prev;
//             return [...prev, d];
//           });
//         }

//         if (msg.type === "detective-offline") {
//           const id: string = msg.payload.id;
//           setDetectives((prev) => prev.filter((d) => d.id !== id));
//         }
//       } catch {
//         // ignore bad messages
//       }
//     };

//     return () => {
//       ws?.close();
//     };
//   }, []);

//   // ─────────── Auto-assignment: least workload ───────────
//   useEffect(() => {
//     if (detectives.length === 0) return;

//     setCases((prev) => {
//       const unassigned = prev.filter((c) => !c.assignedDetectiveId);
//       if (unassigned.length === 0) return prev;

//       // Workload = number of active cases per detective
//       const workload: Record<string, number> = {};
//       for (const d of detectives) {
//         workload[d.id] = 0;
//       }

//       for (const c of prev) {
//         if (
//           c.assignedDetectiveId &&
//           (c.status === "pending" || c.status === "unsolved")
//         ) {
//           if (workload[c.assignedDetectiveId] != null) {
//             workload[c.assignedDetectiveId] += 1;
//           }
//         }
//       }

//       const updated: CaseFile[] = prev.map((c) => ({ ...c }));
//       const nowIso = new Date().toISOString();

//       for (const c of updated) {
//         if (!c.assignedDetectiveId) {
//           // pick detective with least workload
//           let chosenId: string | null = null;
//           let minWork = Infinity;

//           for (const d of detectives) {
//             const w = workload[d.id] ?? 0;
//             if (w < minWork) {
//               minWork = w;
//               chosenId = d.id;
//             }
//           }

//           if (chosenId) {
//             c.assignedDetectiveId = chosenId;
//             c.lastUpdatedAt = nowIso;
//             workload[chosenId] = (workload[chosenId] ?? 0) + 1;
//           }
//         }
//       }

//       return updated;
//     });
//   }, [detectives]);

//   // ─────────── Case updater helper ───────────
//   const handleUpdateCase = (id: string, updater: (prev: CaseFile) => CaseFile) =>
//     setCases((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));

//   return (
//     <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
//       <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
//         <div>
//           <h1 className="text-lg font-semibold">Control Center Dashboard</h1>
//           <p className="text-sm text-slate-400">
//             Access granted for ID{" "}
//             <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">
//               UnderControl2025
//             </code>
//           </p>
//         </div>
//         <LogoutButton />
//       </header>

//       <section className="flex-1 flex flex-col lg:flex-row px-6 py-6 gap-6">
//         {/* Left column: summary, analytics, filters, list */}
//         <div className="lg:w-2/5 flex flex-col gap-4">
//           {/* Top summary cards */}
//           <div className="grid gap-4 sm:grid-cols-3">
//             <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
//               <h3 className="font-medium mb-1 text-xs uppercase tracking-wide text-slate-400">
//                 Active Cases
//               </h3>
//               <p className="text-2xl font-semibold">{totalActive}</p>
//               <p className="text-xs text-slate-400 mt-1">
//                 Pending or unsolved investigations.
//               </p>
//             </div>
//             <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
//               <h3 className="font-medium mb-1 text-xs uppercase tracking-wide text-slate-400">
//                 Online Detectives
//               </h3>
//               <p className="text-2xl font-semibold">
//                 {isLoadingDetectives ? "…" : detectives.length}
//               </p>
//               <p className="text-xs text-slate-400 mt-1">
//                 {detectiveError
//                   ? "Error loading detectives."
//                   : "Logged in and available for cases."}
//               </p>
//             </div>
//             <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
//               <h3 className="font-medium mb-1 text-xs uppercase tracking-wide text-slate-400">
//                 Alerts
//               </h3>
//               <p className="text-2xl font-semibold text-amber-400">
//                 {totalAlerts}
//               </p>
//               <p className="text-xs text-slate-400 mt-1">
//                 Unsolved cases needing attention.
//               </p>
//             </div>
//           </div>

//           <AnalyticsPanel cases={cases} />

//           <CaseFilters
//             search={search}
//             onSearchChange={setSearch}
//             statusFilter={statusFilter}
//             onStatusFilterChange={setStatusFilter}
//             sortOrder={sortOrder}
//             onSortOrderChange={setSortOrder}
//           />

//           <CaseList
//             cases={filteredCases}
//             detectives={detectives}
//             selectedCaseId={selectedCaseId}
//             onSelectCase={setSelectedCaseId}
//           />
//         </div>

//         {/* Right column: case detail */}
//         <div className="lg:w-3/5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col">
//           <CaseDetail
//             caseFile={selectedCase}
//             detectives={detectives}
//             onUpdateCase={(updater) => {
//               if (!selectedCase) return;
//               handleUpdateCase(selectedCase.id, updater);
//             }}
//           />
//         </div>
//       </section>
//     </main>
//   );
// }


// frontend/app/control/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import {
  CaseFile,
  CaseStatus,
  Detective,
} from "@/lib/cases";
import { apiGet, apiPost } from "@/lib/api";
import { AnalyticsPanel } from "@/components/control/AnalyticsPanel";
import { CaseFilters } from "@/app/control/CaseFilters";
import { CaseList } from "@/components/control/CaseList";
import { CaseDetail } from "@/components/control/CaseDetail";

export default function ControlCenterDashboard() {
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [detectives, setDetectives] = useState<Detective[]>([]);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CaseStatus>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingDetectives, setLoadingDetectives] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [casesError, setCasesError] = useState<string | null>(null);
  const [detectiveError, setDetectiveError] = useState<string | null>(null);

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) ?? null,
    [cases, selectedCaseId]
  );

  const filteredCases = useMemo(() => {
    let data = [...cases];

    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.caseNumber.toLowerCase().includes(term) ||
          c.area.toLowerCase().includes(term) ||
          c.type.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((c) => c.status === statusFilter);
    }

    data.sort((a, b) => {
      const aTime = new Date(a.reportedAt).getTime();
      const bTime = new Date(b.reportedAt).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

    return data;
  }, [cases, search, statusFilter, sortOrder]);

  const totalActive = cases.filter(
    (c) => c.status === "pending" || c.status === "unsolved"
  ).length;
  const totalAlerts = cases.filter((c) => c.status === "unsolved").length;

  // ───────── Load detectives ─────────
  const loadDetectives = async () => {
  try {
    setLoadingDetectives(true);
    setDetectiveError(null);
    // ✅ add /api here
    const data = await apiGet<Detective[]>("/api/detectives");
    setDetectives(data);
  } catch (err) {
    console.error(err);
    setDetectiveError("Failed to load detectives");
  } finally {
    setLoadingDetectives(false);
  }
};


  // ───────── Load top unassigned cases ─────────
  const loadCases = async () => {
  try {
    setLoadingCases(true);
    setCasesError(null);
    // ✅ add /api here
    const data = await apiGet<CaseFile[]>("/api/cases/unassigned?limit=5");
    setCases(data);
    setSelectedCaseId(data[0]?.id ?? null);
  } catch (err) {
    console.error(err);
    setCasesError("Failed to load cases");
  } finally {
    setLoadingCases(false);
  }
};

  useEffect(() => {
    loadDetectives();
    loadCases();
  }, []);

  // ───────── Auto-assign button ─────────
 const handleAutoAssign = async () => {
  if (!cases.length) return;
  try {
    setAssigning(true);
    // ✅ add /api here
    const updated = await apiPost<CaseFile[]>("/api/cases/auto-assign", {
      limit: cases.length,
    });
    setCases(updated);
    if (!selectedCaseId && updated[0]) {
      setSelectedCaseId(updated[0].id);
    }
  } catch (err) {
    console.error(err);
    alert("Auto-assign failed. Check backend logs.");
  } finally {
    setAssigning(false);
  }
};

  const handleUpdateCase = (id: string, updater: (prev: CaseFile) => CaseFile) =>
    setCases((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold">Control Center Dashboard</h1>
          <p className="text-sm text-slate-400">
            Access granted for ID{" "}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              UnderControl2025
            </code>
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="flex-1 flex flex-col lg:flex-row px-6 py-6 gap-6">
        {/* Left column */}
        <div className="lg:w-2/5 flex flex-col gap-4">
          {/* Top summary + controls */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <h3 className="font-medium mb-1 text-xs uppercase tracking-wide text-slate-400">
                  Active Cases (visible)
                </h3>
                <p className="text-2xl font-semibold">
                  {loadingCases ? "…" : totalActive}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Top unassigned cases currently on panel.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1 text-xs uppercase tracking-wide text-slate-400">
                  Detectives
                </h3>
                <p className="text-2xl font-semibold">
                  {loadingDetectives ? "…" : detectives.length}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  All registered detectives in database.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1 text-xs uppercase tracking-wide text-slate-400">
                  Alerts
                </h3>
                <p className="text-2xl font-semibold text-amber-400">
                  {totalAlerts}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Unsolved cases among visible ones.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAutoAssign}
                disabled={assigning || !cases.length || !detectives.length}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? "Assigning..." : "Auto Assign Cases"}
              </button>
              <button
                onClick={loadCases}
                className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-600 hover:bg-slate-800"
              >
                Refresh Cases
              </button>
            </div>
            {casesError && (
              <p className="text-xs text-red-400">{casesError}</p>
            )}
            {detectiveError && (
              <p className="text-xs text-red-400">{detectiveError}</p>
            )}
          </div>

          <AnalyticsPanel cases={cases} />

          <CaseFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          <CaseList
            cases={filteredCases}
            detectives={detectives}
            selectedCaseId={selectedCaseId}
            onSelectCase={setSelectedCaseId}
          />
        </div>

        {/* Right column */}
        <div className="lg:w-3/5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col">
          <CaseDetail
            caseFile={selectedCase}
            detectives={detectives}
            onUpdateCase={(updater) => {
              if (!selectedCase) return;
              handleUpdateCase(selectedCase.id, updater);
            }}
          />
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

type CaseStatus = "PENDING" | "RUNNING" | "COMPLETED";

interface CaseSummary {
  caseId: string;          // matches backend: caseId
  title: string;           // short case name
  status: CaseStatus;      // PENDING / RUNNING / COMPLETED
  source: string;          // source station / department
  crimeType?: string;      // e.g. "robbery", "cyber fraud"
  weapons?: string[];      // e.g. ["gun", "knife"]
  lastUpdated: string;     // ISO string
}

interface SimilarityResult {
  caseId: string;
  title: string;
  similarity: number;
}

interface DetectiveRequest {
  id: string;
  toStationName: string;
  caseTitle?: string;
  subject: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  createdAt: string;
}

// temporary mock data — now matches new schema shape
const MOCK_CASES: CaseSummary[] = [
  {
    caseId: "CASE-2025-001",
    title: "Night burglary near Sector 7",
    status: "RUNNING",
    source: "Station Alpha",
    crimeType: "Burglary",
    weapons: ["Knife"],
    lastUpdated: "2025-12-03T10:30:00Z",
  },
  {
    caseId: "CASE-2025-002",
    title: "ATM robbery incident",
    status: "PENDING",
    source: "Station Beta",
    crimeType: "Robbery",
    weapons: ["Gun"],
    lastUpdated: "2025-12-02T14:10:00Z",
  },
  {
    caseId: "CASE-2025-003",
    title: "Cyber fraud complaint",
    status: "COMPLETED",
    source: "Cyber Crime Cell",
    crimeType: "Cyber Fraud",
    weapons: [],
    lastUpdated: "2025-11-28T09:00:00Z",
  },
];

const MOCK_REQUESTS: DetectiveRequest[] = [
  {
    id: "R-1",
    toStationName: "Station Beta",
    caseTitle: "ATM robbery incident",
    subject: "Need suspect prior record",
    status: "PENDING",
    createdAt: "2025-12-03T08:15:00Z",
  },
  {
    id: "R-2",
    toStationName: "Station Gamma",
    subject: "Requesting CCTV footage of Sector 7",
    status: "RESOLVED",
    createdAt: "2025-12-01T17:40:00Z",
  },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function DetectiveDashboardPage() {
  // ⬇️ make cases stateful so we can update status
  const [cases, setCases] = useState<CaseSummary[]>(MOCK_CASES);
  const [casesLoading, setCasesLoading] = useState<boolean>(true);
  const [casesError, setCasesError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | "ALL">(
    "RUNNING"
  );
  const [similarityQuery, setSimilarityQuery] = useState("");
  const [similarityResults, setSimilarityResults] = useState<SimilarityResult[]>(
    []
  );
  const [updatingCaseId, setUpdatingCaseId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCases() {
      try {
        setCasesLoading(true);
        setCasesError(null);

        const res = await fetch(`${API_BASE}/api/my-cases`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch cases: ${res.status}`);
        }

        const data = await res.json(); // expected { cases: [...] }

        const mapped: CaseSummary[] = (data.cases || []).map((c: any) => ({
          caseId: c.caseId,
          title: c.title,
          status: c.status as CaseStatus,
          source: c.source,
          crimeType: c.crimeType,
          weapons: c.weapons || [],
          lastUpdated: c.updatedAt || c.createdAt || new Date().toISOString(),
        }));

        setCases(mapped);
      } catch (err: any) {
        console.error("Error fetching cases:", err);
        setCasesError("Failed to load cases");
      } finally {
        setCasesLoading(false);
      }
    }

    fetchCases();
  }, []);

  const filteredCases =
    selectedStatus === "ALL"
      ? cases
      : cases.filter((c) => c.status === selectedStatus);

  const myTotalCases = cases.length;
  const myRunningCases = cases.filter((c) => c.status === "RUNNING").length;
  const myCompletedCases = cases.filter(
    (c) => c.status === "COMPLETED"
  ).length;
  const myPendingRequests = MOCK_REQUESTS.filter(
    (r) => r.status === "PENDING"
  ).length;

  async function handleSimilaritySubmit(e: React.FormEvent) {
    e.preventDefault();
  
    if (!similarityQuery.trim()) return;
  
    try {
      const res = await fetch(`${API_BASE}/api/similarity-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // later: add Authorization header when you secure detective routes
        },
        body: JSON.stringify({
          description: similarityQuery,
          // optional: if you want to link with a particular case:
          // caseId: "CASE-2025-001",
        }),
      });
  
      if (!res.ok) {
        console.error("Failed to save similarity search:", await res.text());
        return;
      }
  
      const data = await res.json();
      console.log("Saved similarity search:", data.search);
  
      // if you truly want "nothing else", don't set any results state.
      // you can just clear the textarea:
      setSimilarityQuery("");
      // and optionally clear results if you were showing them:
      setSimilarityResults([]);
    } catch (err) {
      console.error("Error sending similarity search:", err);
    }
  }
  

  // Handler: mark case as COMPLETED (frontend + backend)
  async function handleMarkCompleted(caseId: string) {
    // ignore if already updating
    if (updatingCaseId) return;

    setUpdatingCaseId(caseId);

    try {
      // ✅ optimistic update on frontend
      setCases((prev) =>
        prev.map((c) =>
          c.caseId === caseId
            ? {
                ...c,
                status: "COMPLETED",
                lastUpdated: new Date().toISOString(),
              }
            : c
        )
      );

      // ✅ backend call (once your API exists) – right now can be left or used
      await fetch(
        `${API_BASE}/api/my-cases/${encodeURIComponent(
          caseId
        )}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // if later you add JWT for detective routes, include Authorization here
          },
          body: JSON.stringify({ status: "COMPLETED" }),
        }
      );
    } catch (err) {
      console.error("Error marking case as completed:", err);
      // optional: revert optimistic update if you want to be strict
    } finally {
      setUpdatingCaseId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Detective Dashboard</h1>
        <p className="text-sm text-slate-400">
          Overview of your assigned cases, similarity searches, and requests.
        </p>
      </header>

      {/* Top stats row */}
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="My Total Cases" value={myTotalCases} />
        <StatCard label="My Running Cases" value={myRunningCases} />
        <StatCard label="My Completed Cases" value={myCompletedCases} />
        <StatCard label="Pending Requests" value={myPendingRequests} />
      </section>

      {/* Middle: My Cases + Similarity Search */}
      <section className="grid gap-6 lg:grid-cols-2">
        <MyCasesSection
          cases={filteredCases}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onMarkCompleted={handleMarkCompleted}
          updatingCaseId={updatingCaseId}
        />
        <SimilaritySearchSection
          query={similarityQuery}
          onQueryChange={setSimilarityQuery}
          onSubmit={handleSimilaritySubmit}
          results={similarityResults}
        />
      </section>

      {/* Bottom: Requests */}
      <section className="grid gap-6 lg:grid-cols-2">
        <RequestsSection requests={MOCK_REQUESTS} />
        {/* Right-bottom panel reserved for future: notifications, responses, etc. */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold mb-2">
            Notifications & Responses (Coming soon)
          </h2>
          <p className="text-xs text-slate-400">
            This panel will show responses to your requests and other important
            alerts related to your cases.
          </p>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}

function MyCasesSection({
  cases,
  selectedStatus,
  onStatusChange,
  onMarkCompleted,
  updatingCaseId,
}: {
  cases: CaseSummary[];
  selectedStatus: CaseStatus | "ALL";
  onStatusChange: (status: CaseStatus | "ALL") => void;
  onMarkCompleted: (caseId: string) => void;
  updatingCaseId: string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">My Cases</h2>
        <div className="flex gap-2 text-xs">
          {(["ALL", "PENDING", "RUNNING", "COMPLETED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-2 py-1 rounded-md border text-xs ${
                selectedStatus === s
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-slate-400 border-b border-slate-800">
            <tr>
              <th className="text-left py-1 pr-2">Case ID</th>
              <th className="text-left py-1 pr-2">Title</th>
              <th className="text-left py-1 pr-2">Status</th>
              <th className="text-left py-1 pr-2">Crime Type</th>
              <th className="text-left py-1 pr-2">Weapons</th>
              <th className="text-left py-1 pr-2">Source</th>
              <th className="text-left py-1 pr-2">Updated</th>
              <th className="py-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const canMarkCompleted = c.status !== "COMPLETED";
              const isLoading = updatingCaseId === c.caseId;

              return (
                <tr key={c.caseId} className="border-b border-slate-900/60">
                  <td className="py-1 pr-2 text-slate-300">{c.caseId}</td>
                  <td className="py-1 pr-2">{c.title}</td>
                  <td className="py-1 pr-2">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-1 pr-2 text-slate-300">
                    {c.crimeType || "-"}
                  </td>
                  <td className="py-1 pr-2 text-slate-300">
                    {c.weapons && c.weapons.length > 0
                      ? c.weapons.join(", ")
                      : "-"}
                  </td>
                  <td className="py-1 pr-2 text-slate-300">{c.source}</td>
                  <td className="py-1 pr-2 text-slate-400">
                    {new Date(c.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="py-1 text-right space-x-2">
                    <button className="text-[11px] text-blue-400 hover:underline">
                      View
                    </button>
                    {canMarkCompleted && (
                      <button
                        onClick={() => onMarkCompleted(c.caseId)}
                        disabled={isLoading}
                        className={`text-[11px] rounded-md px-2 py-0.5 border ${
                          isLoading
                            ? "border-slate-700 text-slate-500"
                            : "border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {isLoading ? "Updating..." : "Mark Completed"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {cases.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-4 text-center text-slate-500 text-xs"
                >
                  No cases for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const map: Record<CaseStatus, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    RUNNING: "bg-blue-500/15 text-blue-400 border-blue-500/40",
    COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${map[status]}`}
    >
      {status}
    </span>
  );
}

function SimilaritySearchSection({
  query,
  onQueryChange,
  onSubmit,
  results,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  results: SimilarityResult[];
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Case Similarity Search</h2>
      <p className="text-xs text-slate-400">
        Paste or write key details of a case to find similar past cases. Include
        crime type, weapons, and key behaviors for better matching. (ML
        integration will be added later.)
      </p>
      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-slate-700 bg-slate-950/60 p-2 text-xs outline-none focus:border-blue-500"
          placeholder="Describe the case: crime type, location, suspect behavior, weapons used, time pattern, etc."
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-1.5 rounded-md bg-blue-600 text-xs font-medium hover:bg-blue-500"
          >
            Search Similar Cases
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="mt-1">
          <h3 className="text-xs font-semibold mb-2 text-slate-200">
            Similar Cases (mocked)
          </h3>
          <ul className="space-y-1 text-xs">
            {results.map((r) => (
              <li
                key={r.caseId}
                className="flex items-center justify-between border-b border-slate-800/70 pb-1"
              >
                <div>
                  <p className="text-slate-100">{r.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Case ID: {r.caseId}
                  </p>
                </div>
                <span className="text-[11px] text-emerald-400">
                  {(r.similarity * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RequestsSection({ requests }: { requests: DetectiveRequest[] }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">My Requests</h2>
        <button className="px-3 py-1.5 rounded-md bg-slate-800 text-[11px] border border-slate-700 hover:bg-slate-700">
          + New Request (UI later)
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-slate-400 border-b border-slate-800">
            <tr>
              <th className="text-left py-1 pr-2">To Station</th>
              <th className="text-left py-1 pr-2">Subject</th>
              <th className="text-left py-1 pr-2">Case</th>
              <th className="text-left py-1 pr-2">Status</th>
              <th className="text-left py-1 pr-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-900/60">
                <td className="py-1 pr-2 text-slate-200">
                  {r.toStationName}
                </td>
                <td className="py-1 pr-2 text-slate-100">{r.subject}</td>
                <td className="py-1 pr-2 text-slate-300">
                  {r.caseTitle || "-"}
                </td>
                <td className="py-1 pr-2">
                  <RequestStatusBadge status={r.status} />
                </td>
                <td className="py-1 pr-2 text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-4 text-center text-slate-500 text-xs"
                >
                  You have not created any requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestStatusBadge({
  status,
}: {
  status: "PENDING" | "RESOLVED" | "REJECTED";
}) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    RESOLVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/40",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${map[status]}`}
    >
      {status}
    </span>
  );
}
// frontend/app/control/dashboard/page.tsx
"use client";

import { LogoutButton } from "@/components/LogoutButton";

export default function ControlCenterDashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
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

      <section className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-3xl w-full space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-xl font-semibold mb-2">Control Panel</h2>
            <p className="text-sm text-slate-300">
              This is the Control Center view. Here you can later add controls
              for monitoring cases, assigning detectives, viewing live feeds,
              and more.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="font-medium mb-1 text-sm">Active Cases</h3>
              <p className="text-2xl font-semibold">12</p>
              <p className="text-xs text-slate-400 mt-1">
                Cases currently being tracked.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="font-medium mb-1 text-sm">Online Detectives</h3>
              <p className="text-2xl font-semibold">5</p>
              <p className="text-xs text-slate-400 mt-1">
                Logged in and active right now.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="font-medium mb-1 text-sm">Alerts</h3>
              <p className="text-2xl font-semibold text-amber-400">3</p>
              <p className="text-xs text-slate-400 mt-1">
                Items that need immediate attention.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

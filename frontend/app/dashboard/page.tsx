"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  return cookie ? cookie.split("=")[1] : null;
}

type MeResponse = {
  id: number;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = (await res.json()) as MeResponse;
        setMe(data);
      } catch (err) {
        setError("Failed to load user");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p>Loading dashboard…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
        <div>
          <h1 className="text-lg font-semibold">Talaash Dashboard</h1>
          {me && (
            <p className="text-sm text-slate-400">
              Logged in as <span className="font-medium">{me.email}</span>
            </p>
          )}
        </div>
        <LogoutButton />
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          {error && (
            <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <h2 className="text-2xl font-semibold mb-3">Welcome!</h2>
          <p className="text-slate-300 mb-6">
            This is a protected route. You can only see it if your{" "}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              token
            </code>{" "}
            is valid.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="font-medium mb-1">Next steps</h3>
              <p className="text-sm text-slate-400">
                Replace this content with your real dashboard widgets: stats,
                charts, search results, etc.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="font-medium mb-1">Auth flow</h3>
              <p className="text-sm text-slate-400">
                Try logging out with the button above, then opening{" "}
                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">
                  /dashboard
                </code>{" "}
                again – you should be redirected back to{" "}
                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">
                  /login
                </code>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const role = (formData.get("role") as string) || "detective";
    const idOrEmail = formData.get("email") as string; // used as email for detective, ID for control center
    const password = formData.get("password") as string;

    try {
      // 🟦 CONTROL CENTER FLOW (no backend, fixed credentials)
      if (role === "control") {
        const CONTROL_ID = "UnderControl2025";
        const CONTROL_PASSWORD = "2025UC";

        if (idOrEmail === CONTROL_ID && password === CONTROL_PASSWORD) {
          // optional: you could set a different cookie if you want
          router.push("/control/dashboard");
          return;
        }

        throw new Error("Invalid Control Center credentials");
      }
////////////////////////////////////////////////////////////////////////////////////
      // 🟩 DETECTIVE FLOW (normal user login via backend)
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: idOrEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Invalid credentials");
      }

      if (!data.token) {
        throw new Error("No token returned from server");
      }

      // save token cookie for detective
      document.cookie = `token=${data.token}; path=/;`;

      const redirectTo = searchParams.get("from") || "/detective/dashboard";
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-50 mb-6 text-center">
          Login
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-200 mb-1"
            >
              Login as
            </label>
            <select
              id="role"
              name="role"
              defaultValue="detective"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="detective">Detective</option>
              <option value="control">Control Center</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">
              
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200 mb-1"
            >
              Email / ID
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

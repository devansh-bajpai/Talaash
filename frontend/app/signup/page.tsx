// "use client";

// import { FormEvent, useState } from "react";
// import { useRouter } from "next/navigation";
// const API_BASE =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// export default function SignupPage() {
//   const router = useRouter();
//   const [error, setError] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setError(null);
//     setIsSubmitting(true);

//     const formData = new FormData(e.currentTarget);
//     const name = formData.get("name") as string;
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;

//     try {
//       const res = await fetch(`${API_BASE}/auth/signup`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.message || "Signup failed");
//       }

//       router.push("/dashboard");
//     } catch (err: any) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-950">
//       <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg">
//         <h1 className="text-2xl font-semibold text-slate-50 mb-6 text-center">
//           Create an account
//         </h1>

//         {error && (
//           <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-sm font-medium text-slate-200 mb-1"
//             >
//               Name
//             </label>
//             <input
//               id="name"
//               name="name"
//               type="text"
//               required
//               className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-slate-200 mb-1"
//             >
//               Email
//             </label>
//             <input
//               id="email"
//               name="email"
//               type="email"
//               required
//               className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-slate-200 mb-1"
//             >
//               Password
//             </label>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               required
//               minLength={6}
//               className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
//           >
//             {isSubmitting ? "Creating account…" : "Sign up"}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm text-slate-400">
//           Already have an account?{" "}
//           <a
//             href="/login"
//             className="text-indigo-400 hover:text-indigo-300 underline"
//           >
//             Login
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // 1️⃣ SIGNUP
      const signupRes = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        throw new Error(signupData?.message || "Signup failed");
      }
///////////////////////////////////////////////////////////////////////////
      // 2️⃣ AUTO-LOGIN
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData?.message || "Login failed");
      }

      if (!loginData.token) {
        throw new Error("No token returned from server");
      }

      // 3️⃣ SAVE TOKEN COOKIE
      document.cookie = `token=${loginData.token}; path=/;`;

      // 4️⃣ REDIRECT TO DASHBOARD
      router.push("/detective/dashboard");
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
          Create an account
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-200 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
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
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

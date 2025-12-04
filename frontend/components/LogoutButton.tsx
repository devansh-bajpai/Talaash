"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    document.cookie = "token=; Max-Age=0; path=/;";
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 rounded-md text-sm bg-slate-800 hover:bg-slate-700"
    >
      Logout
    </button>
  );
}

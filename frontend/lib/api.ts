// // frontend/lib/api.ts

// // ⚠️ CHANGED: default now points to http://localhost:8000/api (not 4000)
// export const API_BASE =
//   (process.env.NEXT_PUBLIC_API_BASE_URL ||
//     "http://localhost:8000/api")
//     // remove trailing slash if any → avoids "//" later
//     .replace(/\/$/, "");

// export async function apiGet<T>(path: string): Promise<T> {
//   console.log("API_BASE =", API_BASE);

//   // ⚠️ CHANGED: always ensure exactly one slash between base and path
//   const url =
//     API_BASE +
//     (path.startsWith("/") ? path : `/${path}`);

//   const res = await fetch(url, {
//     credentials: "include",
//   });
//   if (!res.ok) {
//     throw new Error(`GET ${url} failed: ${res.status}`);
//   }
//   return res.json();
// }

// export async function apiPost<T>(
//   path: string,
//   body: unknown
// ): Promise<T> {
//   console.log("API_BASE =", API_BASE);

//   // ⚠️ CHANGED: same safe join logic here
//   const url =
//     API_BASE +
//     (path.startsWith("/") ? path : `/${path}`);

//   const res = await fetch(url, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });
//   if (!res.ok) {
//     throw new Error(`POST ${url} failed: ${res.status}`);
//   }
//   return res.json();
// }

// frontend/lib/api.ts

// ✅ BASE is just the server origin, no /api here
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function buildUrl(path: string) {
  const base = API_BASE.replace(/\/$/, ""); // remove trailing slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = buildUrl(path);
  console.log("GET", url);
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const url = buildUrl(path);
  console.log("POST", url);
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST ${url} failed: ${res.status}`);
  }
  return res.json();
}

// // frontend/proxy.ts (new)
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// const PROTECTED_ROUTES = ['/dashboard'];

// export function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   const isProtected = PROTECTED_ROUTES.some((route) =>
//     pathname.startsWith(route),
//   );

//   if (!isProtected) return NextResponse.next();

//   const token = req.cookies.get('token')?.value;

//   if (!token) {
//     const loginUrl = new URL('/login', req.url);
//     loginUrl.searchParams.set('from', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/dashboard/:path*'],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

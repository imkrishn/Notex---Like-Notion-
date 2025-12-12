import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth", "/auth/login", "/auth/signup"];
const PROTECTED_ROUTES = ["/home", "/page", "/profile", "/settings"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("notex_session")?.value;

  // Skip static files, API, and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // precise public check: exact "/" only for root, startsWith for others
  const isPublic = PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );

  // protected: keep startsWith so /page/:id matches
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  let validToken = false;
  let userName = "";

  if (token) {
    try {
      const res = await fetch(`${req.nextUrl.origin}/api/auth/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      validToken = !!data.valid;
      userName = data.name ?? "";
    } catch (err) {
      console.error("Token validation failed:", err);
    }
  }

  // 1️⃣ Unauthenticated → block protected routes
  if (!validToken && isProtected) {
    if (!pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // 2️⃣ Authenticated → prevent visiting auth pages (but not other routes)
  if (validToken && isPublic) {
    // If user is already at home with username, allow that
    if (!pathname.startsWith("/home")) {
      return NextResponse.redirect(new URL(`/home/${userName}`, req.url));
    }
    return NextResponse.next();
  }

  // 3️⃣ Otherwise, continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

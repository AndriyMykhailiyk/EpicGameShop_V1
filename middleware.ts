import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Protects `/admin` routes. `/admin/login` stays public.
 */
export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }
    if (!pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const token = await getToken({ req, secret });
    if (!token?.isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

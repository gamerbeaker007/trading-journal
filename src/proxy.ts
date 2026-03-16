import { auth } from "@auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // If no password is configured, the app is open — skip auth entirely
  if (!process.env.ADMIN_PASSWORD) return;
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  // Protect all routes EXCEPT:
  //   _next/static  — bundled assets
  //   _next/image   — image optimisation
  //   favicon.ico   — browser icon
  //   login         — the login page itself
  //   api/auth      — NextAuth endpoints (session fetch, sign-in/out)
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|login|api/auth).*)"],
};

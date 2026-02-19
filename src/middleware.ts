import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // In production, check for authentication token/session
  // For demo purposes, we'll allow access but log the request
  
  const pathname = request.nextUrl.pathname;
  
  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") || pathname === "/") {
    // In production, verify session:
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.redirect(new URL("/login", request.url));
    // }
    
    // For demo, we'll allow access but you can add auth checks here
    // Example: Check for auth cookie or header
    const authToken = request.cookies.get("auth-token");
    
    if (!authToken && process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};

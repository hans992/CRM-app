export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/", "/contacts/:path*", "/tasks", "/tasks/:path*", "/reports", "/reports/:path*"],
};

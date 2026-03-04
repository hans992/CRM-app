"use server";

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function signInAction(email: string, password: string): Promise<{ error?: string }> {
  try {
    const result = await signIn("credentials", {
      email: email.trim(),
      password: password || undefined,
      redirect: false,
    });
    if (typeof result === "string") {
      redirect(result);
    }
    if (result && typeof result === "object") {
      if ((result as { error?: string }).error) {
        return { error: "Invalid email or password. Run: npx prisma db seed" };
      }
      const url = (result as { url?: string }).url;
      if (url) redirect(url);
    }
    return { error: "Sign in failed. Run: npx prisma db seed" };
  } catch (e) {
    if (e && typeof e === "object" && "type" in e && (e as { type: string }).type === "redirect") {
      throw e;
    }
    return { error: "Invalid email or password. Run: npx prisma db seed" };
  }
}

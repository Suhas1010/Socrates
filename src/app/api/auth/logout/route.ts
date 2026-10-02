import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  clearAuthCookie(res);
  return res;
}

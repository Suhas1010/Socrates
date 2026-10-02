import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "socrates_jwt_secret_dev_key_fallback_2026";
export const AUTH_COOKIE_NAME = "socrates_auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getAuthUser(req: NextRequest): TokenPayload | null {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie) {
    const verified = verifyToken(cookie);
    if (verified) return verified;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    return verifyToken(token);
  }

  return null;
}

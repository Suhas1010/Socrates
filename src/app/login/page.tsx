"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  RotateCcw,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, verifyEmail, resendVerificationCode, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "verify">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email verification state
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect home
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);
      const res = await register(name, email, password);
      setLoading(false);

      if (!res.success) {
        setError(res.error || "Failed to create account.");
      } else if (res.needsVerification) {
        setVerifyEmailAddress(res.email || email);
        if (res.devCode) setDevCode(res.devCode);
        if (res.previewUrl) setPreviewUrl(res.previewUrl);
        setSuccessMsg(
          res.message || `We sent a 6-digit verification code to ${res.email || email}.`
        );
        setMode("verify");
      } else {
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => router.push("/"), 1000);
      }
    } else {
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);

      if (!res.success) {
        if (res.needsVerification) {
          setVerifyEmailAddress(res.email || email);
          setError(res.error || "Please verify your email before signing in.");
          setMode("verify");
        } else {
          setError(res.error || "Invalid email or password.");
        }
      } else {
        setSuccessMsg("Signed in successfully! Redirecting...");
        setTimeout(() => router.push("/"), 1000);
      }
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    const res = await verifyEmail(verifyEmailAddress, cleanCode);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to verify code. Please try again.");
    } else {
      setSuccessMsg("Email verified successfully! Welcome to Socrates. Redirecting...");
      setTimeout(() => router.push("/"), 1000);
    }
  };

  const handleResendCode = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    setError(null);
    setSuccessMsg(null);
    const res = await resendVerificationCode(verifyEmailAddress);
    setIsResending(false);

    if (!res.success) {
      setError(res.error || "Failed to resend code.");
    } else {
      if (res.devCode) setDevCode(res.devCode);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setSuccessMsg(`A fresh verification code was sent to ${verifyEmailAddress}.`);
      setResendCooldown(30);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full bg-[#070A10] flex flex-col items-center justify-start py-6 sm:py-8 px-4 relative overflow-y-auto">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Inner Centering Wrapper */}
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-4 relative z-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 fill-current" />
            </div>
            <span className="text-lg font-black tracking-tight text-white font-sans">
              Socrates
            </span>
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {mode === "verify"
              ? "Verify Your Email Address"
              : mode === "login"
              ? "Welcome back to Socrates"
              : "Start your AI journey"}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-sm leading-normal">
            {mode === "verify"
              ? `Enter the 6-digit code sent to ${verifyEmailAddress || "your inbox"} to activate your account.`
              : mode === "login"
              ? "Sign in to access your saved project roadmaps, code sandboxes, and mastery progress."
              : "Create a free account to sync your AI projects and Python Academy certificates."}
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full bg-[#0D121F]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative z-10 mb-4">
          {/* Mode Toggle Switch (only shown for login / register) */}
          {mode !== "verify" ? (
            <div className="flex items-center p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-amber-400 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-amber-400 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-zinc-800/80 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setSuccessMsg(null);
                  setVerificationCode("");
                }}
                className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Register</span>
              </button>
              <span className="text-amber-400 font-mono font-medium text-[10px]">Step 2 of 2: Verification</span>
            </div>
          )}

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Free Test Mailbox Preview Banner */}
        {mode === "verify" && previewUrl && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
            <span className="truncate pr-2 text-[11px]">📬 Delivered to Free Test Mailbox</span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded bg-cyan-400 text-zinc-950 font-bold text-[10px] hover:bg-cyan-300 transition-colors inline-flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <span>View Email</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}

        {/* Development Helper Pill */}
        {mode === "verify" && devCode && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs flex items-center justify-between">
            <span className="font-mono text-[11px]">Verification Code: <strong>{devCode}</strong></span>
            <button
              type="button"
              onClick={() => setVerificationCode(devCode)}
              className="px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-bold text-[10px] hover:bg-amber-300 cursor-pointer"
            >
              Auto Fill
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EMAIL VERIFICATION FORM                                                   */}
        {/* ========================================================================= */}
        {mode === "verify" ? (
          <form onSubmit={handleVerifySubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider text-center">
                Enter 6-Digit Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  className="w-full text-center py-2.5 px-3 rounded-xl bg-zinc-950/90 border border-zinc-700 text-white placeholder-zinc-700 text-xl sm:text-2xl font-mono font-bold tracking-[6px] focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5 text-center">
                Code expires in 15 minutes. Check spam folder if not in inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full mt-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email &amp; Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Resend Code Action */}
            <div className="pt-1.5 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
                className="text-[11px] text-zinc-400 hover:text-amber-300 disabled:opacity-50 disabled:hover:text-zinc-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <RotateCcw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : isResending
                    ? "Sending fresh code..."
                    : "Didn't receive email? Resend code"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* LOGIN & REGISTRATION FORM                                                 */
          /* ========================================================================= */
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-mono font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                />
              </div>
              {mode === "register" && (
                <span className="text-[10px] text-zinc-500 mt-0.5 block">
                  Must be at least 6 characters
                </span>
              )}
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-mono font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? "Sign In to Socrates"
                      : "Create Account & Send Verification Code"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Guest Skip Option */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all inline-flex items-center justify-center gap-1.5 font-medium cursor-pointer"
          >
            <span>Continue as Guest (No account needed) &rarr;</span>
          </button>
        </div>

        {/* Database sync status info */}
        <div className="pb-8 text-center text-[11px] text-zinc-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected to MongoDB Cloud · Instant Multi-Device Progress Sync</span>
        </div>
      </div>
    </div>
  );
}

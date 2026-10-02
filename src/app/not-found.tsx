"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    // Auto-redirect to home after 1.5s if landing on an unknown URL
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm animate-pulse">
        <Sparkles className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-white">
        Returning to Socrates AI Tutor...
      </h2>
      <p className="text-xs text-zinc-400 max-w-sm text-center">
        Redirecting you to your active project learning workspace.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
      >
        <span>Go to Workspace</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

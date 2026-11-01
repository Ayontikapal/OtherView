"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Eye, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/inspections";

  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, name);
      if (result.success) {
        router.push(redirect);
      } else {
        setError(result.error || "Sign up failed. Please check your information.");
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#1e1a33] rounded-3xl border border-[#c3b8e3]/15 p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#141221] border border-[#e85d63]/30 flex items-center justify-center text-[#e85d63] mx-auto shadow-md">
          <Eye className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#fdf9f4] tracking-tight">
          Create an Account
        </h1>
        <p className="text-xs sm:text-sm text-[#a9a1c6]">
          Save your accessibility reviews, collaborate across devices, and track remediation progress over time.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-[#e85d63]/10 border border-[#e85d63]/30 rounded-xl text-[#e85d63] text-xs flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-[#e85d63] shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-bold">Sign up failed: </span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-semibold text-[#c3b8e3]">
            Full Name or Team Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#a9a1c6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe (Facilities Team)"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#141221] border border-[#c3b8e3]/20 rounded-xl text-xs sm:text-sm text-[#fdf9f4] placeholder-[#a9a1c6]/40 focus:border-[#e85d63] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-[#c3b8e3]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#a9a1c6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="architect@domain.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#141221] border border-[#c3b8e3]/20 rounded-xl text-xs sm:text-sm text-[#fdf9f4] placeholder-[#a9a1c6]/40 focus:border-[#e85d63] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-[#c3b8e3]">
            Password (at least 8 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#a9a1c6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#141221] border border-[#c3b8e3]/20 rounded-xl text-xs sm:text-sm text-[#fdf9f4] placeholder-[#a9a1c6]/40 focus:border-[#e85d63] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-3.5 bg-[#141221] rounded-xl border border-[#c3b8e3]/15 text-[11px] text-[#a9a1c6] space-y-1">
          <p className="font-bold text-[#fdf9f4] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6ee7b7]" />
            <span>Privacy & Ownership Guarantee</span>
          </p>
          <p>
            Your inspections, findings, and uploaded photographs remain private to your account.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] active:scale-[0.98] disabled:opacity-50 transition-all shadow-md cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-[#c3b8e3]/10 pt-4 text-center space-y-2">
        <p className="text-xs text-[#a9a1c6]">
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="text-[#e85d63] hover:text-[#d64b51] font-semibold underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#141221] text-[#fdf9f4] relative selection:bg-[#e85d63] selection:text-[#141221]">
      <AppHeader />

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto bg-[#1e1a33] rounded-3xl border border-[#c3b8e3]/15 p-8 text-center space-y-3">
              <Loader2 className="w-6 h-6 text-[#e85d63] animate-spin mx-auto" />
              <p className="text-xs text-[#a9a1c6]">Loading sign up...</p>
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      </main>

      <AppFooter />
    </div>
  );
}

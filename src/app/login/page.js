"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { PlateIcon } from "../../components/icons/Icons";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    if (!password) return setError("Please enter your password.");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        router.push("/dashboard");
      } else if (profile?.is_admin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex items-center justify-center p-6 font-sans">

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Login Failed</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {error === "Invalid login credentials"
                  ? "The email or password you entered is incorrect. Please check and try again."
                  : error}
              </p>
              <button
                onClick={() => setError("")}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black active:scale-[0.98] transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[500px]">

        {/* Left — brand panel */}
        <div className="hidden md:flex w-[42%] flex-shrink-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_25%_75%,white_0%,transparent_65%)]" />

          <div className="relative z-10">
            <span className="text-white font-black text-xl tracking-tight">
              Simple<span className="text-green-300">Plate</span>
            </span>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
              <PlateIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-white font-black text-2xl leading-snug mb-3">
              Your nutrition,<br />gamified.
            </h2>
            <p className="text-green-200 text-sm leading-relaxed">
              Track meals, build streaks, and earn rewards for eating well.
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-green-400 text-[11px] font-medium">SimplePlate v1.0</p>
          </div>
        </div>

        {/* Right — form panel */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12 relative">

          <Link href="/" className="absolute top-5 left-5 flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors group">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>

          {/* Mobile brand */}
          <div className="md:hidden mb-8">
            <span className="text-slate-900 font-black text-xl">
              Simple<span className="text-[#00b252]">Plate</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to continue your streak.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent transition-all placeholder-slate-400 text-slate-900"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent transition-all placeholder-slate-400 text-slate-900"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-1 rounded-xl text-sm font-black text-white bg-[#00b252] hover:bg-green-700 active:scale-[0.98] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-slate-400 mt-7 pt-6 border-t border-slate-100 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-black text-[#00b252] hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Register() {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("Female");
  
  // Status State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password || !username.trim()) {
      return setError("Please fill in all fields.");
    }

    setIsLoading(true);

    // This is where the magic happens for your SQL Trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          username: username,
          gender: gender,},
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#eaedf0] flex flex-col justify-center p-4 relative font-sans text-slate-800">
      
      {/* ERROR MODAL */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Failed</h3>
            <p className="text-slate-500 text-sm mb-6 px-2">{error}</p>
            <button
              onClick={() => setError("")}
              className="w-full bg-[#27272a] text-white font-bold py-3.5 rounded-2xl hover:bg-black active:scale-[0.98] transition-all shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Block*/}
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10">
      
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Welcome to SimplePlate!</h1>
          <p className="text-slate-500 text-sm mt-1">Register with us now and begin your stress-free journey.</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm text-center font-bold animate-in fade-in zoom-in-95">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-900 placeholder-slate-400"
              placeholder="name@example.com"
            />
          </div>
          
          {/* Username and Name Input */}
          <div className="flex gap-4">
            {/* Username Input */}
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-900 placeholder-slate-400"
                placeholder="Choose a username"
              />
            </div>

            {/* Name Input */}
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-900 placeholder-slate-400"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-900 placeholder-slate-400"
              placeholder="Create a password"
            />
          </div>

          {/* Gender Pill Slider */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Gender</label>
            <div className="bg-slate-50 p-1.5 rounded-2xl flex justify-between items-center border border-slate-200">
              {["Male", "Female"].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    gender === g
                      ? "bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-[#00b252] hover:bg-[#00a049] focus:ring-4 focus:ring-[#00b252]/30 active:scale-[0.98] disabled:opacity-70 transition-all shadow-md shadow-[#00b252]/20"
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 pt-6 border-t border-slate-100">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#00b252] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
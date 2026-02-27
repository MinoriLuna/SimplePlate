"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-100 flex flex-col justify-center p-4 relative">
      {/* Incorrect Details*/}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              
              {/* Alert Icon */}
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login Failed</h3>
              
              {/* Error Message */}
              <p className="text-gray-500 text-sm mb-6 px-2">
                {error === "Invalid login credentials" 
                  ? "The email or password you entered is incorrect. Please check them and try again." 
                  : error}
              </p>
              
              {/* Dismiss Button */}
              <button
                onClick={() => setError("")}
                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Main Content*/}
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-5 sm:p-8">
        <div className="text-center mb-5 p-5">
          <h2 className="text-2xl font-bold text-gray-900">Login to your account</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Input */}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400 text-black"
            placeholder="Email address"
          />
         
          {/* Password */}
          <div className="grid grid-cols gap-3">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400 text-black"
              placeholder="Password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all shadow-sm"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5 pt-4 border-t border-gray-100">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-green-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
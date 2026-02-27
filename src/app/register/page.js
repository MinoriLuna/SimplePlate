"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) return setError("Username is required.");
    if (!gender) return setError("Please select your gender.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (!consent) return setError("You must agree to the privacy policy.");

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-100 flex flex-col justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-5 sm:p-8">
      
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Create your account!</h2>
          <p className="text-xs text-gray-500 mt-1">Start your SimplePlate journey.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          
          {/* Email Input */}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400 text-black"
            placeholder="Email address"
          />

          {/* Username Input */}
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400 text-black"
            placeholder="Username"
          />

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400 text-black"
              placeholder="Password"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400 text-black"
              placeholder="Confirm Password"
            />
          </div>

          {/* Compact Gender Toggle */}
          <div className="flex gap-2 pt-1">
            {["male", "female"].map((g) => (
              <label
                key={g}
                className={`flex-1 text-center py-2 border rounded-xl text-sm font-medium cursor-pointer transition-all capitalize
                  ${gender === g 
                    ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500" 
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={(e) => setGender(e.target.value)}
                  className="sr-only"
                />
                {g}
              </label>
            ))}
          </div>

          {/* Compact Consent */}
          <div className="flex items-start bg-gray-50 p-2.5 rounded-xl border border-gray-200 mt-1">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
            />
            <p className="ml-2 text-[11px] text-gray-500 leading-tight">
              I agree to the minimal data privacy policy for educational tracking.
            </p>
          </div>

          {error && (
            <div className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all shadow-sm"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5 pt-4 border-t border-gray-100">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-green-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
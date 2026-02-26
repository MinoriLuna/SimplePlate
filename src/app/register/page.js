"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Register() {
  const router = useRouter();
  //const [username, setUsername] = useState("");
  //const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!consent) {
      setError("You must agree to the privacy policy.");
      return;
    }

    //Need to add username validation

    setIsLoading(true);

    // Create user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Registration successful, send them to the dashboard
      router.push("/dashboard");
    }
  };

    const genderOptions = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
  ];

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl mx-10 px-7 py-5">   
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-2">Start building healthier habits today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-black font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-black"
              placeholder="you@example.com"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-black font-medium mb-1"> Username </label>
            <input
            className="rounded-xl w-full border px-4 py-3 text-black border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Username"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm text-black font-medium mb-1"> Gender </label>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-black font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-black"
              placeholder="*******"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-black"
              placeholder="*******"
            />
          </div>

          {/* Privacy Consent */}
          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="consent" className="ml-2 text-sm text-gray-600">
              I understand that SimplePlate stores only minimal meal data for educational purposes, and I consent to the privacy policy.
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-green-800 disabled:opacity-70 transition-colors mt-2"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div> 
  );
}
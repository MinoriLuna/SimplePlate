import Link from "next/link";
import { supabase } from "../lib/supabaseClient.js";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-green-800 rounded-2xl m-auto flex items-center justify-center shadow-lg">
            <span className="text-4xl text-white">🥗</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome to <span className="text-green-800">SimplePlate</span>
          </h1>
          <p className="text-lg text-gray-600">
            A gentle, gamified way to build healthier eating habits without the pressure of calorie counting.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <Link 
            href="/register" 
            className="block w-full bg-green-800 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-green-700 transition-colors"
          >
            Get Started
          </Link>
          
          <Link 
            href="/login" 
            className="block w-full bg-white text-green-800 border-2 border-green-800 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors"
          >
            I already have an account
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="pt-8 text-sm text-gray-400">
          <p>Supporting SDG 3: Good Health and Well-being</p>
        </div>

      </div>
    </div>
  );
}
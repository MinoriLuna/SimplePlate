"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  
  // 1. Dynamic State
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    points: 0,
    current_streak: 0,
    pause_streak: false,
    display_numbers: false,
  });
  const [todayMeals, setTodayMeals] = useState([]);

  // 2. Fetch Data on Load
  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch Profile (Including your new Name column)
      const { data: userData, error: profileError } = await supabase
        .from("profiles")
        .select("name, username, points, current_streak, pause_streak, display_numbers")
        .eq("id", session.user.id)
        .single();

      // 🔍 DEBUG: Log what you actually got
      console.log("Profile Data:", userData);
      console.log("Profile Error:", profileError);

      if (userData) {
        setProfile({
          name: userData.name || "",
          username: userData.username || "User",
          points: userData.points || 0,
          current_streak: userData.current_streak || 0,
          pause_streak: userData.pause_streak || false,
          display_numbers: userData.display_numbers || false,
        });
      }

      // Fetch Today's Meals
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: meals } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", startOfDay.toISOString())
        .order("created_at", { ascending: true });

      if (meals) {
        setTodayMeals(meals.map(m => ({
          id: m.id,
          name: m.food_name,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: m.icon || "🍽️"
        })));
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  // Handle local toggle (or you could sync this to DB)
  const [showNumbers, setShowNumbers] = useState(false);

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-bold text-slate-400">
      Loading SimplePlate...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-15 flex flex-col font-sans text-slate-800 selection:bg-green-100">
      <div className="py-6 flex"> </div>
      
      <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        
        {/* WELCOME HEADER */}
        <div className="flex justify-center items-center gap-3 mb-10">
          <Link href="/settings" className="text-slate-400 hover:text-slate-700 hover:rotate-90 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
            Welcome Back, <span className="text-black">{profile.name || profile.username}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Today's Log */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full">
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Today's Log</h2>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {todayMeals.length} meals logged
              </span>
            </div>
            
            <div className="space-y-4 flex-grow">
              {todayMeals.length === 0 ? (
                <p className="text-center py-10 text-slate-400 italic">No meals logged for today yet.</p>
              ) : (
                todayMeals.map((meal) => (
                  <div key={meal.id} className="group flex justify-between items-center bg-slate-50 hover:bg-green-50/50 p-4 rounded-2xl border border-slate-100 hover:border-green-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                        {meal.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{meal.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{meal.time}</p>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-green-500 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </div>
                ))
              )}
            </div>
            
            <Link href="/log-meal" className="mt-6 w-full border-2 border-dashed border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50/30 rounded-2xl py-4 font-medium transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Quick Add Missing Meal
            </Link>
          </div>

          {/* RIGHT COLUMN: Stats */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              
              {/* NOURISH SCORE CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[200px]">
                <button 
                  onClick={() => setShowNumbers(!showNumbers)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors p-2 z-10 bg-slate-50 hover:bg-slate-100 rounded-full"
                >
                  {showNumbers ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  )}
                </button>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${showNumbers ? 'bg-slate-50 text-slate-400' : 'bg-green-50 text-green-500'}`}>
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                
                <h3 className={`text-3xl font-extrabold tracking-tight ${showNumbers ? 'text-slate-800' : 'text-green-500'}`}>
                  {showNumbers ? "85" : "Amazing!"}
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-1">Nourish Score</p>
              </div>

              {/* STREAK CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center group min-h-[200px]">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                </div>
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{profile.current_streak}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Day Streak</p>
                {profile.pause_streak && (
                  <span className="text-green-600 text-[11px] font-bold bg-green-50 px-2.5 py-1 rounded-md mt-3">Protected</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-3">
              <Link href="/log-meal" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-indigo-600 text-white font-semibold py-4 rounded-2xl hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-200">
                Log New Meal
              </Link>
              <button className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-semibold py-4 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all duration-200">
                Check AI Suggestions
              </button>
              <Link href="/history" className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-semibold py-4 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all duration-200">
                View History
              </Link>
              <Link href="/rewards" className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-semibold py-4 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all duration-200">
                Check Rewards ({profile.points} pts)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
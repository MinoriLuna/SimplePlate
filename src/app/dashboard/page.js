"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Fetch Profile Data
      const { data: userData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (userData) {
        setProfile({
          name: userData.name || "Alex",
          username: userData.username || "",
          points: userData.points || 0,
          current_streak: userData.current_streak || 0,
          pause_streak: userData.pause_streak || false,
          display_numbers: userData.display_numbers || false,
        });
      }

      // 2. Fetch Today's Meals with Nourish Score
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: mealsData } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("logged_at", startOfDay.toISOString())
        .order("logged_at", { ascending: true });

      if (mealsData) {
        setTodayMeals(mealsData);
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  // Helper to calculate the average Nourish Score for today
  const calculateAverageScore = () => {
    if (todayMeals.length === 0) return 0;
    const total = todayMeals.reduce((acc, meal) => acc + (meal.nourish_score || 0), 0);
    return (total / todayMeals.length).toFixed(0);
  };

  const getMealIcon = (type) => {
    const icons = { "Breakfast": "🥣", "Lunch": "🥗", "Dinner": "🍱" };
    return icons[type] || "🍽️";
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800">
      <div className="py-10 flex"> </div>
      
      <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        
        {/* WELCOME HEADER */}
        <div className="flex justify-center items-center gap-3 mb-10">
          <Link href="/settings" className="text-slate-400 hover:text-slate-700 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
            Welcome Back, <span className="text-[#00b252]">{profile.name}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Today's Log */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">Today's Log</h2>
            
            <div className="space-y-4 flex-grow">
              {todayMeals.length === 0 ? (
                <div className="text-center py-10 text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No meals logged yet today!
                </div>
              ) : (
                todayMeals.map((meal) => (
                  <div key={meal.id} className="group flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">
                        {getMealIcon(meal.meal_type)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{meal.dish_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Link href="/logmeals" className="mt-6 w-full border-2 border-dashed border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50/30 rounded-2xl py-4 font-medium transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Quick Add Missing Meal
            </Link>
          </div>

          {/* RIGHT COLUMN: Stats & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              
              {/* NOURISH SCORE CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${profile.display_numbers ? 'bg-slate-50 text-slate-400' : 'bg-green-50 text-green-500'}`}>
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className={`text-3xl font-extrabold tracking-tight ${!profile.display_numbers ? 'text-green-500' : 'text-slate-800'}`}>
                  {profile.display_numbers 
                    ? calculateAverageScore() 
                    : "Amazing!"}
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-1">Nourish Score</p>
              </div>

              {/* STREAK CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                </div>
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{profile.current_streak}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Day Streak</p>
                {profile.pause_streak && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-2 uppercase tracking-wider">Protected</span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3">
              <Link href="/logmeals" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-indigo-600 text-white font-semibold py-4 rounded-2xl transition-all hover:shadow-lg">
                Log New Meal
              </Link>
              <Link href="/history" className="w-full py-4 bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-100 text-center">
                View History
              </Link>
              <Link href="/rewards" className="w-full py-4 bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-100 text-center">
                Check Rewards ({profile.points} pts)
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
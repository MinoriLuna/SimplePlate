"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Progress() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({ total_xp: 0, points: 0, current_streak: 0 });
  
  // Weekly totals state
  const [weeklyTotals, setWeeklyTotals] = useState({
    carbs: 0,
    protein: 0,
    fat: 0,
    vitamins: 0
  });

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // 1. Calculate Start of Week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);

      // 2. Fetch all meals from this week
      const { data: meals } = await supabase
        .from("meals")
        .select("carbs_g, protein_g, fat_g, vitamins")
        .eq("user_id", session.user.id)
        .gte("logged_at", startOfWeek.toISOString())
        .lte("logged_at", new Date().toISOString());

      // 3. Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) setProfile(profileData);

      if (meals) {
        // Aggregate all meal data into weekly totals
        const totals = meals.reduce((acc, meal) => ({
          carbs: acc.carbs + (meal.carbs_g || 0),
          protein: acc.protein + (meal.protein_g || 0),
          fat: acc.fat + (meal.fat_g || 0),
          vitamins: acc.vitamins + (meal.vitamins || 0)
        }), { carbs: 0, protein: 0, fat: 0, vitamins: 0 });
        
        setWeeklyTotals(totals);
      }

      setIsLoading(false);
    };
    fetchWeeklyProgress();
  }, [router]);

  // Weekly Targets (Daily Target * 7)
  const weeklyTargets = { 
    carbs: 1750,   // 250g * 7
    protein: 350,  // 50g * 7
    fat: 490,      // 70g * 7
    vitamins: 700  // 100 * 7
  };
  
  const nutrientStats = [
    { 
      nutrient: "Carbs", 
      percentage: Math.min((weeklyTotals.carbs / weeklyTargets.carbs) * 100, 100).toFixed(0), 
      color: "bg-blue-500" 
    },
    { 
      nutrient: "Protein", 
      percentage: Math.min((weeklyTotals.protein / weeklyTargets.protein) * 100, 100).toFixed(0), 
      color: "bg-indigo-600" 
    },
    { 
      nutrient: "Vitamins", 
      percentage: Math.min((weeklyTotals.vitamins / weeklyTargets.vitamins) * 100, 100).toFixed(0), 
      color: "bg-emerald-500" 
    },
    { 
      nutrient: "Fat", 
      percentage: Math.min((weeklyTotals.fat / weeklyTargets.fat) * 100, 100).toFixed(0), 
      color: "bg-amber-500" 
    },
  ];

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const xpInCurrentLevel = (profile.total_xp || 0) % 100;

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Loading Weekly Progress...</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800 pb-10">
      <div className="py-20">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* LEFT COLUMN: COMBINED STATS & WEEKLY NUTRIENTS */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* COMBINED STATS CARD */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rank Status</p>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">Lv. {currentLevel}</h2>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                      {profile.total_xp} Total XP
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000" style={{ width: `${xpInCurrentLevel}%` }} />
                  </div>
                </div>

                <div className="h-px bg-slate-50 mb-6" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</span>
                    <div className="flex items-center gap-1.5 font-black text-blue-600">
                      <span className="text-sm">🎁</span>
                      <span className="text-lg">{profile.points}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</span>
                    <div className="flex items-center gap-1.5 font-black text-orange-500">
                      <span className="text-sm">📅</span>
                      <span className="text-lg">{profile.current_streak}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WEEKLY NUTRIENT PROGRESS */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly Overview</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Nutrients This Week</p>
                </div>
                <div className="space-y-6">
                  {nutrientStats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-end mb-2 px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.nutrient}</span>
                        <span className="text-xs font-black text-slate-900">{stat.percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${stat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI INSIGHTS */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-sm border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">✨</div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Health Insights</h3>
                </div>
                
                {/* Suggestions map goes here */}
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-4">
                    <span className="text-xl">💡</span>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed">
                      Analyzing your weekly totals: You are at {nutrientStats[1].percentage}% of your Protein goal. Try to include more lean meats or legumes in your next few meals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
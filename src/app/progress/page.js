"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Progress() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Data State
  const [profile, setProfile] = useState({ total_xp: 0, points: 0, current_streak: 0 });
  const [weeklyTotals, setWeeklyTotals] = useState({ carbs: 0, protein: 0, fat: 0, vitamins: 0 });
  const [mealsForAi, setMealsForAi] = useState([]);
  
  // AI Results State
  const [aiInsight, setAiInsight] = useState(null);
  const [showAlt, setShowAlt] = useState(false);

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const now = new Date();
      const dayOfWeek = now.getDay(); 
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);

      const [mealsRes, profileRes] = await Promise.all([
        supabase.from("meals").select("*").eq("user_id", session.user.id).gte("logged_at", startOfWeek.toISOString()),
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
      ]);

      if (profileRes.data) setProfile(profileRes.data);

      if (mealsRes.data) {
        setMealsForAi(mealsRes.data.map(m => m.dish_name));
        const totals = mealsRes.data.reduce((acc, meal) => ({
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

  // ACTION: Call AI manually
  const handleGenerateInsight = async () => {
    if (mealsForAi.length === 0) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/analyze-weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: mealsForAi, totals: weeklyTotals }),
      });
      const data = await res.json();
      setAiInsight(data);
    } catch (e) {
      console.error("AI Error:", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const weeklyTargets = { carbs: 1750, protein: 350, fat: 490, vitamins: 700 };
  const nutrientStats = [
    { nutrient: "Carbs", percentage: Math.min((weeklyTotals.carbs / weeklyTargets.carbs) * 100, 100).toFixed(0), color: "bg-blue-500" },
    { nutrient: "Protein", percentage: Math.min((weeklyTotals.protein / weeklyTargets.protein) * 100, 100).toFixed(0), color: "bg-indigo-600" },
    { nutrient: "Vitamins", percentage: Math.min((weeklyTotals.vitamins / weeklyTargets.vitamins) * 100, 100).toFixed(0), color: "bg-emerald-500" },
    { nutrient: "Fat", percentage: Math.min((weeklyTotals.fat / weeklyTargets.fat) * 100, 100).toFixed(0), color: "bg-amber-500" },
  ];

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const xpInCurrentLevel = (profile.total_xp || 0) % 100;

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Loading Weekly Progress...</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800 pb-10">
      <div className="py-20">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rank Status</p>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">Lv. {currentLevel}</h2>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tighter">{profile.total_xp} Total XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000" style={{ width: `${xpInCurrentLevel}%` }} />
                  </div>
                </div>

                <div className="h-px bg-slate-50 mb-6" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</span>
                    <div className="flex items-center gap-1.5 font-black text-blue-600"><span className="text-sm">🎁</span><span className="text-lg">{profile.points}</span></div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</span>
                    <div className="flex items-center gap-1.5 font-black text-orange-500"><span className="text-sm">📅</span><span className="text-lg">{profile.current_streak}</span></div>
                  </div>
                </div>
              </div>

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

            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-sm border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">✨</div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Health Insights</h3>
                </div>
                
                <div className="space-y-4">
                  {!aiInsight ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Analyze your {mealsForAi.length} logs this week</p>
                      <button 
                        onClick={handleGenerateInsight}
                        disabled={isAiLoading || mealsForAi.length === 0}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                      >
                        {isAiLoading ? "Consulting..." : "Generate Analysis"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-4">
                        <span className="text-xl">💡</span>
                        <div>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed">{aiInsight.insight}</p>
                          <p className="mt-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Target: {aiInsight.improvement}</p>
                        </div>
                      </div>

                      {aiInsight.alternative_suggestion && (
                        <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                          <button 
                            onClick={() => setShowAlt(!showAlt)}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"
                          >
                            {showAlt ? "Hide Suggestion" : "Show Healthy Alternative"}
                            <svg className={`w-3 h-3 transform transition-transform ${showAlt ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path></svg>
                          </button>
                          {showAlt && <p className="mt-4 text-sm font-bold text-slate-700">🥗 {aiInsight.alternative_suggestion}</p>}
                        </div>
                      )}
                      
                      <button onClick={() => setAiInsight(null)} className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-400">Clear & Re-analyze</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
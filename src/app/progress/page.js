"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Progress() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false); 
  
  const [profile, setProfile] = useState({ total_xp: 0, points: 0, current_streak: 0 });
  const [weeklyTotals, setWeeklyTotals] = useState({ carbs: 0, protein: 0, fat: 0, vitamins: 0 });
  const [mealsData, setMealsData] = useState([]); 
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
        supabase.from("meals")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("logged_at", startOfWeek.toISOString())
          .order('logged_at', { ascending: true }),
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (mealsRes.data) {
        setMealsData(mealsRes.data);
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

  // --- LOGIC: NUTRIENT COMPOSITION (Relative to total grams) ---
  const totalGrams = (weeklyTotals.carbs + weeklyTotals.protein + weeklyTotals.fat + weeklyTotals.vitamins) || 1;
  
  const nutrientBalance = [
    { name: "Carbs", pct: ((weeklyTotals.carbs / totalGrams) * 100).toFixed(0), col: "bg-blue-500" },
    { name: "Protein", pct: ((weeklyTotals.protein / totalGrams) * 100).toFixed(0), col: "bg-indigo-600" },
    { name: "Fat", pct: ((weeklyTotals.fat / totalGrams) * 100).toFixed(0), col: "bg-amber-500" },
    { name: "Vitamins", pct: ((weeklyTotals.vitamins / totalGrams) * 100).toFixed(0), col: "bg-green-500" },
  ];

  // --- LOGIC: MEAL-SPECIFIC INSIGHTS (Why < 50) ---
  const getQuickInsight = (meal) => {
    let parts = [];
    if (meal.protein_g > 22) parts.push("High Protein");
    else if (meal.protein_g < 8) parts.push("Low Protein");

    if (meal.nourish_score < 50) {
      let reasons = [];
      if (meal.fat_g > 25) reasons.push("high fat");
      if (meal.carbs_g > 80) reasons.push("excess carbs");
      if (meal.vitamins < 30) reasons.push("low vitamins");
      parts.push(`(Reason: ${reasons.join(", ") || "unbalanced"})`);
    }
    return parts.join(" • ");
  };

  // --- LOGIC: CHART FORMATTING ---
  const chartData = mealsData.reduce((acc, meal) => {
    const day = new Date(meal.logged_at).toLocaleDateString('en-US', { weekday: 'short' });
    const existing = acc.find(d => d.day === day);
    if (existing) {
      existing.score = Math.round((existing.score + (meal.nourish_score || 0)) / 2);
    } else {
      acc.push({ day, score: meal.nourish_score || 0 });
    }
    return acc;
  }, []);

  const handleGenerateInsight = async () => {
    if (mealsData.length === 0) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/analyze-weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: mealsData.map(m => m.dish_name), totals: weeklyTotals }),
      });
      const data = await res.json();
      setAiInsight(data);
    } catch (e) { console.error(e); } finally { setIsAiLoading(false); }
  };

  if (isLoading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-xs">Loading Progress...</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800 pb-20">
      <div className="py-20">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Rank Status Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rank Status</p>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">Lv. {Math.floor((profile.total_xp || 0) / 100) + 1}</h2>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tighter">{profile.total_xp} Total XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000" style={{ width: `${(profile.total_xp || 0) % 100}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</span>
                    <div className="flex items-center gap-1.5 font-black text-blue-600"><span className="text-sm">🎁</span><span className="text-lg">{profile.points}</span></div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</span>
                    <div className="flex items-center gap-1.5 font-black text-orange-500"><span className="text-sm">📅</span><span className="text-lg">{profile.current_streak}</span></div>
                  </div>
                </div>
              </div>

              {/* Weekly Overview - Nutrients Composition */}
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-left bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 transition-all hover:border-blue-200 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly Balance</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nutrient Ratios This Week</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <div className="space-y-6">
                  {nutrientBalance.map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-end mb-2 px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.name}</span>
                        <span className="text-xs font-black text-slate-900">{stat.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div className={`h-full ${stat.col} rounded-full transition-all duration-1000`} style={{ width: `${stat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            </div>

            {/* RIGHT COLUMN: AI INSIGHTS */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-sm border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">✨</div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Health Insights</h3>
                </div>
                
                <div className="space-y-4">
                  {!aiInsight ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Analyze your {mealsData.length} logs this week</p>
                      <button 
                        onClick={handleGenerateInsight}
                        disabled={isAiLoading || mealsData.length === 0}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
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
                          <button onClick={() => setShowAlt(!showAlt)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            {showAlt ? "Hide Suggestion" : "Show Healthy Alternative"}
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

          {/* EXPANDED SECTION */}
          {showDetails && (
            <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Nourish Trend</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} dy={15} />
                      <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Line type="monotone" dataKey="score" stroke="#10b80a" strokeWidth={4} dot={{ r: 4, fill: '#10b80a', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Weekly Breakdown</h3>
                <div className="space-y-4">
                  {mealsData.map((meal, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                           <p className="font-black text-slate-900">{meal.dish_name}</p>
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${meal.nourish_score < 50 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                             Score: {meal.nourish_score}
                           </span>
                        </div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                          {getQuickInsight(meal) || "Balanced portion"}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                        {new Date(meal.logged_at).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
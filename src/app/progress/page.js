"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { processRedemption, ownsItem } from "../../lib/rewards";

export default function Progress() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false); 
  
  const [profile, setProfile] = useState({ 
    total_xp: 0, 
    points: 0, 
    current_streak: 0,
    inventory: [] // Added default inventory
  });
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

      // --- FETCHING INVENTORY IN THE JOIN ---
      const [mealsRes, profileRes] = await Promise.all([
        supabase.from("meals")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("logged_at", startOfWeek.toISOString())
          .order('logged_at', { ascending: true }),
        supabase.from("profiles")
          .select(`
            id,
            user_stats (total_xp, points, current_streak, inventory)
          `) // Added inventory here
          .eq("id", session.user.id)
          .single()
      ]);

      if (profileRes.data) {
        setProfile({
          total_xp: Number(profileRes.data.user_stats?.total_xp || 0),
          points: Number(profileRes.data.user_stats?.points || 0),
          current_streak: Number(profileRes.data.user_stats?.current_streak || 0),
          // Logic Fix: Force numbers to prevent F5/BigInt crashes
          inventory: (profileRes.data.user_stats?.inventory || []).map(Number),
        });
      }

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

  const totalGrams = (weeklyTotals.carbs + weeklyTotals.protein + weeklyTotals.fat + weeklyTotals.vitamins) || 1;
  const nutrientBalance = [
    { name: "Carbs", pct: ((weeklyTotals.carbs / totalGrams) * 100).toFixed(0), col: "bg-blue-500" },
    { name: "Protein", pct: ((weeklyTotals.protein / totalGrams) * 100).toFixed(0), col: "bg-indigo-600" },
    { name: "Fat", pct: ((weeklyTotals.fat / totalGrams) * 100).toFixed(0), col: "bg-amber-500" },
    { name: "Vitamins", pct: ((weeklyTotals.vitamins / totalGrams) * 100).toFixed(0), col: "bg-green-500" },
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const rawChartData = mealsData.reduce((acc, meal) => {
    if ((meal.nourish_score || 0) === 0) return acc;
    const day = new Date(meal.logged_at).toLocaleDateString('en-US', { weekday: 'short' });
    const existing = acc.find(d => d.day === day);
    if (existing) {
      existing.sum += meal.nourish_score;
      existing.count += 1;
      existing.score = Math.round(existing.sum / existing.count);
    } else {
      acc.push({ day, score: meal.nourish_score, sum: meal.nourish_score, count: 1 });
    }
    return acc;
  }, []);

  const chartData = daysOfWeek.map(dayName => {
    const dayData = rawChartData.find(d => d.day === dayName);
    return { day: dayName, score: dayData ? dayData.score : 0 };
  });

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

  // Safe check for the Badge (ID 4)
  const hasBadge = ownsItem(profile.inventory, 4);

  if (isLoading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-xs">Loading Progress...</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800 pb-20">
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* LEFT COLUMN */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rank Status</p>
                      <div className="flex items-center gap-2">
                         <h2 className="text-2xl font-black text-slate-900 leading-tight">Lv. {Math.floor((profile.total_xp || 0) / 100) + 1}</h2>
                         {/* --- BADGE RENDERED HERE --- */}
                         {hasBadge && (<img src="/images/goldenbadge.png" alt="Golden Badge" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />)}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tighter">{profile.total_xp} Total XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(profile.total_xp || 0) % 100}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</span>
                    <div className="flex items-center gap-1.5 font-black text-blue-600"><span className="text-sm"></span><span className="text-lg">{profile.points}</span></div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</span>
                    <div className="flex items-center gap-1.5 font-black text-orange-500"><span className="text-sm"></span><span className="text-lg">{profile.current_streak}</span></div>
                  </div>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDetails(!showDetails)} className="w-full text-left bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 transition-all">
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
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stat.pct}%` }} transition={{ duration: 1, delay: 0.3 + index * 0.1 }} className={`h-full ${stat.col} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.button>
            </motion.div>

            {/* RIGHT COLUMN */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-7">
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-sm border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Health Insights</h3>
                </div>
                
                <div className="space-y-4">
                  {!aiInsight ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Analyze your {mealsData.length} logs this week</p>
                      <button onClick={handleGenerateInsight} disabled={isAiLoading || mealsData.length === 0} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                        {isAiLoading ? "Consulting..." : "Generate Analysis"}
                      </button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-4">
                        <span className="text-xl"></span>
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
                          {showAlt && <p className="mt-4 text-sm font-bold text-slate-700"> {aiInsight.alternative_suggestion}</p>}
                        </div>
                      )}
                      <button onClick={() => setAiInsight(null)} className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-400">Clear & Re-analyze</button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -20, height: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="mt-10 space-y-8 overflow-hidden">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Nourish Trend</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} dy={15} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="score" fill="#119c4be0" radius={[10, 10, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Weekly Breakdown</h3>
                  <div className="space-y-4">
                    {mealsData.map((meal, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                        <div className="flex items-center gap-3">
                           <p className="font-black text-slate-900">{meal.dish_name}</p>
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${meal.nourish_score === 0 ? 'bg-slate-100 text-slate-400' : meal.nourish_score < 50 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                             {meal.nourish_score === 0 ? 'Neutral' : `Score: ${meal.nourish_score}`}
                           </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                          {new Date(meal.logged_at).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric' })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
      </main>
    </div>
  );
}
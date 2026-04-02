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
  const [expandedMealId, setExpandedMealId] = useState(null);

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

const getMealIcon = (type) => {
  const normalizedType = type?.trim().toLowerCase();
  const icons = { 
    "breakfast": "/images/breakfast.png", 
    "lunch": "/images/lunch.png", 
    "dinner": "/images/dinner.png" 
  };
  return icons[normalizedType] || "/images/default-meal.png";
};

  if (isLoading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-xs">Loading Progress...</div>;

return (
    <div className="relative min-h-screen font-sans text-slate-800 overflow-x-hidden">
      
      {/* 1. UNIFIED BACKGROUND LAYER */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[#F2FFF5]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent_85%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(#d1fae5_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* LEFT COLUMN: PROFILE & STATS */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }} 
            className="lg:col-span-5 space-y-6"
          >
            {/* Rank & Stats Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl border border-green-200">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rank Status</p>
                    <div className="flex items-center gap-2"> 
                       <h2 className="text-2xl font-black text-slate-900 leading-tight">
                         Lv. {Math.floor((profile.total_xp || 0) / 100) + 1}
                       </h2>
                       {hasBadge && (
                         <img src="/images/goldenbadge.png" alt="Golden Badge" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />
                       )}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                    {profile.total_xp} Total XP
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(profile.total_xp || 0) % 100}%` }} 
                    transition={{ duration: 1.5, ease: "easeOut" }} 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                  />
                </div>
              </div>

              {/* Balance & Streak Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-[#F2FFF5]/50 rounded-[1.5rem] border border-green-100/50 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</span>
                  <div className="flex items-center gap-1.5 font-black text-blue-600">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                    <span className="text-lg">{profile.points}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-[#F2FFF5]/50 rounded-[1.5rem] border border-green-100/50 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</span>
                  <div className="flex items-center gap-1.5 font-black text-orange-500">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-lg">{profile.current_streak}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Balance Toggle Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={() => setShowDetails(!showDetails)} 
              className="w-full text-left bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-xl border border-green-200 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly Balance</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nutrient Ratios This Week</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
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
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${stat.pct}%` }} 
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }} 
                        className={`h-full ${stat.col} rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.button>
          </motion.div>

          {/* RIGHT COLUMN: AI HEALTH INSIGHTS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }} 
            className="lg:col-span-7"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 lg:p-10 shadow-xl border border-green-200 h-full">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🧠</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Health Insights</h3>
              </div>
              
              <div className="space-y-4">
                {!aiInsight ? (
                  <div className="py-12 text-center border-2 border-dashed border-green-100 rounded-[2rem] bg-[#F2FFF5]/30">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                      Analyze your {mealsData.length} logs this week
                    </p>
                    <button 
                      onClick={handleGenerateInsight} 
                      disabled={isAiLoading || mealsData.length === 0} 
                      className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isAiLoading ? "Consulting AI..." : "Generate Analysis"}
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    {/* Insight & Goal Card */}
                    <div className="p-6 bg-[#F2FFF5]/80 rounded-[2rem] border border-green-200 flex gap-4">
                      <span className="text-xl">✨</span>
                      <div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{aiInsight.insight}"</p>
                        <div className="mt-4 p-3 bg-white/50 rounded-xl inline-block border border-green-100/50">
                           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                             Goal: {aiInsight.improvement}
                           </p>
                        </div>
                      </div>
                    </div>

                    {/* AI ALTERNATIVES GRID */}
                    {aiInsight.alternative_suggestion && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <span>⚡</span> Healthy Additions
                          </h4>
                          <p className="text-xs font-bold text-slate-600 leading-snug">
                            {aiInsight.alternative_suggestion.power_up}
                          </p>
                        </div>

                        <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                          <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <span>🪄</span> Fun Alternatives
                          </h4>
                          <p className="text-xs font-bold text-slate-600 leading-snug">
                            {aiInsight.alternative_suggestion.flavor_swap}
                          </p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setAiInsight(null)} 
                      className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      ← Exit Analysis
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* EXPANDABLE HISTORY & CHART SECTION */}
        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: "auto" }} 
              exit={{ opacity: 0, y: -20, height: 0 }} 
              transition={{ duration: 0.5, ease: "easeInOut" }} 
              className="mt-10 space-y-8"
            >
              {/* Trend Chart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-sm border border-green-200">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Nourish Trend</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} dy={15} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="score" fill="#00b252" radius={[10, 10, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Breakdown and Expandable Details */}
              <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-sm border border-green-200 max-w-3xl align-center mx-auto">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Weekly Breakdown</h3>
                <div className="space-y-4">
                  {mealsData.map((meal, i) => {
                    const isExpanded = expandedMealId === i;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.05 }} 
                        key={i} 
                        className={`overflow-hidden transition-all duration-300 border rounded-2xl ${
                          isExpanded ? 'bg-white border-green-400 shadow-md' : 'bg-[#F2FFF5]/30 border-green-200'
                        }`}
                      >
                        {/* Summary Row */}
                        <button 
                          onClick={() => setExpandedMealId(isExpanded ? null : i)}
                          className="w-full flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 text-left"
                        >
                          <div className="flex items-center gap-4">
                            {/* Meal Logo */}
                            <div className="w-12 h-12 flex-shrink-0 bg-white rounded-xl shadow-sm border border-green-100 flex items-center justify-center p-2">
                              <img 
                                src={getMealIcon(meal.meal_type)} 
                                alt={meal.meal_type} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            
                            <div>
                              <p className="font-black text-slate-900 leading-tight">{meal.dish_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{meal.meal_type}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                                  meal.nourish_score === 0 ? 'bg-slate-100 text-slate-400' : 
                                  meal.nourish_score < 50 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {meal.nourish_score === 0 ? 'Neutral' : `Score: ${meal.nourish_score}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                              {new Date(meal.logged_at).toLocaleDateString('en-MY', { day: 'numeric', weekday: 'long',  })}
                            </p>
                            <div className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        </button>

                        {/* Macro Breakdown Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-6 pb-6 border-t border-green-50 bg-slate-50/50"
                            >
                              <div className="pt-5 grid grid-cols-4 gap-4">
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carbs</p>
                                  <p className="text-sm font-black text-blue-600">{meal.carbs_g}g</p>
                                </div>
                                <div className="text-center border-x border-slate-200">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Protein</p>
                                  <p className="text-sm font-black text-emerald-600">{meal.protein_g}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fat</p>
                                  <p className="text-sm font-black text-orange-500">{meal.fat_g}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vitamins</p>
                                  <p className="text-sm font-black text-green-600">{meal.vitamins}mg</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
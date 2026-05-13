"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ownsItem } from "../../lib/rewards";
import { BrainIcon, SparkIcon, LightningIcon, WandIcon, FireIcon } from "../../components/icons/Icons";
import NourishScoreModal from "@/components/NourishScoreModal";

export default function Progress() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [profile, setProfile] = useState({ total_xp: 0, points: 0, current_streak: 0, inventory: [] });
  const [weeklyTotals, setWeeklyTotals] = useState({ carbs: 0, protein: 0, fat: 0, vitamins: 0 });
  const [mealsData, setMealsData] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [expandedMealId, setExpandedMealId] = useState(null);
  const [displayNumbers, setDisplayNumbers] = useState(true);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

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
        supabase.from("meals").select("*").eq("user_id", session.user.id).gte("logged_at", startOfWeek.toISOString()).order("logged_at", { ascending: true }),
        supabase.from("profiles").select("id, user_stats (total_xp, points, current_streak, inventory), user_settings (display_numbers)").eq("id", session.user.id).single(),
      ]);

      if (profileRes.data) {
        setProfile({
          total_xp: Number(profileRes.data.user_stats?.total_xp || 0),
          points: Number(profileRes.data.user_stats?.points || 0),
          current_streak: Number(profileRes.data.user_stats?.current_streak || 0),
          inventory: (profileRes.data.user_stats?.inventory || []).map(Number),
        });
        setDisplayNumbers(profileRes.data.user_settings?.display_numbers ?? true);
      }

      if (mealsRes.data) {
        setMealsData(mealsRes.data);
        const totals = mealsRes.data.reduce((acc, meal) => ({
          carbs: acc.carbs + (meal.carbs_g || 0),
          protein: acc.protein + (meal.protein_g || 0),
          fat: acc.fat + (meal.fat_g || 0),
          vitamins: acc.vitamins + (meal.vitamins || 0),
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
    { name: "Protein", pct: ((weeklyTotals.protein / totalGrams) * 100).toFixed(0), col: "bg-indigo-500" },
    { name: "Fat", pct: ((weeklyTotals.fat / totalGrams) * 100).toFixed(0), col: "bg-amber-500" },
    { name: "Vitamins", pct: ((weeklyTotals.vitamins / totalGrams) * 100).toFixed(0), col: "bg-teal-500" },
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const rawChartData = mealsData.reduce((acc, meal) => {
    if ((meal.nourish_score || 0) === 0) return acc;
    const day = new Date(meal.logged_at).toLocaleDateString("en-US", { weekday: "short" });
    const existing = acc.find(d => d.day === day);
    if (existing) {
      existing.sum += meal.nourish_score; existing.count += 1;
      existing.score = Math.round(existing.sum / existing.count);
    } else {
      acc.push({ day, score: meal.nourish_score, sum: meal.nourish_score, count: 1 });
    }
    return acc;
  }, []);
  const chartData = daysOfWeek.map(dayName => {
    const d = rawChartData.find(d => d.day === dayName);
    return { day: dayName, score: d ? d.score : 0 };
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

  const getNutrientLabel = (pct) => {
    if (pct >= 60) return "High";
    if (pct >= 30) return "Moderate";
    if (pct >= 10) return "Low";
    return "Minimal";
  };


  const hasBadge = ownsItem(profile.inventory, 4);
  const getMealIcon = (type) => {
    const icons = { breakfast: "/images/breakfast.png", lunch: "/images/lunch.png", dinner: "/images/dinner.png" };
    return icons[type?.trim().toLowerCase()] || "/images/default-meal.png";
  };

  if (isLoading) return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
        <span className="text-2xl font-black text-slate-900">Simple<span className="text-[#00b252]">Plate</span></span>
      </motion.div>
      <p className="mt-4 text-[10px] font-black text-[#00b252] uppercase tracking-[0.4em] animate-pulse">Loading Progress...</p>
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-slate-800 no-scrollbar">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-5 lg:px-8 py-5">
        <h1 className="text-xl font-black text-slate-900">Progress</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Your weekly nutrition overview and AI insights.</p>
      </div>

      <div className="p-5 lg:p-8 space-y-6">

        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: Stats */}
          <div className="lg:col-span-5 space-y-4">

            {/* Level & Stats Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rank Status</p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900">Lv. {Math.floor((profile.total_xp || 0) / 100) + 1}</h2>
                    {hasBadge && <img src="/images/goldenbadge.png" alt="Badge" className="w-8 h-8 object-contain" />}
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#00b252] bg-green-50 px-2.5 py-2 rounded-lg uppercase tracking-tighter">
                  {profile.total_xp} Total XP
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000" style={{ width: `${(profile.total_xp || 0) % 100}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Balance</p>
                  <p className="font-black text-[#00b252] text-lg">{profile.points}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Streak</p>
                  <p className="font-black text-orange-500 text-lg flex items-center justify-center gap-1">
                    {profile.current_streak}
                    <FireIcon className="w-4 h-4 text-orange-500" />
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly Balance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Weekly Balance</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nutrient Ratios</p>
                </div>
              </div>
              <div className="space-y-6">
                {nutrientBalance.map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1 px-0.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.name}</span>
                      <span className="text-xs font-black text-slate-900">{displayNumbers ? `${stat.pct}%` : getNutrientLabel(Number(stat.pct))}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.col} transition-all duration-1000 rounded-full`} style={{ width: `${stat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: AI Insights */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <BrainIcon className="w-5 h-5 text-[#00b252]" />
                </div>
                <h3 className="text-base font-black text-slate-900">AI Health Insights</h3>
              </div>

              <AnimatePresence mode="wait">
                {!aiInsight ? (
                  <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Analyze your {displayNumbers ? `${mealsData.length} logs` : "meals"} this week
                    </p>
                    <button
                      onClick={handleGenerateInsight}
                      disabled={isAiLoading || mealsData.length === 0}
                      className="bg-[#00b252] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isAiLoading ? "Consulting AI..." : "Generate Analysis"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="res" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-4">
                      <SparkIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{aiInsight.insight}"</p>
                        <div className="mt-2 px-3 py-1.5 bg-white rounded-xl inline-block border border-green-100">
                          <p className="text-[10px] font-black text-[#00b252] uppercase tracking-widest">Goal: {aiInsight.improvement}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <LightningIcon className="w-4 h-4" /> Healthy Additions
                        </h4>
                        <p className="text-xs font-bold text-slate-600 leading-snug">{aiInsight?.alternative_suggestion?.power_up || "Try adding more nutrients!"}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <WandIcon className="w-4 h-4" /> Fun Alternatives
                        </h4>
                        <p className="text-xs font-bold text-slate-600 leading-snug">{aiInsight?.alternative_suggestion?.flavor_swap || "Mix up with healthier alternatives!"}</p>
                      </div>
                    </div>
                    <button onClick={() => setAiInsight(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">← Exit Analysis</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Chart + Weekly Breakdown side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {showScoreInfo && <NourishScoreModal onClose={() => setShowScoreInfo(false)} />}

          {/* Chart */}
          <div className={`${displayNumbers ? "lg:col-span-5" : "lg:col-span-12"} bg-white rounded-2xl border border-slate-200 shadow-sm p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900">Nourish Trend This Week</h3>
              <button onClick={() => setShowScoreInfo(true)} className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <span className="text-slate-500 text-[10px] font-black">?</span>
              </button>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "900" }} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)" }} />
                  <Bar dataKey="score" fill="#00b252" radius={[8, 8, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Breakdown */}
          {displayNumbers && <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-h-[340px] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-black text-slate-900 mb-3">Weekly Breakdown</h3>
            {mealsData.length === 0 ? (
              <p className="py-10 text-center text-slate-400 text-sm italic">No meals logged this week.</p>
            ) : (
              <div className="space-y-2">
                {mealsData.map((meal, i) => {
                  const isExpanded = expandedMealId === i;
                  return (
                    <div key={i} className={`overflow-hidden rounded-xl border transition-all ${isExpanded ? "border-green-200 shadow-sm" : "border-slate-100"}`}>
                      <button onClick={() => setExpandedMealId(isExpanded ? null : i)} className="w-full flex items-center justify-between p-3 gap-3 text-left bg-slate-50 hover:bg-white transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 flex-shrink-0 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center p-1">
                            <img src={getMealIcon(meal.meal_type)} alt={meal.meal_type} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm truncate">{meal.dish_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{meal.meal_type}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                meal.nourish_score === 0 ? "bg-slate-100 text-slate-400"
                                : meal.nourish_score < 25 ? "bg-red-50 text-red-500"
                                : meal.nourish_score < 50 ? "bg-amber-50 text-amber-600"
                                : meal.nourish_score < 80 ? "bg-blue-50 text-blue-600"
                                : "bg-emerald-50 text-emerald-600"
                              }`}>
                                {meal.nourish_score}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block">{new Date(meal.logged_at).toLocaleDateString("en-MY", { day: "numeric", weekday: "short" })}</p>
                          <div className={`text-slate-300 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-slate-100 bg-white overflow-hidden">
                            <div className="p-3 grid grid-cols-4 gap-2">
                              <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carbs</p><p className="text-sm font-black text-blue-600">{meal.carbs_g}g</p></div>
                              <div className="text-center border-x border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Protein</p><p className="text-sm font-black text-indigo-500">{meal.protein_g}g</p></div>
                              <div className="text-center border-r border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fat</p><p className="text-sm font-black text-amber-500">{meal.fat_g}g</p></div>
                              <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vitamins</p><p className="text-sm font-black text-teal-600">{meal.vitamins}mg</p></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>}
        </div>
      </div>
    </div>
  );
}

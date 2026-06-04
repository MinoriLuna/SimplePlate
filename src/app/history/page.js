"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [displayNumbers, setDisplayNumbers] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [activityDays, setActivityDays] = useState(new Set());
  const [mealHistory, setMealHistory] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [expandedMealId, setExpandedMealId] = useState(null);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const year = viewDate.getFullYear();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const uid = session.user.id;
      setUserId(uid);
      const [profileRes, settingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("user_settings").select("display_numbers").eq("id", uid).single(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (settingsRes.data) setDisplayNumbers(settingsRes.data.display_numbers ?? true);
      setIsLoading(false);
    };
    initPage();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const fetchMonthHighlights = async () => {
      const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
      const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const { data } = await supabase.from("meals").select("logged_at").eq("user_id", userId).gte("logged_at", start).lte("logged_at", end); 
      //Get meals thats gte than the start date
      if (data) setActivityDays(new Set(data.map(m => m.logged_at.split("T")[0])));
    };
    fetchMonthHighlights();
  }, [viewDate, userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchDailyRecords = async () => {
      setIsLoadingData(true);
      const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate); end.setHours(23, 59, 59, 999);
      const { data: meals } = await supabase.from("meals").select("*").eq("user_id", userId).gte("logged_at", start.toISOString()).lte("logged_at", end.toISOString()).order("logged_at", { ascending: false });
      const { data: redemptions } = await supabase.from("redemptions").select("redeemed_at, rewards (title, cost)").eq("user_id", userId).gte("redeemed_at", start.toISOString()).lte("redeemed_at", end.toISOString()).order("redeemed_at", { ascending: false });
      setMealHistory(meals || []);
      setRedemptionHistory(redemptions || []);
      setIsLoadingData(false);
    };
    fetchDailyRecords();
  }, [selectedDate, userId]);

  return (
    <div className="min-h-screen font-sans text-slate-800 no-scrollbar">
      <AnimatePresence mode="wait">
        {isLoading || !profile ? (
          // Show nothing during loading — AppShell shows transition overlay instead
          null
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

            {/* Page Header */}
            <div className="bg-white border-b border-slate-100 px-5 lg:px-8 py-5">
              <h1 className="text-xl font-black text-slate-900">History</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Browse your past meal logs and rewards.</p>
            </div>

            <div className="p-6 lg:p-8 space-y-8">

              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900">{monthName} {year}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Click a day to view logs</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={prevMonth} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all active:scale-90 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextMonth} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all active:scale-90 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-11 gap-2.5">
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split("T")[0];
                    const hasData = activityDays.has(dateStr);
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`relative h-12 w-full rounded-xl flex items-center justify-center transition-all border pop-card
                          ${hasData ? "bg-green-50 border-green-200" : "bg-slate-50 border-transparent"}
                          ${isSelected ? "ring-2 ring-[#00b252] ring-offset-2 scale-105 z-10" : ""}
                        `}
                      >
                        <span className={`text-xs font-black ${hasData ? "text-green-700" : "text-slate-400"}`}>{day}</span>
                        {hasData && <div className="absolute bottom-1.5 w-1 h-1 bg-[#00b252] rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Records Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Meal Records */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-900">Meal Records</h2>
                  </div>
                  <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                    {isLoadingData ? (
                      <div className="py-10 text-center animate-pulse font-bold text-slate-400 text-sm">Fetching records...</div>
                    ) : mealHistory.length === 0 ? (
                      <p className="py-10 text-center text-slate-400 text-sm italic">No meals logged for this day.</p>
                    ) : (
                      mealHistory.map(meal => {
                        const score = meal.nourish_score || 0;
                        const scoreBadge = score === 0 ? null
                          : score < 25 ? { bg: "bg-red-50", text: "text-red-500" }
                          : score < 50 ? { bg: "bg-amber-50", text: "text-amber-600" }
                          : score < 80 ? { bg: "bg-blue-50", text: "text-blue-600" }
                          : { bg: "bg-emerald-50", text: "text-emerald-600" };
                        const isExpanded = expandedMealId === meal.id;
                        return (
                          <div key={meal.id} className="bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all overflow-hidden">
                            <button
                              onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                              className="w-full flex justify-between items-center p-4 text-left"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center p-1.5 border border-slate-100 flex-shrink-0">
                                  <img src={`/images/${meal.meal_type?.toLowerCase()}.png`} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 text-sm truncate">{meal.dish_name}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{meal.meal_type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {scoreBadge && displayNumbers && (
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${scoreBadge.bg} ${scoreBadge.text}`}>
                                    {score}
                                  </span>
                                )}
                                <p className="text-[10px] font-bold text-slate-400">
                                  {new Date(meal.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                              </div>
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                                <p className="text-xs text-slate-500 leading-relaxed pt-3">
                                  {meal.score_note || "No note available. Log a new meal to see AI feedback here."}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Redemption History */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-900">Redemption History</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    {isLoadingData ? (
                      <div className="py-10 text-center animate-pulse font-bold text-slate-400 text-sm">Updating list...</div>
                    ) : redemptionHistory.length === 0 ? (
                      <div className="py-14 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm italic">
                        No items redeemed on this day.
                      </div>
                    ) : (
                      redemptionHistory.map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{log.rewards?.title}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                              {new Date(log.redeemed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl text-sm font-black text-[#00b252] flex-shrink-0">
                            -{log.rewards?.cost} pts
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

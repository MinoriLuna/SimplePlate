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
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [activityDays, setActivityDays] = useState(new Set());
  const [mealHistory, setMealHistory] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const year = viewDate.getFullYear();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(profileData);
      setIsLoading(false);
    };
    initPage();
  }, [router]);

  useEffect(() => {
    const fetchMonthHighlights = async () => {
      const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
      const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const { data } = await supabase.from("meals").select("logged_at").gte("logged_at", start).lte("logged_at", end);
      if (data) setActivityDays(new Set(data.map(m => m.logged_at.split("T")[0])));
    };
    fetchMonthHighlights();
  }, [viewDate]);

  useEffect(() => {
    const fetchDailyRecords = async () => {
      setIsLoadingData(true);
      const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate); end.setHours(23, 59, 59, 999);
      const { data: meals } = await supabase.from("meals").select("*").gte("logged_at", start.toISOString()).lte("logged_at", end.toISOString()).order("logged_at", { ascending: false });
      const { data: redemptions } = await supabase.from("redemptions").select("redeemed_at, rewards (title, cost)").gte("redeemed_at", start.toISOString()).lte("redeemed_at", end.toISOString()).order("redeemed_at", { ascending: false });
      setMealHistory(meals || []);
      setRedemptionHistory(redemptions || []);
      setIsLoadingData(false);
    };
    fetchDailyRecords();
  }, [selectedDate]);

  return (
    <div className="min-h-screen font-sans text-slate-800 no-scrollbar">
      <AnimatePresence mode="wait">
        {isLoading || !profile ? (
          <motion.div key="loader" exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <span className="text-2xl font-black text-slate-900">Simple<span className="text-[#00b252]">Plate</span></span>
            </motion.div>
            <p className="mt-4 text-[10px] font-black text-[#00b252] uppercase tracking-[0.4em] animate-pulse">Loading history...</p>
          </motion.div>
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
                      mealHistory.map(meal => (
                        <div key={meal.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center p-1.5 border border-slate-100">
                              <img src={`/images/${meal.meal_type?.toLowerCase()}.png`} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{meal.dish_name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{meal.meal_type}</p>
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 flex-shrink-0">
                            {new Date(meal.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ))
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

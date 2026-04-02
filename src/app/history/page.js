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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [activityDays, setActivityDays] = useState(new Set()); 
  const [mealHistory, setMealHistory] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);

  //Calendar Consts
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  // Fetch Data
  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      setIsLoading(false);
    };
    initPage();
  }, [router]);

  useEffect(() => {
    const fetchMonthHighlights = async () => {
      const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
      const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data } = await supabase
        .from("meals")
        .select("logged_at")
        .gte("logged_at", start)
        .lte("logged_at", end);

      if (data) {
        setActivityDays(new Set(data.map(m => m.logged_at.split('T')[0])));
      }
    };
    fetchMonthHighlights();
  }, [viewDate]);

  useEffect(() => {
    const fetchDailyRecords = async () => {
      setIsLoadingData(true);
      const start = new Date(selectedDate);
      start.setHours(0,0,0,0);
      const end = new Date(selectedDate);
      end.setHours(23,59,59,999);

      const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .gte("logged_at", start.toISOString())
        .lte("logged_at", end.toISOString())
        .order("logged_at", { ascending: false });

      const { data: redemptions } = await supabase
        .from("redemptions")
        .select(`redeemed_at, rewards (title, cost)`)
        .gte("redeemed_at", start.toISOString())
        .lte("redeemed_at", end.toISOString())
        .order("redeemed_at", { ascending: false });

      setMealHistory(meals || []);
      setRedemptionHistory(redemptions || []);
      setIsLoadingData(false);
    };
    fetchDailyRecords();
  }, [selectedDate]);

  return (
    <div className="relative min-h-screen font-sans text-slate-800 no-scrollbar">

      <AnimatePresence mode="wait">
        {isLoading || !profile ? (
          <motion.div key="loader" exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#F2FFF5] flex flex-col items-center justify-center">
            <img src="/images/logo.png" alt="Logo" className="w-16 h-16 animate-pulse" />
          </motion.div>
        ) : (

          <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28">
            
            {/* Calander */}
            <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl border border-green-200">
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {monthName} {year}
                  </h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Click a day to view logs
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-2 bg-slate-50 hover:bg-white border border-slate-100 rounded-lg transition-all active:scale-90">
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={nextMonth} className="p-2 bg-slate-50 hover:bg-white border border-slate-100 rounded-lg transition-all active:scale-90">
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-11 gap-4">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  const dateStr = dateObj.toISOString().split('T')[0];
                  const hasData = activityDays.has(dateStr);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`
                        relative h-9 w-full rounded-xl flex items-center justify-center transition-all duration-300 pop-card border
                        ${hasData ? 'bg-green-50 border-green-200' : 'bg-slate-50/50 border-transparent'}
                        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 z-10' : ''}
                      `}
                    >
                      <span className={`text-xs font-black ${hasData ? 'text-green-700' : 'text-slate-400'}`}>
                        {day}
                      </span>
                      {hasData && (
                        <div className="absolute bottom-1.5 w-1 h-1 bg-green-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meal Records */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-xl border border-green-200 p-8 overflow-y-auto custom-scrollbar max-h-[400px]">
                <h2 className="text-xl font-black text-slate-900 mb-6">Meal Records</h2>
                <div className="space-y-4">
                  {isLoadingData ? <div className="py-10 text-center animate-pulse font-bold text-slate-400">Fetching records...</div> :
                    mealHistory.length === 0 ? <p className="py-10 text-center text-slate-400 italic text-sm">No meals logged for this day.</p> :
                    mealHistory.map(meal => (
                      <div key={meal.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 border border-slate-100">
                            <img src={`/images/${meal.meal_type?.toLowerCase()}.png`} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{meal.dish_name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{meal.meal_type}</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Redemption Records */}
              <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-xl border border-green-200 p-8">
                <h2 className="text-xl font-black text-slate-900 mb-6">Redemption History</h2>
                <div className="space-y-4">
                  {isLoadingData ? <div className="py-10 text-center animate-pulse font-bold text-slate-400">Updating list...</div> :
                    redemptionHistory.length === 0 ? <div className="py-14 text-center bg-slate-50/50 rounded-[1.5rem] border border-dashed border-slate-200 text-slate-400 italic text-sm">No items redeemed on this day.</div> :
                    redemptionHistory.map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{log.rewards?.title}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Bought at {new Date(log.redeemed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm text-sm font-black text-blue-600">
                          -{log.rewards?.cost} pts
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </main>
        )}
      </AnimatePresence>
    </div>
  );
}
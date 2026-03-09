"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Reports() {
  const router = useRouter();
  
  const dateInputRefLeft = useRef(null);
  const dateInputRefRight = useRef(null);
  
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(true);
  
  const [loggingHistory, setLoggingHistory] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]); 

  // SPLIT STATE: Independent dates for each column
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [redemptionDate, setRedemptionDate] = useState(new Date().toISOString().split('T')[0]);

  // Helper to format dates for display
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  // EFFECT 1: Fetch Meals when mealDate changes
  useEffect(() => {
    const fetchMeals = async () => {
      setIsLoadingMeals(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const start = new Date(mealDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(mealDate);
      end.setHours(23, 59, 59, 999);

      const { data } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("logged_at", start.toISOString())
        .lte("logged_at", end.toISOString())
        .order("logged_at", { ascending: false });

      if (data) {
        setLoggingHistory(data.map(m => ({
          id: m.id,
          name: m.dish_name,
          portion: m.portion_size,
          type: m.meal_type,
          time: new Date(m.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
      setIsLoadingMeals(false);
    };
    fetchMeals();
  }, [mealDate, router]);

  // EFFECT 2: Fetch Redemptions when redemptionDate changes
  useEffect(() => {
    const fetchRedemptions = async () => {
      setIsLoadingRedemptions(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const start = new Date(redemptionDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(redemptionDate);
      end.setHours(23, 59, 59, 999);

      const { data } = await supabase
        .from("redemptions")
        .select(`redeemed_at, rewards (title, cost)`)
        .eq("user_id", session.user.id)
        .gte("redeemed_at", start.toISOString())
        .lte("redeemed_at", end.toISOString())
        .order("redeemed_at", { ascending: false });

      if (data) setRedemptionHistory(data);
      setIsLoadingRedemptions(false);
    };
    fetchRedemptions();
  }, [redemptionDate]);

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] flex flex-col font-sans text-slate-800">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold text-sm transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Dashboard
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900">Reports & History</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:py-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: MEAL RECORDS */}
          <div className="lg:col-span-5 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 lg:sticky lg:top-28">
            <h2 className="text-2xl font-extrabold text-slate-900">Meal Records</h2>
            <div className="relative mt-3 mb-6">
              <input type="date" ref={dateInputRefLeft} value={mealDate} onChange={(e) => setMealDate(e.target.value)} className="absolute opacity-0 pointer-events-none" />
              <button onClick={() => dateInputRefLeft.current?.showPicker()} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-all w-full text-sm">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                {formatDate(mealDate)}
                <svg className="w-4 h-4 ml-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingMeals ? <p className="text-center py-10 text-slate-400 animate-pulse font-bold">Loading meals...</p> : 
               loggingHistory.length === 0 ? <p className="text-center py-10 text-slate-400 italic font-bold">No meals for this date.</p> : 
               loggingHistory.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden">
                      <img src={`/images/${item.type?.toLowerCase()}.png`} alt="" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{item.portion}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: REDEMPTION HISTORY */}
          <div className="lg:col-span-7 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-10 min-h-[500px]">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-extrabold text-slate-900">Redemption History</h2>
              <div className="relative">
                <input type="date" ref={dateInputRefRight} value={redemptionDate} onChange={(e) => setRedemptionDate(e.target.value)} className="absolute opacity-0 pointer-events-none" />
                <button onClick={() => dateInputRefRight.current?.showPicker()} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-all text-xs">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                  {formatDate(redemptionDate)}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {isLoadingRedemptions ? <p className="text-center py-10 text-slate-400 animate-pulse font-bold">Loading activity...</p> : 
               redemptionHistory.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                   <p className="text-slate-400 italic font-bold">No redemptions for this date.</p>
                </div>
              ) : (
                redemptionHistory.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{log.rewards?.title}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                         Bought at {new Date(log.redeemed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                      <span className="text-sm font-black text-blue-600">-{log.rewards?.cost} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
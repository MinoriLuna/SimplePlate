"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Reports() {
  const router = useRouter();
  const dateInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [loggingHistory, setLoggingHistory] = useState([]);
  
  // Store raw date string (YYYY-MM-DD) for state management
  const [rawDate, setRawDate] = useState(new Date().toISOString().split('T')[0]);

  // Format date for display
  const displayDate = new Date(rawDate).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Placeholder for AI-based metrics
  const weeklyProgress = [
    { nutrient: "Carbs", percentage: 25, color: "bg-purple-500" },
    { nutrient: "Protein", percentage: 50, color: "bg-purple-600" },
    { nutrient: "Vitamins", percentage: 20, color: "bg-purple-400" },
    { nutrient: "Fiber", percentage: 80, color: "bg-purple-700" },
    { nutrient: "Iron", percentage: 10, color: "bg-purple-300" },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Fetch User Settings
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_numbers")
        .eq("id", session.user.id)
        .single();
      
      if (profile) setShowNumbers(profile.display_numbers);

      // 2. Fetch Meal History for the Selected Date
      const startOfDay = new Date(rawDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(rawDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("logged_at", startOfDay.toISOString())
        .lte("logged_at", endOfDay.toISOString())
        .order("logged_at", { ascending: false });

      if (meals) {
        const formattedMeals = meals.map(m => ({
          id: m.id,
          name: m.dish_name,
          portion: m.portion_size,
          type: m.meal_type, // Added to determine the correct image
          time: new Date(m.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setLoggingHistory(formattedMeals);
      } else {
        setLoggingHistory([]);
      }
      
      setIsLoading(false);
    };

    fetchHistory();
  }, [router, rawDate]); 

  const handleDateButtonClick = () => {
    dateInputRef.current?.showPicker(); // Opens the native calendar
  };

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

      {/* Main Content Grid */}
      <div className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:py-10 pb-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* --- LEFT COLUMN: LOGGING HISTORY --- */}
          <div className="lg:col-span-5 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 lg:sticky lg:top-28">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Logging History</h2>
              
              {/* Functional Date Selector */}
              <div className="relative mt-3">
                <input 
                  type="date"
                  ref={dateInputRef}
                  value={rawDate}
                  onChange={(e) => setRawDate(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
                <button 
                  onClick={handleDateButtonClick}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                  {displayDate}
                  <svg className="w-4 h-4 ml-auto sm:ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {isLoading ? (
                <p className="text-center py-10 text-slate-400 animate-pulse">Checking logs...</p>
              ) : loggingHistory.length === 0 ? (
                <p className="text-center py-10 text-slate-400 italic font-medium">No meals logged for this date.</p>
              ) : (
                loggingHistory.map((item) => (
                  <div key={item.id} className="group flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Inserted Image Logic Here */}
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden">
                        <img 
                          src={`/images/${item.type?.toLowerCase() || 'breakfast'}.png`} 
                          alt={item.type} 
                          className="w-7 h-7 object-contain" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{item.portion}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: WEEKLY PROGRESS --- */}
          <div className="lg:col-span-7 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-10">
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Weekly Progress</h2>
                <p className="text-slate-500 text-sm">A soft overview of your nutrient intake.</p>
              </div>
              
              <button 
                onClick={() => setShowNumbers(!showNumbers)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${showNumbers ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
              >
                {showNumbers ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                )}
              </button>
            </div>

            <div className="space-y-8">
              {weeklyProgress.map((stat, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-700 text-sm tracking-wide">{stat.nutrient}</span>
                    <span className="text-xs font-bold text-slate-400">{showNumbers ? `${stat.percentage}%` : "Good"}</span>
                  </div>
                  
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
                    <div 
                      className={`h-full ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${stat.percentage}%` }}
                    >
                      <div className="w-full h-full bg-white/20"></div>
                    </div>
                  </div>
                  
                  {stat.percentage < 25 && (
                    <p className="text-xs font-semibold text-amber-500 mt-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Consider adding more to your next meal!
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
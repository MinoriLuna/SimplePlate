"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ownsItem } from "../../lib/rewards";
import StreakWarningModal from "@/components/streakwarningmodal";
import { StreakCount } from "../../lib/streak";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    points: 0,
    current_streak: 0,
    pause_streak: false,
    display_numbers: false,
    total_xp: 0,
    inventory: [],
  });
  const [todayMeals, setTodayMeals] = useState([]);
  const [weeklyAvgScore, setWeeklyAvgScore] = useState(0);
  const [weeklyMealCount, setWeeklyMealCount] = useState(0);
  const [showStreakModal, setShowStreakModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        // 1. Fetch Profile ,Stats, Settings and Streak Check
        await StreakCount(supabase, session.user.id);
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select(`
            name, 
            username, 
            user_stats (points, current_streak, pause_streak, total_xp, inventory, lastchecked),
            user_settings (display_numbers)
          `)
          .eq("id", session.user.id)
          .single();

        if (userError) throw userError;

        if (userData) {
          setProfile({
            name: userData.name || "User",
            username: userData.username || "",
            points: Number(userData.user_stats?.points || 0),
            current_streak: Number(userData.user_stats?.current_streak || 0),
            pause_streak: userData.user_stats?.pause_streak || false,
            total_xp: Number(userData.user_stats?.total_xp || 0),
            inventory: (userData.user_stats?.inventory || []).map(Number),
            display_numbers: userData.user_settings?.display_numbers || false,
          });
        }

        // 2. Fetch Today's Meals
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: mealsData } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("logged_at", startOfDay.toISOString())
          .order("logged_at", { ascending: true });

        if (mealsData) setTodayMeals(mealsData);

        // 3. Fetch Weekly Meals (Monday to Sunday logic)
        const now = new Date();
        const dayOfWeek = now.getDay(); 
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const { data: weeklyData } = await supabase
          .from("meals")
          .select("nourish_score")
          .eq("user_id", session.user.id)
          .gte("logged_at", startOfWeek.toISOString());

        if (weeklyData && weeklyData.length > 0) {
          const scoredMeals = weeklyData.filter(m => (m.nourish_score || 0) > 0);
          if (scoredMeals.length > 0) {
            const total = scoredMeals.reduce((acc, m) => acc + (m.nourish_score || 0), 0);
            setWeeklyAvgScore(Math.round(total / scoredMeals.length));
            setWeeklyMealCount(scoredMeals.length); 
          }
        }

        if (mealsData && mealsData.length === 0 && new Date().getHours() >= 20) { //Change this to small for insta testing
        setShowStreakModal(true);
      }

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Nourish Score Status Logic
  const getNourishStatus = (score) => {
    if (weeklyMealCount === 0) return { label: "No Logs", color: "text-slate-300", bg: "bg-slate-50" };
    if (score < 25) return { label: "Needs Focus", color: "text-red-500", bg: "bg-red-50" };
    if (score < 50) return { label: "Normal", color: "text-amber-500", bg: "bg-amber-50" };
    if (score < 75) return { label: "Good!", color: "text-blue-500", bg: "bg-blue-50" };
    return { label: "Amazing!", color: "text-emerald-500", bg: "bg-emerald-50" };
  };

  const status = getNourishStatus(weeklyAvgScore);

  const getMealIcon = (type) => {
    const icons = { 
      "Breakfast": "/images/breakfast.png", 
      "Lunch": "/images/lunch.png", 
      "Dinner": "/images/dinner.png" 
    };
    return <img src={icons[type] || "/images/defaultmeal.png"} alt={type} className="w-10 h-10 object-contain" />;
  };

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const xpInCurrentLevel = (profile.total_xp || 0) % 100;
  const hasBadge = ownsItem(profile.inventory, 4);

  if (isLoading || !profile) {
  return (
    <div className="fixed inset-0 bg-[#F2FFF5] flex flex-col items-center justify-center z-[100]">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-4"
      >
      </motion.div>
      <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em] animate-pulse">
        Nourishing your data...
      </p>
    </div>
  );
}
  
return (
  //Franer Motion
  <AnimatePresence mode="wait">
    {isLoading || !profile ? (
      <motion.div
        key="loader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#F2FFF5] flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img src="/images/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
        </motion.div>
      </motion.div>
    ) : (
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-screen bg-[#F2FFF5] font-sans text-slate-800 no-scrollbar"
      >
        {/* Main Content */}
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28 flex flex-col min-h-0">
          <StreakWarningModal 
            isOpen={showStreakModal} 
            onClose={() => setShowStreakModal(false)} 
            streakCount={profile.current_streak} 
          />

          {/* Welcome Message */}
          <div className="flex flex-col items-center text-center mb-8 shrink-0">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Link href="/settings" className="text-slate-400 hover:text-slate-700 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 1.65 0l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                Welcome Back, <span className="text-[#00b252]">{profile.name}</span>
                {hasBadge && (
                  <img src="/images/goldenbadge.png" alt="Golden Badge" className="w-8 h-8 object-contain drop-shadow-sm" />
                )}
              </h1>
            </div>
            
            <div className="max-w-md w-full bg-gradient-to-br from-white to-slate-50 p-4 rounded-2xl shadow-2xl border border-slate-100 hover:scale-105 transition-all">
              <Link href="/progress" className="block">
                <div className="flex justify-between items-center mb-1.5 px-3 py-1">
                  <span className="text-[13px] font-black text-slate-400 uppercase tracking-tighter">Level {currentLevel}</span>
                  <span className="text-[13px] font-bold text-indigo-600">{xpInCurrentLevel}/100 XP</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                    style={{ width: `${xpInCurrentLevel}%` }}
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* DASHBOARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-grow min-h-0">

            {/* TODAY'S LOG - Column 1 */}
            <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl border border-slate-100 flex flex-col min-h-0">
              <div className="p-6 pb-3 border-b border-slate-50 shrink-0">
                <h2 className="text-xl font-bold text-slate-800">Today's Log</h2>
              </div>
              
              <div className="flex-grow p-6 pt-3 space-y-3 min-h-0">

                {/*Animated Plate*/}
                {todayMeals.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">

                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mb-6">
                    
                    {/*Plate Logo*/}
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="#cbd5e1" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="6" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
                      <path d="M17 8V16M19 8V16M15 8V12C15 13.1 15.9 14 17 14" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M7 8V16M5 8V10C5 11.1 5.9 12 7 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.div>

                  <h3 className="text-sm font-black text-slate-800 mb-1">Your plate is a clean slate!</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px]">
                    Fuel your day by logging your first meal.
                  </p>
                </motion.div>
                ) : (
                  todayMeals.map((meal) => (
                    <div key={meal.id} className="group flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-white transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                          {getMealIcon(meal.meal_type)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{meal.dish_name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            {meal.meal_type} • {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 pt-2 shrink-0">
                <Link href="/logmeals" className="w-full border-2 border-dashed border-slate-200 text-slate-400 hover:text-[#00b252] hover:bg-[#00b252]/5 hover:scale-105 rounded-xl py-3 font-bold text-xs transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                  Quick Add Missing Meal
                </Link>
              </div>
            </div>

            {/* STATS & ACTIONS - Column 2 */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${status.bg} ${status.color}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className={`text-xl font-black ${profile.display_numbers ? 'text-emerald-600' : status.color}`}>
                    {profile.display_numbers ? `${weeklyAvgScore}` : status.label}
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weekly Score</p>
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                  </div>
                  <span className="text-2xl font-extrabold text-orange-600">{profile.current_streak}</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Day Streak</p>
                  {profile.pause_streak && (
                    <div className="mt-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                      <span className="text-[8px] font-black text-amber-600 uppercase">Protected</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col gap-3 shrink-0">
                <Link href="/logmeals" className="w-full bg-gradient-to-r from-green-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-lg active:scale-95 text-sm text-center shadow-md shadow-green-100 hover:scale-105">
                  Log New Meal
                </Link>
                <Link href="/history" className="py-3 bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 text-center text-xs hover:bg-slate-100 transition-all hover:scale-105">
                  History
                </Link>
                <Link href="/rewards" className="py-3 bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 text-center text-xs hover:bg-slate-100 transition-all hover:scale-105">
                  Rewards
                </Link>
              </div>
            </div>
          </div>
        </main>
      </motion.div>
    )}
  </AnimatePresence>
);
}
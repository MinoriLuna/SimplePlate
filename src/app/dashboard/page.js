"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ownsItem } from "../../lib/rewards";
import StreakWarningModal from "@/components/streakwarningmodal";
import { StreakCount } from "../../lib/streak";
import { motion, AnimatePresence } from "framer-motion";
import { FireIcon, CutleryIcon, PlateIcon } from "../../components/icons/Icons";

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "", username: "", points: 0, current_streak: 0,
    pause_streak: false, display_numbers: false, total_xp: 0, inventory: [],
  });
  const [todayMeals, setTodayMeals] = useState([]);
  const [weeklyAvgScore, setWeeklyAvgScore] = useState(0);
  const [weeklyMealCount, setWeeklyMealCount] = useState(0);
  const [showStreakModal, setShowStreakModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      try {
        await StreakCount(supabase, session.user.id);
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select(`name, username, user_stats (points, current_streak, pause_streak, total_xp, inventory, lastchecked), user_settings (display_numbers)`)
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

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { data: mealsData } = await supabase
          .from("meals").select("*").eq("user_id", session.user.id)
          .gte("logged_at", startOfDay.toISOString()).order("logged_at", { ascending: true });
        if (mealsData) setTodayMeals(mealsData);

        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        const { data: weeklyData } = await supabase
          .from("meals").select("nourish_score").eq("user_id", session.user.id)
          .gte("logged_at", startOfWeek.toISOString());

        if (weeklyData && weeklyData.length > 0) {
          const scoredMeals = weeklyData.filter(m => (m.nourish_score || 0) > 0);
          if (scoredMeals.length > 0) {
            const total = scoredMeals.reduce((acc, m) => acc + (m.nourish_score || 0), 0);
            setWeeklyAvgScore(Math.round(total / scoredMeals.length));
            setWeeklyMealCount(scoredMeals.length);
          }
        }

        if (mealsData && mealsData.length === 0 && new Date().getHours() >= 20) {
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

  const getNourishStatus = (score) => {
    if (weeklyMealCount === 0) return { label: "No Logs", color: "text-slate-400" };
    if (score < 25) return { label: "Needs Focus", color: "text-red-500" };
    if (score < 50) return { label: "Normal", color: "text-amber-500" };
    if (score < 75) return { label: "Good!", color: "text-blue-500" };
    return { label: "Amazing!", color: "text-emerald-500" };
  };

  const status = getNourishStatus(weeklyAvgScore);
  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const xpInCurrentLevel = (profile.total_xp || 0) % 100;
  const hasBadge = ownsItem(profile.inventory, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const mealIcons = { Breakfast: "/images/breakfast.png", Lunch: "/images/lunch.png", Dinner: "/images/dinner.png" };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <span className="text-2xl font-black text-slate-900">Simple<span className="text-[#00b252]">Plate</span></span>
        </motion.div>
        <p className="mt-4 text-[10px] font-black text-[#00b252] uppercase tracking-[0.4em] animate-pulse">
          Nourishing your data...
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen font-sans text-slate-800 no-scrollbar"
      >
        <StreakWarningModal isOpen={showStreakModal} onClose={() => setShowStreakModal(false)} streakCount={profile.current_streak} />

        {/* ── Banner ── */}
        <div className="bg-gradient-to-r from-green-800 to-emerald-600 p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_75%_50%,white_0%,transparent_65%)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1">
                {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3 flex-wrap">
                {getGreeting()}, {profile.name}
                {hasBadge && <img src="/images/goldenbadge.png" alt="Badge" className="w-8 h-8 object-contain drop-shadow" />}
              </h1>
              <p className="text-green-100 text-sm mt-1">Track your meals and stay on top of your nutrition!</p>
              {/* XP Bar */}
              <div className="mt-4 max-w-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-white text-xs font-black">Level {currentLevel}</span>
                  <span className="text-green-200 text-xs font-bold">{xpInCurrentLevel}/100 XP</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000 rounded-full" style={{ width: `${xpInCurrentLevel}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="p-6 lg:p-8 space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {/* Streak */}
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-4 lg:p-5 text-white shadow-lg shadow-orange-100">
              <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center mb-3">
                <FireIcon className="w-5 h-5" />
              </div>
              <div className="text-2xl lg:text-3xl font-black">{profile.current_streak}</div>
              <div className="text-orange-100 text-[10px] font-black uppercase tracking-widest mt-0.5">Day Streak</div>
              {profile.pause_streak && <div className="mt-1.5 text-[8px] bg-white/20 rounded-lg px-2 py-0.5 font-black uppercase text-white inline-block">Protected</div>}
            </div>

            {/* Weekly Score */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 lg:p-5 text-white shadow-lg shadow-green-100">
              <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl lg:text-3xl font-black">
                {profile.display_numbers ? weeklyAvgScore : status.label}
              </div>
              <div className="text-green-100 text-[10px] font-black uppercase tracking-widest mt-0.5">Weekly Score</div>
            </div>

            {/* Meals Today */}
            <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl p-4 lg:p-5 text-white shadow-lg shadow-teal-100">
              <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center mb-3">
                <CutleryIcon className="w-5 h-5" />
              </div>
              <div className="text-2xl lg:text-3xl font-black">{todayMeals.length}</div>
              <div className="text-teal-100 text-[10px] font-black uppercase tracking-widest mt-0.5">Meals Today</div>
            </div>
          </div>

          {/* Today's Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-green-50">
              <h2 className="text-base font-black text-slate-900">Today's Log</h2>
              <Link href="/logmeals" className="text-[10px] font-black text-[#00b252] bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest">
                + Add Meal
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {todayMeals.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                   <PlateIcon className="w-10 h-10 text-green-600" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">Your plate is a clean slate!</p>
                  <p className="text-xs text-slate-400 mt-1">Log your first meal to get started.</p>
                </motion.div>
              ) : (
                todayMeals.map((meal) => (
                  <div key={meal.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 flex-shrink-0">
                      <img src={mealIcons[meal.meal_type] || "/images/defaultmeal.png"} alt={meal.meal_type} className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{meal.dish_name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {meal.meal_type} · {new Date(meal.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/history" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">History</p>
                <p className="text-[10px] text-slate-400 font-medium">View past logs</p>
              </div>
            </Link>
            <Link href="/progress" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Progress</p>
                <p className="text-[10px] text-slate-400 font-medium">Weekly insights</p>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

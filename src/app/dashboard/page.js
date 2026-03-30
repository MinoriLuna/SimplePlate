"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ownsItem } from "../../lib/rewards"; // Import the helper

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
    inventory: [], // Added default inventory
  });
  const [todayMeals, setTodayMeals] = useState([]);
  const [weeklyAvgScore, setWeeklyAvgScore] = useState(0);
  const [weeklyMealCount, setWeeklyMealCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        // 1. Fetch Profile + Joined Stats (including inventory) + Joined Settings
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select(`
            name, 
            username, 
            user_stats (points, current_streak, pause_streak, total_xp, inventory),
            user_settings (display_numbers)
          `)
          .eq("id", session.user.id)
          .single();

        if (userError) throw userError;

        if (userData) {
          setProfile({
            name: userData.name || "Unnamed User",
            username: userData.username || "",
            // Safety Fix: Convert to Numbers to prevent BigInt/F5 crashes
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

        // 3. Fetch Weekly Meals (Monday to Sunday)
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
            const avg = Math.round(total / scoredMeals.length);
            setWeeklyAvgScore(avg);
            setWeeklyMealCount(scoredMeals.length); 
          } else {
            setWeeklyAvgScore(0);
            setWeeklyMealCount(0);
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // --- HELPERS ---
  const getNourishStatus = (score) => {
    if (weeklyMealCount === 0) return { label: "No Logs", color: "text-slate-300", bg: "bg-slate-50" };
    if (score < 25) return { label: "Bad", color: "text-red-500", bg: "bg-red-50" };
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
    const iconPath = icons[type] || "/images/defaultmeal.png";
    return <img src={iconPath} alt={type} className="w-10 h-10 object-contain" />;
  };

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const xpInCurrentLevel = (profile.total_xp || 0) % 100;

  // Check for Golden Plate Badge (ID 4)
  const hasBadge = ownsItem(profile.inventory, 4);

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Loading Dashboard...</div>;

return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800">
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28 pb-12">
        
        {/* WELCOME HEADER */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Link href="/settings" className="text-slate-400 hover:text-slate-700 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 1.65 0l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
              Welcome Back, <span className="text-[#00b252]">{profile.name}</span>
              {hasBadge && (
                <img src="/images/goldenbadge.png" alt="Golden Badge" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />
              )}
            </h1>
          </div>
          
          {/* Level Progress */}
          <div className="max-w-md w-full bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <Link href="/progress" className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">Level {currentLevel}</span>
                <span className="text-xs font-bold text-slate-400">{xpInCurrentLevel}/100 XP</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                  style={{ width: `${xpInCurrentLevel}%` }}
                />
              </div>
            </Link>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* LEFT COLUMN: TODAY'S LOG */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-auto lg:h-[500px]">
            <div className="p-6 lg:p-8 pb-4 border-b border-slate-50">
              <h2 className="text-2xl font-bold text-slate-800">Today's Log</h2>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 lg:p-8 pt-4 space-y-4">
              {todayMeals.length === 0 ? (
                <div className="text-center py-10 text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No meals logged yet today!
                </div>
              ) : (
                todayMeals.map((meal) => (
                  <div key={meal.id} className="group flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#00b252]/30 hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                        {getMealIcon(meal.meal_type)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{meal.dish_name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {meal.meal_type} • {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 lg:p-8 pt-0 mt-2">
              <Link href="/logmeals" className="w-full border-2 border-dashed border-slate-200 text-slate-400 hover:text-[#00b252] hover:border-[#00b252]/30 hover:bg-[#00b252]/5 rounded-2xl py-4 font-bold text-sm transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                Quick Add Missing Meal
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Stats & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              
              {/* WEEKLY SCORE CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center min-h-[180px] lg:min-h-[200px]">
                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-3 ${status.bg} ${status.color}`}>
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${profile.display_numbers ? 'text-slate-800' : status.color}`}>
                  {profile.display_numbers ? `${weeklyAvgScore}` : status.label}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Weekly Score</p>
              </div>

              {/* STREAK CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center min-h-[180px] lg:min-h-[200px]">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                </div>
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{profile.current_streak}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Day Streak</p>
                {profile.pause_streak && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-2 uppercase tracking-wider">Protected</span>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3">
              <Link href="/logmeals" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-indigo-600 text-white font-semibold py-4 rounded-2xl transition-all hover:shadow-lg active:scale-95 shadow-md shadow-green-100">
                Log New Meal
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/history" className="py-3 bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-100 text-center transition-all">
                  History
                </Link>
                <Link href="/rewards" className="py-3 bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-100 text-center transition-all">
                  Rewards
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
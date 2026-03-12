"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PointsModal from "@/components/PointsModal"; 

export default function LogMeal() {
  const router = useRouter();
  
  const [currentPlate, setCurrentPlate] = useState([]);
  const [dishName, setDishName] = useState("");
  const [portion, setPortion] = useState("");
  const [mealType, setMealType] = useState("Lunch"); 
  const [streakIncreased, setStreakIncreased] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [showPointsModal, setShowPointsModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const portionOptions = ["Small", "Normal/Plate", "Large", "Cup/Glass"];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];

  const handleAddToPlate = () => {
    if (!dishName.trim()) {
      return setStatus({ type: "error", message: "Please enter a food name." });
    }
    if (!portion) {
      return setStatus({ type: "error", message: "Please select a portion size." });
    }

    setCurrentPlate([...currentPlate, { id: Date.now(), dishName, portion }]);
    setDishName("");
    setPortion("");
    setStatus({ type: "", message: "" });
  };

  const handleRemoveItem = (idToRemove) => {
    setCurrentPlate(currentPlate.filter(item => item.id !== idToRemove));
  };

  const handleFinishLogging = async () => {
    if (currentPlate.length === 0) return;

    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push("/login");

    try {
      // 1. Check for first meal of the day
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { count: mealsToday } = await supabase
        .from("meals")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", session.user.id)
        .gte("logged_at", startOfToday.toISOString());

      const isFirstLogToday = mealsToday === 0;

      // 2. ANALYZE EACH ITEM WITH AI
      const mealsToInsert = await Promise.all(currentPlate.map(async (item) => {
        const aiResponse = await fetch("/api/analyze-meal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dish_name: item.dishName, portion_size: item.portion }),
        });
        
        const nutrition = await aiResponse.json();

        return {
          user_id: session.user.id,
          dish_name: item.dishName,
          portion_size: item.portion,
          meal_type: mealType,
          carbs_g: nutrition.carbs_g,
          protein_g: nutrition.protein_g,
          fat_g: nutrition.fat_g,
          vitamins: nutrition.vitamins,
          nourish_score: nutrition.nourish_score,
          logged_at: new Date().toISOString()
        };
      }));

      // 3. Save meals to Supabase
      const { error: mealError } = await supabase.from("meals").insert(mealsToInsert);
      if (mealError) throw mealError;

      // 4. Fetch Profile & Update Stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const pointsJustEarned = currentPlate.length * 10;
      const newTotalPoints = (profile.points || 0) + pointsJustEarned;
      const newTotalXP = (profile.total_xp || 0) + pointsJustEarned;
      
      let newStreak = profile.current_streak || 0;
      let newPauseStreak = profile.pause_streak;

      if (isFirstLogToday) {
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        
        const { data: yesterdayMeals } = await supabase
          .from("meals")
          .select("id")
          .eq("user_id", session.user.id)
          .gte("logged_at", yesterdayStart.toISOString())
          .lt("logged_at", startOfToday.toISOString())
          .limit(1);

        if (yesterdayMeals && yesterdayMeals.length > 0) {
          newStreak += 1;
        } else if (newPauseStreak) {
          newPauseStreak = false; 
        } else {
          newStreak = 1;
        }
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          points: newTotalPoints,
          total_xp: newTotalXP,
          current_streak: newStreak, 
          pause_streak: newPauseStreak
        })
        .eq("id", session.user.id);

      if (!profileError) {
        setEarnedPoints(pointsJustEarned);
        setStreakIncreased(isFirstLogToday); 
        setStreakCount(newStreak); 
        setShowPointsModal(true);
      }
    } catch (err) {
      console.error("Logging error:", err);
      setStatus({ type: "error", message: "Error analyzing or saving meals." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] flex flex-col font-sans text-slate-800">
      <div className="py-20">
      <div className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:py-10 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          <div className="lg:col-span-5 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 lg:sticky lg:top-28">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Your Plate</h2>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {currentPlate.length} items
              </span>
            </div>

            {currentPlate.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <span className="text-4xl mb-3 block">🍽️</span>
                <p className="text-slate-400 text-sm font-medium">Add food from the right!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {currentPlate.map((item) => (
                  <div key={item.id} className="group flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-100 transition-all">
                    <div>
                      <p className="font-bold text-slate-800">{item.dishName}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{item.portion}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Log a Meal</h2>
            <p className="text-slate-500 text-sm mb-8">What did you eat for {mealType}?</p>

            <div className="space-y-8">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex justify-between items-center">
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                      mealType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Nasi Lemak..."
                  className="w-full pl-8 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Portion Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {portionOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPortion(opt)}
                      className={`py-4 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                        portion === opt ? "bg-[#2d3748] text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddToPlate}
                className="w-full py-4 rounded-2xl text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                Add to Plate
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex justify-end py-10">
          <button
            onClick={handleFinishLogging}
            disabled={isLoading || currentPlate.length === 0}
            className="w-full sm:w-auto sm:min-w-[320px] py-4 px-8 rounded-2xl text-base font-bold text-white bg-[#00b252] hover:bg-[#00a049] transition-all shadow-lg shadow-[#00b252]/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              "AI is analyzing..."
            ) : (
              <>
                Finish Logging ({currentPlate.length} items)
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              </>
            )}
          </button>
        </div>
      </div>

      {showPointsModal && (
        <PointsModal 
          points={earnedPoints} 
          streakIncreased={streakIncreased}
          streakCount={streakCount} 
          onClose={() => router.push("/dashboard")} 
        />
      )}
    </div>
  </div>
  );
}
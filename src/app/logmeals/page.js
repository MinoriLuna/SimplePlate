"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PointsModal from "@/components/PointsModal";
import { submitMealLog } from "../../lib/logmeal";
import { PlateIcon, CutleryIcon, DrinkIcon, CameraIcon, RepeatIcon } from "@/components/icons/Icons";

const getMealIcon = (type) => {
  const icons = { breakfast: "/images/breakfast.png", lunch: "/images/lunch.png", dinner: "/images/dinner.png" };
  return icons[type?.trim().toLowerCase()] || "/images/default-meal.png";
};

const ITEMS_PER_PAGE = 4;

const tips = [
  { icon: <CutleryIcon className="w-4 h-4 text-[#00b252]" />, text: "Be specific like \"Chicken Rice\" gives better AI scores than just \"Rice\"" },
  { icon: <DrinkIcon className="w-4 h-4 text-blue-500" />, text: "Log drinks and sides too. They affect your nutrient breakdown" },
  { icon: <CameraIcon className="w-4 h-4 text-amber-500" />, text: "Use Scan Image to auto-detect your dish from a photo" },
  { icon: <RepeatIcon className="w-4 h-4 text-purple-500" />, text: "Add each component separately for a more accurate plate" },
];

export default function LogMeal() {
  const router = useRouter();

  const [currentPlate, setCurrentPlate] = useState([]);
  const [platePage, setPlatePage] = useState(0);
  const [dishName, setDishName] = useState("");
  const [portion, setPortion] = useState("Normal/Plate");
  const [mealType, setMealType] = useState("Lunch");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [rewardData, setRewardData] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [healthGoal, setHealthGoal] = useState(null);

  const portionOptions = ["Small", "Normal/Plate", "Large", "Cup/Glass"];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];

  const totalPages = Math.max(1, Math.ceil(currentPlate.length / ITEMS_PER_PAGE));
  const paginatedItems = currentPlate.slice(platePage * ITEMS_PER_PAGE, (platePage + 1) * ITEMS_PER_PAGE);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("health_goal").eq("id", session.user.id).single();
      if (profile?.health_goal) setHealthGoal(profile.health_goal);
    };
    checkUser();
  }, [router]);

  const handleVisionScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsVisionLoading(true);
    setStatus({ type: "success", message: "Scanning your plate..." });
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/analyze-vision", { method: "POST", body: JSON.stringify({ image: reader.result }) });
        const data = await res.json();
        if (data.dish_name) {
          setDishName(data.dish_name);
          setStatus({ type: "success", message: `AI found: ${data.dish_name}` });
        }
      } catch {
        setStatus({ type: "error", message: "Vision scan failed." });
      } finally {
        setIsVisionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddToPlate = () => {
    if (!dishName.trim()) return setStatus({ type: "error", message: "Enter a food name." });
    const newPlate = [...currentPlate, { id: Date.now(), dishName: dishName.trim(), portion }];
    setCurrentPlate(newPlate);
    setPlatePage(Math.ceil(newPlate.length / ITEMS_PER_PAGE) - 1);
    setDishName("");
    setStatus({ type: "", message: "" });
  };

  const handleRemove = (id) => {
    const newPlate = currentPlate.filter(i => i.id !== id);
    setCurrentPlate(newPlate);
    const newTotalPages = Math.max(1, Math.ceil(newPlate.length / ITEMS_PER_PAGE));
    if (platePage >= newTotalPages) setPlatePage(newTotalPages - 1);
  };

  const handleFinishLogging = async () => {
    if (currentPlate.length === 0) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push("/login");

    try {
      const result = await submitMealLog(supabase, session, currentPlate, mealType, healthGoal);
      setRewardData(result);
      setShowPointsModal(true);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Logging failed. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-5 lg:px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Log a Meal</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">What did you eat today?</p>
        </div>
        <label className="cursor-pointer bg-green-50 hover:bg-green-100 text-[#00b252] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
          {isVisionLoading ? "Scanning..." : <><CameraIcon className="w-4 h-4" />Scan Image</>}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleVisionScan} disabled={isVisionLoading} />
        </label>
      </div>

      <div className="p-5 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* PLATE */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:sticky lg:top-6 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">Your Plate</h2>
              <span className="text-xs font-black text-[#00b252] bg-green-50 px-3 py-1 rounded-full">
                {currentPlate.length} {currentPlate.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              {currentPlate.length === 0 ? (
                <div className="flex-1 flex flex-col">
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 mb-4">
                    <div className="flex justify-center mb-3">
                      <PlateIcon className="w-12 h-12 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-bold text-sm">Your plate is empty</p>
                    <p className="text-slate-400 text-xs mt-1">Add food using the form →</p>
                  </div>

                  {/* How it works */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">How it works</p>
                    {[
                      { step: "1", text: "Type a food name in the form" },
                      { step: "2", text: "Choose your portion size" },
                      { step: "3", text: "Click Add to Plate" },
                      { step: "4", text: "Repeat, then hit Finish Logging!" },
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-[#00b252] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-black">{step}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Paginated items */}
                  <div className="space-y-2 flex-1">
                    {paginatedItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0 p-1">
                            <img src={getMealIcon(mealType)} alt={mealType} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{item.dishName}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.portion}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-slate-300 hover:text-red-400 transition-all p-1 ml-2 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {/* Fill empty slots to keep card height stable */}
                    {Array.from({ length: ITEMS_PER_PAGE - paginatedItems.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-[58px] rounded-xl border border-dashed border-slate-100" />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setPlatePage(p => Math.max(0, p - 1))}
                        disabled={platePage === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        Prev
                      </button>
                      <div className="flex gap-1.5">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPlatePage(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === platePage ? "bg-[#00b252] w-4" : "bg-slate-200 hover:bg-slate-300"}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setPlatePage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={platePage === totalPages - 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
                      >
                        Next
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Finish button at bottom of plate card */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                {status.message && (
                  <p className={`mb-2 text-center text-[10px] font-black uppercase tracking-widest ${status.type === "error" ? "text-red-500" : "text-[#00b252]"}`}>
                    {status.message}
                  </p>
                )}
                <button
                  onClick={handleFinishLogging}
                  disabled={isLoading || currentPlate.length === 0}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#00b252] hover:bg-green-700 transition-all disabled:opacity-40 flex justify-center items-center gap-2 shadow-md shadow-green-100 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      AI is analyzing...
                    </>
                  ) : `Finish Logging (${currentPlate.length} items)`}
                </button>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Add Food</h2>
              <p className="text-xs text-slate-400 mt-0.5">What did you eat for {mealType}?</p>
            </div>

            <div className="p-5 space-y-5">
              {/* Meal Type */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Meal Type</label>
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                  {mealTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                        mealType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dish Name */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Food Name</label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddToPlate()}
                  placeholder="e.g. Nasi Lemak, Teh Tarik..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Portion */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Portion Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {portionOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPortion(opt)}
                      className={`py-3 rounded-xl text-xs font-bold transition-all ${
                        portion === opt
                          ? "bg-surface-dark text-white shadow-md"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToPlate}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 flex justify-center items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add to Plate
              </button>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logging Tips</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
                      <p className="text-xs text-slate-500 leading-snug font-medium">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPointsModal && rewardData && (
        <PointsModal
          points={rewardData.points}
          xp={rewardData.xp}
          isBoostedXP={rewardData.isBoostedXP}
          isBoostedPoints={rewardData.isBoostedPoints}
          streakCount={rewardData.streak}
          streakIncreased={rewardData.isFirstLogToday}
          onClose={() => router.push("/dashboard")}
        />
      )}
    </div>
  );
}

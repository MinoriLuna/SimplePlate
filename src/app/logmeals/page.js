"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PointsModal from "@/components/PointsModal";
import { submitMealLog } from "../../lib/logmeal";

export default function LogMeal() {
  const router = useRouter();

  const [currentPlate, setCurrentPlate] = useState([]);
  const [dishName, setDishName] = useState("");
  const [portion, setPortion] = useState("Normal/Plate");
  const [mealType, setMealType] = useState("Lunch");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [rewardData, setRewardData] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false);

  const portionOptions = ["Small", "Normal/Plate", "Large", "Cup/Glass"];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
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
      } catch (err) { setStatus({ type: "error", message: "Vision scan failed." }); }
      finally { setIsVisionLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleAddToPlate = () => {
    if (!dishName.trim()) return setStatus({ type: "error", message: "Enter a food name." });
    setCurrentPlate([...currentPlate, { id: Date.now(), dishName: dishName.trim(), portion }]);
    setDishName("");
    setStatus({ type: "", message: "" });
  };

  const handleFinishLogging = async () => {
    if (currentPlate.length === 0) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push("/login");

    try {
      const result = await submitMealLog(supabase, session, currentPlate, mealType);
      setRewardData(result);
      setShowPointsModal(true);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Logging failed. Try again." });
    } finally { setIsLoading(false); }
  };

return (
    <div className="min-h-screen bg-[#F2FFF5] flex flex-col font-sans text-slate-800">
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28">     
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* PLATE DISPLAY*/}
          <div className="lg:col-span-5 w-full bg-white rounded-[2rem] shadow-xl border border-green-200 p-6 lg:p-8 lg:sticky lg:top-28">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Your Plate</h2>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {currentPlate.length} items
              </span>
            </div>

            {currentPlate.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <span className="text-4xl mb-3 block">🍽️</span>
                <p className="text-lg text-slate-700 mb-1">Your plate is empty</p>
                <p className="text-slate-400 text-sm font-medium">Add food from the right!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {currentPlate.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all">
                    <div>
                      <p className="font-bold text-slate-800">{item.dishName}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{item.portion}</p>
                    </div>
                    <button 
                      onClick={() => setCurrentPlate(currentPlate.filter(i => i.id !== item.id))} 
                      className="text-slate-300 hover:text-red-500 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORM SECTION */}
          <div className="lg:col-span-7 w-full bg-white rounded-[2rem] shadow-xl border border-green-200 p-6 lg:p-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Log a Meal</h2>
              <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-[#00b252] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-100">
                {isVisionLoading ? "Scanning..." : "Import Images"}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleVisionScan} disabled={isVisionLoading} />
              </label>
            </div>
            
            <p className="text-slate-500 text-sm mb-8">What did you eat for {mealType}?</p>
            
            <div className="space-y-8">
              {/* Meal Type Toggle */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex justify-between items-center">
                {mealTypes.map((type) => (
                  <button 
                    key={type} 
                    type="button" 
                    onClick={() => setMealType(type)} 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mealType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Dish Name Input */}
              <input 
                type="text" 
                value={dishName} 
                onChange={(e) => setDishName(e.target.value)} 
                placeholder="e.g. Nasi Lemak..." 
                className="w-full px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#00b252]/20 text-slate-900" 
              />

              {/* Portion Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {portionOptions.map((opt) => (
                  <button 
                    key={opt} 
                    type="button" 
                    onClick={() => setPortion(opt)} 
                    className={`py-4 rounded-2xl text-xs font-bold transition-all ${portion === opt ? "bg-[#27272a] text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Add Button */}
              <button 
                onClick={handleAddToPlate} 
                className="w-full py-4 rounded-2xl text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
                Add to Plate
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTON */}
        <div className="flex justify-end mt-10">
          <button 
            onClick={handleFinishLogging} 
            disabled={isLoading || currentPlate.length === 0} 
            className="w-full sm:w-auto sm:min-w-[320px] py-4 px-8 rounded-2xl text-base font-bold text-white bg-[#00b252] hover:bg-[#00a049] transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-emerald-100"
          >
            {isLoading ? "AI is analyzing..." : `Finish Logging (${currentPlate.length} items)`}
          </button>
        </div>

        {/* STATUS MESSAGE */}
        {status.message && (
          <p className={`mt-6 text-center text-[10px] font-black uppercase tracking-widest ${status.type === "error" ? "text-red-500" : "text-[#00b252]"}`}>
            {status.message}
          </p>
        )}

      </main>

{/* End of Return */}

      {/* Call of Point Modal */}
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
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LogMeal() {
  const router = useRouter();
  
  const [currentPlate, setCurrentPlate] = useState([]);
  const [dishName, setDishName] = useState("");
  const [portion, setPortion] = useState("");
  const [mealType, setMealType] = useState("Lunch"); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const portionOptions = ["Bowl", "1/2 Serving", "1/4 Serving"];
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
    if (currentPlate.length === 0) {
      return setStatus({ type: "error", message: "Your plate is empty! Add some food first." });
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    const mealsToInsert = currentPlate.map((item) => ({
      dish_name: item.dishName,
      portion_size: item.portion,
    }));

    const { error } = await supabase.from("meals").insert(mealsToInsert);

    if (error) {
      setStatus({ type: "error", message: "Failed to save meal. Please try again." });
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] flex flex-col font-sans text-slate-800">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 py-5">
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:py-10 pb-28">
        
        {/* Two-column layout on large screens, stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* --- LEFT COLUMN: THE CART --- */}
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
                <p className="text-slate-400 text-sm font-medium">Plate is empty.<br/>Add what you ate to the right!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {currentPlate.map((item) => (
                  <div key={item.id} className="group flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-slate-800">{item.dishName}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{item.portion}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove Item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-10">
            
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">What did you eat?</h2>
            <p className="text-slate-500 text-sm mb-8">Type the food, pick the portion, and add it to your plate.</p>

            <div className="space-y-8">
              
              {/* Meal Type */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex justify-between items-center">
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                      mealType === type
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Food Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-xl">🍲</span>
                </div>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Nasi Lemak, Chicken Chop..."
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Portion Sizes Grid */}
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">
                  Select Portion
                </label>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {portionOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPortion(opt)}
                      className={`py-4 px-2 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                        portion === opt
                          ? "bg-[#2d3748] text-white shadow-md border-transparent scale-[1.02]"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {status.message && status.type === "error" && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm text-center font-medium animate-in fade-in zoom-in-95">
                  {status.message}
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToPlate}
                className="w-full py-4 rounded-2xl text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all border border-slate-200 flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                Add to Plate
              </button>
              
            </div>
          </div>
        </div>

      {/* Floating Bottom Action Bar */}
      <div className="p-4 pb-safe">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button
            onClick={handleFinishLogging}
            disabled={isLoading || currentPlate.length === 0}
            className="w-full sm:w-auto sm:min-w-[300px] py-4 px-8 rounded-2xl text-base font-bold text-white bg-[#00b252] hover:bg-[#00a049] focus:ring-4 focus:ring-[#00b252]/30 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-[#00b252]/20 flex justify-center items-center gap-2 ml-auto"
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                Finish Logging Meal ({currentPlate.length})
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              </>
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
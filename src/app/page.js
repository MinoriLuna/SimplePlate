"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LogMeal() {
  const [dishName, setDishName] = useState("");
  const [portionSize, setPortionSize] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const portionOptions = ["Bowl", "Spoon", "Handful"];

  const handleLogMeal = async (e) => {
    e.preventDefault();
    
    if (!dishName || !portionSize) {
      setStatus({ type: "error", message: "Please enter a dish and select a portion size." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    // Insert data into Supabase
    const { data, error } = await supabase
      .from("meals")
      .insert([{ dish_name: dishName, portion_size: portionSize }]);

    if (error) {
      setStatus({ type: "error", message: "Failed to log meal. Please try again." });
      console.error("Supabase Error:", error);
    } else {
      setStatus({ type: "success", message: "Meal logged successfully!" });
      // Clear the form
      setDishName("");
      setPortionSize("");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black-50 flex flex-col items-center pt-12 px-4">
      <div className="w-full max-w-md bg-gray rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log Your Meal</h1>
        <form onSubmit={handleLogMeal} className="space-y-6">
          {/* Dish Name Input */}
          <div>
            <label htmlFor="dishName" className="block text-sm font-medium text-gray-700 mb-2">
              What did you eat?
            </label>
            <input
              type="text"
              id="dishName"
              placeholder="e.g., Nasi Lemak, Chicken Rice"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Portion Size Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Portion
            </label>
            <div className="grid grid-cols-3 gap-3">
              {portionOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setPortionSize(option)}
                  className={`py-3 rounded-xl font-medium transition-all duration-200 ${
                    portionSize === option
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {status.message && (
            <div className={`p-3 rounded-lg text-sm text-center ${
              status.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}>
              {status.message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-green-700 disabled:opacity-70 transition-colors"
          >
            {isLoading ? "Saving..." : "Log Meal"}
          </button>
        </form>
      </div>
    </div>
  );
}
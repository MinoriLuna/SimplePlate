"use client";

import { useState } from "react";
import Link from "next/link";

export default function Reports() {
  // Dummy data to match your wireframe
  const [selectedDate, setSelectedDate] = useState("26th February 2026");

  const loggingHistory = [
    { id: 1, name: "Chicken Rice", portion: "Bowl", time: "1:00 PM" },
    { id: 2, name: "Oatmeal", portion: "1/2 Serving", time: "8:30 AM" },
    { id: 3, name: "Apple", portion: "1 Serving", time: "10:15 AM" },
    { id: 4, name: "Grilled Salmon", portion: "1/2 Serving", time: "7:00 PM" },
    { id: 5, name: "Broccoli", portion: "Bowl", time: "7:00 PM" },
  ];

  // Nutritional progress matching your wireframe metrics
  const weeklyProgress = [
    { nutrient: "Carbs", percentage: 25, color: "bg-purple-500" },
    { nutrient: "Protein", percentage: 50, color: "bg-purple-600" },
    { nutrient: "Vitamins", percentage: 20, color: "bg-purple-400" },
    { nutrient: "Fiber", percentage: 80, color: "bg-purple-700" },
    { nutrient: "Iron", percentage: 10, color: "bg-purple-300" },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] flex flex-col font-sans text-slate-800">
        <div className="flex h-max py-15">
        </div>
        <div className="flex items-center gap-3">
        </div>

      {/* Main Content Grid */}
      <div className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:py-10 pb-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* --- LEFT COLUMN: LOGGING HISTORY --- */}
          <div className="lg:col-span-5 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 lg:sticky lg:top-28">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Logging History</h2>
              
              {/* Date Selector */}
              <button className="flex items-center gap-2 mt-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors w-full sm:w-auto">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {selectedDate}
                <svg className="w-4 h-4 ml-auto sm:ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {loggingHistory.map((item) => (
                <div key={item.id} className="group flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl border border-slate-100">
                      🍲
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{item.portion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">{item.time}</p>
                    <button className="text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT COLUMN: WEEKLY PROGRESS --- */}
          <div className="lg:col-span-7 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-10">
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Weekly Progress</h2>
                <p className="text-slate-500 text-sm">A soft overview of your nutrient intake.</p>
              </div>
              
              {/* Eye Icon to Toggle Exact Numbers (Maintaining the app's core philosophy) */}
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
              </button>
            </div>

            <div className="space-y-8">
              {weeklyProgress.map((stat, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-700 text-sm tracking-wide">{stat.nutrient}</span>
                    <span className="text-xs font-bold text-slate-400">{stat.percentage}%</span>
                  </div>
                  
                  {/* Background Track */}
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
                    {/* Progress Bar with Animation */}
                    <div 
                      className={`h-full ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${stat.percentage}%` }}
                    >
                      {/* Shine effect overlay for premium feel */}
                      <div className="w-full h-full bg-white/20"></div>
                    </div>
                  </div>
                  
                  {/* Micro-copy for encouragement (like the "You may add more iron!" suggestion) */}
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
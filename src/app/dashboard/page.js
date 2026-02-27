"use client";

import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [showNumbers, setShowNumbers] = useState(false);

  const username = "UserName";
  const nourishScore = 85;
  const streakDays = 15;
  const graceDayAvailable = true;
  const rewardsPoints = 300;

  const todayMeals = [
    { id: 1, name: "Oatmeal & Berries", time: "8:00 AM", icon: "🥣" },
    { id: 2, name: "Grilled Chicken Salad", time: "1:30 PM", icon: "🥗" },
    { id: 3, name: "Handful of Almonds", time: "4:00 PM", icon: "🥜" },
    { id: 4, name: "Salmon & Quinoa", time: "7:15 PM", icon: "🍱" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 selection:bg-green-100">
      
      {/* Top Navigation Bar */}
      <div className="bg-white flex justify-end items-center gap-5 px-6 py-4 border-b border-slate-100 shadow-sm text-sm z-10">
        <div className="flex items-center gap-5 font-medium text-slate-600 mr-2">
          <button className="hover:text-green-600 transition-colors tooltip-trigger" title="Pause Streak">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          
          <div className="flex items-center gap-1.5 hover:text-green-600 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>{streakDays} Days</span>
          </div>

          <Link href="/rewards" className="flex items-center gap-1.5 hover:text-green-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
            <span>{showNumbers ? rewardsPoints : "***"}</span>
          </Link>
        </div>

        <span className="font-semibold">Hello! {username}</span>
        
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-100 to-indigo-100 border border-green-200 flex items-center justify-center text-green-600 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>

        <button className="text-slate-400 hover:text-red-500 transition-colors ml-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        
        <div className="flex justify-center items-center gap-3 mb-10">
          <Link href="/settings" className="text-slate-400 hover:text-slate-700 hover:rotate-90 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-600">{username}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Today's Log Card */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full">
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Today's Log</h2>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {showNumbers ? todayMeals.length : "*"} meals
              </span>
            </div>
            
            <div className="space-y-4 flex-grow">
              {todayMeals.map((meal) => (
                <div key={meal.id} className="group flex justify-between items-center bg-slate-50 hover:bg-green-50/50 p-4 rounded-2xl border border-slate-100 hover:border-green-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                      {meal.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{meal.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{meal.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 group-hover:text-green-500 transition-colors">
                    <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">Edit</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-6 w-full border-2 border-dashed border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50/30 rounded-2xl py-4 font-medium transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Quick Add Missing Meal
            </button>
          </div>

          {/* RIGHT COLUMN: Stats & Buttons */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* NOURISH SCORE CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[200px]">
                
                {/* The Toggle Eye Button */}
                <button 
                  onClick={() => setShowNumbers(!showNumbers)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors p-2 z-10 bg-slate-50 hover:bg-slate-100 rounded-full"
                  title={showNumbers ? "Hide Metrics" : "Show Metrics"}
                >
                  {showNumbers ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  )}
                </button>

                {/* The Center Icon changes based on state */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${showNumbers ? 'bg-slate-50 text-slate-400' : 'bg-green-50 text-green-500'}`}>
                  {showNumbers ? (
                     <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ) : (
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                </div>
                
                {/* Text changes dynamically */}
                {showNumbers ? (
                  <>
                    <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{nourishScore}</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Nourish Score</p>
                    <span className="text-green-600 text-[11px] font-bold bg-green-100/50 px-2.5 py-1 rounded-md mt-3">Amazing!</span>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-extrabold text-green-500 tracking-tight mt-1">Amazing!</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Nourish Score</p>
                  </>
                )}
              </div>

              {/* STREAK CARD */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center group min-h-[200px]">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{streakDays}</span>
                </div>
                <p className="text-sm font-medium text-slate-400 mt-1">Day Streak</p>
                {graceDayAvailable && (
                  <span className="text-green-600 text-[11px] font-bold bg-green-50 px-2.5 py-1 rounded-md mt-3 flex items-center gap-1">
                    Protected
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-3">
              <Link href="/logmeals " className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-indigo-600 text-white font-semibold py-4 rounded-2xl hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Log New Meal
              </Link>
              
              <button className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-semibold py-4 rounded-2xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                Check Suggestions
              </button>
              
              <Link href="/reports" className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-semibold py-4 rounded-2xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                View History
              </Link>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full border-t border-slate-200/60 bg-white py-6 mt-auto">
        <p className="text-center text-slate-400 text-sm font-medium">© 2026 SimplePlate. All rights reserved.</p>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";

export default function StreakWarningModal({ isOpen, onClose, streakCount }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 sm:p-10 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Warning Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Streak at Risk!</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            You haven't logged any meals today. Log something before midnight to keep your <span className="text-red-600 font-bold">{streakCount}-day streak</span> active!
          </p>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Link 
              href="/logmeals" 
              className="block w-full py-4 bg-red-500 text-white font-black rounded-2xl uppercase tracking-[0.15em] text-xs shadow-lg shadow-red-100 hover:bg-red-600 transition-all active:scale-[0.98]"
            >
              Log Meal Now
            </Link>
            <button 
              onClick={onClose}
              className="block w-full py-4 text-slate-400 font-black rounded-2xl uppercase tracking-[0.15em] text-[10px] hover:text-slate-600 transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
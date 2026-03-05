"use client";

export default function PointsModal({ points, streakIncreased, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 p-8 text-center border border-slate-100">
        
        {/* Celebration Icon */}
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <span className="text-5xl animate-bounce">🎁</span>
          <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping opacity-25"></div>
        </div>

        {/* Text Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Nice one!</h2>
          <p className="text-slate-500 font-medium leading-relaxed px-4">
            Your plate has been logged and your stats are updated.
          </p>
        </div>

        {/* --- CONDITIONAL STREAK BADGE --- */}
        {streakIncreased && (
          <div className="mb-4 animate-in zoom-in-50 duration-500 delay-300 fill-mode-both">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full shadow-sm">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-orange-600 text-sm tracking-tight">+1 Day Streak!</span>
            </div>
          </div>
        )}

        {/* Points Badge */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl py-4 mb-10 group transition-transform hover:scale-105">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Total Reward</p>
          <p className="text-4xl font-black text-blue-600">+{points} pts</p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-[#27272a] hover:bg-black text-white rounded-2xl font-bold text-lg shadow-lg shadow-slate-200 transition-all active:scale-95"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Progress() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({ total_xp: 0, points: 0, current_streak: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("total_xp, points, current_streak")
        .eq("id", session.user.id)
        .single();

      if (data) setProfile(data);
      setIsLoading(false);
    };
    fetchProfile();
  }, [router]);

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const xpInCurrentLevel = (profile.total_xp || 0) % 100;

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      <div className="max-w-4xl mx-auto py-30 space-y-8">
        
        {/* BIG LEVEL CARD */}
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Current Level</p>
          <h2 className="text-7xl font-black text-slate-900 mb-6">Lv. {currentLevel}</h2>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2 px-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <span>{xpInCurrentLevel} XP</span>
              <span>100 XP TO LV. {currentLevel + 1}</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                style={{ width: `${xpInCurrentLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* MILESTONES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Lifetime Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-500">Total XP Earned</span>
                <span className="font-black text-slate-900">{profile.total_xp}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-500">Current Streak</span>
                <span className="font-black text-slate-900">{profile.current_streak} Days</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Upcoming Rewards</h3>
            <div className="space-y-3 opacity-40">
              <div className="flex items-center gap-4 p-3 grayscale">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs">Lv.5</div>
                <span className="text-sm font-bold text-slate-600">Exclusive "Healthy" Title</span>
              </div>
              <div className="flex items-center gap-4 p-3 grayscale">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs">Lv.10</div>
                <span className="text-sm font-bold text-slate-600">Golden Profile Theme</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
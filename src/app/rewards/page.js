"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Rewards() {
  const router = useRouter();
  
  // Real Database State
  const [profile, setProfile] = useState({
    points: 0,
    current_streak: 0,
    pause_streak: false,
    id: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const rewardsList = [
    { id: 1, title: "1 Free Grace Day", description: "Missed a day? Protect your streak!", cost: 150, icon: "🛡️", type: "streak_freeze" },
    { id: 2, title: "Premium App Theme", description: "Unlock the exclusive dark mode theme.", cost: 300, icon: "✨", type: "theme" },
    { id: 3, title: "Nutrition Consultation", description: "15-minute chat with a certified nutritionist.", cost: 1000, icon: "👨‍⚕️", type: "consult" },
    { id: 4, title: "SimplePlate Merch", description: "Get a free branded water bottle.", cost: 2500, icon: "🥤", type: "physical" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          points: data.points || 0,
          current_streak: data.current_streak || 0,
          pause_streak: data.pause_streak || false
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleRedeem = async (reward) => {
    if (profile.points < reward.cost) return;

    setRedeemingId(reward.id);
    
    // 1. Calculate new values
    const newPoints = profile.points - reward.cost;
    const updates = { points: newPoints };

    // If it's the Grace Day, activate the shield column
    if (reward.type === "streak_freeze") {
      updates.pause_streak = true;
    }

    // LOG 1: Check what data you are sending to Supabase
    console.log("Attempting update for Profile ID:", profile.id);
    console.log("Update payload:", updates);

    // 2. Update Supabase
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      console.error("Supabase Redemption Error:", error.message, error.details);
      alert("Redemption failed. Please try again.");
    } else {
      // 3. Update local state for instant UI feedback
      setProfile({ ...profile, ...updates });
      setSuccessMsg(`Successfully redeemed: ${reward.title}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    
    setRedeemingId(null);
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Loading Rewards...</div>;

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] flex flex-col font-sans text-slate-800">
      
      {/* Top Navigation Bar */}
      <div className="bg-white flex justify-between items-center px-4 sm:px-6 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <span className="font-bold text-lg tracking-tight text-slate-900">Rewards Center</span>
        </div>
        
        {/* Points Display */}
        <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2">
           <span className="text-xl">🎁</span>
           <span className="font-extrabold text-blue-700">{profile.points} pts</span>
        </div>
      </div>

      <div className="flex-grow w-full max-w-5xl mx-auto p-4 sm:p-6 lg:py-10 pb-10">
        
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm text-center font-bold animate-in fade-in slide-in-from-top-4 flex justify-center items-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: REAL STATS */}
          <div className="lg:col-span-5 w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 lg:sticky lg:top-28">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Your Progress</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">🎁</div>
                  <span className="font-bold text-slate-700">Reward Balance</span>
                </div>
                <span className="text-2xl font-extrabold text-blue-600">{profile.points}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">📅</div>
                  <span className="font-bold text-slate-700">Current Streak</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-orange-500">{profile.current_streak}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1 uppercase">Days</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 ${profile.pause_streak ? 'text-amber-500' : 'text-slate-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span className="font-bold text-slate-700">Pause Streak</span>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-lg ${profile.pause_streak ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                  {profile.pause_streak ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REWARDS (Dark theme) */}
          <div className="lg:col-span-7 w-full bg-[#e2e8f0] rounded-[2rem] shadow-inner border border-slate-200 p-6 lg:p-8">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Rewards Choices</h2>
            <div className="space-y-4">
              {rewardsList.map((reward) => {
                const canAfford = profile.points >= reward.cost;
                const isRedeeming = redeemingId === reward.id;
                return (
                  <div key={reward.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl flex-shrink-0">{reward.icon}</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{reward.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5 leading-snug">{reward.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <span className={`font-extrabold text-sm ${canAfford ? 'text-blue-600' : 'text-slate-400'}`}>{reward.cost} pts</span>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford || isRedeeming}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all w-full sm:w-auto ${
                          isRedeeming ? "bg-slate-200 text-slate-500" : canAfford ? "bg-[#27272a] text-white hover:bg-black active:scale-[0.97]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isRedeeming ? "Redeeming..." : "Redeem"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
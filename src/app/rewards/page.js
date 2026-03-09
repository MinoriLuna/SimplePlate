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
    total_xp: 0,
    current_streak: 0,
    pause_streak: false,
    id: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsList, setRewardsList] = useState([]); 
  const [redemptionHistory, setRedemptionHistory] = useState([]); 
  const [redeemingId, setRedeemingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Quests Data (Restored)
  const [quests] = useState([
    { id: 1, title: "The Verdant Knight", description: "Eat 50% veggies in one meal.", xp: 30, done: false },
    { id: 2, title: "Hydration Ritual", description: "Log 8 glasses of water.", xp: 20, done: true }
  ]);

  useEffect(() => {
    const fetchRewardsData = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // 2. Fetch Rewards Catalog from DB
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .order("cost", { ascending: true });

      // 3. Fetch Redemption History
      const { data: historyData } = await supabase
        .from("redemptions")
        .select(`
          redeemed_at,
          rewards (title)
        `)
        .eq("user_id", session.user.id)
        .order("redeemed_at", { ascending: false })
        .limit(3);

      if (profileData) {
        setProfile({
          id: profileData.id,
          points: profileData.points || 0,
          total_xp: profileData.total_xp || 0,
          current_streak: profileData.current_streak || 0,
          pause_streak: profileData.pause_streak || false
        });
      }

      if (rewardsData) setRewardsList(rewardsData);
      if (historyData) setRedemptionHistory(historyData);
      
      setIsLoading(false);
    };

    fetchRewardsData();
  }, [router]);

  const handleRedeem = async (reward) => {
    if (profile.points < reward.cost) return;
    setRedeemingId(reward.id);
    
    const newPoints = profile.points - reward.cost;
    const profileUpdates = { points: newPoints };

    if (reward.item_type === "streak_freeze") {
      profileUpdates.pause_streak = true;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", profile.id);

    if (profileError) {
      alert("Redemption failed.");
      setRedeemingId(null);
      return;
    }

    // Log to Redemptions Table
    await supabase.from("redemptions").insert([
      { user_id: profile.id, reward_id: reward.id, status: 'completed' }
    ]);

    setProfile({ ...profile, ...profileUpdates });
    setSuccessMsg(`Successfully redeemed: ${reward.title}!`);
    
    // Refresh history locally
    setRedemptionHistory([{
      redeemed_at: new Date().toISOString(),
      rewards: { title: reward.title }
    }, ...redemptionHistory].slice(0, 3));

    setTimeout(() => setSuccessMsg(""), 3000);
    setRedeemingId(null);
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Loading Rewards...</div>;

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const progressToNextLevel = (profile.total_xp || 0) % 100;

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] flex flex-col font-sans text-slate-800">
      <div className="py-20">
        <div className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:py-10 pb-10">
          
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm text-center font-bold flex justify-center items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: PROGRESS, MISSIONS, & HISTORY */}
            <div className="lg:col-span-5 w-full space-y-6 lg:sticky lg:top-10">
              
              {/* Real Stats Card */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Your Progress</h2>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Level {currentLevel}</span>
                    <span className="text-[10px] font-bold text-slate-400">{profile.total_xp % 100}/100 XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progressToNextLevel}%` }} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl border border-slate-100">🎁</div>
                      <span className="font-bold text-slate-700 text-sm">Balance</span>
                    </div>
                    <span className="text-xl font-extrabold text-blue-600">{profile.points}</span>
                  </div>
                </div>
              </div>

              {/*Daily Missions Card */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6">Daily Missions</h2>
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <div key={quest.id} className={`rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 ${quest.done ? 'bg-green-50/50 border-green-100 opacity-60' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${quest.done ? 'bg-green-500 text-white' : 'bg-white text-slate-300 border border-slate-200'}`}>
                          {quest.done ? '✓' : '!'}
                        </div>
                        <div>
                          <h3 className={`font-bold text-sm ${quest.done ? 'text-green-800 line-through' : 'text-slate-800'}`}>{quest.title}</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{quest.description}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-blue-600">+{quest.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: REWARDS CHOICE  */}
            <div className="lg:col-span-7 w-full bg-[#e2e8f0] rounded-[2rem] shadow-inner border border-slate-200 p-6 lg:p-8 h-fit">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Item Shop</h2>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-4">
                {rewardsList.map((reward) => {
                  const canAfford = profile.points >= reward.cost;
                  const isRedeeming = redeemingId === reward.id;
                  const isOwned = profile.pause_streak && reward.item_type === "streak_freeze";

                  return (
                    <div key={reward.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                      <div>
                        <h3 className="font-bold text-slate-900">{reward.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5 leading-snug">{reward.description}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <span className={`font-extrabold text-sm ${canAfford ? 'text-blue-600' : 'text-slate-400'}`}>{reward.cost} pts</span>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canAfford || isRedeeming || isOwned}
                          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all w-full sm:w-auto ${
                            isRedeeming ? "bg-slate-200 text-slate-500" : isOwned ? "bg-green-100 text-green-700 cursor-default" : canAfford ? "bg-[#27272a] text-white hover:bg-black active:scale-[0.97]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {isRedeeming ? "..." : isOwned ? "Owned" : "Redeem"}
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
    </div>
  );
}
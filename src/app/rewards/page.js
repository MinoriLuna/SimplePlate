"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { processRedemption, ownsItem } from "../../lib/rewards";

export default function Rewards() {
  const router = useRouter();
  
  const [profile, setProfile] = useState({
    points: 0,
    total_xp: 0,
    current_streak: 0,
    inventory: [],
    xp_boost_expires_at: null,
    points_boost_expires_at: null,
    id: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsList, setRewardsList] = useState([]); 
  const [redeemingId, setRedeemingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Helper to calculate time remaining for the UI
  const getTimeLeft = (expiry) => {
    if (!expiry) return null;
    const now = new Date();
    const end = new Date(expiry);
    const diff = end - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  useEffect(() => {
    const fetchRewardsData = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data: stats } = await supabase
        .from("user_stats")
        .select(`*`)
        .eq("id", session.user.id)
        .single();

      if (stats) {
        setProfile({
          id: stats.id,
          points: Number(stats.points || 0),
          total_xp: Number(stats.total_xp || 0), 
          current_streak: Number(stats.current_streak || 0),
          inventory: (stats.inventory || []).map(Number),
          xp_boost_expires_at: stats.xp_boost_expires_at,
          points_boost_expires_at: stats.points_boost_expires_at,
          pause_streak: !!stats.pause_streak
        });
      }

      const { data: rewards } = await supabase
        .from("rewards")
        .select("*")
        .order("cost", { ascending: true });

      if (rewards) setRewardsList(rewards);
      setIsLoading(false);
    };

    fetchRewardsData();
  }, [router]);

  const handleRedeem = async (reward) => {
    setRedeemingId(reward.id);
    const result = await processRedemption(supabase, profile, reward);

    if (result.success) {
      setProfile(prev => ({ ...prev, ...result.updates }));
      setSuccessMsg(`Successfully redeemed: ${reward.title}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      alert(result.error);
    }
    setRedeemingId(null);
  };

  if (isLoading) return <div className="p-10 pt-32 text-center font-black text-slate-400 uppercase tracking-widest text-xs">Loading Shop...</div>;

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const progressToNextLevel = (profile.total_xp || 0) % 100;
  const hasBadge = ownsItem(profile.inventory, 4);

  // Calculate timer strings
  const xpTimer = getTimeLeft(profile.xp_boost_expires_at);
  const pointsTimer = getTimeLeft(profile.points_boost_expires_at);

  return (
    /* h-screen + overflow-hidden locks the page to the laptop window size */
    <div className="h-screen bg-[#f0f2f5] flex flex-col font-sans text-slate-800 overflow-hidden">
      
      {/* pt-28 and pb-28 clear the sticky header/footer. min-h-0 allows shrinking */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28 flex flex-col min-h-0">
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-[10px] text-center font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-grow min-h-0">
          
          {/* LEFT COLUMN: PROGRESS & ACTIVE BOOSTS */}
          <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
            
            {/* Progress Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 shrink-0">
              <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Your Progress!</h2>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2 px-1">
                  <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Level {currentLevel}</span>
                      {hasBadge && (<img src="/images/goldenbadge.png" alt="Golden Badge" className="w-6 h-6 object-contain" />)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{progressToNextLevel}/100 XP</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progressToNextLevel}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-sm border border-slate-100">🎁</div>
                  <span className="font-bold text-slate-700 text-xs    tracking-wider">Balance</span>
                </div>
                <span className="text-xl font-black text-blue-600">{profile.points}</span>
              </div>
            </div>

            {/* ACTIVE BOOSTS (Replacing Quests) */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8 shrink-0">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Active Boosts</h2>
              <div className="space-y-3">
                
                {/* XP Boost Status */}
                <div className={`p-4 rounded-2xl border transition-all ${xpTimer ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-xs ${xpTimer ? 'text-indigo-600' : 'text-slate-400'}`}>2x XP Booster</span>
                    {xpTimer && <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase animate-pulse">Active</span>}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${xpTimer ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {xpTimer || "Not Active"}
                  </p>
                </div>

                {/* Points Boost Status */}
                <div className={`p-4 rounded-2xl border transition-all ${pointsTimer ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-xs ${pointsTimer ? 'text-blue-600' : 'text-slate-400'}`}>2x Points Booster</span>
                    {pointsTimer && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase animate-pulse">Active</span>}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${pointsTimer ? 'text-blue-400' : 'text-slate-300'}`}>
                    {pointsTimer || "Not Active"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ITEM SHOP */}
          <div className="lg:col-span-7 w-full bg-[#e2e8f0] rounded-[2.5rem] shadow-inner border border-slate-200 p-6 lg:p-8 flex flex-col min-h-0">
            <h2 className="text-2xl font-black text-slate-800 mb-6 px-2">Item Shop</h2>
            
            {/* Only the shop list scrolls inside this container */}
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2 min-h-0">
              {rewardsList.map((reward) => {
                const canAfford = profile.points >= reward.cost;
                const isRedeeming = redeemingId === reward.id;

                const isCurrentlyActiveBoost = 
                (reward.item_type === "xp_boost" && xpTimer) || 
                (reward.item_type === "point_boost" && pointsTimer);

                // NEW LOGIC: Is this specific boost currently active?
                const isActive = (reward.item_type === "xp_boost" && xpTimer) || (reward.item_type === "point_boost" && pointsTimer);
                
                // Cosmetics are permanent, boosts are timed
                const isOwned = reward.item_type === "cosmetic" && ownsItem(profile.inventory, reward.id);

                return (
                  <div key={reward.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base">{reward.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{reward.description}</p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <span className={`font-black text-sm ${isActive ? 'text-indigo-600' : canAfford ? 'text-blue-600' : 'text-slate-300'}`}>
                        {reward.cost} pts
                      </span>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford || isRedeeming || isOwned || isActive}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto ${
                          isRedeeming ? "bg-slate-200 text-slate-500" :
                          isActive ? "bg-indigo-600 text-white cursor-default" : // Active Purple State
                          isOwned ? "bg-[#00b252] text-white cursor-default" : 
                          canAfford ? "bg-[#27272a] text-white hover:bg-black active:scale-[0.97]" :
                          "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isRedeeming ? "..." : isActive ? "Active" : isOwned ? "Owned" : "Redeem"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
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
    id: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsList, setRewardsList] = useState([]); 
  const [redeemingId, setRedeemingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

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

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Rewards...</div>;

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const progressToNextLevel = (profile.total_xp || 0) % 100;

  // Check for Golden Plate Badge (ID 4)
  const hasBadge = ownsItem(profile.inventory, 4);

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] flex flex-col font-sans text-slate-800">
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28 pb-12">
          
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm text-center font-bold flex justify-center items-center gap-2 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: PROGRESS & MISSIONS */}
            <div className="lg:col-span-5 w-full space-y-6 lg:sticky lg:top-10">
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 lg:p-8">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Your Progress</h2>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Level {currentLevel}</span>
                        {/* THE BADGE ADDED HERE */}
                        {hasBadge && (<img src="/images/goldenbadge.png" alt="Golden Badge" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{progressToNextLevel}/100 XP</span>
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
            </div>

            {/* RIGHT COLUMN: ITEM SHOP */}
            <div className="lg:col-span-7 w-full bg-[#e2e8f0] rounded-[2rem] shadow-inner border border-slate-200 p-6 lg:p-8 h-fit">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Item Shop</h2>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-4">
                {rewardsList.map((reward) => {
                  const canAfford = profile.points >= reward.cost;
                  const isRedeeming = redeemingId === reward.id;

                  const ownedType = reward.item_type === "cosmetic" || reward.item_type === "xp_boost";
                  const isOwned = ownedType && ownsItem(profile.inventory, reward.id);

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
                            isRedeeming ? "bg-slate-200 text-slate-500" :
                            isOwned ? "bg-[#00b252] text-white cursor-default" : 
                            canAfford ? "bg-[#27272a] text-white hover:bg-black active:scale-[0.97]" :
                            "bg-slate-100 text-slate-400 cursor-not-allowed"
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
      </main>
    </div>
  );
}
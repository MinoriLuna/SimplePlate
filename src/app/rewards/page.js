"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { processRedemption, ownsItem } from "../../lib/rewards";
import { GiftIcon } from "../../components/icons/Icons";
import { motion } from "framer-motion";

export default function Rewards() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    points: 0, total_xp: 0, current_streak: 0, inventory: [],
    xp_boost_expires_at: null, points_boost_expires_at: null, id: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsList, setRewardsList] = useState([]);
  const [redeemingId, setRedeemingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const getTimeLeft = (expiry) => {
    if (!expiry) return null;
    const diff = new Date(expiry) - new Date();
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

      const { data: stats } = await supabase.from("user_stats").select("*").eq("id", session.user.id).single();
      if (stats) {
        setProfile({
          id: stats.id,
          points: Number(stats.points || 0),
          total_xp: Number(stats.total_xp || 0),
          current_streak: Number(stats.current_streak || 0),
          inventory: (stats.inventory || []).map(Number),
          xp_boost_expires_at: stats.xp_boost_expires_at,
          points_boost_expires_at: stats.points_boost_expires_at,
          pause_streak: !!stats.pause_streak,
        });
      }

      const { data: rewards } = await supabase.from("rewards").select("*").order("cost", { ascending: true });
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

  const currentLevel = Math.floor((profile.total_xp || 0) / 100) + 1;
  const progressToNextLevel = (profile.total_xp || 0) % 100;
  const hasBadge = ownsItem(profile.inventory, 4);
  const xpTimer = getTimeLeft(profile.xp_boost_expires_at);
  const pointsTimer = getTimeLeft(profile.points_boost_expires_at);

  if (isLoading) return null;  // AppShell shows transition overlay instead

  return (
    <div className="min-h-screen font-sans text-slate-800">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-5 lg:px-8 py-5">
        <h1 className="text-xl font-black text-slate-900">Rewards</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Spend your points on boosts and cosmetics.</p>
      </div>

      <div className="p-6 lg:p-8">
        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-[10px] text-center font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-5 space-y-4">

            {/* Level progress */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-base font-black text-slate-900 mb-4">Your Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Level {currentLevel}</span>
                    {hasBadge && <img src="/images/goldenbadge.png" alt="Badge" className="w-5 h-5 object-contain" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{progressToNextLevel}/100 XP</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000 rounded-full" style={{ width: `${progressToNextLevel}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center border border-green-100">
                    <GiftIcon className="w-4 h-4 text-[#00b252]" />
                  </div>
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">Balance</span>
                </div>
                <span className="text-xl font-black text-[#00b252]">{profile.points} pts</span>
              </div>
            </div>

            {/* Active Boosts */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Active Boosts</h2>
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border transition-all ${xpTimer ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-sm ${xpTimer ? "text-green-700" : "text-slate-400"}`}>2x XP Booster</span>
                    {xpTimer && (
                      <span className="bg-[#00b252] text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase animate-pulse">Active</span>
                    )}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${xpTimer ? "text-green-600" : "text-slate-300"}`}>{xpTimer || "Not Active"}</p>
                </div>

                <div className={`p-4 rounded-xl border transition-all ${pointsTimer ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-sm ${pointsTimer ? "text-blue-700" : "text-slate-400"}`}>2x Points Booster</span>
                    {pointsTimer && (
                      <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase animate-pulse">Active</span>
                    )}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${pointsTimer ? "text-blue-500" : "text-slate-300"}`}>{pointsTimer || "Not Active"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col" style={{ maxHeight: "calc(100vh - 180px)" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-base font-black text-slate-900">Item Shop</h2>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-5 space-y-3 min-h-0">
              {rewardsList.map((reward) => {
                const canAfford = profile.points >= reward.cost;
                const isRedeeming = redeemingId === reward.id;
                const isActive = (reward.item_type === "xp_boost" && xpTimer) || (reward.item_type === "point_boost" && pointsTimer);
                const isOwned = reward.item_type === "cosmetic" && ownsItem(profile.inventory, reward.id);

                return (
                  <div key={reward.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white hover:shadow-sm transition-all">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">{reward.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{reward.description}</p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className={`font-black text-sm ${isActive ? "text-[#00b252]" : canAfford ? "text-[#00b252]" : "text-slate-300"}`}>
                        {reward.cost} pts
                      </span>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford || isRedeeming || isOwned || isActive}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto ${
                          isRedeeming ? "bg-slate-200 text-slate-500" :
                          isActive ? "bg-[#00b252] text-white cursor-default" :
                          isOwned ? "bg-[#00b252] text-white cursor-not-allowed" :
                          canAfford ? "bg-surface-dark text-white hover:bg-gray-600 active:scale-[0.97]" :
                          "bg-slate-100 text-slate-300"
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
      </div>
    </div>
  );
}

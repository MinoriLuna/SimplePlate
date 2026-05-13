// Supabase sometimes returns BigInt; normalize everything to Number
const toNum = (val) => (val !== null && val !== undefined ? Number(val) : 0);

export const ownsItem = (inventory = [], id) => {
  const inv = Array.isArray(inventory) ? inventory : [];
  return inv.map(toNum).includes(toNum(id));
};

export const calculateMealRewards = (itemCount, stats = {}) => {
  const now = new Date();

  const xpExpiry = stats.xp_boost_expires_at ? new Date(stats.xp_boost_expires_at) : null;
  const isXPBoosted = xpExpiry && now < xpExpiry;

  const pointsExpiry = stats.points_boost_expires_at ? new Date(stats.points_boost_expires_at) : null;
  const isPointsBoosted = pointsExpiry && now < pointsExpiry;

  let xpGained = 10; // flat rate per log
  let pointsGained = toNum(itemCount) * 10; // 10 pts per food item

  if (isXPBoosted) xpGained *= 2;
  if (isPointsBoosted) pointsGained *= 2;

  return {
    xpGained,
    pointsGained,
    isBoostedXP: !!isXPBoosted,
    isBoostedPoints: !!isPointsBoosted
  };
};

export const processRedemption = async (supabase, profile, reward) => {
  try {
    if (!profile || !reward) return { success: false, error: "Invalid data" };

    const currentPoints = toNum(profile.points);
    const cost = toNum(reward.cost);
    const rewardId = toNum(reward.id);

    if (currentPoints < cost) return { success: false, error: "Insufficient points!" };

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    const expiryISO = expiryDate.toISOString();

    let updates = { points: currentPoints - cost };

    if (reward.item_type === "xp_boost") {
      updates.xp_boost_expires_at = expiryISO;
    } else if (reward.item_type === "point_boost") {
      updates.points_boost_expires_at = expiryISO;
    } else if (reward.item_type === "streak_freeze") {
      updates.pause_streak = true;
    } else if (reward.item_type === "cosmetic") {
      // cosmetics are permanent — add to inventory instead of a timer
      const inventory = (Array.isArray(profile.inventory) ? profile.inventory : []).map(toNum);
      if (inventory.includes(rewardId)) return { success: false, error: "Already owned!" };
      updates.inventory = Array.from(new Set([...inventory, rewardId]));
    }

    const { error } = await supabase
      .from("user_stats")
      .update(updates)
      .eq("id", profile.id);

    if (error) throw error;

    // log the redemption for the history page
    const { error: logError } = await supabase
      .from("redemptions")
      .insert({
        user_id: profile.id,
        reward_id: reward.id,
        status: 'active'
      });

    if (logError) {
      console.error("Redemption log failed, but points were deducted:", logError);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("statsUpdated"));
    }

    return {
      success: true,
      updates: {
        ...updates,
        points: toNum(updates.points),
        inventory: updates.inventory ? updates.inventory.map(toNum) : profile.inventory
      }
    };
  } catch (err) {
    console.error("Redemption Error:", err);
    return { success: false, error: "Transaction failed." };
  }
};

// src/lib/rewards.js

// 1. Helper to safely convert anything to a standard number
const toNum = (val) => (val !== null && val !== undefined ? Number(val) : 0);

// 2. Helper to check if an item is in the inventory
export const ownsItem = (inventory = [], id) => {
  const inv = Array.isArray(inventory) ? inventory : [];
  return inv.map(toNum).includes(toNum(id));
};

/**
 * NEW: The XP Multiplier Logic
 * Use this in your LogMeal page before updating the database.
 */
export const calculateMealRewards = (itemCount, inventory = []) => {
  let xpGained = 10; 
  let pointsGained = toNum(itemCount) * 10;

  const hasBooster = ownsItem(inventory, 2);
  if (hasBooster) {
    xpGained = xpGained * 2; 
  }

  return { xpGained, pointsGained, isBoosted: hasBooster };
};

/**
 * Handles the purchase/redemption logic
 */
export const processRedemption = async (supabase, profile, reward) => {
  try {
    if (!profile || !reward) return { success: false, error: "Invalid data" };

    const currentPoints = toNum(profile.points);
    const cost = toNum(reward.cost);
    const rewardId = toNum(reward.id);

    if (currentPoints < cost) return { success: false, error: "Insufficient points!" };

    const inventory = (Array.isArray(profile.inventory) ? profile.inventory : []).map(toNum);

    // Prevent double-buying permanent/perk items
    const isPermanent = reward.item_type === "cosmetic" || reward.item_type === "xp_boost";
    if (isPermanent && inventory.includes(rewardId)) {
      return { success: false, error: "Already owned!" };
    }

    let updates = { 
      points: currentPoints - cost,
      inventory: isPermanent 
        ? Array.from(new Set([...inventory, rewardId])) 
        : inventory
    };

    if (reward.item_type === "streak_freeze") {
      updates.pause_streak = true;
    }

    const { error } = await supabase
      .from("user_stats")
      .update(updates)
      .eq("id", profile.id);

    if (error) throw error;

    return { 
      success: true, 
      updates: {
        points: toNum(updates.points),
        inventory: updates.inventory.map(toNum),
        pause_streak: !!updates.pause_streak
      } 
    };
  } catch (err) {
    console.error("Redemption Error:", err);
    return { success: false, error: "Critical update error." };
  }
};
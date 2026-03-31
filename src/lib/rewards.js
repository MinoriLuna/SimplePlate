// src/lib/rewards.js

// 1. Helper to safely convert BigInt/Strings to standard Numbers
const toNum = (val) => (val !== null && val !== undefined ? Number(val) : 0);

// 2. Helper to check if a specific ID exists in an inventory array
export const ownsItem = (inventory = [], id) => {
  const inv = Array.isArray(inventory) ? inventory : [];
  return inv.map(toNum).includes(toNum(id));
};

/**
 * XP and Points Calculator with 24-Hour Expiration Logic
 */
export const calculateMealRewards = (itemCount, stats = {}) => {
  const now = new Date();

  // Check if XP Boost is active (and not expired)
  const xpExpiry = stats.xp_boost_expires_at ? new Date(stats.xp_boost_expires_at) : null;
  const isXPBoosted = xpExpiry && now < xpExpiry;

  // Check if Points Boost is active (and not expired)
  const pointsExpiry = stats.points_boost_expires_at ? new Date(stats.points_boost_expires_at) : null;
  const isPointsBoosted = pointsExpiry && now < pointsExpiry;

  // Base Rewards
  let xpGained = 10; // Flat 10 XP per log
  let pointsGained = toNum(itemCount) * 10; // 10 Points per item

  // Apply Multipliers
  if (isXPBoosted) xpGained *= 2;
  if (isPointsBoosted) pointsGained *= 2;

  return { 
    xpGained, 
    pointsGained, 
    isBoostedXP: !!isXPBoosted,
    isBoostedPoints: !!isPointsBoosted
  };
};

/**
 * Handles the purchase and sets the 24-hour expiration timestamp
 */
export const processRedemption = async (supabase, profile, reward) => {
  try {
    if (!profile || !reward) return { success: false, error: "Invalid data" };

    const currentPoints = toNum(profile.points);
    const cost = toNum(reward.cost);
    const rewardId = toNum(reward.id);

    if (currentPoints < cost) return { success: false, error: "Insufficient points!" };

    // Calculate the 24-hour expiration timestamp
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    const expiryISO = expiryDate.toISOString();

    // Prepare the update object
    let updates = { 
      points: currentPoints - cost
    };

    // ITEM TYPE LOGIC
    if (reward.item_type === "xp_boost") {
      updates.xp_boost_expires_at = expiryISO;
    } 
    else if (reward.item_type === "point_boost") {
      updates.points_boost_expires_at = expiryISO;
    }
    else if (reward.item_type === "streak_freeze") {
      updates.pause_streak = true;
    }
    else if (reward.item_type === "cosmetic") {
      // Cosmetics (Badges) are permanent and go into the inventory array
      const inventory = (Array.isArray(profile.inventory) ? profile.inventory : []).map(toNum);
      if (inventory.includes(rewardId)) return { success: false, error: "Already owned!" };
      updates.inventory = Array.from(new Set([...inventory, rewardId]));
    }

    // Update user_stats in Supabase
    const { error } = await supabase
      .from("user_stats")
      .update(updates)
      .eq("id", profile.id);

    if (error) throw error;

    // Return the updated values so the UI can refresh immediately
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
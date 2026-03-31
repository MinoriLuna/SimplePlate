// src/lib/logmeal.js
import { calculateMealRewards } from "./rewards";

export const submitMealLog = async (supabase, session, currentPlate, mealType) => {
  if (!session) throw new Error("No session found");

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 1. Check for streak logic
  const { count: mealsToday } = await supabase
    .from("meals")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", session.user.id)
    .gte("logged_at", startOfToday.toISOString());

  const isFirstLogToday = mealsToday === 0;

  // 2. AI ANALYSIS: This is where we get the "Score"
  const mealsToInsert = await Promise.all(currentPlate.map(async (item) => {
    const aiResponse = await fetch("/api/analyze-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dish_name: item.dishName, portion_size: item.portion }),
    });
    const nutrition = await aiResponse.json();
    
    // We return the full nutrition object to be saved in the 'meals' table
    return {
      user_id: session.user.id,
      dish_name: item.dishName,
      portion_size: item.portion,
      meal_type: mealType,
      carbs_g: nutrition.carbs_g,
      protein_g: nutrition.protein_g,
      fat_g: nutrition.fat_g,
      vitamins: nutrition.vitamins,
      nourish_score: nutrition.nourish_score, // The "Score" lives here!
      logged_at: new Date().toISOString()
    };
  }));

  // 3. Insert into 'meals' table (This feeds your Progress page graphs)
  const { error: mealError } = await supabase.from("meals").insert(mealsToInsert);
  if (mealError) throw mealError;

  // 4. Fetch User Stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // 5. Calculate Rewards (Flat 10 XP, 10 Points per item)
  const { xpGained, pointsGained, isBoostedXP, isBoostedPoints } = calculateMealRewards(
    currentPlate.length, 
    stats
  );

  // 6. Streak math
  let newStreak = Number(stats.current_streak || 0);
  if (isFirstLogToday) {
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    
    const { data: yesterdayMeals } = await supabase
      .from("meals")
      .select("id")
      .eq("user_id", session.user.id)
      .gte("logged_at", yesterdayStart.toISOString())
      .lt("logged_at", startOfToday.toISOString())
      .limit(1);

    newStreak = (yesterdayMeals && yesterdayMeals.length > 0) ? newStreak + 1 : 1;
  }

  // 7. Update User Stats
  const { error: updateError } = await supabase.from("user_stats").update({
    points: Number(stats.points || 0) + pointsGained,
    total_xp: Number(stats.total_xp || 0) + xpGained,
    current_streak: newStreak
  }).eq("id", session.user.id);

  if (updateError) throw updateError;

  return { points: pointsGained, xp: xpGained, isBoostedXP, isBoostedPoints, streak: newStreak, isFirstLogToday };
};
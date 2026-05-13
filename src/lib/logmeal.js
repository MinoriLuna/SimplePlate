import { calculateMealRewards } from "./rewards";

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("ANALYSIS_TIMEOUT")), ms)
    ),
  ]);

export const submitMealLog = async (supabase, session, currentPlate, mealType, healthGoal) => {
  if (!session) throw new Error("No session found");

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { count: mealsToday } = await supabase
    .from("meals")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", session.user.id)
    .gte("logged_at", startOfToday.toISOString());

  const isFirstLogToday = mealsToday === 0;

  const mealsToInsert = await Promise.all(currentPlate.map(async (item) => {
    const aiResponse = await withTimeout(
      fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dish_name: item.dishName, portion_size: item.portion, health_goal: healthGoal }),
      }),
      30000
    );
    const nutrition = await aiResponse.json();

    return {
      user_id: session.user.id,
      dish_name: item.dishName,
      portion_size: item.portion,
      meal_type: mealType,
      carbs_g: nutrition.carbs_g,
      protein_g: nutrition.protein_g,
      fat_g: nutrition.fat_g,
      vitamins: nutrition.vitamins,
      nourish_score: nutrition.nourish_score,
      score_note: nutrition.score_note || null,
      logged_at: new Date().toISOString()
    };
  }));

  const { error: mealError } = await supabase.from("meals").insert(mealsToInsert);
  if (mealError) throw mealError;

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const { xpGained, pointsGained, isBoostedXP, isBoostedPoints } = calculateMealRewards(
    currentPlate.length,
    stats
  );

  // Extend or reset the streak based on whether the user logged yesterday
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

  const { error: updateError } = await supabase.from("user_stats").update({
    points: Number(stats.points || 0) + pointsGained,
    total_xp: Number(stats.total_xp || 0) + xpGained,
    current_streak: newStreak
  }).eq("id", session.user.id);

  if (updateError) throw updateError;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("statsUpdated"));
  }

  return { points: pointsGained, xp: xpGained, isBoostedXP, isBoostedPoints, streak: newStreak, isFirstLogToday };
};

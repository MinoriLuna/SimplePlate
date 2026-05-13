export const StreakCount = async (supabase, userId) => {
  try {
    const { data: stats, error } = await supabase
      .from("user_stats")
      .select("current_streak, pause_streak, lastchecked")
      .eq("id", userId)
      .single();

    if (error || !stats) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastCheckStr = stats.lastchecked ? stats.lastchecked.split('T')[0] : null;

    // already ran today — skip
    if (todayStr === lastCheckStr) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

    const { count: yesterdayLogs } = await supabase
      .from("meals")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .gte("logged_at", start)
      .lte("logged_at", end);

    if (yesterdayLogs === 0) {
      if (stats.pause_streak) {
        // shield active: absorb the miss, clear the shield
        await supabase
          .from("user_stats")
          .update({
            pause_streak: false,
            lastchecked: now.toISOString()
          })
          .eq("id", userId);
      } else {
        // no protection left, reset streak
        await supabase
          .from("user_stats")
          .update({
            current_streak: 0,
            lastchecked: now.toISOString()
          })
          .eq("id", userId);
      }
    } else {
      // user logged yesterday, mark today as checked without touching the streak count
      await supabase
        .from("user_stats")
        .update({ lastchecked: now.toISOString() })
        .eq("id", userId);
    }

  } catch (err) {
    console.error("StreakCount Error:", err);
  }
};

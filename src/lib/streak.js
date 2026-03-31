export const StreakCount = async (supabase, userId) => {
  try {
    // 1. Fetch current user stats
    const { data: stats, error } = await supabase
      .from("user_stats")
      .select("current_streak, pause_streak, lastchecked")
      .eq("id", userId)
      .single();

    if (error || !stats) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastCheckStr = stats.lastchecked ? stats.lastchecked.split('T')[0] : null;

    // Stop if we've already performed the check today
    if (todayStr === lastCheckStr) return;

    // 2. Define the "Yesterday" window
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

    // 3. Check for logs from yesterday
    const { count: yesterdayLogs } = await supabase
      .from("meals")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .gte("logged_at", start)
      .lte("logged_at", end);

    // 4. THE CORE LOGIC: Reset or Shield
    if (yesterdayLogs === 0) {
      if (stats.pause_streak) {
        // SHIELD ACTIVE: Consume the shield but SAVE the streak number
        await supabase
          .from("user_stats")
          .update({ 
            pause_streak: false, 
            lastchecked: now.toISOString() 
          })
          .eq("id", userId);
          
        console.log("Shield used. Streak preserved.");
      } else {
        // NO SHIELD: Wipe the streak
        await supabase
          .from("user_stats")
          .update({ 
            current_streak: 0, 
            lastchecked: now.toISOString() 
          })
          .eq("id", userId);

        console.log("No shield found. Streak reset to 0.");
      }
    } else {
      // User logged yesterday, just mark today as checked
      await supabase
        .from("user_stats")
        .update({ lastchecked: now.toISOString() })
        .eq("id", userId);
    }

  } catch (err) {
    console.error("StreakCount Error:", err);
  }
};
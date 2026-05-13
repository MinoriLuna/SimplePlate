import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles").select("is_admin").eq("id", user.id).single();
    if (!callerProfile?.is_admin) return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { targetId } = body;
    if (!targetId) return Response.json({ error: "Missing targetId" }, { status: 400 });

    const username = typeof body.username === "string" ? body.username.trim().slice(0, 50) : undefined;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;
    const gender = ["Male", "Female"].includes(body.gender) ? body.gender : undefined;
    const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : undefined;
    const is_admin = typeof body.is_admin === "boolean" ? body.is_admin : undefined;
    const points = Number.isFinite(body.points) ? Math.max(0, Math.min(Math.round(body.points), 1_000_000)) : undefined;
    const current_streak = Number.isFinite(body.current_streak) ? Math.max(0, Math.min(Math.round(body.current_streak), 3650)) : undefined;
    const total_xp = Number.isFinite(body.total_xp) ? Math.max(0, Math.min(Math.round(body.total_xp), 1_000_000)) : undefined;

    if (email) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(targetId, { email });
      if (authErr) throw authErr;
    }

    const profileFields = Object.fromEntries(
      Object.entries({ username, name, gender, is_admin, ...(email ? { email } : {}) })
        .filter(([, v]) => v !== undefined)
    );
    if (Object.keys(profileFields).length > 0) {
      const { error: profileErr } = await supabaseAdmin
        .from("profiles")
        .update(profileFields)
        .eq("id", targetId);
      if (profileErr) throw profileErr;
    }

    const statsFields = Object.fromEntries(
      Object.entries({ points, current_streak, total_xp })
        .filter(([, v]) => v !== undefined)
    );
    if (Object.keys(statsFields).length > 0) {
      const { error: statsErr } = await supabaseAdmin
        .from("user_stats")
        .update(statsFields)
        .eq("id", targetId);
      if (statsErr) throw statsErr;
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Admin update-user error:", err);
    const message = err?.message || err?.error_description || String(err) || "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

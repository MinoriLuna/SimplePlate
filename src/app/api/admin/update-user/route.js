//File is made for RLS Supabase bypass for admin user management. 
//This is a backend API route that only admins can access to update other users' data safely without RLS getting in the way. 
// It uses the Supabase service role key which has "god mode" access

import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    // SETUP THE ADMIN BYPASS
    // We use the SUPABASE_SERVICE_ROLE_KEY here instead of the normal anon key.
    // This gives this specific backend route "god mode" to bypass Row Level Security (RLS)
    // so we can edit other users' data safely on the server.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const authHeader = req.headers.get("authorization"); // Token
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");

    //Check token belongs to who
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    //Make sure they admin
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles").select("is_admin").eq("id", user.id).single();
    if (!callerProfile?.is_admin) return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json(); //Make it back to json
    const { targetId } = body;
    if (!targetId) return Response.json({ error: "Missing targetId" }, { status: 400 });

    // Validate and clean inputs
    //If a value is bad or missing, we set it to 'undefined'
    const username = typeof body.username === "string" ? body.username.trim().slice(0, 50) : undefined;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;
    const gender = ["Male", "Female"].includes(body.gender) ? body.gender : undefined;
    const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : undefined;
    const is_admin = typeof body.is_admin === "boolean" ? body.is_admin : undefined;

    //Make sure the numbers are numbers and round them.
    const points = Number.isFinite(body.points) ? Math.max(0, Math.min(Math.round(body.points), 1_000_000)) : undefined;
    const current_streak = Number.isFinite(body.current_streak) ? Math.max(0, Math.min(Math.round(body.current_streak), 3650)) : undefined;
    const total_xp = Number.isFinite(body.total_xp) ? Math.max(0, Math.min(Math.round(body.total_xp), 1_000_000)) : undefined;

    //Email lives in a special Supabase Auth system, so we must use a special admin function to update it.
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

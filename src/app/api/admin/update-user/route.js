import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles").select("is_admin").eq("id", user.id).single();
    if (!callerProfile?.is_admin) return Response.json({ error: "Forbidden" }, { status: 403 });

    const { targetId, username, is_admin, points, current_streak, total_xp } = await req.json();
    if (!targetId) return Response.json({ error: "Missing targetId" }, { status: 400 });

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({ username, is_admin })
      .eq("id", targetId);
    if (profileErr) throw profileErr;

    const { error: statsErr } = await supabaseAdmin
      .from("user_stats")
      .update({ points, current_streak, total_xp })
      .eq("id", targetId);
    if (statsErr) throw statsErr;

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

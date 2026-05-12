import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const admin = createAdminClient();
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller has school subscription
  const { data: sub } = await admin
    .from("subscriptions")
    .select("tier, status")
    .eq("family_id", user.id)
    .maybeSingle();

  if (!sub || sub.tier !== "school" || (sub.status !== "active" && sub.status !== "trialing")) {
    return NextResponse.json({ error: "School subscription required" }, { status: 403 });
  }

  // Fetch all student profiles (school license = teacher manages a class)
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, vorname, nachname, avatar, klasse, xp, last_seen")
    .neq("id", user.id)
    .order("xp", { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // For each student, count exercises this week
  const students = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const { count } = await admin
        .from("progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", p.id)
        .gte("completed_at", weekAgo.toISOString());

      const { count: total } = await admin
        .from("progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", p.id);

      return {
        id: p.id as string,
        vorname: p.vorname as string | null,
        nachname: p.nachname as string | null,
        avatar: (p.avatar as string) ?? "🦊",
        klasse: p.klasse as number | null,
        xp: (p.xp as number) ?? 0,
        last_seen: p.last_seen as string | null,
        exercisesThisWeek: count ?? 0,
        totalExercises: total ?? 0,
      };
    }),
  );

  return NextResponse.json({ students });
}

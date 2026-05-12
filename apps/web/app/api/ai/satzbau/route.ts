import { NextRequest, NextResponse } from "next/server";
import { generateSatzbauExercises } from "@/lib/ai-content";
import { checkRateLimit, getIpKey } from "@/lib/rate-limit";
import { logError } from "@/lib/logging";

export async function POST(req: NextRequest) {
  const rateLimitKey = getIpKey(req, "claude");
  if (!checkRateLimit(rateLimitKey, 20).allowed) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte morgen wieder versuchen." }, { status: 429 });
  }
  try {
    const { grade, count, userId } = (await req.json()) as { grade: number; count: number; userId?: string };
    const exercises = await generateSatzbauExercises(grade, count, userId);
    return NextResponse.json(exercises);
  } catch (err) {
    console.error("Satzbau route error:", err);
    void logError({ errorType: "satzbau_route_error", errorMessage: String(err).slice(0, 500), page: "uebungen" });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

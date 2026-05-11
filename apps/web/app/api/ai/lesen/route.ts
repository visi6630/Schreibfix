import { NextRequest, NextResponse } from "next/server";
import { generateReadingText } from "@/lib/ai-content";
import { checkRateLimit, getIpKey } from "@/lib/rate-limit";
import { logError } from "@/lib/logging";

export async function POST(req: NextRequest) {
  const rateLimitKey = getIpKey(req, "claude");
  if (!checkRateLimit(rateLimitKey, 20).allowed) {
    return NextResponse.json(
      { error: "Du hast heute schon viel geübt! Komm morgen wieder." },
      { status: 429 },
    );
  }

  try {
    const { grade, topic, userId } = (await req.json()) as {
      grade: number;
      topic?: string;
      userId?: string;
    };
    const text = await generateReadingText(grade, topic, userId);
    return NextResponse.json(text);
  } catch (err) {
    console.error("Lesen route error:", err);
    void logError({
      errorType: "lesen_route_error",
      errorMessage: String(err).slice(0, 500),
      page: "lesen",
    });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateDiktatSentences } from "@/lib/ai-content";
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
    const { grade, weakWords, topic, userId } = (await req.json()) as {
      grade: number;
      weakWords: string[];
      topic?: string;
      userId?: string;
    };
    const sentences = await generateDiktatSentences(grade, weakWords, topic, userId);
    return NextResponse.json(sentences);
  } catch (err) {
    console.error("Diktat route error:", err);
    void logError({
      errorType: "diktat_route_error",
      errorMessage: String(err).slice(0, 500),
      page: "diktat",
    });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

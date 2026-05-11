import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getIpKey } from "@/lib/rate-limit";
import { logApiCall, logError, computeClaudeCost } from "@/lib/logging";

export async function POST(req: NextRequest) {
  const rateLimitKey = getIpKey(req, "claude");
  if (!checkRateLimit(rateLimitKey, 20).allowed) {
    return NextResponse.json({ text: "" });
  }

  const { xp, totalExercises, topWeakWords, klasse, userId } =
    (await req.json()) as {
      xp: number;
      totalExercises: number;
      topWeakWords: string[];
      klasse: number;
      userId?: string;
    };

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ text: "" });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const weakPart =
      topWeakWords.length > 0
        ? ` Häufig falsch geschriebene Wörter: ${topWeakWords.join(", ")}.`
        : "";
    const prompt = `Du bist ein freundlicher Lernassistent für Eltern einer Grundschulklasse. Schreibe 2-3 kurze, motivierende deutsche Sätze über den Lernfortschritt eines Kindes in Klasse ${klasse}. Das Kind hat ${xp} XP gesammelt und ${totalExercises} Übungen absolviert.${weakPart} Sei positiv und konkret, ohne übertrieben zu sein.`;

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    void logApiCall({
      userId,
      apiType: "claude",
      endpoint: "encouragement",
      tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens,
      costEstimate: computeClaudeCost(
        msg.usage.input_tokens,
        msg.usage.output_tokens,
      ),
    });

    const text =
      msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Encouragement API error:", err);
    void logError({
      userId,
      errorType: "encouragement_api_error",
      errorMessage: String(err).slice(0, 500),
      page: "eltern",
    });
    return NextResponse.json({ text: "" });
  }
}

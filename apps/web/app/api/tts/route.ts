import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getIpKey } from "@/lib/rate-limit";
import { logApiCall, logError, computeElevenLabsCost } from "@/lib/logging";

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — free-tier compatible

export async function POST(req: NextRequest) {
  // Rate limiting: 50 ElevenLabs calls per hour per IP
  const rateLimitKey = getIpKey(req, "tts");
  if (!checkRateLimit(rateLimitKey, 50).allowed) {
    return NextResponse.json(
      { error: "Du hast heute schon viel geübt! Komm morgen wieder." },
      { status: 429 },
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no key" }, { status: 503 });

  const { text, slow, userId } = (await req.json()) as {
    text: string;
    slow: boolean;
    userId?: string;
  };

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            ...(slow ? { speaking_rate: 0.7 } : {}),
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs API error:", res.status, errText);
      void logError({
        userId,
        errorType: "elevenlabs_api_error",
        errorMessage: `HTTP ${res.status}: ${errText.slice(0, 200)}`,
        page: "tts",
      });
      return NextResponse.json({ error: "ElevenLabs failed" }, { status: 502 });
    }

    const characters = text.length;
    void logApiCall({
      userId,
      apiType: "elevenlabs",
      endpoint: "tts",
      charactersUsed: characters,
      costEstimate: computeElevenLabsCost(characters),
    });

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("TTS route error:", err);
    void logError({
      userId,
      errorType: "tts_exception",
      errorMessage: String(err).slice(0, 500),
      page: "tts",
    });
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }
}

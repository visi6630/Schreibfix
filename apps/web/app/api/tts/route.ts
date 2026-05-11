import { NextRequest, NextResponse } from "next/server";

const VOICE_ID = "XB0fDUnXU5powFXDhCwa"; // Charlotte — speaks German well

export async function POST(req: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return NextResponse.json({ error: "no key" }, { status: 503 });

  const { text, slow } = (await req.json()) as { text: string; slow: boolean };

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
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
    });

    if (!res.ok) {
      console.error("ElevenLabs API error:", res.status, await res.text());
      return NextResponse.json({ error: "ElevenLabs failed" }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }
}

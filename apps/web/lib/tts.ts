// Client-side TTS: ElevenLabs via server route if key is configured,
// otherwise falls back to Web Speech API.

let _audioCtx: AudioContext | null = null;
let _source: AudioBufferSourceNode | null = null;

function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  return _audioCtx;
}

export function stopSpeech(): void {
  if (_source) {
    try { _source.stop(); } catch { /* already stopped */ }
    _source = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export async function speakText(text: string, slow: boolean): Promise<void> {
  if (typeof window === "undefined") return;
  stopSpeech();

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, slow }),
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") await ctx.resume();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
      _source = source;
      return;
    }
  } catch {
    // fall through to Web Speech API
  }

  // Fallback: Web Speech API
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = slow ? 0.7 : 1.0;
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find((v) => v.lang.startsWith("de"));
  if (germanVoice) utterance.voice = germanVoice;
  window.speechSynthesis.speak(utterance);
}

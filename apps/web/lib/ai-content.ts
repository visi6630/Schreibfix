import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripJsonFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

function safeParseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(stripJsonFences(raw)) as T;
  } catch {
    console.error("AI JSON parse error. Raw:", raw.slice(0, 200));
    return fallback;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiktatSentenceAI {
  sentence: string;
  targetWords: string[];
  tip: string;
}

export interface VerbConjugationAI {
  sentence: string;
  verb: string;
  correctAnswer: string;
  wrongOptions: [string, string, string];
}

export interface ArtikelExerciseAI {
  noun: string;
  emoji: string;
  correctArticle: "der" | "die" | "das";
  hint: string;
}

export interface ReadingTextAI {
  title: string;
  text: string;
  questions: { question: string; answer: string }[];
}

// ─── A) generateDiktatSentences ───────────────────────────────────────────────

const DIKTAT_FALLBACK: DiktatSentenceAI[] = [
  { sentence: "Die Katze sitzt auf dem Dach.", targetWords: ["Katze", "Dach"], tip: "Nomen schreibt man groß." },
  { sentence: "Der Hund bellt laut im Garten.", targetWords: ["Hund", "Garten"], tip: "Achte auf ck und tz." },
  { sentence: "Wir gehen heute in die Schule.", targetWords: ["Schule"], tip: "Nomen groß schreiben!" },
  { sentence: "Das Mädchen liest ein Buch.", targetWords: ["Mädchen", "Buch"], tip: "ä kommt von a: Mädchen → Mädel." },
  { sentence: "Die Sonne scheint hell am Himmel.", targetWords: ["Sonne", "Himmel"], tip: "Nomen immer groß!" },
];

export async function generateDiktatSentences(
  grade: number,
  weakWords: string[],
  topic?: string
): Promise<DiktatSentenceAI[]> {
  const weakPart =
    weakWords.length > 0
      ? `Mindestens 3 Sätze müssen folgende Wörter natürlich enthalten: ${weakWords.slice(0, 8).join(", ")}.`
      : "";
  const topicPart = topic ? `Das Thema ist: ${topic}.` : "";

  const prompt = `Erstelle 5 korrekte deutsche Diktat-Sätze für Grundschule Klasse ${grade}.
${topicPart}
${weakPart}
Anforderungen:
- Klasse 1-2: kurze, einfache Sätze (5-8 Wörter), nur häufige Wörter
- Klasse 3-4: etwas komplexere Sätze (8-12 Wörter), können Nebensätze enthalten
- Grammatisch korrekt, natürlich klingend
- Kindgerechte Themen (Tiere, Schule, Familie, Natur)

Antworte NUR mit JSON-Array, kein weiterer Text:
[
  {
    "sentence": "Der Satz hier.",
    "targetWords": ["Schwieriges", "Wort"],
    "tip": "Kurzer Rechtschreibtipp auf Deutsch für Kinder."
  }
]`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<DiktatSentenceAI[]>(raw, DIKTAT_FALLBACK);
  } catch (err) {
    console.error("generateDiktatSentences error:", err);
    return DIKTAT_FALLBACK;
  }
}

// ─── B) generateVerbConjugation ───────────────────────────────────────────────

const VERB_FALLBACK: VerbConjugationAI[] = [
  { sentence: "Ich ___ Fußball. (spielen)", verb: "spielen", correctAnswer: "spiele", wrongOptions: ["spielst", "spielt", "spielen"] },
  { sentence: "Du ___ gern. (singen)", verb: "singen", correctAnswer: "singst", wrongOptions: ["singe", "singt", "singen"] },
  { sentence: "Er ___ das Buch. (lesen)", verb: "lesen", correctAnswer: "liest", wrongOptions: ["lese", "lesst", "lesen"] },
  { sentence: "Wir ___ zusammen. (lernen)", verb: "lernen", correctAnswer: "lernen", wrongOptions: ["lerne", "lernst", "lernt"] },
  { sentence: "Sie ___ ins Kino. (gehen)", verb: "gehen", correctAnswer: "geht", wrongOptions: ["gehe", "gehst", "gehen"] },
];

export async function generateVerbConjugation(
  grade: number,
  count: number
): Promise<VerbConjugationAI[]> {
  const tenses =
    grade <= 2
      ? "nur Präsens, Personen: ich / du / er"
      : "Präsens und Präteritum, alle Personen (ich, du, er/sie/es, wir, ihr, sie)";

  const prompt = `Erstelle ${count} deutsche Verbkonjugations-Übungen für Grundschule Klasse ${grade}.
Zeitformen: ${tenses}
- Verschiedene Verben, auch unregelmäßige
- Lückentext-Format: "Ich ___ Fußball. (spielen)"
- 3 falsche Optionen, die plausibel aber falsch sind

Antworte NUR mit JSON-Array:
[
  {
    "sentence": "Ich ___ Fußball. (spielen)",
    "verb": "spielen",
    "correctAnswer": "spiele",
    "wrongOptions": ["spielst", "spielt", "spielen"]
  }
]`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<VerbConjugationAI[]>(raw, VERB_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateVerbConjugation error:", err);
    return VERB_FALLBACK.slice(0, count);
  }
}

// ─── C) generateArtikelExercises ─────────────────────────────────────────────

const ARTIKEL_FALLBACK: ArtikelExerciseAI[] = [
  { noun: "Hund", emoji: "🐕", correctArticle: "der", hint: "Hund ist männlich." },
  { noun: "Katze", emoji: "🐈", correctArticle: "die", hint: "Katze ist weiblich." },
  { noun: "Pferd", emoji: "🐎", correctArticle: "das", hint: "Pferd ist sächlich." },
  { noun: "Apfel", emoji: "🍎", correctArticle: "der", hint: "Apfel ist männlich." },
  { noun: "Blume", emoji: "🌸", correctArticle: "die", hint: "Blume ist weiblich." },
];

export async function generateArtikelExercises(
  grade: number,
  count: number
): Promise<ArtikelExerciseAI[]> {
  const prompt = `Erstelle ${count} der/die/das Übungen für Grundschule Klasse ${grade}.
- Klasse 1-2: sehr häufige, bekannte Nomen
- Klasse 3-4: auch weniger häufige Nomen
- Passende Emojis verwenden
- Kurzer Hinweis auf Deutsch, warum dieser Artikel verwendet wird

Antworte NUR mit JSON-Array:
[
  {
    "noun": "Hund",
    "emoji": "🐕",
    "correctArticle": "der",
    "hint": "Hund ist männlich → der Hund"
  }
]`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<ArtikelExerciseAI[]>(raw, ARTIKEL_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateArtikelExercises error:", err);
    return ARTIKEL_FALLBACK.slice(0, count);
  }
}

// ─── D) generateReadingText ───────────────────────────────────────────────────

const READING_FALLBACK: ReadingTextAI = {
  title: "Der kleine Fuchs",
  text: "Ein kleiner Fuchs lebt im Wald. Er hat rotes Fell und einen buschigen Schwanz. Jeden Morgen sucht er Futter für seine Familie. Er findet Beeren und Pilze. Seine Mutter wartet schon auf ihn.",
  questions: [
    { question: "Wo lebt der Fuchs?", answer: "Im Wald" },
    { question: "Welche Farbe hat sein Fell?", answer: "Rotes Fell" },
    { question: "Was findet der Fuchs?", answer: "Beeren und Pilze" },
  ],
};

export async function generateReadingText(
  grade: number,
  topic?: string
): Promise<ReadingTextAI> {
  const sentenceGuide =
    grade === 1
      ? "2-3 sehr kurze, einfache Sätze (max. 5 Wörter pro Satz)"
      : grade === 2
      ? "4-5 einfache Sätze"
      : grade === 3
      ? "6-8 Sätze, ein Absatz, etwas komplexer"
      : "8-12 Sätze, zwei Absätze, für Klasse 4 geeignet";

  const topicPart = topic ? `Thema: ${topic}` : "Freies kindgerechtes Thema (Tiere, Natur, Abenteuer, Alltag)";

  const prompt = `Erstelle einen deutschen Lesetext für Grundschule Klasse ${grade}.
${topicPart}
Länge: ${sentenceGuide}
- Kindgerecht, interessant, altersgerecht
- Einfaches Vokabular für Klasse ${grade}
- 3 einfache Verständnisfragen zum Text

Antworte NUR mit JSON:
{
  "title": "Titel des Textes",
  "text": "Der vollständige Lesetext hier.",
  "questions": [
    { "question": "Frage?", "answer": "Antwort" }
  ]
}`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<ReadingTextAI>(raw, READING_FALLBACK);
  } catch (err) {
    console.error("generateReadingText error:", err);
    return READING_FALLBACK;
  }
}

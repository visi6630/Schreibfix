import Anthropic from "@anthropic-ai/sdk";
import { logApiCall, logError, computeClaudeCost } from "./logging";

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
  topic?: string,
  userId?: string,
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
    void logApiCall({
      userId,
      apiType: "claude",
      endpoint: "diktat",
      tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens,
      costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens),
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<DiktatSentenceAI[]>(raw, DIKTAT_FALLBACK);
  } catch (err) {
    console.error("generateDiktatSentences error:", err);
    void logError({ userId, errorType: "claude_diktat_error", errorMessage: String(err).slice(0, 500), page: "diktat" });
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
  count: number,
  userId?: string,
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
    void logApiCall({
      userId,
      apiType: "claude",
      endpoint: "verben",
      tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens,
      costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens),
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<VerbConjugationAI[]>(raw, VERB_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateVerbConjugation error:", err);
    void logError({ userId, errorType: "claude_verben_error", errorMessage: String(err).slice(0, 500), page: "uebungen" });
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
  count: number,
  userId?: string,
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
    void logApiCall({
      userId,
      apiType: "claude",
      endpoint: "artikel",
      tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens,
      costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens),
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<ArtikelExerciseAI[]>(raw, ARTIKEL_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateArtikelExercises error:", err);
    void logError({ userId, errorType: "claude_artikel_error", errorMessage: String(err).slice(0, 500), page: "uebungen" });
    return ARTIKEL_FALLBACK.slice(0, count);
  }
}

// ─── E) generatePluralExercises ──────────────────────────────────────────────

export interface PluralExerciseAI {
  singular: string;
  plural: string;
  wrongOptions: [string, string, string];
  hint: string;
}

const PLURAL_FALLBACK: PluralExerciseAI[] = [
  { singular: "Hund", plural: "Hunde", wrongOptions: ["Hunden", "Hunds", "Hünde"], hint: "Hund → Hunde" },
  { singular: "Katze", plural: "Katzen", wrongOptions: ["Katzes", "Katzin", "Katzs"], hint: "Katze → Katzen" },
  { singular: "Buch", plural: "Bücher", wrongOptions: ["Buchs", "Buche", "Büchs"], hint: "Buch → Bücher (Umlaut + -er)" },
  { singular: "Kind", plural: "Kinder", wrongOptions: ["Kinds", "Kindes", "Kindern"], hint: "Kind → Kinder" },
  { singular: "Ball", plural: "Bälle", wrongOptions: ["Balls", "Ballen", "Bälls"], hint: "Ball → Bälle (Umlaut + -e)" },
];

export async function generatePluralExercises(grade: number, count: number, userId?: string): Promise<PluralExerciseAI[]> {
  const prompt = `Erstelle ${count} Einzahl→Mehrzahl-Übungen für Grundschule Klasse ${grade}.
Klasse 1-2: einfache, häufige Nomen. Klasse 3-4: auch unregelmäßige Pluralformen.
Antworte NUR mit JSON-Array:
[{"singular":"Hund","plural":"Hunde","wrongOptions":["Hunden","Hunds","Hünde"],"hint":"Hund → Hunde"}]`;
  try {
    const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 900, messages: [{ role: "user", content: prompt }] });
    void logApiCall({ userId, apiType: "claude", endpoint: "plural", tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens, costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens) });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<PluralExerciseAI[]>(raw, PLURAL_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generatePluralExercises error:", err);
    return PLURAL_FALLBACK.slice(0, count);
  }
}

// ─── F) generateSteigerungExercises ──────────────────────────────────────────

export interface SteigerungExerciseAI {
  sentence: string;
  correctAnswer: string;
  wrongOptions: [string, string, string];
  hint: string;
}

const STEIGERUNG_FALLBACK: SteigerungExerciseAI[] = [
  { sentence: "Der Elefant ist ___ als die Katze. (groß, Komparativ)", correctAnswer: "größer", wrongOptions: ["großer", "am größten", "größt"], hint: "groß → größer → am größten" },
  { sentence: "Das ist die ___ Aufgabe. (schwer, Superlativ)", correctAnswer: "schwerste", wrongOptions: ["schwerer", "schwere", "am schwerste"], hint: "schwer → schwerer → am schwersten" },
  { sentence: "Sie läuft ___ als er. (schnell, Komparativ)", correctAnswer: "schneller", wrongOptions: ["am schnellsten", "schnelle", "schnells"], hint: "schnell → schneller" },
  { sentence: "Das ist der ___ Hund. (klein, Superlativ)", correctAnswer: "kleinste", wrongOptions: ["kleiner", "am kleinsten", "kleine"], hint: "klein → kleiner → am kleinsten" },
  { sentence: "Er ist ___ als sein Bruder. (alt, Komparativ)", correctAnswer: "älter", wrongOptions: ["am ältesten", "alte", "alts"], hint: "alt → älter (Umlaut!)" },
];

export async function generateSteigerungExercises(grade: number, count: number, userId?: string): Promise<SteigerungExerciseAI[]> {
  const prompt = `Erstelle ${count} Adjektiv-Steigerung-Übungen (Komparativ/Superlativ) für Grundschule Klasse ${grade}.
Klasse 3: nur regelmäßige Formen. Klasse 4: auch unregelmäßige (gut→besser, viel→mehr).
Format: Lückentext mit Adjektiv und gewünschter Form in Klammern.
Antworte NUR mit JSON-Array:
[{"sentence":"Der Hund ist ___ als die Katze. (groß, Komparativ)","correctAnswer":"größer","wrongOptions":["großer","am größten","großs"],"hint":"groß → größer"}]`;
  try {
    const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, messages: [{ role: "user", content: prompt }] });
    void logApiCall({ userId, apiType: "claude", endpoint: "steigerung", tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens, costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens) });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<SteigerungExerciseAI[]>(raw, STEIGERUNG_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateSteigerungExercises error:", err);
    return STEIGERUNG_FALLBACK.slice(0, count);
  }
}

// ─── G) generateWortartenExercises ───────────────────────────────────────────

export interface WortartenExerciseAI {
  word: string;
  sentence: string;
  correctType: "Nomen" | "Verb" | "Adjektiv" | "Artikel";
  hint: string;
}

const WORTARTEN_FALLBACK: WortartenExerciseAI[] = [
  { word: "Hund", sentence: "Der Hund bellt.", correctType: "Nomen", hint: "Nomen → immer großgeschrieben" },
  { word: "läuft", sentence: "Er läuft schnell.", correctType: "Verb", hint: "Verb → Tunwort, beschreibt eine Tätigkeit" },
  { word: "blau", sentence: "Der blaue Himmel ist schön.", correctType: "Adjektiv", hint: "Adjektiv → Eigenschaftswort" },
  { word: "die", sentence: "Die Katze schläft.", correctType: "Artikel", hint: "Artikel → Begleiter des Nomens (der/die/das)" },
  { word: "Schule", sentence: "Ich gehe in die Schule.", correctType: "Nomen", hint: "Nomen → großgeschrieben" },
];

export async function generateWortartenExercises(grade: number, count: number, userId?: string): Promise<WortartenExerciseAI[]> {
  const prompt = `Erstelle ${count} Wortarten-Erkennungs-Übungen für Grundschule Klasse ${grade}.
Wortarten: Nomen, Verb, Adjektiv, Artikel.
Klasse 3: Nomen/Verb/Adjektiv. Klasse 4: alle vier inkl. Artikel.
Antworte NUR mit JSON-Array:
[{"word":"Hund","sentence":"Der Hund bellt.","correctType":"Nomen","hint":"Nomen → groß geschrieben"}]`;
  try {
    const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 900, messages: [{ role: "user", content: prompt }] });
    void logApiCall({ userId, apiType: "claude", endpoint: "wortarten", tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens, costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens) });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<WortartenExerciseAI[]>(raw, WORTARTEN_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateWortartenExercises error:", err);
    return WORTARTEN_FALLBACK.slice(0, count);
  }
}

// ─── H) generateSatzzeichenExercises ─────────────────────────────────────────

export interface SatzzeichenExerciseAI {
  sentence: string;
  correctPunctuation: "." | "?" | "!";
  hint: string;
}

const SATZZEICHEN_FALLBACK: SatzzeichenExerciseAI[] = [
  { sentence: "Wie heißt du", correctPunctuation: "?", hint: "Fragesatz → Fragezeichen" },
  { sentence: "Ich gehe in die Schule", correctPunctuation: ".", hint: "Aussagesatz → Punkt" },
  { sentence: "Pass auf", correctPunctuation: "!", hint: "Ausruf/Aufforderung → Ausrufezeichen" },
  { sentence: "Wo wohnst du", correctPunctuation: "?", hint: "Frage → ?" },
  { sentence: "Der Hund schläft", correctPunctuation: ".", hint: "Aussage → Punkt" },
];

export async function generateSatzzeichenExercises(grade: number, count: number, userId?: string): Promise<SatzzeichenExerciseAI[]> {
  const grade2note = grade <= 2 ? "Nur Punkt und Fragezeichen (kein Ausrufezeichen)." : "Alle drei: Punkt, Fragezeichen, Ausrufezeichen.";
  const prompt = `Erstelle ${count} Satzzeichen-Übungen für Grundschule Klasse ${grade}.
${grade2note}
Antworte NUR mit JSON-Array (Satz OHNE Satzzeichen am Ende):
[{"sentence":"Wie heißt du","correctPunctuation":"?","hint":"Fragesatz → Fragezeichen"}]`;
  try {
    const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 800, messages: [{ role: "user", content: prompt }] });
    void logApiCall({ userId, apiType: "claude", endpoint: "satzzeichen", tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens, costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens) });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<SatzzeichenExerciseAI[]>(raw, SATZZEICHEN_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateSatzzeichenExercises error:", err);
    return SATZZEICHEN_FALLBACK.slice(0, count);
  }
}

// ─── I) generateGrossschreibungExercises ──────────────────────────────────────

export interface GrossschreibungExerciseAI {
  sentence: string;
  options: [string, string, string, string];
  correctAnswer: string;
  hint: string;
}

const GROSSSCHREIBUNG_FALLBACK: GrossschreibungExerciseAI[] = [
  { sentence: "die katze schläft auf dem Sofa.", options: ["die", "katze", "schläft", "Sofa"], correctAnswer: "katze", hint: "Katze ist ein Nomen → Großschreibung!" },
  { sentence: "der hund bellt laut.", options: ["der", "hund", "bellt", "laut"], correctAnswer: "hund", hint: "Hund ist ein Nomen." },
  { sentence: "Wir gehen in die schule.", options: ["Wir", "gehen", "schule", "die"], correctAnswer: "schule", hint: "Schule ist ein Nomen." },
  { sentence: "Das kind spielt im garten.", options: ["Das", "kind", "spielt", "garten"], correctAnswer: "kind", hint: "Kind ist ein Nomen — und Garten auch!" },
  { sentence: "der vogel singt ein lied.", options: ["der", "vogel", "singt", "lied"], correctAnswer: "vogel", hint: "Vogel ist ein Nomen." },
];

export async function generateGrossschreibungExercises(grade: number, count: number, userId?: string): Promise<GrossschreibungExerciseAI[]> {
  const prompt = `Erstelle ${count} Großschreibungs-Übungen für Grundschule Klasse ${grade}.
Jede Übung: Ein Satz mit EINEM falsch kleingeschriebenen Nomen. Gib 4 Wörter aus dem Satz als Optionen an.
Antworte NUR mit JSON-Array:
[{"sentence":"die katze schläft.","options":["die","katze","schläft","auf"],"correctAnswer":"katze","hint":"Katze ist ein Nomen."}]`;
  try {
    const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, messages: [{ role: "user", content: prompt }] });
    void logApiCall({ userId, apiType: "claude", endpoint: "grossschreibung", tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens, costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens) });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<GrossschreibungExerciseAI[]>(raw, GROSSSCHREIBUNG_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateGrossschreibungExercises error:", err);
    return GROSSSCHREIBUNG_FALLBACK.slice(0, count);
  }
}

// ─── J) generateSatzbauExercises ─────────────────────────────────────────────

export interface SatzbauExerciseAI {
  prompt: string;
  correctSentence: string;
  wrongOptions: [string, string, string];
  hint: string;
}

const SATZBAU_FALLBACK: SatzbauExerciseAI[] = [
  { prompt: "schläft / Sofa / Die / auf / dem / Katze", correctSentence: "Die Katze schläft auf dem Sofa.", wrongOptions: ["Schläft die Katze Sofa dem auf.", "Die auf Katze dem Sofa schläft.", "Auf dem Sofa die Katze schläft."], hint: "Subjekt – Prädikat – Objekt" },
  { prompt: "Hund / Der / im / Garten / spielt", correctSentence: "Der Hund spielt im Garten.", wrongOptions: ["Spielt der Hund im Garten.", "Im Garten Der Hund spielt.", "Der spielt Hund Garten im."], hint: "Verb steht auf Position 2" },
  { prompt: "Buch / liest / ein / Sie", correctSentence: "Sie liest ein Buch.", wrongOptions: ["Liest sie ein Buch.", "Ein Buch liest sie.", "Sie ein Buch liest."], hint: "Subjekt zuerst, dann Verb" },
  { prompt: "geht / Schule / Er / in / die", correctSentence: "Er geht in die Schule.", wrongOptions: ["In die Schule Er geht.", "Geht er in die Schule.", "Er die Schule geht in."], hint: "Er geht → Verb auf Position 2" },
  { prompt: "trinkt / Milch / Das / Kind", correctSentence: "Das Kind trinkt Milch.", wrongOptions: ["Trinkt das Kind Milch.", "Milch trinkt das Kind.", "Das trinkt Kind Milch."], hint: "Subjekt – Verb – Objekt" },
];

export async function generateSatzbauExercises(grade: number, count: number, userId?: string): Promise<SatzbauExerciseAI[]> {
  const prompt = `Erstelle ${count} Satzbau-Übungen für Grundschule Klasse ${grade}.
Jede Übung: Ein Satz wird in Einzelwörter zerlegt (durch " / " getrennt). Das Kind wählt die richtige Reihenfolge.
Klasse 3: einfache SVO-Sätze. Klasse 4: auch Sätze mit Nebensatz.
Antworte NUR mit JSON-Array:
[{"prompt":"Katze / Die / schläft","correctSentence":"Die Katze schläft.","wrongOptions":["Schläft die Katze.","Die schläft Katze.","Katze Die schläft."],"hint":"Subjekt zuerst, dann Verb"}]`;
  try {
    const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 1200, messages: [{ role: "user", content: prompt }] });
    void logApiCall({ userId, apiType: "claude", endpoint: "satzbau", tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens, costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens) });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<SatzbauExerciseAI[]>(raw, SATZBAU_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateSatzbauExercises error:", err);
    return SATZBAU_FALLBACK.slice(0, count);
  }
}

// ─── K) generateZeitformenExercises ──────────────────────────────────────────

export interface ZeitformenExerciseAI {
  sentence: string;
  correctAnswer: string;
  wrongOptions: [string, string, string];
  hint: string;
}

const ZEITFORMEN_FALLBACK: ZeitformenExerciseAI[] = [
  { sentence: "Gestern ___ er in die Schule. (gehen, Präteritum)", correctAnswer: "ging", wrongOptions: ["geht", "gegangen", "gings"], hint: "gehen → ging (unregelmäßig!)" },
  { sentence: "Sie ___ ein Buch. (lesen, Präteritum)", correctAnswer: "las", wrongOptions: ["liest", "gelesen", "lesTe"], hint: "lesen → las" },
  { sentence: "Er ___ sehr schnell. (laufen, Präteritum)", correctAnswer: "lief", wrongOptions: ["läuft", "gelaufen", "laufte"], hint: "laufen → lief" },
  { sentence: "Wir ___ nach Hause. (kommen, Präteritum)", correctAnswer: "kamen", wrongOptions: ["kommen", "gekommen", "kamten"], hint: "kommen → kamen" },
  { sentence: "Das Kind ___ Hunger. (haben, Präteritum)", correctAnswer: "hatte", wrongOptions: ["hat", "gehabt", "hatten"], hint: "haben → hatte" },
];

export async function generateZeitformenExercises(grade: number, count: number, userId?: string): Promise<ZeitformenExerciseAI[]> {
  const prompt = `Erstelle ${count} Präteritum-Übungen für Grundschule Klasse ${grade}.
Fokus auf häufige unregelmäßige Verben: gehen→ging, kommen→kam, sehen→sah, essen→aß, fahren→fuhr, schreiben→schrieb, lesen→las, laufen→lief, haben→hatte, sein→war.
Lückentext mit Verb und "Präteritum" in Klammern.
Antworte NUR mit JSON-Array:
[{"sentence":"Er ___ ins Kino. (gehen, Präteritum)","correctAnswer":"ging","wrongOptions":["geht","gegangen","gings"],"hint":"gehen → ging"}]`;
  try {
    const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, messages: [{ role: "user", content: prompt }] });
    void logApiCall({ userId, apiType: "claude", endpoint: "zeitformen", tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens, costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens) });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<ZeitformenExerciseAI[]>(raw, ZEITFORMEN_FALLBACK.slice(0, count));
  } catch (err) {
    console.error("generateZeitformenExercises error:", err);
    return ZEITFORMEN_FALLBACK.slice(0, count);
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
  topic?: string,
  userId?: string,
): Promise<ReadingTextAI> {
  const sentenceGuide =
    grade === 1
      ? "2-3 sehr kurze, einfache Sätze (max. 5 Wörter pro Satz)"
      : grade === 2
      ? "4-5 einfache Sätze"
      : grade === 3
      ? "6-8 Sätze, ein Absatz, etwas komplexer"
      : "8-12 Sätze, zwei Absätze, für Klasse 4 geeignet";

  const topicPart = topic
    ? `Thema: ${topic}`
    : "Freies kindgerechtes Thema (Tiere, Natur, Abenteuer, Alltag)";

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
    void logApiCall({
      userId,
      apiType: "claude",
      endpoint: "lesen",
      tokensUsed: msg.usage.input_tokens + msg.usage.output_tokens,
      costEstimate: computeClaudeCost(msg.usage.input_tokens, msg.usage.output_tokens),
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return safeParseJson<ReadingTextAI>(raw, READING_FALLBACK);
  } catch (err) {
    console.error("generateReadingText error:", err);
    void logError({ userId, errorType: "claude_lesen_error", errorMessage: String(err).slice(0, 500), page: "lesen" });
    return READING_FALLBACK;
  }
}

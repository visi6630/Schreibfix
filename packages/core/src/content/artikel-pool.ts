import type { GrammarExercise } from "../types/index.js";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const artikelData: { noun: string; emoji: string; article: "der" | "die" | "das"; hint: string; klasse: 1|2|3|4 }[] = [
  // Klasse 1 — very common
  { noun:"Hund",      emoji:"🐕", article:"der", hint:"Hund ist männlich.", klasse:1 },
  { noun:"Katze",     emoji:"🐈", article:"die", hint:"Katze ist weiblich.", klasse:1 },
  { noun:"Pferd",     emoji:"🐎", article:"das", hint:"Pferd ist sächlich.", klasse:1 },
  { noun:"Apfel",     emoji:"🍎", article:"der", hint:"Apfel ist männlich.", klasse:1 },
  { noun:"Banane",    emoji:"🍌", article:"die", hint:"Banane endet auf -e, oft 'die'.", klasse:1 },
  { noun:"Buch",      emoji:"📚", article:"das", hint:"Buch ist sächlich.", klasse:1 },
  { noun:"Schule",    emoji:"🏫", article:"die", hint:"Schule endet auf -e, oft 'die'.", klasse:1 },
  { noun:"Haus",      emoji:"🏠", article:"das", hint:"Haus ist sächlich.", klasse:1 },
  { noun:"Kind",      emoji:"👦", article:"das", hint:"Kind ist sächlich.", klasse:1 },
  { noun:"Ball",      emoji:"⚽", article:"der", hint:"Ball ist männlich.", klasse:1 },
  { noun:"Sonne",     emoji:"☀️", article:"die", hint:"Sonne endet auf -e, oft 'die'.", klasse:1 },
  { noun:"Mond",      emoji:"🌙", article:"der", hint:"Mond ist männlich.", klasse:1 },
  { noun:"Baum",      emoji:"🌳", article:"der", hint:"Baum ist männlich.", klasse:1 },
  { noun:"Blume",     emoji:"🌸", article:"die", hint:"Blume endet auf -e, oft 'die'.", klasse:1 },
  { noun:"Brot",      emoji:"🍞", article:"das", hint:"Brot ist sächlich.", klasse:1 },
  { noun:"Milch",     emoji:"🥛", article:"die", hint:"Milch ist weiblich.", klasse:1 },
  { noun:"Wasser",    emoji:"💧", article:"das", hint:"Wasser ist sächlich.", klasse:1 },
  { noun:"Stuhl",     emoji:"🪑", article:"der", hint:"Stuhl ist männlich.", klasse:1 },
  { noun:"Tisch",     emoji:"🪵", article:"der", hint:"Tisch ist männlich.", klasse:1 },
  { noun:"Auto",      emoji:"🚗", article:"das", hint:"Auto ist sächlich.", klasse:1 },
  // Klasse 2
  { noun:"Vogel",     emoji:"🐦", article:"der", hint:"Vogel ist männlich.", klasse:2 },
  { noun:"Fisch",     emoji:"🐟", article:"der", hint:"Fisch ist männlich.", klasse:2 },
  { noun:"Maus",      emoji:"🐭", article:"die", hint:"Maus ist weiblich.", klasse:2 },
  { noun:"Kuh",       emoji:"🐄", article:"die", hint:"Kuh ist weiblich.", klasse:2 },
  { noun:"Schwein",   emoji:"🐷", article:"das", hint:"Schwein ist sächlich.", klasse:2 },
  { noun:"Schaf",     emoji:"🐑", article:"das", hint:"Schaf ist sächlich.", klasse:2 },
  { noun:"Tiger",     emoji:"🐯", article:"der", hint:"Tiger ist männlich.", klasse:2 },
  { noun:"Elefant",   emoji:"🐘", article:"der", hint:"Elefant ist männlich.", klasse:2 },
  { noun:"Affe",      emoji:"🐒", article:"der", hint:"Affe endet auf -e, aber trotzdem 'der'.", klasse:2 },
  { noun:"Erdbeere",  emoji:"🍓", article:"die", hint:"Erdbeere endet auf -e, oft 'die'.", klasse:2 },
  { noun:"Kirsche",   emoji:"🍒", article:"die", hint:"Kirsche endet auf -e, oft 'die'.", klasse:2 },
  { noun:"Birne",     emoji:"🍐", article:"die", hint:"Birne endet auf -e, oft 'die'.", klasse:2 },
  { noun:"Tomate",    emoji:"🍅", article:"die", hint:"Tomate endet auf -e, oft 'die'.", klasse:2 },
  { noun:"Gurke",     emoji:"🥒", article:"die", hint:"Gurke endet auf -e, oft 'die'.", klasse:2 },
  { noun:"Ei",        emoji:"🥚", article:"das", hint:"Ei ist sächlich.", klasse:2 },
  { noun:"Käse",      emoji:"🧀", article:"der", hint:"Käse endet auf -e, aber 'der'.", klasse:2 },
  { noun:"Tür",       emoji:"🚪", article:"die", hint:"Tür ist weiblich.", klasse:2 },
  { noun:"Fenster",   emoji:"🪟", article:"das", hint:"Fenster ist sächlich.", klasse:2 },
  { noun:"Bett",      emoji:"🛏️", article:"das", hint:"Bett ist sächlich.", klasse:2 },
  { noun:"Lampe",     emoji:"💡", article:"die", hint:"Lampe endet auf -e, oft 'die'.", klasse:2 },
  // Klasse 3
  { noun:"Schlüssel", emoji:"🔑", article:"der", hint:"Schlüssel ist männlich.", klasse:3 },
  { noun:"Brücke",    emoji:"🌉", article:"die", hint:"Brücke endet auf -e, oft 'die'.", klasse:3 },
  { noun:"Messer",    emoji:"🔪", article:"das", hint:"Messer ist sächlich.", klasse:3 },
  { noun:"Gabel",     emoji:"🍴", article:"die", hint:"Gabel ist weiblich.", klasse:3 },
  { noun:"Löffel",    emoji:"🥄", article:"der", hint:"Löffel ist männlich.", klasse:3 },
  { noun:"Teller",    emoji:"🍽️", article:"der", hint:"Teller ist männlich.", klasse:3 },
  { noun:"Topf",      emoji:"🫕", article:"der", hint:"Topf ist männlich.", klasse:3 },
  { noun:"Pfanne",    emoji:"🍳", article:"die", hint:"Pfanne endet auf -e, oft 'die'.", klasse:3 },
  { noun:"Feuer",     emoji:"🔥", article:"das", hint:"Feuer ist sächlich.", klasse:3 },
  { noun:"Regen",     emoji:"🌧️", article:"der", hint:"Regen ist männlich.", klasse:3 },
  { noun:"Schnee",    emoji:"❄️", article:"der", hint:"Schnee ist männlich.", klasse:3 },
  { noun:"Wind",      emoji:"💨", article:"der", hint:"Wind ist männlich.", klasse:3 },
  { noun:"Berg",      emoji:"⛰️", article:"der", hint:"Berg ist männlich.", klasse:3 },
  { noun:"Fluss",     emoji:"🏞️", article:"der", hint:"Fluss ist männlich.", klasse:3 },
  { noun:"See",       emoji:"🌊", article:"der", hint:"See (Gewässer) ist männlich.", klasse:3 },
  { noun:"Wald",      emoji:"🌲", article:"der", hint:"Wald ist männlich.", klasse:3 },
  { noun:"Wiese",     emoji:"🌿", article:"die", hint:"Wiese endet auf -e, oft 'die'.", klasse:3 },
  { noun:"Straße",    emoji:"🛣️", article:"die", hint:"Straße endet auf -e, oft 'die'.", klasse:3 },
  { noun:"Brötchen",  emoji:"🥐", article:"das", hint:"Wörter auf -chen sind immer sächlich.", klasse:3 },
  { noun:"Mädchen",   emoji:"👧", article:"das", hint:"Wörter auf -chen sind immer sächlich.", klasse:3 },
  // Klasse 4
  { noun:"Gebäude",   emoji:"🏢", article:"das", hint:"Gebäude ist sächlich.", klasse:4 },
  { noun:"Spiegel",   emoji:"🪞", article:"der", hint:"Spiegel ist männlich.", klasse:4 },
  { noun:"Flasche",   emoji:"🍶", article:"die", hint:"Flasche endet auf -e, oft 'die'.", klasse:4 },
  { noun:"Schüssel",  emoji:"🥣", article:"die", hint:"Schüssel ist weiblich.", klasse:4 },
  { noun:"Koffer",    emoji:"🧳", article:"der", hint:"Koffer ist männlich.", klasse:4 },
  { noun:"Tasche",    emoji:"👜", article:"die", hint:"Tasche endet auf -e, oft 'die'.", klasse:4 },
  { noun:"Schere",    emoji:"✂️", article:"die", hint:"Schere endet auf -e, oft 'die'.", klasse:4 },
  { noun:"Lineal",    emoji:"📏", article:"das", hint:"Lineal ist sächlich.", klasse:4 },
  { noun:"Heft",      emoji:"📓", article:"das", hint:"Heft ist sächlich.", klasse:4 },
  { noun:"Stift",     emoji:"✏️", article:"der", hint:"Stift ist männlich.", klasse:4 },
  { noun:"Uhr",       emoji:"⏰", article:"die", hint:"Uhr ist weiblich.", klasse:4 },
  { noun:"Kalender",  emoji:"📅", article:"der", hint:"Kalender ist männlich.", klasse:4 },
  { noun:"Computer",  emoji:"💻", article:"der", hint:"Computer ist männlich.", klasse:4 },
  { noun:"Bildschirm",emoji:"🖥️", article:"der", hint:"Bildschirm ist männlich.", klasse:4 },
  { noun:"Drucker",   emoji:"🖨️", article:"der", hint:"Drucker ist männlich.", klasse:4 },
  { noun:"Telefon",   emoji:"📱", article:"das", hint:"Telefon ist sächlich.", klasse:4 },
  { noun:"Radio",     emoji:"📻", article:"das", hint:"Radio ist sächlich.", klasse:4 },
  { noun:"Kissen",    emoji:"🛋️", article:"das", hint:"Wörter auf -en/-kissen oft sächlich.", klasse:4 },
  { noun:"Decke",     emoji:"🛏️", article:"die", hint:"Decke endet auf -e, oft 'die'.", klasse:4 },
  { noun:"Vorhang",   emoji:"🪟", article:"der", hint:"Vorhang ist männlich.", klasse:4 },
];

export const artikelPool: GrammarExercise[] = artikelData.map(({ noun, emoji, article, hint, klasse }) => ({
  id: `ap-${noun.toLowerCase()}`,
  category: "noun-gender",
  klasse,
  prompt: `${emoji} ${noun}`,
  options: ["der", "die", "das"],
  correctAnswer: article,
  explanation: hint,
  xpReward: 5,
}));

export function getRandomArtikelExercises(n: number, maxKlasse = 4): GrammarExercise[] {
  const filtered = artikelPool.filter((e) => e.klasse <= maxKlasse);
  return shuffleArray(filtered).slice(0, n);
}

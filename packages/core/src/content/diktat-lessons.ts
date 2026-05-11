import type { DiktatLesson } from "../types/index.js";

// ─── Klasse 1 ────────────────────────────────────────────────────────────────

const k1Tiere: DiktatLesson = {
  id: "k1-tiere",
  title: "Unsere Tiere",
  klasse: 1,
  theme: "Tiere",
  xpReward: 20,
  sentences: [
    { id: "k1-tiere-1", text: "Die Katze schläft auf dem Sofa.", hint: "'schläft' hat ein ä." },
    { id: "k1-tiere-2", text: "Der Hund bellt sehr laut.", hint: "'bellt' schreibt man mit ll." },
    { id: "k1-tiere-3", text: "Das Pferd steht auf der Wiese.", hint: "'Wiese' schreibt man mit ie." },
    { id: "k1-tiere-4", text: "Der Fisch schwimmt im Wasser.", hint: "'schwimmt' hat mm in der Mitte." },
    { id: "k1-tiere-5", text: "Ein Vogel singt sein Lied.", hint: "'Lied' schreibt man mit ie." },
  ],
};

const k1Familie: DiktatLesson = {
  id: "k1-familie",
  title: "Meine Familie",
  klasse: 1,
  theme: "Familie",
  xpReward: 20,
  sentences: [
    { id: "k1-fam-1", text: "Meine Mama ist sehr nett.", hint: "'nett' schreibt man mit tt." },
    { id: "k1-fam-2", text: "Mein Papa liest ein Buch.", hint: "'Buch' fängt mit großem B an." },
    { id: "k1-fam-3", text: "Oma backt heute einen Kuchen.", hint: "'Kuchen' fängt mit großem K an." },
    { id: "k1-fam-4", text: "Mein Bruder spielt im Garten.", hint: "'Garten' schreibt man mit großem G." },
    { id: "k1-fam-5", text: "Wir essen alle am Tisch.", hint: "'essen' schreibt man mit ss." },
  ],
};

const k1Schule: DiktatLesson = {
  id: "k1-schule",
  title: "In der Schule",
  klasse: 1,
  theme: "Schule",
  xpReward: 20,
  sentences: [
    { id: "k1-sch-1", text: "Ich male ein buntes Bild.", hint: "'Bild' fängt mit großem B an." },
    { id: "k1-sch-2", text: "Wir schreiben in das Heft.", hint: "'Heft' fängt mit großem H an." },
    { id: "k1-sch-3", text: "Der Lehrer liest uns vor.", hint: "'Lehrer' fängt mit großem L an." },
    { id: "k1-sch-4", text: "Auf dem Hof spielen Kinder.", hint: "'spielen' hat ie in der Mitte." },
    { id: "k1-sch-5", text: "Das Mädchen trägt eine Tasche.", hint: "'Mädchen' schreibt man mit ä." },
  ],
};

// ─── Klasse 2 ────────────────────────────────────────────────────────────────

const k2Jahreszeiten: DiktatLesson = {
  id: "k2-jahreszeiten",
  title: "Die Jahreszeiten",
  klasse: 2,
  theme: "Jahreszeiten",
  xpReward: 30,
  sentences: [
    { id: "k2-jz-1", text: "Im Winter liegt überall tiefer Schnee.", hint: "'Schnee' schreibt man mit ee am Ende." },
    { id: "k2-jz-2", text: "Im Frühling blühen die ersten Blumen.", hint: "'blühen' schreibt man mit üh." },
    { id: "k2-jz-3", text: "Im Sommer spielen Kinder im Schwimmbad.", hint: "'Schwimmbad' hat mm in der Mitte." },
    { id: "k2-jz-4", text: "Im Herbst fallen die Blätter von den Bäumen.", hint: "'Blätter' und 'Bäumen' haben ein ä." },
    { id: "k2-jz-5", text: "Die vier Jahreszeiten wechseln sich regelmäßig ab.", hint: "'regelmäßig' schreibt man mit ß." },
  ],
};

const k2Essen: DiktatLesson = {
  id: "k2-essen",
  title: "Leckeres Essen",
  klasse: 2,
  theme: "Essen",
  xpReward: 30,
  sentences: [
    { id: "k2-ess-1", text: "Zum Frühstück esse ich frisches Brot.", hint: "'Frühstück' schreibt man mit ü und ck." },
    { id: "k2-ess-2", text: "Die Suppe ist heute sehr heiß.", hint: "'heiß' schreibt man mit ß." },
    { id: "k2-ess-3", text: "Meine Mutter kocht heute leckere Gemüsesuppe.", hint: "'Gemüsesuppe' setzt sich aus Gemüse und Suppe zusammen." },
    { id: "k2-ess-4", text: "Wir essen Obst und Gemüse jeden Tag.", hint: "'Gemüse' schreibt man mit ü." },
    { id: "k2-ess-5", text: "Der frische Apfelkuchen riecht wunderbar nach Zimt.", hint: "'Apfelkuchen' setzt sich aus Apfel und Kuchen zusammen." },
  ],
};

const k2Wetter: DiktatLesson = {
  id: "k2-wetter",
  title: "Das Wetter",
  klasse: 2,
  theme: "Wetter",
  xpReward: 30,
  sentences: [
    { id: "k2-wet-1", text: "Heute regnet es den ganzen Morgen.", hint: "'regnet' kommt von Regen." },
    { id: "k2-wet-2", text: "Die dunklen Wolken ziehen am Himmel.", hint: "'Wolken' fängt mit großem W an." },
    { id: "k2-wet-3", text: "Nach dem Gewitter scheint wieder die Sonne.", hint: "'Gewitter' hat tt in der Mitte." },
    { id: "k2-wet-4", text: "Der Wind bläst heute sehr stark.", hint: "'bläst' hat ein ä." },
    { id: "k2-wet-5", text: "Im dichten Nebel sieht man kaum etwas.", hint: "'Nebel' schreibt man mit e-b-e-l." },
  ],
};

// ─── Klasse 3 ────────────────────────────────────────────────────────────────

const k3Natur: DiktatLesson = {
  id: "k3-natur",
  title: "In der Natur",
  klasse: 3,
  theme: "Natur",
  xpReward: 40,
  sentences: [
    { id: "k3-nat-1", text: "Der Fluss schlängelt sich durch das grüne Tal.", hint: "'schlängelt' hat ein ä." },
    { id: "k3-nat-2", text: "Im tiefen Wald leben viele seltene Tiere und Pflanzen.", hint: "'seltene' kommt von selten." },
    { id: "k3-nat-3", text: "Die hohen Berge sind im Winter mit Schnee bedeckt.", hint: "'bedeckt' setzt sich aus be- und deckt zusammen." },
    { id: "k3-nat-4", text: "Am Ufer des Sees wachsen Schilf und Wasserpflanzen.", hint: "'Wasserpflanzen' setzt sich aus Wasser und Pflanzen zusammen." },
    { id: "k3-nat-5", text: "Die fleißigen Bienen sammeln Nektar aus bunten Blüten.", hint: "'fleißig' schreibt man mit ei und ß." },
  ],
};

const k3Ferien: DiktatLesson = {
  id: "k3-ferien",
  title: "Schöne Ferien",
  klasse: 3,
  theme: "Ferien",
  xpReward: 40,
  sentences: [
    { id: "k3-fer-1", text: "In den Sommerferien fahren wir zusammen ans Meer.", hint: "'Sommerferien' setzt sich aus Sommer und Ferien zusammen." },
    { id: "k3-fer-2", text: "Am Strand bauen die Kinder riesige Sandburgen und Türme.", hint: "'Türme' hat ein ü." },
    { id: "k3-fer-3", text: "Wir wandern jeden Tag durch den schönen Schwarzwald.", hint: "'Schwarzwald' ist ein Eigenname mit großem S." },
    { id: "k3-fer-4", text: "Das Freibad in unserer Stadt hat eine lange Wasserrutsche.", hint: "'Wasserrutsche' ist ein zusammengesetztes Wort." },
    { id: "k3-fer-5", text: "In den Bergen sehen wir Murmeltiere und Steinadler.", hint: "'Murmeltiere' und 'Steinadler' sind Tiere in den Bergen." },
  ],
};

const k3Freundschaft: DiktatLesson = {
  id: "k3-freundschaft",
  title: "Freundschaft",
  klasse: 3,
  theme: "Freundschaft",
  xpReward: 40,
  sentences: [
    { id: "k3-frd-1", text: "Meine beste Freundin wohnt gleich in der Nachbarstraße.", hint: "'Nachbarstraße' schreibt man mit ß." },
    { id: "k3-frd-2", text: "Wir spielen fast jeden Nachmittag zusammen im Park.", hint: "'Nachmittag' schreibt man mit großem N." },
    { id: "k3-frd-3", text: "Echte Freunde helfen sich gegenseitig in schwierigen Zeiten.", hint: "'gegenseitig' hat ei in der Mitte." },
    { id: "k3-frd-4", text: "Wahre Freundschaft bedeutet, füreinander da zu sein.", hint: "'füreinander' ist ein zusammengesetztes Wort mit ü." },
    { id: "k3-frd-5", text: "Zusammen lachen und spielen macht uns alle sehr glücklich.", hint: "'glücklich' schreibt man mit ü und ck." },
  ],
};

// ─── Klasse 4 ────────────────────────────────────────────────────────────────

const k4Regenwald: DiktatLesson = {
  id: "k4-regenwald",
  title: "Der Regenwald",
  klasse: 4,
  theme: "Regenwald",
  xpReward: 50,
  sentences: [
    { id: "k4-rw-1", text: "Im tropischen Regenwald Südamerikas wachsen zahlreiche seltene Pflanzen und Tierarten.", hint: "'zahlreiche' schreibt man mit ahl." },
    { id: "k4-rw-2", text: "Die hohe Feuchtigkeit und Wärme im Regenwald fördern das üppige Pflanzenwachstum.", hint: "'Pflanzenwachstum' ist ein langes zusammengesetztes Wort." },
    { id: "k4-rw-3", text: "Viele Tierarten des Regenwaldes sind durch die Abholzung vom Aussterben bedroht.", hint: "'Aussterben' schreibt man mit ss." },
    { id: "k4-rw-4", text: "Die rücksichtslose Abholzung des Regenwaldes zerstört den Lebensraum vieler Tiere.", hint: "'rücksichtslos' schreibt man mit ü und ck." },
    { id: "k4-rw-5", text: "Wissenschaftler aus aller Welt erforschen gemeinsam die Geheimnisse des Regenwaldes.", hint: "'Wissenschaftler' schreibt man mit ss und sch." },
  ],
};

const k4Erfindungen: DiktatLesson = {
  id: "k4-erfindungen",
  title: "Große Erfindungen",
  klasse: 4,
  theme: "Erfindungen",
  xpReward: 50,
  sentences: [
    { id: "k4-erf-1", text: "Johannes Gutenberg erfand im 15. Jahrhundert die Druckerpresse mit beweglichen Lettern.", hint: "'Jahrhundert' schreibt man mit dt am Ende." },
    { id: "k4-erf-2", text: "Die Dampfmaschine von James Watt veränderte die Arbeit in den Fabriken.", hint: "'Dampfmaschine' setzt sich aus Dampf und Maschine zusammen." },
    { id: "k4-erf-3", text: "Thomas Edison entwickelte im Jahr 1879 die erste elektrische Glühbirne.", hint: "'elektrische' schreibt man mit elektr-." },
    { id: "k4-erf-4", text: "Das Internet ermöglicht den schnellen weltweiten Austausch von Informationen und Wissen.", hint: "'weltweiten' setzt sich aus Welt und weit zusammen." },
    { id: "k4-erf-5", text: "Moderne Smartphones verbinden täglich Milliarden von Menschen rund um den Globus.", hint: "'Milliarden' schreibt man mit ill." },
  ],
};

const k4Weltall: DiktatLesson = {
  id: "k4-weltall",
  title: "Das Weltall",
  klasse: 4,
  theme: "Weltraum",
  xpReward: 50,
  sentences: [
    { id: "k4-wlt-1", text: "Die Erde dreht sich einmal täglich um ihre eigene Achse.", hint: "'täglich' schreibt man mit ä und ch." },
    { id: "k4-wlt-2", text: "Astronauten trainieren jahrelang, um die körperlichen Anforderungen einer Weltraummission zu erfüllen.", hint: "'körperlichen' schreibt man mit ö." },
    { id: "k4-wlt-3", text: "Das Hubble-Weltraumteleskop ermöglicht die Beobachtung weit entfernter Galaxien und Sterne.", hint: "'Beobachtung' schreibt man mit Be- am Anfang." },
    { id: "k4-wlt-4", text: "Unsere Milchstraße enthält Milliarden von Sternen, Planeten und anderen Himmelskörpern.", hint: "'Milchstraße' schreibt man mit ß." },
    { id: "k4-wlt-5", text: "Die Schwerelosigkeit im Weltall macht viele alltägliche Tätigkeiten besonders schwierig.", hint: "'alltägliche' kommt von Alltag und schreibt man mit ä." },
  ],
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export const diktatLessons: DiktatLesson[] = [
  k1Tiere, k1Familie, k1Schule,
  k2Jahreszeiten, k2Essen, k2Wetter,
  k3Natur, k3Ferien, k3Freundschaft,
  k4Regenwald, k4Erfindungen, k4Weltall,
];

export const sampleDiktatLesson: DiktatLesson = k2Jahreszeiten;

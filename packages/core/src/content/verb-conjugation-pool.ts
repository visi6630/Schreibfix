import type { GrammarExercise } from "../types/index.js";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const verbConjugationPool: GrammarExercise[] = [
  // spielen
  { id:"vp-spielen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ Fußball. (spielen)", options:["spiele","spielst","spielt","spielen"], correctAnswer:"spiele", explanation:"Bei 'ich': spiel-e", xpReward:5 },
  { id:"vp-spielen-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ gern Tennis. (spielen)", options:["spiele","spielst","spielt","spielen"], correctAnswer:"spielst", explanation:"Bei 'du': spiel-st", xpReward:5 },
  { id:"vp-spielen-er", category:"verb-conjugation", klasse:1, prompt:"Er ___ im Garten. (spielen)", options:["spiele","spielst","spielt","spielen"], correctAnswer:"spielt", explanation:"Bei 'er': spiel-t", xpReward:5 },
  { id:"vp-spielen-wir", category:"verb-conjugation", klasse:2, prompt:"Wir ___ zusammen. (spielen)", options:["spiele","spielst","spielt","spielen"], correctAnswer:"spielen", explanation:"Bei 'wir': spiel-en", xpReward:5 },
  // laufen
  { id:"vp-laufen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ schnell. (laufen)", options:["laufe","läufst","läuft","laufen"], correctAnswer:"laufe", explanation:"Bei 'ich': lauf-e", xpReward:5 },
  { id:"vp-laufen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ jeden Morgen. (laufen)", options:["laufe","läufst","läuft","laufen"], correctAnswer:"läufst", explanation:"Bei 'du' ändert sich au→äu: läuf-st", xpReward:5 },
  { id:"vp-laufen-er", category:"verb-conjugation", klasse:2, prompt:"Er ___ zur Schule. (laufen)", options:["laufe","läufst","läuft","laufen"], correctAnswer:"läuft", explanation:"Bei 'er/sie' ändert sich au→äu: läuf-t", xpReward:5 },
  // essen
  { id:"vp-essen-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ gern Pizza. (essen)", options:["esse","isst","esst","essen"], correctAnswer:"esse", explanation:"Bei 'ich': ess-e", xpReward:5 },
  { id:"vp-essen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ dein Brot. (essen)", options:["esse","isst","esst","essen"], correctAnswer:"isst", explanation:"Bei 'du' ändert sich e→i: iss-t", xpReward:5 },
  { id:"vp-essen-er", category:"verb-conjugation", klasse:2, prompt:"Sie ___ einen Apfel. (essen)", options:["esse","isst","esst","essen"], correctAnswer:"isst", explanation:"Bei 'er/sie' ändert sich e→i: iss-t", xpReward:5 },
  // trinken
  { id:"vp-trinken-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ Wasser. (trinken)", options:["trinke","trinkst","trinkt","trinken"], correctAnswer:"trinke", explanation:"Bei 'ich': trink-e", xpReward:5 },
  { id:"vp-trinken-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ Saft. (trinken)", options:["trinke","trinkst","trinkt","trinken"], correctAnswer:"trinkst", explanation:"Bei 'du': trink-st", xpReward:5 },
  { id:"vp-trinken-wir", category:"verb-conjugation", klasse:2, prompt:"Wir ___ Milch. (trinken)", options:["trinke","trinkst","trinkt","trinken"], correctAnswer:"trinken", explanation:"Bei 'wir': trink-en", xpReward:5 },
  // schreiben
  { id:"vp-schreiben-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ einen Brief. (schreiben)", options:["schreibe","schreibst","schreibt","schreiben"], correctAnswer:"schreibe", explanation:"Bei 'ich': schreib-e", xpReward:5 },
  { id:"vp-schreiben-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ deine Hausaufgaben. (schreiben)", options:["schreibe","schreibst","schreibt","schreiben"], correctAnswer:"schreibst", explanation:"Bei 'du': schreib-st", xpReward:5 },
  { id:"vp-schreiben-er", category:"verb-conjugation", klasse:2, prompt:"Er ___ ein Gedicht. (schreiben)", options:["schreibe","schreibst","schreibt","schreiben"], correctAnswer:"schreibt", explanation:"Bei 'er': schreib-t", xpReward:5 },
  // lesen
  { id:"vp-lesen-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ ein Buch. (lesen)", options:["lese","liest","lest","lesen"], correctAnswer:"lese", explanation:"Bei 'ich': les-e", xpReward:5 },
  { id:"vp-lesen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ die Zeitung. (lesen)", options:["lese","liest","lest","lesen"], correctAnswer:"liest", explanation:"Bei 'du' ändert sich e→ie: lies-t", xpReward:5 },
  { id:"vp-lesen-er", category:"verb-conjugation", klasse:2, prompt:"Sie ___ gern Bücher. (lesen)", options:["lese","liest","lest","lesen"], correctAnswer:"liest", explanation:"Bei 'er/sie' ändert sich e→ie: lies-t", xpReward:5 },
  // sehen
  { id:"vp-sehen-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ einen Vogel. (sehen)", options:["sehe","siehst","sieht","sehen"], correctAnswer:"sehe", explanation:"Bei 'ich': seh-e", xpReward:5 },
  { id:"vp-sehen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ den Regenbogen. (sehen)", options:["sehe","siehst","sieht","sehen"], correctAnswer:"siehst", explanation:"Bei 'du' ändert sich e→ie: sieh-st", xpReward:5 },
  { id:"vp-sehen-er", category:"verb-conjugation", klasse:2, prompt:"Er ___ den Film. (sehen)", options:["sehe","siehst","sieht","sehen"], correctAnswer:"sieht", explanation:"Bei 'er' ändert sich e→ie: sieh-t", xpReward:5 },
  // fahren
  { id:"vp-fahren-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ Fahrrad. (fahren)", options:["fahre","fährst","fährt","fahren"], correctAnswer:"fahre", explanation:"Bei 'ich': fahr-e", xpReward:5 },
  { id:"vp-fahren-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ mit dem Bus. (fahren)", options:["fahre","fährst","fährt","fahren"], correctAnswer:"fährst", explanation:"Bei 'du' ändert sich a→ä: fähr-st", xpReward:5 },
  { id:"vp-fahren-er", category:"verb-conjugation", klasse:2, prompt:"Er ___ mit dem Zug. (fahren)", options:["fahre","fährst","fährt","fahren"], correctAnswer:"fährt", explanation:"Bei 'er' ändert sich a→ä: fähr-t", xpReward:5 },
  // schlafen
  { id:"vp-schlafen-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ lange. (schlafen)", options:["schlafe","schläfst","schläft","schlafen"], correctAnswer:"schlafe", explanation:"Bei 'ich': schlaf-e", xpReward:5 },
  { id:"vp-schlafen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ tief. (schlafen)", options:["schlafe","schläfst","schläft","schlafen"], correctAnswer:"schläfst", explanation:"Bei 'du' ändert sich a→ä: schläf-st", xpReward:5 },
  // kommen
  { id:"vp-kommen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ bald. (kommen)", options:["komme","kommst","kommt","kommen"], correctAnswer:"komme", explanation:"Bei 'ich': komm-e", xpReward:5 },
  { id:"vp-kommen-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ mit. (kommen)", options:["komme","kommst","kommt","kommen"], correctAnswer:"kommst", explanation:"Bei 'du': komm-st", xpReward:5 },
  { id:"vp-kommen-er", category:"verb-conjugation", klasse:1, prompt:"Sie ___ pünktlich. (kommen)", options:["komme","kommst","kommt","kommen"], correctAnswer:"kommt", explanation:"Bei 'er/sie': komm-t", xpReward:5 },
  // gehen
  { id:"vp-gehen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ spazieren. (gehen)", options:["gehe","gehst","geht","gehen"], correctAnswer:"gehe", explanation:"Bei 'ich': geh-e", xpReward:5 },
  { id:"vp-gehen-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ in die Schule. (gehen)", options:["gehe","gehst","geht","gehen"], correctAnswer:"gehst", explanation:"Bei 'du': geh-st", xpReward:5 },
  { id:"vp-gehen-er", category:"verb-conjugation", klasse:1, prompt:"Er ___ nach Hause. (gehen)", options:["gehe","gehst","geht","gehen"], correctAnswer:"geht", explanation:"Bei 'er': geh-t", xpReward:5 },
  // machen
  { id:"vp-machen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ Hausaufgaben. (machen)", options:["mache","machst","macht","machen"], correctAnswer:"mache", explanation:"Bei 'ich': mach-e", xpReward:5 },
  { id:"vp-machen-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ dein Bett. (machen)", options:["mache","machst","macht","machen"], correctAnswer:"machst", explanation:"Bei 'du': mach-st", xpReward:5 },
  // haben — Präteritum (Klasse 3-4)
  { id:"vp-haben-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Gestern ___ ich Hunger. (haben, Präteritum)", options:["hatte","hattest","hatte","hatten"], correctAnswer:"hatte", explanation:"Präteritum von 'haben' (ich): hatt-e", xpReward:5 },
  { id:"vp-haben-praet-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ keine Zeit. (haben, Präteritum)", options:["hatte","hattest","hatten","habt"], correctAnswer:"hattest", explanation:"Präteritum von 'haben' (du): hatt-est", xpReward:5 },
  // sein — Präteritum
  { id:"vp-sein-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ krank. (sein, Präteritum)", options:["war","warst","waren","wart"], correctAnswer:"war", explanation:"Präteritum von 'sein' (ich): war", xpReward:5 },
  { id:"vp-sein-praet-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ mutig. (sein, Präteritum)", options:["war","warst","waren","wart"], correctAnswer:"warst", explanation:"Präteritum von 'sein' (du): war-st", xpReward:5 },
  { id:"vp-sein-praet-er", category:"verb-conjugation", klasse:3, prompt:"Er ___ glücklich. (sein, Präteritum)", options:["war","warst","waren","wart"], correctAnswer:"war", explanation:"Präteritum von 'sein' (er/sie): war", xpReward:5 },
  // gehen — Präteritum
  { id:"vp-gehen-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ gestern schwimmen. (gehen, Präteritum)", options:["ging","gingst","gingen","geht"], correctAnswer:"ging", explanation:"Präteritum von 'gehen' (ich): ging", xpReward:5 },
  { id:"vp-gehen-praet-er", category:"verb-conjugation", klasse:3, prompt:"Sie ___ ins Kino. (gehen, Präteritum)", options:["ging","gingst","gingen","geht"], correctAnswer:"ging", explanation:"Präteritum von 'gehen' (er/sie): ging", xpReward:5 },
  // kommen — Präteritum
  { id:"vp-kommen-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ zu spät. (kommen, Präteritum)", options:["kam","kamst","kamen","kommt"], correctAnswer:"kam", explanation:"Präteritum von 'kommen' (ich): kam", xpReward:5 },
  // sehen — Präteritum
  { id:"vp-sehen-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ einen Fuchs. (sehen, Präteritum)", options:["sah","sahst","sahen","sieht"], correctAnswer:"sah", explanation:"Präteritum von 'sehen' (ich): sah", xpReward:5 },
  // wissen
  { id:"vp-wissen-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ die Antwort. (wissen)", options:["weiß","weißt","weiß","wissen"], correctAnswer:"weiß", explanation:"'wissen' ist unregelmäßig: ich weiß", xpReward:5 },
  { id:"vp-wissen-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ alles. (wissen)", options:["weiß","weißt","weiß","wissen"], correctAnswer:"weißt", explanation:"'wissen' bei 'du': weiß-t", xpReward:5 },
  // denken
  { id:"vp-denken-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ an dich. (denken)", options:["denke","denkst","denkt","denken"], correctAnswer:"denke", explanation:"Bei 'ich': denk-e", xpReward:5 },
  // helfen
  { id:"vp-helfen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ mir. (helfen)", options:["helfe","hilfst","hilft","helfen"], correctAnswer:"hilfst", explanation:"Bei 'du' ändert sich e→i: hilf-st", xpReward:5 },
  { id:"vp-helfen-er", category:"verb-conjugation", klasse:2, prompt:"Er ___ seiner Mutter. (helfen)", options:["helfe","hilfst","hilft","helfen"], correctAnswer:"hilft", explanation:"Bei 'er' ändert sich e→i: hilf-t", xpReward:5 },
  // nehmen
  { id:"vp-nehmen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ das Buch. (nehmen)", options:["nehme","nimmst","nimmt","nehmen"], correctAnswer:"nimmst", explanation:"Bei 'du' ändert sich e→i (Verdoppelung): nimm-st", xpReward:5 },
  { id:"vp-nehmen-er", category:"verb-conjugation", klasse:2, prompt:"Sie ___ den Stift. (nehmen)", options:["nehme","nimmst","nimmt","nehmen"], correctAnswer:"nimmt", explanation:"Bei 'er/sie' ändert sich e→i (Verdoppelung): nimm-t", xpReward:5 },
  // werfen
  { id:"vp-werfen-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ den Ball. (werfen)", options:["werfe","wirfst","wirft","werfen"], correctAnswer:"wirfst", explanation:"Bei 'du' ändert sich e→i: wirf-st", xpReward:5 },
  { id:"vp-werfen-er", category:"verb-conjugation", klasse:3, prompt:"Er ___ den Ball weit. (werfen)", options:["werfe","wirfst","wirft","werfen"], correctAnswer:"wirft", explanation:"Bei 'er' ändert sich e→i: wirf-t", xpReward:5 },
  // sprechen
  { id:"vp-sprechen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ Deutsch. (sprechen)", options:["spreche","sprichst","spricht","sprechen"], correctAnswer:"sprichst", explanation:"Bei 'du' ändert sich e→i: sprich-st", xpReward:5 },
  { id:"vp-sprechen-er", category:"verb-conjugation", klasse:2, prompt:"Er ___ leise. (sprechen)", options:["spreche","sprichst","spricht","sprechen"], correctAnswer:"spricht", explanation:"Bei 'er' ändert sich e→i: sprich-t", xpReward:5 },
  // vergessen
  { id:"vp-vergessen-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ deine Jacke. (vergessen)", options:["vergesse","vergisst","vergisst","vergessen"], correctAnswer:"vergisst", explanation:"Bei 'du' ändert sich e→i: vergiss-t", xpReward:5 },
  // treffen
  { id:"vp-treffen-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ meine Freunde. (treffen)", options:["treffe","triffst","trifft","treffen"], correctAnswer:"treffe", explanation:"Bei 'ich': treff-e", xpReward:5 },
  { id:"vp-treffen-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ sie morgen. (treffen)", options:["treffe","triffst","trifft","treffen"], correctAnswer:"triffst", explanation:"Bei 'du' ändert sich e→i: triff-st", xpReward:5 },
  // halten
  { id:"vp-halten-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ den Stift fest. (halten)", options:["halte","hältst","hält","halten"], correctAnswer:"hältst", explanation:"Bei 'du' ändert sich a→ä: häl-tst", xpReward:5 },
  { id:"vp-halten-er", category:"verb-conjugation", klasse:3, prompt:"Er ___ die Tür auf. (halten)", options:["halte","hältst","hält","halten"], correctAnswer:"hält", explanation:"Bei 'er' ändert sich a→ä: häl-t", xpReward:5 },
  // fallen
  { id:"vp-fallen-du", category:"verb-conjugation", klasse:3, prompt:"Du ___ hin. (fallen)", options:["falle","fällst","fällt","fallen"], correctAnswer:"fällst", explanation:"Bei 'du' ändert sich a→ä: fäll-st", xpReward:5 },
  // graben
  { id:"vp-graben-du", category:"verb-conjugation", klasse:4, prompt:"Du ___ ein Loch. (graben)", options:["grabe","gräbst","gräbt","graben"], correctAnswer:"gräbst", explanation:"Bei 'du' ändert sich a→ä: gräb-st", xpReward:5 },
  // wachsen
  { id:"vp-wachsen-du", category:"verb-conjugation", klasse:4, prompt:"Du ___ schnell. (wachsen)", options:["wachse","wächst","wächst","wachsen"], correctAnswer:"wächst", explanation:"Bei 'du' ändert sich a→ä: wächs-t", xpReward:5 },
  // laufen Präteritum
  { id:"vp-laufen-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ schnell weg. (laufen, Präteritum)", options:["lief","liefst","liefen","läuft"], correctAnswer:"lief", explanation:"Präteritum von 'laufen' (ich): lief", xpReward:5 },
  // finden
  { id:"vp-finden-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ das Buch. (finden)", options:["finde","findest","findet","finden"], correctAnswer:"finde", explanation:"Bei 'ich': find-e", xpReward:5 },
  { id:"vp-finden-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ den Schlüssel. (finden)", options:["finde","findest","findet","finden"], correctAnswer:"findest", explanation:"Bei 'du': find-est", xpReward:5 },
  // kaufen
  { id:"vp-kaufen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ ein Eis. (kaufen)", options:["kaufe","kaufst","kauft","kaufen"], correctAnswer:"kaufe", explanation:"Bei 'ich': kauf-e", xpReward:5 },
  { id:"vp-kaufen-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ Brot. (kaufen)", options:["kaufe","kaufst","kauft","kaufen"], correctAnswer:"kaufst", explanation:"Bei 'du': kauf-st", xpReward:5 },
  // hören
  { id:"vp-hören-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ Musik. (hören)", options:["höre","hörst","hört","hören"], correctAnswer:"höre", explanation:"Bei 'ich': hör-e", xpReward:5 },
  { id:"vp-hören-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ Vogelgesang. (hören)", options:["höre","hörst","hört","hören"], correctAnswer:"hörst", explanation:"Bei 'du': hör-st", xpReward:5 },
  // tanzen
  { id:"vp-tanzen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ gern. (tanzen)", options:["tanze","tanzt","tanzen","tanzst"], correctAnswer:"tanze", explanation:"Bei 'ich': tanz-e", xpReward:5 },
  // singen
  { id:"vp-singen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ ein Lied. (singen)", options:["singe","singst","singt","singen"], correctAnswer:"singe", explanation:"Bei 'ich': sing-e", xpReward:5 },
  { id:"vp-singen-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ schön. (singen)", options:["singe","singst","singt","singen"], correctAnswer:"singst", explanation:"Bei 'du': sing-st", xpReward:5 },
  // wohnen
  { id:"vp-wohnen-ich", category:"verb-conjugation", klasse:1, prompt:"Ich ___ in Berlin. (wohnen)", options:["wohne","wohnst","wohnt","wohnen"], correctAnswer:"wohne", explanation:"Bei 'ich': wohn-e", xpReward:5 },
  { id:"vp-wohnen-du", category:"verb-conjugation", klasse:1, prompt:"Du ___ auf dem Land. (wohnen)", options:["wohne","wohnst","wohnt","wohnen"], correctAnswer:"wohnst", explanation:"Bei 'du': wohn-st", xpReward:5 },
  // bauen
  { id:"vp-bauen-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ eine Burg. (bauen)", options:["baue","baust","baut","bauen"], correctAnswer:"baue", explanation:"Bei 'ich': bau-e", xpReward:5 },
  // schlafen — Präteritum
  { id:"vp-schlafen-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ tief. (schlafen, Präteritum)", options:["schlief","schliefst","schliefen","schläft"], correctAnswer:"schlief", explanation:"Präteritum von 'schlafen' (ich): schlief", xpReward:5 },
  // essen — Präteritum
  { id:"vp-essen-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ einen Apfel. (essen, Präteritum)", options:["aß","aßt","aßen","isst"], correctAnswer:"aß", explanation:"Präteritum von 'essen' (ich): aß", xpReward:5 },
  // nehmen — Präteritum
  { id:"vp-nehmen-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ das Buch. (nehmen, Präteritum)", options:["nahm","nahmst","nahmen","nimmt"], correctAnswer:"nahm", explanation:"Präteritum von 'nehmen' (ich): nahm", xpReward:5 },
  // finden — Präteritum
  { id:"vp-finden-praet-ich", category:"verb-conjugation", klasse:3, prompt:"Ich ___ den Ring. (finden, Präteritum)", options:["fand","fandst","fanden","findet"], correctAnswer:"fand", explanation:"Präteritum von 'finden' (ich): fand", xpReward:5 },
  // bringen — Präteritum
  { id:"vp-bringen-praet-ich", category:"verb-conjugation", klasse:4, prompt:"Ich ___ das Geschenk. (bringen, Präteritum)", options:["brachte","brachtest","brachten","bringt"], correctAnswer:"brachte", explanation:"Präteritum von 'bringen' (ich): brachte", xpReward:5 },
  // denken — Präteritum
  { id:"vp-denken-praet-ich", category:"verb-conjugation", klasse:4, prompt:"Ich ___ nach. (denken, Präteritum)", options:["dachte","dachtest","dachten","denkt"], correctAnswer:"dachte", explanation:"Präteritum von 'denken' (ich): dachte", xpReward:5 },
  // stehen
  { id:"vp-stehen-ich", category:"verb-conjugation", klasse:2, prompt:"Ich ___ vor der Tür. (stehen)", options:["stehe","stehst","steht","stehen"], correctAnswer:"stehe", explanation:"Bei 'ich': steh-e", xpReward:5 },
  { id:"vp-stehen-du", category:"verb-conjugation", klasse:2, prompt:"Du ___ auf dem Podium. (stehen)", options:["stehe","stehst","steht","stehen"], correctAnswer:"stehst", explanation:"Bei 'du': steh-st", xpReward:5 },
];

export function getRandomVerbExercises(n: number): GrammarExercise[] {
  return shuffleArray(verbConjugationPool).slice(0, n);
}

import type { Klasse } from "../types/index.js";

export interface ReadingTextStatic {
  title: string;
  text: string;
  questions: { question: string; answer: string }[];
  klasse: Klasse;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const readingTextsPool: ReadingTextStatic[] = [
  // ── Klasse 1 ──────────────────────────────────────────────────────────────
  {
    klasse: 1,
    title: "Der kleine Fuchs",
    text: "Ein Fuchs wohnt im Wald. Er hat rotes Fell. Der Fuchs sucht Futter.",
    questions: [
      { question: "Wo wohnt der Fuchs?", answer: "Im Wald" },
      { question: "Welche Farbe hat sein Fell?", answer: "Rot" },
      { question: "Was sucht der Fuchs?", answer: "Futter" },
    ],
  },
  {
    klasse: 1,
    title: "Die Katze schläft",
    text: "Eine Katze liegt auf dem Sofa. Sie schläft tief. Die Katze ist weich.",
    questions: [
      { question: "Wo liegt die Katze?", answer: "Auf dem Sofa" },
      { question: "Was macht die Katze?", answer: "Sie schläft" },
      { question: "Wie ist die Katze?", answer: "Weich" },
    ],
  },
  {
    klasse: 1,
    title: "Der Hund spielt",
    text: "Tom hat einen Hund. Der Hund heißt Max. Max spielt mit dem Ball.",
    questions: [
      { question: "Wer hat einen Hund?", answer: "Tom" },
      { question: "Wie heißt der Hund?", answer: "Max" },
      { question: "Womit spielt Max?", answer: "Mit dem Ball" },
    ],
  },
  {
    klasse: 1,
    title: "Der Apfelbaum",
    text: "Im Garten steht ein Baum. Der Baum hat viele Äpfel. Die Äpfel sind rot.",
    questions: [
      { question: "Wo steht der Baum?", answer: "Im Garten" },
      { question: "Was hat der Baum?", answer: "Viele Äpfel" },
      { question: "Welche Farbe haben die Äpfel?", answer: "Rot" },
    ],
  },
  {
    klasse: 1,
    title: "Die Sonne scheint",
    text: "Heute scheint die Sonne. Es ist warm. Mia geht in den Garten.",
    questions: [
      { question: "Was scheint heute?", answer: "Die Sonne" },
      { question: "Wie ist das Wetter?", answer: "Warm" },
      { question: "Wohin geht Mia?", answer: "In den Garten" },
    ],
  },
  {
    klasse: 1,
    title: "Das Haustier",
    text: "Lisa hat ein Kaninchen. Es ist weiß und flauschig. Lisa füttert es jeden Tag.",
    questions: [
      { question: "Was hat Lisa?", answer: "Ein Kaninchen" },
      { question: "Wie sieht das Kaninchen aus?", answer: "Weiß und flauschig" },
      { question: "Was macht Lisa jeden Tag?", answer: "Es füttern" },
    ],
  },
  {
    klasse: 1,
    title: "Regen und Pfützen",
    text: "Es regnet heute. Die Straße ist nass. Ben springt in die Pfütze.",
    questions: [
      { question: "Wie ist das Wetter heute?", answer: "Es regnet" },
      { question: "Wie ist die Straße?", answer: "Nass" },
      { question: "Was macht Ben?", answer: "In die Pfütze springen" },
    ],
  },
  {
    klasse: 1,
    title: "Das Frühstück",
    text: "Am Morgen esse ich Brot. Ich trinke Milch. Das Frühstück schmeckt gut.",
    questions: [
      { question: "Was esse ich am Morgen?", answer: "Brot" },
      { question: "Was trinke ich?", answer: "Milch" },
      { question: "Wie schmeckt das Frühstück?", answer: "Gut" },
    ],
  },
  {
    klasse: 1,
    title: "Die Schule",
    text: "Ich gehe gern in die Schule. Dort lerne ich viel. Meine Lehrerin ist nett.",
    questions: [
      { question: "Wohin gehe ich gern?", answer: "In die Schule" },
      { question: "Was mache ich dort?", answer: "Ich lerne viel" },
      { question: "Wie ist meine Lehrerin?", answer: "Nett" },
    ],
  },
  {
    klasse: 1,
    title: "Der Vogel singt",
    text: "Ein Vogel sitzt auf dem Ast. Er singt laut. Der Vogel ist bunt.",
    questions: [
      { question: "Wo sitzt der Vogel?", answer: "Auf dem Ast" },
      { question: "Was macht der Vogel?", answer: "Er singt" },
      { question: "Wie ist der Vogel?", answer: "Bunt" },
    ],
  },
  {
    klasse: 1,
    title: "Der rote Roller",
    text: "Tim hat einen Roller. Er ist rot. Tim fährt damit zur Schule.",
    questions: [
      { question: "Was hat Tim?", answer: "Einen Roller" },
      { question: "Welche Farbe hat der Roller?", answer: "Rot" },
      { question: "Wohin fährt Tim?", answer: "Zur Schule" },
    ],
  },
  {
    klasse: 1,
    title: "Im Zoo",
    text: "Wir gehen in den Zoo. Ich sehe einen Elefanten. Er ist sehr groß.",
    questions: [
      { question: "Wohin gehen wir?", answer: "In den Zoo" },
      { question: "Was sehe ich?", answer: "Einen Elefanten" },
      { question: "Wie ist der Elefant?", answer: "Sehr groß" },
    ],
  },
  {
    klasse: 1,
    title: "Das Schneehaus",
    text: "Im Winter gibt es Schnee. Ich baue ein Schneehaus. Es macht Spaß.",
    questions: [
      { question: "In welcher Jahreszeit gibt es Schnee?", answer: "Im Winter" },
      { question: "Was baue ich?", answer: "Ein Schneehaus" },
      { question: "Wie ist es?", answer: "Es macht Spaß" },
    ],
  },
  {
    klasse: 1,
    title: "Der Geburtstag",
    text: "Heute ist mein Geburtstag. Ich werde sieben Jahre alt. Ich bekomme Geschenke.",
    questions: [
      { question: "Was ist heute?", answer: "Mein Geburtstag" },
      { question: "Wie alt werde ich?", answer: "Sieben Jahre alt" },
      { question: "Was bekomme ich?", answer: "Geschenke" },
    ],
  },
  {
    klasse: 1,
    title: "Der Hase im Wald",
    text: "Ein Hase läuft durch den Wald. Er hat lange Ohren. Der Hase hüpft schnell.",
    questions: [
      { question: "Wo läuft der Hase?", answer: "Durch den Wald" },
      { question: "Was hat der Hase?", answer: "Lange Ohren" },
      { question: "Wie hüpft der Hase?", answer: "Schnell" },
    ],
  },
  {
    klasse: 1,
    title: "Das Picknick",
    text: "Wir machen ein Picknick. Wir essen Brot und Obst. Die Sonne scheint.",
    questions: [
      { question: "Was machen wir?", answer: "Ein Picknick" },
      { question: "Was essen wir?", answer: "Brot und Obst" },
      { question: "Wie ist das Wetter?", answer: "Die Sonne scheint" },
    ],
  },
  {
    klasse: 1,
    title: "Die Feuerwehr",
    text: "Die Feuerwehr ist stark. Das Auto ist rot. Die Feuerwehr hilft bei Feuer.",
    questions: [
      { question: "Wie ist die Feuerwehr?", answer: "Stark" },
      { question: "Welche Farbe hat das Auto?", answer: "Rot" },
      { question: "Wann hilft die Feuerwehr?", answer: "Bei Feuer" },
    ],
  },
  {
    klasse: 1,
    title: "Auf dem Bauernhof",
    text: "Auf dem Bauernhof gibt es viele Tiere. Da sind Hühner und Kühe. Die Kühe geben Milch.",
    questions: [
      { question: "Wo gibt es viele Tiere?", answer: "Auf dem Bauernhof" },
      { question: "Welche Tiere gibt es dort?", answer: "Hühner und Kühe" },
      { question: "Was geben die Kühe?", answer: "Milch" },
    ],
  },
  {
    klasse: 1,
    title: "Das Schwimmbad",
    text: "Im Sommer gehe ich schwimmen. Das Wasser ist kalt. Ich mag das Schwimmbad.",
    questions: [
      { question: "In welcher Jahreszeit gehe ich schwimmen?", answer: "Im Sommer" },
      { question: "Wie ist das Wasser?", answer: "Kalt" },
      { question: "Mag ich das Schwimmbad?", answer: "Ja" },
    ],
  },
  {
    klasse: 1,
    title: "Die Schmetterlinge",
    text: "Im Garten fliegen Schmetterlinge. Sie sind bunt und schön. Ich schaue ihnen gern zu.",
    questions: [
      { question: "Wo fliegen die Schmetterlinge?", answer: "Im Garten" },
      { question: "Wie sind sie?", answer: "Bunt und schön" },
      { question: "Was mache ich gern?", answer: "Ihnen zuschauen" },
    ],
  },

  // ── Klasse 2 ──────────────────────────────────────────────────────────────
  {
    klasse: 2,
    title: "Der kleine Ritter",
    text: "Konrad ist ein kleiner Ritter. Er wohnt in einer Burg. Jeden Tag übt er mit dem Schwert. Seine Rüstung glänzt in der Sonne.",
    questions: [
      { question: "Wie heißt der Ritter?", answer: "Konrad" },
      { question: "Wo wohnt er?", answer: "In einer Burg" },
      { question: "Was übt er jeden Tag?", answer: "Mit dem Schwert" },
    ],
  },
  {
    klasse: 2,
    title: "Die Meerjungfrau",
    text: "Im Meer wohnt eine Meerjungfrau. Sie hat langes rotes Haar. Die Meerjungfrau schwimmt durch das Wasser. Sie sammelt bunte Muscheln.",
    questions: [
      { question: "Wo wohnt die Meerjungfrau?", answer: "Im Meer" },
      { question: "Wie ist ihr Haar?", answer: "Lang und rot" },
      { question: "Was sammelt sie?", answer: "Bunte Muscheln" },
    ],
  },
  {
    klasse: 2,
    title: "Der Apfelkuchen",
    text: "Oma backt einen Apfelkuchen. Sie braucht Äpfel, Mehl und Zucker. Der Kuchen riecht herrlich. Wir essen ihn gemeinsam.",
    questions: [
      { question: "Was backt Oma?", answer: "Einen Apfelkuchen" },
      { question: "Wie riecht der Kuchen?", answer: "Herrlich" },
      { question: "Was macht die Familie?", answer: "Den Kuchen gemeinsam essen" },
    ],
  },
  {
    klasse: 2,
    title: "Der Herbst kommt",
    text: "Im Herbst werden die Blätter bunt. Sie fallen von den Bäumen. Die Kinder sammeln Kastanien. Daraus basteln sie Tiere.",
    questions: [
      { question: "Was passiert mit den Blättern im Herbst?", answer: "Sie werden bunt und fallen von den Bäumen" },
      { question: "Was sammeln die Kinder?", answer: "Kastanien" },
      { question: "Was basteln sie daraus?", answer: "Tiere" },
    ],
  },
  {
    klasse: 2,
    title: "Das Fußballspiel",
    text: "Leon spielt Fußball. Er ist der beste Torwart. Das Team trainiert dreimal pro Woche. Am Samstag haben sie ein großes Spiel.",
    questions: [
      { question: "Was spielt Leon?", answer: "Fußball" },
      { question: "Welche Position spielt er?", answer: "Torwart" },
      { question: "Wann ist das große Spiel?", answer: "Am Samstag" },
    ],
  },
  {
    klasse: 2,
    title: "Im Supermarkt",
    text: "Mama geht einkaufen. Sie nimmt eine Liste mit. Im Supermarkt kauft sie Gemüse und Obst. An der Kasse bezahlt sie.",
    questions: [
      { question: "Wohin geht Mama?", answer: "Einkaufen" },
      { question: "Was nimmt sie mit?", answer: "Eine Liste" },
      { question: "Was kauft sie?", answer: "Gemüse und Obst" },
    ],
  },
  {
    klasse: 2,
    title: "Der Regenbogen",
    text: "Nach dem Regen kommt die Sonne. Am Himmel erscheint ein Regenbogen. Er hat viele Farben. Emma zeigt darauf und lacht.",
    questions: [
      { question: "Was kommt nach dem Regen?", answer: "Die Sonne" },
      { question: "Was erscheint am Himmel?", answer: "Ein Regenbogen" },
      { question: "Wer zeigt darauf?", answer: "Emma" },
    ],
  },
  {
    klasse: 2,
    title: "Das Zirkuszelt",
    text: "Der Zirkus kommt in die Stadt. Das Zelt ist rot und blau. Akrobaten und Clowns treten auf. Das Publikum klatscht begeistert.",
    questions: [
      { question: "Was kommt in die Stadt?", answer: "Der Zirkus" },
      { question: "Welche Farben hat das Zelt?", answer: "Rot und blau" },
      { question: "Wie reagiert das Publikum?", answer: "Es klatscht begeistert" },
    ],
  },
  {
    klasse: 2,
    title: "Die Bibliothek",
    text: "Lena geht in die Bibliothek. Sie leiht drei Bücher aus. Sie mag Abenteuergeschichten. Zuhause liest sie sofort los.",
    questions: [
      { question: "Wohin geht Lena?", answer: "In die Bibliothek" },
      { question: "Wie viele Bücher leiht sie aus?", answer: "Drei" },
      { question: "Was mag sie gern lesen?", answer: "Abenteuergeschichten" },
    ],
  },
  {
    klasse: 2,
    title: "Wintertag",
    text: "Es hat in der Nacht geschneit. Der Garten ist weiß. Die Kinder gehen raus. Sie bauen einen großen Schneemann.",
    questions: [
      { question: "Was ist in der Nacht passiert?", answer: "Es hat geschneit" },
      { question: "Wie sieht der Garten aus?", answer: "Weiß" },
      { question: "Was bauen die Kinder?", answer: "Einen Schneemann" },
    ],
  },
  {
    klasse: 2,
    title: "Der Drachen",
    text: "Nico hat einen bunten Drachen. Er lässt ihn bei Wind steigen. Der Drachen fliegt hoch in die Luft. Nico hält die Schnur fest.",
    questions: [
      { question: "Was hat Nico?", answer: "Einen bunten Drachen" },
      { question: "Wann lässt er ihn steigen?", answer: "Bei Wind" },
      { question: "Was hält Nico fest?", answer: "Die Schnur" },
    ],
  },
  {
    klasse: 2,
    title: "Die Tierfarm",
    text: "Familie Meier hat eine Tierfarm. Dort leben Ziegen, Hühner und ein Esel. Die Kinder helfen jeden Morgen. Sie mögen alle Tiere sehr.",
    questions: [
      { question: "Was hat Familie Meier?", answer: "Eine Tierfarm" },
      { question: "Welche Tiere leben dort?", answer: "Ziegen, Hühner und ein Esel" },
      { question: "Wann helfen die Kinder?", answer: "Jeden Morgen" },
    ],
  },
  {
    klasse: 2,
    title: "Das Waldabenteuer",
    text: "Felix und Anna gehen in den Wald. Sie finden einen kleinen Bach. Sie bauen eine Brücke aus Ästen. Die Brücke hält gut.",
    questions: [
      { question: "Wohin gehen Felix und Anna?", answer: "In den Wald" },
      { question: "Was finden sie?", answer: "Einen kleinen Bach" },
      { question: "Woraus bauen sie eine Brücke?", answer: "Aus Ästen" },
    ],
  },
  {
    klasse: 2,
    title: "Der Leuchtturm",
    text: "Am Meer steht ein Leuchtturm. Er leuchtet in der Nacht. Schiffe sehen das Licht. So finden sie sicher den Hafen.",
    questions: [
      { question: "Wo steht der Leuchtturm?", answer: "Am Meer" },
      { question: "Wann leuchtet er?", answer: "In der Nacht" },
      { question: "Wozu brauchen Schiffe das Licht?", answer: "Um sicher den Hafen zu finden" },
    ],
  },
  {
    klasse: 2,
    title: "Der sprechende Papagei",
    text: "Onkel Klaus hat einen Papagei. Er heißt Polly. Polly kann Wörter nachsprechen. Er sagt immer: Hallo! und Danke!",
    questions: [
      { question: "Wer hat einen Papagei?", answer: "Onkel Klaus" },
      { question: "Wie heißt der Papagei?", answer: "Polly" },
      { question: "Was kann Polly tun?", answer: "Wörter nachsprechen" },
    ],
  },
  {
    klasse: 2,
    title: "Die Hafenstadt",
    text: "Hamburg ist eine große Hafenstadt. Im Hafen gibt es viele Schiffe. Die Schiffe bringen Waren aus aller Welt. Viele Leute arbeiten dort.",
    questions: [
      { question: "Was ist Hamburg?", answer: "Eine große Hafenstadt" },
      { question: "Was gibt es im Hafen?", answer: "Viele Schiffe" },
      { question: "Was bringen die Schiffe?", answer: "Waren aus aller Welt" },
    ],
  },
  {
    klasse: 2,
    title: "Das Aquarium",
    text: "Wir besuchen das Aquarium. Dort schwimmen viele bunte Fische. Ein großer Hai dreht seine Runden. Ich staune über die Quallen.",
    questions: [
      { question: "Was besuchen wir?", answer: "Das Aquarium" },
      { question: "Welches große Tier sehen wir?", answer: "Einen Hai" },
      { question: "Worüber staune ich?", answer: "Über die Quallen" },
    ],
  },
  {
    klasse: 2,
    title: "Die Geisterbahn",
    text: "Auf dem Jahrmarkt gibt es eine Geisterbahn. Lara steigt mutig ein. Es ist dunkel und gruselig. Am Ende lacht Lara laut.",
    questions: [
      { question: "Wo ist die Geisterbahn?", answer: "Auf dem Jahrmarkt" },
      { question: "Wie steigt Lara ein?", answer: "Mutig" },
      { question: "Was macht Lara am Ende?", answer: "Laut lachen" },
    ],
  },
  {
    klasse: 2,
    title: "Die Osterhasen-Bäckerei",
    text: "Bäcker Schmidt macht Osterhasen aus Teig. Er backt sie im Ofen. Die Hasen riechen gut. Kinder freuen sich darüber.",
    questions: [
      { question: "Was macht Bäcker Schmidt?", answer: "Osterhasen aus Teig" },
      { question: "Wo backt er sie?", answer: "Im Ofen" },
      { question: "Wer freut sich darüber?", answer: "Kinder" },
    ],
  },
  {
    klasse: 2,
    title: "Das Baumhaus",
    text: "Paul und Finn haben ein Baumhaus. Es ist hoch oben im Baum. Sie schlafen manchmal dort. Sie fühlen sich wie Abenteurer.",
    questions: [
      { question: "Was haben Paul und Finn?", answer: "Ein Baumhaus" },
      { question: "Wo ist das Baumhaus?", answer: "Hoch oben im Baum" },
      { question: "Wie fühlen sie sich dort?", answer: "Wie Abenteurer" },
    ],
  },

  // ── Klasse 3 ──────────────────────────────────────────────────────────────
  {
    klasse: 3,
    title: "Die Reise nach Berlin",
    text: "Unsere Klasse fährt nach Berlin. Wir fahren mit dem Zug. In Berlin besuchen wir das Brandenburger Tor. Danach gehen wir ins Museum. Die Stadt ist sehr aufregend. Am Abend essen wir Pizza.",
    questions: [
      { question: "Wohin fährt die Klasse?", answer: "Nach Berlin" },
      { question: "Womit fahren sie?", answer: "Mit dem Zug" },
      { question: "Was besuchen sie in Berlin?", answer: "Das Brandenburger Tor" },
    ],
  },
  {
    klasse: 3,
    title: "Der Bienenstock",
    text: "Bienen sind sehr fleißige Tiere. Sie sammeln Nektar von Blumen. Aus dem Nektar machen sie Honig. Im Bienenstock wohnen viele tausend Bienen. Die Königin ist die wichtigste Biene. Ohne sie gibt es keinen Nachwuchs.",
    questions: [
      { question: "Was sammeln Bienen?", answer: "Nektar" },
      { question: "Was machen sie aus dem Nektar?", answer: "Honig" },
      { question: "Wer ist die wichtigste Biene?", answer: "Die Königin" },
    ],
  },
  {
    klasse: 3,
    title: "Das Geheimnis des alten Hauses",
    text: "Am Ende der Straße steht ein altes Haus. Die Kinder im Dorf fragen sich, wer dort wohnt. An einem Herbsttag klopft Maria mutig an die Tür. Eine alte Frau öffnet und lächelt freundlich. Sie lädt Maria auf Tee ein. Maria erfährt, dass die Frau früher eine Lehrerin war.",
    questions: [
      { question: "Wer klopft an die Tür?", answer: "Maria" },
      { question: "Wer öffnet die Tür?", answer: "Eine alte Frau" },
      { question: "Was war die Frau früher?", answer: "Lehrerin" },
    ],
  },
  {
    klasse: 3,
    title: "Das Schulprojekt",
    text: "Die Klasse 3b macht ein Projekt über Tiere. Jedes Kind wählt ein Lieblingstier. Tom wählt den Delfin, weil er so klug ist. Er liest viele Bücher und macht Notizen. Am Ende hält er einen Vortrag. Die Klasse ist sehr begeistert.",
    questions: [
      { question: "Worum geht es beim Projekt?", answer: "Um Tiere" },
      { question: "Welches Tier wählt Tom?", answer: "Den Delfin" },
      { question: "Was macht Tom am Ende?", answer: "Einen Vortrag" },
    ],
  },
  {
    klasse: 3,
    title: "Der Vulkan",
    text: "Vulkane sind feuerspeiende Berge. Im Inneren ist es sehr heiß. Wenn ein Vulkan ausbricht, fließt Lava aus. Die Lava kann sehr weit fließen. Viele Vulkane liegen unter dem Meer. Auf Hawaii gibt es besonders viele Vulkane.",
    questions: [
      { question: "Was ist ein Vulkan?", answer: "Ein feuerspeiender Berg" },
      { question: "Was fließt aus einem Vulkan?", answer: "Lava" },
      { question: "Wo liegen viele Vulkane?", answer: "Unter dem Meer" },
    ],
  },
  {
    klasse: 3,
    title: "Die Himmelsbeobachter",
    text: "Familie Sternberg liebt es, den Nachthimmel zu beobachten. Sie haben ein Teleskop auf dem Dach. Im Sommer können sie den Großen Wagen sehen. Manchmal fliegen Sternschnuppen vorbei. Dann wünschen sich alle etwas. Jan wünscht sich, einmal auf dem Mond zu landen.",
    questions: [
      { question: "Was macht Familie Sternberg gern?", answer: "Den Nachthimmel beobachten" },
      { question: "Was haben sie auf dem Dach?", answer: "Ein Teleskop" },
      { question: "Was wünscht sich Jan?", answer: "Einmal auf dem Mond zu landen" },
    ],
  },
  {
    klasse: 3,
    title: "Das Recycling",
    text: "Mia und ihr Bruder Jonas lernen, Müll zu trennen. Papier kommt in die blaue Tonne. Glas geht in den Glascontainer. Plastik und Verpackungen kommen in den gelben Sack. Bio-Abfälle landen im Kompost. So schützen wir unsere Erde.",
    questions: [
      { question: "Was machen Mia und Jonas?", answer: "Müll trennen" },
      { question: "Wohin kommt Papier?", answer: "In die blaue Tonne" },
      { question: "Was passiert mit Bio-Abfällen?", answer: "Sie kommen in den Kompost" },
    ],
  },
  {
    klasse: 3,
    title: "Der Marktplatz",
    text: "Am Dienstag ist Markt in der Stadt. Bauern bringen Gemüse und Obst. Bäcker verkaufen frisches Brot. An einem Stand gibt es bunte Blumen. Opa kauft Tomaten und Paprika. Die Marktatmosphäre ist immer sehr lebhaft.",
    questions: [
      { question: "Wann ist Markt in der Stadt?", answer: "Am Dienstag" },
      { question: "Was bringen Bauern mit?", answer: "Gemüse und Obst" },
      { question: "Was kauft Opa?", answer: "Tomaten und Paprika" },
    ],
  },
  {
    klasse: 3,
    title: "Der Tintenfisch",
    text: "Tintenfische leben im Meer. Sie haben acht Arme. Wenn sie Gefahr spüren, spritzen sie Tinte ins Wasser. Das Wasser wird dunkel, und sie können fliehen. Tintenfische sind sehr kluge Tiere. Sie können sogar Probleme lösen.",
    questions: [
      { question: "Wie viele Arme hat ein Tintenfisch?", answer: "Acht" },
      { question: "Was tun sie bei Gefahr?", answer: "Tinte ins Wasser spritzen" },
      { question: "Wie sind Tintenfische?", answer: "Sehr klug" },
    ],
  },
  {
    klasse: 3,
    title: "Der Radweg",
    text: "Die Gemeinde baut einen neuen Radweg. Er verbindet das Dorf mit der Stadt. Kinder können jetzt sicher zur Schule radeln. Der Weg ist drei Kilometer lang. Viele Familien freuen sich darüber. Der Radweg ist schon sehr beliebt.",
    questions: [
      { question: "Was baut die Gemeinde?", answer: "Einen Radweg" },
      { question: "Wie lang ist der Weg?", answer: "Drei Kilometer" },
      { question: "Wer freut sich darüber?", answer: "Viele Familien" },
    ],
  },
  {
    klasse: 3,
    title: "Das Schulfest",
    text: "Nächste Woche ist Schulfest. Die Klassen basteln Dekorationen. Eltern backen Kuchen und Waffeln. Die Musikklasse spielt ein Konzert. Es gibt auch Spiele und Wettbewerbe. Das Schulfest dauert den ganzen Tag.",
    questions: [
      { question: "Wann ist Schulfest?", answer: "Nächste Woche" },
      { question: "Was spielen die Musikklasse?", answer: "Ein Konzert" },
      { question: "Wie lange dauert das Schulfest?", answer: "Den ganzen Tag" },
    ],
  },
  {
    klasse: 3,
    title: "Der Flughund",
    text: "Flughunde sind keine richtigen Hunde, sondern sehr große Fledermäuse. Sie schlafen tagsüber kopfüber in den Bäumen. Nachts fliegen sie aus und suchen Früchte. Flughunde können weit fliegen. Sie leben vor allem in tropischen Gebieten. Einige Arten werden sehr alt.",
    questions: [
      { question: "Was ist ein Flughund eigentlich?", answer: "Eine große Fledermaus" },
      { question: "Wann schlafen Flughunde?", answer: "Tagsüber" },
      { question: "Was fressen sie?", answer: "Früchte" },
    ],
  },
  {
    klasse: 3,
    title: "Die Buchdruckerei",
    text: "Johannes Gutenberg erfand den Buchdruck. Vorher mussten Bücher von Hand geschrieben werden. Mit Gutenbergs Maschine konnte man viele Bücher schnell drucken. Das war eine große Revolution. Jetzt konnten viele Menschen lesen lernen. Gutenbergs Erfindung veränderte die Welt.",
    questions: [
      { question: "Wer erfand den Buchdruck?", answer: "Johannes Gutenberg" },
      { question: "Wie wurden Bücher vorher hergestellt?", answer: "Von Hand geschrieben" },
      { question: "Was ermöglichte Gutenbergs Erfindung?", answer: "Viele Menschen konnten lesen lernen" },
    ],
  },
  {
    klasse: 3,
    title: "Das Korallenriff",
    text: "Das Korallenriff ist ein Wunder der Natur. Korallen sind kleine Tiere. Sie bauen zusammen riesige Riffe. Dort leben Tausende von Fischarten. Das größte Riff heißt Great Barrier Reef und liegt in Australien. Korallenriffe sind durch den Klimawandel bedroht.",
    questions: [
      { question: "Was sind Korallen?", answer: "Kleine Tiere" },
      { question: "Wo liegt das größte Korallenriff?", answer: "In Australien" },
      { question: "Wodurch sind Korallenriffe bedroht?", answer: "Durch den Klimawandel" },
    ],
  },
  {
    klasse: 3,
    title: "Das Küken schlüpft",
    text: "Das Küken schlägt mit dem Schnabel gegen die Schale. Nach einigen Stunden ist ein Loch im Ei. Langsam arbeitet sich das Küken heraus. Es ist noch sehr nass und schwach. Die Henne wärmt es sofort. Nach wenigen Tagen läuft das Küken schon herum.",
    questions: [
      { question: "Womit schlägt das Küken?", answer: "Mit dem Schnabel" },
      { question: "Wie ist das Küken nach dem Schlüpfen?", answer: "Nass und schwach" },
      { question: "Was macht die Henne?", answer: "Sie wärmt das Küken" },
    ],
  },
  {
    klasse: 3,
    title: "Das Planetarium",
    text: "Im Planetarium können Besucher die Sterne kennenlernen. An der Kuppeldecke werden Sterne und Planeten gezeigt. Eine Führung erklärt die Galaxien. Sandro findet das Weltall faszinierend. Er möchte einmal Astronaut werden. Im Planetariums-Shop kauft er ein Buch über Sterne.",
    questions: [
      { question: "Was wird an der Kuppeldecke gezeigt?", answer: "Sterne und Planeten" },
      { question: "Was möchte Sandro werden?", answer: "Astronaut" },
      { question: "Was kauft er im Shop?", answer: "Ein Buch über Sterne" },
    ],
  },
  {
    klasse: 3,
    title: "Die Mondphasen",
    text: "Der Mond dreht sich um die Erde. Er braucht etwa einen Monat für eine Runde. Dabei verändert sich seine sichtbare Form. Wir sehen ihn manchmal als schmale Sichel, manchmal als Halbmond und manchmal als vollen Kreis. Den vollen Mond nennt man Vollmond. Bei Neumond sehen wir ihn kaum.",
    questions: [
      { question: "Worum dreht sich der Mond?", answer: "Um die Erde" },
      { question: "Wie lange braucht er für eine Runde?", answer: "Etwa einen Monat" },
      { question: "Was ist Vollmond?", answer: "Wenn der Mond als voller Kreis sichtbar ist" },
    ],
  },
  {
    klasse: 3,
    title: "Der Schneeleopard",
    text: "Der Schneeleopard lebt im Gebirge Asiens. Sein Fell ist weißgrau mit schwarzen Flecken. So ist er perfekt getarnt im Schnee. Er ist ein sehr scheues Tier. Menschen sehen ihn selten in freier Wildbahn. Leider ist der Schneeleopard vom Aussterben bedroht.",
    questions: [
      { question: "Wo lebt der Schneeleopard?", answer: "Im Gebirge Asiens" },
      { question: "Wie ist sein Fell?", answer: "Weißgrau mit schwarzen Flecken" },
      { question: "Warum ist er bedroht?", answer: "Er ist vom Aussterben bedroht" },
    ],
  },
  {
    klasse: 3,
    title: "Der Zug durch die Alpen",
    text: "Anja fährt zum ersten Mal durch die Alpen. Aus dem Zugfenster sieht sie hohe Berge. Durch lange Tunnel wird es plötzlich dunkel. Dann erscheinen tiefe Täler und reißende Bäche. Sie fotografiert alles. Die Fahrt durch die Berge macht ihr großen Spaß.",
    questions: [
      { question: "Was sieht Anja aus dem Fenster?", answer: "Hohe Berge" },
      { question: "Was passiert im Tunnel?", answer: "Es wird dunkel" },
      { question: "Was macht Anja während der Fahrt?", answer: "Fotografieren" },
    ],
  },
  {
    klasse: 3,
    title: "Der Frosch im Winter",
    text: "Im Winter schläft der Frosch. Er vergräbt sich im Schlamm am Teichgrund. Sein Herzschlag wird sehr langsam. Er frisst nichts mehr. Im Frühling, wenn es wärmer wird, wacht er wieder auf. Dann sucht er Nahrung und einen Partner.",
    questions: [
      { question: "Was macht der Frosch im Winter?", answer: "Er schläft" },
      { question: "Wo vergräbt er sich?", answer: "Im Schlamm am Teichgrund" },
      { question: "Wann wacht er wieder auf?", answer: "Im Frühling" },
    ],
  },

  // ── Klasse 4 ──────────────────────────────────────────────────────────────
  {
    klasse: 4,
    title: "Die Erfindung des Rades",
    text: "Vor etwa 5500 Jahren erfanden Menschen das Rad. Zuerst nutzten sie es für Töpferscheiben. Später entdeckten sie, dass Räder auch Wagen antreiben können. Das veränderte den Transport grundlegend. Waren und Menschen konnten nun viel weiter und schneller transportiert werden. Das Rad gilt als eine der wichtigsten Erfindungen der Menschheit.\n\nOhne das Rad wäre unsere heutige Gesellschaft undenkbar. Autos, Züge und Fahrräder basieren alle auf diesem einfachen Prinzip. Selbst in der Industrie drehen sich überall Räder in Maschinen.",
    questions: [
      { question: "Für was wurde das Rad zuerst genutzt?", answer: "Für Töpferscheiben" },
      { question: "Wie veränderte das Rad den Transport?", answer: "Waren und Menschen konnten weiter und schneller transportiert werden" },
      { question: "Was gilt das Rad als?", answer: "Eine der wichtigsten Erfindungen der Menschheit" },
    ],
  },
  {
    klasse: 4,
    title: "Das Amazonas-Regenwaldbecken",
    text: "Der Amazonas ist der wasserreichste Fluss der Erde. Er fließt durch Brasilien in Südamerika. Der Regenwald rund um den Amazonas ist die größte zusammenhängende Waldfläche der Welt. Millionen von Tierarten leben dort. Viele davon wurden noch gar nicht entdeckt. Der Regenwald produziert einen Großteil des weltweiten Sauerstoffs.\n\nLeider wird der Regenwald immer kleiner, weil Bäume abgeholzt werden. Das schadet dem Klima und bedroht viele Tierarten. Wissenschaftler kämpfen für den Schutz dieses einzigartigen Ökosystems.",
    questions: [
      { question: "Wo fließt der Amazonas?", answer: "Durch Brasilien in Südamerika" },
      { question: "Wofür ist der Regenwald wichtig?", answer: "Er produziert viel Sauerstoff" },
      { question: "Warum wird der Regenwald kleiner?", answer: "Weil Bäume abgeholzt werden" },
    ],
  },
  {
    klasse: 4,
    title: "Wie Fossilien entstehen",
    text: "Fossilien sind Überreste von Lebewesen, die vor Millionen von Jahren gelebt haben. Wenn ein Tier stirbt und in Schlamm eingebettet wird, kann es versteinern. Mit der Zeit wird der Schlamm zu Stein. Der Körper des Tieres bleibt als Abdruck erhalten. Wissenschaftler nennen diesen Prozess Fossilierung. Es dauert oft mehrere Millionen Jahre.\n\nPaläontologen graben Fossilien aus und untersuchen sie. So erfahren wir, wie Dinosaurier oder andere ausgestorbene Tiere aussahen. Fossilien sind wie Fenster in die Vergangenheit der Erde.",
    questions: [
      { question: "Was sind Fossilien?", answer: "Überreste von Lebewesen aus früherer Zeit" },
      { question: "Wie entsteht ein Fossil?", answer: "Das Tier wird in Schlamm eingebettet und versteinert" },
      { question: "Wer untersucht Fossilien?", answer: "Paläontologen" },
    ],
  },
  {
    klasse: 4,
    title: "Das Stromnetz",
    text: "Strom kommt nicht einfach aus der Steckdose. Zuerst wird er in Kraftwerken erzeugt. Von dort fließt er durch dicke Kabel, die Hochspannungsleitungen. Transformatoren verwandeln den Strom in eine sichere Spannung für Haushalte. Ein komplexes Netz verteilt den Strom an Millionen von Verbrauchern. Dieses System nennt man Stromnetz.\n\nHeute wird immer mehr Strom aus erneuerbaren Quellen gewonnen, wie Solar- und Windenergie. Diese sind besser für die Umwelt als Kohle oder Öl. Das Stromnetz muss dafür angepasst werden.",
    questions: [
      { question: "Wo wird Strom erzeugt?", answer: "In Kraftwerken" },
      { question: "Was machen Transformatoren?", answer: "Sie verwandeln Strom in sichere Spannung" },
      { question: "Welche erneuerbaren Energiequellen gibt es?", answer: "Solar- und Windenergie" },
    ],
  },
  {
    klasse: 4,
    title: "Die Römer in Deutschland",
    text: "Vor etwa 2000 Jahren herrschten die Römer über weite Teile Europas. Auch in Gebieten des heutigen Deutschlands bauten sie Städte und Straßen. Viele dieser Straßen existieren noch heute als Landstraßen. Die Römer brachten neue Technologien und Handelsrouten mit. Sie bauten auch den Limes, einen langen Schutzwall.\n\nDie Römer hinterließen viele Spuren in Deutschland. Archäologen finden noch heute Münzen, Waffen und Gebäude aus der Römerzeit. Städte wie Trier oder Köln haben eine besonders reiche römische Geschichte.",
    questions: [
      { question: "Vor wie vielen Jahren herrschten die Römer?", answer: "Vor etwa 2000 Jahren" },
      { question: "Was ist der Limes?", answer: "Ein langer Schutzwall" },
      { question: "Was finden Archäologen noch heute?", answer: "Münzen, Waffen und Gebäude aus der Römerzeit" },
    ],
  },
  {
    klasse: 4,
    title: "Das Gehirn",
    text: "Das menschliche Gehirn ist das komplexeste Organ des Körpers. Es besteht aus etwa 86 Milliarden Nervenzellen. Diese sind durch unzählige Verbindungen miteinander vernetzt. Das Gehirn steuert alle Körperfunktionen, von Atmung bis zum Denken. Verschiedene Bereiche sind für verschiedene Aufgaben zuständig.\n\nWenn wir schlafen, verarbeitet das Gehirn die Erlebnisse des Tages. Es speichert Wichtiges und sortiert Unwichtiges aus. Deshalb ist guter Schlaf so wichtig für das Lernen. Sport und gesunde Ernährung helfen dem Gehirn, gut zu funktionieren.",
    questions: [
      { question: "Aus wie vielen Nervenzellen besteht das Gehirn?", answer: "Aus etwa 86 Milliarden" },
      { question: "Was macht das Gehirn im Schlaf?", answer: "Es verarbeitet Erlebnisse des Tages" },
      { question: "Was hilft dem Gehirn gut zu funktionieren?", answer: "Sport und gesunde Ernährung" },
    ],
  },
  {
    klasse: 4,
    title: "Die Antarktis",
    text: "Die Antarktis ist der kälteste und trockenste Kontinent der Erde. Im Winter kann die Temperatur auf minus 70 Grad fallen. Das Eis der Antarktis speichert etwa 70 Prozent des gesamten Süßwassers der Erde. Pinguine und Robben leben an den Küsten. Im Inneren gibt es kaum Tiere.\n\nKein Land besitzt die Antarktis offiziell. Ein internationaler Vertrag schützt sie. Wissenschaftler aus vielen Ländern forschen dort. Sie untersuchen das Eis, um mehr über das Klima der Vergangenheit zu erfahren.",
    questions: [
      { question: "Was macht die Antarktis so besonders?", answer: "Sie ist der kälteste und trockenste Kontinent" },
      { question: "Wie viel Süßwasser speichert das Eis?", answer: "Etwa 70 Prozent" },
      { question: "Wer forscht in der Antarktis?", answer: "Wissenschaftler aus vielen Ländern" },
    ],
  },
  {
    klasse: 4,
    title: "Die Geschichte des Buchdrucks",
    text: "Vor Gutenbergs Erfindung des Buchdrucks um 1450 wurden Bücher mühsam von Hand kopiert. Mönche verbrachten Jahre damit, ein einziges Buch zu schreiben. Bücher waren deshalb sehr teuer und selten. Mit Gutenbergs Druckmaschine konnten Bücher schnell und günstig hergestellt werden.\n\nDas führte zu einer Revolution des Wissens. Innerhalb weniger Jahrzehnte wurden Millionen Bücher gedruckt. Wissen verbreitete sich schneller denn je. Mehr Menschen lernten lesen und schreiben. Der Buchdruck gilt als Wegbereiter der modernen Welt.",
    questions: [
      { question: "Wann erfand Gutenberg den Buchdruck?", answer: "Um 1450" },
      { question: "Wer kopierte Bücher vorher?", answer: "Mönche" },
      { question: "Was gilt der Buchdruck als?", answer: "Wegbereiter der modernen Welt" },
    ],
  },
  {
    klasse: 4,
    title: "Erneuerbare Energien",
    text: "Erneuerbare Energien sind Energiequellen, die sich immer wieder erneuern. Dazu gehören Wind, Sonne, Wasser und Biomasse. Im Gegensatz zu Kohle oder Öl gehen sie nicht aus. Außerdem stoßen sie kaum Schadstoffe aus. Deshalb sind sie wichtig für den Klimaschutz.\n\nDeutschland hat viele Windräder und Solaranlagen gebaut. Immer mehr Strom kommt aus erneuerbaren Quellen. Ziel ist es, bis 2045 klimaneutral zu sein. Das bedeutet, dass Deutschland dann kaum noch schädliche Gase ausstößt. Das ist eine große Herausforderung, aber auch eine Chance.",
    questions: [
      { question: "Was sind erneuerbare Energien?", answer: "Energiequellen, die sich immer wieder erneuern" },
      { question: "Welches Ziel hat Deutschland bis 2045?", answer: "Klimaneutral zu sein" },
      { question: "Was bedeutet klimaneutral?", answer: "Kaum noch schädliche Gase ausstoßen" },
    ],
  },
  {
    klasse: 4,
    title: "Der Herzschlag",
    text: "Das Herz ist der Motor des menschlichen Körpers. Es pumpt Blut durch alle Adern. In einer Minute schlägt das Herz etwa 60 bis 100 Mal. Pro Tag sind das ungefähr 100.000 Herzschläge. Das Blut transportiert Sauerstoff und Nährstoffe in alle Körperzellen.\n\nSport stärkt das Herz. Ein trainiertes Herz pumpt effizienter und schlägt in Ruhe langsamer. Herzgesunde Ernährung mit viel Gemüse und wenig Fett hilft ebenfalls. Rauchen und Stress schaden dem Herz sehr. Deshalb ist ein gesunder Lebensstil so wichtig.",
    questions: [
      { question: "Wie oft schlägt das Herz pro Minute?", answer: "60 bis 100 Mal" },
      { question: "Was transportiert das Blut?", answer: "Sauerstoff und Nährstoffe" },
      { question: "Was schadet dem Herz?", answer: "Rauchen und Stress" },
    ],
  },
  {
    klasse: 4,
    title: "Die Wanderung der Zugvögel",
    text: "Jedes Jahr im Herbst fliegen Millionen von Vögeln in wärmere Gebiete. Man nennt sie Zugvögel. Der Weißstorch etwa fliegt von Deutschland bis nach Afrika. Das sind über 10.000 Kilometer. Dabei orientieren sich Vögel an der Sonne, den Sternen und dem Erdmagnetfeld.\n\nIm Frühling kehren die Zugvögel zurück. Oft finden sie denselben Nistplatz wieder. Wissenschaftler befestigen manchmal kleine Sender an Vögeln. So können sie deren Route verfolgen. Klimaveränderungen beeinflussen das Zugverhalten vieler Vogelarten.",
    questions: [
      { question: "Wohin fliegen Zugvögel im Herbst?", answer: "In wärmere Gebiete" },
      { question: "Wie weit fliegt der Weißstorch?", answer: "Über 10.000 Kilometer" },
      { question: "Woran orientieren sich Vögel beim Flug?", answer: "An der Sonne, den Sternen und dem Erdmagnetfeld" },
    ],
  },
  {
    klasse: 4,
    title: "Die Mondlandung",
    text: "Am 20. Juli 1969 landeten die ersten Menschen auf dem Mond. Die NASA-Mission hieß Apollo 11. Neil Armstrong war der erste Mensch, der den Mond betrat. Er sagte den berühmten Satz: Das ist ein kleiner Schritt für einen Menschen, aber ein großer Sprung für die Menschheit.\n\nDie Astronauten blieben mehrere Stunden auf dem Mond. Sie sammelten Gesteinsproben und stellten Experimente auf. Millionen von Menschen auf der Erde verfolgten die Landung im Fernsehen. Es war einer der aufregendsten Momente in der Geschichte der Menschheit.",
    questions: [
      { question: "Wann landeten Menschen erstmals auf dem Mond?", answer: "Am 20. Juli 1969" },
      { question: "Wie hieß die Mission?", answer: "Apollo 11" },
      { question: "Wer war der erste Mensch auf dem Mond?", answer: "Neil Armstrong" },
    ],
  },
  {
    klasse: 4,
    title: "Plastik im Meer",
    text: "Jedes Jahr landen Millionen Tonnen Plastikmüll im Meer. Das Plastik zerfällt zu kleinen Teilchen, dem sogenannten Mikroplastik. Fische und Meerestiere fressen diese Teilchen. Das schadet ihrer Gesundheit erheblich. Auch Menschen nehmen Mikroplastik über Fisch und Trinkwasser auf.\n\nOrganisationen und Regierungen weltweit arbeiten an Lösungen. Manche Länder haben Einwegplastik verboten. Schüler sammeln Müll an Stränden. Erfinder entwickeln Maschinen, die Plastik aus dem Meer filtert. Jeder Einzelne kann durch bewusstes Einkaufen helfen.",
    questions: [
      { question: "Wozu zerfällt Plastik im Meer?", answer: "Zu Mikroplastik" },
      { question: "Wer frisst Mikroplastik?", answer: "Fische und Meerestiere" },
      { question: "Was haben manche Länder verboten?", answer: "Einwegplastik" },
    ],
  },
  {
    klasse: 4,
    title: "Die Wikinger",
    text: "Die Wikinger lebten vor etwa 1000 Jahren in Skandinavien. Sie waren bekannte Seefahrer und Entdecker. Mit ihren Langschiffen erkundeten sie weite Teile Europas. Sie erreichten sogar Nordamerika lange vor Kolumbus. Leif Eriksson gilt als erster Europäer, der Amerika besucht hat.\n\nViele Menschen fürchteten die Wikinger, weil sie Küsten überfielen. Aber sie waren auch Händler, Bauern und Handwerker. Wikinger hinterließen tiefe Spuren in der europäischen Geschichte und Kultur. Viele Ortsnamen in England und Frankreich stammen noch aus der Wikingerzeit.",
    questions: [
      { question: "Wo lebten die Wikinger?", answer: "In Skandinavien" },
      { question: "Wer gilt als erster Europäer in Amerika?", answer: "Leif Eriksson" },
      { question: "Was waren die Wikinger außer Kriegern noch?", answer: "Händler, Bauern und Handwerker" },
    ],
  },
  {
    klasse: 4,
    title: "Das Schwarze Loch",
    text: "Schwarze Löcher sind Bereiche im Weltall, aus denen nicht einmal Licht entkommen kann. Sie entstehen, wenn sehr große Sterne am Ende ihres Lebens zusammenbrechen. Die Schwerkraft ist dort unvorstellbar stark. Alles, was zu nah kommt, wird hineingezogen.\n\nAstronomen können schwarze Löcher nicht direkt sehen. Sie erkennen sie an ihrer Wirkung auf andere Sterne. Im Jahr 2019 wurde das erste Foto eines schwarzen Lochs gemacht. Es war ein Meilenstein der Astronomie. Schwarze Löcher sind noch immer eines der größten Rätsel des Universums.",
    questions: [
      { question: "Was ist ein schwarzes Loch?", answer: "Ein Bereich, aus dem nicht einmal Licht entkommen kann" },
      { question: "Wie entstehen schwarze Löcher?", answer: "Wenn sehr große Sterne zusammenbrechen" },
      { question: "Wann wurde das erste Foto eines schwarzen Lochs gemacht?", answer: "Im Jahr 2019" },
    ],
  },
  {
    klasse: 4,
    title: "Die Seidenstraße",
    text: "Die Seidenstraße war kein einzelner Weg, sondern ein Netz von Handelsrouten. Sie verband China mit Europa und dem Mittleren Osten. Händler transportierten Seide, Gewürze, Gold und andere Waren. Die Route war über 7000 Kilometer lang. Der Handel florierte über Jahrhunderte.\n\nAuf der Seidenstraße wurden nicht nur Waren ausgetauscht. Auch Ideen, Religionen und Technologien reisten mit. So verbreiteten sich zum Beispiel Papier und Porzellan von China nach Europa. Die Seidenstraße war eine der wichtigsten kulturellen Verbindungen der Weltgeschichte.",
    questions: [
      { question: "Was war die Seidenstraße?", answer: "Ein Netz von Handelsrouten" },
      { question: "Wie lang war die Route?", answer: "Über 7000 Kilometer" },
      { question: "Was wurde außer Waren noch ausgetauscht?", answer: "Ideen, Religionen und Technologien" },
    ],
  },
  {
    klasse: 4,
    title: "Demokratie",
    text: "Demokratie bedeutet, dass die Bürger eines Landes mitbestimmen dürfen. In Deutschland wählen Erwachsene alle vier Jahre den Bundestag. Das Parlament macht Gesetze. Die Bundesregierung führt das Land. Grundrechte wie Meinungsfreiheit und Redefreiheit gelten für alle.\n\nDemokratie ist nicht selbstverständlich. In vielen Ländern können Menschen nicht frei wählen. Die erste Demokratie der Welt entstand im antiken Griechenland. In Deutschland besteht die Demokratie seit 1949. Kinder und Jugendliche können in Schülerräten Mitbestimmung üben.",
    questions: [
      { question: "Was bedeutet Demokratie?", answer: "Dass Bürger mitbestimmen dürfen" },
      { question: "Was macht der Bundestag?", answer: "Gesetze" },
      { question: "Wo entstand die erste Demokratie?", answer: "Im antiken Griechenland" },
    ],
  },
  {
    klasse: 4,
    title: "Die Ozeane der Erde",
    text: "Etwa 71 Prozent der Erdoberfläche sind mit Wasser bedeckt. Die fünf Ozeane heißen: Pazifik, Atlantik, Indik, Arktis und Antarktis. Der Pazifik ist der größte und tiefste Ozean. An seiner tiefsten Stelle, dem Marianengraben, ist er fast 11.000 Meter tief.\n\nDie Ozeane regulieren das Klima der Erde. Sie absorbieren CO₂ und produzieren Sauerstoff. Doch durch Verschmutzung und Überfischung sind sie bedroht. Die Meerestemperatur steigt durch den Klimawandel. Das gefährdet viele Meerestiere und Korallenriffe.",
    questions: [
      { question: "Wie viel Prozent der Erdoberfläche sind mit Wasser bedeckt?", answer: "Etwa 71 Prozent" },
      { question: "Welcher Ozean ist der größte?", answer: "Der Pazifik" },
      { question: "Welche Funktion haben Ozeane für das Klima?", answer: "Sie regulieren das Klima und absorbieren CO₂" },
    ],
  },
  {
    klasse: 4,
    title: "Die Zukunft der Medizin",
    text: "Die Medizin macht enorme Fortschritte. Forscher entwickeln Medikamente gegen Krankheiten, die bisher unheilbar waren. Roboter helfen Ärzten bei komplizierten Operationen. Künstliche Intelligenz kann Krankheiten frühzeitig erkennen. 3D-Drucker erzeugen sogar künstliche Körperteile.\n\nIn Zukunft könnten Nanobots im Blut patrouillieren und Krankheiten bekämpfen. Personalisierte Medizin wird auf jeden Patienten individuell abgestimmt. Gentechnik ermöglicht es, Erbkrankheiten zu heilen. Diese Entwicklungen werfen aber auch ethische Fragen auf. Was darf die Medizin verändern?",
    questions: [
      { question: "Wobei helfen Roboter in der Medizin?", answer: "Bei komplizierten Operationen" },
      { question: "Was können 3D-Drucker erzeugen?", answer: "Künstliche Körperteile" },
      { question: "Was ist personalisierte Medizin?", answer: "Medizin, die auf jeden Patienten individuell abgestimmt ist" },
    ],
  },
];

export function getRandomReadingTexts(n: number, klasse?: Klasse): ReadingTextStatic[] {
  const filtered = klasse
    ? readingTextsPool.filter((t) => t.klasse === klasse)
    : readingTextsPool;
  return shuffleArray(filtered).slice(0, n);
}

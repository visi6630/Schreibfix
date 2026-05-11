import type { DiktatLesson } from "../types/index.js";

// Five Klasse-2-level sentences (simple vocabulary, common spelling patterns)
export const sampleDiktatLesson: DiktatLesson = {
  id: "diktat-klasse2-tiere",
  title: "Tiere im Wald",
  klasse: 2,
  theme: "Tiere im Wald",
  xpReward: 30,
  sentences: [
    {
      id: "s1",
      text: "Der Fuchs läuft durch den Wald.",
      hint: "Denk an das lange 'u' in läuft.",
    },
    {
      id: "s2",
      text: "Die Eule sitzt auf dem Ast.",
      hint: "'Eule' schreibt man mit eu.",
    },
    {
      id: "s3",
      text: "Das Reh frisst das grüne Gras.",
      hint: "'frisst' hat zwei s am Ende.",
    },
    {
      id: "s4",
      text: "Der Hase springt über den Stein.",
      hint: "'springt' beginnt mit spr.",
    },
    {
      id: "s5",
      text: "Die Schmetterlinge fliegen im Sommer.",
      hint: "'Schmetterling' hat tt in der Mitte.",
    },
  ],
};

export const diktatLessons: DiktatLesson[] = [sampleDiktatLesson];

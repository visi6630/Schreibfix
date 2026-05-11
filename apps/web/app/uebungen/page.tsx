import { ProtectedPage } from "@/components/ProtectedPage";

const sections = [
  {
    title: "Rechtschreibung",
    icon: "✏️",
    items: ["Lückentext", "Richtig oder falsch?", "Wörter sortieren"],
  },
  {
    title: "Grammatik",
    icon: "📖",
    items: ["Verben konjugieren", "Der / Die / Das?", "Einzahl & Mehrzahl", "Satzglieder"],
  },
] as const;

export default function UebungenPage() {
  return (
    <ProtectedPage>
    <div className="mx-auto max-w-lg px-4 py-8">
      <h2 className="text-2xl font-black text-fox mb-6">Übungen</h2>

      {sections.map(({ title, icon, items }) => (
        <div key={title} className="card mb-5">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            <span role="img" aria-hidden="true">{icon}</span>
            {title}
          </h3>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item}>
                <button
                  className="w-full text-left rounded-2xl border-2 border-gray-100 px-4 py-3
                             text-lg font-bold hover:border-fox hover:text-fox transition-colors
                             flex items-center justify-between"
                  disabled
                  aria-label={`${item} – demnächst verfügbar`}
                >
                  {item}
                  <span className="text-xs font-normal text-gray-400 ml-2">Bald!</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="text-center text-sm text-gray-400 mt-4">
        🦊 Schreibfix arbeitet noch an diesen Übungen!
      </p>
    </div>
    </ProtectedPage>
  );
}

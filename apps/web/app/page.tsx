import Link from "next/link";

const cards = [
  {
    href: "/diktat",
    icon: "🎙️",
    title: "Diktat",
    desc: "Hör zu und schreib nach!",
    color: "bg-fox-light border-fox",
  },
  {
    href: "/uebungen",
    icon: "✏️",
    title: "Übungen",
    desc: "Rechtschreibung & Grammatik",
    color: "bg-forest-light border-forest",
  },
  {
    href: "/fortschritt",
    icon: "⭐",
    title: "Fortschritt",
    desc: "Deine Punkte & Sterne",
    color: "bg-amber-100 border-amber-400",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <div className="text-7xl mb-3" role="img" aria-label="Schreibfix">
          🦊
        </div>
        <h2 className="text-3xl font-black text-fox">Hallo! Ich bin der Schreibfix.</h2>
        <p className="mt-2 text-lg text-gray-600">Was möchtest du heute lernen?</p>
      </div>

      <div className="flex flex-col gap-4">
        {cards.map(({ href, icon, title, desc, color }) => (
          <Link
            key={href}
            href={href}
            className={`card flex items-center gap-5 border-2 transition-transform active:scale-95 hover:-translate-y-0.5 ${color}`}
          >
            <span className="text-5xl" role="img" aria-hidden="true">
              {icon}
            </span>
            <div>
              <p className="text-xl font-black">{title}</p>
              <p className="text-base text-gray-600">{desc}</p>
            </div>
            <span className="ml-auto text-2xl text-gray-300">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Placeholder — will be driven by Supabase UserProgress in a later milestone

const badges = [
  { icon: "🎙️", label: "Erstes Diktat", earned: true },
  { icon: "⭐", label: "3 Sterne",       earned: false },
  { icon: "🔥", label: "7 Tage dabei",  earned: false },
  { icon: "🏆", label: "Perfekt!",      earned: false },
];

export default function FortschrittPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h2 className="text-2xl font-black text-fox mb-6">Mein Fortschritt</h2>

      {/* XP bar */}
      <div className="card mb-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-5xl">🦊</div>
          <div>
            <p className="text-sm text-gray-400 font-bold">Level 1 · Junger Fuchs</p>
            <p className="text-2xl font-black text-fox">0 XP</p>
          </div>
        </div>
        <div className="h-4 rounded-full bg-fox-light overflow-hidden">
          <div className="h-full rounded-full bg-fox w-0 transition-all duration-700" />
        </div>
        <p className="text-xs text-gray-400 mt-1">0 / 100 XP bis Level 2</p>
      </div>

      {/* Streak */}
      <div className="card mb-5 flex items-center gap-4">
        <span className="text-4xl">🔥</span>
        <div>
          <p className="font-black text-xl">0 Tage</p>
          <p className="text-gray-500 text-sm">Deine aktuelle Streak</p>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h3 className="text-lg font-black mb-4">Abzeichen</h3>
        <div className="grid grid-cols-4 gap-4">
          {badges.map(({ icon, label, earned }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className={[
                  "text-4xl rounded-2xl p-2",
                  earned ? "bg-fox-light" : "grayscale opacity-30 bg-gray-100",
                ].join(" ")}
                role="img"
                aria-label={label}
              >
                {icon}
              </span>
              <span className="text-xs text-center text-gray-500 leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

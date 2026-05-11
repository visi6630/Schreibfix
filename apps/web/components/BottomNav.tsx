"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/diktat",      label: "Diktat",      icon: "🎙️" },
  { href: "/uebungen",    label: "Übungen",     icon: "✏️" },
  { href: "/lesen",       label: "Lesen",       icon: "📖" },
  { href: "/fortschritt", label: "Fortschritt", icon: "⭐" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/auth") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t-2 border-fox-light bg-white shadow-lg"
      aria-label="Hauptnavigation"
    >
      {navItems.map(({ href, label, icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex flex-1 flex-col items-center gap-1 py-3 text-sm font-bold transition-colors",
              active
                ? "text-fox border-t-4 border-fox -mt-px"
                : "text-gray-400 hover:text-fox",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <span className="text-2xl leading-none" role="img" aria-hidden="true">
              {icon}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Schreibfix – Deutsch lernen macht Spaß",
  description:
    "Die Lern-App für Grundschulkinder: Diktat, Rechtschreibung und Grammatik mit Schreibfix.",
};

export const viewport: Viewport = {
  themeColor: "#F97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-fox px-4 py-3 shadow-md">
          <span className="text-3xl" role="img" aria-label="Fuchs">
            🦊
          </span>
          <h1 className="text-xl font-black text-white tracking-wide">Schreibfix</h1>
        </header>

        <main className="flex-1 pb-24">{children}</main>

        <BottomNav />
      </body>
    </html>
  );
}

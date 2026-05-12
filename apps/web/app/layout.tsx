import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthProvider";
import { SubscriptionProvider } from "@/components/SubscriptionProvider";
import { Header } from "@/components/Header";

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
        <AuthProvider>
          <SubscriptionProvider>
            <Header />
            <main className="flex-1 pb-24">{children}</main>
            <BottomNav />
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

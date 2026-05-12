"use client";

import { useRouter } from "next/navigation";

export default function SubscriptionCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-7xl mb-4">😕</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Bezahlung abgebrochen</h1>
        <p className="text-gray-500 mb-6">Kein Problem — du kannst jederzeit upgraden!</p>
        <button
          onClick={() => router.replace("/subscription")}
          className="btn-primary w-full mb-3"
        >
          Pläne ansehen
        </button>
        <button
          onClick={() => router.replace("/")}
          className="btn-secondary w-full"
        >
          Zurück zur Startseite
        </button>
      </div>
    </div>
  );
}

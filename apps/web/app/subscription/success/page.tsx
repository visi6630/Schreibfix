"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/components/SubscriptionProvider";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { refresh } = useSubscription();

  useEffect(() => {
    refresh();
    const t = setTimeout(() => router.replace("/"), 4000);
    return () => clearTimeout(t);
  }, [refresh, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Willkommen bei Schreibfix Pro!</h1>
        <p className="text-gray-500 mb-6">Dein Abo ist aktiv. Du wirst gleich weitergeleitet…</p>
        <div className="w-8 h-8 border-4 border-fox border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

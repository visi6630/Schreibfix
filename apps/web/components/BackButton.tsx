"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  href?: string;
}

export function BackButton({ label = "← Zurück", href }: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className="inline-block text-sm font-bold text-fox hover:underline">
        {label}
      </Link>
    );
  }

  return (
    <button onClick={() => router.back()} className="text-sm font-bold text-fox hover:underline">
      {label}
    </button>
  );
}

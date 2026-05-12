"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const XP_THRESHOLD = 50;

type GameScore = { ttt: { wins: number; losses: number; draws: number } | null; hangmann: number };

export function SpieleClient() {
  const { user } = useAuth();
  const router = useRouter();
  const [xp, setXp] = useState(0);
  const [lastGameXp, setLastGameXp] = useState(0);
  const [scores, setScores] = useState<GameScore>({ ttt: null, hangmann: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Load localStorage scores
    const tttRaw = localStorage.getItem(`schreibfix_ttt_score_${user.id}`);
    const hangmannWins = parseInt(localStorage.getItem(`schreibfix_hangmann_wins_${user.id}`) ?? "0", 10);
    const savedLastXp = parseInt(localStorage.getItem(`schreibfix_last_game_xp_${user.id}`) ?? "0", 10);
    setLastGameXp(savedLastXp);
    setScores({
      ttt: tttRaw ? (JSON.parse(tttRaw) as GameScore["ttt"]) : null,
      hangmann: hangmannWins,
    });

    void supabase.from("profiles").select("xp").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        const currentXp = data?.xp ?? 0;
        setXp(currentXp);
        setLoading(false);
      });
  }, [user]);

  const xpSinceLastGame = xp - lastGameXp;
  const unlocked = xpSinceLastGame >= XP_THRESHOLD;
  const progress = Math.min(xpSinceLastGame, XP_THRESHOLD);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400 text-sm">Lädt…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">🎮</div>
        <h1 className="text-2xl font-black text-fox">Spielzeit!</h1>
        <p className="text-gray-500 text-sm mt-1">
          Lerne fleißig — dann darfst du spielen!
        </p>
      </div>

      {/* XP unlock status */}
      {!unlocked ? (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-black text-gray-600">Noch {XP_THRESHOLD - progress} XP bis zum Spielen</p>
            <p className="text-sm font-bold text-fox">{progress} / {XP_THRESHOLD} XP</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fox to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(progress / XP_THRESHOLD) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Übe Diktat, Grammatik oder Lesen um XP zu sammeln!
          </p>
        </div>
      ) : (
        <div className="card mb-6 bg-green-50 border-green-200 border-2 text-center py-3">
          <p className="text-base font-black text-green-700">🎉 Du hast dir Spielzeit verdient!</p>
          <p className="text-xs text-green-600 mt-0.5">Wähle ein Spiel und viel Spaß!</p>
        </div>
      )}

      {/* Game cards */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Tic Tac Toe */}
        <div className={`card ${!unlocked ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎯</div>
            <div className="flex-1">
              <p className="font-black text-gray-800">Tic Tac Toe</p>
              <p className="text-sm text-gray-500">🦊 vs ⭐ — Schlage den Computer!</p>
              {scores.ttt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {scores.ttt.wins}S · {scores.ttt.draws}U · {scores.ttt.losses}N
                </p>
              )}
            </div>
            {unlocked ? (
              <Link
                href="/spiele/tictactoe"
                className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
              >
                Spielen!
              </Link>
            ) : (
              <div className="text-gray-300 text-2xl">🔒</div>
            )}
          </div>
        </div>

        {/* Hangmann */}
        <div className={`card ${!unlocked ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl">🦊</div>
            <div className="flex-1">
              <p className="font-black text-gray-800">Hangmann</p>
              <p className="text-sm text-gray-500">Errate das Synonym!</p>
              {scores.hangmann > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {scores.hangmann} Sieg{scores.hangmann !== 1 ? "e" : ""}
                </p>
              )}
            </div>
            {unlocked ? (
              <Link
                href="/spiele/hangmann"
                className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
              >
                Spielen!
              </Link>
            ) : (
              <div className="text-gray-300 text-2xl">🔒</div>
            )}
          </div>
        </div>
      </div>

      {/* Back button */}
      <button
        className="btn-secondary w-full"
        onClick={() => router.push("/")}
      >
        📚 Zurück zum Lernen
      </button>
    </div>
  );
}

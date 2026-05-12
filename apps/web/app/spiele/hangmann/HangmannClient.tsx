"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { vocabularyExercises } from "@schreibfix/core";
import { playCorrect, playWrong, playComplete } from "@/lib/sounds";
import type { Klasse } from "@schreibfix/core";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_WRONG = 6;

const DE_ALPHABET = [
  "a","b","c","d","e","f","g","h","i","j","k","l","m",
  "n","o","p","q","r","s","t","u","v","w","x","y","z",
  "ä","ö","ü","ß",
];

// ─── Fox SVG ──────────────────────────────────────────────────────────────────

function FoxHangman({ wrong, sad }: { wrong: number; sad: boolean }) {
  return (
    <svg viewBox="0 0 200 220" className="w-48 h-48 mx-auto" aria-hidden>
      {/* Gallows */}
      <line x1="20" y1="210" x2="180" y2="210" stroke="#a0855b" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="210" x2="60" y2="20" stroke="#a0855b" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="20" x2="130" y2="20" stroke="#a0855b" strokeWidth="4" strokeLinecap="round" />
      <line x1="130" y1="20" x2="130" y2="40" stroke="#a0855b" strokeWidth="4" strokeLinecap="round" />

      {/* Head */}
      {wrong >= 1 && (
        <g>
          <ellipse cx="130" cy="60" rx="20" ry="18" fill="#F97316" />
          {/* Ears */}
          <polygon points="113,48 106,28 120,42" fill="#F97316" />
          <polygon points="147,48 154,28 140,42" fill="#F97316" />
          <polygon points="113,48 108,32 118,44" fill="#fbbf80" />
          <polygon points="147,48 152,32 142,44" fill="#fbbf80" />
          {/* Snout */}
          <ellipse cx="130" cy="68" rx="10" ry="7" fill="#fbbf80" />
          <ellipse cx="130" cy="65" rx="4" ry="3" fill="#1a1a1a" />
        </g>
      )}

      {/* Eyes */}
      {wrong >= 1 && !sad && (
        <g>
          <circle cx="124" cy="57" r="3" fill="#1a1a1a" />
          <circle cx="136" cy="57" r="3" fill="#1a1a1a" />
          <circle cx="125" cy="56" r="1" fill="white" />
          <circle cx="137" cy="56" r="1" fill="white" />
        </g>
      )}

      {/* Sad eyes (X eyes on game over) */}
      {sad && wrong >= 1 && (
        <g>
          <line x1="121" y1="54" x2="127" y2="60" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
          <line x1="127" y1="54" x2="121" y2="60" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
          <line x1="133" y1="54" x2="139" y2="60" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
          <line x1="139" y1="54" x2="133" y2="60" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
          {/* Sad mouth */}
          <path d="M124 73 Q130 69 136 73" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Body */}
      {wrong >= 2 && (
        <ellipse cx="130" cy="110" rx="16" ry="22" fill="#F97316" />
      )}

      {/* Tail */}
      {wrong >= 3 && (
        <g>
          <path d="M146,115 Q175,105 172,130 Q168,150 148,140" stroke="#F97316" strokeWidth="8" fill="none" strokeLinecap="round" />
          <ellipse cx="165" cy="137" rx="9" ry="6" fill="white" transform="rotate(-20 165 137)" />
        </g>
      )}

      {/* Right arm */}
      {wrong >= 4 && (
        <line x1="130" y1="100" x2="110" y2="125" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
      )}

      {/* Left arm */}
      {wrong >= 5 && (
        <line x1="130" y1="100" x2="150" y2="125" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
      )}

      {/* Legs */}
      {wrong >= 6 && (
        <g>
          <line x1="122" y1="130" x2="112" y2="160" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
          <line x1="138" y1="130" x2="148" y2="160" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="absolute animate-bounce text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animationDelay: `${Math.random() * 1}s`,
            animationDuration: `${0.8 + Math.random() * 0.8}s`,
          }}
        >
          {["⭐", "🎉", "🦊", "✨", "🌟"][i % 5]}
        </div>
      ))}
    </div>
  );
}

// ─── Word display ─────────────────────────────────────────────────────────────

function WordDisplay({ word, guessed, reveal }: { word: string; guessed: Set<string>; reveal: boolean }) {
  return (
    <div className="flex gap-2 flex-wrap justify-center my-4">
      {word.split("").map((letter, i) => {
        const show = reveal || guessed.has(letter.toLowerCase());
        return (
          <div key={i} className="flex flex-col items-center">
            <span
              className={`text-2xl font-black min-w-[1.5rem] text-center transition-colors ${
                show ? (reveal && !guessed.has(letter.toLowerCase()) ? "text-red-500" : "text-fox") : "text-transparent"
              }`}
            >
              {show ? letter.toUpperCase() : letter.toUpperCase()}
            </span>
            <div className="w-7 h-0.5 bg-gray-400 mt-1" />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type GameState = "idle" | "playing" | "won" | "lost";

export function HangmannClient() {
  const { user } = useAuth();
  const router = useRouter();
  const [klasse, setKlasse] = useState<Klasse>(2);

  const [word, setWord] = useState("");
  const [prompt, setPrompt] = useState("");
  const [definition, setDefinition] = useState("");
  const [emoji, setEmoji] = useState("🦊");
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [wins, setWins] = useState(0);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`schreibfix_hangmann_wins_${user.id}`);
    if (saved) setWins(parseInt(saved, 10) || 0);
    void supabase.from("profiles").select("klasse").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.klasse) setKlasse(data.klasse as Klasse); });
  }, [user]);

  const pickWord = useCallback(() => {
    const pool = vocabularyExercises.filter((e) => e.klasse <= klasse);
    const exercise = pool[Math.floor(Math.random() * pool.length)]!;
    setWord(exercise.correctAnswer.toLowerCase());
    setPrompt(exercise.prompt);
    setDefinition(exercise.vocabData?.definition ?? "");
    setEmoji(exercise.vocabData?.emoji ?? "🦊");
  }, [klasse]);

  const startGame = useCallback(() => {
    pickWord();
    setGuessed(new Set());
    setWrongGuesses(0);
    setGameState("playing");
  }, [pickWord]);

  const handleLetter = (letter: string) => {
    if (gameState !== "playing" || guessed.has(letter)) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);

    if (word.includes(letter)) {
      playCorrect();
      const allRevealed = word.split("").every((l) => next.has(l));
      if (allRevealed) {
        setGameState("won");
        playComplete();
        const newWins = wins + 1;
        setWins(newWins);
        if (user) {
          localStorage.setItem(`schreibfix_hangmann_wins_${user.id}`, String(newWins));
          // Save XP checkpoint
          void supabase.from("profiles").select("xp").eq("id", user.id).maybeSingle()
            .then(({ data }) => {
              localStorage.setItem(`schreibfix_last_game_xp_${user.id}`, String(data?.xp ?? 0));
            });
          // Award +15 XP via progress table
          void supabase.from("progress").insert({
            user_id: user.id,
            lesson_id: "spiele-hangmann",
            score: 15,
            stars: 1,
          });
        }
      }
    } else {
      playWrong();
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= MAX_WRONG) {
        setGameState("lost");
        // Record XP checkpoint even on loss
        if (user) {
          void supabase.from("profiles").select("xp").eq("id", user.id).maybeSingle()
            .then(({ data }) => {
              localStorage.setItem(`schreibfix_last_game_xp_${user.id}`, String(data?.xp ?? 0));
            });
        }
      }
    }
  };

  const isWon = gameState === "won";
  const isLost = gameState === "lost";
  const isDone = isWon || isLost;

  return (
    <div className="mx-auto max-w-md px-4 py-6 text-center">
      {isWon && <Confetti />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.push("/spiele")} className="text-gray-400 hover:text-fox text-2xl">‹</button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-fox">Hangmann</h2>
          <p className="text-gray-500 text-sm">Errate das Synonym!</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-fox">{wins}</p>
          <p className="text-xs text-gray-400">Siege</p>
        </div>
      </div>

      {/* Idle */}
      {gameState === "idle" && (
        <div className="card mb-6 py-8">
          <div className="text-6xl mb-4">🦊</div>
          <p className="text-lg font-black text-gray-700 mb-1">Kannst du das Wort erraten?</p>
          <p className="text-sm text-gray-500">Du hast 6 Versuche.</p>
          <button className="btn-primary w-full mt-6" onClick={startGame}>🎮 Spiel starten!</button>
        </div>
      )}

      {/* Playing / Done */}
      {gameState !== "idle" && (
        <>
          {/* Fox drawing */}
          <div className="relative">
            <FoxHangman wrong={wrongGuesses} sad={isLost} />
            <div className="absolute top-2 right-2 flex gap-1">
              {Array.from({ length: MAX_WRONG }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i < wrongGuesses ? "bg-red-400" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>

          {/* Hint */}
          <div className="card mb-3 py-2 px-3">
            <p className="text-sm text-gray-500">
              <span className="font-black text-fox">{emoji} Hinweis:</span>{" "}
              Ein Synonym für <span className="font-black">„{prompt}"</span>
            </p>
            {definition && <p className="text-xs text-gray-400 mt-0.5">{definition}</p>}
          </div>

          {/* Word display */}
          <WordDisplay word={word} guessed={guessed} reveal={isDone} />

          {/* Wrong count */}
          {gameState === "playing" && (
            <p className="text-sm text-gray-500 mb-3">
              Falsche Buchstaben: <span className="font-bold text-red-500">{wrongGuesses}</span> / {MAX_WRONG}
            </p>
          )}

          {/* Outcome messages */}
          {isWon && (
            <div className="card mb-4 bg-green-50 border-green-300 border-2">
              <p className="text-xl font-black text-green-700">🎉 Toll! Du hast es erraten!</p>
              <p className="text-sm text-green-600 mt-1">+15 XP verdient!</p>
            </div>
          )}
          {isLost && (
            <div className="card mb-4 bg-red-50 border-red-200 border-2">
              <p className="text-xl font-black text-red-700">😢 Leider falsch!</p>
              <p className="text-sm text-gray-600 mt-1">
                Das gesuchte Wort war: <span className="font-black text-fox">{word.toUpperCase()}</span>
              </p>
            </div>
          )}

          {/* Keyboard */}
          {gameState === "playing" && (
            <div className="flex flex-wrap gap-1.5 justify-center mb-4">
              {DE_ALPHABET.map((letter) => {
                const isGuessed = guessed.has(letter);
                const isCorrect = isGuessed && word.includes(letter);
                const isWrong = isGuessed && !word.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => handleLetter(letter)}
                    disabled={isGuessed}
                    className={`w-9 h-9 rounded-xl font-black text-sm transition-all ${
                      isCorrect
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : isWrong
                        ? "bg-red-100 text-red-400 border-2 border-red-200 opacity-60"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-fox hover:bg-orange-50 active:scale-95"
                    }`}
                  >
                    {letter.toUpperCase()}
                  </button>
                );
              })}
            </div>
          )}

          {/* Done buttons */}
          {isDone && (
            <div className="flex flex-col gap-3 mt-4">
              <button className="btn-primary w-full" onClick={startGame}>🔄 Nochmal spielen</button>
              <button className="btn-secondary w-full" onClick={() => router.push("/spiele")}>
                ← Zurück zu den Spielen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

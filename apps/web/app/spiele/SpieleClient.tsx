"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { Klasse } from "@schreibfix/core";

// ─── Types ────────────────────────────────────────────────────────────────────

type Cell = "🦊" | "⭐" | null;
type GameState = "idle" | "playing" | "won" | "lost" | "draw";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WINNING_LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Cell[]): Cell | "draw" | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]!;
    }
  }
  if (board.every((cell) => cell !== null)) return "draw";
  return null;
}

function getWinningLine(board: Cell[]): number[] | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return null;
}

// Minimax for unbeatable AI
function minimax(board: Cell[], isMaximizing: boolean, depth: number): number {
  const result = checkWinner(board);
  if (result === "⭐") return 10 - depth;
  if (result === "🦊") return depth - 10;
  if (result === "draw") return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "⭐";
        best = Math.max(best, minimax(board, false, depth + 1));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "🦊";
        best = Math.min(best, minimax(board, true, depth + 1));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board: Cell[]): number {
  let bestVal = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = "⭐";
      const moveVal = minimax(board, false, 0);
      board[i] = null;
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function getRandomMove(board: Cell[]): number {
  const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)]!;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const items = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {items.map((i) => (
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function SpieleClient() {
  const { user } = useAuth();
  const router = useRouter();
  const [klasse, setKlasse] = useState<Klasse>(3);

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [gameState, setGameState] = useState<GameState>("idle");
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("klasse")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.klasse) setKlasse(data.klasse as Klasse);
      });
  }, [user]);

  // Hard mode for K3-K4, easy for K1-K2
  const isHardMode = klasse >= 3;

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setGameState("playing");
    setIsComputerTurn(false);
    setWinLine(null);
  };

  // Computer move effect
  useEffect(() => {
    if (gameState !== "playing" || !isComputerTurn) return;

    const timer = setTimeout(() => {
      const newBoard = [...board];
      const move = isHardMode ? getBestMove(newBoard) : getRandomMove(newBoard);
      if (move === -1) return;

      newBoard[move] = "⭐";
      setBoard(newBoard);

      const result = checkWinner(newBoard);
      if (result === "⭐") {
        setWinLine(getWinningLine(newBoard));
        setGameState("lost");
        setScore((s) => ({ ...s, losses: s.losses + 1 }));
      } else if (result === "draw") {
        setGameState("draw");
        setScore((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        setIsComputerTurn(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isComputerTurn, board, gameState, isHardMode]);

  const handleCellClick = (idx: number) => {
    if (gameState !== "playing" || board[idx] !== null || isComputerTurn) return;

    const newBoard = [...board];
    newBoard[idx] = "🦊";
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result === "🦊") {
      setWinLine(getWinningLine(newBoard));
      setGameState("won");
      setScore((s) => ({ ...s, wins: s.wins + 1 }));
      // Record game played in localStorage
      if (typeof window !== "undefined") {
        const currentXpKey = `schreibfix_last_game_xp_${user?.id ?? "guest"}`;
        void supabase
          .from("profiles")
          .select("xp")
          .eq("id", user!.id)
          .maybeSingle()
          .then(({ data }) => {
            localStorage.setItem(currentXpKey, String(data?.xp ?? 0));
          });
      }
    } else if (result === "draw") {
      setGameState("draw");
      setScore((s) => ({ ...s, draws: s.draws + 1 }));
    } else {
      setIsComputerTurn(true);
    }
  };

  // Record XP checkpoint when any game ends
  useEffect(() => {
    if (gameState === "won" || gameState === "lost" || gameState === "draw") {
      if (user && typeof window !== "undefined") {
        const key = `schreibfix_last_game_xp_${user.id}`;
        void supabase
          .from("profiles")
          .select("xp")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            localStorage.setItem(key, String(data?.xp ?? 0));
          });
      }
    }
  }, [gameState, user]);

  const getCellStyle = (idx: number) => {
    const isWin = winLine?.includes(idx);
    const base = "flex items-center justify-center text-5xl rounded-2xl border-4 h-24 w-24 transition-all duration-200 select-none";
    if (isWin) return `${base} border-fox bg-fox-light scale-110`;
    if (board[idx] !== null) return `${base} border-gray-200 bg-white`;
    if (gameState === "playing" && !isComputerTurn)
      return `${base} border-gray-200 bg-white hover:border-fox hover:bg-fox-light cursor-pointer active:scale-95`;
    return `${base} border-gray-200 bg-gray-50 cursor-default`;
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 text-center">
      {gameState === "won" && <Confetti />}

      <div className="mb-6">
        <div className="text-5xl mb-2">🎮</div>
        <h2 className="text-2xl font-black text-fox">Tic Tac Toe</h2>
        <p className="text-gray-500 text-sm mt-1">
          Du spielst als 🦊 · Computer spielt als ⭐
          {" · "}
          <span className="font-bold">{isHardMode ? "Schwer" : "Leicht"}</span>
        </p>
      </div>

      {/* Score */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="bg-forest-light rounded-xl px-4 py-2 text-center">
          <p className="text-xl font-black text-forest-dark">{score.wins}</p>
          <p className="text-xs text-gray-500">Siege 🦊</p>
        </div>
        <div className="bg-gray-100 rounded-xl px-4 py-2 text-center">
          <p className="text-xl font-black text-gray-600">{score.draws}</p>
          <p className="text-xs text-gray-500">Unentschieden</p>
        </div>
        <div className="bg-red-50 rounded-xl px-4 py-2 text-center">
          <p className="text-xl font-black text-red-500">{score.losses}</p>
          <p className="text-xs text-gray-500">Niederlagen</p>
        </div>
      </div>

      {/* Game status */}
      {gameState === "idle" && (
        <div className="card mb-6">
          <p className="text-lg font-bold text-gray-700">
            Bereit zum Spielen?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Du fängst an! Klicke auf ein Feld.
          </p>
        </div>
      )}

      {gameState === "playing" && (
        <div className="card mb-6 flex items-center gap-3">
          <span className="text-4xl">{isComputerTurn ? "⭐" : "🦊"}</span>
          <p className="font-bold text-gray-700">
            {isComputerTurn ? "Der Computer denkt nach…" : "Du bist dran!"}
          </p>
        </div>
      )}

      {gameState === "won" && (
        <div className="card mb-6 bg-forest-light border-forest border-2">
          <p className="text-2xl font-black text-forest-dark">🎉 Du hast gewonnen!</p>
          <p className="text-sm text-forest-dark mt-1">Fantastisch! Spiel nochmal!</p>
        </div>
      )}

      {gameState === "lost" && (
        <div className="card mb-6 bg-amber-50 border-amber-300 border-2">
          <p className="text-2xl font-black text-amber-800">😅 Der Computer hat gewonnen!</p>
          <p className="text-sm text-amber-700 mt-1">Probiere es nochmal!</p>
        </div>
      )}

      {gameState === "draw" && (
        <div className="card mb-6 bg-blue-50 border-blue-200 border-2">
          <p className="text-2xl font-black text-blue-700">🤝 Unentschieden!</p>
          <p className="text-sm text-blue-600 mt-1">Gut gespielt!</p>
        </div>
      )}

      {/* Board */}
      <div className="inline-grid grid-cols-3 gap-3 mb-6">
        {board.map((cell, idx) => (
          <button
            key={idx}
            className={getCellStyle(idx)}
            onClick={() => handleCellClick(idx)}
            disabled={gameState !== "playing" || isComputerTurn || board[idx] !== null}
            aria-label={`Feld ${idx + 1}`}
          >
            {cell ?? ""}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {gameState === "idle" ? (
          <button className="btn-primary w-full text-lg" onClick={startGame}>
            🎮 Spiel starten!
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={startGame}>
            🔄 Nochmal spielen
          </button>
        )}
        <button
          className="btn-secondary w-full"
          onClick={() => router.push("/")}
        >
          📚 Zurück zum Lernen
        </button>
      </div>
    </div>
  );
}

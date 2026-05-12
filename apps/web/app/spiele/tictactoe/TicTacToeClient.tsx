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
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]!;
  }
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

function getWinningLine(board: Cell[]): number[] | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return [a, b, c];
  }
  return null;
}

function minimax(board: Cell[], isMaximizing: boolean, depth: number): number {
  const result = checkWinner(board);
  if (result === "⭐") return 10 - depth;
  if (result === "🦊") return depth - 10;
  if (result === "draw") return 0;
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) { board[i] = "⭐"; best = Math.max(best, minimax(board, false, depth + 1)); board[i] = null; }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) { board[i] = "🦊"; best = Math.min(best, minimax(board, true, depth + 1)); board[i] = null; }
    }
    return best;
  }
}

function getBestMove(board: Cell[]): number {
  let bestVal = -Infinity, bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "⭐";
      const v = minimax(board, false, 0);
      board[i] = null;
      if (v > bestVal) { bestVal = v; bestMove = i; }
    }
  }
  return bestMove;
}

function getRandomMove(board: Cell[]): number {
  const empty = board.map((c, i) => (!c ? i : -1)).filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)]!;
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function TicTacToeClient() {
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
    // Load persisted score from localStorage
    const saved = localStorage.getItem(`schreibfix_ttt_score_${user.id}`);
    if (saved) {
      try { setScore(JSON.parse(saved) as typeof score); } catch { /* ignore */ }
    }
    void supabase.from("profiles").select("klasse").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.klasse) setKlasse(data.klasse as Klasse); });
  }, [user]);

  const persistScore = (s: typeof score) => {
    if (user) localStorage.setItem(`schreibfix_ttt_score_${user.id}`, JSON.stringify(s));
  };

  const isHardMode = klasse >= 3;

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setGameState("playing");
    setIsComputerTurn(false);
    setWinLine(null);
  };

  useEffect(() => {
    if (gameState !== "playing" || !isComputerTurn) return;
    const timer = setTimeout(() => {
      const nb = [...board] as Cell[];
      const move = isHardMode ? getBestMove(nb) : getRandomMove(nb);
      if (move === -1) return;
      nb[move] = "⭐";
      setBoard(nb);
      const result = checkWinner(nb);
      if (result === "⭐") {
        setWinLine(getWinningLine(nb));
        setGameState("lost");
        setScore((s) => { const n = { ...s, losses: s.losses + 1 }; persistScore(n); return n; });
      } else if (result === "draw") {
        setGameState("draw");
        setScore((s) => { const n = { ...s, draws: s.draws + 1 }; persistScore(n); return n; });
      } else {
        setIsComputerTurn(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComputerTurn, board, gameState, isHardMode]);

  // Record XP checkpoint on game end
  useEffect(() => {
    if ((gameState === "won" || gameState === "lost" || gameState === "draw") && user) {
      void supabase.from("profiles").select("xp").eq("id", user.id).maybeSingle()
        .then(({ data }) => {
          localStorage.setItem(`schreibfix_last_game_xp_${user.id}`, String(data?.xp ?? 0));
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleCellClick = (idx: number) => {
    if (gameState !== "playing" || board[idx] !== null || isComputerTurn) return;
    const nb = [...board] as Cell[];
    nb[idx] = "🦊";
    setBoard(nb);
    const result = checkWinner(nb);
    if (result === "🦊") {
      setWinLine(getWinningLine(nb));
      setGameState("won");
      setScore((s) => { const n = { ...s, wins: s.wins + 1 }; persistScore(n); return n; });
    } else if (result === "draw") {
      setGameState("draw");
      setScore((s) => { const n = { ...s, draws: s.draws + 1 }; persistScore(n); return n; });
    } else {
      setIsComputerTurn(true);
    }
  };

  const getCellStyle = (idx: number) => {
    const isWin = winLine?.includes(idx);
    const base = "flex items-center justify-center text-5xl rounded-2xl border-4 h-24 w-24 transition-all duration-200 select-none";
    if (isWin) return `${base} border-fox bg-fox-light scale-110`;
    if (board[idx]) return `${base} border-gray-200 bg-white`;
    if (gameState === "playing" && !isComputerTurn)
      return `${base} border-gray-200 bg-white hover:border-fox hover:bg-fox-light cursor-pointer active:scale-95`;
    return `${base} border-gray-200 bg-gray-50 cursor-default`;
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 text-center">
      {gameState === "won" && <Confetti />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/spiele")} className="text-gray-400 hover:text-fox text-2xl">‹</button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-fox">Tic Tac Toe</h2>
          <p className="text-gray-500 text-sm">🦊 vs ⭐ · {isHardMode ? "Schwer" : "Leicht"}</p>
        </div>
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

      {/* Status */}
      {gameState === "idle" && (
        <div className="card mb-6"><p className="text-lg font-bold text-gray-700">Bereit?</p><p className="text-sm text-gray-500 mt-1">Du fängst an!</p></div>
      )}
      {gameState === "playing" && (
        <div className="card mb-6 flex items-center gap-3">
          <span className="text-4xl">{isComputerTurn ? "⭐" : "🦊"}</span>
          <p className="font-bold text-gray-700">{isComputerTurn ? "Der Computer denkt…" : "Du bist dran!"}</p>
        </div>
      )}
      {gameState === "won" && <div className="card mb-6 bg-forest-light border-forest border-2"><p className="text-2xl font-black text-forest-dark">🎉 Du hast gewonnen!</p></div>}
      {gameState === "lost" && <div className="card mb-6 bg-amber-50 border-amber-300 border-2"><p className="text-2xl font-black text-amber-800">😅 Computer gewinnt!</p></div>}
      {gameState === "draw" && <div className="card mb-6 bg-blue-50 border-blue-200 border-2"><p className="text-2xl font-black text-blue-700">🤝 Unentschieden!</p></div>}

      {/* Board */}
      <div className="inline-grid grid-cols-3 gap-3 mb-6">
        {board.map((cell, idx) => (
          <button key={idx} className={getCellStyle(idx)} onClick={() => handleCellClick(idx)}
            disabled={gameState !== "playing" || isComputerTurn || board[idx] !== null}>
            {cell ?? ""}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button className="btn-primary w-full" onClick={startGame}>
          {gameState === "idle" ? "🎮 Spiel starten!" : "🔄 Nochmal spielen"}
        </button>
        <button className="btn-secondary w-full" onClick={() => router.push("/spiele")}>
          ← Zurück zu den Spielen
        </button>
      </div>
    </div>
  );
}

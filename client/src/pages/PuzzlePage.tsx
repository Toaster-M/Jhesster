import { useState } from 'react';
import Board from '../components/Board/Board';
import type { Square, PieceSymbol } from '../types/chess';
import PUZZLES from '../data/puzzles';
import type { Puzzle } from '../data/puzzles';
import { usePuzzle } from '../hooks/usePuzzle';

// ── Constants ─────────────────────────────────────────────────────────────────

// Maps puzzle theme names to badge colour classes

const THEME_COLOR: Record<string, string> = {
  checkmate:          'bg-red-500/20 text-red-300 border-red-500/30',
  'back-rank':        'bg-orange-500/20 text-orange-300 border-orange-500/30',
  fork:               'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  pin:                'bg-blue-500/20 text-blue-300 border-blue-500/30',
  skewer:             'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'discovered-attack':'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  sacrifice:          'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

// ── Filter controls ───────────────────────────────────────────────────────────

interface FilterState {
  difficulty: number | null;
  theme:      string | null;
}

// ── Single-puzzle view ────────────────────────────────────────────────────────
// Renders the board, status banner, hint/solution buttons, and a sidebar
// with puzzle metadata for the currently active puzzle.

function PuzzleBoard({ puzzle, onNext, onBack }: { puzzle: Puzzle; onNext: () => void; onBack: () => void }) {
  const {
    board,
    selectedSquare,
    legalMoves,
    lastMove,
    status,
    hintsUsed,
    hintSquare,
    playerColor,
    handleSquareClick,
    showHint,
    revealSolution,
    resetPuzzle,
  } = usePuzzle(puzzle);

  const isFlipped = playerColor === 'b';

  const statusBanner = () => {
    if (status === 'solved')  return { text: 'Puzzle solved!', cls: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' };
    if (status === 'wrong')   return { text: 'Not quite — try again.',    cls: 'bg-red-500/15 border-red-500/30 text-red-300' };
    if (status === 'correct') return { text: 'Correct! Keep going…',     cls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
    return null;
  };

  const banner = statusBanner();

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full">
      {/* Board */}
      <div className="flex flex-col gap-3 items-center">
        {banner && (
          <div className={`w-full max-w-[min(80vw,560px)] border rounded-xl px-4 py-2.5 text-sm text-center font-semibold ${banner.cls}`}>
            {banner.text}
          </div>
        )}

        <Board
          board={board as any}
          selectedSquare={hintSquare ?? selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          onSquareClick={handleSquareClick}
          onPromote={(from, to, piece) =>
            handleSquareClick(to)
          }
          isFlipped={isFlipped}
          playerColor={playerColor}
          currentTurn={playerColor}
        />

        {/* Action buttons */}
        <div className="flex gap-2 w-full max-w-[min(80vw,560px)]">
          {status !== 'solved' && (
            <>
              <button
                onClick={showHint}
                className="flex-1 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-sm font-semibold transition-all border border-amber-500/20"
              >
                {hintsUsed === 0 ? 'Hint' : `Hint (${hintsUsed})`}
              </button>
              <button
                onClick={revealSolution}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-semibold transition-all border border-white/10"
              >
                Show solution
              </button>
            </>
          )}
          {status === 'solved' && (
            <button
              onClick={onNext}
              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all"
            >
              Next puzzle →
            </button>
          )}
          <button
            onClick={resetPuzzle}
            className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 text-sm transition-all border border-white/10"
            title="Reset"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-3 w-full lg:w-72 min-w-60">
        <div className="bg-white/4 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-white font-bold text-lg leading-tight">{puzzle.title}</h2>
            <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold border ${THEME_COLOR[puzzle.theme] ?? 'bg-white/10 text-gray-400 border-white/10'}`}>
              {puzzle.theme.replace('-', ' ')}
            </span>
          </div>

          <p className="text-gray-400 text-sm">{puzzle.description}</p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded border ${
              puzzle.difficulty === 1 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
              : puzzle.difficulty === 2 ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
              : 'bg-red-500/15 text-red-400 border-red-500/20'
            }`}>
              {DIFFICULTY_LABEL[puzzle.difficulty]}
            </span>
            <span>{playerColor === 'w' ? '⬜ White to move' : '⬛ Black to move'}</span>
          </div>

          <div className="border-t border-white/8 pt-3 text-xs text-gray-500 leading-relaxed">
            {puzzle.solution.length === 1 && 'Find the best move (mate in 1 or decisive tactic).'}
            {puzzle.solution.length === 3 && 'This puzzle has 2 moves for you to find.'}
            {puzzle.solution.length >= 5 && `This puzzle has ${Math.ceil(puzzle.solution.length / 2)} moves for you to find.`}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-semibold transition-all border border-white/10"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Puzzle list / filter view ─────────────────────────────────────────────────
// Top-level page: shows difficulty + theme filters and a grid of puzzle cards.
// Clicking a card switches to the single-puzzle view.

interface PuzzlePageProps {
  onBack: () => void;
}

export default function PuzzlePage({ onBack }: PuzzlePageProps) {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [filter, setFilter] = useState<FilterState>({ difficulty: null, theme: null });

  const themes   = Array.from(new Set(PUZZLES.map((p) => p.theme)));
  const filtered = PUZZLES.filter((p) => {
    if (filter.difficulty !== null && p.difficulty !== filter.difficulty) return false;
    if (filter.theme      !== null && p.theme      !== filter.theme)      return false;
    return true;
  });

  if (activePuzzle) {
    const idx = filtered.indexOf(activePuzzle);
    return (
      <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-slide-in">
        <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">♟</span>
            <h1 className="text-base font-bold text-white">Puzzle Mode</h1>
          </div>
          <button
            onClick={() => setActivePuzzle(null)}
            className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
          >
            ← Puzzles
          </button>
        </header>
        <main className="flex-1 flex items-start lg:items-center justify-center p-4 lg:p-6 overflow-auto">
          <PuzzleBoard
            puzzle={activePuzzle}
            onNext={() => {
              const next = filtered[idx + 1] ?? filtered[0];
              setActivePuzzle(next);
            }}
            onBack={() => setActivePuzzle(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-slide-in">
      <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">♟</span>
          <h1 className="text-base font-bold text-white">Puzzles</h1>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          ← Menu
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-wrap gap-1.5">
              {[null, 1, 2, 3].map((d) => (
                <button
                  key={String(d)}
                  onClick={() => setFilter((f) => ({ ...f, difficulty: d as number | null }))}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    filter.difficulty === d
                      ? 'bg-white text-gray-900 border-transparent'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {d === null ? 'All' : DIFFICULTY_LABEL[d as number]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[null, ...themes].map((t) => (
                <button
                  key={String(t)}
                  onClick={() => setFilter((f) => ({ ...f, theme: t as string | null }))}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    filter.theme === t
                      ? 'bg-white text-gray-900 border-transparent'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {t === null ? 'All themes' : t.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((puzzle) => (
              <button
                key={puzzle.id}
                onClick={() => setActivePuzzle(puzzle)}
                className="bg-white/4 border border-white/10 hover:border-white/20 hover:bg-white/6 rounded-2xl p-4 text-left transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-white font-semibold text-sm group-hover:text-white/90">{puzzle.title}</span>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold border ${THEME_COLOR[puzzle.theme] ?? ''}`}>
                    {puzzle.theme.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{puzzle.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    puzzle.difficulty === 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : puzzle.difficulty === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {DIFFICULTY_LABEL[puzzle.difficulty]}
                  </span>
                  <span className="text-xs text-gray-600">
                    {Math.ceil(puzzle.solution.length / 2)} move{Math.ceil(puzzle.solution.length / 2) !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-12">No puzzles match the selected filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

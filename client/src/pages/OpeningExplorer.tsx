import { useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board/Board';
import type { Opening, OpeningNode } from '../data/openings';
import type { Square } from '../types/chess';

// ── Helpers ───────────────────────────────────────────────────────────────────

function nodeLastMove(node: OpeningNode): { from: Square; to: Square } | null {
  if (!node.lastMove || node.lastMove.length < 4) return null;
  return {
    from: node.lastMove.slice(0, 2) as Square,
    to:   node.lastMove.slice(2, 4) as Square,
  };
}

function boardFromFen(fen: string) {
  try {
    return new Chess(fen).board();
  } catch {
    return new Chess().board();
  }
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({
  opening,
  path,
  onNavigate,
}: {
  opening: Opening;
  path:    OpeningNode[];
  onNavigate: (depth: number) => void;
}) {
  // path[0] is the root; each additional entry is a deeper branch
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 min-w-0">
      <button
        onClick={() => onNavigate(0)}
        className="hover:text-gray-300 transition-colors shrink-0"
      >
        {opening.title}
      </button>
      {path.slice(1).map((node, i) => (
        <span key={node.id} className="flex items-center gap-1 min-w-0">
          <span className="text-gray-700 shrink-0">›</span>
          <button
            onClick={() => onNavigate(i + 2)}
            className="hover:text-gray-300 transition-colors truncate max-w-35"
            title={node.name}
          >
            {node.name}
          </button>
        </span>
      ))}
    </div>
  );
}

// ── Tree navigator ────────────────────────────────────────────────────────────

interface ExplorerProps {
  opening: Opening;
  onBack:  () => void;
}

function OpeningTreeNav({ opening, onBack }: ExplorerProps) {
  // path[0] = root node, path[1] = first branch chosen, etc.
  const [path, setPath] = useState<OpeningNode[]>([opening.root]);

  const current = path[path.length - 1];
  const board   = boardFromFen(current.fen);
  const lastMove = nodeLastMove(current);

  const goTo = (depth: number) => {
    setPath((p) => p.slice(0, depth));
  };

  const dive = (child: OpeningNode) => {
    setPath((p) => [...p, child]);
  };

  const goBack = () => {
    if (path.length > 1) setPath((p) => p.slice(0, -1));
    else onBack();
  };

  const isAtRoot = path.length === 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-slide-in">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0 gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl select-none shrink-0">♟</span>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate">{opening.title}</h1>
            <Breadcrumb opening={opening} path={path} onNavigate={goTo} />
          </div>
        </div>
        <button
          onClick={goBack}
          className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all shrink-0"
        >
          {isAtRoot ? '← Openings' : '← Back'}
        </button>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 items-start">
          {/* Board */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <Board
              board={board as any}
              selectedSquare={null}
              legalMoves={[]}
              lastMove={lastMove}
              onSquareClick={() => {}}
              onPromote={() => {}}
              isFlipped={opening.color === 'black'}
            />
            {/* Depth indicator */}
            <div className="flex gap-1.5">
              {path.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i + 1)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === path.length - 1
                      ? 'bg-white scale-125'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  title={`Go to depth ${i}`}
                />
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            {/* Node name */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg font-bold text-white">{current.name}</h2>
                {path.length === 1 && (
                  <span className="text-xs px-2 py-0.5 rounded border bg-white/5 border-white/10 text-gray-400">
                    {opening.eco}
                  </span>
                )}
              </div>
              {/* Last move played */}
              {current.lastMove && (
                <p className="text-xs text-gray-600 font-mono">
                  Last move: {current.lastMove.slice(0, 2)} → {current.lastMove.slice(2, 4)}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
              <p className="text-gray-200 text-sm leading-relaxed">{current.description}</p>
            </div>

            {/* Key idea callout */}
            {current.tip && (
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                <span className="text-amber-400 text-lg shrink-0 mt-0.5">💡</span>
                <p className="text-amber-200/80 text-sm leading-relaxed">{current.tip}</p>
              </div>
            )}

            {/* Variations */}
            {current.variations && current.variations.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Explore variations
                </p>
                {current.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => dive(v)}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/10 hover:border-white/25 hover:bg-white/8 text-left transition-all group"
                  >
                    <span className="text-emerald-400 mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                      ▶
                    </span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold leading-snug mb-0.5">
                        {v.name}
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-2 leading-snug">
                        {v.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Leaf node message */}
            {(!current.variations || current.variations.length === 0) && (
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-300/80">
                End of this branch.{' '}
                <button
                  onClick={() => setPath((p) => p.slice(0, -1))}
                  className="underline hover:text-emerald-200 transition-colors"
                >
                  Go back
                </button>{' '}
                to explore other variations.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Opening card ──────────────────────────────────────────────────────────────

const DIFFICULTY_LABEL = ['', 'Beginner', 'Intermediate', 'Advanced'] as const;
const DIFFICULTY_COLOR = ['', 'text-emerald-400', 'text-yellow-400', 'text-orange-400'] as const;

function OpeningCard({
  opening,
  onClick,
}: {
  opening: Opening;
  onClick: () => void;
}) {
  const board = boardFromFen(opening.root.fen);

  // Render a tiny mini-board preview (4×4 grid of the corner squares)
  // showing the last-move highlight colours
  return (
    <button
      onClick={onClick}
      className="bg-white/4 border border-white/10 hover:border-white/22 hover:bg-white/6 rounded-2xl p-5 text-left transition-all group flex flex-col gap-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded border font-mono ${
            opening.color === 'white'
              ? 'bg-white/10 border-white/20 text-gray-300'
              : 'bg-black/40 border-white/10 text-gray-400'
          }`}>
            {opening.color === 'white' ? '♔ White' : '♚ Black'}
          </span>
          <span className="text-xs text-gray-600 font-mono">{opening.eco}</span>
        </div>
        <span className={`text-xs font-semibold ${DIFFICULTY_COLOR[opening.difficulty]}`}>
          {DIFFICULTY_LABEL[opening.difficulty]}
        </span>
      </div>

      <div>
        <h3 className="text-white font-bold text-sm mb-1 group-hover:text-white/90">
          {opening.title}
        </h3>
        <p className="text-gray-500 text-xs leading-snug line-clamp-2">{opening.summary}</p>
      </div>

      {/* Mini board preview (4×4) */}
      <div
        className="grid rounded overflow-hidden border border-white/10 self-start"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)', width: 56, height: 56 }}
      >
        {(opening.color === 'black'
          ? [...board].reverse().map((row) => [...row].reverse())
          : board
        ).slice(0, 4).map((row, ri) =>
          row.slice(0, 4).map((_, ci) => (
            <div
              key={`${ri}-${ci}`}
              className="w-3.5 h-3.5"
              style={{
                background: (ri + ci) % 2 === 0 ? '#b58863' : '#f0d9b5',
                opacity: 0.85,
              }}
            />
          ))
        )}
      </div>

      <p className="text-xs text-emerald-400/70 font-medium group-hover:text-emerald-400 transition-colors">
        Explore variations →
      </p>
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface OpeningExplorerProps {
  openings: Opening[];
  onBack:   () => void;
}

export default function OpeningExplorer({ openings, onBack }: OpeningExplorerProps) {
  const [selected, setSelected] = useState<Opening | null>(null);
  const [filterColor, setFilterColor] = useState<'all' | 'white' | 'black'>('all');

  if (selected) {
    return (
      <OpeningTreeNav
        opening={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  const filtered = filterColor === 'all'
    ? openings
    : openings.filter((o) => o.color === filterColor);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-slide-in">
      <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">♟</span>
          <h1 className="text-base font-bold text-white">Opening Explorer</h1>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          ← Learn
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Intro */}
          <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-1">Explore Opening Theory</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Select an opening to explore its main lines and key variations. Navigate the tree,
              read about each position, and learn the ideas behind every branch.
            </p>
          </div>

          {/* Color filter */}
          <div className="flex gap-2">
            {(['all', 'white', 'black'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterColor(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                  filterColor === f
                    ? 'bg-white text-gray-900 border-transparent'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'All Openings' : f === 'white' ? '♔ Playing White' : '♚ Playing Black'}
              </button>
            ))}
          </div>

          {/* Opening cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((opening) => (
              <OpeningCard
                key={opening.id}
                opening={opening}
                onClick={() => setSelected(opening)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

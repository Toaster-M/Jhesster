import { useEffect } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board/Board';
import MoveAnalysis from '../components/Game/MoveAnalysis';
import type { Move } from '../types/chess';
import { useAnalysis } from '../hooks/useAnalysis';
import type { MoveAnnotation } from '../hooks/useAnalysis';
import { downloadPgn } from '../utils/pgnExport';

// ── Annotation badge ──────────────────────────────────────────────────────────

const ANNOTATION_STYLE: Record<MoveAnnotation, string> = {
  '!!': 'text-emerald-400 font-black',
  '!':  'text-emerald-400 font-bold',
  '':   'text-gray-400',
  '?!': 'text-yellow-400 font-bold',
  '?':  'text-orange-400 font-bold',
  '??': 'text-red-400 font-black',
};

const ANNOTATION_TITLE: Record<MoveAnnotation, string> = {
  '!!': 'Brilliant',
  '!':  'Good',
  '':   '',
  '?!': 'Inaccuracy',
  '?':  'Mistake',
  '??': 'Blunder',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AnalysisPageProps {
  history: Move[];
  onBack:  () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalysisPage({ history, onBack }: AnalysisPageProps) {
  const {
    positions,
    currentIndex,
    currentPosition,
    isEvaluating,
    goTo,
    goBack,
    goForward,
    goToStart,
    goToEnd,
  } = useAnalysis(history);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  goBack();
      if (e.key === 'ArrowRight') goForward();
      if (e.key === 'Home')       goToStart();
      if (e.key === 'End')        goToEnd();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goBack, goForward, goToStart, goToEnd]);

  // Derive board from current FEN
  const chess = new Chess(currentPosition.fen);
  const board = chess.board();

  const lastMoveData = currentPosition.move
    ? { from: currentPosition.move.from, to: currentPosition.move.to }
    : null;

  // Count annotations
  const blunders     = positions.filter((p) => p.annotation === '??').length;
  const mistakes     = positions.filter((p) => p.annotation === '?').length;
  const inaccuracies = positions.filter((p) => p.annotation === '?!').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-slide-in">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">♟</span>
          <h1 className="text-base font-bold text-white">
            Game Analysis
            {isEvaluating && (
              <span className="ml-2 text-xs font-normal text-blue-400 animate-pulse">Evaluating…</span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadPgn(history)}
            className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
            title="Download PGN file"
          >
            Export PGN
          </button>
          <button
            onClick={onBack}
            className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
          >
            ← Menu
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 items-start justify-center p-4 lg:p-6 overflow-auto">
        {/* Board + nav */}
        <div className="flex flex-col gap-3 items-center">
          <Board
            board={board as any}
            selectedSquare={null}
            legalMoves={[]}
            lastMove={lastMoveData}
            onSquareClick={() => {}}
            onPromote={() => {}}
            isFlipped={false}
          />

          {/* Navigation controls */}
          <div className="flex gap-2 w-full max-w-[min(80vw,560px)]">
            {[
              { label: '|◀', action: goToStart, title: 'Start' },
              { label: '◀',  action: goBack,    title: 'Previous (←)' },
              { label: '▶',  action: goForward, title: 'Next (→)' },
              { label: '▶|', action: goToEnd,   title: 'End' },
            ].map(({ label, action, title }) => (
              <button
                key={label}
                onClick={action}
                title={title}
                className="flex-1 py-2 rounded-lg bg-white/6 hover:bg-white/12 text-gray-300 text-sm font-mono transition-all border border-white/10"
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-600">Move {currentIndex} of {positions.length - 1}  ·  Use arrow keys to navigate</p>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3 w-full lg:w-80 min-w-64">
          {/* Eval bar */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-3">
            <MoveAnalysis
              evaluation={currentPosition.eval}
              isThinking={isEvaluating && currentPosition.eval === null}
            />
          </div>

          {/* Game summary */}
          {!isEvaluating && (
            <div className="bg-white/4 border border-white/10 rounded-xl p-4 flex gap-4 text-center">
              <div className="flex-1">
                <div className="text-red-400 font-bold text-xl">{blunders}</div>
                <div className="text-xs text-gray-500 mt-0.5">Blunder{blunders !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex-1 border-x border-white/8">
                <div className="text-orange-400 font-bold text-xl">{mistakes}</div>
                <div className="text-xs text-gray-500 mt-0.5">Mistake{mistakes !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex-1">
                <div className="text-yellow-400 font-bold text-xl">{inaccuracies}</div>
                <div className="text-xs text-gray-500 mt-0.5">Inaccurac{inaccuracies !== 1 ? 'ies' : 'y'}</div>
              </div>
            </div>
          )}

          {/* Move list with annotations */}
          <div className="bg-white/4 border border-white/10 rounded-xl p-3 flex flex-col gap-1 max-h-96 overflow-y-auto">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Move list</p>
            {positions.slice(1).map((pos, i) => {
              const absIdx    = i + 1;
              const isWhite   = i % 2 === 0;
              const moveNum   = Math.floor(i / 2) + 1;
              const isCurrent = currentIndex === absIdx;
              const ann       = pos.annotation as MoveAnnotation;

              return (
                <span key={absIdx} className="inline">
                  {isWhite && (
                    <span className="text-gray-600 text-xs font-mono mr-1">{moveNum}.</span>
                  )}
                  <button
                    onClick={() => goTo(absIdx)}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-sm font-mono transition-colors mr-1 ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {pos.move?.san ?? ''}
                    {ann && (
                      <span className={`text-xs ${ANNOTATION_STYLE[ann]}`} title={ANNOTATION_TITLE[ann]}>
                        {ann}
                      </span>
                    )}
                  </button>
                </span>
              );
            })}
            {positions.length <= 1 && (
              <p className="text-gray-500 text-xs italic">No moves to analyse.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

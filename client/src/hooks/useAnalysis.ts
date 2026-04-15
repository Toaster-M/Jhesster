import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { getChessEngine } from '../services/chessEngine';
import type { Move, Color } from '../types/chess';
import type { EngineEvaluation } from '../types/chess';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MoveAnnotation = '!!' | '!' | '' | '?!' | '?' | '??';

export interface AnalysisPosition {
  fen:        string;
  move:       Move | null;       // move that led to this position (null for start)
  eval:       EngineEvaluation | null;
  annotation: MoveAnnotation;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ANALYSIS_DEPTH = 14;

function centipawnLoss(before: EngineEvaluation, after: EngineEvaluation, movedColor: Color): number {
  // Normalise scores to "positive = good for the side that just moved"
  const scoreBefore = movedColor === 'w' ?  before.score : -before.score;
  const scoreAfter  = movedColor === 'w' ?  after.score  : -after.score;
  return scoreBefore - scoreAfter; // positive = loss for that side
}

function annotate(loss: number): MoveAnnotation {
  if (loss <= -200) return '!!'; // brilliant — significant improvement
  if (loss <=  -50) return '!';  // good
  if (loss <    50) return '';   // normal
  if (loss <   100) return '?!'; // inaccuracy
  if (loss <   200) return '?';  // mistake
  return '??';                   // blunder
}

// Rebuild FEN history from a move list (needs chess.js to replay)
function buildPositions(history: Move[]): AnalysisPosition[] {
  const chess = new Chess();
  const positions: AnalysisPosition[] = [{
    fen:        chess.fen(),
    move:       null,
    eval:       null,
    annotation: '',
  }];

  for (const move of history) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    positions.push({
      fen:        chess.fen(),
      move,
      eval:       null,
      annotation: '',
    });
  }

  return positions;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAnalysis(history: Move[]) {
  const [positions, setPositions] = useState<AnalysisPosition[]>(() => buildPositions(history));
  const [currentIndex, setCurrentIndex] = useState(history.length); // start at final position
  const [isEvaluating, setIsEvaluating] = useState(false);

  const engineRef      = useRef(getChessEngine());
  const isMounted      = useRef(true);
  const evalQueueRef   = useRef<number[]>([]);
  const evaluatingRef  = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // When history changes, rebuild position list and reset queue
  useEffect(() => {
    const rebuilt = buildPositions(history);
    setPositions(rebuilt);
    setCurrentIndex(history.length);
    evalQueueRef.current = rebuilt.map((_, i) => i);
    runEvalQueue(rebuilt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runEvalQueue = useCallback(async (posArr: AnalysisPosition[]) => {
    if (evaluatingRef.current) return;
    evaluatingRef.current = true;
    setIsEvaluating(true);

    engineRef.current.setDifficulty(5); // max depth for analysis

    while (evalQueueRef.current.length > 0 && isMounted.current) {
      const idx = evalQueueRef.current.shift()!;
      const pos = posArr[idx];
      if (!pos || pos.eval !== null) continue;

      try {
        engineRef.current.stop();
        const evaluation = await engineRef.current.evaluatePosition(pos.fen);
        if (!isMounted.current) break;

        setPositions((prev) => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], eval: evaluation };

          // Annotate once we have both before and after evals
          if (idx > 0) {
            const before = updated[idx - 1].eval;
            const after  = updated[idx].eval;
            if (before && after && updated[idx].move) {
              const movedColor = updated[idx].move!.color ?? 'w';
              const loss = centipawnLoss(before, after, movedColor as Color);
              updated[idx] = { ...updated[idx], annotation: annotate(loss) };
            }
          }

          return updated;
        });
      } catch {
        // Engine busy or error — skip
      }
    }

    if (isMounted.current) setIsEvaluating(false);
    evaluatingRef.current = false;
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(positions.length - 1, index)));
  }, [positions.length]);

  const goBack    = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const goForward = useCallback(() => setCurrentIndex((i) => Math.min(positions.length - 1, i + 1)), [positions.length]);
  const goToStart = useCallback(() => setCurrentIndex(0), []);
  const goToEnd   = useCallback(() => setCurrentIndex(positions.length - 1), [positions.length]);

  const currentPosition = positions[currentIndex] ?? positions[0];

  return {
    positions,
    currentIndex,
    currentPosition,
    isEvaluating,
    goTo,
    goBack,
    goForward,
    goToStart,
    goToEnd,
  };
}

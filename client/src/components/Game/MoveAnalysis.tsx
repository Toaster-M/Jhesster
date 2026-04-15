import type { EngineEvaluation } from '../../types/chess';

interface MoveAnalysisProps {
  evaluation: EngineEvaluation | null;
  isThinking: boolean;
}

/** Clamp centipawn score to [-1000, 1000] and map to [0, 100] for white's bar fill */
function evalToPercent(score: number, mate: number | null): number {
  if (mate !== null) {
    return mate > 0 ? 95 : 5;
  }
  const clamped = Math.max(-1000, Math.min(1000, score));
  // Sigmoid-like mapping so small advantages are visible
  return 50 + (clamped / 1000) * 45;
}

function formatScore(score: number, mate: number | null): string {
  if (mate !== null) {
    return mate > 0 ? `M${mate}` : `M${Math.abs(mate)}`;
  }
  const pawns = score / 100;
  const prefix = score > 0 ? '+' : '';
  return `${prefix}${pawns.toFixed(1)}`;
}

function advantageLabel(score: number, mate: number | null): string {
  if (mate !== null) return mate > 0 ? 'White mates' : 'Black mates';
  if (Math.abs(score) < 30) return 'Equal';
  return score > 0 ? 'White ahead' : 'Black ahead';
}

export default function MoveAnalysis({ evaluation, isThinking }: MoveAnalysisProps) {
  const whitePct = evaluation ? evalToPercent(evaluation.score, evaluation.mate) : 50;
  const blackPct = 100 - whitePct;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Evaluation
        </span>
        {isThinking ? (
          <span className="text-xs text-blue-400 animate-pulse">Thinking…</span>
        ) : evaluation ? (
          <span className="text-xs text-gray-300 font-mono">
            {formatScore(evaluation.score, evaluation.mate)}
            <span className="text-gray-600 ml-1">d{evaluation.depth}</span>
          </span>
        ) : null}
      </div>

      {/* Evaluation bar */}
      <div className="h-5 rounded-full overflow-hidden flex bg-gray-800 border border-white/10 relative">
        {/* White portion */}
        <div
          className="h-full bg-gray-100 transition-all duration-500"
          style={{ width: `${whitePct}%` }}
        />
        {/* Black portion fills the rest */}
        <div
          className="h-full bg-gray-900 transition-all duration-500 flex-1"
          style={{ width: `${blackPct}%` }}
        />

        {/* Center line */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-gray-500/50 pointer-events-none" />

        {/* Labels inside bar */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <span className="text-xs font-bold text-gray-700 leading-none">W</span>
          <span className="text-xs font-bold text-gray-300 leading-none">B</span>
        </div>
      </div>

      {evaluation && !isThinking && (
        <p className="text-xs text-gray-500 text-center">
          {advantageLabel(evaluation.score, evaluation.mate)}
        </p>
      )}
    </div>
  );
}

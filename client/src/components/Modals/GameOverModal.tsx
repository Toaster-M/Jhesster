import type { GameStatus, Color, Move } from '../../types/chess';
import { downloadPgn, getPgnResult } from '../../utils/pgnExport';

interface GameOverModalProps {
  status: GameStatus;
  winner: Color | 'draw' | null;
  /** True when a player ran out of time */
  isFlagged?: boolean;
  /** Which color flagged (ran out of time) */
  flaggedColor?: Color | null;
  /** Reason string from an online game-end event */
  onlineEndReason?: string | null;
  mode: 'vs-ai' | 'local-multiplayer' | 'online';
  playerColor?: Color;
  playerNames?: { white: string; black: string };
  history: Move[];
  onNewGame?: () => void;
  onAnalyze?: () => void;
  onClose: () => void;
}

function getResult(
  status: GameStatus,
  winner: Color | 'draw' | null,
  isFlagged: boolean,
  flaggedColor: Color | null,
  onlineEndReason: string | null,
  mode: string,
  playerColor: Color,
  playerNames: { white: string; black: string },
): { headline: string; sub: string; isDraw: boolean } {
  const winnerName = winner === 'w' ? playerNames.white : winner === 'b' ? playerNames.black : null;

  // Timeout
  if (isFlagged && flaggedColor) {
    const loserName = flaggedColor === 'w' ? playerNames.white : playerNames.black;
    const winnerNameTimeout = flaggedColor === 'w' ? playerNames.black : playerNames.white;
    if (mode === 'vs-ai') {
      const playerWon = flaggedColor !== playerColor;
      return {
        headline: playerWon ? 'You Win!' : 'You Lose',
        sub: `${loserName} ran out of time`,
        isDraw: false,
      };
    }
    return {
      headline: `${winnerNameTimeout} Wins!`,
      sub: `${loserName} ran out of time`,
      isDraw: false,
    };
  }

  // Online end reason
  if (onlineEndReason) {
    return {
      headline: winnerName ? `${winnerName} Wins!` : 'Game Over',
      sub: onlineEndReason,
      isDraw: winner === 'draw',
    };
  }

  // Checkmate
  if (status.isCheckmate) {
    if (mode === 'vs-ai') {
      const playerWon = winner === playerColor;
      return {
        headline: playerWon ? 'You Win!' : 'AI Wins!',
        sub: 'by Checkmate',
        isDraw: false,
      };
    }
    return {
      headline: `${winnerName} Wins!`,
      sub: 'by Checkmate',
      isDraw: false,
    };
  }

  // Draw variants
  if (status.isStalemate)           return { headline: 'Draw', sub: 'by Stalemate',              isDraw: true };
  if (status.isThreefoldRepetition) return { headline: 'Draw', sub: 'by Threefold Repetition',   isDraw: true };
  if (status.isInsufficientMaterial) return { headline: 'Draw', sub: 'Insufficient Material',    isDraw: true };
  if (status.isDraw)                return { headline: 'Draw', sub: 'by Agreement',               isDraw: true };

  return { headline: 'Game Over', sub: '', isDraw: false };
}

export default function GameOverModal({
  status,
  winner,
  isFlagged = false,
  flaggedColor = null,
  onlineEndReason = null,
  mode,
  playerColor = 'w',
  playerNames = { white: 'White', black: 'Black' },
  history,
  onNewGame,
  onAnalyze,
  onClose,
}: GameOverModalProps) {
  const { headline, sub, isDraw } = getResult(
    status, winner, isFlagged, flaggedColor, onlineEndReason,
    mode, playerColor, playerNames,
  );

  // Colour theme: gold for win, slate for draw, red for loss
  const isWin =
    !isDraw &&
    (mode === 'vs-ai'
      ? winner === playerColor
      : winner !== 'draw' && winner !== null);

  const isLoss = !isDraw && !isWin && winner !== null;

  const accentClass = isDraw
    ? 'text-slate-300'
    : isWin
    ? 'text-amber-300'
    : 'text-red-400';

  const glowClass = isDraw
    ? ''
    : isWin
    ? 'shadow-[0_0_60px_rgba(251,191,36,0.18)]'
    : 'shadow-[0_0_60px_rgba(239,68,68,0.15)]';

  const iconText = isDraw ? '½' : isWin ? '♔' : '♚';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <div
        className={`relative flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[#1a1a2e] px-10 py-9 w-[min(90vw,380px)] modal-box ${glowClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <span className={`text-6xl leading-none select-none ${accentClass} game-over-icon`}>
          {iconText}
        </span>

        {/* Headline */}
        <div className="text-center">
          <h2 className={`text-3xl font-black tracking-tight ${accentClass}`}>
            {headline}
          </h2>
          {sub && (
            <p className="mt-1 text-sm text-gray-400 font-medium tracking-wide">
              {sub}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/8" />

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          {onNewGame && (
            <button
              onClick={() => { onNewGame(); onClose(); }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm active:scale-95 transition-all shadow"
            >
              New Game
            </button>
          )}

          <div className="flex gap-2 w-full">
            {onAnalyze && (
              <button
                onClick={() => { onAnalyze(); onClose(); }}
                className="flex-1 py-2 rounded-xl bg-blue-700/60 hover:bg-blue-600/60 text-blue-200 font-semibold text-sm active:scale-95 transition-all border border-blue-600/30"
              >
                Analyze
              </button>
            )}
            {history.length > 0 && (
              <button
                onClick={() => {
                  const result = getPgnResult(status.isCheckmate, status.isDraw, status.isStalemate, winner);
                  downloadPgn(history, { white: playerNames.white, black: playerNames.black, result });
                }}
                className="flex-1 py-2 rounded-xl bg-white/8 hover:bg-white/14 text-gray-300 font-semibold text-sm active:scale-95 transition-all border border-white/10"
              >
                Export PGN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

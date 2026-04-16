import type { GameStatus, CapturedPieces, Move, Color, PieceSymbol } from '../../types/chess';
import { getPieceUnicode } from '../../utils/chessHelpers';
import { downloadPgn, getPgnResult } from '../../utils/pgnExport';
import { getOpeningName } from '../../utils/openingBook';
import MoveHistory from './MoveHistory';

interface GameInfoProps {
  status: GameStatus;
  capturedPieces: CapturedPieces;
  history: Move[];
  isGameOver: boolean;
  winner: Color | 'draw' | null;
  isAIThinking: boolean;
  onReset?: () => void;
  onUndo?: () => void;
  onResign?: () => void;
  onAnalyze?: () => void;
  mode: 'vs-ai' | 'local-multiplayer';
  playerColor?: Color;
  playerNames?: { white: string; black: string };
  /** Optional override for player names used in PGN headers */
  pgnNames?: { white: string; black: string };
}

// ── Material counting helpers ─────────────────────────────────────────────────

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

function getMaterialCount(pieces: PieceSymbol[]): number {
  return pieces.reduce((sum, p) => sum + (PIECE_VALUES[p] ?? 0), 0);
}

// ── Status message resolver ───────────────────────────────────────────────────
// Returns a display string and colour tone based on the current game state.

function getStatusMessage(
  status: GameStatus,
  winner: Color | 'draw' | null,
  isAIThinking: boolean,
  mode: string,
  playerColor: Color,
  playerNames: { white: string; black: string }
): { text: string; tone: 'neutral' | 'check' | 'thinking' | 'over' } {
  const winnerName = winner === 'w' ? playerNames.white : winner === 'b' ? playerNames.black : null;

  if (status.isCheckmate) {
    const text =
      winner === 'draw'
        ? "It's a draw!"
        : mode === 'vs-ai'
        ? winner === playerColor
          ? 'You win! Checkmate!'
          : 'AI wins! Checkmate.'
        : `${winnerName} wins by checkmate!`;
    return { text, tone: 'over' };
  }
  if (status.isDraw) return { text: "It's a draw!", tone: 'over' };
  if (status.isStalemate) return { text: 'Stalemate — draw!', tone: 'over' };
  if (status.isThreefoldRepetition) return { text: 'Draw by repetition!', tone: 'over' };
  if (status.isInsufficientMaterial) return { text: 'Draw — insufficient material!', tone: 'over' };
  if (isAIThinking) return { text: 'AI is thinking…', tone: 'thinking' };
  if (status.isCheck) {
    const who = mode === 'local-multiplayer'
      ? (status.turn === 'w' ? playerNames.white : playerNames.black)
      : status.turn === 'w' ? 'White' : 'Black';
    return { text: `${who} is in check!`, tone: 'check' };
  }
  if (mode === 'local-multiplayer') {
    const who = status.turn === 'w' ? playerNames.white : playerNames.black;
    return { text: `${who}'s turn`, tone: 'neutral' };
  }
  const who = status.turn === playerColor ? 'Your turn' : 'AI to move';
  return { text: who, tone: 'neutral' };
}

// ── Tone → CSS class mapping ──────────────────────────────────────────────────

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-white/5 text-gray-300 border border-white/10',
  check: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  thinking: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  over: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

export default function GameInfo({
  status,
  capturedPieces,
  history,
  isGameOver,
  winner,
  isAIThinking,
  onReset,
  onUndo,
  onResign,
  onAnalyze,
  mode,
  playerColor = 'w',
  playerNames = { white: 'White', black: 'Black' },
  pgnNames,
}: GameInfoProps) {
  const openingName = getOpeningName(history.map((m) => m.san).filter((s): s is string => !!s));

  const whiteMaterial = getMaterialCount(capturedPieces.b as PieceSymbol[]); // white captured from black
  const blackMaterial = getMaterialCount(capturedPieces.w as PieceSymbol[]); // black captured from white
  const materialAdvantage = whiteMaterial - blackMaterial;

  // Use player names in PvP status messages
  const statusMode = mode === 'local-multiplayer' ? 'local-multiplayer' : 'vs-ai';
  const { text: statusText, tone } = getStatusMessage(status, winner, isAIThinking, statusMode, playerColor, playerNames);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Status banner */}
      <div className={`rounded-xl px-4 py-3 text-center font-semibold text-sm ${TONE_CLASSES[tone]}`}>
        {statusText}
      </div>

      {/* Material count */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Material</p>
        <div className="flex justify-between items-start text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">White captures</p>
            <p className="text-base leading-snug">
              {capturedPieces.b.length > 0
                ? capturedPieces.b.map((p) => getPieceUnicode({ color: 'w', type: p as PieceSymbol })).join('')
                : <span className="text-gray-600 text-xs">—</span>}
            </p>
            {whiteMaterial > 0 && (
              <p className="text-xs text-emerald-400">+{whiteMaterial}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-0.5">Black captures</p>
            <p className="text-base leading-snug">
              {capturedPieces.w.length > 0
                ? capturedPieces.w.map((p) => getPieceUnicode({ color: 'b', type: p as PieceSymbol })).join('')
                : <span className="text-gray-600 text-xs">—</span>}
            </p>
            {blackMaterial > 0 && (
              <p className="text-xs text-emerald-400 text-right">+{blackMaterial}</p>
            )}
          </div>
        </div>
        {materialAdvantage !== 0 && (
          <p className="text-xs text-center text-gray-500 mt-1 border-t border-white/5 pt-1">
            {materialAdvantage > 0 ? 'White' : 'Black'} +{Math.abs(materialAdvantage)}
          </p>
        )}
      </div>

      {/* Buttons */}
      {(onReset || onUndo || onResign) && (
        <div className="flex gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 active:scale-95 transition-all shadow"
            >
              New Game
            </button>
          )}
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={history.length === 0 || isAIThinking}
              className="flex-1 py-2 px-3 rounded-lg bg-white/10 text-gray-200 font-semibold text-sm hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Undo
            </button>
          )}
          {onResign && (
            <button
              onClick={onResign}
              className="flex-1 py-2 px-3 rounded-lg bg-red-900/60 text-red-300 font-semibold text-sm hover:bg-red-800/60 active:scale-95 transition-all"
            >
              Resign
            </button>
          )}
        </div>
      )}

      {/* Analyze Game + Export PGN — shown after the game ends */}
      {isGameOver && history.length > 0 && (
        <div className="flex gap-2">
          {onAnalyze && (
            <button
              onClick={onAnalyze}
              className="flex-1 py-2 px-3 rounded-lg bg-blue-700/60 hover:bg-blue-600/60 text-blue-200 font-semibold text-sm active:scale-95 transition-all border border-blue-600/30"
            >
              Analyze Game
            </button>
          )}
          <button
            onClick={() => {
              const names = pgnNames ?? playerNames;
              const result = getPgnResult(status.isCheckmate, status.isDraw, status.isStalemate, winner);
              downloadPgn(history, { white: names.white, black: names.black, result });
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-white/8 hover:bg-white/14 text-gray-300 font-semibold text-sm active:scale-95 transition-all border border-white/10"
            title="Download PGN"
          >
            Export PGN
          </button>
        </div>
      )}

      {/* Move history */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-3 flex-1">
        <div className="mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Move History
            {history.length > 0 && (
              <span className="ml-2 text-gray-600 normal-case font-normal">
                ({Math.ceil(history.length / 2)} move{Math.ceil(history.length / 2) !== 1 ? 's' : ''})
              </span>
            )}
          </p>
          {openingName && (
            <p className="text-xs text-emerald-400/80 mt-0.5 font-medium">{openingName}</p>
          )}
        </div>
        <MoveHistory history={history} />
      </div>
    </div>
  );
}

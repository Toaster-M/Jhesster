import type { Piece, Square as SquareType, Move, PieceSymbol, Color } from '../../types/chess';
import { indicesToSquare } from '../../utils/chessHelpers';
import { usePrefsStore, getBoardTheme } from '../../store/prefsStore';
import SquareComponent from './Square';
import PiecePromotionModal from '../Modals/PiecePromotionModal';
import styles from './Board.module.css';

interface BoardProps {
  board: (Piece | null)[][];
  selectedSquare: SquareType | null;
  legalMoves: Move[];
  lastMove: Move | null;
  onSquareClick: (square: SquareType) => void;
  onPromote: (from: SquareType, to: SquareType, piece: PieceSymbol) => void;
  isFlipped?: boolean;
  pendingPromotion?: { from: SquareType; to: SquareType } | null;
  playerColor?: Color;
  currentTurn?: Color;
  playerNames?: { white: string; black: string };
  mode?: 'vs-ai' | 'local-multiplayer';
}

export default function Board({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  onSquareClick,
  onPromote,
  isFlipped = false,
  pendingPromotion = null,
  playerColor = 'w',
  currentTurn,
  playerNames,
  mode,
}: BoardProps) {
  const { prefs } = usePrefsStore();
  const theme       = getBoardTheme(prefs);
  const pieceColors = prefs.pieceColors;
  const frameStyle  = { background: prefs.boardFrame.background } as React.CSSProperties;
  const labelStyle  = { color: prefs.boardFrame.labelColor } as React.CSSProperties;
  const legalSquares = new Set(legalMoves.map((m) => m.to));

  // ── Row/column order — reverse both axes when the board is flipped ──────────
  const rows = isFlipped
    ? [...Array(8)].map((_, i) => 7 - i)
    : [...Array(8)].map((_, i) => i);
  const cols = isFlipped
    ? [...Array(8)].map((_, i) => 7 - i)
    : [...Array(8)].map((_, i) => i);

  // Coordinate labels — derived from the render order so they flip with the board
  const rankLabels = rows.map((r) => 8 - r);
  const fileLabels = cols.map((c) => String.fromCharCode('a'.charCodeAt(0) + c));

  // Player label shown beside the board edges
  const topPlayerColor: Color = isFlipped ? 'w' : 'b';
  const bottomPlayerColor: Color = isFlipped ? 'b' : 'w';
  const topName = topPlayerColor === 'w' ? (playerNames?.white ?? 'White') : (playerNames?.black ?? 'Black');
  const bottomName = bottomPlayerColor === 'w' ? (playerNames?.white ?? 'White') : (playerNames?.black ?? 'Black');

  const isTopActive = currentTurn === topPlayerColor;
  const isBottomActive = currentTurn === bottomPlayerColor;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-1 ${prefs.animationsEnabled ? 'animate-fade-in-scale' : ''}`}>
      {/* Top player label */}
      {playerNames && (
        <div className={`flex items-center gap-2 px-1 py-0.5 rounded-lg text-sm font-semibold transition-colors ${
          isTopActive ? 'text-white' : 'text-gray-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isTopActive ? 'bg-emerald-400 shadow-[0_0_6px_var(--color-emerald-400)]' : 'bg-gray-600'} transition-all`} />
          {topName}
          {isTopActive && currentTurn && (
            <span className="text-xs text-emerald-400 font-normal ml-1">to move</span>
          )}
        </div>
      )}

      <div className={styles.frameOuter} style={frameStyle}>
        {/* Top file labels */}
        <div className={styles.fileRow}>
          <div className={styles.cornerCell} />
          {fileLabels.map((f) => (
            <div key={`top-${f}`} className={styles.fileLabel} style={labelStyle}>{f}</div>
          ))}
          <div className={styles.cornerCell} />
        </div>

        {/* Middle row: left ranks + board + right ranks */}
        <div className={styles.frameRow}>
          <div className={styles.rankLabels}>
            {rankLabels.map((r) => (
              <div key={`l-${r}`} className={styles.rankLabel} style={labelStyle}>{r}</div>
            ))}
          </div>

          <div className={styles.boardWrapper}>
            <div className={`${styles.board} board-flip`}>
              {rows.map((row) =>
                cols.map((col) => {
                  const square = indicesToSquare(row, col);
                  const piece = board[row]?.[col] ?? null;

                  return (
                    <SquareComponent
                      key={square}
                      square={square}
                      piece={piece}
                      isSelected={selectedSquare === square}
                      isLegal={legalSquares.has(square)}
                      isLastMove={lastMove?.from === square || lastMove?.to === square}
                      onClick={onSquareClick}
                      theme={theme}
                      pieceColors={pieceColors}
                      animationsEnabled={prefs.animationsEnabled}
                    />
                  );
                })
              )}
            </div>

            {pendingPromotion && (
              <PiecePromotionModal
                color={playerColor}
                onPromote={(piece) => onPromote(pendingPromotion.from, pendingPromotion.to, piece)}
                onCancel={() => onSquareClick(pendingPromotion.from)}
              />
            )}
          </div>

          <div className={styles.rankLabels}>
            {rankLabels.map((r) => (
              <div key={`r-${r}`} className={styles.rankLabel} style={labelStyle}>{r}</div>
            ))}
          </div>
        </div>

        {/* Bottom file labels */}
        <div className={styles.fileRow}>
          <div className={styles.cornerCell} />
          {fileLabels.map((f) => (
            <div key={`bot-${f}`} className={styles.fileLabel} style={labelStyle}>{f}</div>
          ))}
          <div className={styles.cornerCell} />
        </div>
      </div>

      {/* Bottom player label */}
      {playerNames && (
        <div className={`flex items-center gap-2 px-1 py-0.5 rounded-lg text-sm font-semibold transition-colors ${
          isBottomActive ? 'text-white' : 'text-gray-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isBottomActive ? 'bg-emerald-400 shadow-[0_0_6px_var(--color-emerald-400)]' : 'bg-gray-600'} transition-all`} />
          {bottomName}
          {isBottomActive && currentTurn && (
            <span className="text-xs text-emerald-400 font-normal ml-1">to move</span>
          )}
        </div>
      )}
    </div>
  );
}

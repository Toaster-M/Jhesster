import type { Piece, Square as SquareType } from '../../types/chess';
import { getPieceUnicode, isLightSquare, squareToIndices } from '../../utils/chessHelpers';
import type { BoardThemeColors } from '../../store/prefsStore';

interface SquareProps {
  square:            SquareType;
  piece:             Piece | null;
  isSelected:        boolean;
  isLegal:           boolean;
  isLastMove:        boolean;
  onClick:           (square: SquareType) => void;
  theme:             BoardThemeColors;
  pieceColors?:      { white: string; black: string };
  animationsEnabled?: boolean;
}

/** Returns true if the hex colour is perceptually light (luminance > ~50%). */
function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
}

export default function Square({
  square,
  piece,
  isSelected,
  isLegal,
  isLastMove,
  onClick,
  theme,
  pieceColors = { white: '#ffffff', black: '#1a1a1a' },
  animationsEnabled = true,
}: SquareProps) {
  const { row, col } = squareToIndices(square);
  const light = isLightSquare(row, col);

  // Determine background colour
  let bg: string;
  if (isSelected) {
    bg = theme.selected;
  } else if (isLastMove) {
    bg = theme.lastMove;
  } else {
    bg = light ? theme.light : theme.dark;
  }

  // Overlay the last-move tint on the base colour instead of replacing it
  const style: React.CSSProperties = { width: '12.5%', aspectRatio: '1', backgroundColor: bg };
  if (isLastMove && !isSelected) {
    style.backgroundColor = light ? theme.light : theme.dark;
    style.outline = `inset 0 0 0 0 transparent`;
    // Apply last-move as a box-shadow overlay so base colour shows through
    style.boxShadow = `inset 0 0 0 100vmax ${theme.lastMove}`;
  }

  // Piece rendering
  let pieceColor = '';
  let pieceShadow = '';
  if (piece) {
    pieceColor = piece.color === 'w' ? pieceColors.white : pieceColors.black;
    const isLight = isLightColor(pieceColor);
    // Build a solid outline by stacking shadows in all 8 directions, then add a drop shadow
    const outlineColor = isLight ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.80)';
    const outline = [
      `-1px -1px 0 ${outlineColor}`,
      ` 0px -1px 0 ${outlineColor}`,
      ` 1px -1px 0 ${outlineColor}`,
      ` 1px  0px 0 ${outlineColor}`,
      ` 1px  1px 0 ${outlineColor}`,
      ` 0px  1px 0 ${outlineColor}`,
      `-1px  1px 0 ${outlineColor}`,
      `-1px  0px 0 ${outlineColor}`,
    ].join(', ');
    const drop = isLight
      ? '0 2px 5px rgba(0,0,0,0.75)'
      : '0 2px 4px rgba(0,0,0,0.55)';
    pieceShadow = `${outline}, ${drop}`;
  }

  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer select-none hover:brightness-90 ${
        animationsEnabled ? 'square-transition' : ''
      }`}
      style={style}
      onClick={() => onClick(square)}
      data-square={square}
    >
      {/* Legal move dot (empty square) */}
      {isLegal && !piece && (
        <div
          className="w-[34%] h-[34%] rounded-full pointer-events-none"
          style={{ backgroundColor: theme.legal }}
        />
      )}

      {/* Legal move ring (capture square) */}
      {isLegal && piece && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 4px ${theme.legal}`,
            borderRadius: '2px',
          }}
        />
      )}

      {/* Piece */}
      {piece && (
        <span
          className={`text-4xl leading-none pointer-events-none z-10 select-none ${
            animationsEnabled ? 'piece-enter' : ''
          }`}
          style={{
            fontSize:            'clamp(1.4rem, 3.8vw, 2.4rem)',
            color:               pieceColor,
            textShadow:          pieceShadow,
            WebkitUserSelect:    'none',
            WebkitTouchCallout:  'none',
          }}
          draggable={false}
          key={`${square}-${piece.type}-${piece.color}`}
        >
          {getPieceUnicode(piece)}
        </span>
      )}

    </div>
  );
}

import type { Color, PieceSymbol } from '../../types/chess';
import { getPieceUnicode } from '../../utils/chessHelpers';

interface PiecePromotionModalProps {
  color: Color;
  onPromote: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];
const PIECE_NAMES: Record<PieceSymbol, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
  k: 'King',
  p: 'Pawn',
};

export default function PiecePromotionModal({ color, onPromote, onCancel }: PiecePromotionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4 min-w-[280px]">
        <h2 className="text-xl font-bold text-gray-800">Promote Pawn</h2>
        <div className="flex gap-3">
          {PROMOTION_PIECES.map((piece) => (
            <button
              key={piece}
              onClick={() => onPromote(piece)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-200 hover:border-gray-400 transition-all cursor-pointer"
              title={PIECE_NAMES[piece]}
            >
              <span className="text-4xl leading-none">
                {getPieceUnicode({ color, type: piece })}
              </span>
              <span className="text-xs text-gray-600 font-medium">{PIECE_NAMES[piece]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-400 hover:text-gray-700 underline transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

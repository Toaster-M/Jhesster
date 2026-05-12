import Piece from './Piece'

interface PromotionPickerProps {
  color: 'w' | 'b'
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
}

const PIECES: Array<'q' | 'r' | 'b' | 'n'> = ['q', 'r', 'b', 'n']

export default function PromotionPicker({ color, onSelect, onCancel }: PromotionPickerProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20 bg-black/50"
      onClick={onCancel}
    >
      <div
        className="bg-[#16213e] rounded-xl p-4 flex gap-2 shadow-2xl border border-[#2d3561]"
        onClick={(e) => e.stopPropagation()}
      >
        {PIECES.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className="w-14 h-14 flex items-center justify-center rounded-lg hover:bg-[#2d3561] transition-colors"
            aria-label={p.toUpperCase()}
          >
            <Piece type={p} color={color} size={48} />
          </button>
        ))}
      </div>
    </div>
  )
}

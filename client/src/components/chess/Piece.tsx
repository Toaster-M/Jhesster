const SYMBOLS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
}

interface PieceProps {
  type: string
  color: 'w' | 'b'
  size?: number
}

export default function Piece({ type, color, size = 56 }: PieceProps) {
  const symbol = SYMBOLS[color + type.toUpperCase()] ?? ''
  const fill = color === 'w' ? '#ffffff' : '#1c1c1c'
  const stroke = color === 'w' ? '#1c1c1c' : '#ffffff'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <text
        x="28"
        y="46"
        textAnchor="middle"
        fontSize="44"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        paintOrder="stroke"
        fontFamily="'Segoe UI Symbol','Apple Symbols','Symbol','FreeSerif',serif"
      >
        {symbol}
      </text>
    </svg>
  )
}

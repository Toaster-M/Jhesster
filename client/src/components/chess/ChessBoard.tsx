import { useState, useRef, useCallback, useMemo } from 'react'
import { Chess, Square } from 'chess.js'
import Piece from './Piece'
import PromotionPicker from './PromotionPicker'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

function isLightSquare(sq: string): boolean {
  const f = sq.charCodeAt(0) - 97 // 'a' = 0
  const r = parseInt(sq[1]) - 1
  return (f + r) % 2 !== 0
}

interface ChessBoardProps {
  fen: string
  onMove: (from: string, to: string, promotion?: string) => void
  orientation?: 'white' | 'black'
  interactive?: boolean
  lastMove?: { from: string; to: string }
  lightSquareColor?: string
  darkSquareColor?: string
}

export default function ChessBoard({
  fen,
  onMove,
  orientation = 'white',
  interactive = true,
  lastMove,
  lightSquareColor = '#F0D9B5',
  darkSquareColor = '#B58863',
}: ChessBoardProps) {
  const chess = useMemo(() => {
    try { return new Chess(fen) } catch { return new Chess() }
  }, [fen])

  const turn = chess.turn() as 'w' | 'b'
  const [selected, setSelected] = useState<string | null>(null)
  const [legalDests, setLegalDests] = useState<Set<string>>(new Set())
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragFrom, setDragFrom] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const getLegal = useCallback(
    (sq: string) => {
      const moves = chess.moves({ square: sq as Square, verbose: true })
      return new Set(moves.map((m) => m.to as string))
    },
    [chess],
  )

  function isPromotion(from: string, to: string) {
    const piece = chess.get(from as Square)
    return piece?.type === 'p' && (to[1] === '8' || to[1] === '1')
  }

  function attemptMove(from: string, to: string) {
    if (isPromotion(from, to)) {
      setPendingPromotion({ from, to })
    } else {
      onMove(from, to)
    }
    setSelected(null)
    setLegalDests(new Set())
  }

  function handleSquareClick(sq: string) {
    if (!interactive || dragging) return
    const piece = chess.get(sq as Square)

    if (selected) {
      if (legalDests.has(sq)) {
        attemptMove(selected, sq)
      } else if (piece && piece.color === turn) {
        setSelected(sq)
        setLegalDests(getLegal(sq))
      } else {
        setSelected(null)
        setLegalDests(new Set())
      }
    } else if (piece && piece.color === turn) {
      setSelected(sq)
      setLegalDests(getLegal(sq))
    }
  }

  function handlePointerDown(e: React.PointerEvent, sq: string) {
    if (!interactive) return
    const piece = chess.get(sq as Square)
    if (!piece || piece.color !== turn) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setDragFrom(sq)
    setDragPos({ x: e.clientX, y: e.clientY })
    setSelected(sq)
    setLegalDests(getLegal(sq))
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragging) setDragPos({ x: e.clientX, y: e.clientY })
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging || !dragFrom) return
    const rect = boardRef.current?.getBoundingClientRect()
    if (rect) {
      const sq = posToSquare(e.clientX, e.clientY, rect)
      if (sq && legalDests.has(sq) && sq !== dragFrom) {
        attemptMove(dragFrom, sq)
      }
    }
    setDragging(false)
    setDragFrom(null)
    setDragPos(null)
  }

  function posToSquare(cx: number, cy: number, rect: DOMRect): string | null {
    const size = rect.width / 8
    const fi = Math.max(0, Math.min(7, Math.floor((cx - rect.left) / size)))
    const ri = Math.max(0, Math.min(7, Math.floor((cy - rect.top) / size)))
    const file = orientation === 'white' ? FILES[fi] : FILES[7 - fi]
    const rank = orientation === 'white' ? RANKS[ri] : RANKS[7 - ri]
    return file + rank
  }

  const squares = useMemo(() => {
    const list: string[] = []
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const file = orientation === 'white' ? FILES[f] : FILES[7 - f]
        const rank = orientation === 'white' ? RANKS[r] : RANKS[7 - r]
        list.push(file + rank)
      }
    }
    return list
  }, [orientation])

  const dragPiece = dragging && dragFrom ? chess.get(dragFrom as Square) : null

  return (
    <div className="relative select-none w-full" style={{ aspectRatio: '1' }}>
      {/* Board */}
      <div
        ref={boardRef}
        className="grid grid-cols-8 w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {squares.map((sq, idx) => {
          const r = Math.floor(idx / 8)
          const f = idx % 8
          const isEdgeFile = f === 0
          const isEdgeRank = r === 7
          const isTopFile = f === 7
          const isTopRank = r === 0
          const light = isLightSquare(sq)
          const bg = light ? lightSquareColor : darkSquareColor
          const labelColor = light ? darkSquareColor : lightSquareColor
          const piece = chess.get(sq as Square)
          const isSelected = selected === sq
          const isDest = legalDests.has(sq)
          const isLastFrom = lastMove?.from === sq
          const isLastTo = lastMove?.to === sq
          const isDragging = dragging && dragFrom === sq

          return (
            <div
              key={sq}
              className="relative flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: bg, aspectRatio: '1' }}
              onClick={() => handleSquareClick(sq)}
              onPointerDown={piece ? (e) => handlePointerDown(e, sq) : undefined}
              aria-label={`${sq}${piece ? `, ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
            >
              {/* Last move tint */}
              {(isLastFrom || isLastTo) && (
                <div className="absolute inset-0 bg-yellow-300/40 pointer-events-none" />
              )}
              {/* Selection ring */}
              {isSelected && (
                <div className="absolute inset-0 ring-4 ring-inset ring-green-500/70 pointer-events-none z-10" />
              )}
              {/* Legal destination dots/rings */}
              {isDest && !piece && (
                <div className="absolute w-[33%] h-[33%] rounded-full bg-black/20 pointer-events-none z-10" />
              )}
              {isDest && piece && (
                <div className="absolute inset-0 ring-4 ring-inset ring-black/30 rounded-sm pointer-events-none z-10" />
              )}
              {/* Piece (hidden while dragging) */}
              {piece && !isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Piece type={piece.type} color={piece.color} />
                </div>
              )}
              {/* Rank label on left AND right edges */}
              {(isEdgeFile || isTopFile) && (
                <span
                  className="absolute top-0.5 left-0.5 text-[0.6rem] font-bold leading-none pointer-events-none z-20"
                  style={{ color: labelColor }}
                >
                  {sq[1]}
                </span>
              )}
              {/* File label on bottom AND top edges */}
              {(isEdgeRank || isTopRank) && (
                <span
                  className="absolute bottom-0.5 right-0.5 text-[0.6rem] font-bold leading-none pointer-events-none z-20"
                  style={{ color: labelColor }}
                >
                  {sq[0]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Floating drag piece */}
      {dragging && dragPiece && dragPos && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: dragPos.x - 28, top: dragPos.y - 28 }}
        >
          <div style={{ transform: 'scale(1.25)' }}>
            <Piece type={dragPiece.type} color={dragPiece.color} />
          </div>
        </div>
      )}

      {/* Promotion picker */}
      {pendingPromotion && (
        <PromotionPicker
          color={turn}
          onSelect={(piece) => {
            onMove(pendingPromotion.from, pendingPromotion.to, piece)
            setPendingPromotion(null)
          }}
          onCancel={() => setPendingPromotion(null)}
        />
      )}
    </div>
  )
}

import { useState, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'

export type GameStatus =
  | 'idle'
  | 'playing'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'flagged'
  | 'resigned'

export interface GameResult {
  status: GameStatus
  winner: 'w' | 'b' | null
  reason: string
}

export function useGameState(startFen?: string) {
  const chessRef = useRef(new Chess(startFen))
  const [fen, setFen] = useState(chessRef.current.fen())
  const [result, setResult] = useState<GameResult | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | undefined>()

  const applyMove = useCallback(
    (from: string, to: string, promotion = 'q'): boolean => {
      const chess = chessRef.current
      try {
        const move = chess.move({ from, to, promotion })
        if (!move) return false
        setFen(chess.fen())
        setLastMove({ from, to })

        if (chess.isCheckmate()) {
          const loser = chess.turn() as 'w' | 'b'
          setResult({ status: 'checkmate', winner: loser === 'w' ? 'b' : 'w', reason: 'checkmate' })
        } else if (chess.isStalemate()) {
          setResult({ status: 'stalemate', winner: null, reason: 'stalemate' })
        } else if (chess.isDraw()) {
          const reason = chess.isThreefoldRepetition()
            ? 'threefold repetition'
            : chess.isInsufficientMaterial()
              ? 'insufficient material'
              : '50-move rule'
          setResult({ status: 'draw', winner: null, reason })
        }
        return true
      } catch {
        return false
      }
    },
    [],
  )

  const resign = useCallback((side: 'w' | 'b') => {
    setResult({ status: 'resigned', winner: side === 'w' ? 'b' : 'w', reason: 'resignation' })
  }, [])

  const flag = useCallback((side: 'w' | 'b') => {
    setResult({ status: 'flagged', winner: side === 'w' ? 'b' : 'w', reason: 'time' })
  }, [])

  const reset = useCallback((newFen?: string) => {
    chessRef.current = new Chess(newFen)
    setFen(chessRef.current.fen())
    setResult(null)
    setLastMove(undefined)
  }, [])

  const turn = () => chessRef.current.turn() as 'w' | 'b'
  const pgn = () => chessRef.current.pgn()
  const history = () => chessRef.current.history({ verbose: true })
  const isOver = () => result !== null

  return { fen, result, lastMove, applyMove, resign, flag, reset, turn, pgn, history, isOver }
}

import type { GameResult } from '../../hooks/useGameState'

interface PostGameModalProps {
  result: GameResult
  playerColor: 'w' | 'b'
  pgn: string
  isTimed: boolean
  onAnalyze: () => void
  onPlayAgain: () => void
  onHome: () => void
  onSave?: () => void
}

export default function PostGameModal({
  result,
  playerColor,
  pgn,
  isTimed,
  onAnalyze,
  onPlayAgain,
  onHome,
  onSave,
}: PostGameModalProps) {
  const won = result.winner === playerColor
  const draw = result.winner === null

  const headline = draw
    ? 'Draw!'
    : won
      ? 'You win!'
      : 'You lose.'

  const sub = result.reason.charAt(0).toUpperCase() + result.reason.slice(1)

  function exportPgn() {
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'game.pgn'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60">
      <div className="bg-[#16213e] rounded-2xl p-8 w-80 shadow-2xl border border-[#2d3561] text-center">
        <div className="text-5xl mb-2">{draw ? '🤝' : won ? '🏆' : '😔'}</div>
        <h2 className="text-2xl font-bold text-white mb-1">{headline}</h2>
        <p className="text-[#8892b0] text-sm mb-6">{sub}</p>

        <div className="space-y-2">
          <button
            onClick={onAnalyze}
            className="w-full bg-[#6c63ff] hover:bg-[#5a52d5] text-white font-semibold rounded-lg py-2 transition-colors"
          >
            Analyze Game
          </button>
          <button
            onClick={exportPgn}
            className="w-full bg-[#2d3561] hover:bg-[#3d4571] text-white rounded-lg py-2 transition-colors"
          >
            Export PGN
          </button>
          {!isTimed && onSave && (
            <button
              onClick={onSave}
              className="w-full bg-[#2d3561] hover:bg-[#3d4571] text-white rounded-lg py-2 transition-colors"
            >
              Save Game
            </button>
          )}
          <button
            onClick={onPlayAgain}
            className="w-full bg-[#2d3561] hover:bg-[#3d4571] text-white rounded-lg py-2 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onHome}
            className="w-full text-[#8892b0] hover:text-white text-sm py-1 transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

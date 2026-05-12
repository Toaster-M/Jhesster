import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ChessBoard from '../components/chess/ChessBoard'
import PlayerClock from '../components/chess/PlayerClock'
import MoveHistory from '../components/chess/MoveHistory'
import PostGameModal from '../components/chess/PostGameModal'
import { useGameState } from '../hooks/useGameState'
import { useStockfish } from '../hooks/useStockfish'
import { useTimer, TIME_CONTROLS } from '../hooks/useTimer'
import { useAuthStore } from '../stores/useAuthStore'
import { apiRequest } from '../lib/api'

const DIFFICULTY = [
  { label: 'Easy', skill: 3, depth: 6 },
  { label: 'Medium', skill: 10, depth: 12 },
  { label: 'Hard', skill: 20, depth: 18 },
]

const TIME_KEYS = Object.keys(TIME_CONTROLS)

export default function VsAIPage() {
  const navigate = useNavigate()
  const { user, token } = useAuthStore()

  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [diffIdx, setDiffIdx] = useState(1)
  const [timeKey, setTimeKey] = useState('unlimited')
  const [started, setStarted] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const game = useGameState()
  const sf = useStockfish()

  const tc = TIME_CONTROLS[timeKey]
  const timer = useTimer(tc.seconds, tc.increment)
  const isTimed = tc.seconds > 0

  const aiColorRef = useRef<'w' | 'b'>('b')
  aiColorRef.current = playerColor === 'w' ? 'b' : 'w'

  const diff = DIFFICULTY[diffIdx]

  const triggerAI = useCallback(
    async (fen: string) => {
      setAiThinking(true)
      try {
        const uci = await sf.getBestMove(fen, diff.skill, diff.depth)
        if (!uci || uci === '(none)') return
        const from = uci.slice(0, 2)
        const to = uci.slice(2, 4)
        const promo = uci[4] ?? undefined
        game.applyMove(from, to, promo)
        timer.switch(aiColorRef.current)
      } finally {
        setAiThinking(false)
      }
    },
    [sf, diff, game, timer],
  )

  // After each move, check if AI should respond
  useEffect(() => {
    if (!started || game.isOver() || aiThinking) return
    if (game.turn() === aiColorRef.current) {
      triggerAI(game.fen)
    }
  }, [game.fen, started]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timer flag
  useEffect(() => {
    if (timer.times.flagged && !game.isOver()) {
      game.flag(timer.times.flagged)
    }
  }, [timer.times.flagged]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStart() {
    game.reset()
    timer.reset()
    setStarted(true)
    setSaveMsg(null)
    if (playerColor === 'b') {
      // AI goes first
      setTimeout(() => triggerAI(game.fen), 300)
    } else {
      timer.start('w')
    }
  }

  function handleMove(from: string, to: string, promotion?: string) {
    if (!started || game.isOver() || game.turn() !== playerColor) return
    const ok = game.applyMove(from, to, promotion ?? 'q')
    if (!ok) return
    if (isTimed) timer.switch(playerColor)
  }

  async function handleSave() {
    if (!token) return
    try {
      await apiRequest('/api/games/save', {
        method: 'POST',
        body: JSON.stringify({ mode: 'vs_ai', pgn: game.pgn(), fen: game.fen }),
      }, token)
      setSaveMsg('Game saved!')
    } catch {
      setSaveMsg('Failed to save.')
    }
  }

  function handleDiffChange(idx: number) {
    setDiffIdx(idx)
    if (started && !game.isOver()) {
      game.reset()
      timer.reset()
      setStarted(false)
    }
  }

  const lightColor = user?.boardLightColor ?? '#F0D9B5'
  const darkColor = user?.boardDarkColor ?? '#B58863'
  const moves = game.history()

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[#16213e] border-b border-[#2d3561]">
        <button onClick={() => navigate('/')} className="text-[#8892b0] hover:text-white text-sm transition-colors">
          ← Home
        </button>
        <h1 className="text-white font-semibold">Play vs AI</h1>
        <div className="ml-auto flex items-center gap-2">
          {DIFFICULTY.map((d, i) => (
            <button
              key={d.label}
              onClick={() => handleDiffChange(i)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                diffIdx === i ? 'bg-[#6c63ff] text-white' : 'bg-[#2d3561] text-[#8892b0] hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row gap-4 p-4 max-w-5xl mx-auto w-full">
        {/* Board area */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Opponent clock */}
          {isTimed && (
            <PlayerClock
              seconds={playerColor === 'w' ? timer.times.black : timer.times.white}
              active={timer.active === (playerColor === 'w' ? 'b' : 'w')}
              label={`AI (${playerColor === 'w' ? 'Black' : 'White'})`}
            />
          )}

          {/* Board */}
          <div className="relative">
            <ChessBoard
              fen={game.fen}
              onMove={handleMove}
              orientation={playerColor === 'w' ? 'white' : 'black'}
              interactive={started && !game.isOver() && !aiThinking && game.turn() === playerColor}
              lastMove={game.lastMove}
              lightSquareColor={lightColor}
              darkSquareColor={darkColor}
            />
            {aiThinking && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-[#8892b0] bg-[#1a1a2e]/80 px-3 py-1 rounded-full">
                AI thinking…
              </div>
            )}
            {game.result && (
              <PostGameModal
                result={game.result}
                playerColor={playerColor}
                pgn={game.pgn()}
                isTimed={isTimed}
                onAnalyze={() => navigate('/')}
                onPlayAgain={() => { setStarted(false); game.reset(); timer.reset() }}
                onHome={() => navigate('/')}
                onSave={token ? handleSave : undefined}
              />
            )}
          </div>

          {/* Player clock */}
          {isTimed && (
            <PlayerClock
              seconds={playerColor === 'w' ? timer.times.white : timer.times.black}
              active={timer.active === playerColor}
              label={`You (${playerColor === 'w' ? 'White' : 'Black'})`}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-56 flex flex-col gap-3">
          {!started ? (
            <div className="bg-[#16213e] rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-[#8892b0] mb-1">Play as</p>
                <div className="flex gap-2">
                  {(['w', 'b', 'r'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setPlayerColor(c === 'r' ? (Math.random() > 0.5 ? 'w' : 'b') : c)}
                      className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
                        (c === 'r' ? false : playerColor === c)
                          ? 'bg-[#6c63ff] text-white'
                          : 'bg-[#2d3561] text-[#8892b0] hover:text-white'
                      }`}
                    >
                      {c === 'w' ? 'White' : c === 'b' ? 'Black' : 'Random'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#8892b0] mb-1">Time control</p>
                <select
                  value={timeKey}
                  onChange={(e) => setTimeKey(e.target.value)}
                  className="w-full bg-[#0f0f23] text-white text-sm rounded-lg px-2 py-1.5 border border-[#2d3561] focus:outline-none"
                >
                  {TIME_KEYS.map((k) => (
                    <option key={k} value={k}>{TIME_CONTROLS[k].label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStart}
                className="w-full bg-[#6c63ff] hover:bg-[#5a52d5] text-white font-semibold rounded-lg py-2 transition-colors"
              >
                Start Game
              </button>
            </div>
          ) : (
            <div className="bg-[#16213e] rounded-xl p-3 space-y-2">
              <p className="text-xs text-[#8892b0]">
                {game.isOver() ? 'Game over' : `${game.turn() === playerColor ? 'Your' : "AI's"} turn`}
              </p>
              {!game.isOver() && (
                <button
                  onClick={() => game.resign(playerColor)}
                  className="w-full text-xs bg-[#2d3561] hover:bg-red-600/30 text-[#8892b0] hover:text-red-400 rounded-lg py-1.5 transition-colors"
                >
                  Resign
                </button>
              )}
              {saveMsg && <p className="text-xs text-green-400">{saveMsg}</p>}
            </div>
          )}

          <MoveHistory moves={moves} />

          {started && !game.isOver() && !isTimed && (
            <button
              onClick={handleSave}
              disabled={!token}
              className="text-xs bg-[#2d3561] hover:bg-[#3d4571] disabled:opacity-40 text-white rounded-lg py-2 transition-colors"
            >
              {token ? 'Save Game' : 'Login to save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

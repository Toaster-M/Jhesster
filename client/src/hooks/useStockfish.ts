import { useEffect, useRef, useCallback } from 'react'

type StockfishCallback = (bestMove: string) => void
type EvalCallback = (cp: number, depth: number) => void

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const moveCallbackRef = useRef<StockfishCallback | null>(null)
  const evalCallbackRef = useRef<EvalCallback | null>(null)

  useEffect(() => {
    const worker = new Worker(import.meta.env.BASE_URL + 'stockfish-18-lite.js')
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<string>) => {
      const line = e.data
      // Parse bestmove
      const bmMatch = line.match(/^bestmove\s+(\S+)/)
      if (bmMatch && moveCallbackRef.current) {
        moveCallbackRef.current(bmMatch[1])
      }
      // Parse eval
      const infoMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+).*\bdepth\s+(\d+)/)
      if (infoMatch && evalCallbackRef.current) {
        const type = infoMatch[1]
        const val = parseInt(infoMatch[2])
        const depth = parseInt(infoMatch[3])
        const cp = type === 'mate' ? (val > 0 ? 10000 : -10000) : val
        evalCallbackRef.current(cp, depth)
      }
    }

    worker.postMessage('uci')
    worker.postMessage('isready')

    return () => {
      worker.postMessage('quit')
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const setSkillLevel = useCallback((level: number) => {
    const w = workerRef.current
    if (!w) return
    w.postMessage(`setoption name Skill Level value ${level}`)
  }, [])

  const getBestMove = useCallback(
    (fen: string, skillLevel: number, depth = 12): Promise<string> => {
      return new Promise((resolve) => {
        const w = workerRef.current
        if (!w) { resolve(''); return }
        moveCallbackRef.current = (move) => {
          moveCallbackRef.current = null
          resolve(move)
        }
        w.postMessage('ucinewgame')
        w.postMessage(`setoption name Skill Level value ${skillLevel}`)
        w.postMessage(`position fen ${fen}`)
        w.postMessage(`go depth ${depth}`)
      })
    },
    [],
  )

  const evaluate = useCallback(
    (fen: string, depth = 18): Promise<number> => {
      return new Promise((resolve) => {
        const w = workerRef.current
        if (!w) { resolve(0); return }
        let lastCp = 0
        evalCallbackRef.current = (cp, d) => {
          lastCp = cp
          if (d >= depth) {
            evalCallbackRef.current = null
            moveCallbackRef.current = () => { moveCallbackRef.current = null }
            resolve(lastCp)
          }
        }
        w.postMessage(`position fen ${fen}`)
        w.postMessage(`go depth ${depth}`)
      })
    },
    [],
  )

  const stop = useCallback(() => {
    workerRef.current?.postMessage('stop')
  }, [])

  return { getBestMove, evaluate, setSkillLevel, stop }
}

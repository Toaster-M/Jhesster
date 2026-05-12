import { useEffect, useRef, useCallback } from 'react'

type StockfishCallback = (bestMove: string) => void
type EvalCallback = (cp: number, depth: number) => void

interface StockfishWorkerMessage {
  data: string
}

function handleMessage(
  line: string,
  moveCallbackRef: React.RefObject<StockfishCallback | null>,
  evalCallbackRef: React.RefObject<EvalCallback | null>,
) {
  const bestmoveMatch = line.match(/^bestmove\s+(\S+)/)
  if (bestmoveMatch && moveCallbackRef.current) {
    moveCallbackRef.current(bestmoveMatch[1])
  }

  const infoMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+).*\bdepth\s+(\d+)/)
  if (infoMatch && evalCallbackRef.current) {
    const scoreType = infoMatch[1]
    const scoreValue = parseInt(infoMatch[2])
    const depth = parseInt(infoMatch[3])
    const centipawns =
      scoreType === 'mate' ? (scoreValue > 0 ? 10000 : -10000) : scoreValue
    evalCallbackRef.current(centipawns, depth)
  }
}

// Returns a ready Worker, or null if the source fails (bad fetch, WASM error, timeout).
function trySource(
  source: string,
  moveCallbackRef: React.RefObject<StockfishCallback | null>,
  evalCallbackRef: React.RefObject<EvalCallback | null>,
): Promise<Worker | null> {
  return new Promise((resolve) => {
    // 15 s to receive readyok — covers WASM download on slow connections
    const timeout = setTimeout(() => {
      worker.terminate()
      resolve(null)
    }, 15000)

    const worker = new Worker(source, { type: 'classic' })
    let ready = false

    worker.onmessage = (event: StockfishWorkerMessage) => {
      const line = event.data

      if (!ready && line === 'readyok') {
        ready = true
        clearTimeout(timeout)
        // Switch to game message handler and hand the worker back
        worker.onmessage = (e: StockfishWorkerMessage) =>
          handleMessage(e.data, moveCallbackRef, evalCallbackRef)
        worker.onerror = (err: ErrorEvent) => console.error('Stockfish worker error:', err)
        resolve(worker)
        return
      }
    }

    worker.onerror = () => {
      clearTimeout(timeout)
      worker.terminate()
      resolve(null)
    }

    worker.postMessage('uci')
    worker.postMessage('isready')
  })
}

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const moveCallbackRef = useRef<StockfishCallback | null>(null)
  const evalCallbackRef = useRef<EvalCallback | null>(null)
  const initPromiseRef = useRef<Promise<void>>(new Promise(() => {}))

  useEffect(() => {
    let isMounted = true
    let resolveInit!: () => void
    let rejectInit!: (err: unknown) => void

    initPromiseRef.current = new Promise<void>((res, rej) => {
      resolveInit = res
      rejectInit = rej
    })

    const initializeWorker = async () => {
      const base = import.meta.env.BASE_URL ?? '/'
      const sources = [
        `${base}stockfish-18-lite.js`,
        'https://cdn.jsdelivr.net/npm/stockfish@16/dist/stockfish.js',
      ]

      for (const source of sources) {
        if (!isMounted) return

        // Verify the source file exists before creating a Worker
        try {
          const res = await fetch(source, { method: 'HEAD' })
          if (!res.ok && res.status !== 405) {
            console.debug(`Stockfish source not available: ${source}`)
            continue
          }
        } catch {
          console.debug(`Stockfish source unreachable: ${source}`)
          continue
        }

        if (!isMounted) return

        const worker = await trySource(source, moveCallbackRef, evalCallbackRef)

        if (!worker) {
          console.debug(`Stockfish failed to initialise from: ${source}`)
          continue
        }

        if (!isMounted) {
          worker.terminate()
          return
        }

        workerRef.current = worker
        console.log(`Stockfish ready from: ${source}`)
        resolveInit()
        return
      }

      if (isMounted) {
        console.error('Stockfish: all sources failed')
        rejectInit(new Error('All Stockfish sources failed'))
      }
    }

    initializeWorker()

    return () => {
      isMounted = false
      const worker = workerRef.current
      if (worker) {
        try {
          worker.postMessage('quit')
          worker.terminate()
        } catch {
          // ignore
        }
      }
      workerRef.current = null
    }
  }, [])

  const setSkillLevel = useCallback((level: number) => {
    workerRef.current?.postMessage(
      `setoption name Skill Level value ${Math.max(0, Math.min(20, level))}`,
    )
  }, [])

  const getBestMove = useCallback(
    async (fen: string, skillLevel: number, depth = 12): Promise<string> => {
      try {
        await initPromiseRef.current
      } catch {
        return '(none)'
      }

      const worker = workerRef.current
      if (!worker) return '(none)'

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          moveCallbackRef.current = null
          console.warn('Stockfish timeout — no move returned')
          resolve('(none)')
        }, 45000)

        moveCallbackRef.current = (move: string) => {
          clearTimeout(timeout)
          moveCallbackRef.current = null
          resolve(move)
        }

        try {
          worker.postMessage('ucinewgame')
          worker.postMessage(
            `setoption name Skill Level value ${Math.max(0, Math.min(20, skillLevel))}`,
          )
          worker.postMessage(`position fen ${fen}`)
          worker.postMessage(`go depth ${depth}`)
        } catch (err) {
          clearTimeout(timeout)
          console.error('Error sending message to Stockfish:', err)
          resolve('(none)')
        }
      })
    },
    [],
  )

  const evaluate = useCallback(
    async (fen: string, depth = 18): Promise<number> => {
      try {
        await initPromiseRef.current
      } catch {
        return 0
      }

      const worker = workerRef.current
      if (!worker) return 0

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          evalCallbackRef.current = null
          resolve(0)
        }, 45000)

        let lastCp = 0
        evalCallbackRef.current = (cp: number, d: number) => {
          lastCp = cp
          if (d >= depth) {
            clearTimeout(timeout)
            evalCallbackRef.current = null
            moveCallbackRef.current = () => {
              moveCallbackRef.current = null
            }
            resolve(lastCp)
          }
        }

        try {
          worker.postMessage(`position fen ${fen}`)
          worker.postMessage(`go depth ${depth}`)
        } catch (err) {
          clearTimeout(timeout)
          console.error('Error evaluating position:', err)
          resolve(0)
        }
      })
    },
    [],
  )

  const stop = useCallback(() => {
    try {
      workerRef.current?.postMessage('stop')
    } catch {
      // ignore
    }
  }, [])

  return { getBestMove, evaluate, setSkillLevel, stop }
}

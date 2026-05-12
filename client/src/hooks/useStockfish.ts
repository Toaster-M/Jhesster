import { useEffect, useRef, useCallback } from 'react'

type StockfishCallback = (bestMove: string) => void
type EvalCallback = (cp: number, depth: number) => void

interface StockfishWorkerMessage {
  data: string
}

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const moveCallbackRef = useRef<StockfishCallback | null>(null)
  const evalCallbackRef = useRef<EvalCallback | null>(null)
  // Starts as a never-resolving promise; replaced in the effect with the real init promise
  const initPromiseRef = useRef<Promise<void>>(new Promise(() => {}))

  useEffect(() => {
    let isMounted = true
    let currentWorker: Worker | null = null
    let resolveInit!: () => void
    let rejectInit!: (err: unknown) => void

    initPromiseRef.current = new Promise<void>((res, rej) => {
      resolveInit = res
      rejectInit = rej
    })

    const initializeWorker = async () => {
      try {
        const base = import.meta.env.BASE_URL ?? '/'
        const sources = [
          // Local file in public/ — always present, no network needed
          `${base}stockfish-18-lite.js`,
          // CDN fallback (older but reliable single-file build)
          'https://cdn.jsdelivr.net/npm/stockfish@16/dist/stockfish.js',
        ]

        let lastError: Error | null = null

        for (const source of sources) {
          try {
            const response = await fetch(source, { method: 'HEAD' })
            if (response.ok || response.status === 405) {
              if (isMounted) {
                currentWorker = new Worker(source, { type: 'classic' })
                workerRef.current = currentWorker

                currentWorker.onmessage = (event: StockfishWorkerMessage) => {
                  const line = event.data

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
                      scoreType === 'mate'
                        ? scoreValue > 0
                          ? 10000
                          : -10000
                        : scoreValue
                    evalCallbackRef.current(centipawns, depth)
                  }
                }

                currentWorker.onerror = (err: ErrorEvent) => {
                  console.error('Stockfish worker error:', err)
                }

                currentWorker.postMessage('uci')
                currentWorker.postMessage('isready')

                console.log(`Stockfish loaded from: ${source}`)
                resolveInit()
                return
              }
            }
          } catch (err) {
            lastError = err as Error
            console.debug(`Failed to load Stockfish from ${source}:`, err)
            continue
          }
        }

        if (isMounted) {
          console.error('Failed to load Stockfish from any source:', lastError)
          rejectInit(lastError ?? new Error('All Stockfish sources failed'))
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fatal error initializing Stockfish:', err)
          rejectInit(err)
        }
      }
    }

    initializeWorker()

    return () => {
      isMounted = false
      if (currentWorker) {
        try {
          currentWorker.postMessage('quit')
          currentWorker.terminate()
        } catch (err) {
          console.debug('Error terminating worker:', err)
        }
      }
      workerRef.current = null
    }
  }, [])

  const setSkillLevel = useCallback((level: number) => {
    const worker = workerRef.current
    if (!worker) return
    worker.postMessage(`setoption name Skill Level value ${Math.max(0, Math.min(20, level))}`)
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
          console.warn('Stockfish timeout - no move returned')
          resolve('(none)')
        }, 45000)

        moveCallbackRef.current = (move: string) => {
          clearTimeout(timeout)
          moveCallbackRef.current = null
          resolve(move)
        }

        try {
          worker.postMessage('ucinewgame')
          worker.postMessage(`setoption name Skill Level value ${Math.max(0, Math.min(20, skillLevel))}`)
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
    const worker = workerRef.current
    if (worker) {
      try {
        worker.postMessage('stop')
      } catch (err) {
        console.debug('Error stopping worker:', err)
      }
    }
  }, [])

  return { getBestMove, evaluate, setSkillLevel, stop }
}

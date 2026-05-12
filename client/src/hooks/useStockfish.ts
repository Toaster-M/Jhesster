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
  const initPromiseRef = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let isMounted = true
    let currentWorker: Worker | null = null

    const initializeWorker = async () => {
      try {
        // Try multiple sources for Stockfish
        const sources = [
          // CDN sources (most reliable)
          'https://cdn.jsdelivr.net/npm/stockfish@18.0.7/dist/stockfish.wasm.js',
          'https://unpkg.com/stockfish@18.0.7/dist/stockfish.wasm.js',
          // Local sources (if included in public)
          '/stockfish.wasm.js',
          '/stockfish-18.wasm.js',
          // Fallback to older lite version
          'https://cdn.jsdelivr.net/npm/stockfish@16/dist/stockfish.js',
        ]

        let lastError: Error | null = null

        for (const source of sources) {
          try {
            // First, try to fetch the source to verify it exists
            const response = await fetch(source, { method: 'HEAD' })
            if (response.ok || response.status === 405) {
              // 405 is OK for HEAD requests, means file exists
              if (isMounted) {
                currentWorker = new Worker(source, { type: 'classic' })
                workerRef.current = currentWorker

                currentWorker.onmessage = (event: StockfishWorkerMessage) => {
                  const line = event.data

                  // Parse bestmove response
                  const bestmoveMatch = line.match(/^bestmove\s+(\S+)/)
                  if (bestmoveMatch && moveCallbackRef.current) {
                    moveCallbackRef.current(bestmoveMatch[1])
                  }

                  // Parse evaluation scores
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

                // Initialize UCI interface
                currentWorker.postMessage('uci')
                currentWorker.postMessage('isready')

                console.log(`Successfully loaded Stockfish from: ${source}`)
                return
              }
            }
          } catch (err) {
            lastError = err as Error
            console.debug(`Failed to load from ${source}:`, err)
            continue
          }
        }

        if (isMounted) {
          console.error('Failed to load Stockfish from any source:', lastError)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fatal error initializing Stockfish:', err)
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
    if (!worker) {
      console.warn('Stockfish worker not initialized')
      return
    }
    worker.postMessage(`setoption name Skill Level value ${Math.max(0, Math.min(20, level))}`)
  }, [])

  const getBestMove = useCallback(
    (fen: string, skillLevel: number, depth = 12): Promise<string> => {
      return new Promise((resolve) => {
        const worker = workerRef.current

        if (!worker) {
          console.error('Stockfish worker not initialized')
          resolve('(none)')
          return
        }

        // Timeout to prevent infinite waiting
        const timeout = setTimeout(() => {
          moveCallbackRef.current = null
          console.warn('Stockfish timeout - no move returned')
          resolve('(none)')
        }, 45000) // 45 second timeout for very deep searches

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
    (fen: string, depth = 18): Promise<number> => {
      return new Promise((resolve) => {
        const worker = workerRef.current

        if (!worker) {
          resolve(0)
          return
        }

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

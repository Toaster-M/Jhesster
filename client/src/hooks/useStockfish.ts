import { useEffect, useRef, useCallback } from 'react'

type StockfishCallback = (bestMove: string) => void
type EvalCallback = (cp: number, depth: number) => void

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const moveCallbackRef = useRef<StockfishCallback | null>(null)
  const evalCallbackRef = useRef<EvalCallback | null>(null)
  const isReadyRef = useRef(false)
  const readyPromiseRef = useRef<Promise<void>>(new Promise(() => {}))

  useEffect(() => {
    // Try to load Stockfish from different possible locations
    const stockfishUrls = [
      import.meta.env.BASE_URL + 'stockfish-18-lite.js',
      'stockfish-18-lite.js',
      '/stockfish-18-lite.js',
      'https://cdn.jsdelivr.net/npm/stockfish@18.0.7/dist/stockfish-18-lite.js'
    ]

    let worker: Worker | null = null
    let currentUrlIndex = 0

    const initWorker = () => {
      try {
        const url = stockfishUrls[currentUrlIndex]
        worker = new Worker(url)
        workerRef.current = worker

        worker.onmessage = (e: MessageEvent<string>) => {
          const line = e.data
          
          // Check for readyok
          if (line === 'readyok') {
            isReadyRef.current = true
          }

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

        worker.onerror = (err) => {
          console.error('Stockfish worker error:', err)
          worker?.terminate()
          currentUrlIndex++
          if (currentUrlIndex < stockfishUrls.length) {
            setTimeout(initWorker, 100)
          } else {
            console.error('Failed to load Stockfish from all URLs')
          }
        }

        worker.postMessage('uci')
        worker.postMessage('isready')
      } catch (err) {
        console.error('Failed to create worker:', err)
        currentUrlIndex++
        if (currentUrlIndex < stockfishUrls.length) {
          setTimeout(initWorker, 100)
        }
      }
    }

    initWorker()

    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.postMessage('quit')
          workerRef.current.terminate()
        } catch (err) {
          console.error('Error terminating worker:', err)
        }
        workerRef.current = null
      }
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
        if (!w) {
          console.error('Stockfish worker not initialized')
          resolve('(none)')
          return
        }

        // Set a timeout to avoid hanging forever
        const timeout = setTimeout(() => {
          moveCallbackRef.current = null
          console.error('Stockfish getBestMove timeout')
          resolve('(none)')
        }, 30000) // 30 second timeout

        moveCallbackRef.current = (move) => {
          clearTimeout(timeout)
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
        if (!w) {
          resolve(0)
          return
        }

        const timeout = setTimeout(() => {
          evalCallbackRef.current = null
          resolve(0)
        }, 30000)

        let lastCp = 0
        evalCallbackRef.current = (cp, d) => {
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

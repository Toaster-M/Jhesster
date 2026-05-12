import { useState, useRef, useCallback, useEffect } from 'react'

export const TIME_CONTROLS: Record<string, { label: string; seconds: number; increment: number }> = {
  unlimited: { label: 'Unlimited', seconds: 0, increment: 0 },
  '1+0': { label: '1 min', seconds: 60, increment: 0 },
  '3+0': { label: '3 min', seconds: 180, increment: 0 },
  '5+0': { label: '5 min', seconds: 300, increment: 0 },
  '10+0': { label: '10 min', seconds: 600, increment: 0 },
  '30+0': { label: '30 min', seconds: 1800, increment: 0 },
}

export interface TimerState {
  white: number
  black: number
  flagged: 'w' | 'b' | null
}

export function useTimer(initialSeconds: number, increment: number) {
  const [times, setTimes] = useState<TimerState>({
    white: initialSeconds,
    black: initialSeconds,
    flagged: null,
  })
  const [active, setActive] = useState<'w' | 'b' | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (!active || initialSeconds === 0) return
    clearTick()
    intervalRef.current = setInterval(() => {
      setTimes((prev) => {
        if (prev.flagged) return prev
        const key = active === 'w' ? 'white' : 'black'
        const next = prev[key] - 1
        if (next <= 0) {
          clearTick()
          return { ...prev, [key]: 0, flagged: active }
        }
        return { ...prev, [key]: next }
      })
    }, 1000)
    return clearTick
  }, [active, initialSeconds])

  const start = useCallback(
    (side: 'w' | 'b') => {
      if (initialSeconds === 0) return
      setActive(side)
    },
    [initialSeconds],
  )

  const switch_ = useCallback(
    (prevSide: 'w' | 'b') => {
      if (initialSeconds === 0) return
      if (increment > 0) {
        setTimes((prev) => {
          const key = prevSide === 'w' ? 'white' : 'black'
          return { ...prev, [key]: prev[key] + increment }
        })
      }
      setActive(prevSide === 'w' ? 'b' : 'w')
    },
    [initialSeconds, increment],
  )

  const pause = useCallback(() => {
    clearTick()
    setActive(null)
  }, [])

  const reset = useCallback(() => {
    clearTick()
    setActive(null)
    setTimes({ white: initialSeconds, black: initialSeconds, flagged: null })
  }, [initialSeconds])

  return { times, active, start, switch: switch_, pause, reset }
}

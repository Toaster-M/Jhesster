import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TimeControl {
  label:       string;
  initialMs:   number;
  incrementMs: number;
}

export const TIME_CONTROLS: Array<TimeControl | null> = [
  null,
  { label: '1+0',   initialMs:    60_000, incrementMs:      0 },
  { label: '2+1',   initialMs:   120_000, incrementMs:  1_000 },
  { label: '3+2',   initialMs:   180_000, incrementMs:  2_000 },
  { label: '5+0',   initialMs:   300_000, incrementMs:      0 },
  { label: '10+0',  initialMs:   600_000, incrementMs:      0 },
  { label: '15+10', initialMs:   900_000, incrementMs: 10_000 },
  { label: '30+0',  initialMs: 1_800_000, incrementMs:      0 },
];

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseTimerOptions {
  timeControl: TimeControl | null;
  onFlag: (color: 'w' | 'b') => void;
}

export function useTimer({ timeControl, onFlag }: UseTimerOptions) {
  const initialMs    = timeControl?.initialMs   ?? 0;
  const incrementMs  = timeControl?.incrementMs ?? 0;
  const enabled      = timeControl !== null;

  const [whiteMs, setWhiteMs] = useState(initialMs);
  const [blackMs, setBlackMs] = useState(initialMs);
  const [active, setActive]   = useState<'w' | 'b' | null>(null);

  const activeRef   = useRef<'w' | 'b' | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const flaggedRef  = useRef(false);
  const onFlagRef   = useRef(onFlag);
  onFlagRef.current = onFlag;

  // Keep activeRef in sync for use inside the interval closure
  useEffect(() => { activeRef.current = active; }, [active]);

  // Countdown interval — restarts whenever `active` changes
  useEffect(() => {
    if (!enabled || active === null) return;

    lastTickRef.current = Date.now();

    const id = setInterval(() => {
      if (flaggedRef.current) return;

      const now     = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      const cur = activeRef.current;

      if (cur === 'w') {
        setWhiteMs((prev) => {
          const next = Math.max(0, prev - elapsed);
          if (next === 0 && !flaggedRef.current) {
            flaggedRef.current = true;
            setTimeout(() => onFlagRef.current('w'), 0);
          }
          return next;
        });
      } else if (cur === 'b') {
        setBlackMs((prev) => {
          const next = Math.max(0, prev - elapsed);
          if (next === 0 && !flaggedRef.current) {
            flaggedRef.current = true;
            setTimeout(() => onFlagRef.current('b'), 0);
          }
          return next;
        });
      }
    }, 100);

    return () => clearInterval(id);
  }, [enabled, active]);

  // Reset times when time control changes
  useEffect(() => {
    setWhiteMs(initialMs);
    setBlackMs(initialMs);
    setActive(null);
    flaggedRef.current = false;
  }, [initialMs]);

  /** Start white's clock — call once when the game begins. */
  const start = useCallback(() => {
    if (!enabled) return;
    flaggedRef.current = false;
    setActive('w');
  }, [enabled]);

  /**
   * Call after each successful move.
   * Adds the increment to the player who just moved, then starts the opponent's clock.
   */
  const switchTurn = useCallback((movedColor: 'w' | 'b') => {
    if (!enabled) return;
    if (movedColor === 'w') setWhiteMs((p) => p + incrementMs);
    else setBlackMs((p) => p + incrementMs);
    setActive(movedColor === 'w' ? 'b' : 'w');
  }, [enabled, incrementMs]);

  const pause = useCallback(() => setActive(null), []);

  const reset = useCallback(() => {
    flaggedRef.current = false;
    setActive(null);
    setWhiteMs(initialMs);
    setBlackMs(initialMs);
  }, [initialMs]);

  return { whiteMs, blackMs, active, start, switchTurn, pause, reset, enabled };
}

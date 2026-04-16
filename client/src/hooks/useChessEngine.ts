import { useState, useCallback, useRef, useEffect } from 'react';
import { getChessEngine } from '../services/chessEngine';
import type { EngineEvaluation } from '../types/chess';

export function useChessEngine() {
  // ── Local state ───────────────────────────────────────────────────────────
  const [isThinking, setIsThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const engineRef = useRef(getChessEngine());
  const isMounted = useRef(true);

  // Track mount state to avoid setting state after unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Engine actions ────────────────────────────────────────────────────────

  const getBestMove = useCallback(async (fen: string): Promise<string> => {
    setIsThinking(true);
    try {
      const move = await engineRef.current.getBestMove(fen);
      if (isMounted.current) {
        setBestMove(move);
        setIsThinking(false);
      }
      return move;
    } catch (e) {
      if (isMounted.current) setIsThinking(false);
      console.error('Engine error:', e);
      return '';
    }
  }, []);

  const evaluatePosition = useCallback(async (fen: string): Promise<EngineEvaluation | null> => {
    setIsThinking(true);
    try {
      const result = await engineRef.current.evaluatePosition(fen);
      if (isMounted.current) {
        setEvaluation(result);
        setIsThinking(false);
      }
      return result;
    } catch (e) {
      if (isMounted.current) setIsThinking(false);
      console.error('Engine evaluation error:', e);
      return null;
    }
  }, []);

  const stopThinking = useCallback(() => {
    engineRef.current.stop();
    if (isMounted.current) setIsThinking(false);
  }, []);

  const setDifficulty = useCallback((level: number) => {
    engineRef.current.setDifficulty(level);
    engineRef.current.reset();
  }, []);

  return {
    isThinking,
    evaluation,
    bestMove,
    getBestMove,
    evaluatePosition,
    stopThinking,
    setDifficulty,
  };
}

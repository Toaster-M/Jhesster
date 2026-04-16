import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Square, PieceSymbol, GameSettings } from '../types/chess';

export function useGame() {
  // ── State selectors — read from the global game store ──────────────────────
  const game = useGameStore((s) => s.game);
  const gameContext = useGameStore((s) => s.gameContext);
  const settings = useGameStore((s) => s.settings);
  const selectedSquare = useGameStore((s) => s.selectedSquare);
  const legalMoves = useGameStore((s) => s.legalMoves);
  const lastMove = useGameStore((s) => s.lastMove);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const winner = useGameStore((s) => s.winner);

  // ── Action selectors — pull store dispatch functions ──────────────────────
  const storeSelectSquare = useGameStore((s) => s.selectSquare);
  const storeMakeMove = useGameStore((s) => s.makeMove);
  const storeResetGame = useGameStore((s) => s.resetGame);
  const storeUndoMove = useGameStore((s) => s.undoMove);
  const storeInitializeGame = useGameStore((s) => s.initializeGame);
  const storeSetSettings = useGameStore((s) => s.setGameSettings);

  // ── Stable callback wrappers — memoised handlers for component consumers ──
  const handleSquareClick = useCallback(
    (square: Square) => {
      storeSelectSquare(square);
    },
    [storeSelectSquare]
  );

  const handleMakeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      return storeMakeMove(from, to, promotion);
    },
    [storeMakeMove]
  );

  const handleReset = useCallback(() => {
    storeResetGame();
  }, [storeResetGame]);

  const handleUndo = useCallback(() => {
    storeUndoMove();
  }, [storeUndoMove]);

  const handleNewGame = useCallback(() => {
    storeInitializeGame();
  }, [storeInitializeGame]);

  const handleSettingsChange = useCallback(
    (partial: Partial<GameSettings>) => {
      storeSetSettings(partial);
    },
    [storeSetSettings]
  );

  return {
    // State
    game,
    gameContext,
    settings,
    selectedSquare,
    legalMoves,
    lastMove,
    isGameOver,
    winner,

    // Derived from context
    board: gameContext.board,
    status: gameContext.status,
    capturedPieces: gameContext.capturedPieces,
    history: gameContext.history,

    // Actions
    handleSquareClick,
    handleMakeMove,
    handleReset,
    handleUndo,
    handleNewGame,
    handleSettingsChange,
  };
}

import { useState, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Puzzle } from '../data/puzzles';
import type { Square, Move, Color } from '../types/chess';

export type PuzzleStatus = 'idle' | 'playing' | 'correct' | 'wrong' | 'solved';

export interface PuzzleState {
  board:           (import('chess.js').Piece | null)[][];
  turn:            Color;
  selectedSquare:  Square | null;
  legalMoves:      Move[];
  lastMove:        { from: Square; to: Square } | null;
  status:          PuzzleStatus;
  /** Index into puzzle.solution of the next move the *player* must make */
  playerMoveIndex: number;
  hintsUsed:       number;
  hintSquare:      Square | null;
}

interface UsePuzzleReturn extends PuzzleState {
  handleSquareClick: (square: Square) => void;
  showHint:          () => void;
  revealSolution:    () => void;
  resetPuzzle:       () => void;
  /** Side (color) the player is solving for */
  playerColor:       Color;
}

export function usePuzzle(puzzle: Puzzle): UsePuzzleReturn {
  const chessRef = useRef(new Chess(puzzle.fen));

  /** Derive player color from the side to move in the opening FEN */
  const playerColor: Color = chessRef.current.turn() as Color;

  function buildState(
    status:          PuzzleStatus,
    playerMoveIndex: number,
    lastMove:        { from: Square; to: Square } | null,
    selectedSquare:  Square | null,
    hintsUsed:       number,
    hintSquare:      Square | null,
  ): PuzzleState {
    const chess = chessRef.current;
    const legalMoves = selectedSquare
      ? (chess.moves({ square: selectedSquare, verbose: true }) as Move[])
      : [];

    return {
      board:           chess.board(),
      turn:            chess.turn() as Color,
      selectedSquare,
      legalMoves,
      lastMove,
      status,
      playerMoveIndex,
      hintsUsed,
      hintSquare,
    };
  }

  const [state, setState] = useState<PuzzleState>(() =>
    buildState('playing', 0, null, null, 0, null)
  );

  const applyEngineReply = useCallback(
    (playerMoveIndex: number, lastPlayerMove: { from: Square; to: Square }) => {
      const replyIndex = playerMoveIndex + 1;
      if (replyIndex >= puzzle.solution.length) {
        // No opponent reply — puzzle solved
        setState(buildState('solved', playerMoveIndex + 1, lastPlayerMove, null, 0, null));
        return;
      }

      const uci = puzzle.solution[replyIndex];
      const from = uci.slice(0, 2) as Square;
      const to   = uci.slice(2, 4) as Square;

      setTimeout(() => {
        chessRef.current.move({ from, to });
        const nextPlayerIndex = replyIndex + 1;
        const solved = nextPlayerIndex >= puzzle.solution.length;
        setState((prev) =>
          buildState(
            solved ? 'solved' : 'playing',
            nextPlayerIndex,
            { from, to },
            null,
            prev.hintsUsed,
            null,
          )
        );
      }, 400);
    },
    [puzzle]
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      setState((prev) => {
        if (prev.status !== 'playing' && prev.status !== 'wrong') return prev;

        const chess = chessRef.current;

        // If a piece is already selected, try to make the move
        if (prev.selectedSquare) {
          const expectedUci = puzzle.solution[prev.playerMoveIndex];
          const expectedFrom = expectedUci.slice(0, 2) as Square;
          const expectedTo   = expectedUci.slice(2, 4) as Square;

          const isLegalTarget = prev.legalMoves.some((m) => m.to === square);

          if (isLegalTarget) {
            // Attempt the move
            const promotion = expectedUci[4] as 'q' | 'r' | 'b' | 'n' | undefined;
            const result = chess.move({ from: prev.selectedSquare, to: square, promotion: promotion ?? 'q' });

            if (!result) {
              return { ...prev, selectedSquare: null, legalMoves: [] };
            }

            const moveMade = { from: prev.selectedSquare, to: square };

            if (prev.selectedSquare === expectedFrom && square === expectedTo) {
              // Correct move
              const nextPlayerIndex = prev.playerMoveIndex + 1;
              const isSolved = nextPlayerIndex >= puzzle.solution.length &&
                               (puzzle.solution.length % 2 === 1); // odd = no more replies

              if (isSolved) {
                return buildState('solved', nextPlayerIndex, moveMade, null, prev.hintsUsed, null);
              }

              // Trigger engine reply asynchronously
              applyEngineReply(prev.playerMoveIndex, moveMade);

              return buildState('correct', prev.playerMoveIndex, moveMade, null, prev.hintsUsed, null);
            } else {
              // Wrong move — undo it
              chess.undo();
              return buildState('wrong', prev.playerMoveIndex, prev.lastMove, null, prev.hintsUsed, null);
            }
          }

          // Clicked same square: deselect
          if (square === prev.selectedSquare) {
            return buildState(prev.status, prev.playerMoveIndex, prev.lastMove, null, prev.hintsUsed, null);
          }

          // Clicked another own piece: switch selection
          const piece = chess.get(square as import('chess.js').Square);
          if (piece && piece.color === playerColor) {
            const lm = chess.moves({ square: square as import('chess.js').Square, verbose: true }) as Move[];
            return { ...prev, selectedSquare: square, legalMoves: lm, hintSquare: null };
          }

          return buildState(prev.status, prev.playerMoveIndex, prev.lastMove, null, prev.hintsUsed, null);
        }

        // No piece selected yet — select the clicked square if it has a friendly piece
        const piece = chess.get(square as import('chess.js').Square);
        if (!piece || piece.color !== playerColor) return prev;

        const lm = chess.moves({ square: square as import('chess.js').Square, verbose: true }) as Move[];
        return { ...prev, selectedSquare: square, legalMoves: lm, status: 'playing', hintSquare: null };
      });
    },
    [puzzle, playerColor, applyEngineReply]
  );

  const showHint = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' && prev.status !== 'wrong') return prev;
      const uci = puzzle.solution[prev.playerMoveIndex];
      const from = uci.slice(0, 2) as Square;
      return { ...prev, hintsUsed: prev.hintsUsed + 1, hintSquare: from, status: 'playing' };
    });
  }, [puzzle]);

  const revealSolution = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'solved') return prev;
      const chess = chessRef.current;

      // Replay all remaining solution moves
      let idx = prev.playerMoveIndex;
      let lastUci = puzzle.solution[idx - 1] ?? null;

      for (; idx < puzzle.solution.length; idx++) {
        const uci = puzzle.solution[idx];
        const from = uci.slice(0, 2);
        const to   = uci.slice(2, 4);
        chess.move({ from, to, promotion: (uci[4] ?? 'q') as 'q' });
        lastUci = uci;
      }

      const lm = lastUci ? { from: lastUci.slice(0, 2) as Square, to: lastUci.slice(2, 4) as Square } : null;
      return buildState('solved', idx, lm, null, prev.hintsUsed + 1, null);
    });
  }, [puzzle]);

  const resetPuzzle = useCallback(() => {
    chessRef.current = new Chess(puzzle.fen);
    setState(buildState('playing', 0, null, null, 0, null));
  }, [puzzle]);

  return {
    ...state,
    handleSquareClick,
    showHint,
    revealSolution,
    resetPuzzle,
    playerColor,
  };
}

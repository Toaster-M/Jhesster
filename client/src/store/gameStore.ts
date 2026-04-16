import { create } from 'zustand';
import { ChessGame } from '../utils/chessHelpers';
import type { Square, Move, PieceSymbol, GameContext, GameSettings, GameMode, Color } from '../types/chess';

// ── Store interface ───────────────────────────────────────────────────────────

interface GameStore {
  // State
  game: ChessGame;
  gameContext: GameContext;
  settings: GameSettings;
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: Move | null;
  isGameOver: boolean;
  winner: Color | 'draw' | null;

  // Actions
  initializeGame: () => void;
  loadSavedGame: (moves: { from: string; to: string; promotion?: string }[]) => void;
  selectSquare: (square: Square) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  resetGame: () => void;
  undoMove: () => void;
  setGameSettings: (settings: Partial<GameSettings>) => void;
}

// ── Helper: snapshot current game state into a plain GameContext object ───────

function buildGameContext(game: ChessGame): GameContext {
  const status = game.getGameStatus();
  const board = game.getBoard().map((row) =>
    row.map((cell) => (cell ? { color: cell.color as Color, type: cell.type as PieceSymbol } : null))
  );
  return {
    status,
    board,
    history: game.getHistory(),
    capturedPieces: game.getCapturedPieces(),
    fen: game.getFen(),
  };
}

// ── Default settings ──────────────────────────────────────────────────────────

const defaultSettings: GameSettings = {
  mode: 'vs-ai' as GameMode,
  difficulty: 3,
  playerColor: 'w',
  isFlipped: false,
};

// ── Store creation ────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  game: new ChessGame(),
  gameContext: buildGameContext(new ChessGame()),
  settings: defaultSettings,
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  isGameOver: false,
  winner: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  initializeGame: () => {
    const game = new ChessGame();
    set({
      game,
      gameContext: buildGameContext(game),
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      isGameOver: false,
      winner: null,
    });
  },

  loadSavedGame: (moves) => {
    const game = new ChessGame();
    game.loadFromMoveList(moves);
    const gameContext = buildGameContext(game);
    const history = gameContext.history;
    const lastMove = history.length > 0 ? history[history.length - 1] : null;
    set({
      game,
      gameContext,
      selectedSquare: null,
      legalMoves: [],
      lastMove,
      isGameOver: gameContext.status.isGameOver,
      winner: null,
    });
  },

  selectSquare: (square: Square) => {
    const { game, selectedSquare, settings } = get();
    const status = game.getGameStatus();

    if (status.isGameOver) return;

    // If a square is already selected, try to move
    if (selectedSquare && selectedSquare !== square) {
      const legalMoves = game.getLegalMovesForSquare(selectedSquare);
      const isLegal = legalMoves.some((m) => m.to === square);

      if (isLegal) {
        const requiresPromo = game.requiresPromotion(selectedSquare, square);
        if (!requiresPromo) {
          get().makeMove(selectedSquare, square);
          return;
        }
        // Promotion handled externally — store just selects
        set({ selectedSquare, legalMoves });
        return;
      }
    }

    // Select the clicked square if it has a piece of the current player
    const piece = game.getPiece(square);
    const currentTurn = game.getTurn();

    // In vs-ai mode, only allow selecting own pieces on player's turn
    const isPlayerTurn =
      settings.mode === 'local-multiplayer' || currentTurn === settings.playerColor;

    if (piece && piece.color === currentTurn && isPlayerTurn) {
      const moves = game.getLegalMovesForSquare(square);
      set({ selectedSquare: square, legalMoves: moves });
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => {
    const { game } = get();
    const move = game.makeMove({ from, to, promotion });

    if (!move) return false;

    const gameContext = buildGameContext(game);
    const status = gameContext.status;

    let winner: Color | 'draw' | null = null;
    if (status.isCheckmate) {
      winner = status.turn === 'w' ? 'b' : 'w';
    } else if (status.isDraw || status.isStalemate || status.isThreefoldRepetition || status.isInsufficientMaterial) {
      winner = 'draw';
    }

    set({
      gameContext,
      selectedSquare: null,
      legalMoves: [],
      lastMove: move,
      isGameOver: status.isGameOver,
      winner,
    });

    return true;
  },

  resetGame: () => {
    const { game } = get();
    game.reset();
    set({
      gameContext: buildGameContext(game),
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      isGameOver: false,
      winner: null,
    });
  },

  undoMove: () => {
    const { game, settings } = get();
    // Undo twice in vs-ai to undo both AI and player move
    game.undoMove();
    if (settings.mode === 'vs-ai') {
      game.undoMove();
    }
    const gameContext = buildGameContext(game);
    const history = gameContext.history;
    const lastMove = history.length > 0 ? history[history.length - 1] : null;
    set({
      gameContext,
      selectedSquare: null,
      legalMoves: [],
      lastMove,
      isGameOver: false,
      winner: null,
    });
  },

  setGameSettings: (partial: Partial<GameSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },
}));

// Core chess types

export type Color = 'w' | 'b';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  color: Color;
  type: PieceSymbol;
}

export type Square =
  | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1'
  | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2'
  | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
  | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4'
  | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5'
  | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
  | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7'
  | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  piece?: PieceSymbol;
  captured?: PieceSymbol;
  san?: string;
  lan?: string;
  flags?: string;
  color?: Color;
}

export interface GameStatus {
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  isGameOver: boolean;
  turn: Color;
}

export interface CapturedPieces {
  w: PieceSymbol[];
  b: PieceSymbol[];
}

export interface GameContext {
  status: GameStatus;
  board: (Piece | null)[][];
  history: Move[];
  capturedPieces: CapturedPieces;
  fen: string;
}

export type GameMode = 'vs-ai' | 'local-multiplayer';

export interface GameSettings {
  mode: GameMode;
  difficulty: number; // 1-5
  playerColor: Color;
  isFlipped: boolean;
}

export interface EngineEvaluation {
  score: number;
  depth: number;
  bestMove: string | null;
  mate: number | null;
}

// ── App-level persisted preferences ──────────────────────────────────────────

export type BoardTheme = 'classic' | 'forest' | 'ocean' | 'midnight' | 'custom';

// ── Saved local games ─────────────────────────────────────────────────────────

export interface SavedGame {
  id: string;
  title: string;
  mode: 'vs-ai' | 'local-multiplayer';
  /** Current position FEN — used for display only. */
  fen: string;
  /** Ordered move list used to replay the game on load. */
  moveList: { from: string; to: string; promotion?: string }[];
  settings: {
    difficulty: number;
    playerColor: Color;
    playerNames: { white: string; black: string };
  };
  savedAt: number;
  moveCount: number;
}

export interface AppPreferences {
  boardTheme:        BoardTheme;
  animationsEnabled: boolean;
  soundEnabled:      boolean;
  lastDifficulty:    number;
  autoFlipInPvP:     boolean;
  /** Custom board square colours — only used when boardTheme === 'custom' */
  customBoard: {
    light: string;
    dark:  string;
  };
  /** Board frame (external border) colours */
  boardFrame: {
    background: string;
    labelColor: string;
  };
  /** Fill colours for the two sides' pieces */
  pieceColors: {
    white: string;
    black: string;
  };
}

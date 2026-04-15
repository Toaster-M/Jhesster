import { Chess } from 'chess.js';
import type { Color, PieceSymbol, Square, Move, GameStatus, CapturedPieces } from '../types/chess';

export class ChessGame {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = fen ? new Chess(fen) : new Chess();
  }

  getLegalMovesForSquare(square: Square): Move[] {
    const moves = this.chess.moves({ square, verbose: true });
    return moves as Move[];
  }

  getAllLegalMoves(): Move[] {
    return this.chess.moves({ verbose: true }) as Move[];
  }

  makeMove(move: { from: Square; to: Square; promotion?: PieceSymbol }): Move | null {
    try {
      const result = this.chess.move(move);
      return result as Move | null;
    } catch {
      return null;
    }
  }

  getFen(): string {
    return this.chess.fen();
  }

  getBoard(): (import('chess.js').Piece | null)[][] {
    return this.chess.board();
  }

  getHistory(): Move[] {
    return this.chess.history({ verbose: true }) as Move[];
  }

  getGameStatus(): GameStatus {
    return {
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      isStalemate: this.chess.isStalemate(),
      isThreefoldRepetition: this.chess.isThreefoldRepetition(),
      isInsufficientMaterial: this.chess.isInsufficientMaterial(),
      isGameOver: this.chess.isGameOver(),
      turn: this.chess.turn() as Color,
    };
  }

  getCapturedPieces(): CapturedPieces {
    const history = this.chess.history({ verbose: true });
    const captured: CapturedPieces = { w: [], b: [] };

    for (const move of history) {
      if (move.captured) {
        // The piece captured belongs to the side that was captured (opposite of who moved)
        const capturedColor: Color = move.color === 'w' ? 'b' : 'w';
        captured[capturedColor].push(move.captured as PieceSymbol);
      }
    }

    return captured;
  }

  reset(): void {
    this.chess.reset();
  }

  undoMove(): Move | null {
    const result = this.chess.undo();
    return result as Move | null;
  }

  getTurn(): Color {
    return this.chess.turn() as Color;
  }

  isSquareEmpty(square: Square): boolean {
    return this.chess.get(square) === null || this.chess.get(square) === undefined;
  }

  getPiece(square: Square): import('chess.js').Piece | null {
    return this.chess.get(square) || null;
  }

  requiresPromotion(from: Square, to: Square): boolean {
    const piece = this.chess.get(from);
    if (!piece || piece.type !== 'p') return false;

    const toRank = to[1];
    if (piece.color === 'w' && toRank === '8') return true;
    if (piece.color === 'b' && toRank === '1') return true;

    return false;
  }

  validateAlgebraicMove(move: string): Move | null {
    try {
      const result = this.chess.move(move);
      return result as Move | null;
    } catch {
      return null;
    }
  }

  // Phase 2 additions

  /**
   * Parse and validate a notation string (long "e2e4" or short "e4", "Nf3", etc.)
   * Returns the executed Move if valid, null if invalid.
   * NOTE: This mutates the game state — only call if you intend to apply the move.
   */
  parseAlgebraicMove(notation: string): Move | null {
    const trimmed = notation.trim();
    if (!trimmed) return null;

    // Try as-is (handles SAN like "e4", "Nf3", "O-O")
    try {
      const result = this.chess.move(trimmed);
      if (result) return result as Move;
    } catch {
      // fall through
    }

    // Try as long algebraic (e.g. "e2e4", "g1f3")
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(trimmed)) {
      const from = trimmed.slice(0, 2) as Square;
      const to = trimmed.slice(2, 4) as Square;
      const promotion = trimmed[4] as PieceSymbol | undefined;
      try {
        const result = this.chess.move({ from, to, promotion });
        if (result) return result as Move;
      } catch {
        // fall through
      }
    }

    return null;
  }

  /**
   * Replay a list of moves from the starting position.
   * Returns true if all moves were applied successfully.
   */
  loadFromMoveList(moves: { from: string; to: string; promotion?: string }[]): boolean {
    this.chess = new Chess();
    for (const move of moves) {
      try {
        const result = this.chess.move({
          from: move.from as Square,
          to: move.to as Square,
          promotion: move.promotion as PieceSymbol | undefined,
        });
        if (!result) return false;
      } catch {
        return false;
      }
    }
    return true;
  }

  /**
   * Convert a Move object to its UCI long algebraic string (e.g. "e2e4", "g1f3").
   */
  moveToAlgebraic(move: Move): string {
    const promo = move.promotion ? move.promotion : '';
    return `${move.from}${move.to}${promo}`;
  }

  /**
   * Validate notation without mutating game state.
   * Returns true if the move string is currently legal.
   */
  isValidNotation(notation: string): boolean {
    const trimmed = notation.trim();
    if (!trimmed) return false;
    const legalSan = this.chess.moves();
    if (legalSan.includes(trimmed)) return true;
    // Also check long-algebraic format
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(trimmed)) {
      const legal = this.chess.moves({ verbose: true }) as Move[];
      const from = trimmed.slice(0, 2) as Square;
      const to = trimmed.slice(2, 4) as Square;
      return legal.some((m) => m.from === from && m.to === to);
    }
    return false;
  }
}

// ── Natural-language move parser ──────────────────────────────────────────────

const NL_PIECE_NAMES: Record<string, PieceSymbol> = {
  king: 'k',   kings: 'k',
  queen: 'q',  queens: 'q',
  rook: 'r',   rooks: 'r',   tower: 'r',
  bishop: 'b', bishops: 'b',
  knight: 'n', knights: 'n', horse: 'n', horses: 'n', night: 'n',
  pawn: 'p',   pawns: 'p',
};

const NL_PIECE_RE = new RegExp(
  `\\b(${Object.keys(NL_PIECE_NAMES).join('|')})\\b`, 'i',
);
const NL_SQUARE_RE = /\b([a-h][1-8])\b/gi;

/**
 * Parse a natural-language move like "knight to a3" or "rook e1 to e4" into a
 * concrete { from, to, promotion? } triple using the current game's legal moves.
 *
 * Returns null if the input can't be parsed, the move is illegal, or it is
 * ambiguous (two pieces of the same type can both reach the destination).
 *
 * Promotion always defaults to queen when triggered via natural language.
 */
export function parseNaturalLanguageMove(
  input: string,
  game: ChessGame,
): { from: Square; to: Square; promotion?: PieceSymbol } | null {
  const lower = input.toLowerCase().trim();

  // Castling shorthands
  if (/\bcastle\b.*\bking\b|\bking\b.*\bcastle\b|\bshort\s*castle\b|\bcastle\s*short\b/.test(lower)) {
    return null; // let the O-O SAN path handle it
  }
  if (/\bcastle\b.*\bqueen\b|\bqueen\b.*\bcastle\b|\blong\s*castle\b|\bcastle\s*long\b/.test(lower)) {
    return null; // let the O-O-O SAN path handle it
  }

  // Extract piece name
  const pieceMatch = NL_PIECE_RE.exec(lower);
  if (!pieceMatch) return null;
  const pieceType = NL_PIECE_NAMES[pieceMatch[1].toLowerCase()];

  // Extract all squares mentioned (order matters for disambiguation)
  const squares = [...lower.matchAll(NL_SQUARE_RE)].map((m) => m[1] as Square);
  if (squares.length === 0) return null;

  // Last square = destination; optional first square = from-hint
  const destSquare = squares[squares.length - 1];
  const fromHint   = squares.length >= 2 ? squares[0] : null;

  // Find legal moves that match piece type + destination (+ optional from-hint)
  const legalMoves = game.getAllLegalMoves();
  const candidates = legalMoves.filter((m) => {
    if (m.to !== destSquare) return false;
    if (fromHint && m.from !== fromHint) return false;
    const piece = game.getPiece(m.from as Square);
    return piece !== null && piece.type === pieceType;
  });

  if (candidates.length === 0) return null;
  if (candidates.length > 1)  return null; // ambiguous

  const match = candidates[0];
  const isPromotion = match.flags?.includes('p') ?? false;
  return {
    from:      match.from as Square,
    to:        match.to as Square,
    promotion: isPromotion ? 'q' : undefined, // auto-queen; player can use notation for other promotions
  };
}

// Always use the solid/filled Unicode set (the "black" glyph shapes) for both colours.
// Colour and contrast are handled by CSS in Square.tsx.
const PIECE_GLYPH: Record<PieceSymbol, string> = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

export function getPieceUnicode(piece: { color: Color; type: PieceSymbol }): string {
  return PIECE_GLYPH[piece.type];
}

export function squareToIndices(square: Square): { row: number; col: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7
  return { row: 7 - rank, col: file };
}

export function indicesToSquare(row: number, col: number): Square {
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = String(8 - row);
  return `${file}${rank}` as Square;
}

export function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

export function formatMoveHistory(moves: Move[]): string[] {
  return moves.map((move, index) => {
    const moveNum = Math.floor(index / 2) + 1;
    if (index % 2 === 0) {
      return `${moveNum}. ${move.san ?? ''}`;
    }
    return move.san ?? '';
  });
}

/** Group moves into pairs: [{ number, white, black }] */
export interface MovePair {
  number: number;
  white: string;
  black: string | null;
}

export function groupMovePairs(moves: Move[]): MovePair[] {
  const pairs: MovePair[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i]?.san ?? '',
      black: moves[i + 1]?.san ?? null,
    });
  }
  return pairs;
}

/** Return move number string like "1.", "2.", etc. */
export function moveNumbering(moveIndex: number): string {
  return `${Math.floor(moveIndex / 2) + 1}.`;
}

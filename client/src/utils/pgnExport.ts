import type { Move } from '../types/chess';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PgnOptions {
  white?:  string;
  black?:  string;
  result?: string; // '1-0' | '0-1' | '1/2-1/2' | '*'
  event?:  string;
  date?:   string;
}

/**
 * Build a PGN string from a move history array.
 * Uses the SAN field already stored on each Move object.
 */
export function buildPgn(history: Move[], opts: PgnOptions = {}): string {
  const {
    white  = 'White',
    black  = 'Black',
    result = '*',
    event  = 'Jhesster Chess',
    date   = new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
  } = opts;

  const header = [
    `[Event "${event}"]`,
    `[Date "${date}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`,
  ].join('\n');

  const moves: string[] = [];
  history.forEach((move, i) => {
    if (i % 2 === 0) moves.push(`${Math.floor(i / 2) + 1}.`);
    moves.push(move.san);
  });
  moves.push(result);

  // Wrap at ~80 chars
  const moveText = wrapText(moves.join(' '), 80);

  return `${header}\n\n${moveText}\n`;
}

/** Download a PGN file in the browser. */
export function downloadPgn(history: Move[], opts: PgnOptions = {}): void {
  const pgn  = buildPgn(history, opts);
  const blob = new Blob([pgn], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `jhesster_${new Date().toISOString().slice(0, 10)}.pgn`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function wrapText(text: string, maxLen: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line.length + word.length + 1 > maxLen && line.length > 0) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

/** Derive a PGN result tag from game state. */
export function getPgnResult(
  isCheckmate: boolean,
  isDraw:      boolean,
  isStalemate: boolean,
  winner:      'w' | 'b' | 'draw' | null,
): string {
  if (!isCheckmate && !isDraw && !isStalemate) return '*';
  if (isDraw || isStalemate)                   return '1/2-1/2';
  if (winner === 'w')                          return '1-0';
  if (winner === 'b')                          return '0-1';
  return '*';
}

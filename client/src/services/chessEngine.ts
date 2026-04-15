import type { EngineEvaluation } from '../types/chess';

/**
 * Difficulty 1-5 mapped to:
 *  - skillLevel: Stockfish "Skill Level" UCI option (0-20).
 *    At 0 the engine deliberately blunders; at 20 it plays at full strength.
 *  - depth: maximum search depth for move selection.
 *
 * Skill Level is the primary lever — depth alone only limits look-ahead but
 * Stockfish at depth 1 still never misses a 1-move tactic.  Combined, both
 * options produce naturally weak play at low settings.
 */
const DIFFICULTY_SETTINGS: Record<number, { depth: number; skillLevel: number }> = {
  1: { depth: 1,  skillLevel: 0  }, // Beginner  — frequent blunders
  2: { depth: 3,  skillLevel: 5  }, // Easy      — occasional blunders
  3: { depth: 6,  skillLevel: 10 }, // Medium    — solid but imperfect
  4: { depth: 10, skillLevel: 15 }, // Hard      — strong play
  5: { depth: 15, skillLevel: 20 }, // Master    — full Stockfish strength
};

// Minimum depth used when evaluating positions for the eval bar.
// Kept independent of difficulty so the bar stays accurate even at low levels.
const EVAL_DEPTH = 12;

export class ChessEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private readyResolvers: Array<() => void> = [];
  private moveResolvers: Array<(move: string) => void> = [];
  private evalResolvers: Array<(evaluation: EngineEvaluation) => void> = [];
  private depth      = DIFFICULTY_SETTINGS[3].depth;
  private skillLevel = DIFFICULTY_SETTINGS[3].skillLevel;
  private currentEval: Partial<EngineEvaluation> = {};

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      this.worker = new Worker('/stockfish.js');
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = (e) => console.error('Stockfish worker error:', e);
      this.worker.postMessage('uci');
    } catch (e) {
      console.error('Failed to initialize Stockfish:', e);
    }
  }

  private handleMessage(event: MessageEvent): void {
    const message = typeof event.data === 'string' ? event.data : String(event.data);

    if (message === 'uciok') {
      this.worker?.postMessage('isready');
    }

    if (message === 'readyok') {
      this.isReady = true;
      this.readyResolvers.forEach((resolve) => resolve());
      this.readyResolvers = [];
    }

    if (message.startsWith('bestmove')) {
      const parts = message.split(' ');
      const bestMove = parts[1] && parts[1] !== '(none)' ? parts[1] : '';
      this.moveResolvers.forEach((resolve) => resolve(bestMove));
      this.moveResolvers = [];

      if (this.evalResolvers.length > 0) {
        const evaluation: EngineEvaluation = {
          score:    this.currentEval.score ?? 0,
          depth:    this.currentEval.depth ?? 0,
          bestMove,
          mate:     this.currentEval.mate ?? null,
        };
        this.evalResolvers.forEach((resolve) => resolve(evaluation));
        this.evalResolvers = [];
        this.currentEval = {};
      }
    }

    if (message.startsWith('info')) {
      const depthMatch = message.match(/depth (\d+)/);
      const scoreMatch = message.match(/score cp (-?\d+)/);
      const mateMatch  = message.match(/score mate (-?\d+)/);

      if (depthMatch) this.currentEval.depth = parseInt(depthMatch[1]);
      if (scoreMatch) {
        this.currentEval.score = parseInt(scoreMatch[1]);
        this.currentEval.mate  = null;
      }
      if (mateMatch) {
        this.currentEval.mate  = parseInt(mateMatch[1]);
        this.currentEval.score = mateMatch[1].startsWith('-') ? -10000 : 10000;
      }
    }
  }

  private waitForReady(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    return new Promise((resolve) => {
      this.readyResolvers.push(resolve);
    });
  }

  setDifficulty(level: number): void {
    const clamped  = Math.max(1, Math.min(5, level));
    const settings = DIFFICULTY_SETTINGS[clamped] ?? DIFFICULTY_SETTINGS[3];
    this.depth      = settings.depth;
    this.skillLevel = settings.skillLevel;
  }

  async getBestMove(fen: string): Promise<string> {
    await this.waitForReady();
    return new Promise((resolve) => {
      this.moveResolvers.push(resolve);
      // Skill Level must be set before every go command — it is the primary
      // difficulty control.  Without it, depth-1 Stockfish still never misses
      // a one-move tactic.
      this.worker?.postMessage(`setoption name Skill Level value ${this.skillLevel}`);
      this.worker?.postMessage(`position fen ${fen}`);
      this.worker?.postMessage(`go depth ${this.depth}`);
    });
  }

  async evaluatePosition(fen: string): Promise<EngineEvaluation> {
    await this.waitForReady();
    return new Promise((resolve) => {
      this.currentEval = {};
      this.evalResolvers.push(resolve);
      // Always evaluate at full strength and a fixed depth so the eval bar
      // remains accurate regardless of the chosen game difficulty.
      this.worker?.postMessage('setoption name Skill Level value 20');
      this.worker?.postMessage(`position fen ${fen}`);
      this.worker?.postMessage(`go depth ${EVAL_DEPTH}`);
    });
  }

  stop(): void {
    this.worker?.postMessage('stop');
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.isReady = false;
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  reset(): void {
    this.worker?.postMessage('ucinewgame');
  }
}

// Singleton
let engineInstance: ChessEngine | null = null;

export function getChessEngine(): ChessEngine {
  if (!engineInstance) {
    engineInstance = new ChessEngine();
  }
  return engineInstance;
}

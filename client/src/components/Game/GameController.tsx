import { useEffect, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Square, PieceSymbol, Color } from '../../types/chess';
import { useGame } from '../../hooks/useGame';
import { useChessEngine } from '../../hooks/useChessEngine';
import { parseNaturalLanguageMove } from '../../utils/chessHelpers';
import { usePrefsStore } from '../../store/prefsStore';
import { playSound } from '../../services/soundService';
import Board from '../Board/Board';
import GameInfo from './GameInfo';
import MoveInput from '../Notation/MoveInput';
import MoveAnalysis from './MoveAnalysis';
import PlayerClock from './PlayerClock';
import { EVENTS, type ReceiveMovePayload, type GameEndPayload } from '../../hooks/useWebSocket';
import { useTimer, type TimeControl } from '../../hooks/useTimer';

interface GameControllerProps {
  difficulty:    number;
  mode:          'vs-ai' | 'local-multiplayer' | 'online';
  playerColor?:  Color;
  playerNames?:  { white: string; black: string };
  timeControl?:  TimeControl | null;
  // Online-only props
  socket?:       Socket | null;
  onlineGameId?: string | null;
  onAnalyze?:    (history: import('../../types/chess').Move[]) => void;
}

export default function GameController({
  difficulty,
  mode,
  playerColor = 'w',
  playerNames = { white: 'White', black: 'Black' },
  timeControl = null,
  socket = null,
  onlineGameId = null,
  onAnalyze,
}: GameControllerProps) {
  const {
    game,
    gameContext,
    selectedSquare,
    legalMoves,
    lastMove,
    isGameOver,
    winner,
    board,
    status,
    capturedPieces,
    history,
    handleSquareClick,
    handleMakeMove,
    handleUndo,
    handleNewGame,
    handleSettingsChange,
  } = useGame();

  const { isThinking, evaluation, getBestMove, evaluatePosition, setDifficulty } = useChessEngine();
  const { prefs } = usePrefsStore();

  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [onlineEndReason, setOnlineEndReason] = useState<string | null>(null);
  const [flaggedColor, setFlaggedColor] = useState<Color | null>(null);
  // Mobile: info panel is collapsed by default; auto-opens when game ends
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  // ── Timer ─────────────────────────────────────────────────────────────────────
  const { whiteMs, blackMs, active: timerActive, start: startTimer, switchTurn: switchTimerTurn, reset: resetTimer, enabled: timerEnabled } = useTimer({
    timeControl,
    onFlag: (color) => setFlaggedColor(color),
  });

  // Start white's clock as soon as the first move is played
  useEffect(() => {
    if (history.length === 1) startTimer();
  }, [history.length]);

  // After each move, switch the clock to the opponent
  useEffect(() => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];
    switchTimerTurn(lastMove.color as Color);
  }, [history.length]);

  // Reset timer when a new game starts (history goes back to 0)
  useEffect(() => {
    if (history.length === 0) {
      resetTimer();
      setFlaggedColor(null);
    }
  }, [history.length]);

  // ── Sound effects ─────────────────────────────────────────────────────────────
  const soundEnabled = prefs.soundEnabled;

  // Play a sound whenever a new move is added to history
  useEffect(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    const flags = last.flags ?? '';

    if (status.isCheckmate || status.isStalemate || status.isDraw) {
      playSound('gameOver', soundEnabled);
    } else if (flags.includes('p')) {
      playSound('promotion', soundEnabled);
    } else if (status.isCheck) {
      playSound('check', soundEnabled);
    } else if (flags.includes('k') || flags.includes('q')) {
      playSound('castle', soundEnabled);
    } else if (flags.includes('c') || flags.includes('e')) {
      playSound('capture', soundEnabled);
    } else {
      playSound('move', soundEnabled);
    }
  }, [history.length]);

  // Board orientation
  const pvpFlipped  = mode === 'local-multiplayer' && prefs.autoFlipInPvP && status.turn === 'b';
  const vsAiFlipped = playerColor === 'b';
  const isFlipped   =
    mode === 'vs-ai'            ? vsAiFlipped
    : mode === 'online'         ? vsAiFlipped   // online: always player's pieces at bottom
    : pvpFlipped;

  // Sync difficulty and settings on mount / when they change
  useEffect(() => {
    setDifficulty(difficulty);
    handleSettingsChange({ mode: mode === 'online' ? 'vs-ai' : mode, difficulty, playerColor });
  }, [difficulty, mode, playerColor]);

  // ── Online: subscribe to socket events ───────────────────────────────────────
  useEffect(() => {
    if (mode !== 'online' || !socket || !onlineGameId) return;

    const onReceiveMove = ({ from, to, promotion, color }: ReceiveMovePayload) => {
      // Only apply the opponent's moves (our own moves are already applied locally)
      if (color === playerColor) return;
      handleMakeMove(from as Square, to as Square, promotion as PieceSymbol | undefined);
    };

    const onGameEnd = ({ reason }: GameEndPayload) => {
      setOnlineEndReason(reason);
    };

    const onDisconnect = () => {
      setOpponentDisconnected(true);
    };

    socket.on(EVENTS.RECEIVE_MOVE,          onReceiveMove);
    socket.on(EVENTS.GAME_END,              onGameEnd);
    socket.on(EVENTS.OPPONENT_DISCONNECTED, onDisconnect);

    return () => {
      socket.off(EVENTS.RECEIVE_MOVE,          onReceiveMove);
      socket.off(EVENTS.GAME_END,              onGameEnd);
      socket.off(EVENTS.OPPONENT_DISCONNECTED, onDisconnect);
    };
  }, [mode, socket, onlineGameId, playerColor, handleMakeMove]);

  // ── AI move logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'vs-ai') return;
    if (isGameOver) return;
    if (isThinking) return;

    const isAITurn = status.turn !== playerColor;
    if (!isAITurn) return;

    const triggerAIMove = async () => {
      const fen = gameContext.fen;
      await new Promise((r) => setTimeout(r, 500));
      const moveStr = await getBestMove(fen);
      if (!moveStr || moveStr.length < 4) return;

      const from = moveStr.slice(0, 2) as Square;
      const to   = moveStr.slice(2, 4) as Square;
      const promotion = moveStr[4] as PieceSymbol | undefined;
      handleMakeMove(from, to, promotion);
    };

    triggerAIMove();
  }, [status.turn, isGameOver, mode, playerColor]);

  // ── Evaluate position after player moves (vs-ai) ──────────────────────────────
  useEffect(() => {
    if (mode !== 'vs-ai') return;
    if (isGameOver || isThinking) return;
    if (status.turn !== playerColor) return;
    if (history.length === 0) return;
    evaluatePosition(gameContext.fen);
  }, [history.length]);

  // ── Promotion detection ───────────────────────────────────────────────────────
  const handleSquareClickWithPromotion = useCallback(
    (square: Square) => {
      if (!selectedSquare) {
        handleSquareClick(square);
        return;
      }

      const isLegalDest = legalMoves.some((m) => m.to === square);
      if (isLegalDest) {
        const requiresPromo = legalMoves
          .filter((m) => m.to === square)
          .some((m) => m.flags?.includes('p'));

        if (requiresPromo && selectedSquare) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }
      }

      handleSquareClick(square);
    },
    [selectedSquare, legalMoves, handleSquareClick]
  );

  // ── Move handler (with online emit) ──────────────────────────────────────────
  const handleMakeMoveWithOnline = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      const moved = handleMakeMove(from, to, promotion);
      if (moved && mode === 'online' && socket && onlineGameId) {
        socket.emit(EVENTS.SEND_MOVE, { gameId: onlineGameId, from, to, promotion });
      }
      return moved;
    },
    [handleMakeMove, mode, socket, onlineGameId]
  );

  // Override handlePromote to use the online-aware move handler
  const handleSquareClickForOnline = useCallback(
    (square: Square) => {
      if (!selectedSquare) {
        handleSquareClick(square);
        return;
      }

      const isLegalDest = legalMoves.some((m) => m.to === square);
      if (isLegalDest) {
        const requiresPromo = legalMoves
          .filter((m) => m.to === square)
          .some((m) => m.flags?.includes('p'));

        if (requiresPromo && selectedSquare) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }
      }

      if (isLegalDest && selectedSquare) {
        handleMakeMoveWithOnline(selectedSquare, square);
      } else {
        handleSquareClick(square);
      }
    },
    [selectedSquare, legalMoves, handleSquareClick, handleMakeMoveWithOnline]
  );

  // ── Notation input handler ────────────────────────────────────────────────────
  const handleNotationMove = useCallback(
    (notation: string): boolean => {
      if (isGameOver) return false;
      if (mode === 'vs-ai' && (isThinking || status.turn !== playerColor)) return false;
      if (mode === 'online' && status.turn !== playerColor) return false;

      // 1. Try standard algebraic / UCI notation first
      const result = game.parseAlgebraicMove(notation);
      if (result) {
        game.undoMove();
        return handleMakeMoveWithOnline(result.from as Square, result.to as Square, result.promotion);
      }

      // 2. Fall back to natural-language parsing ("knight to a3", "rook e1 to e4", …)
      const nl = parseNaturalLanguageMove(notation, game);
      if (nl) {
        // If this is a pawn promotion, show the promotion modal instead of auto-queening
        const needsPromoModal =
          nl.promotion === undefined &&
          legalMoves.some((m) => m.from === nl.from && m.to === nl.to && m.flags?.includes('p'));
        if (needsPromoModal) {
          setPendingPromotion({ from: nl.from, to: nl.to });
          return true;
        }
        return handleMakeMoveWithOnline(nl.from, nl.to, nl.promotion);
      }

      return false;
    },
    [game, isGameOver, isThinking, mode, status.turn, playerColor, legalMoves, handleMakeMoveWithOnline],
  );

  // ── Resign ─────────────────────────────────────────────────────────────────────
  const handleResign = useCallback(() => {
    if (mode !== 'online' || !socket) return;
    socket.emit(EVENTS.RESIGN);
  }, [mode, socket]);

  const isPlayerTurn =
    mode === 'local-multiplayer' || status.turn === playerColor;

  const currentPlayerName =
    status.turn === 'w' ? playerNames.white : playerNames.black;

  const clickHandler = mode === 'online'
    ? handleSquareClickForOnline
    : handleSquareClickWithPromotion;

  const isFlagged   = !!flaggedColor;
  const flagWinner  = flaggedColor === 'w' ? 'b' : flaggedColor === 'b' ? 'w' : null;
  const effectiveGameOver = isGameOver || isFlagged || !!onlineEndReason;
  const effectiveWinner   = isFlagged ? flagWinner : winner;

  // Auto-expand info panel when game ends so result is immediately visible on mobile
  useEffect(() => {
    if (effectiveGameOver) setShowMobileInfo(true);
  }, [effectiveGameOver]);

  // Clock layout: top = opponent, bottom = you (respects board flip)
  const topColor    = isFlipped ? 'w' : 'b';
  const bottomColor = isFlipped ? 'b' : 'w';
  const topMs       = topColor    === 'w' ? whiteMs : blackMs;
  const bottomMs    = bottomColor === 'w' ? whiteMs : blackMs;
  const topActive   = timerActive === topColor;
  const bottomActive = timerActive === bottomColor;
  const topName     = topColor    === 'w' ? playerNames.white : playerNames.black;
  const bottomName  = bottomColor === 'w' ? playerNames.white : playerNames.black;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full">
      <div className="flex flex-col gap-3 items-center">
        {/* Opponent disconnected banner */}
        {opponentDisconnected && (
          <div className="w-full max-w-[min(80vw,560px)] bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-300 text-center">
            Your opponent disconnected.
          </div>
        )}

        {/* Top clock (opponent / far side) */}
        {timerEnabled && (
          <div className="w-full max-w-[min(80vw,560px)]">
            <PlayerClock timeMs={topMs} isActive={topActive} name={topName} />
          </div>
        )}

        <Board
          board={board}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          onSquareClick={clickHandler}
          onPromote={(from, to, piece) => {
            const moved = handleMakeMove(from, to, piece);
            if (moved && mode === 'online' && socket && onlineGameId) {
              socket.emit(EVENTS.SEND_MOVE, { gameId: onlineGameId, from, to, promotion: piece });
            }
            setPendingPromotion(null);
          }}
          isFlipped={isFlipped}
          pendingPromotion={pendingPromotion}
          playerColor={playerColor}
          currentTurn={status.turn}
          playerNames={mode !== 'vs-ai' ? playerNames : undefined}
          mode={mode === 'online' ? 'local-multiplayer' : mode}
        />

        {/* Bottom clock (you / near side) */}
        {timerEnabled && (
          <div className="w-full max-w-[min(80vw,560px)]">
            <PlayerClock timeMs={bottomMs} isActive={bottomActive} name={bottomName} />
          </div>
        )}

        {/* Notation input below board */}
        {!effectiveGameOver && (
          <div className="w-full max-w-[min(80vw,560px)]">
            <MoveInput
              onMove={handleNotationMove}
              disabled={!isPlayerTurn || (mode === 'vs-ai' && isThinking)}
            />
          </div>
        )}

        {/* Mobile-only info toggle — hidden on lg where the panel is always visible */}
        <button
          onClick={() => setShowMobileInfo((v) => !v)}
          className="lg:hidden w-full max-w-[min(80vw,560px)] flex items-center justify-between px-4 py-3 min-h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all text-sm text-gray-300"
        >
          <span className="font-semibold">
            {showMobileInfo ? 'Hide details' : 'Show details'}
          </span>
          <span className={`text-gray-500 transition-transform duration-200 ${showMobileInfo ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>
      </div>

      <div className={`flex flex-col gap-3 w-full lg:w-72 min-w-60 ${showMobileInfo ? 'flex' : 'hidden lg:flex'}`}>
        {/* Evaluation bar — vs AI only */}
        {mode === 'vs-ai' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-3">
            <MoveAnalysis evaluation={evaluation} isThinking={isThinking} />
          </div>
        )}

        {/* Current player indicator for PvP / Online */}
        {mode !== 'vs-ai' && !effectiveGameOver && (
          <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-2.5 flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_var(--color-emerald-400)]" />
            <span className="text-white font-semibold">{currentPlayerName}</span>
            <span className="text-gray-400">to move</span>
            {mode === 'online' && status.turn !== playerColor && (
              <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                <span className="ai-spinner" /> waiting
              </span>
            )}
          </div>
        )}

        <GameInfo
          status={status}
          capturedPieces={capturedPieces}
          history={history}
          isGameOver={effectiveGameOver}
          winner={effectiveWinner}
          isAIThinking={isThinking}
          onReset={mode !== 'online' ? handleNewGame : undefined}
          onUndo={mode !== 'online' ? handleUndo : undefined}
          onResign={mode === 'online' && !effectiveGameOver ? handleResign : undefined}
          onAnalyze={onAnalyze ? () => onAnalyze(history) : undefined}
          mode={mode === 'online' ? 'local-multiplayer' : mode}
          playerColor={playerColor}
          playerNames={playerNames}
        />
      </div>
    </div>
  );
}

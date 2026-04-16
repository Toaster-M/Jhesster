import type { Server, Socket } from 'socket.io';
import { Chess } from 'chess.js';
import { EVENTS } from '../events';
import type {
  SendInvitePayload,
  AcceptInvitePayload,
  DeclineInvitePayload,
  SendMovePayload,
} from '../events';
import {
  getLobbyUserByUserId,
  getLobbyUsers,
  removeLobbyUser,
} from './connectionHandler';
import { prisma } from '../../utils/db';

// ── In-memory stores ──────────────────────────────────────────────────────────

interface PendingInvite {
  fromSocketId: string;
  fromUserId:   string;
  toUserId:     string;
}

interface GameRoom {
  whiteSocketId: string;
  blackSocketId: string;
  whiteUserId:   string;
  blackUserId:   string;
  chess:         Chess;
  dbGameId:      string;
  moveCount:     number;
}

// inviterUserId → pending invite
const pendingInvites = new Map<string, PendingInvite>();

// gameId → active room
const activeGames = new Map<string, GameRoom>();

// socketId → gameId (for quick lookup on disconnect)
const socketToGame = new Map<string, string>();

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanupGame(gameId: string): void {
  const room = activeGames.get(gameId);
  if (!room) return;
  socketToGame.delete(room.whiteSocketId);
  socketToGame.delete(room.blackSocketId);
  activeGames.delete(gameId);
}

async function finaliseGame(
  io: Server,
  gameId: string,
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' | 'ABANDONED',
  reason: string
): Promise<void> {
  const room = activeGames.get(gameId);
  if (!room) return;

  io.to(gameId).emit(EVENTS.GAME_END, { result, reason });

  try {
    await prisma.game.update({
      where: { id: room.dbGameId },
      data: { result, fen: room.chess.fen() },
    });
    // Update stats
    await updateStats(room.whiteUserId, room.blackUserId, result);
  } catch {
    console.error('[socket] Failed to persist game end');
  }

  cleanupGame(gameId);
}

async function updateStats(
  whiteId: string,
  blackId: string,
  result: string
): Promise<void> {
  const wWon  = result === 'WHITE_WINS';
  const bWon  = result === 'BLACK_WINS';
  const isDraw = result === 'DRAW';

  await Promise.all([
    prisma.gameStats.upsert({
      where: { userId: whiteId },
      create: { userId: whiteId, wins: wWon ? 1 : 0, losses: bWon ? 1 : 0, draws: isDraw ? 1 : 0 },
      update: {
        wins:   { increment: wWon  ? 1 : 0 },
        losses: { increment: bWon  ? 1 : 0 },
        draws:  { increment: isDraw ? 1 : 0 },
      },
    }),
    prisma.gameStats.upsert({
      where: { userId: blackId },
      create: { userId: blackId, wins: bWon ? 1 : 0, losses: wWon ? 1 : 0, draws: isDraw ? 1 : 0 },
      update: {
        wins:   { increment: bWon  ? 1 : 0 },
        losses: { increment: wWon  ? 1 : 0 },
        draws:  { increment: isDraw ? 1 : 0 },
      },
    }),
  ]);
}

// ── Handler registration ──────────────────────────────────────────────────────

export function registerGameHandler(io: Server, socket: Socket): void {
  const { userId, username, rating } = socket.data.user as {
    userId: string;
    username: string;
    rating: number;
  };

  // ── Invites ──────────────────────────────────────────────────────────────

  socket.on(EVENTS.SEND_INVITE, ({ toUserId }: SendInvitePayload) => {
    if (toUserId === userId) return;

    const target = getLobbyUserByUserId(toUserId);
    if (!target) {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'Player is not in the lobby' });
      return;
    }

    pendingInvites.set(userId, { fromSocketId: socket.id, fromUserId: userId, toUserId });

    io.to(target.socketId).emit(EVENTS.RECEIVE_INVITE, {
      fromUserId: userId,
      fromUsername: username,
      fromRating: rating,
    });
  });

  socket.on(EVENTS.ACCEPT_INVITE, async ({ fromUserId }: AcceptInvitePayload) => {
    const invite = pendingInvites.get(fromUserId);
    if (!invite || invite.toUserId !== userId) {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'Invite not found' });
      return;
    }
    pendingInvites.delete(fromUserId);

    const inviter = getLobbyUserByUserId(fromUserId);
    if (!inviter) {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'Inviter is no longer in the lobby' });
      return;
    }

    // Randomly assign colors
    const inviterIsWhite = Math.random() < 0.5;

    const whiteUser = inviterIsWhite
      ? { userId: inviter.userId, username: inviter.username, rating: inviter.rating, socketId: inviter.socketId }
      : { userId, username, rating, socketId: socket.id };
    const blackUser = inviterIsWhite
      ? { userId, username, rating, socketId: socket.id }
      : { userId: inviter.userId, username: inviter.username, rating: inviter.rating, socketId: inviter.socketId };

    // Create game in DB
    let dbGameId: string;
    try {
      const dbGame = await prisma.game.create({
        data: { whiteId: whiteUser.userId, blackId: blackUser.userId },
      });
      dbGameId = dbGame.id;
    } catch {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'Failed to create game' });
      return;
    }

    const room: GameRoom = {
      whiteSocketId: whiteUser.socketId,
      blackSocketId: blackUser.socketId,
      whiteUserId:   whiteUser.userId,
      blackUserId:   blackUser.userId,
      chess:         new Chess(),
      dbGameId,
      moveCount:     0,
    };

    activeGames.set(dbGameId, room);
    socketToGame.set(whiteUser.socketId, dbGameId);
    socketToGame.set(blackUser.socketId, dbGameId);

    // Both join the game room
    const inviterSocket = io.sockets.sockets.get(inviter.socketId);
    if (inviterSocket) inviterSocket.join(dbGameId);
    socket.join(dbGameId);

    // Remove both from lobby
    removeLobbyUser(whiteUser.socketId);
    removeLobbyUser(blackUser.socketId);
    io.emit(EVENTS.USER_LEFT, { userId: whiteUser.userId });
    io.emit(EVENTS.USER_LEFT, { userId: blackUser.userId });

    // Notify both players
    io.to(whiteUser.socketId).emit(EVENTS.GAME_START, {
      gameId:           dbGameId,
      yourColor:        'w',
      opponentUsername: blackUser.username,
      opponentRating:   blackUser.rating,
    });
    io.to(blackUser.socketId).emit(EVENTS.GAME_START, {
      gameId:           dbGameId,
      yourColor:        'b',
      opponentUsername: whiteUser.username,
      opponentRating:   whiteUser.rating,
    });
  });

  socket.on(EVENTS.DECLINE_INVITE, ({ fromUserId }: DeclineInvitePayload) => {
    const invite = pendingInvites.get(fromUserId);
    if (!invite) return;
    pendingInvites.delete(fromUserId);

    const inviter = getLobbyUserByUserId(fromUserId);
    if (inviter) {
      io.to(inviter.socketId).emit(EVENTS.INVITE_DECLINED, { byUsername: username });
    }
  });

  // ── Moves ────────────────────────────────────────────────────────────────

  socket.on(EVENTS.SEND_MOVE, async ({ gameId, from, to, promotion }: SendMovePayload) => {
    const room = activeGames.get(gameId);
    if (!room) {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'Game not found' });
      return;
    }

    const isWhite = room.whiteSocketId === socket.id;
    const isBlack = room.blackSocketId === socket.id;
    if (!isWhite && !isBlack) {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'You are not a participant in this game' });
      return;
    }

    const expectedTurn = isWhite ? 'w' : 'b';
    if (room.chess.turn() !== expectedTurn) {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'Not your turn' });
      return;
    }

    // Server-side validation
    let result: ReturnType<Chess['move']>;
    try {
      result = room.chess.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
    } catch {
      socket.emit(EVENTS.SOCKET_ERROR, { message: 'Illegal move' });
      return;
    }

    room.moveCount += 1;

    // Persist move
    try {
      await prisma.move.create({
        data: {
          gameId:     room.dbGameId,
          moveNumber: room.moveCount,
          color:      result.color,
          from:       result.from,
          to:         result.to,
          san:        result.san,
          fen:        room.chess.fen(),
        },
      });
    } catch {
      console.error('[socket] Failed to save move');
    }

    const movePayload = {
      from:       result.from,
      to:         result.to,
      promotion:  result.promotion,
      san:        result.san,
      fen:        room.chess.fen(),
      color:      result.color as 'w' | 'b',
      moveNumber: room.moveCount,
    };

    // Broadcast to both players in the game room
    io.to(gameId).emit(EVENTS.RECEIVE_MOVE, movePayload);

    // Check for game over
    if (room.chess.isGameOver()) {
      let endResult: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW';
      let reason: string;

      if (room.chess.isCheckmate()) {
        endResult = room.chess.turn() === 'w' ? 'BLACK_WINS' : 'WHITE_WINS';
        reason = 'checkmate';
      } else {
        endResult = 'DRAW';
        reason = room.chess.isStalemate()           ? 'stalemate'
               : room.chess.isThreefoldRepetition() ? 'threefold repetition'
               : room.chess.isInsufficientMaterial() ? 'insufficient material'
               : '50-move rule';
      }

      await finaliseGame(io, gameId, endResult, reason);
    }
  });

  // ── Resign ───────────────────────────────────────────────────────────────

  socket.on(EVENTS.RESIGN, async () => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const room = activeGames.get(gameId);
    if (!room) return;

    const isWhite = room.whiteSocketId === socket.id;
    await finaliseGame(io, gameId, isWhite ? 'BLACK_WINS' : 'WHITE_WINS', 'resignation');
  });

  // ── Disconnect (mid-game) ─────────────────────────────────────────────────

  socket.on('disconnect', async () => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const room = activeGames.get(gameId);
    if (!room) return;

    const isWhite = room.whiteSocketId === socket.id;

    // Notify opponent before we clean up
    const opponentSocketId = isWhite ? room.blackSocketId : room.whiteSocketId;
    io.to(opponentSocketId).emit(EVENTS.OPPONENT_DISCONNECTED, {});

    await finaliseGame(
      io,
      gameId,
      isWhite ? 'BLACK_WINS' : 'WHITE_WINS',
      'opponent disconnected'
    );
  });
}

// ── Expose lobby snapshot for the lobby state broadcast ──────────────────────

export { getLobbyUsers };

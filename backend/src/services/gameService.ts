import { prisma } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import type { AddMoveBody, EndGameBody } from '../types';

export async function createGame(whiteId: string, blackId?: string) {
  return prisma.game.create({
    data: { whiteId, blackId: blackId ?? null },
    include: { white: { select: { id: true, username: true, rating: true } } },
  });
}

export async function getGameById(id: string) {
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      white: { select: { id: true, username: true, rating: true } },
      black: { select: { id: true, username: true, rating: true } },
      moves: { orderBy: { moveNumber: 'asc' } },
    },
  });
  if (!game) throw new AppError('Game not found', 404);
  return game;
}

export async function getUserGames(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where: { OR: [{ whiteId: userId }, { blackId: userId }] },
      include: {
        white: { select: { id: true, username: true, rating: true } },
        black: { select: { id: true, username: true, rating: true } },
        moves: { orderBy: { moveNumber: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.game.count({
      where: { OR: [{ whiteId: userId }, { blackId: userId }] },
    }),
  ]);

  return { items: games, total, page, pageSize };
}

export async function addMove(gameId: string, body: AddMoveBody) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new AppError('Game not found', 404);
  if (game.result) throw new AppError('Game has already ended', 400);

  return prisma.move.create({
    data: {
      gameId,
      moveNumber: body.moveNumber,
      color: body.color,
      from: body.from,
      to: body.to,
      san: body.san,
      fen: body.fen,
    },
  });
}

export async function endGame(gameId: string, body: EndGameBody, requestingUserId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new AppError('Game not found', 404);
  if (game.result) throw new AppError('Game has already ended', 400);

  // Only a participant can end the game
  if (game.whiteId !== requestingUserId && game.blackId !== requestingUserId) {
    throw new AppError('Forbidden', 403);
  }

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: { result: body.result, pgn: body.pgn, fen: body.fen },
  });

  // Update stats
  await updateStatsForGame(gameId, game.whiteId, game.blackId, body.result);

  return updated;
}

async function updateStatsForGame(
  _gameId: string,
  whiteId: string,
  blackId: string | null,
  result: string
) {
  // Upsert stats for both participants
  const updates: Promise<unknown>[] = [];

  const whiteWon = result === 'WHITE_WINS';
  const blackWon = result === 'BLACK_WINS';
  const isDraw = result === 'DRAW';

  updates.push(
    prisma.gameStats.upsert({
      where: { userId: whiteId },
      create: {
        userId: whiteId,
        wins: whiteWon ? 1 : 0,
        losses: blackWon ? 1 : 0,
        draws: isDraw ? 1 : 0,
      },
      update: {
        wins: { increment: whiteWon ? 1 : 0 },
        losses: { increment: blackWon ? 1 : 0 },
        draws: { increment: isDraw ? 1 : 0 },
      },
    })
  );

  if (blackId) {
    updates.push(
      prisma.gameStats.upsert({
        where: { userId: blackId },
        create: {
          userId: blackId,
          wins: blackWon ? 1 : 0,
          losses: whiteWon ? 1 : 0,
          draws: isDraw ? 1 : 0,
        },
        update: {
          wins: { increment: blackWon ? 1 : 0 },
          losses: { increment: whiteWon ? 1 : 0 },
          draws: { increment: isDraw ? 1 : 0 },
        },
      })
    );
  }

  await Promise.all(updates);
}

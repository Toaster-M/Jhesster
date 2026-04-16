import type { Response, NextFunction } from 'express';
import * as gameService from '../services/gameService';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../types/auth';
import type { AddMoveBody, EndGameBody, CreateGameBody } from '../types';

export async function createGame(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { blackId } = req.body as CreateGameBody;
    const game = await gameService.createGame(req.user.userId, blackId);
    res.status(201).json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

export async function listGames(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) ?? '20', 10);
    const result = await gameService.getUserGames(req.user.userId, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getGame(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const game = await gameService.getGameById(req.params['id'] as string);
    res.json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

export async function addMove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const move = await gameService.addMove(req.params['id'] as string, req.body as AddMoveBody);
    res.status(201).json({ success: true, data: move });
  } catch (err) {
    next(err);
  }
}

export async function endGame(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const game = await gameService.endGame(req.params['id'] as string, req.body as EndGameBody, req.user.userId);
    res.json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

import type { Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../types/auth';

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getUserById(req.params['id'] as string);
    res.json({
      success: true,
      data: { id: user.id, username: user.username, rating: user.rating, createdAt: user.createdAt },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    if (req.user.userId !== req.params['id'] as string) throw new AppError('Forbidden', 403);

    const { username, email } = req.body as { username?: string; email?: string };
    const user = await userService.updateUser(req.params['id'] as string, { username, email });

    res.json({
      success: true,
      data: { id: user.id, username: user.username, email: user.email, rating: user.rating },
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await userService.getUserStats(req.params['id'] as string);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

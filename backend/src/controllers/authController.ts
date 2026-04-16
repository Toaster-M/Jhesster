import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import * as userService from '../services/userService';
import { AppError } from '../middleware/errorHandler';
import type { RegisterBody, LoginBody, AuthRequest } from '../types/auth';

function signToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = req.body as RegisterBody;

    if (!username || !email || !password) {
      throw new AppError('username, email and password are required', 400);
    }
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const user = await userService.createUser({ username, email, password });
    const token = signToken(user.id, user.username);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, rating: user.rating },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await userService.getUserByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await userService.verifyPassword(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = signToken(user.id, user.username);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, rating: user.rating },
      },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  // JWT is stateless — client deletes the token. This endpoint exists for completeness.
  res.json({ success: true, message: 'Logged out' });
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const user = await userService.getUserById(req.user.userId);
    res.json({
      success: true,
      data: { id: user.id, username: user.username, email: user.email, rating: user.rating },
    });
  } catch (err) {
    next(err);
  }
}

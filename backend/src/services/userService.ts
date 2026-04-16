import { prisma } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import type { RegisterBody } from '../types/auth';

export async function createUser(body: RegisterBody) {
  const { username, email, password } = body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (existing.email === email) throw new AppError('Email already in use', 409);
    throw new AppError('Username already taken', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { username, email, passwordHash },
  });

  // Create default stats row
  await prisma.gameStats.create({ data: { userId: user.id } });

  return user;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function updateUser(id: string, data: Partial<{ username: string; email: string }>) {
  const user = await prisma.user.update({ where: { id }, data });
  return user;
}

export async function getUserStats(userId: string) {
  const stats = await prisma.gameStats.findUnique({ where: { userId } });
  if (!stats) throw new AppError('Stats not found', 404);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rating: true },
  });

  return { ...stats, rating: user?.rating ?? 1200 };
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

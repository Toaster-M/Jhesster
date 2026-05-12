import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/client'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

type UserRecord = typeof users.$inferSelect

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

function omitHash({ passwordHash: _ph, ...safe }: UserRecord) {
  return safe
}

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body as {
    username?: string
    email?: string
    password?: string
  }

  if (!username || !/^[a-zA-Z0-9]{3,32}$/.test(username)) {
    res.status(400).json({ error: 'Username must be 3–32 alphanumeric characters' })
    return
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email address' })
    return
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const [user] = await db.insert(users).values({ username, email, passwordHash }).returning()
    res.status(201).json({ token: signToken(user.id), user: omitHash(user) })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      res.status(409).json({ error: 'Username or email already taken' })
    } else {
      res.status(500).json({ error: 'Registration failed' })
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email))
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    res.json({ token: signToken(user.id), user: omitHash(user) })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId))
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(omitHash(user))
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

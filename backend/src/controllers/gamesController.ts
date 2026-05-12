import { Request, Response } from 'express'
import { db } from '../db/client'
import { savedGames } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'

export async function saveGame(req: Request, res: Response): Promise<void> {
  const { mode, pgn, fen } = req.body as {
    mode?: string
    pgn?: string
    fen?: string
  }

  if (!mode || !pgn || !fen) {
    res.status(400).json({ error: 'mode, pgn, and fen are required' })
    return
  }
  if (mode !== 'vs_ai' && mode !== 'local_pvp') {
    res.status(400).json({ error: 'mode must be vs_ai or local_pvp' })
    return
  }

  try {
    const [game] = await db
      .insert(savedGames)
      .values({ userId: req.user!.userId, mode, pgn, fen })
      .returning()
    res.status(201).json(game)
  } catch {
    res.status(500).json({ error: 'Failed to save game' })
  }
}

export async function listSavedGames(req: Request, res: Response): Promise<void> {
  try {
    const games = await db
      .select()
      .from(savedGames)
      .where(eq(savedGames.userId, req.user!.userId))
    res.json(games)
  } catch {
    res.status(500).json({ error: 'Failed to fetch saved games' })
  }
}

export async function shareGame(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id'])
  try {
    const [game] = await db
      .select()
      .from(savedGames)
      .where(and(eq(savedGames.id, id), eq(savedGames.userId, req.user!.userId)))

    if (!game) {
      res.status(404).json({ error: 'Game not found' })
      return
    }

    if (game.shareToken) {
      res.json({ shareToken: game.shareToken })
      return
    }

    const shareToken = randomBytes(15).toString('base64url').slice(0, 21)
    const [updated] = await db
      .update(savedGames)
      .set({ shareToken })
      .where(eq(savedGames.id, id))
      .returning()

    res.json({ shareToken: updated.shareToken })
  } catch {
    res.status(500).json({ error: 'Failed to generate share link' })
  }
}

export async function getSharedGame(req: Request, res: Response): Promise<void> {
  const token = String(req.params['token'])
  try {
    const [game] = await db
      .select()
      .from(savedGames)
      .where(eq(savedGames.shareToken, token))

    if (!game) {
      res.status(404).json({ error: 'Shared game not found' })
      return
    }
    res.json({ pgn: game.pgn, mode: game.mode })
  } catch {
    res.status(500).json({ error: 'Failed to fetch shared game' })
  }
}

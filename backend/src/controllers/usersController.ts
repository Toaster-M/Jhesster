import { Request, Response } from 'express'
import { db } from '../db/client'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const { boardLightColor, boardDarkColor, pieceLightColor, pieceDarkColor } = req.body as {
    boardLightColor?: string
    boardDarkColor?: string
    pieceLightColor?: string
    pieceDarkColor?: string
  }

  const updates: Partial<typeof users.$inferInsert> = {}

  if (boardLightColor !== undefined) {
    if (!HEX_COLOR.test(boardLightColor)) {
      res.status(400).json({ error: 'Invalid boardLightColor' })
      return
    }
    updates.boardLightColor = boardLightColor
  }
  if (boardDarkColor !== undefined) {
    if (!HEX_COLOR.test(boardDarkColor)) {
      res.status(400).json({ error: 'Invalid boardDarkColor' })
      return
    }
    updates.boardDarkColor = boardDarkColor
  }
  if (pieceLightColor !== undefined) {
    if (!HEX_COLOR.test(pieceLightColor)) {
      res.status(400).json({ error: 'Invalid pieceLightColor' })
      return
    }
    updates.pieceColorLight = pieceLightColor
  }
  if (pieceDarkColor !== undefined) {
    if (!HEX_COLOR.test(pieceDarkColor)) {
      res.status(400).json({ error: 'Invalid pieceDarkColor' })
      return
    }
    updates.pieceColorDark = pieceDarkColor
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No valid fields provided' })
    return
  }

  try {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, req.user!.userId))
      .returning()

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    const { passwordHash: _ph, ...safe } = user
    res.json(safe)
  } catch {
    res.status(500).json({ error: 'Failed to update settings' })
  }
}

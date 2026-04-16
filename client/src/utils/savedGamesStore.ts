import type { SavedGame } from '../types/chess';

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'jhesster_saved_games';
const MAX_SAVES = 10; // cap to prevent localStorage bloat

// ── CRUD helpers — read, write, delete saved games from localStorage ──────────

export function getSavedGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedGame[]) : [];
  } catch {
    return [];
  }
}

export function persistSavedGame(
  game: Omit<SavedGame, 'id' | 'savedAt'>,
): SavedGame {
  const saved: SavedGame = {
    ...game,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
  };
  const existing = getSavedGames();
  const updated = [saved, ...existing].slice(0, MAX_SAVES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return saved;
}

export function deleteSavedGame(id: string): void {
  const existing = getSavedGames();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(existing.filter((g) => g.id !== id)),
  );
}

/**
 * Lightweight preferences store backed by localStorage.
 * Kept separate from gameStore so it survives game resets.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppPreferences } from '../types/chess';

export const DEFAULT_PREFS: AppPreferences = {
  boardTheme:        'classic',
  animationsEnabled: true,
  soundEnabled:      false,
  lastDifficulty:    3,
  autoFlipInPvP:     true,
  customBoard: {
    light: '#e8d5b7',
    dark:  '#9e6b3f',
  },
  pieceColors: {
    white: '#ffffff',
    black: '#1a1a1a',
  },
  boardFrame: {
    background: '#5c3418',
    labelColor: '#ffe6be',
  },
};

interface PrefsStore {
  prefs: AppPreferences;
  setPrefs: (prefs: AppPreferences) => void;
  setPref: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void;
}

export const usePrefsStore = create<PrefsStore>()(
  persist(
    (set) => ({
      prefs: DEFAULT_PREFS,
      setPrefs: (prefs) => set({ prefs }),
      setPref: (key, value) =>
        set((state) => ({ prefs: { ...state.prefs, [key]: value } })),
    }),
    {
      name: 'jhesster-prefs',
      // Merge stored value with defaults so new fields are always present
      merge: (persisted, current) => ({
        ...current,
        prefs: {
          ...DEFAULT_PREFS,
          ...(persisted as Partial<PrefsStore>).prefs,
        },
      }),
    }
  )
);

// ── Board theme colour maps — preset themes ───────────────────────────────────

export type BoardThemeColors = {
  light:    string;
  dark:     string;
  selected: string;
  legal:    string;
  lastMove: string;
};

const PRESET_THEMES: Record<
  Exclude<AppPreferences['boardTheme'], 'custom'>,
  BoardThemeColors
> = {
  classic: {
    light:    '#f0d9b5',
    dark:     '#b58863',
    selected: '#f6f669',
    legal:    'rgba(0,0,0,0.20)',
    lastMove: 'rgba(246,246,105,0.50)',
  },
  forest: {
    light:    '#ffffdd',
    dark:     '#86a666',
    selected: '#cdd16e',
    legal:    'rgba(0,0,0,0.18)',
    lastMove: 'rgba(205,209,110,0.55)',
  },
  ocean: {
    light:    '#dee3e6',
    dark:     '#4f93b9',
    selected: '#75c0e6',
    legal:    'rgba(0,0,0,0.18)',
    lastMove: 'rgba(117,192,230,0.50)',
  },
  midnight: {
    light:    '#9599a7',
    dark:     '#383b4d',
    selected: '#646a8a',
    legal:    'rgba(255,255,255,0.18)',
    lastMove: 'rgba(100,106,138,0.55)',
  },
};

/**
 * Keep this export so Square.tsx's existing `typeof BOARD_THEMES` type reference
 * still compiles.  It now only covers the preset themes.
 */
export const BOARD_THEMES = PRESET_THEMES;

/**
 * Returns the resolved theme colours for the current preferences,
 * handling both presets and the 'custom' theme.
 */
export function getBoardTheme(prefs: AppPreferences): BoardThemeColors {
  if (prefs.boardTheme !== 'custom') {
    return PRESET_THEMES[prefs.boardTheme];
  }
  const { light, dark } = prefs.customBoard;
  return {
    light,
    dark,
    selected: 'rgba(255, 255, 0, 0.65)',
    legal:    'rgba(0, 0, 0, 0.25)',
    lastMove: 'rgba(255, 255, 0, 0.40)',
  };
}

import type { AppPreferences, BoardTheme } from '../../types/chess';
import Slider from '../UI/Slider';

interface SettingsModalProps {
  prefs: AppPreferences;
  onPrefsChange: (prefs: AppPreferences) => void;
  difficulty: number;
  onDifficultyChange: (d: number) => void;
  onClose: () => void;
  isInGame?: boolean;
}

// ── Preset theme definitions (for swatches) ───────────────────────────────────

const PRESET_THEMES: { id: Exclude<BoardTheme, 'custom'>; label: string; light: string; dark: string }[] = [
  { id: 'classic',  label: 'Classic',  light: '#f0d9b5', dark: '#b58863' },
  { id: 'forest',   label: 'Forest',   light: '#ffffdd', dark: '#86a666' },
  { id: 'ocean',    label: 'Ocean',    light: '#dee3e6', dark: '#4f93b9' },
  { id: 'midnight', label: 'Midnight', light: '#9599a7', dark: '#383b4d' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label:        string;
  checked:      boolean;
  onChange:     (v: boolean) => void;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group">
      <div>
        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? 'bg-emerald-500' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

/**
 * A colour-picker swatch: clicking opens the native colour picker.
 * The swatch shows the current colour and an optional label below.
 */
function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label:    string;
  value:    string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-12 h-10 rounded-lg overflow-hidden border-2 border-white/20 cursor-pointer hover:border-white/40 transition-colors">
        <div className="absolute inset-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title={label}
        />
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight max-w-14">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SettingsModal({
  prefs,
  onPrefsChange,
  difficulty,
  onDifficultyChange,
  onClose,
  isInGame = false,
}: SettingsModalProps) {
  const set = (patch: Partial<AppPreferences>) =>
    onPrefsChange({ ...prefs, ...patch });

  const setCustomBoard = (patch: Partial<AppPreferences['customBoard']>) =>
    set({ customBoard: { ...prefs.customBoard, ...patch }, boardTheme: 'custom' });

  const setPieceColor = (side: 'white' | 'black', color: string) =>
    set({ pieceColors: { ...prefs.pieceColors, [side]: color } });

  const resetPieceColors = () =>
    set({ pieceColors: { white: '#ffffff', black: '#1a1a1a' } });

  // Preview colours for the custom board swatch in the theme grid
  const customLight = prefs.customBoard.light;
  const customDark  = prefs.customBoard.dark;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black/70 p-4">
      <div
        className="modal-box bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-6 max-h-[75vh] overflow-y-auto scrollbar-thin">

          {/* AI Difficulty */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              AI Difficulty {isInGame && <span className="text-yellow-500 ml-1">(applies next game)</span>}
            </h3>
            <Slider value={difficulty} min={1} max={5} onChange={onDifficultyChange} />
          </section>

          {/* Board Theme — presets + custom */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Board Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => set({ boardTheme: t.id })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    prefs.boardTheme === t.id
                      ? 'border-emerald-400 bg-emerald-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="flex gap-0.5 shrink-0">
                    {[0, 1].map((r) =>
                      [0, 1].map((c) => (
                        <span
                          key={`${r}-${c}`}
                          className="w-3 h-3 rounded-sm"
                          style={{ background: (r + c) % 2 === 0 ? t.light : t.dark }}
                        />
                      ))
                    )}
                  </span>
                  {t.label}
                </button>
              ))}

              {/* Custom theme button */}
              <button
                onClick={() => set({ boardTheme: 'custom' })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all col-span-2 ${
                  prefs.boardTheme === 'custom'
                    ? 'border-emerald-400 bg-emerald-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="flex gap-0.5 shrink-0">
                  {[0, 1].map((r) =>
                    [0, 1].map((c) => (
                      <span
                        key={`${r}-${c}`}
                        className="w-3 h-3 rounded-sm"
                        style={{ background: (r + c) % 2 === 0 ? customLight : customDark }}
                      />
                    ))
                  )}
                </span>
                Custom colors
                {prefs.boardTheme !== 'custom' && (
                  <span className="ml-auto text-xs text-gray-600">click to activate</span>
                )}
              </button>
            </div>

            {/* Custom board color pickers — visible when custom is active */}
            {prefs.boardTheme === 'custom' && (
              <div className="flex flex-col gap-3 bg-white/4 rounded-xl border border-white/10 p-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Square colours</p>
                <div className="flex gap-6 items-start">
                  <ColorSwatch
                    label="Light squares"
                    value={prefs.customBoard.light}
                    onChange={(v) => setCustomBoard({ light: v })}
                  />
                  <ColorSwatch
                    label="Dark squares"
                    value={prefs.customBoard.dark}
                    onChange={(v) => setCustomBoard({ dark: v })}
                  />
                </div>
                {/* Live mini-board preview */}
                <div className="flex gap-0.5 self-start rounded overflow-hidden border border-white/10">
                  {[0,1,2,3].map((r) =>
                    [0,1,2,3].map((c) => (
                      <span
                        key={`${r}-${c}`}
                        className="w-5 h-5"
                        style={{ background: (r + c) % 2 === 0 ? prefs.customBoard.light : prefs.customBoard.dark }}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Board Frame */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Board Frame</h3>
            <div className="flex flex-col gap-3 bg-white/4 rounded-xl border border-white/10 p-4">
              <div className="flex gap-6 items-start">
                <ColorSwatch
                  label="Frame color"
                  value={prefs.boardFrame.background}
                  onChange={(v) => set({ boardFrame: { ...prefs.boardFrame, background: v } })}
                />
                <ColorSwatch
                  label="Label color"
                  value={prefs.boardFrame.labelColor}
                  onChange={(v) => set({ boardFrame: { ...prefs.boardFrame, labelColor: v } })}
                />
              </div>
              {/* Live preview */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded px-3 py-1 text-xs font-bold font-mono"
                  style={{ background: prefs.boardFrame.background, color: prefs.boardFrame.labelColor }}
                >
                  a1 → h8
                </div>
                <p className="text-xs text-gray-600">Live preview</p>
              </div>
            </div>
          </section>

          {/* Piece Colors */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Piece Colours</h3>
              <button
                onClick={resetPieceColors}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="flex flex-col gap-3 bg-white/4 rounded-xl border border-white/10 p-4">
              <div className="flex gap-6 items-start">
                <ColorSwatch
                  label="White side"
                  value={prefs.pieceColors.white}
                  onChange={(v) => setPieceColor('white', v)}
                />
                <ColorSwatch
                  label="Black side"
                  value={prefs.pieceColors.black}
                  onChange={(v) => setPieceColor('black', v)}
                />
              </div>
              {/* Piece preview */}
              <div className="flex gap-3 items-center">
                {(['♚', '♛', '♜', '♝', '♞', '♟'] as const).map((g, i) => (
                  <span
                    key={i}
                    className="text-2xl leading-none select-none"
                    style={{
                      color:      i % 2 === 0 ? prefs.pieceColors.white : prefs.pieceColors.black,
                      textShadow: i % 2 === 0
                        ? '0 1px 3px rgba(0,0,0,0.9)'
                        : '0 1px 2px rgba(255,255,255,0.6)',
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600">Preview shown against the dark background</p>
            </div>
          </section>

          {/* General preferences */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preferences</h3>
            <Toggle
              label="Animations"
              description="Piece drops, square highlights, modal transitions"
              checked={prefs.animationsEnabled}
              onChange={(v) => set({ animationsEnabled: v })}
            />
            <Toggle
              label="Auto-flip in PvP"
              description="Board rotates after each move so current player faces their pieces"
              checked={prefs.autoFlipInPvP}
              onChange={(v) => set({ autoFlipInPvP: v })}
            />
            <Toggle
              label="Sound"
              description="Move sounds (coming soon)"
              checked={prefs.soundEnabled}
              onChange={(v) => set({ soundEnabled: v })}
            />
          </section>
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SavedGame } from '../../types/chess';
import { deleteSavedGame } from '../../utils/savedGamesStore';

interface SavedGamesDropdownProps {
  games: SavedGame[];
  mode: 'vs-ai' | 'local-multiplayer';
  /** Called when user selects a game to resume. */
  onLoad: (game: SavedGame) => void;
  /** Called after a delete so the parent can re-fetch the list. */
  onDelete: () => void;
  /** Extra classes forwarded to the trigger button (e.g. to match height). */
  triggerClassName?: string;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SavedGamesDropdown({
  games,
  mode,
  onLoad,
  onDelete,
  triggerClassName = '',
}: SavedGamesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filtered = games.filter((g) => g.mode === mode);

  // Position and open the panel
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        width: 288, // w-72
        zIndex: 9999,
      });
    }
    setOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('[data-saved-games-panel]')
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSavedGame(id);
    onDelete();
    if (filtered.length <= 1) setOpen(false);
  };

  const panel = open ? (
    <div
      data-saved-games-panel
      style={{
        ...panelStyle,
        backgroundColor: '#1c1e30',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.9)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          Saved games
        </p>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          No saved games for this mode
        </div>
      ) : (
        <div style={{ maxHeight: 288, overflowY: 'auto' }}>
          {filtered.map((game) => (
            <button
              key={game.id}
              onClick={() => { onLoad(game); setOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'inherit',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {game.title}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                  {game.moveCount} move{game.moveCount !== 1 ? 's' : ''} · {formatDate(game.savedAt)}
                </p>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handleDelete(e, game.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleDelete(e as unknown as React.MouseEvent, game.id)}
                style={{ color: '#4b5563', fontSize: 12, padding: '0 4px', flexShrink: 0, cursor: 'pointer' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#f87171')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#4b5563')}
                aria-label={`Delete ${game.title}`}
              >
                ✕
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={handleToggle}
        title={filtered.length === 0 ? 'No saved games' : `${filtered.length} saved game${filtered.length !== 1 ? 's' : ''}`}
        aria-label="Load saved game"
        className={`flex items-center justify-center rounded-xl transition-all ${
          open
            ? 'bg-white/20 text-white'
            : 'bg-white/8 text-gray-400 hover:bg-white/15 hover:text-white'
        } ${triggerClassName}`}
      >
        <span className="text-base leading-none">
          {filtered.length > 0 ? '📂' : '📁'}
        </span>
        {filtered.length > 0 && (
          <span className="ml-1 text-xs font-bold text-gray-300">{filtered.length}</span>
        )}
      </button>

      {createPortal(panel, document.body)}
    </div>
  );
}

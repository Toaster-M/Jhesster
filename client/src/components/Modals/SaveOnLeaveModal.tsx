import { useState } from 'react';

interface SaveOnLeaveModalProps {
  defaultTitle?: string;
  onSave: (title: string) => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function SaveOnLeaveModal({
  defaultTitle = '',
  onSave,
  onDiscard,
  onCancel,
}: SaveOnLeaveModalProps) {
  const [title, setTitle] = useState(defaultTitle);

  const handleSave = () => {
    const trimmed = title.trim();
    if (trimmed) onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-bold text-white">Save before leaving?</h2>
          <p className="text-sm text-gray-400 mt-1">
            You can resume this game later from the main menu.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
            Game title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
            autoFocus
            placeholder="e.g. My game vs AI"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            Save &amp; Leave
          </button>
          <button
            onClick={onDiscard}
            className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-gray-300 font-semibold text-sm transition-all"
          >
            Leave without saving
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors text-center py-1"
          >
            Cancel (stay in game)
          </button>
        </div>
      </div>
    </div>
  );
}

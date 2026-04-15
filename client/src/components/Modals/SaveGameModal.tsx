import { useState } from 'react';

interface SaveGameModalProps {
  defaultTitle?: string;
  onSave: (title: string) => void;
  onCancel: () => void;
}

export default function SaveGameModal({
  defaultTitle = '',
  onSave,
  onCancel,
}: SaveGameModalProps) {
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
        <h2 className="text-lg font-bold text-white">Save Game</h2>

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

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-gray-300 font-semibold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import type { Move } from '../../types/chess';
import { groupMovePairs } from '../../utils/chessHelpers';

interface MoveHistoryProps {
  history: Move[];
}

export default function MoveHistory({ history }: MoveHistoryProps) {
  const pairs = groupMovePairs(history);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMoveIndex = history.length - 1;

  // Auto-scroll to latest move
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history.length]);

  if (pairs.length === 0) {
    return (
      <p className="text-gray-500 text-xs italic px-1">No moves yet — make your first move!</p>
    );
  }

  return (
    <div className="overflow-y-auto max-h-56 pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {pairs.map((pair, pairIdx) => {
        const whiteIdx = pairIdx * 2;
        const blackIdx = pairIdx * 2 + 1;
        const isWhiteLatest = lastMoveIndex === whiteIdx;
        const isBlackLatest = lastMoveIndex === blackIdx;

        return (
          <div key={pair.number} className="flex items-center gap-1 text-sm font-mono leading-relaxed">
            {/* Move number */}
            <span className="w-7 text-gray-500 text-xs shrink-0 text-right select-none">
              {pair.number}.
            </span>

            {/* White move */}
            <span
              className={`min-w-[4.5rem] px-1 rounded ${
                isWhiteLatest
                  ? 'bg-yellow-400/20 text-yellow-300 font-semibold'
                  : 'text-gray-200'
              }`}
            >
              {pair.white}
            </span>

            {/* Black move */}
            {pair.black !== null && (
              <span
                className={`min-w-[4.5rem] px-1 rounded ${
                  isBlackLatest
                    ? 'bg-yellow-400/20 text-yellow-300 font-semibold'
                    : 'text-gray-300'
                }`}
              >
                {pair.black}
              </span>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

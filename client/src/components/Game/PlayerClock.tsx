interface PlayerClockProps {
  timeMs:   number;
  isActive: boolean;
  name:     string;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSec = Math.ceil(ms / 1000);
  const hours    = Math.floor(totalSec / 3600);
  const minutes  = Math.floor((totalSec % 3600) / 60);
  const seconds  = totalSec % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function PlayerClock({ timeMs, isActive, name }: PlayerClockProps) {
  const flagged  = timeMs <= 0;
  const lowTime  = timeMs > 0 && timeMs < 30_000;
  const critical = timeMs > 0 && timeMs < 10_000;

  const containerClass = [
    'flex items-center justify-between px-3 py-2 rounded-xl border transition-all w-full',
    isActive && !flagged
      ? 'bg-white/10 border-white/20'
      : 'bg-white/3 border-white/8',
  ].join(' ');

  const timeClass = [
    'font-mono font-bold tabular-nums transition-colors',
    flagged   ? 'text-red-400 text-lg'
    : critical ? 'text-red-400 text-lg animate-pulse'
    : lowTime  ? 'text-amber-400 text-lg'
    : isActive ? 'text-white text-lg'
    :            'text-gray-400 text-base',
  ].join(' ');

  return (
    <div className={containerClass}>
      <span className={`text-sm font-semibold truncate mr-3 ${isActive && !flagged ? 'text-white' : 'text-gray-500'}`}>
        {name}
      </span>
      <span className={timeClass}>
        {flagged ? 'Flag' : formatTime(timeMs)}
      </span>
    </div>
  );
}

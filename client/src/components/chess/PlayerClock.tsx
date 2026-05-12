interface PlayerClockProps {
  seconds: number
  active: boolean
  label: string
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function PlayerClock({ seconds, active, label }: PlayerClockProps) {
  const low = seconds <= 30 && seconds > 0
  const critical = seconds <= 10 && seconds > 0
  const flagged = seconds === 0

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
        active
          ? critical
            ? 'bg-red-600 animate-pulse'
            : low
              ? 'bg-amber-500'
              : 'bg-[#2d3561]'
          : 'bg-[#16213e]'
      }`}
    >
      <span className="text-sm text-[#8892b0]">{label}</span>
      <span
        className={`font-mono text-xl font-bold tabular-nums ${
          flagged ? 'text-red-400' : active ? 'text-white' : 'text-[#8892b0]'
        }`}
      >
        {flagged ? '0:00' : fmt(seconds)}
      </span>
    </div>
  )
}

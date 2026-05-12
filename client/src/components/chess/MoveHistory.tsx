interface Move {
  san: string
  color: string
}

interface MoveHistoryProps {
  moves: Move[]
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const pairs: Array<{ white?: string; black?: string; num: number }> = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, white: moves[i]?.san, black: moves[i + 1]?.san })
  }

  return (
    <div className="bg-[#16213e] rounded-lg p-3 overflow-y-auto max-h-48 text-sm">
      {pairs.length === 0 ? (
        <p className="text-[#8892b0] text-xs text-center">No moves yet</p>
      ) : (
        <div className="space-y-0.5">
          {pairs.map(({ num, white, black }) => (
            <div key={num} className="grid grid-cols-[2rem_1fr_1fr] gap-1">
              <span className="text-[#8892b0]">{num}.</span>
              <span className="text-white font-mono">{white ?? ''}</span>
              <span className="text-[#8892b0] font-mono">{black ?? ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

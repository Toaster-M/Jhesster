interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  labels?: string[];
  disabled?: boolean;
}

const DEFAULT_LABELS_5 = ['Beginner', 'Easy', 'Medium', 'Hard', 'Master'];

export default function Slider({ value, min, max, onChange, labels, disabled = false }: SliderProps) {
  const steps = max - min + 1;
  const defaultLabels = steps === 5 ? DEFAULT_LABELS_5 : undefined;
  const displayLabels = labels ?? defaultLabels;

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Difficulty</span>
        <span className="text-sm font-bold text-white">
          {displayLabels ? displayLabels[value - min] : value}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Native input (invisible, on top) */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Custom thumb */}
        <div
          className="absolute w-5 h-5 rounded-full bg-white shadow-md border-2 border-emerald-400 pointer-events-none transition-all duration-150"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between">
        {Array.from({ length: steps }, (_, i) => (
          <button
            key={i}
            onClick={() => !disabled && onChange(min + i)}
            disabled={disabled}
            className={`text-xs transition-colors ${
              value === min + i ? 'text-emerald-400 font-bold' : 'text-gray-600 hover:text-gray-400'
            } disabled:cursor-not-allowed`}
          >
            {min + i}
          </button>
        ))}
      </div>
    </div>
  );
}

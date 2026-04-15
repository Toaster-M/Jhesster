import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

interface MoveInputProps {
  onMove: (notation: string) => boolean;
  disabled?: boolean;
  placeholder?: string;
}

type ValidationState = 'idle' | 'valid' | 'invalid';

export default function MoveInput({ onMove, disabled = false, placeholder = 'e2e4 · Nf3 · knight to a3…' }: MoveInputProps) {
  const [value, setValue] = useState('');
  const [validation, setValidation] = useState<ValidationState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const success = onMove(trimmed);

    if (success) {
      setValue('');
      setValidation('idle');
    } else {
      setValidation('invalid');
      // Flash red then reset
      setTimeout(() => setValidation('idle'), 1200);
    }
  }, [value, onMove]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') {
      setValue('');
      setValidation('idle');
    }
  };

  const borderColor =
    validation === 'valid'
      ? 'border-emerald-400 ring-1 ring-emerald-400'
      : validation === 'invalid'
      ? 'border-red-400 ring-1 ring-red-400 animate-shake'
      : 'border-white/20 focus-within:border-white/40';

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Enter Move
      </label>
      <div className={`flex rounded-lg border bg-white/5 overflow-hidden transition-all ${borderColor}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setValidation('idle');
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={40}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 outline-none font-mono disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border-l border-white/10"
        >
          Go
        </button>
      </div>
      {validation === 'invalid' && (
        <p className="text-xs text-red-400">Illegal move — try again</p>
      )}
      <p className="text-xs text-gray-600">
        <span className="font-mono text-gray-500">e2e4</span>{' '}·{' '}
        <span className="font-mono text-gray-500">Nf3</span>{' '}·{' '}
        <span className="font-mono text-gray-500">O-O</span>{' '}·{' '}
        <span className="text-gray-500">knight to a3</span>{' '}·{' '}
        <span className="text-gray-500">rook e1 to e4</span>
      </p>
    </div>
  );
}

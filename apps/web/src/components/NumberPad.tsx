import { memo } from 'react';
import { Language, getTranslation } from '@sudoku/core';

interface NumberPadProps {
  onInput: (value: number) => void;
  onClear: () => void;
  lang: Language;
}

export const NumberPad = memo(function NumberPad({ onInput, onClear, lang }: NumberPadProps) {
  return (
    <div className="num-pad">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
        <button type="button" key={n} onClick={() => onInput(n)}>
          {n}
        </button>
      ))}
      <button type="button" className="clear" onClick={onClear}>
        {getTranslation('clear', lang)}
      </button>
    </div>
  );
});

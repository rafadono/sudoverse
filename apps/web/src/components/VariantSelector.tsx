import { VariantType, Language, getTranslation } from '@sudoku/core';

interface VariantSelectorProps {
  value: VariantType;
  onChange: (variant: VariantType) => void;
  lang: Language;
}

export function VariantSelector({ value, onChange, lang }: VariantSelectorProps) {
  return (
    <label className="variant-selector">
      {getTranslation('variant', lang)}
      <select value={value} onChange={(e) => onChange(e.target.value as VariantType)}>
        <option value="classic">{getTranslation('classic', lang)}</option>
        <option value="diagonal">{getTranslation('diagonal', lang)}</option>
        <option value="killer">{getTranslation('killer', lang)}</option>
        <option value="hyper">{getTranslation('hyper', lang)}</option>
        <option value="jigsaw">{getTranslation('jigsaw', lang)}</option>
        <option value="sandwich">{getTranslation('sandwich', lang)}</option>
        <option value="thermo">{getTranslation('thermo', lang)}</option>
        <option value="arrow">{getTranslation('arrow', lang)}</option>
      </select>
    </label>
  );
}

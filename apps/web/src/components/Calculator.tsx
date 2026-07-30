import { useState } from 'react';
import { Language, getTranslation } from '@sudoku/core';

interface CalculatorProps {
  onClose: () => void;
  lang: Language;
}

export function Calculator({ onClose, lang }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operator, setOperator] = useState<'+' | '-' | null>(null);
  const [newInput, setNewInput] = useState(true);

  const handleDigit = (digit: string) => {
    if (newInput || display === '0') {
      setDisplay(digit);
      setNewInput(false);
    } else {
      if (display.length < 10) {
        setDisplay(display + digit);
      }
    }
  };

  const handleOp = (op: '+' | '-') => {
    const current = parseFloat(display);
    if (prevVal !== null && operator && !newInput) {
      const result = calculate(prevVal, current, operator);
      setDisplay(String(result));
      setPrevVal(result);
    } else {
      setPrevVal(current);
    }
    setOperator(op);
    setNewInput(true);
  };

  const calculate = (a: number, b: number, op: '+' | '-'): number => {
    return op === '+' ? a + b : a - b;
  };

  const handleEquals = () => {
    if (prevVal !== null && operator) {
      const current = parseFloat(display);
      const result = calculate(prevVal, current, operator);
      setDisplay(String(result));
      setPrevVal(null);
      setOperator(null);
      setNewInput(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperator(null);
    setNewInput(true);
  };

  return (
    <div className="calculator-widget">
      <div className="calculator-header">
        <span>{getTranslation('calculatorTitle', lang)}</span>
        <button
          type="button"
          className="calc-close-btn"
          onClick={onClose}
          aria-label="Close calculator"
        >
          ✕
        </button>
      </div>

      <div className="calculator-screen">{display}</div>

      <div className="calculator-grid">
        <button type="button" className="calc-btn op-clear" onClick={handleClear}>
          C
        </button>
        <button type="button" className="calc-btn op" onClick={() => handleOp('+')}>
          +
        </button>
        <button type="button" className="calc-btn op" onClick={() => handleOp('-')}>
          -
        </button>

        <button type="button" className="calc-btn num" onClick={() => handleDigit('7')}>
          7
        </button>
        <button type="button" className="calc-btn num" onClick={() => handleDigit('8')}>
          8
        </button>
        <button type="button" className="calc-btn num" onClick={() => handleDigit('9')}>
          9
        </button>

        <button type="button" className="calc-btn num" onClick={() => handleDigit('4')}>
          4
        </button>
        <button type="button" className="calc-btn num" onClick={() => handleDigit('5')}>
          5
        </button>
        <button type="button" className="calc-btn num" onClick={() => handleDigit('6')}>
          6
        </button>

        <button type="button" className="calc-btn num" onClick={() => handleDigit('1')}>
          1
        </button>
        <button type="button" className="calc-btn num" onClick={() => handleDigit('2')}>
          2
        </button>
        <button type="button" className="calc-btn num" onClick={() => handleDigit('3')}>
          3
        </button>

        <button type="button" className="calc-btn num zero" onClick={() => handleDigit('0')}>
          0
        </button>
        <button type="button" className="calc-btn equals" onClick={handleEquals}>
          =
        </button>
      </div>
    </div>
  );
}

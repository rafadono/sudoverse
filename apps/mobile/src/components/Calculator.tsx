import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Language, getTranslation } from '@sudoku/core';

interface CalculatorProps {
  onClose: () => void;
  lang: Language;
}

function calculate(a: number, b: number, op: '+' | '-'): number {
  return op === '+' ? a + b : a - b;
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
    } else if (display.length < 10) {
      setDisplay(display + digit);
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

  const digitRows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
  ];

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{getTranslation('calculatorTitle', lang)}</Text>
        <TouchableOpacity onPress={onClose} accessibilityLabel="Close calculator">
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.screen}>{display}</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={[styles.btn, styles.opClear]} onPress={handleClear}>
          <Text style={styles.btnText}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.op]} onPress={() => handleOp('+')}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.op]} onPress={() => handleOp('-')}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>

        {digitRows.map((row) =>
          row.map((digit) => (
            <TouchableOpacity
              key={digit}
              style={[styles.btn, styles.num]}
              onPress={() => handleDigit(digit)}
            >
              <Text style={styles.btnText}>{digit}</Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={[styles.btn, styles.num, styles.zero]}
          onPress={() => handleDigit('0')}
        >
          <Text style={styles.btnText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.equals]} onPress={handleEquals}>
          <Text style={styles.btnText}>=</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    width: 220,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: '#f8fafc', fontWeight: '700', fontSize: 13 },
  closeBtn: { color: '#f8fafc', fontWeight: '700', fontSize: 14, paddingHorizontal: 4 },
  screen: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
    padding: 10,
    borderRadius: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  btn: {
    width: 62,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
  },
  num: { backgroundColor: '#475569' },
  zero: { width: 132 },
  op: { backgroundColor: '#2563eb' },
  opClear: { backgroundColor: '#dc2626' },
  equals: { width: 132, backgroundColor: '#059669' },
  btnText: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
});

import React, { useState } from 'react';
import { ChevronLeft, Delete, History, RotateCcw } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

export default function CalculatorApp({ onBack }: { onBack: () => void }) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [historyTape, setHistoryTape] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleDigit = (d: string) => {
    playClickSound(850, 0.02);
    if (overwrite || display === '0') {
      setDisplay(d);
      setOverwrite(false);
    } else {
      if (display.length < 12) {
        setDisplay(display + d);
      }
    }
  };

  const handleDecimal = () => {
    playClickSound(850, 0.02);
    if (overwrite) {
      setDisplay('0.');
      setOverwrite(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (op: string) => {
    playClickSound(950, 0.02);
    const current = parseFloat(display);
    if (prevValue !== null && operation && !overwrite) {
      const res = compute(prevValue, current, operation);
      setDisplay(String(res));
      setPrevValue(res);
      setHistoryTape((prev) => [`${prevValue} ${operation} ${current} = ${res}`, ...prev]);
    } else {
      setPrevValue(current);
    }
    setOperation(op);
    setOverwrite(true);
  };

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    playClickSound(1050, 0.03);
    if (prevValue !== null && operation) {
      const current = parseFloat(display);
      const res = compute(prevValue, current, operation);
      const formatted = Number.isInteger(res) ? String(res) : parseFloat(res.toFixed(6)).toString();
      setDisplay(formatted);
      setHistoryTape((prev) => [`${prevValue} ${operation} ${current} = ${formatted}`, ...prev]);
      setPrevValue(null);
      setOperation(null);
      setOverwrite(true);
    }
  };

  const handleClear = () => {
    playClickSound(750, 0.02);
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setOverwrite(false);
  };

  const handleSqrt = () => {
    playClickSound(900, 0.02);
    const val = parseFloat(display);
    if (val >= 0) {
      const res = Math.sqrt(val);
      const formatted = Number.isInteger(res) ? String(res) : parseFloat(res.toFixed(6)).toString();
      setDisplay(formatted);
      setHistoryTape((prev) => [`√(${val}) = ${formatted}`, ...prev]);
      setOverwrite(true);
    }
  };

  const handlePercent = () => {
    playClickSound(900, 0.02);
    const val = parseFloat(display) / 100;
    setDisplay(String(val));
    setOverwrite(true);
  };

  const handleToggleSign = () => {
    playClickSound(800, 0.02);
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0c0e] text-[#eedecf] select-none">
      {/* App Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#292520] bg-[#121316]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#eedecf] hover:text-[#c5a880] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal">Home</span>
        </button>

        <div className="text-center">
          <span className="font-serif-royal text-xs tracking-wider text-[#c5a880] font-bold">
            Mechanical Arithmometer
          </span>
          <span className="block text-[9px] font-mono-tech text-[#8c735d]">
            BRASS & SAPPHIRE CALC
          </span>
        </div>

        <button
          onClick={() => {
            playClickSound(800, 0.02);
            setShowHistory(!showHistory);
          }}
          className={`p-1.5 rounded transition-colors ${
            showHistory ? 'text-[#c5a880] bg-[#221f1a]' : 'text-[#8c735d] hover:text-[#eedecf]'
          }`}
          title="Audit Tape History"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Main Calculator Body */}
      <div className="flex-1 flex flex-col p-4 justify-between">
        {/* Paper Tape Audit Display */}
        <div className="w-full bg-gradient-to-b from-[#f5ede2] to-[#e4d4c2] rounded-xl p-3 border-2 border-[#3d362e] shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] text-[#1a1714] flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center text-[10px] font-mono-tech text-[#735e4b] border-b border-[#c8b7a4] pb-1">
            <span>AETHELGARD TREASURY MODEL VIII</span>
            <span>{operation ? `OP: ${operation}` : 'STANDBY'}</span>
          </div>

          {/* Audit Tape Scroll if toggled */}
          {showHistory && historyTape.length > 0 ? (
            <div className="max-h-16 overflow-y-auto space-y-0.5 text-right font-mono-tech text-[10px] text-[#5c4f42] py-1">
              {historyTape.slice(0, 4).map((h, i) => (
                <div key={i}>{h}</div>
              ))}
            </div>
          ) : (
            <div className="text-right text-[11px] font-mono-tech text-[#8c735d] min-h-[16px]">
              {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
            </div>
          )}

          {/* Main Digits */}
          <div className="text-right font-mono-tech text-3xl font-bold tracking-tight text-[#141210] truncate mt-1">
            {display}
          </div>
        </div>

        {/* Mechanical Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 mt-3">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="h-13 rounded-xl bg-[#26211c] border border-[#4a3f33] text-[#eedecf] font-serif-royal font-bold text-xs active:scale-95 transition-transform hover:bg-[#342d25]"
          >
            AC
          </button>
          <button
            onClick={handleToggleSign}
            className="h-13 rounded-xl bg-[#201d19] border border-[#3b342a] text-[#eedecf] font-mono-tech text-sm active:scale-95 transition-transform hover:bg-[#2c2822]"
          >
            ±
          </button>
          <button
            onClick={handlePercent}
            className="h-13 rounded-xl bg-[#201d19] border border-[#3b342a] text-[#eedecf] font-mono-tech text-sm active:scale-95 transition-transform hover:bg-[#2c2822]"
          >
            %
          </button>
          <button
            onClick={() => handleOp('÷')}
            className={`h-13 rounded-xl font-mono-tech text-base font-bold active:scale-95 transition-transform ${
              operation === '÷'
                ? 'bg-[#c5a880] text-black'
                : 'bg-[#382f24] text-[#c5a880] border border-[#524434] hover:bg-[#473b2d]'
            }`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            9
          </button>
          <button
            onClick={() => handleOp('×')}
            className={`h-13 rounded-xl font-mono-tech text-base font-bold active:scale-95 transition-transform ${
              operation === '×'
                ? 'bg-[#c5a880] text-black'
                : 'bg-[#382f24] text-[#c5a880] border border-[#524434] hover:bg-[#473b2d]'
            }`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            6
          </button>
          <button
            onClick={() => handleOp('-')}
            className={`h-13 rounded-xl font-mono-tech text-base font-bold active:scale-95 transition-transform ${
              operation === '-'
                ? 'bg-[#c5a880] text-black'
                : 'bg-[#382f24] text-[#c5a880] border border-[#524434] hover:bg-[#473b2d]'
            }`}
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            3
          </button>
          <button
            onClick={() => handleOp('+')}
            className={`h-13 rounded-xl font-mono-tech text-base font-bold active:scale-95 transition-transform ${
              operation === '+'
                ? 'bg-[#c5a880] text-black'
                : 'bg-[#382f24] text-[#c5a880] border border-[#524434] hover:bg-[#473b2d]'
            }`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={handleSqrt}
            className="h-13 rounded-xl bg-[#201d19] border border-[#3b342a] text-[#c5a880] font-mono-tech text-sm active:scale-95 transition-transform hover:bg-[#2c2822]"
          >
            √
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="h-13 rounded-xl bg-[#141518] border border-[#2c2923] text-white font-mono-tech text-base font-semibold active:scale-95 transition-transform hover:bg-[#1f2127]"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="h-13 rounded-xl bg-gradient-to-b from-[#eedecf] to-[#c5a880] text-black font-mono-tech text-lg font-bold shadow-md active:scale-95 transition-transform hover:brightness-105"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}

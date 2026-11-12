import React, { useState } from 'react';
import { Calculator, Delete, RotateCcw, HelpCircle } from 'lucide-react';

export const CalculatorView: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [isRad, setIsRad] = useState(false); // Default is degrees in GATE exam
  const [history, setHistory] = useState<string>('');

  const appendValue = (val: string) => {
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error') return val;
      return prev + val;
    });
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleBackspace = () => {
    setDisplay(prev => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  // Evaluate Expression
  const handleEquals = () => {
    try {
      // Clean up display for math evaluation
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, `${Math.PI}`)
        .replace(/\be\b/g, `${Math.E}`);

      // Evaluate safely
      const result = Function(`'use strict'; return (${expr})`)();
      if (!isFinite(result)) {
        setDisplay('Error');
        return;
      }
      setHistory(display + ' =');
      setDisplay(String(parseFloat(result.toFixed(8))));
    } catch (e) {
      setDisplay('Error');
    }
  };

  // Scientific Single-Operand Functions
  const applyFunction = (fn: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;

      let result = 0;
      const angleMultiplier = isRad ? 1 : Math.PI / 180;
      const invAngleMultiplier = isRad ? 1 : 180 / Math.PI;

      switch (fn) {
        case 'sin':
          result = Math.sin(val * angleMultiplier);
          break;
        case 'cos':
          result = Math.cos(val * angleMultiplier);
          break;
        case 'tan':
          result = Math.tan(val * angleMultiplier);
          break;
        case 'asin':
          result = Math.asin(val) * invAngleMultiplier;
          break;
        case 'acos':
          result = Math.acos(val) * invAngleMultiplier;
          break;
        case 'atan':
          result = Math.atan(val) * invAngleMultiplier;
          break;
        case 'sinh':
          result = Math.sinh(val);
          break;
        case 'cosh':
          result = Math.cosh(val);
          break;
        case 'tanh':
          result = Math.tanh(val);
          break;
        case 'log10':
          result = Math.log10(val);
          break;
        case 'ln':
          result = Math.log(val);
          break;
        case 'exp':
          result = Math.exp(val);
          break;
        case 'sqrt':
          result = Math.sqrt(val);
          break;
        case 'cbrt':
          result = Math.cbrt(val);
          break;
        case 'sqr':
          result = Math.pow(val, 2);
          break;
        case 'cube':
          result = Math.pow(val, 3);
          break;
        case 'reciprocal':
          result = 1 / val;
          break;
        case 'abs':
          result = Math.abs(val);
          break;
        case 'negate':
          result = -val;
          break;
        case 'fact':
          result = factorial(val);
          break;
        default:
          return;
      }

      setHistory(`${fn}(${val})`);
      setDisplay(String(parseFloat(result.toFixed(8))));
    } catch (e) {
      setDisplay('Error');
    }
  };

  const factorial = (n: number): number => {
    if (n < 0 || Math.floor(n) !== n) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= Math.min(n, 100); i++) res *= i;
    return res;
  };

  // Memory functions
  const memoryClear = () => setMemory(0);
  const memoryRecall = () => setDisplay(String(memory));
  const memoryStore = () => setMemory(parseFloat(display) || 0);
  const memoryAdd = () => setMemory(prev => prev + (parseFloat(display) || 0));
  const memorySub = () => setMemory(prev => prev - (parseFloat(display) || 0));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calculator className="text-blue-500" size={24} />
            <span>Official GATE Virtual Calculator</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Exact layout, functions, and key bindings matching the real GATE examination virtual calculator.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Angle Mode:</span>
          <span className="font-bold text-blue-400">{isRad ? 'Radians (rad)' : 'Degrees (deg)'}</span>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1118] border border-slate-800 shadow-2xl max-w-2xl mx-auto">
        {/* LCD Screen Display */}
        <div className="p-4 rounded-2xl bg-[#06080c] border border-slate-800 text-right mb-6 font-mono">
          <div className="text-xs text-slate-500 h-5 overflow-hidden">{history || '\u00A0'}</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight overflow-x-auto select-all">
            {display}
          </div>
        </div>

        {/* Top Function / Memory Toolbar */}
        <div className="grid grid-cols-6 gap-2 mb-3 text-xs font-bold font-mono">
          <button
            onClick={() => setIsRad(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 text-blue-400 hover:bg-slate-700 border border-slate-700 transition"
          >
            {isRad ? 'Rad' : 'Deg'}
          </button>
          <button
            onClick={memoryClear}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            MC
          </button>
          <button
            onClick={memoryRecall}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            MR
          </button>
          <button
            onClick={memoryStore}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            MS
          </button>
          <button
            onClick={memoryAdd}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            M+
          </button>
          <button
            onClick={memorySub}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            M-
          </button>
        </div>

        {/* Scientific & Arithmetic Keypad Grid */}
        <div className="grid grid-cols-6 gap-2 text-xs font-semibold font-mono">
          {/* Row 1 */}
          <button onClick={() => applyFunction('sin')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">sin</button>
          <button onClick={() => applyFunction('cos')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">cos</button>
          <button onClick={() => applyFunction('tan')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">tan</button>
          <button onClick={() => appendValue('(')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">(</button>
          <button onClick={() => appendValue(')')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">)</button>
          <button onClick={handleBackspace} className="p-3 rounded-xl bg-rose-950/60 text-rose-400 hover:bg-rose-900/60 border border-rose-900/60 flex items-center justify-center">
            <Delete size={16} />
          </button>

          {/* Row 2 */}
          <button onClick={() => applyFunction('asin')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">sin⁻¹</button>
          <button onClick={() => applyFunction('acos')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">cos⁻¹</button>
          <button onClick={() => applyFunction('atan')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">tan⁻¹</button>
          <button onClick={() => appendValue('7')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">7</button>
          <button onClick={() => appendValue('8')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">8</button>
          <button onClick={() => appendValue('9')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">9</button>

          {/* Row 3 */}
          <button onClick={() => applyFunction('sinh')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">sinh</button>
          <button onClick={() => applyFunction('cosh')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">cosh</button>
          <button onClick={() => applyFunction('tanh')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">tanh</button>
          <button onClick={() => appendValue('4')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">4</button>
          <button onClick={() => appendValue('5')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">5</button>
          <button onClick={() => appendValue('6')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">6</button>

          {/* Row 4 */}
          <button onClick={() => applyFunction('ln')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">ln</button>
          <button onClick={() => applyFunction('log10')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">log₁₀</button>
          <button onClick={() => applyFunction('exp')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">eˣ</button>
          <button onClick={() => appendValue('1')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">1</button>
          <button onClick={() => appendValue('2')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">2</button>
          <button onClick={() => appendValue('3')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">3</button>

          {/* Row 5 */}
          <button onClick={() => applyFunction('sqrt')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">√</button>
          <button onClick={() => applyFunction('sqr')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">x²</button>
          <button onClick={() => applyFunction('fact')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">n!</button>
          <button onClick={() => appendValue('0')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">0</button>
          <button onClick={() => appendValue('.')} className="p-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700">.</button>
          <button onClick={handleEquals} className="p-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-md shadow-blue-600/30">=</button>

          {/* Row 6: Basic Operators */}
          <button onClick={() => appendValue(' + ')} className="p-3 rounded-xl bg-slate-900 text-blue-400 font-bold hover:bg-slate-800 border border-slate-800">+</button>
          <button onClick={() => appendValue(' - ')} className="p-3 rounded-xl bg-slate-900 text-blue-400 font-bold hover:bg-slate-800 border border-slate-800">-</button>
          <button onClick={() => appendValue(' * ')} className="p-3 rounded-xl bg-slate-900 text-blue-400 font-bold hover:bg-slate-800 border border-slate-800">×</button>
          <button onClick={() => appendValue(' / ')} className="p-3 rounded-xl bg-slate-900 text-blue-400 font-bold hover:bg-slate-800 border border-slate-800">÷</button>
          <button onClick={() => appendValue('π')} className="p-3 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800">π</button>
          <button onClick={handleClear} className="p-3 rounded-xl bg-rose-950/80 text-rose-400 font-bold hover:bg-rose-900 border border-rose-900">C</button>
        </div>
      </div>
    </div>
  );
};

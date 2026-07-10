import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { playKeySound, playCorrectSound, playWrongSound, playLevelUpSound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { XCircle } from 'lucide-react';

interface ActivePlayScreenProps {
  soundEnabled: boolean;
}

export const ActivePlayScreen: React.FC<ActivePlayScreenProps> = ({ soundEnabled }) => {
  const {
    currentValue,
    round,
    submitAnswer,
    endGame,
    highScore,
  } = useGameStore();

  const [inputValue, setInputValue] = useState('');
  const [roundTime, setRoundTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const expectedValue = currentValue + currentValue;
  const expectedStr = expectedValue.toString();
  const expectedLength = expectedStr.length;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [round]);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setRoundTime((Date.now() - start) / 1000);
    }, 50);

    return () => clearInterval(interval);
  }, [round]);

  const formatNumberWithCommas = (str: string) => {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatShortValue = (val: bigint) => {
    if (val < 1000n) return '';
    if (val < 1000000n) return `(~ ${(Number(val) / 1000).toFixed(1)}천)`;
    if (val < 1000000000n) return `(~ ${(Number(val / 10000n) / 100).toFixed(2)}만)`;
    if (val < 1000000000000n) return `(~ ${(Number(val / 10000000n) / 100).toFixed(2)}억)`;
    if (val < 1000000000000000n) return `(~ ${(Number(val / 10000000000n) / 100).toFixed(2)}조)`;
    const str = val.toString();
    return `(~ ${str[0]}.${str.slice(1, 3)} × 10^${str.length - 1})`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const filteredVal = rawVal.replace(/[^0-9\s,]/g, '');
    setInputValue(filteredVal);

    if (soundEnabled) {
      playKeySound();
    }

    const cleanInput = filteredVal.replace(/[\s,]/g, '');

    if (cleanInput.length === 0) {
      return;
    }

    // Instant typo check (prefix match)
    if (!expectedStr.startsWith(cleanInput)) {
      if (soundEnabled) {
        playWrongSound();
      }
      
      setTimeout(() => {
        submitAnswer(filteredVal);
      }, 200);
      return;
    }

    // Instant correct complete check
    if (cleanInput === expectedStr) {
      if (soundEnabled) {
        if (round % 5 === 0) {
          playLevelUpSound();
        } else {
          playCorrectSound();
        }
      }

      if (round > highScore && highScore > 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3b82f6', '#10b981', '#f59e0b']
        });
      } else if (round % 5 === 0) {
        confetti({
          particleCount: 40,
          spread: 40,
          origin: { y: 0.7 }
        });
      }

      setTimeout(() => {
        submitAnswer(filteredVal);
        setInputValue('');
      }, 150);
    }
  };

  const handleGiveUp = () => {
    if (soundEnabled) {
      playWrongSound();
    }
    endGame();
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-950 text-lg leading-relaxed justify-between py-2 select-text">
      
      {/* Round Header */}
      <div className="border-b border-dashed border-slate-300 pb-2 mb-6 flex justify-between text-sm select-none text-slate-500 font-sans">
        <span className="font-bold text-slate-700">진행 라운드: 제 {round} 문</span>
        <span className="font-bold text-slate-700">경과 시간: {roundTime.toFixed(2)}초</span>
      </div>

      {/* Lined math sheet workspace */}
      <div className="flex-grow flex flex-col justify-center my-6">
        
        <p className="text-slate-500 text-sm sm:text-base italic mb-6 select-none">
          * 합산 값을 계산하여 밑줄에 작성하세요. (오타 입력 시 즉시 종료)
        </p>

        {/* Math equation */}
        <div className="flex flex-col items-center justify-center my-4 font-bold select-all leading-snug">
          <div className="text-3xl sm:text-4xl break-all tracking-wide text-slate-950 text-center max-w-full font-mono">
            {formatNumberWithCommas(currentValue.toString())}
          </div>
          <div className="text-slate-400 my-2 text-3xl font-light font-mono">+</div>
          <div className="text-3xl sm:text-4xl break-all tracking-wide text-slate-950 text-center max-w-full font-mono">
            {formatNumberWithCommas(currentValue.toString())}
          </div>
          <div className="text-slate-400 my-3.5 text-3xl font-light font-mono">=</div>
          
          <div className="text-sm text-slate-500 font-normal h-4 select-none mb-4">
            {formatShortValue(currentValue)}
          </div>
        </div>

        {/* Input box styled as ruled blank line */}
        <div className="w-full max-w-sm mx-auto mb-6 select-none flex flex-col items-center">
          <div className="flex items-end gap-2.5 w-full justify-center">
            <span className="text-slate-500 text-2xl font-bold font-mono">✏️</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="정답 입력"
              className="notebook-input w-2/3 text-center placeholder:text-slate-200 tracking-widest text-2xl font-bold"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          {/* Typing helper length indicators */}
          <div className="flex justify-between w-2/3 text-xs sm:text-sm text-slate-500 mt-4.5 font-sans">
            <span>요구 자릿수: {expectedLength}자리</span>
            <span className={inputValue.replace(/[\s,]/g, '').length === expectedLength ? 'text-blue-700 font-bold' : ''}>
              입력 자릿수: {inputValue.replace(/[\s,]/g, '').length} / {expectedLength}
            </span>
          </div>
        </div>

      </div>

      {/* Give up button */}
      <div className="border-t border-slate-200/50 pt-4 select-none flex justify-end">
        <button
          onClick={handleGiveUp}
          className="highlighter-hover flex items-center gap-1.5 text-red-700 font-bold text-sm py-1.5 px-3 border border-red-200 rounded cursor-pointer transition-colors"
        >
          <XCircle className="w-4 h-4" />
          <span>도전 포기하기</span>
        </button>
      </div>

    </div>
  );
};

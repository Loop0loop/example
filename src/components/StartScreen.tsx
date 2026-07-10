import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { playLevelUpSound } from '../utils/sound';
import { Trash2 } from 'lucide-react';

interface StartScreenProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ soundEnabled, setSoundEnabled }) => {
  const { startGame, highScore, highScoreValue, clearHighScore } = useGameStore();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleStart = () => {
    if (soundEnabled) {
      playLevelUpSound();
    }
    startGame();
  };

  const formatHighScoreValue = (valStr: string) => {
    if (valStr === '0') return '0';
    try {
      const val = BigInt(valStr);
      if (val < 1000n) return val.toString();
      if (val < 1000000n) return (Number(val) / 1000).toFixed(1) + 'K';
      if (val < 1000000000n) return (Number(val / 10000n) / 100).toFixed(1) + 'M';
      if (val < 1000000000000n) return (Number(val / 10000000n) / 100).toFixed(1) + 'B';
      return `${valStr[0]}.${valStr[1]}e${valStr.length - 1}`;
    } catch {
      return valStr;
    }
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-950 text-base sm:text-lg leading-[30px] justify-between py-2 select-text">
      
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold border-b-2 border-slate-300 pb-1.5 text-slate-950 inline-block font-sans select-none">
          무한 배수 계산 연습장
        </h2>
      </div>

      {/* Rules content in Korean */}
      <div className="flex-grow whitespace-pre-wrap font-sans text-lg sm:text-xl leading-[36px] pl-2 mb-6">
        <p className="font-bold text-slate-950 mb-1.5 text-xl sm:text-2xl">■ 규칙 및 진행 방법</p>
        <p>1. 첫 문제는 <span className="font-bold text-blue-700 underline underline-offset-4 decoration-blue-300">1 + 1 = 2</span> 로 시작합니다.</p>
        <p>2. 정답을 맞추면 해당 값인 <span className="font-bold text-blue-700 underline underline-offset-4 decoration-blue-300">2 + 2 = 4</span> 로 넘어갑니다.</p>
        <p>3. 다음은 다시 합산된 값인 <span className="font-bold text-blue-700 underline underline-offset-4 decoration-blue-300">4 + 4 = 8</span> 로 배수 진행됩니다.</p>
        <p>4. 정답 값을 올바르게 입력하면 <span className="text-blue-900 font-bold">즉시 다음 라운드로 전환</span>됩니다.</p>
        
        <p className="mt-6 text-red-700 font-bold bg-red-50/70 border border-red-200 px-3 py-1 rounded inline-block rotate-[0.5deg] text-base sm:text-lg shadow-sm">
          ⚠ 오답을 입력하거나 틀리는 순간 시험이 바로 종료됩니다.
        </p>
      </div>

      {/* Action Buttons (Highlighter design) */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 select-none items-center">
        <button
          onClick={handleStart}
          className="highlighter-hover font-bold text-2xl text-slate-950 px-8 py-2.5 border-2 border-slate-800 hand-drawn-border cursor-pointer transition-shadow shadow-sm hover:shadow-md"
        >
          [ 연습 시작하기 ]
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="highlighter-hover text-sm text-slate-600 px-4 py-1.5 border border-slate-400 rounded cursor-pointer"
        >
          효과음: {soundEnabled ? '켜짐' : '꺼짐'}
        </button>
      </div>

      {/* High Scores block */}
      {highScore > 0 && (
        <div className="mt-8 border-2 border-slate-300 border-dashed p-4 bg-yellow-50/30 rounded select-none">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2 text-xs sm:text-sm text-slate-500 font-bold">
            <span>개인 기록</span>
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="text-slate-400 hover:text-red-600 flex items-center gap-0.5 cursor-pointer text-xs font-normal"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>기록 초기화</span>
              </button>
            ) : (
              <div className="flex gap-2 text-xs">
                <span className="text-red-600 font-bold">삭제할까요?</span>
                <button
                  onClick={() => {
                    clearHighScore();
                    setShowConfirmReset(false);
                  }}
                  className="text-red-600 font-bold hover:underline cursor-pointer"
                >
                  예
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  아니오
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center text-sm sm:text-base py-0.5 text-slate-800">
            <span>최고 도달 라운드:</span>
            <span className="font-bold text-blue-700">Round {highScore}</span>
          </div>
          <div className="flex justify-between items-center text-sm sm:text-base py-0.5 text-slate-800">
            <span>최대 계산 수치:</span>
            <span className="font-bold text-pink-700 font-mono">{formatHighScoreValue(highScoreValue)}</span>
          </div>
        </div>
      )}

    </div>
  );
};

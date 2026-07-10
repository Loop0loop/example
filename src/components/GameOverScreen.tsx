import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { playLevelUpSound } from '../utils/sound';
import { Share2, ClipboardCheck, ArrowLeft } from 'lucide-react';

interface GameOverScreenProps {
  soundEnabled: boolean;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ soundEnabled }) => {
  const {
    round,
    history,
    totalTimeSpent,
    resetGame,
    startGame,
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  const handlePlayAgain = () => {
    if (soundEnabled) {
      playLevelUpSound();
    }
    startGame();
  };

  const handleGoHome = () => {
    resetGame();
  };

  const lastRecord = history[history.length - 1];
  const lastQuestion = lastRecord ? lastRecord.question : '1 + 1';
  const lastAnswer = lastRecord ? lastRecord.expectedAnswer : '2';
  const lastUserAnswer = lastRecord ? lastRecord.userAnswer : '';

  const roundsSolved = Math.max(0, round - 1);
  const avgTimePerRound = roundsSolved > 0 ? (totalTimeSpent / roundsSolved).toFixed(2) : '0.00';

  const formatValue = (valStr: string) => {
    if (!valStr || valStr === '0') return '0';
    try {
      const val = BigInt(valStr);
      if (val < 1000n) return val.toString();
      if (val < 1000000n) return (Number(val) / 1000).toFixed(1) + 'K';
      if (val < 1000000000n) return (Number(val / 10000n) / 100).toFixed(2) + 'M';
      if (val < 1000000000000n) return (Number(val / 10000000n) / 100).toFixed(2) + 'B';
      return `${valStr[0]}.${valStr[1]}e${valStr.length - 1}`;
    } catch {
      return valStr;
    }
  };

  const handleShare = () => {
    const numberStr = formatValue(lastAnswer);
    const solvedMaxStr = formatValue((BigInt(lastAnswer) / 2n).toString());
    const text = `🧮 수학 연습장 (배수 덧셈 게임)\n💪 총 ${round} 라운드 도달! (최대 계산값: ${solvedMaxStr}! (정답: ${numberStr}))\n⚡ 걸린 시간: ${totalTimeSpent.toFixed(1)}초 (평균 ${avgTimePerRound}초/문제)\n🧠 나와 지수 계산 배틀을 도전해 보세요!`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getGrugRank = (r: number) => {
    if (r <= 3) return '아기 원시인 (연산 걸음마)';
    if (r <= 6) return '손가락 계산기 (보통의 인간)';
    if (r <= 10) return '발가락 주판 (숙련된 암산러)';
    if (r <= 15) return '부족 회계사 (고속 연산가)';
    if (r <= 20) return '수학 샤먼 (숫자 마법사)';
    if (r <= 30) return '양자 역학자 (지식의 탐구자)';
    return '지수 수학 초월자 (인간 초월)';
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-950 text-base sm:text-lg leading-relaxed justify-between py-2 select-text">
      
      {/* Red pen grading marker header */}
      <div className="border-b-2 border-red-300 pb-3 mb-6 select-none flex justify-between items-end">
        <div>
          <span className="text-2xl font-bold text-red-600 block rotate-[-1.5deg] font-sans">
            ✗ 채점 결과: 오답!
          </span>
          <span className="text-xs sm:text-sm text-red-500 block font-sans mt-0.5">
            계산 실수로 시험이 종료되었습니다.
          </span>
        </div>
        
        {/* Red marked F grade circle */}
        <div className="w-14 h-14 border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 font-bold text-3xl rotate-[12deg] select-none mr-2 shadow-sm">
          F
        </div>
      </div>

      {/* Ruled Paper Lined Text Section */}
      <div className="flex-grow whitespace-pre-wrap font-sans text-base sm:text-lg leading-[32px] pl-2 mb-6">
        <p className="font-bold text-red-700 select-none text-lg sm:text-xl">■ 오답 풀이:</p>
        <p>• 계산식: <span className="font-mono text-base sm:text-lg">{lastQuestion} = ?</span></p>
        <p>• 원래 정답: <span className="font-bold text-emerald-800 underline underline-offset-4 decoration-emerald-200 font-mono text-base sm:text-lg">{formatValue(lastAnswer)}</span></p>
        <p>• 내가 쓴 오답: <span className="font-bold text-red-600 line-through font-mono text-base sm:text-lg">{lastUserAnswer || '[미입력]'}</span></p>
        
        <p className="mt-6 font-bold text-slate-950 border-b border-slate-200 pb-1 select-none text-lg sm:text-xl">■ 최종 성적 기록:</p>
        <p>• 맞춘 문제 수: <span className="font-bold text-slate-950">{roundsSolved}개</span></p>
        <p>• 총 소요 시간: <span className="font-bold text-slate-950">{totalTimeSpent.toFixed(1)}초</span></p>
        <p>• 평균 풀이 속도: <span className="font-bold text-slate-950">{avgTimePerRound}초 / 문제</span></p>
        <p>• 연산 등급 판정: <span className="font-bold text-blue-700 underline underline-offset-4 decoration-blue-200">{getGrugRank(round)}</span></p>
      </div>

      {/* Button Tray (Highlighter layout) */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 select-none items-center">
        
        <button
          onClick={handlePlayAgain}
          className="highlighter-hover font-bold text-xl text-slate-950 px-6 py-2 border-2 border-slate-700 hand-drawn-border cursor-pointer transition-shadow"
        >
          [ 다시 시작 ]
        </button>

        <button
          onClick={handleShare}
          className="highlighter-hover text-sm text-slate-800 px-5 py-2 border-2 border-slate-600 hand-drawn-border cursor-pointer"
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-4 h-4 text-emerald-700 inline mr-1" />
              <span className="text-emerald-800 font-bold">복사 완료!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-blue-700 inline mr-1" />
              기록 공유
            </>
          )}
        </button>

        <button
          onClick={handleGoHome}
          className="highlighter-hover text-xs text-slate-500 px-4 py-1.5 border border-slate-400 rounded cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
          처음으로
        </button>
        
      </div>

    </div>
  );
};

import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { StartScreen } from './components/StartScreen';
import { ActivePlayScreen } from './components/ActivePlayScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { Volume2, VolumeX } from 'lucide-react';

function App() {
  const { gameState } = useGameStore();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grug_math_sound');
      return saved !== 'false';
    }
    return true;
  });

  const [dateStr, setDateStr] = useState('');

  // Clock effect for top corner date
  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      
      setDateStr(`2026년 ${month}월 ${day}일 • ${hours}:${minStr}`);
    };
    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('grug_math_sound', soundEnabled.toString());
  }, [soundEnabled]);

  return (
    <div className="w-full max-w-3xl p-4 flex items-center justify-center">
      
      {/* Lined Notebook Paper Container (Symmetric, Scaled Up, left-shifted red margin spacing) */}
      <div className="notebook-paper pl-9 pr-6 sm:pr-10 py-8 text-[#0f172a] flex flex-col justify-between select-text min-h-[540px]">
        
        {/* Lined Paper Header */}
        <header className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 font-sans select-none pl-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              수학 공책
            </h1>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="bg-slate-100/80 px-2.5 py-0.5 rounded border border-slate-200 text-slate-600">
              {dateStr}
            </span>
            
            {/* Sound controls (Lucide icon) */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="hover:text-slate-800 p-0.5 cursor-pointer transition-colors"
              title={soundEnabled ? "소리 끄기" : "소리 켜기"}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-slate-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
        </header>

        {/* Paper Notebook main workspace */}
        <div className="flex-grow flex flex-col justify-between pl-1">
          {gameState === 'idle' && (
            <StartScreen soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />
          )}
          {gameState === 'playing' && (
            <ActivePlayScreen soundEnabled={soundEnabled} />
          )}
          {gameState === 'gameover' && (
            <GameOverScreen soundEnabled={soundEnabled} />
          )}
        </div>

        {/* Lined Paper Footer */}
        <footer className="border-t border-slate-200 pt-3 mt-6 flex justify-between items-center text-xs text-slate-400 select-none font-sans pl-1">
          <span>* 무제한 계산 기록장 *</span>
          <span>페이지 1 / 1</span>
        </footer>

      </div>

    </div>
  );
}

export default App;

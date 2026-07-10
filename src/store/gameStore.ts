import { create } from 'zustand';

export interface RoundRecord {
  round: number;
  question: string;
  expectedAnswer: string;
  userAnswer: string;
  timeSpent: number; // in seconds
}

export type GameState = 'idle' | 'playing' | 'gameover';

interface GameStore {
  gameState: GameState;
  currentValue: bigint;
  round: number;
  history: RoundRecord[];
  startTime: number; // timestamp when current round started
  gameStartTime: number; // timestamp when game started
  highScore: number;
  highScoreValue: string; // highest value reached in any session
  totalTimeSpent: number; // in seconds

  startGame: () => void;
  submitAnswer: (answerStr: string) => boolean;
  endGame: () => void;
  resetGame: () => void;
  clearHighScore: () => void;
}

const getHighScoreFromStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('grug_math_highscore');
    return saved ? parseInt(saved, 10) : 0;
  }
  return 0;
};

const getHighScoreValueFromStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('grug_math_highscore_value') || '0';
  }
  return '0';
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'idle',
  currentValue: 1n,
  round: 1,
  history: [],
  startTime: 0,
  gameStartTime: 0,
  highScore: getHighScoreFromStorage(),
  highScoreValue: getHighScoreValueFromStorage(),
  totalTimeSpent: 0,

  startGame: () => {
    set({
      gameState: 'playing',
      currentValue: 1n,
      round: 1,
      history: [],
      startTime: Date.now(),
      gameStartTime: Date.now(),
      totalTimeSpent: 0,
    });
  },

  submitAnswer: (answerStr: string) => {
    const { currentValue, round, startTime, gameStartTime, history, highScore, highScoreValue } = get();
    const expected = currentValue + currentValue;
    const expectedStr = expected.toString();
    
    // Clean user answer from spaces, commas
    const cleanAnswer = answerStr.replace(/[\s,]/g, '');
    
    let isCorrect = false;
    try {
      isCorrect = BigInt(cleanAnswer) === expected;
    } catch {
      isCorrect = false;
    }

    const timeSpent = (Date.now() - startTime) / 1000;
    const totalTimeSpent = (Date.now() - gameStartTime) / 1000;

    const newRecord: RoundRecord = {
      round,
      question: `${currentValue.toString()} + ${currentValue.toString()}`,
      expectedAnswer: expectedStr,
      userAnswer: cleanAnswer,
      timeSpent,
    };

    const newHistory = [...history, newRecord];

    if (isCorrect) {
      const nextRound = round + 1;
      let newHighScore = highScore;
      let newHighScoreValue = highScoreValue;

      if (nextRound > highScore) {
        newHighScore = nextRound;
        localStorage.setItem('grug_math_highscore', nextRound.toString());
      }

      try {
        const currentHighValBig = BigInt(highScoreValue);
        if (expected > currentHighValBig) {
          newHighScoreValue = expectedStr;
          localStorage.setItem('grug_math_highscore_value', expectedStr);
        }
      } catch {
        newHighScoreValue = expectedStr;
        localStorage.setItem('grug_math_highscore_value', expectedStr);
      }

      set({
        round: nextRound,
        currentValue: expected,
        history: newHistory,
        startTime: Date.now(),
        highScore: newHighScore,
        highScoreValue: newHighScoreValue,
        totalTimeSpent,
      });
      return true;
    } else {
      set({
        gameState: 'gameover',
        history: newHistory,
        totalTimeSpent,
      });
      return false;
    }
  },

  endGame: () => {
    const { gameStartTime } = get();
    set({
      gameState: 'gameover',
      totalTimeSpent: gameStartTime ? (Date.now() - gameStartTime) / 1000 : 0,
    });
  },

  resetGame: () => {
    set({
      gameState: 'idle',
      currentValue: 1n,
      round: 1,
      history: [],
      startTime: 0,
      gameStartTime: 0,
      totalTimeSpent: 0,
    });
  },

  clearHighScore: () => {
    localStorage.removeItem('grug_math_highscore');
    localStorage.removeItem('grug_math_highscore_value');
    set({
      highScore: 0,
      highScoreValue: '0',
    });
  },
}));

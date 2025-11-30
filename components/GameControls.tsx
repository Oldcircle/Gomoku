import React from 'react';
import { Difficulty, GameConfig, Language, Player } from '../types';
import { TRANSLATIONS } from '../constants';

interface GameControlsProps {
  config: GameConfig;
  onConfigChange: (newConfig: Partial<GameConfig>) => void;
  onNewGame: () => void;
  isPlaying: boolean;
  onUndo: () => void;
  canUndo: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ config, onConfigChange, onNewGame, isPlaying, onUndo, canUndo }) => {
  const t = TRANSLATIONS[config.language];

  const difficultyLevels = [
    { value: Difficulty.Novice, label: t.novice },
    { value: Difficulty.Easy, label: t.easy },
    { value: Difficulty.Medium, label: t.medium },
    { value: Difficulty.Hard, label: t.hard },
    { value: Difficulty.Expert, label: t.expert },
  ];

  return (
    <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-stone-200 flex flex-col gap-6 w-full max-w-sm">
      <div className="flex justify-between items-center border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-serif font-bold text-stone-800">{t.settings}</h2>
        <button
          onClick={() => onConfigChange({ language: config.language === Language.EN ? Language.CN : Language.EN })}
          className="text-xs font-bold px-2 py-1 bg-stone-200 rounded hover:bg-stone-300 transition-colors"
        >
          {config.language === Language.EN ? '中文' : 'EN'}
        </button>
      </div>

      {/* Difficulty Selector */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-stone-600 uppercase tracking-wide">{t.difficulty}</label>
        <div className="flex flex-col gap-1">
          {difficultyLevels.map((diff) => (
            <label key={diff.value} className={`
              flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-all
              ${config.difficulty === diff.value 
                ? 'bg-stone-800 text-white border-stone-800 shadow-md' 
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'}
            `}>
              <input 
                type="radio" 
                name="difficulty" 
                className="hidden" 
                checked={config.difficulty === diff.value}
                onChange={() => onConfigChange({ difficulty: diff.value })}
              />
              <span className="font-serif text-sm">{diff.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Side Selector */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-stone-600 uppercase tracking-wide">{t.playAs}</label>
        <div className="flex gap-4">
            <button
                onClick={() => onConfigChange({ playerColor: Player.Black })}
                disabled={isPlaying}
                className={`flex-1 py-3 rounded-lg font-serif transition-all border
                    ${config.playerColor === Player.Black 
                    ? 'bg-neutral-800 text-white border-neutral-800 shadow-md ring-2 ring-neutral-400 ring-offset-2' 
                    : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50'}
                `}
            >
                ⚫ {t.black}
            </button>
            <button
                onClick={() => onConfigChange({ playerColor: Player.White })}
                disabled={isPlaying}
                className={`flex-1 py-3 rounded-lg font-serif transition-all border
                    ${config.playerColor === Player.White 
                    ? 'bg-white text-neutral-900 border-neutral-300 shadow-md ring-2 ring-stone-400 ring-offset-2' 
                    : 'bg-stone-50 text-neutral-600 border-stone-200 hover:bg-white'}
                `}
            >
                ⚪ {t.white}
            </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNewGame}
          className="mt-2 flex-1 py-4 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-serif text-lg tracking-wider"
        >
          {isPlaying ? t.restart : t.newGame}
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`mt-2 flex-1 py-4 font-bold rounded-lg shadow-lg transition-all duration-200 font-serif text-lg tracking-wider border ${canUndo ? 'bg-stone-800 text-white border-stone-800 hover:bg-stone-700' : 'bg-stone-200 text-stone-500 border-stone-300 cursor-not-allowed'}`}
        >
          {t.undo}
        </button>
      </div>
    </div>
  );
};

export default GameControls;

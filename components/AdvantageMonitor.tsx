import React from 'react';
import { Player, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AdvantageMonitorProps {
  evaluation: number; // 0-100 (Black favor)
  analysis: string;
  lang: Language;
}

const AdvantageMonitor: React.FC<AdvantageMonitorProps> = ({ evaluation, analysis, lang }) => {
  const t = TRANSLATIONS[lang];
  
  // 50 is neutral. 
  // < 50 favors White, > 50 favors Black.
  
  const blackPercentage = Math.min(100, Math.max(0, evaluation));
  const whitePercentage = 100 - blackPercentage;

  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-stone-200 mt-6">
      <h3 className="text-xl font-serif font-bold text-stone-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">👁️</span> {t.advantage}
      </h3>

      {/* The Gauge */}
      <div className="relative h-8 bg-neutral-200 rounded-full overflow-hidden flex border border-neutral-300 shadow-inner">
        {/* Black Bar */}
        <div 
            className="h-full bg-gradient-to-r from-neutral-800 to-neutral-600 transition-all duration-1000 ease-out flex items-center justify-start pl-3"
            style={{ width: `${blackPercentage}%` }}
        >
            {blackPercentage > 20 && <span className="text-xs text-white font-bold whitespace-nowrap">{blackPercentage.toFixed(0)}%</span>}
        </div>
        
        {/* White Bar */}
        <div 
            className="h-full bg-gradient-to-l from-neutral-100 to-white transition-all duration-1000 ease-out flex items-center justify-end pr-3"
            style={{ width: `${whitePercentage}%` }}
        >
             {whitePercentage > 20 && <span className="text-xs text-neutral-800 font-bold whitespace-nowrap">{whitePercentage.toFixed(0)}%</span>}
        </div>

        {/* Center Marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500/50 transform -translate-x-1/2 z-10"></div>
      </div>

      <div className="flex justify-between text-sm font-bold text-stone-600 mt-2 font-serif">
        <span className={evaluation > 55 ? 'text-neutral-900' : ''}>{t.blackAdvantage}</span>
        <span className={evaluation < 45 ? 'text-neutral-900' : ''}>{t.whiteAdvantage}</span>
      </div>

      {/* Analysis Text */}
      <div className="mt-4 p-3 bg-stone-50 rounded border-l-4 border-stone-400">
        <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-1">{t.analysis}</h4>
        <p className="text-stone-800 italic text-sm leading-relaxed min-h-[3rem]">
          {analysis || t.waiting}
        </p>
      </div>
    </div>
  );
};

export default AdvantageMonitor;

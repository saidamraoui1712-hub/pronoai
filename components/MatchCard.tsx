
import React from 'react';
import { Match } from '../types';
import { translations } from '../services/translations';

interface MatchCardProps {
  match: Match;
  onSelect: (match: Match) => void;
  onAddToSlip?: (match: Match) => void;
  lang?: 'fr' | 'ar';
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect, onAddToSlip, lang = 'fr' }) => {
  const t = translations[lang];
  const isAr = lang === 'ar';
  const proba = match.aiProbability || 50;

  const getProbaTheme = () => {
    if (proba >= 85) return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: t.risk_90 };
    if (proba >= 70) return { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: t.risk_70 };
    return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: t.risk_50 };
  };

  const theme = getProbaTheme();

  return (
    <div className="glass-card rounded-[2.5rem] p-1 flex flex-col h-full group">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mono">{match.league}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] text-slate-400 font-medium mono uppercase tracking-tighter">Live Analysis Active</span>
            </div>
          </div>
          <div className={`${theme.bg} ${theme.border} border ${theme.color} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-xl`}>
             {proba}%
          </div>
        </div>

        <div className={`flex items-center justify-between gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="flex flex-col items-center w-1/3 text-center">
            <div className="w-20 h-20 bg-slate-900/80 rounded-3xl p-3 flex items-center justify-center border border-slate-700/50 shadow-2xl group-hover:scale-105 transition-transform duration-500">
               <img src={match.homeTeam.logo} className="w-full h-full object-contain" alt={match.homeTeam.name} />
            </div>
            <h4 className="mt-4 text-[12px] font-black text-white leading-tight uppercase tracking-tight truncate w-full px-2">
              {match.homeTeam.name}
            </h4>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-[10px] font-black text-slate-600 mb-2 mono tracking-[0.3em]">VS</div>
            <div className="bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/10 flex flex-col items-center">
               <span className="text-[11px] font-black text-emerald-400 mono">
                  {new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>
          </div>

          <div className="flex flex-col items-center w-1/3 text-center">
            <div className="w-20 h-20 bg-slate-900/80 rounded-3xl p-3 flex items-center justify-center border border-slate-700/50 shadow-2xl group-hover:scale-105 transition-transform duration-500">
               <img src={match.awayTeam.logo} className="w-full h-full object-contain" alt={match.awayTeam.name} />
            </div>
            <h4 className="mt-4 text-[12px] font-black text-white leading-tight uppercase tracking-tight truncate w-full px-2">
              {match.awayTeam.name}
            </h4>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 flex gap-3">
        <button 
          onClick={() => onSelect(match)}
          className="flex-1 bg-slate-800/80 hover:bg-white hover:text-slate-900 text-white text-[11px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest border border-slate-700/50"
        >
          {t.analyses}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToSlip && onAddToSlip(match); }}
          className="w-14 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-900/20 active:scale-90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

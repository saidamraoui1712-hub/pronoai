
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

  const getTheme = () => {
    if (proba >= 80) return "border-blue-500/40 bg-blue-500/[0.03]";
    if (proba >= 65) return "border-slate-700/50 bg-slate-900/20";
    return "border-slate-800 bg-slate-900/10";
  };

  return (
    <div className={`group relative rounded-2xl border ${getTheme()} p-4 transition-all hover:border-blue-500/50 animate-fade`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{match.league}</span>
        {match.status === 'live' ? (
          <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Live {match.liveStats?.minute}'</span>
          </div>
        ) : (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        )}
      </div>

      <div className={`flex items-center justify-between gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-col items-center w-1/3">
          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center justify-center mb-2 group-hover:border-blue-500/30 transition-all">
            <img src={match.homeTeam.logo} className="w-full h-full object-contain" alt="" />
          </div>
          <p className="text-[10px] font-black text-slate-200 uppercase truncate w-full text-center leading-tight">{match.homeTeam.name}</p>
        </div>

        <div className="flex flex-col items-center">
          {match.status === 'live' ? (
             <span className="text-sm font-black text-blue-400 italic tracking-tighter">{match.h2h}</span>
          ) : (
             <span className="text-[9px] font-black text-slate-600 uppercase">VS</span>
          )}
        </div>

        <div className="flex flex-col items-center w-1/3">
          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center justify-center mb-2 group-hover:border-blue-500/30 transition-all">
            <img src={match.awayTeam.logo} className="w-full h-full object-contain" alt="" />
          </div>
          <p className="text-[10px] font-black text-slate-200 uppercase truncate w-full text-center leading-tight">{match.awayTeam.name}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button 
          onClick={() => onSelect(match)}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 text-[9px] font-black py-2.5 rounded-lg transition-all uppercase tracking-tighter"
        >
          {t.analyses}
        </button>
        <button 
          onClick={() => onAddToSlip && onAddToSlip(match)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black py-2.5 rounded-lg transition-all uppercase tracking-tighter shadow-lg shadow-blue-950/40"
        >
          {t.add_slip}
        </button>
      </div>
    </div>
  );
};


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
    if (proba >= 80) return "border-emerald-500/30 bg-emerald-500/5";
    if (proba >= 65) return "border-blue-500/30 bg-blue-500/5";
    return "border-slate-800 bg-slate-900/40";
  };

  return (
    <div className={`group relative rounded-3xl border ${getTheme()} p-6 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10 animate-fade`}>
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[150px]">{match.league}</span>
        {match.status === 'live' ? (
          <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-rose-500 uppercase">Live {match.liveStats?.minute}'</span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-slate-400">{new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        )}
      </div>

      <div className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-col items-center w-1/3 text-center">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl p-2 flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
            <img src={match.homeTeam.logo} className="w-full h-full object-contain" alt="" />
          </div>
          <p className="text-xs font-bold text-white uppercase truncate w-full">{match.homeTeam.name}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-slate-800/50 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 mb-1">VS</div>
          {match.status === 'live' && <span className="text-sm font-black text-emerald-400">{match.h2h}</span>}
        </div>

        <div className="flex flex-col items-center w-1/3 text-center">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl p-2 flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
            <img src={match.awayTeam.logo} className="w-full h-full object-contain" alt="" />
          </div>
          <p className="text-xs font-bold text-white uppercase truncate w-full">{match.awayTeam.name}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <button 
          onClick={() => onSelect(match)}
          className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black py-3 rounded-xl transition-all uppercase tracking-wider"
        >
          {t.analyses}
        </button>
        <button 
          onClick={() => onAddToSlip && onAddToSlip(match)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-3 rounded-xl transition-all uppercase tracking-wider shadow-lg shadow-emerald-900/20"
        >
          {t.add_slip}
        </button>
      </div>
    </div>
  );
};

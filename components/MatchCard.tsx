
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

  // Calcul du style basé sur les règles de l'utilisateur
  let probaColor = "bg-rose-500/20 text-rose-500 border-rose-500/30";
  let probaLabel = t.risk_low;
  
  if (proba >= 90) {
    probaColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    probaLabel = t.risk_90;
  } else if (proba >= 70) {
    probaColor = "bg-amber-500/20 text-amber-400 border-amber-500/30";
    probaLabel = t.risk_70;
  } else if (proba >= 50) {
    probaColor = "bg-orange-500/20 text-orange-400 border-orange-500/30";
    probaLabel = t.risk_50;
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all shadow-xl group flex flex-col h-full">
      {/* Probabilité Badge */}
      <div className={`px-4 py-2 border-b border-slate-800 flex justify-between items-center ${probaColor} bg-opacity-10`}>
        <span className="text-[10px] font-black uppercase tracking-widest">{probaLabel}</span>
        <span className="text-sm font-black">{proba}%</span>
      </div>

      <div className="p-5 flex-1 cursor-pointer" onClick={() => onSelect(match)}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[9px] font-bold text-slate-500 uppercase">{match.league}</span>
          <span className="text-[9px] font-mono text-slate-600 uppercase">{match.status}</span>
        </div>

        <div className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="flex flex-col items-center w-1/3">
            <img src={match.homeTeam.logo} className="w-10 h-10 object-contain mb-2 opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
            <span className="text-[10px] font-bold text-white text-center truncate w-full">{match.homeTeam.name}</span>
          </div>
          
          <div className="flex flex-col items-center">
             <span className="text-xs font-black text-slate-400">VS</span>
             <span className="text-[9px] text-slate-600 mt-1">{new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <img src={match.awayTeam.logo} className="w-10 h-10 object-contain mb-2 opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
            <span className="text-[10px] font-bold text-white text-center truncate w-full">{match.awayTeam.name}</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button 
          onClick={() => onSelect(match)}
          className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-2.5 rounded-xl transition-all uppercase"
        >
          {t.analyses}
        </button>
        <button 
          onClick={() => onAddToSlip && onAddToSlip(match)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all uppercase active:scale-95"
        >
          {t.add_slip}
        </button>
      </div>
    </div>
  );
};

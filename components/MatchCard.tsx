
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

  let probaColor = "text-rose-500";
  let probaBg = "bg-rose-500/10 border-rose-500/20";
  let probaLabel = t.risk_low;
  
  if (proba >= 90) {
    probaColor = "text-emerald-400";
    probaBg = "bg-emerald-500/10 border-emerald-500/20";
    probaLabel = t.risk_90;
  } else if (proba >= 70) {
    probaColor = "text-amber-400";
    probaBg = "bg-amber-500/10 border-amber-500/20";
    probaLabel = t.risk_70;
  } else if (proba >= 50) {
    probaColor = "text-sky-400";
    probaBg = "bg-sky-500/10 border-sky-500/20";
    probaLabel = t.risk_50;
  }

  return (
    <div className="relative group bg-slate-900/40 border border-slate-800/60 rounded-[2rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 shadow-2xl flex flex-col h-full hover:shadow-emerald-500/5">
      {/* Probabilité Bar Overlay */}
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="p-6 flex-1 cursor-pointer" onClick={() => onSelect(match)}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">{match.league}</span>
            <span className="text-[9px] text-slate-600 font-bold mono">ID: {match.id.toUpperCase()}</span>
          </div>
          <div className={`px-3 py-1 rounded-full ${probaBg} border ${probaColor} text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5`}>
            <span className={`w-1 h-1 rounded-full animate-pulse ${proba >= 70 ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
            {probaLabel} • {proba}%
          </div>
        </div>

        <div className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="flex flex-col items-center w-[40%]">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-16 h-16 bg-slate-950/50 rounded-2xl flex items-center justify-center p-2.5 mb-3 border border-slate-800 shadow-2xl transition-transform group-hover:scale-110 duration-500">
                   <img src={match.homeTeam.logo} className="w-full h-full object-contain" alt="" />
                </div>
            </div>
            <span className="text-[11px] font-black text-slate-200 text-center line-clamp-2 uppercase tracking-tight">{match.homeTeam.name}</span>
          </div>
          
          <div className="flex flex-col items-center">
             <div className="text-[9px] font-black text-slate-600 mb-2 mono tracking-widest">VS</div>
             <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center shadow-inner">
                <span className="text-[10px] font-black text-emerald-500 mono">
                    {new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
             </div>
          </div>

          <div className="flex flex-col items-center w-[40%]">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-16 h-16 bg-slate-950/50 rounded-2xl flex items-center justify-center p-2.5 mb-3 border border-slate-800 shadow-2xl transition-transform group-hover:scale-110 duration-500">
                   <img src={match.awayTeam.logo} className="w-full h-full object-contain" alt="" />
                </div>
            </div>
            <span className="text-[11px] font-black text-slate-200 text-center line-clamp-2 uppercase tracking-tight">{match.awayTeam.name}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex gap-3">
        <button 
          onClick={() => onSelect(match)}
          className="flex-1 bg-slate-800/50 hover:bg-emerald-600 hover:text-white text-slate-400 text-[10px] font-black py-3.5 rounded-xl transition-all uppercase tracking-widest border border-slate-800 hover:border-emerald-500/50 mono"
        >
          {t.analyses}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToSlip && onAddToSlip(match); }}
          className="w-12 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center rounded-xl shadow-lg transition-all active:scale-90"
          title={t.add_slip}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

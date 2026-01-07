
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
  
  return (
    <div className="card-ghost rounded-3xl p-6 relative group animate-fade">
      <div className="flex justify-between items-center mb-8">
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest truncate max-w-[150px]">{match.league}</span>
        {match.status === 'live' ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">{match.liveStats?.minute}' LIVE</span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2.5 py-1.5 rounded-xl">
            {new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        )}
      </div>

      <div className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-col items-center w-[42%]">
          <div className="w-14 h-14 bg-white/5 rounded-[1.25rem] p-3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <img src={match.homeTeam.logo} className="w-full h-full object-contain filter drop-shadow-md" alt="" />
          </div>
          <p className="text-[11px] font-black text-white text-center leading-tight tracking-tight uppercase">{match.homeTeam.name}</p>
        </div>

        <div className="flex flex-col items-center shrink-0">
          {match.status === 'live' ? (
             <span className="text-2xl font-black text-[#8b5cf6] italic tracking-tighter">{match.h2h}</span>
          ) : (
             <span className="text-[10px] font-black text-zinc-800">VS</span>
          )}
        </div>

        <div className="flex flex-col items-center w-[42%]">
          <div className="w-14 h-14 bg-white/5 rounded-[1.25rem] p-3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <img src={match.awayTeam.logo} className="w-full h-full object-contain filter drop-shadow-md" alt="" />
          </div>
          <p className="text-[11px] font-black text-white text-center leading-tight tracking-tight uppercase">{match.awayTeam.name}</p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/5">
         <div className="flex flex-col">
            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">AI Score</span>
            <span className={`text-sm font-black ${match.aiProbability! >= 80 ? 'text-emerald-400' : 'text-[#8b5cf6]'}`}>{match.aiProbability}%</span>
         </div>
         <div className="flex gap-2.5">
            <button 
              onClick={() => onSelect(match)}
              className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black px-5 py-3 rounded-2xl transition-all uppercase tracking-widest border border-white/5"
            >
              Analyze
            </button>
            <button 
              onClick={() => onAddToSlip && onAddToSlip(match)}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[10px] font-black px-5 py-3 rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-purple-500/10"
            >
              {t.add_slip}
            </button>
         </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Match } from '../types';
import { translations } from '../services/translations';

interface MatchCardProps {
  match: Match;
  onAnalyze: () => void;
  onAdd: (prediction: string, odds: number) => void;
  isAnalyzing: boolean;
  lang: 'fr' | 'ar';
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onAnalyze, onAdd, isAnalyzing, lang }) => {
  const t = translations[lang];
  
  return (
    <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500 animate-fade">
      {/* Visual Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full transition-all group-hover:bg-cyan-500/10"></div>
      
      <div className="flex justify-between items-center mb-10 relative z-10">
        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl">
          {match.league}
        </span>
        <span className="text-[11px] font-black text-zinc-600 bg-white/5 px-3 py-2 rounded-xl italic">
          {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 relative z-10 mb-12">
        <div className="flex flex-col items-center flex-1">
          <div className="w-14 h-14 bg-white/5 rounded-2xl p-3 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform">
            <img src={match.homeTeam.logo} className="w-full h-full object-contain filter brightness-110 drop-shadow-lg" alt="" />
          </div>
          <p className="text-[12px] font-black text-white text-center uppercase tracking-tighter leading-none h-8 flex items-center">{match.homeTeam.name}</p>
          <button 
            onClick={() => onAdd('1', match.odds.home)}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-lg text-xs font-black transition-all border border-white/5"
          >
            {match.odds.home.toFixed(2)}
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[10px] font-black text-zinc-800 bg-zinc-900 w-8 h-8 rounded-full flex items-center justify-center border border-white/5 mb-4">VS</div>
          <button 
            onClick={() => onAdd('N', match.odds.draw || 3.0)}
            className="px-4 py-2 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-lg text-xs font-black transition-all border border-white/5"
          >
            {(match.odds.draw || 3.0).toFixed(2)}
          </button>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-14 h-14 bg-white/5 rounded-2xl p-3 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform">
            <img src={match.awayTeam.logo} className="w-full h-full object-contain filter brightness-110 drop-shadow-lg" alt="" />
          </div>
          <p className="text-[12px] font-black text-white text-center uppercase tracking-tighter leading-none h-8 flex items-center">{match.awayTeam.name}</p>
          <button 
            onClick={() => onAdd('2', match.odds.away)}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-lg text-xs font-black transition-all border border-white/5"
          >
            {match.odds.away.toFixed(2)}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Confiance IA</span>
          <span className="text-xl font-black italic text-emerald-400">{match.aiProbability}%</span>
        </div>
        <button 
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-4 bg-white/5 hover:bg-cyan-500 hover:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyse...' : t.analyses}
        </button>
      </div>
    </div>
  );
};

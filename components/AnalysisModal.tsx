
import React, { useEffect, useState } from 'react';
import { Match, AIAnalysis, UserNote, LiveInsight } from '../types';
import { getMatchAnalysis } from '../services/geminiService';
import { translations } from '../services/translations';

interface AnalysisModalProps {
  match: Match;
  onClose: () => void;
  lang?: 'fr' | 'ar';
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ match, onClose, lang = 'fr' }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const data = await getMatchAnalysis(match);
      setAnalysis(data);
      setLoading(false);
    };
    fetchAnalysis();
    
    // Si c'est en live, on pourrait rafraîchir toutes les 5 minutes ici
    if (match.status === 'live') {
      const interval = setInterval(fetchAnalysis, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [match]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-xl overflow-hidden">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-5xl h-full max-h-[90vh] flex flex-col rounded-[3rem] shadow-2xl relative overflow-hidden">
        
        {/* Header Terminal Style */}
        <div className="p-8 border-b border-slate-800/60 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
               <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  {match.status === 'live' ? 'QUANTUM LIVE STREAM ANALYSIS' : 'PRE-MATCH STRATEGIC REPORT'}
               </h2>
               <p className="text-[10px] text-slate-500 mono font-bold mt-0.5">MATCH: {match.homeTeam.name} VS {match.awayTeam.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:bg-rose-600/20 hover:text-rose-500 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-10 text-[10px] font-black text-emerald-500 tracking-[0.6em] uppercase animate-pulse">Scanning Match Momentum...</p>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Side: Stats & Radar */}
              <div className="lg:col-span-4 space-y-6">
                 {match.status === 'live' && match.liveStats && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
                       <h3 className="text-[10px] font-black text-emerald-400 uppercase mb-4 mono">Live Stats @ {match.liveStats.minute}'</h3>
                       <div className="space-y-4">
                          <div className="flex justify-between text-[10px] mono text-slate-400">
                             <span>Possession</span>
                             <span className="text-white font-bold">{match.liveStats.possession.home}% - {match.liveStats.possession.away}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full flex overflow-hidden">
                             <div className="bg-emerald-500 h-full" style={{width: `${match.liveStats.possession.home}%`}}></div>
                             <div className="bg-rose-500 h-full" style={{width: `${match.liveStats.possession.away}%`}}></div>
                          </div>
                       </div>
                    </div>
                 )}

                 <div className="bg-slate-900/50 border border-slate-800/60 rounded-[2rem] p-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-4">Probabilités IA</span>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-300">DOMICILE</span>
                          <span className="text-white mono">{analysis.winProbabilities.home}%</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-300">NUL</span>
                          <span className="text-white mono">{analysis.winProbabilities.draw}%</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-300">EXTÉRIEUR</span>
                          <span className="text-white mono">{analysis.winProbabilities.away}%</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Side: Insights & Live Feed */}
              <div className="lg:col-span-8 space-y-8">
                 {analysis.liveInsights && analysis.liveInsights.length > 0 && (
                    <div className="space-y-4">
                       <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> LIVE PREDICTIONS FEED
                       </h3>
                       <div className="space-y-3">
                          {analysis.liveInsights.map((insight, idx) => (
                             <div key={idx} className="bg-slate-900/40 border-l-4 border-emerald-500 p-4 rounded-r-2xl flex gap-4 items-start animate-in slide-in-from-left duration-500">
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded mono">{insight.minute}'</span>
                                <div className="flex-1">
                                   <p className="text-[12px] text-white font-medium leading-relaxed">{insight.message}</p>
                                   <div className="mt-2 flex items-center gap-2">
                                      <span className="text-[9px] font-black text-slate-500 uppercase">Alert Level:</span>
                                      <div className="h-1 w-20 bg-slate-800 rounded-full">
                                         <div className="h-full bg-emerald-500" style={{width: `${insight.intensity}%`}}></div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Observations Stratégiques</h3>
                    <div className="grid grid-cols-1 gap-4">
                       {analysis.keyInsights.map((insight, i) => (
                          <div key={i} className="flex gap-4 bg-slate-900/30 p-5 rounded-2xl border border-slate-800/60">
                             <span className="text-emerald-500 font-bold mono">#{i+1}</span>
                             <p className="text-[12px] text-slate-300">{insight}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="flex-1 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                       <span className="text-[10px] font-black text-emerald-400 block mb-2">SCORE ESTIMÉ</span>
                       <span className="text-3xl font-black text-white italic">{analysis.expectedScore}</span>
                    </div>
                    <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-center">
                       <span className="text-[10px] font-black text-slate-400 block mb-2">CONSEIL TACTIQUE</span>
                       <span className="text-[12px] font-black text-emerald-400 uppercase">{analysis.suggestedBet}</span>
                    </div>
                 </div>
              </div>

            </div>
          )}
        </div>

        <div className="p-8 bg-slate-900/40 border-t border-slate-800 flex justify-end">
           <button onClick={onClose} className="px-10 py-4 bg-white text-slate-950 text-[11px] font-black rounded-2xl hover:bg-emerald-500 transition-all uppercase tracking-widest">
              Close Tactical View
           </button>
        </div>
      </div>
    </div>
  );
};

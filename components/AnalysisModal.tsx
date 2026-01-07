
import React, { useEffect, useState } from 'react';
import { Match, AIAnalysis } from '../types';
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
  }, [match]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl h-full max-h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
               <h2 className="text-sm font-black text-white uppercase tracking-wider">{match.status === 'live' ? 'Live Insight AI' : 'Strategic Report'}</h2>
               <p className="text-[10px] text-slate-500 font-bold uppercase">{match.homeTeam.name} vs {match.awayTeam.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Modal */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="mt-8 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Scanning Deep Data...</p>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Stats Panel */}
              <div className="md:col-span-4 space-y-6">
                 <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest">Probabilités de victoire</h3>
                    <div className="space-y-4">
                       {[
                         { label: match.homeTeam.name, val: analysis.winProbabilities.home, color: 'bg-emerald-500' },
                         { label: 'Match Nul', val: analysis.winProbabilities.draw, color: 'bg-slate-500' },
                         { label: match.awayTeam.name, val: analysis.winProbabilities.away, color: 'bg-blue-500' }
                       ].map(p => (
                         <div key={p.label}>
                            <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-2">
                               <span className="truncate pr-2">{p.label}</span>
                               <span className="text-white">{p.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                               <div className={`${p.color} h-full transition-all duration-1000`} style={{width: `${p.val}%`}}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-emerald-600/10 p-6 rounded-3xl border border-emerald-500/20 text-center">
                    <span className="text-[10px] font-black text-emerald-400 uppercase block mb-2">Score Estimé</span>
                    <span className="text-4xl font-black text-white italic">{analysis.expectedScore}</span>
                 </div>
              </div>

              {/* Insights Panel */}
              <div className="md:col-span-8 space-y-8">
                 {analysis.liveInsights && analysis.liveInsights.length > 0 && (
                   <div className="space-y-4">
                      <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span> Live Momentum Alert
                      </h3>
                      {analysis.liveInsights.map((insight, idx) => (
                        <div key={idx} className="bg-slate-900 border-l-4 border-rose-500 p-5 rounded-r-2xl">
                           <p className="text-sm font-semibold text-white mb-2">{insight.message}</p>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-500">Intensité:</span>
                              <div className="h-1 w-24 bg-slate-800 rounded-full"><div className="h-full bg-rose-500" style={{width: `${insight.intensity}%`}}></div></div>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}

                 <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Observations Tactiques</h3>
                    <div className="grid grid-cols-1 gap-3">
                       {analysis.keyInsights.map((insight, i) => (
                          <div key={i} className="flex items-start gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
                             <div className="w-6 h-6 shrink-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center rounded-lg">{i+1}</div>
                             <p className="text-[13px] text-slate-300 leading-relaxed">{insight}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                    <span className="text-[10px] font-black text-emerald-400 uppercase block mb-3">Recommandation Expert</span>
                    <p className="text-lg font-black text-white uppercase italic">{analysis.suggestedBet}</p>
                 </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-6 bg-slate-900/60 border-t border-slate-800 flex justify-between items-center">
           <div className="flex gap-4">
              {analysis?.sources?.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[10px] text-slate-500 hover:text-emerald-400 underline">Source {i+1}</a>
              ))}
           </div>
           <button onClick={onClose} className="px-8 py-3 bg-white text-slate-950 text-[11px] font-black rounded-xl hover:bg-emerald-500 transition-all uppercase">Fermer</button>
        </div>
      </div>
    </div>
  );
};

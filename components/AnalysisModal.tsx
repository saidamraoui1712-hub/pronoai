
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade">
      <div className="bg-[#0a0a0a] border border-slate-800 w-full max-w-4xl h-full max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
               <h2 className="text-[11px] font-black text-white uppercase tracking-widest">{match.status === 'live' ? 'Live AI Analysis' : 'Match Strategy'}</h2>
               <p className="text-[10px] text-slate-500 font-bold uppercase">{match.homeTeam.name} vs {match.awayTeam.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Modal */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-6 text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">Computing Data Points...</p>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Stats Panel */}
              <div className="md:col-span-4 space-y-4">
                 <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase mb-6 tracking-widest">Victoire %</h3>
                    <div className="space-y-4">
                       {[
                         { label: match.homeTeam.name, val: analysis.winProbabilities.home, color: 'bg-blue-500' },
                         { label: 'Nul', val: analysis.winProbabilities.draw, color: 'bg-slate-700' },
                         { label: match.awayTeam.name, val: analysis.winProbabilities.away, color: 'bg-blue-400' }
                       ].map(p => (
                         <div key={p.label}>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                               <span className="truncate pr-2 uppercase">{p.label}</span>
                               <span className="text-white">{p.val}%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                               <div className={`${p.color} h-full transition-all duration-1000`} style={{width: `${p.val}%`}}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-blue-600/5 p-5 rounded-2xl border border-blue-500/20 text-center">
                    <span className="text-[9px] font-black text-blue-400 uppercase block mb-1">Score Prévu</span>
                    <span className="text-3xl font-black text-white italic tracking-tighter">{analysis.expectedScore}</span>
                 </div>
              </div>

              {/* Insights Panel */}
              <div className="md:col-span-8 space-y-6">
                 {analysis.liveInsights && analysis.liveInsights.length > 0 && (
                   <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span> Live Signal
                      </h3>
                      {analysis.liveInsights.map((insight, idx) => (
                        <div key={idx} className="bg-slate-950 border-l-2 border-blue-500 p-4 rounded-r-xl">
                           <p className="text-[12px] font-medium text-slate-300">{insight.message}</p>
                        </div>
                      ))}
                   </div>
                 )}

                 <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.insights}</h3>
                    <div className="grid grid-cols-1 gap-2">
                       {analysis.keyInsights.map((insight, i) => (
                          <div key={i} className="flex items-start gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/40">
                             <div className="w-5 h-5 shrink-0 bg-blue-500/10 text-blue-500 text-[9px] font-black flex items-center justify-center rounded-md border border-blue-500/20">{i+1}</div>
                             <p className="text-[12px] text-slate-400 leading-relaxed">{insight}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-[9px] font-black text-blue-400 uppercase block mb-2">{t.suggested}</span>
                    <p className="text-base font-black text-white uppercase italic tracking-tighter">{analysis.suggestedBet}</p>
                 </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
           <div className="flex gap-4">
              {analysis?.sources?.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[9px] text-slate-600 hover:text-blue-400 underline uppercase font-bold tracking-tighter">Source {i+1}</a>
              ))}
           </div>
           <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-500 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/30">Fermer</button>
        </div>
      </div>
    </div>
  );
};

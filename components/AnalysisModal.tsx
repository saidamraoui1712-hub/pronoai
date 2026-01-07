
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050507]/90 backdrop-blur-2xl animate-fade">
      <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-5xl h-full max-h-[85vh] flex flex-col rounded-[3rem] shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6] flex items-center justify-center text-white violet-glow">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
               <h2 className="text-xl font-black text-white tracking-tight uppercase">Elite Signal Analysis</h2>
               <p className="text-[11px] text-zinc-500 font-bold uppercase mt-1.5 tracking-widest">{match.homeTeam.name} VS {match.awayTeam.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Intelligence Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
              <p className="mt-8 text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] animate-pulse">Running Neural Simulation...</p>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              
              <div className="md:col-span-4 space-y-8">
                 <div className="bg-white/2 p-10 rounded-[2.5rem] border border-white/5">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-10 tracking-widest">Victory Distribution</h3>
                    <div className="space-y-8">
                       {[
                         { label: match.homeTeam.name, val: analysis.winProbabilities.home, color: 'bg-[#8b5cf6]' },
                         { label: 'Draw', val: analysis.winProbabilities.draw, color: 'bg-zinc-800' },
                         { label: match.awayTeam.name, val: analysis.winProbabilities.away, color: 'bg-emerald-500' }
                       ].map(p => (
                         <div key={p.label}>
                            <div className="flex justify-between text-xs font-black text-zinc-400 mb-3 uppercase tracking-tighter">
                               <span>{p.label}</span>
                               <span className="text-white">{p.val}%</span>
                            </div>
                            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                               <div className={`${p.color} h-full transition-all duration-1000 ease-out`} style={{width: `${p.val}%`}}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center">
                    <span className="text-[11px] font-black text-zinc-500 uppercase block mb-3 tracking-widest">Expected Outcome</span>
                    <span className="text-5xl font-black text-[#8b5cf6] italic tracking-tighter">{analysis.expectedScore}</span>
                 </div>
              </div>

              <div className="md:col-span-8 space-y-10">
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-4">
                      <span className="w-2 h-2 bg-[#8b5cf6] rounded-full"></span> Strategic Insights
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                       {analysis.keyInsights.map((insight, i) => (
                          <div key={i} className="flex items-start gap-6 bg-white/2 p-6 rounded-3xl border border-white/5 hover:border-[#8b5cf6]/20 transition-all group">
                             <div className="w-8 h-8 shrink-0 bg-white/5 text-[#8b5cf6] text-[11px] font-black flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">0{i+1}</div>
                             <p className="text-sm text-zinc-400 leading-relaxed">{insight}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-[#8b5cf6]/5 p-10 rounded-[2.5rem] border border-[#8b5cf6]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-black text-[#8b5cf6] uppercase block mb-3 tracking-widest">High Probability Bet</span>
                      <p className="text-2xl font-black text-white uppercase italic tracking-tighter">{analysis.suggestedBet}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Confidence</span>
                       <span className="text-2xl font-black text-emerald-500">{analysis.confidenceScore}%</span>
                    </div>
                 </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-10 bg-white/2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex gap-6">
              {analysis?.sources?.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[10px] text-zinc-500 hover:text-[#8b5cf6] transition-colors uppercase font-black tracking-widest underline underline-offset-4">Source_0{i+1}</a>
              ))}
           </div>
           <button onClick={onClose} className="w-full md:w-auto px-12 py-5 bg-[#8b5cf6] text-white text-xs font-black rounded-2xl hover:bg-[#7c3aed] transition-all uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 active:scale-95">Close Analysis</button>
        </div>
      </div>
    </div>
  );
};

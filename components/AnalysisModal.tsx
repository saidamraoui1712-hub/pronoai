
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050507]/95 backdrop-blur-3xl animate-fade">
      <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-6xl h-full max-h-[90vh] flex flex-col rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.15)] overflow-hidden relative">
        
        {/* Header avec indicateur de modèle */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6] flex items-center justify-center text-white violet-glow">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
             </div>
             <div>
               <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                 AI Comparative Engine
                 {analysis && (
                   <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-2 py-1 rounded-md border border-emerald-500/20">
                     ENGINE: {analysis.modelUsed.toUpperCase()}
                   </span>
                 )}
               </h2>
               <p className="text-[11px] text-zinc-500 font-bold uppercase mt-1.5 tracking-widest">{match.homeTeam.name} VS {match.awayTeam.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Intelligence Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#8b5cf6]">AI</div>
              </div>
              <p className="mt-8 text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] animate-pulse">Synchronizing Multi-AI Logic...</p>
            </div>
          ) : analysis && (
            <div className="space-y-12">
              
              {/* Quick Stats Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
                  <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Expected Score</div>
                  <div className="text-3xl font-black text-white italic">{analysis.expectedScore}</div>
                </div>
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
                  <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Confidence</div>
                  <div className="text-3xl font-black text-emerald-500 italic">{analysis.confidenceScore}%</div>
                </div>
                <div className="bg-[#8b5cf6]/10 p-6 rounded-[2rem] border border-[#8b5cf6]/20 flex items-center justify-between">
                  <div className="text-[#8b5cf6] text-[10px] font-black uppercase tracking-widest">Best Bet</div>
                  <div className="text-lg font-black text-white uppercase">{analysis.suggestedBet}</div>
                </div>
              </div>

              {/* Dual Perspective Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column Gemini */}
                <div className="bg-white/2 rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <div className="p-6 bg-white/5 flex items-center justify-between border-b border-white/5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Core Engine: Gemini 3</span>
                    <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-[#8b5cf6] font-black text-sm uppercase mb-6 tracking-wider">Technical Data Analysis</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                      "{analysis.geminiPerspective}"
                    </p>
                  </div>
                </div>

                {/* Column ChatGPT Style */}
                <div className="bg-white/2 rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <div className="p-6 bg-white/5 flex items-center justify-between border-b border-white/5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Strategic Emulation: ChatGPT Style</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-emerald-500 font-black text-sm uppercase mb-6 tracking-wider">Strategic Overview</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                      "{analysis.chatGptPerspective}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Insights Chips */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest text-center">AI Strategic Convergence</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {analysis.keyInsights.map((insight, i) => (
                    <div key={i} className="bg-white/5 px-6 py-3 rounded-full border border-white/5 text-[11px] text-zinc-300 font-bold uppercase tracking-wide">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer avec sources */}
        <div className="p-10 bg-white/2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex gap-6">
              {analysis?.sources?.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[10px] text-zinc-600 hover:text-[#8b5cf6] transition-colors uppercase font-black tracking-widest flex items-center gap-2">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Source_0{i+1}
                </a>
              ))}
           </div>
           <button onClick={onClose} className="w-full md:w-auto px-12 py-5 bg-[#8b5cf6] text-white text-xs font-black rounded-2xl hover:bg-[#7c3aed] transition-all uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20">Close Intelligence</button>
        </div>
      </div>
    </div>
  );
};

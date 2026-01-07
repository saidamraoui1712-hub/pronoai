
import React, { useEffect, useState } from 'react';
import { Match, AIAnalysis, UserNote } from '../types';
import { getMatchAnalysis } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { translations } from '../services/translations';

interface AnalysisModalProps {
  match: Match;
  onClose: () => void;
  lang?: 'fr' | 'ar';
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ match, onClose, lang = 'fr' }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const t = translations[lang];

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const data = await getMatchAnalysis(match);
      setAnalysis(data);
      setLoading(false);
      
      const savedNotes = localStorage.getItem('pronos_notes');
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes) as UserNote[];
        const matchNote = parsed.find(n => n.matchId === match.id);
        if (matchNote) setNote(matchNote.note);
      }
    };
    fetchAnalysis();
  }, [match]);

  const saveNote = () => {
    const savedNotes = localStorage.getItem('pronos_notes');
    let notes: UserNote[] = savedNotes ? JSON.parse(savedNotes) : [];
    const index = notes.findIndex(n => n.matchId === match.id);
    if (index > -1) {
      notes[index] = { matchId: match.id, note, updatedAt: new Date().toISOString() };
    } else {
      notes.push({ matchId: match.id, note, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem('pronos_notes', JSON.stringify(notes));
    alert(lang === 'fr' ? 'Analyse sauvegardée.' : 'تم حفظ الملاحظة');
  };

  const COLORS = ['#10b981', '#334155', '#f43f5e'];
  const chartData = analysis ? [
    { name: '1', value: analysis.winProbabilities.home },
    { name: 'X', value: analysis.winProbabilities.draw },
    { name: '2', value: analysis.winProbabilities.away },
  ] : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl">
        
        {/* Header Terminal */}
        <div className="px-8 py-5 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <div className="flex flex-col">
               <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">
                 {lang === 'fr' ? 'DÉCRYPTAGE TACTIQUE' : 'تحليل تكتيكي'} / {match.id.toUpperCase()}
               </h2>
               <span className="text-[9px] text-slate-500 font-mono">STATUS: AI_SCAN_ACTIVE // {match.league}</span>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-full py-40 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
              <p className="text-[10px] font-mono text-emerald-500 tracking-[0.5em] uppercase animate-pulse">{t.fetching}</p>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Stats & Probabilités */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800 shadow-inner">
                  <span className="text-[10px] font-black text-slate-500 uppercase mb-6 block tracking-widest">{lang === 'fr' ? 'RÉPARTITION DES PROBABILITÉS' : 'توزيع الاحتمالات'}</span>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                      <span className="block text-[10px] text-slate-600 font-bold mb-1">1</span>
                      <span className="text-lg font-black text-emerald-500">{analysis.winProbabilities.home}%</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                      <span className="block text-[10px] text-slate-600 font-bold mb-1">X</span>
                      <span className="text-lg font-black text-slate-400">{analysis.winProbabilities.draw}%</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                      <span className="block text-[10px] text-slate-600 font-bold mb-1">2</span>
                      <span className="text-lg font-black text-rose-500">{analysis.winProbabilities.away}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-inner">
                   <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.confidence}</span>
                     <span className="text-2xl font-black text-white italic">{analysis.confidenceScore}%</span>
                   </div>
                   <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${analysis.confidenceScore}%` }}></div>
                   </div>
                </div>
              </div>

              {/* Analyse & Insights */}
              <div className="lg:col-span-5 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-600/10 p-5 rounded-2xl border border-emerald-500/20 shadow-lg">
                      <span className="block text-[9px] text-emerald-400 uppercase font-black mb-2 tracking-widest">{t.exact_score}</span>
                      <span className="text-3xl font-black text-white tracking-tighter">{analysis.expectedScore}</span>
                    </div>
                    <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700">
                      <span className="block text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">{t.suggested}</span>
                      <span className="text-sm font-black text-emerald-400 uppercase">{analysis.suggestedBet}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-4 h-[1px] bg-slate-800"></span> {t.insights}
                    </h3>
                    <div className="space-y-3">
                      {analysis.keyInsights.map((insight, i) => (
                        <div key={i} className="flex gap-4 text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border-l-4 border-emerald-500/50">
                          <span className="text-emerald-500 font-bold">#0{i+1}</span>
                          {insight}
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.absents}</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.absentPlayers.length > 0 ? analysis.absentPlayers.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-lg border border-rose-500/20">
                            {p}
                          </span>
                        )) : <span className="text-[10px] text-slate-600 italic">Aucun absent majeur signalé</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.weather}</h3>
                      <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-[11px] text-slate-400 font-medium">
                        {analysis.weatherImpact || "Conditions normales"}
                      </div>
                    </div>
                 </div>
              </div>

              {/* Analyst Log */}
              <div className="lg:col-span-3">
                 <div className="h-full flex flex-col bg-slate-950/40 border border-slate-800 rounded-3xl overflow-hidden shadow-inner">
                    <div className="px-6 py-4 bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">
                      {t.journal}
                    </div>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={lang === 'fr' ? 'Saisir les dernières observations...' : 'اكتب ملاحظاتك هنا...'}
                      className="flex-1 w-full bg-transparent p-6 text-[11px] text-slate-400 focus:outline-none resize-none leading-relaxed"
                    />
                    <div className="p-6 bg-slate-900/50 border-t border-slate-800">
                      <button 
                        onClick={saveNote}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                      >
                        {lang === 'fr' ? 'FIXER L\'ANALYSE' : 'تثبيت الملاحظة'}
                      </button>
                    </div>
                 </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

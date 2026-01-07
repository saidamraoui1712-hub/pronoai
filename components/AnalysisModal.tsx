
import React, { useEffect, useState } from 'react';
import { Match, AIAnalysis, UserNote } from '../types';
import { getMatchAnalysis } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisModalProps {
  match: Match;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ match, onClose }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const data = await getMatchAnalysis(match);
      setAnalysis(data);
      setLoading(false);
      
      // Load personal notes from localStorage
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
    alert('Note enregistrée pour cette session.');
  };

  const COLORS = ['#10b981', '#334155', '#f43f5e'];
  const chartData = analysis ? [
    { name: 'Home %', value: analysis.winProbabilities.home },
    { name: 'Draw %', value: analysis.winProbabilities.draw },
    { name: 'Away %', value: analysis.winProbabilities.away },
  ] : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl">
        {/* Header Analyste */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest">
               Terminal d'Analyse Privé / {match.id}
             </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-emerald-500">SYNCHRONISATION DES FLUX DE DONNÉES...</p>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Colonne Gauche: Stats & Charts */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-950/50 rounded-lg p-5 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mb-4 block">Calculateur de Probabilités</span>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-500">1</span>
                      <span className="text-sm font-bold text-emerald-500">{analysis.winProbabilities.home}%</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-500">X</span>
                      <span className="text-sm font-bold text-slate-400">{analysis.winProbabilities.draw}%</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-500">2</span>
                      <span className="text-sm font-bold text-rose-500">{analysis.winProbabilities.away}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-5">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-bold text-emerald-400 uppercase">Confidence Rating</span>
                     <span className="text-xl font-black text-white">{analysis.confidenceScore}%</span>
                   </div>
                   <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${analysis.confidenceScore}%` }}></div>
                   </div>
                </div>
              </div>

              {/* Colonne Milieu: Insights & Suggestions */}
              <div className="lg:col-span-5 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Score Exact (IA)</span>
                      <span className="text-2xl font-black text-white">{analysis.expectedScore}</span>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Pick Recommandé</span>
                      <span className="text-sm font-bold text-emerald-400">{analysis.suggestedBet}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Facteurs Tactiques Clés</h3>
                    {analysis.keyInsights.map((insight, i) => (
                      <div key={i} className="flex space-x-3 text-xs text-slate-300 leading-relaxed bg-slate-800/20 p-3 rounded border-l-2 border-emerald-500">
                        {insight}
                      </div>
                    ))}
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Absences & Incertains</h3>
                    <div className="flex flex-wrap gap-2">
                       {analysis.absentPlayers.map((player, i) => (
                         <span key={i} className="px-2 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded border border-rose-500/20">
                           {player}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Colonne Droite: Notes Personnelles */}
              <div className="lg:col-span-3 space-y-6">
                 <div className="h-full flex flex-col bg-slate-950/40 border border-slate-800 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-slate-800 text-[10px] font-bold text-slate-300 uppercase">
                      Journal de Bord (Analyste)
                    </div>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note tes propres impressions ici (exemple: 'Arsenal manque de rythme f-à-f à City'...)"
                      className="flex-1 w-full bg-transparent p-4 text-xs text-slate-400 focus:outline-none resize-none"
                    />
                    <div className="p-3 bg-slate-800/50 border-t border-slate-800">
                      <button 
                        onClick={saveNote}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded transition-colors"
                      >
                        SAUVEGARDER MA NOTE
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

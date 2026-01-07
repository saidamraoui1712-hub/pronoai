
import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MatchCard } from './components/MatchCard';
import { AnalysisModal } from './components/AnalysisModal';
import { Login } from './components/Login';
import { fetchMatchesByDate } from './services/apiService';
import { translations } from './services/translations';
import { Match, BetSlipItem } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [activeTab, setActiveTab] = useState<string>('pronos');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeLeague, setActiveLeague] = useState<string>('all');
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const auth = sessionStorage.getItem('is_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, [isAuthenticated, lang, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMatchesByDate(selectedDate);
      setMatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToSlip = (match: Match) => {
    if (betSlip.some(item => item.matchId === match.id)) return;
    const newItem: BetSlipItem = {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      prediction: match.aiProbability! >= 70 ? (lang === 'fr' ? 'Victoire Favori' : 'فوز المفضل') : (lang === 'fr' ? 'Over 2.5' : 'أكثر من 2.5'),
      odds: match.odds.home
    };
    setBetSlip([...betSlip, newItem]);
  };

  const removeFromSlip = (id: string) => {
    setBetSlip(betSlip.filter(item => item.matchId !== id));
  };

  const uniqueLeagues = useMemo(() => {
    const leagues = Array.from(new Set(matches.map(m => m.league))).sort();
    return leagues;
  }, [matches]);

  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({
        label: d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        dayNum: d.getDate()
      });
    }
    return days;
  }, [lang]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchSearch = m.homeTeam.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.awayTeam.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.league.toLowerCase().includes(search.toLowerCase());
      const matchLeague = activeLeague === 'all' || m.league === activeLeague;
      return matchSearch && matchLeague;
    }).sort((a, b) => (b.aiProbability || 0) - (a.aiProbability || 0));
  }, [matches, search, activeLeague]);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pb-20 selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} setLang={setLang} />

      <header className="relative max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
           <div className="flex flex-col gap-6 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mono">{t.terminal_id} / LIVE_FEED_01</span>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {weekDays.map(day => (
                  <button 
                    key={day.date}
                    onClick={() => { setSelectedDate(day.date); setActiveLeague('all'); }}
                    className={`flex flex-col items-center min-w-[75px] py-4 px-3 rounded-2xl border transition-all duration-300 ${selectedDate === day.date ? 'bg-emerald-600 border-emerald-400 text-white shadow-2xl shadow-emerald-500/20 scale-110 z-10' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800/50'}`}
                  >
                    <span className="text-[9px] font-black uppercase mb-1 mono">{day.label}</span>
                    <span className="text-2xl font-black italic">{day.dayNum}</span>
                  </button>
                ))}
              </div>
           </div>
           
           <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:min-w-[220px]">
                <select 
                  value={activeLeague}
                  onChange={(e) => setActiveLeague(e.target.value)}
                  className="appearance-none w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer mono"
                >
                  <option value="all">{t.all_leagues}</option>
                  {uniqueLeagues.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className={`absolute inset-y-0 ${lang === 'ar' ? 'left-4' : 'right-4'} flex items-center pointer-events-none text-emerald-500/50`}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="relative flex-1 lg:flex-none lg:w-80 group">
                <input 
                  type="text" 
                  placeholder={t.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-12 py-4 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none text-white placeholder-slate-600 mono transition-all group-hover:border-slate-700"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
           </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-9">
          {loading ? (
            <div className="py-48 text-center bg-slate-900/20 rounded-[3rem] border border-slate-800/50 border-dashed">
              <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mx-auto mb-10"></div>
              <p className="text-emerald-500 font-black mono text-xs uppercase tracking-[0.5em] animate-pulse">{t.fetching}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onSelect={setSelectedMatch} 
                    onAddToSlip={addToSlip}
                    lang={lang} 
                  />
                ))}
              </div>
              {filteredMatches.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed border-slate-800/50 rounded-[3rem] bg-slate-900/10">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-slate-500 font-black mono text-[10px] uppercase tracking-widest">{t.no_data}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Bet Slip - Digital Receipt look */}
        <aside className="lg:col-span-3">
           <div className="sticky top-24 bg-slate-900/90 backdrop-blur-3xl border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col">
              <div className="p-8 bg-slate-800/40 flex justify-between items-center border-b border-slate-700/50">
                 <div className="flex flex-col">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mono flex items-center gap-2">
                        {t.my_slip}
                    </h3>
                    <span className="text-[8px] text-emerald-500/60 font-black mono tracking-widest uppercase mt-1">Digital Receipt #0432</span>
                 </div>
                 <span className="bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white text-[10px] font-black px-3 py-1.5 rounded-xl">{betSlip.length}</span>
              </div>
              
              <div className="p-8 space-y-5 max-h-[45vh] overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]">
                 {betSlip.length === 0 ? (
                   <div className="text-center py-20">
                     <div className="w-14 h-14 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     </div>
                     <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mono">{lang === 'fr' ? 'AUCUN PICK DÉTECTÉ' : 'الورقة خاوية'}</p>
                   </div>
                 ) : (
                   betSlip.map(item => (
                     <div key={item.matchId} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/60 relative group animate-in slide-in-from-right-10 duration-500 hover:border-emerald-500/30 transition-all">
                        <button onClick={() => removeFromSlip(item.matchId)} className="absolute top-4 right-4 text-slate-700 hover:text-rose-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <p className="text-[9px] font-black text-slate-500 mb-2 truncate pr-8 uppercase tracking-tighter mono">{item.homeTeam} vs {item.awayTeam}</p>
                        <div className="flex justify-between items-end">
                           <div className="flex flex-col">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mono">{item.prediction}</span>
                           </div>
                           <span className="text-lg font-black text-white italic tracking-tighter">@{item.odds.toFixed(2)}</span>
                        </div>
                     </div>
                   ))
                 )}
              </div>

              {betSlip.length > 0 && (
                <div className="p-8 border-t border-slate-800 bg-slate-950/50">
                   <div className="flex justify-between items-center mb-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono">{t.total_odds}</span>
                        <span className="text-[8px] text-slate-700 mono">PROBABILITY: HIGH</span>
                      </div>
                      <span className="text-4xl font-black text-emerald-500 italic tracking-tighter">
                        {betSlip.reduce((acc, item) => acc * item.odds, 1).toFixed(2)}
                      </span>
                   </div>
                   <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all active:scale-95 text-[11px] uppercase tracking-[0.2em] mono">
                     {lang === 'fr' ? 'INITIER LA TRANSACTION' : 'تأكيد الورقة'}
                   </button>
                   <button onClick={() => setBetSlip([])} className="w-full mt-6 text-slate-600 text-[9px] uppercase font-black hover:text-slate-400 transition-colors mono tracking-widest">
                     [ {t.clear_slip} ]
                   </button>
                </div>
              )}
           </div>
        </aside>
      </main>

      {selectedMatch && <AnalysisModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
      
      <footer className="relative max-w-7xl mx-auto px-4 mt-24 text-center pb-10">
         <div className="inline-flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-8 py-3 rounded-full shadow-2xl">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mono">{t.mode_priv}</span>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[10px] font-black text-slate-600 mono">SSL_QUANTUM_ENCRYPTED</span>
            </div>
            <p className="text-[9px] text-slate-700 font-black mono mt-4 opacity-50">© 2024 PRONOSAI TERMINAL v3.2.1 // EXPERT_QUANTUM_ANALYSIS_ONLY</p>
         </div>
      </footer>
    </div>
  );
};

export default App;


import React, { useState, useEffect, useMemo } from 'react';
import { Match, BetSlipItem, AIAnalysis } from './types';
import { fetchRealMatches } from './services/matchService';
import { analyzeMatch } from './services/analysisService';
import { Login } from './components/Login';
import { MatchCard } from './components/MatchCard';
import { SportsWidget } from './components/SportsWidget';
import { translations } from './services/translations';

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [activeTab, setActiveTab] = useState<'pronos' | 'leagues'>('pronos');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<{match: Match, analysis: AIAnalysis} | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());

  const t = translations[lang];
  const API_SPORTS_KEY = "ffcbec0556b632dfa240569116630df0";

  useEffect(() => {
    const auth = sessionStorage.getItem('is_auth');
    if (auth === 'true') {
      setIsAuth(true);
      loadMatches(selectedDate);
    }
  }, []);

  // Auto-refresh logic for AI predictions
  useEffect(() => {
    if (isAuth && activeTab === 'pronos') {
      const intervalId = setInterval(() => {
        refreshData();
      }, 60000); // 60 seconds
      return () => clearInterval(intervalId);
    }
  }, [isAuth, selectedDate, activeTab]);

  const loadMatches = async (date: string, silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await fetchRealMatches(date);
      setMatches(data);
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to load matches", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshData = () => {
    loadMatches(selectedDate, true);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadMatches(date);
  };

  const handleAnalyze = async (match: Match) => {
    setAnalyzingId(match.id);
    try {
      const analysis = await analyzeMatch(match);
      setSelectedAnalysis({ match, analysis });
    } catch (e) {
      alert("Erreur d'analyse. Réessayez.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const addToSlip = (match: Match, prediction: string, odds: number) => {
    if (betSlip.find(i => i.matchId === match.id)) return;
    setBetSlip([...betSlip, {
      matchId: match.id,
      matchName: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      prediction,
      odds
    }]);
  };

  const totalOdds = useMemo(() => {
    return betSlip.reduce((acc, item) => acc * item.odds, 1).toFixed(2);
  }, [betSlip]);

  if (!isAuth) return <Login onLogin={() => { setIsAuth(true); loadMatches(selectedDate); }} />;

  return (
    <div className="min-h-screen bg-[#050507] text-[#ececed] selection:bg-cyan-500/30">
      {/* Top Navbar */}
      <header className="h-20 border-b border-white/5 bg-[#050507]/80 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('pronos')}>
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter">PRONOS<span className="text-cyan-500">AI</span></h1>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('pronos')}
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'pronos' ? 'bg-cyan-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              {t.pronos}
            </button>
            <button 
              onClick={() => setActiveTab('leagues')}
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'leagues' ? 'bg-cyan-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              {t.leagues}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            {lang === 'fr' ? 'ARABIC' : 'FRANÇAIS'}
          </button>
          <div className="h-6 w-px bg-white/5"></div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg group relative cursor-help">
            <span className={`w-2 h-2 ${isRefreshing ? 'bg-emerald-400 animate-spin' : 'bg-cyan-500 animate-pulse'} rounded-full`}></span>
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">
              {isRefreshing ? 'Updating...' : `Sync: ${lastSync}`}
            </span>
          </div>
        </div>
      </header>

      <div className="flex lg:flex-row flex-col">
        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-12">
          
          {activeTab === 'pronos' ? (
            <>
              {/* Calendar Picker & Control */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const iso = d.toISOString().split('T')[0];
                    return (
                      <button
                        key={iso}
                        onClick={() => handleDateChange(iso)}
                        className={`flex flex-col items-center min-w-[80px] py-4 rounded-2xl transition-all ${selectedDate === iso ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105' : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}
                      >
                        <span className="text-[10px] font-black uppercase mb-1">{d.toLocaleDateString(lang, { weekday: 'short' })}</span>
                        <span className="text-xl font-black">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all group"
                >
                  <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-500' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRefreshing ? 'Syncing...' : 'Force Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                  <p className="mt-6 text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] animate-pulse">Scanning Global Feeds...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {matches.length > 0 ? matches.map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      onAnalyze={() => handleAnalyze(match)}
                      onAdd={(p, o) => addToSlip(match, p, o)}
                      isAnalyzing={analyzingId === match.id}
                      lang={lang}
                    />
                  )) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="text-zinc-800 text-6xl mb-6">∅</div>
                      <h3 className="text-white font-black uppercase tracking-widest text-lg">Walo Match</h3>
                      <p className="text-zinc-600 text-xs mt-2 uppercase font-bold">Aucun événement détecté pour cette date.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-12">
               <div className="flex flex-col gap-2 mb-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Exploration Mondiale</h2>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Auto-Update (60s)</div>
                  </div>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Naviguez parmi toutes les ligues via les données officielles API-SPORTS</p>
               </div>
               
               <div className="grid grid-cols-1 gap-12">
                  <SportsWidget 
                    type="leagues" 
                    apiKey={API_SPORTS_KEY} 
                    lang={lang}
                  />
                  
                  <div className="mt-8">
                    <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-6">Matchs en Direct (Global)</h3>
                    <SportsWidget 
                      type="games" 
                      apiKey={API_SPORTS_KEY} 
                      lang={lang}
                      refresh="60"
                    />
                  </div>
               </div>
            </div>
          )}
        </main>

        {/* Sidebar BetSlip */}
        <aside className="lg:w-96 w-full p-6 lg:p-12 border-l border-white/5 bg-white/2 min-h-screen">
          <div className="sticky top-32">
            <h3 className="text-xl font-black uppercase italic mb-8 flex items-center justify-between">
              {t.my_slip}
              <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 rounded-md not-italic">{betSlip.length}</span>
            </h3>

            <div className="space-y-4 mb-8">
              {betSlip.length > 0 ? betSlip.map((item, idx) => (
                <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 group relative overflow-hidden">
                  <button 
                    onClick={() => setBetSlip(betSlip.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 text-zinc-700 hover:text-rose-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{item.matchName}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-black text-cyan-400 uppercase tracking-wider">{item.prediction}</p>
                    <p className="text-lg font-black italic">{item.odds}</p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Coupon Vide</p>
                </div>
              )}
            </div>

            {betSlip.length > 0 && (
              <div className="bg-cyan-500 p-8 rounded-[2.5rem] shadow-2xl shadow-cyan-500/20 text-black">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{t.total_odds}</span>
                  <span className="text-4xl font-black italic">@{totalOdds}</span>
                </div>
                <button className="w-full bg-black text-white font-black py-5 rounded-2xl uppercase text-[11px] tracking-[0.3em] hover:scale-105 active:scale-95 transition-all">
                  Valider le Pronostic
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050507]/98 backdrop-blur-3xl animate-fade">
          <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-5xl h-full max-h-[85vh] flex flex-col rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Intelligence Rapport</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">{selectedAnalysis.match.homeTeam.name} vs {selectedAnalysis.match.awayTeam.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAnalysis(null)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-2">Score Prédit</p>
                  <p className="text-3xl font-black italic">{selectedAnalysis.analysis.expectedScore}</p>
                </div>
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5">
                  <p className="text-zinc-500 text-[10px] font-black uppercase mb-2">Confiance IA</p>
                  <p className="text-3xl font-black italic text-cyan-400">{selectedAnalysis.analysis.confidenceScore}%</p>
                </div>
                <div className="bg-cyan-500/10 p-6 rounded-[2rem] border border-cyan-500/20">
                  <p className="text-cyan-500 text-[10px] font-black uppercase mb-2">Meilleur Pari</p>
                  <p className="text-xl font-black italic uppercase">{selectedAnalysis.analysis.suggestedBet}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-l-2 border-cyan-500 pl-4">Analyse Technique</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">"{selectedAnalysis.analysis.technicalAnalysis}"</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-4">Analyse Stratégique</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">"{selectedAnalysis.analysis.strategicAnalysis}"</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Points Clés</h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {selectedAnalysis.analysis.keyInsights.map((insight, idx) => (
                    <div key={idx} className="px-6 py-3 bg-white/5 border border-white/5 rounded-full text-[11px] font-bold uppercase tracking-wide text-zinc-300">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-white/2 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex gap-4">
                  {selectedAnalysis.analysis.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="text-[9px] font-black text-zinc-600 hover:text-cyan-400 transition-colors flex items-center gap-2 uppercase">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      Source_{i+1}
                    </a>
                  ))}
               </div>
               <button onClick={() => setSelectedAnalysis(null)} className="w-full md:w-auto px-12 py-5 bg-cyan-500 text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-cyan-500/20">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

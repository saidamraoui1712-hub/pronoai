
import React, { useState, useMemo, useEffect } from 'react';
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
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [dataSource, setDataSource] = useState<'API' | 'AI_SEARCH' | 'MOCK'>('MOCK');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>(() => {
    const saved = localStorage.getItem('bet_slip');
    return saved ? JSON.parse(saved) : [];
  });

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('bet_slip', JSON.stringify(betSlip));
  }, [betSlip]);

  useEffect(() => {
    const auth = localStorage.getItem('is_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, [selectedDate]);

  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setLoadingStatus("Connexion satellite...");
    try {
      const { matches: data, source } = await fetchMatchesByDate(selectedDate, (status) => {
        setLoadingStatus(status);
      });
      setMatches(data);
      setDataSource(source);
    } catch (e) {
      setLoadingStatus("Erreur de synchronisation.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const filteredMatches = useMemo(() => {
    let result = [...matches];
    if (search) {
      result = result.filter(m => 
        m.homeTeam.name.toLowerCase().includes(search.toLowerCase()) || 
        m.awayTeam.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeTab === 'live') result = result.filter(m => m.status === 'live');
    if (activeTab === 'analyses') result = result.filter(m => (m.aiProbability || 0) >= 80);
    return result;
  }, [matches, search, activeTab]);

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      days.push(
        <button 
          key={iso}
          onClick={() => setSelectedDate(iso)}
          className={`flex flex-col items-center min-w-[70px] py-3 rounded-2xl transition-all ${selectedDate === iso ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20' : 'bg-[#0f0f12] text-zinc-500 hover:text-zinc-300'}`}
        >
          <span className="text-[9px] font-bold uppercase mb-1">{d.toLocaleDateString(lang, { weekday: 'short' })}</span>
          <span className="text-sm font-black">{d.getDate()}</span>
        </button>
      );
    }
    return days;
  }, [lang, selectedDate]);

  if (!isAuthenticated) return <Login onLogin={() => {
    localStorage.setItem('is_auth', 'true');
    setIsAuthenticated(true);
  }} />;

  return (
    <div className="flex min-h-screen bg-[#050507] text-[#ececed]">
      <aside className="hidden lg:flex w-72 glass-sidebar flex-col sticky top-0 h-screen z-50">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-11 h-11 bg-[#8b5cf6] rounded-2xl flex items-center justify-center violet-glow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">PRONOS<span className="text-[#8b5cf6]">AI</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'API' ? 'bg-emerald-500' : 'bg-[#8b5cf6]'}`}></span>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{dataSource === 'API' ? 'Official Feed' : 'AI Global Scan'}</span>
              </div>
            </div>
          </div>
          <nav className="space-y-2">
            {[{ id: 'pronos', label: t.pronos, icon: <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /> }].map(nav => (
              <button key={nav.id} onClick={() => setActiveTab(nav.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === nav.id ? 'active-link' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">{nav.icon}</svg>
                {nav.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-10 py-8 flex items-center justify-between shrink-0 border-b border-white/5">
          <h2 className="text-2xl font-black uppercase">{t.pronos}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => loadData()} className="p-3 bg-[#0f0f12] rounded-2xl hover:text-[#8b5cf6] border border-white/5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">{calendarDays}</div>

          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
              <p className="mt-8 text-[11px] font-black uppercase tracking-[0.3em]">{loadingStatus}</p>
            </div>
          ) : (
            <>
              {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                  {filteredMatches.map(match => <MatchCard key={match.id} match={match} onSelect={setSelectedMatch} lang={lang} />)}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                    <svg className="h-10 w-10 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <h3 className="text-white font-black uppercase tracking-widest mb-4">Aucun match détecté par l'API</h3>
                  <p className="text-zinc-500 text-sm max-w-xs mb-8">Les championnats majeurs sont peut-être à l'arrêt. Veux-tu forcer une recherche IA approfondie ?</p>
                  <button 
                    onClick={() => loadData()}
                    className="px-8 py-4 bg-[#8b5cf6] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20"
                  >
                    Scanner le Web (IA)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selectedMatch && <AnalysisModal match={selectedMatch} onClose={() => setSelectedMatch(null)} lang={lang} />}
    </div>
  );
};

export default App;


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
  const [isRealData, setIsRealData] = useState<boolean>(false);
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

  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const { matches: data, isReal } = await fetchMatchesByDate(selectedDate);
      setMatches(data);
      setIsRealData(isReal);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const addToSlip = (match: Match) => {
    if (betSlip.some(item => item.matchId === match.id)) return;
    const newItem: BetSlipItem = {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      prediction: match.aiProbability! >= 70 ? (lang === 'fr' ? '1/X' : '1/X') : (lang === 'fr' ? 'BTTS' : 'BTTS'),
      odds: match.odds.home
    };
    setBetSlip([...betSlip, newItem]);
  };

  const filteredMatches = useMemo(() => {
    let result = [...matches];
    if (search) {
      result = result.filter(m => 
        m.homeTeam.name.toLowerCase().includes(search.toLowerCase()) || 
        m.awayTeam.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeLeague !== 'all') {
      result = result.filter(m => m.league === activeLeague);
    }
    if (activeTab === 'live') result = result.filter(m => m.status === 'live');
    if (activeTab === 'analyses') result = result.filter(m => (m.aiProbability || 0) >= 80);
    if (activeTab === 'vip') {
      const topLeagues = ['Premier League', 'La Liga', 'Ligue 1', 'Serie A', 'Bundesliga', 'Botola'];
      result = result.filter(m => topLeagues.some(tl => m.league.includes(tl)) && (m.aiProbability || 0) >= 75);
    }
    return result;
  }, [matches, search, activeLeague, activeTab]);

  const uniqueLeagues = useMemo(() => Array.from(new Set(matches.map(m => m.league))).sort(), [matches]);

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

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex min-h-screen bg-[#050507] text-[#ececed]">
      {/* Sidebar - Sleek Glass */}
      <aside className="hidden lg:flex w-72 glass-sidebar flex-col sticky top-0 h-screen z-50">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-11 h-11 bg-[#8b5cf6] rounded-2xl flex items-center justify-center violet-glow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">PRONOS<span className="text-[#8b5cf6]">AI</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Quantum v6</span>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'pronos', label: t.pronos, icon: <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /> },
              { id: 'live', label: t.live, icon: <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /> },
              { id: 'analyses', label: t.analyses, icon: <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /> },
              { id: 'vip', label: t.vip, icon: <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /> }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === nav.id ? 'active-link' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">{nav.icon}</svg>
                {nav.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10 border-t border-white/5">
          <button 
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="w-full bg-[#0f0f12] text-zinc-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#8b5cf6] transition-colors"
          >
            {lang === 'fr' ? 'LANGUAGE: AR' : 'LANGUAGE: FR'}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-10 py-8 flex items-center justify-between shrink-0 border-b border-white/5 bg-[#050507]/50 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <h2 className="text-2xl font-black tracking-tight">{t[activeTab as keyof typeof t] || t.pronos}</h2>
            <div className="relative w-72">
              <input 
                type="text" 
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f0f12] border border-white/5 rounded-2xl px-12 py-3 text-sm focus:border-[#8b5cf6]/50 transition-all outline-none"
              />
              <svg className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0f0f12] px-4 py-2.5 rounded-2xl border border-white/5">
              <span className={`w-2 h-2 rounded-full ${isRealData ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{isRealData ? 'LIVE_DATA' : 'SIMULATION'}</span>
            </div>
            <button onClick={() => loadData()} className="p-3 bg-[#0f0f12] rounded-2xl hover:text-[#8b5cf6] transition-colors border border-white/5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab !== 'live' && (
            <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
              {calendarDays}
            </div>
          )}

          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
                <p className="mt-6 text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Syncing Galaxy Systems...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {filteredMatches.map(match => (
                <MatchCard key={match.id} match={match} onSelect={setSelectedMatch} onAddToSlip={addToSlip} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Slip Bar - Dark Emerald */}
      {betSlip.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#0c0c0e] border border-white/10 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-10 z-[60] violet-glow animate-fade">
          <div className="flex items-center gap-4">
            <div className="bg-[#8b5cf6] text-white font-black px-4 py-1.5 rounded-xl text-sm">{betSlip.length}</div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Selected Picks</span>
              <span className="text-xl font-black text-white italic">@{betSlip.reduce((acc, i) => acc * i.odds, 1).toFixed(2)}</span>
            </div>
          </div>
          <button className="bg-[#8b5cf6] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#7c3aed] transition-all">Submit Entry</button>
          <button onClick={() => setBetSlip([])} className="text-zinc-600 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {selectedMatch && <AnalysisModal match={selectedMatch} onClose={() => setSelectedMatch(null)} lang={lang} />}
    </div>
  );
};

export default App;

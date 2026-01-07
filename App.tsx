
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
  const [lastUpdated, setLastUpdated] = useState<string>('');
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

  // Rafraîchissement automatique pour le LIVE
  useEffect(() => {
    if (activeTab === 'live' && isAuthenticated) {
      const interval = setInterval(() => {
        loadData(false); // Silent refresh
      }, 60000); // Toutes les minutes
      return () => clearInterval(interval);
    }
  }, [activeTab, isAuthenticated]);

  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const { matches: data, isReal } = await fetchMatchesByDate(selectedDate);
      setMatches(data);
      setIsRealData(isReal);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
      prediction: match.aiProbability! >= 70 ? (lang === 'fr' ? 'Victoire Favori' : 'فوز المفضل') : (lang === 'fr' ? 'Over 2.5' : 'أكثر من 2.5'),
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

    if (activeTab === 'live') {
      result = result.filter(m => m.status === 'live');
    }

    if (activeTab === 'analyses') {
      result = result.filter(m => (m.aiProbability || 0) >= 75);
    }

    if (activeTab === 'vip') {
      const topLeagues = [
        'Premier League', 'La Liga', 'Ligue 1', 'Serie A', 'Bundesliga', 
        'Botola', 'Botola Pro', 'Botola Inwi', 'Morocco'
      ];
      result = result.filter(m => {
        const isTopLeague = topLeagues.some(tl => m.league.toLowerCase().includes(tl.toLowerCase()));
        const isHighConfidence = (m.aiProbability || 0) >= 70;
        return isTopLeague && (isHighConfidence || m.status === 'live');
      });
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
          className={`flex flex-col items-center min-w-[65px] py-2.5 rounded-xl border transition-all active:scale-95 ${selectedDate === iso ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
        >
          <span className="text-[7px] font-black uppercase mb-0.5">{d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA', { weekday: 'short' })}</span>
          <span className="text-sm font-black tracking-tighter">{d.getDate()}</span>
        </button>
      );
    }
    return days;
  }, [lang, selectedDate]);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex min-h-screen bg-[#050505] selection:bg-blue-500/30">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 glass border-r border-slate-800/40 flex-col sticky top-0 h-screen overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tighter leading-none">PRONOS<span className="text-blue-500">AI</span></h1>
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1 block">Quantum v3.2</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'pronos', label: t.pronos, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> },
              { id: 'live', label: t.live, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
              { id: 'analyses', label: t.analyses, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
              { id: 'vip', label: t.vip, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /> }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => { setActiveTab(nav.id); setSearch(''); setActiveLeague('all'); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[12px] font-bold transition-all group ${activeTab === nav.id ? 'active-tab shadow-lg shadow-blue-900/10' : 'text-slate-500 hover:text-white hover:bg-slate-900/50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4.5 w-4.5 ${activeTab === nav.id ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{nav.icon}</svg>
                {nav.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/40">
          <button 
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-950 border border-slate-800 py-3.5 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 transition-all active:scale-95"
          >
            {lang === 'fr' ? 'العربية' : 'FRANÇAIS'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Dashboard */}
        <header className="glass border-b border-slate-800/40 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 relative z-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t[activeTab as keyof typeof t] || t.pronos}</h2>
            <div className="flex flex-col">
               <div className={`flex items-center gap-2 ${isRealData ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'} px-3 py-1 rounded-full border`}>
                 <span className={`w-1.5 h-1.5 ${isRealData ? 'bg-blue-500' : 'bg-orange-500'} rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]`}></span>
                 <span className={`text-[9px] font-black ${isRealData ? 'text-blue-400' : 'text-orange-400'} uppercase tracking-widest`}>{isRealData ? 'LIVE FEED' : 'SIMULATION'}</span>
               </div>
               {lastUpdated && <span className="text-[8px] text-slate-600 font-bold mt-1">MÀJ: {lastUpdated}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => loadData()}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all active:rotate-180 duration-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>

            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-10 py-3 text-[12px] font-medium focus:border-blue-500/50 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <select 
              value={activeLeague}
              onChange={(e) => setActiveLeague(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase appearance-none cursor-pointer hover:border-slate-700 transition-all"
            >
              <option value="all">{t.all_leagues}</option>
              {uniqueLeagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.03),transparent_40%)]">
          {/* Calendar Selector */}
          {activeTab !== 'live' && (
            <div className="flex gap-3 overflow-x-auto pb-8 no-scrollbar items-center">
              {calendarDays}
            </div>
          )}

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-6 text-[9px] font-black text-blue-500 uppercase tracking-widest animate-pulse">{t.fetching}</p>
            </div>
          ) : (
            <>
              {!isRealData && activeTab !== 'live' && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3">
                   <svg className="h-5 w-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                     {lang === 'fr' ? "Impossible de synchroniser les matchs réels (clé API limitée). Affichage des données de simulation." : "تعذر مزامنة المباريات الحقيقية (مفتاح API محدود). عرض بيانات المحاكاة."}
                   </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4 pb-12">
                {filteredMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onSelect={setSelectedMatch} 
                    onAddToSlip={addToSlip} 
                    lang={lang} 
                  />
                ))}
                {filteredMatches.length === 0 && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-slate-800/40 rounded-3xl">
                     <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">{t.no_data}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Floating Bet Slip (Mobile) */}
        {betSlip.length > 0 && (
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
             <button className="bg-blue-600 text-white w-16 h-16 rounded-2xl shadow-2xl shadow-blue-900/50 flex items-center justify-center active:scale-90 transition-all">
                <span className="absolute -top-1.5 -right-1.5 bg-white text-blue-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">{betSlip.length}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
             </button>
          </div>
        )}
      </main>

      {/* Right Sidebar - Bet Slip (Desktop) */}
      <aside className="hidden xl:flex w-80 glass border-l border-slate-800/40 flex-col h-screen sticky top-0 overflow-hidden">
        <div className="p-6 border-b border-slate-800/40 flex justify-between items-center bg-slate-900/10">
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{t.my_slip}</h3>
          <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg">{betSlip.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/20">
          {betSlip.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
               <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Panier Vide</p>
            </div>
          ) : (
            betSlip.map(item => (
              <div key={item.matchId} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl relative animate-fade group hover:border-blue-500/30 transition-all">
                <button 
                  onClick={() => setBetSlip(slip => slip.filter(i => i.matchId !== item.matchId))}
                  className="absolute top-3 right-3 text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2 truncate pr-6">{item.homeTeam} vs {item.awayTeam}</p>
                <div className="flex justify-between items-end">
                   <div className="flex flex-col">
                     <span className="text-[11px] font-black text-blue-400 uppercase leading-none">{item.prediction}</span>
                   </div>
                   <span className="text-xl font-black text-white italic tracking-tighter">@{item.odds.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {betSlip.length > 0 && (
          <div className="p-6 border-t border-slate-800/40 bg-slate-900/40">
             <div className="flex justify-between items-center mb-6">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.total_odds}</span>
                <span className="text-3xl font-black text-blue-500 italic tracking-tighter">
                    {betSlip.reduce((acc, item) => acc * item.odds, 1).toFixed(2)}
                </span>
             </div>
             <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 text-[10px] uppercase tracking-widest">
               Valider
             </button>
             <button onClick={() => setBetSlip([])} className="w-full mt-4 text-slate-600 text-[9px] font-bold uppercase hover:text-rose-500 transition-colors">
                {t.clear_slip}
             </button>
          </div>
        )}
      </aside>

      {selectedMatch && <AnalysisModal match={selectedMatch} onClose={() => setSelectedMatch(null)} lang={lang} />}
    </div>
  );
};

export default App;

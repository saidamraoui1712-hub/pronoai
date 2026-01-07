
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

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMatchesByDate(selectedDate);
      setMatches(data);
      setLastUpdated(new Date().toLocaleTimeString());
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

    return result.sort((a, b) => (b.aiProbability || 0) - (a.aiProbability || 0));
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
          className={`flex flex-col items-center min-w-[75px] py-4 rounded-2xl border transition-all active:scale-95 ${selectedDate === iso ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-500/30' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}`}
        >
          <span className="text-[9px] font-black uppercase mb-1">{d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA', { weekday: 'short' })}</span>
          <span className="text-xl font-black">{d.getDate()}</span>
        </button>
      );
    }
    return days;
  }, [lang, selectedDate]);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex min-h-screen bg-[#020617] selection:bg-emerald-500/30">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 glass border-r border-slate-800/60 flex-col sticky top-0 h-screen overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter leading-none">PRONOS<span className="text-emerald-500">AI</span></h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Quantum Intelligence</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'pronos', label: t.pronos, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> },
              { id: 'analyses', label: t.analyses, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
              { id: 'vip', label: t.vip, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /> }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => { setActiveTab(nav.id); setSearch(''); setActiveLeague('all'); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all group ${activeTab === nav.id ? 'active-tab shadow-lg shadow-emerald-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeTab === nav.id ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{nav.icon}</svg>
                {nav.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800/40">
          <button 
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-slate-800 py-4 rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827-5.802M10.5 8.5a10.898 10.898 0 012.348 5.262M9 19l1.206-2.814M12 19l-1.206-2.814M7.697 16.077L7 15l-1.047 1.077" /></svg>
            {lang === 'fr' ? 'العربية' : 'FRANÇAIS'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Dashboard */}
        <header className="glass border-b border-slate-800/60 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 relative z-10">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t[activeTab as keyof typeof t] || t.pronos}</h2>
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2.5 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.sync}</span>
               </div>
               {lastUpdated && <span className="text-[9px] text-slate-500 font-bold uppercase text-center">MàJ: {lastUpdated}</span>}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={loadData}
              className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all active:rotate-180 duration-500"
              title="Rafraîchir les scores"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>

            <div className="relative flex-1 md:w-72">
              <input 
                type="text" 
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-2xl px-12 py-3.5 text-sm font-medium focus:border-emerald-500/50 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <select 
              value={activeLeague}
              onChange={(e) => setActiveLeague(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-[11px] font-black uppercase appearance-none cursor-pointer hover:border-slate-700 transition-all"
            >
              <option value="all">{t.all_leagues}</option>
              {uniqueLeagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.02),transparent_40%)]">
          {activeTab === 'vip' && (
            <div className="mb-8 p-6 bg-emerald-600/10 border border-emerald-500/20 rounded-[2rem] animate-fade flex justify-between items-center">
               <div>
                  <h3 className="text-emerald-500 font-black uppercase text-sm mb-2 tracking-widest">Elite Selection (Top 5 + Botola)</h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl">
                    Focus exclusif sur les ligues majeures et la Botola Pro Inwi. Analyse synchronisée en temps réel.
                  </p>
               </div>
               <div className="hidden md:block">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  </div>
               </div>
            </div>
          )}

          {/* Calendar Selector */}
          <div className="flex gap-4 overflow-x-auto pb-10 no-scrollbar items-center">
            {calendarDays}
          </div>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-8 bg-emerald-500/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="mt-8 text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] animate-pulse">{t.fetching}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 pb-12">
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
                <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/50 rounded-[3rem] bg-slate-900/10">
                   <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <p className="text-slate-500 font-black text-sm uppercase tracking-widest">{t.no_data}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Bet Slip (Mobile) */}
        {betSlip.length > 0 && (
          <div className="lg:hidden fixed bottom-8 right-8 z-50">
             <button className="bg-emerald-600 text-white w-20 h-20 rounded-[2rem] shadow-[0_20px_40px_rgba(5,150,105,0.4)] flex items-center justify-center active:scale-90 transition-all animate-bounce">
                <span className="absolute -top-2 -right-2 bg-white text-emerald-600 text-sm font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-emerald-600">{betSlip.length}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
             </button>
          </div>
        )}
      </main>

      {/* Right Sidebar - Bet Slip (Desktop) */}
      <aside className="hidden xl:flex w-96 glass border-l border-slate-800/60 flex-col h-screen sticky top-0 overflow-hidden">
        <div className="p-8 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/20">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{t.my_slip}</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Coupons Actifs</span>
          </div>
          <span className="bg-emerald-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20">{betSlip.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-950/20">
          {betSlip.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
               <div className="w-16 h-16 bg-slate-800/30 rounded-[1.5rem] flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               </div>
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{lang === 'fr' ? 'AUCUN MATCH SELECTIONNÉ' : 'لم يتم اختيار أي مباراة'}</p>
            </div>
          ) : (
            betSlip.map(item => (
              <div key={item.matchId} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-[1.5rem] relative animate-fade group hover:border-emerald-500/30 transition-all">
                <button 
                  onClick={() => setBetSlip(slip => slip.filter(i => i.matchId !== item.matchId))}
                  className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 truncate pr-10">{item.homeTeam} VS {item.awayTeam}</p>
                <div className="flex justify-between items-end">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase mb-1">Prédiction</span>
                     <span className="text-[13px] font-black text-emerald-400 uppercase leading-none">{item.prediction}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-black text-slate-600 uppercase mb-1 block">Cote</span>
                     <span className="text-2xl font-black text-white italic tracking-tighter">@{item.odds.toFixed(2)}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {betSlip.length > 0 && (
          <div className="p-8 border-t border-slate-800/60 bg-slate-900/60 backdrop-blur-xl">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t.total_odds}</span>
                  <span className="text-4xl font-black text-emerald-500 italic tracking-tighter">
                    {betSlip.reduce((acc, item) => acc * item.odds, 1).toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Matches</span>
                   <span className="text-xl font-black text-white">{betSlip.length}</span>
                </div>
             </div>
             <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 text-[11px] uppercase tracking-[0.2em]">
               {lang === 'fr' ? 'Valider le coupon' : 'تأكيد الورقة'}
             </button>
             <button onClick={() => setBetSlip([])} className="w-full mt-6 text-slate-600 text-[10px] font-bold uppercase hover:text-rose-500 transition-colors underline decoration-dotted underline-offset-4">
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

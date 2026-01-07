
import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MatchCard } from './components/MatchCard';
import { AnalysisModal } from './components/AnalysisModal';
import { Login } from './components/Login';
import { fetchMatchesByDate, getLeagueTrends } from './services/apiService';
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
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [showSlip, setShowSlip] = useState(false);

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
    const data = await fetchMatchesByDate(selectedDate);
    setMatches(data);
    setLoading(false);
  };

  const addToSlip = (match: Match) => {
    if (betSlip.some(item => item.matchId === match.id)) return;
    const newItem: BetSlipItem = {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      prediction: match.aiProbability! >= 70 ? 'Victoire Favori' : 'Over 2.5',
      odds: match.odds.home
    };
    setBetSlip([...betSlip, newItem]);
    setShowSlip(true);
  };

  const removeFromSlip = (id: string) => {
    setBetSlip(betSlip.filter(item => item.matchId !== id));
  };

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
    return matches.filter(m => 
      m.homeTeam.name.toLowerCase().includes(search.toLowerCase()) || 
      m.awayTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      m.league.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (b.aiProbability || 0) - (a.aiProbability || 0));
  }, [matches, search]);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pb-20 overflow-x-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} setLang={setLang} />

      <header className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
           <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              {weekDays.map(day => (
                <button 
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center min-w-[60px] p-3 rounded-2xl border transition-all ${selectedDate === day.date ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  <span className="text-[10px] font-bold uppercase mb-1">{day.label}</span>
                  <span className="text-lg font-black">{day.dayNum}</span>
                </button>
              ))}
           </div>
           
           <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none text-white"
              />
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          {loading ? (
            <div className="py-40 text-center">
              <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-emerald-500 font-mono text-xs uppercase tracking-widest">{t.fetching}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          )}
        </div>

        {/* Betting Slip Sidebar */}
        <aside className="lg:col-span-3">
           <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-5 bg-slate-800 flex justify-between items-center">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                   {t.my_slip}
                 </h3>
                 <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{betSlip.length}</span>
              </div>
              
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                 {betSlip.length === 0 ? (
                   <p className="text-center text-slate-600 text-xs py-10 uppercase font-mono italic">Aucun match sélectionné</p>
                 ) : (
                   betSlip.map(item => (
                     <div key={item.matchId} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative group">
                        <button onClick={() => removeFromSlip(item.matchId)} className="absolute top-2 right-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-[10px] font-bold text-slate-400 mb-1">{item.homeTeam} vs {item.awayTeam}</p>
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-emerald-500 uppercase">{item.prediction}</span>
                           <span className="text-sm font-mono font-bold text-white">@{item.odds.toFixed(2)}</span>
                        </div>
                     </div>
                   ))
                 )}
              </div>

              {betSlip.length > 0 && (
                <div className="p-5 border-t border-slate-800 bg-slate-900/50">
                   <div className="flex justify-between mb-4">
                      <span className="text-xs font-bold text-slate-500">{t.total_odds}</span>
                      <span className="text-lg font-black text-emerald-500">
                        {betSlip.reduce((acc, item) => acc * item.odds, 1).toFixed(2)}
                      </span>
                   </div>
                   <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em]">
                     Valider ma sélection
                   </button>
                   <button onClick={() => setBetSlip([])} className="w-full mt-2 text-slate-600 text-[9px] uppercase font-bold hover:text-slate-400">
                     {t.clear_slip}
                   </button>
                </div>
              )}
           </div>
        </aside>
      </main>

      {selectedMatch && <AnalysisModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </div>
  );
};

export default App;

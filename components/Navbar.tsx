
import React from 'react';
import { translations } from '../services/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'fr' | 'ar';
  setLang: (l: 'fr' | 'ar') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, lang, setLang }) => {
  const t = translations[lang];
  
  const links = [
    { id: 'pronos', label: t.pronos },
    { id: 'analyses', label: t.analyses },
    { id: 'vip', label: t.vip }
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('pronos')}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">{t.title.split(' ')[0]}<span className="text-emerald-500">{t.title.split(' ')[1]}</span></span>
          </div>
          
          <div className="hidden md:block">
            <div className={`flex items-baseline ${lang === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`${
                    activeTab === link.id 
                    ? 'text-emerald-400 bg-emerald-400/10' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  } px-3 py-2 rounded-md text-sm font-medium transition-all`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-white font-bold hover:bg-slate-700 transition-colors uppercase"
            >
              {lang === 'fr' ? 'العربية' : 'Français'}
            </button>
            <div className="flex items-center space-x-2 bg-emerald-600/10 border border-emerald-500/20 px-3 py-1 rounded-full">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{t.sync}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

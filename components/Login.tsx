
import React, { useState } from 'react';
import { translations } from '../services/translations';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');

  const t = translations[lang];
  const MASTER_PASSWORD = 'admin'; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      sessionStorage.setItem('is_auth', 'true');
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl mb-6 shadow-2xl shadow-emerald-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">{t.title}</h1>
          <p className="text-slate-500 text-xs mt-2 font-mono uppercase tracking-widest">{t.restricted}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">{t.pass_label}</label>
              <input 
                type="password" 
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-950 border ${error ? 'border-rose-500' : 'border-slate-800'} focus:border-emerald-500 rounded-xl px-4 py-4 text-white text-center text-lg tracking-[0.5em] focus:outline-none transition-all`}
                placeholder="••••••"
              />
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest">
              {t.login_btn}
            </button>
          </div>
        </form>
        
        <div className="mt-8 flex justify-center space-x-4">
           <button onClick={() => setLang('fr')} className={`text-[10px] font-bold uppercase tracking-widest ${lang === 'fr' ? 'text-emerald-500' : 'text-slate-600'}`}>Français</button>
           <span className="text-slate-800">|</span>
           <button onClick={() => setLang('ar')} className={`text-[10px] font-bold uppercase tracking-widest ${lang === 'ar' ? 'text-emerald-500' : 'text-slate-600'}`}>العربية</button>
        </div>
      </div>
    </div>
  );
};


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
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-[2rem] mb-8 neon-glow animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-3">PRONOS<span className="text-cyan-500">AI</span></h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">{t.restricted}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-10 rounded-[2.5rem] border border-slate-800/60 shadow-2xl">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase mb-4 tracking-[0.2em] text-center">{t.pass_label}</label>
              <input 
                type="password" 
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-950/50 border-2 ${error ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-slate-800/50'} focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 rounded-2xl px-6 py-5 text-white text-center text-2xl tracking-[0.6em] focus:outline-none transition-all duration-300 placeholder:text-slate-900`}
                placeholder="••••"
              />
              {error && <p className="text-rose-500 text-[9px] font-black uppercase text-center mt-4 tracking-widest animate-bounce">Access Denied</p>}
            </div>

            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#02040a] font-black py-5 rounded-2xl transition-all active:scale-95 uppercase text-[11px] tracking-[0.2em] neon-glow">
              {t.login_btn}
            </button>
          </div>
        </form>
        
        <div className="mt-12 flex justify-center items-center gap-6">
           <button onClick={() => setLang('fr')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${lang === 'fr' ? 'text-cyan-500' : 'text-slate-700 hover:text-slate-500'}`}>FRANÇAIS</button>
           <div className="w-px h-4 bg-slate-800"></div>
           <button onClick={() => setLang('ar')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${lang === 'ar' ? 'text-cyan-500' : 'text-slate-700 hover:text-slate-500'}`}>العربية</button>
        </div>
      </div>
    </div>
  );
};

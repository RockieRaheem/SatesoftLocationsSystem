import React, { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User as FirebaseUser } from 'firebase/auth';
import type { ActiveView, Country, RegionalEconomicLevel, Theme, User } from '../types.ts';
import { allAfricanCountries, mockRegionalEconomicLevels } from '../data.ts';
import { auth } from '../firebase.ts';
import { deleteRegionalLevel, saveRegionalLevel, saveUserProfile, subscribeToRegionalLevels } from '../firebaseService.ts';
import { countryService } from '../src/services/countryService.ts';
import FirebaseErrorBoundary from './FirebaseErrorBoundary.tsx';
import Icon from './Icon.tsx';
import MainContent from './MainContent.tsx';
import Sidebar from './Sidebar.tsx';

const previewUser: User = { id: 'preview', name: 'Registry Administrator', email: 'preview@locationregister.org', role: 'Administrator', bio: 'Preview workspace', avatar: null };
const registryViews: ActiveView[] = ['dashboard', 'countries', 'country-admin-levels', 'country-electoral-levels', 'regional-economic-levels', 'country-profile', 'profile'];

const AdminDashboard: React.FC = () => {
  const showPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('registry-theme') === 'light' ? 'light' : 'dark');
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const requested = window.location.hash.slice(1) as ActiveView;
    return registryViews.includes(requested) ? requested : 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [preview, setPreview] = useState(() => showPreview && new URLSearchParams(window.location.search).get('preview') === '1');
  const [user, setUser] = useState<User>(previewUser);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regionalLevels, setRegionalLevels] = useState<RegionalEconomicLevel[]>(mockRegionalEconomicLevels);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setAuthReady(true), 4000);
    const unsubscribe = onAuthStateChanged(auth, current => {
      window.clearTimeout(timeout);
      setFirebaseUser(current);
      setAuthReady(true);
      if (current) {
        const profile: User = { id: current.uid, name: current.displayName || 'Registry user', email: current.email || '', role: 'Administrator', bio: 'Location registry administrator', avatar: current.photoURL };
        setUser(profile);
        saveUserProfile({ ...profile, uid: current.uid }).catch(() => undefined);
      }
    });
    return () => { window.clearTimeout(timeout); unsubscribe(); };
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('registry-theme', theme);
  }, [theme]);

  useEffect(() => { countryService.getAllCountries().then(setCountries).catch(() => setCountries(allAfricanCountries)); }, []);
  useEffect(() => {
    const syncHash = () => {
      const requested = window.location.hash.slice(1) as ActiveView;
      if (registryViews.includes(requested)) setActiveView(requested);
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);
  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeToRegionalLevels(data => data.length && setRegionalLevels(data));
  }, [firebaseUser]);

  const login = async () => {
    setLoggingIn(true); setLoginError('');
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (error) { setLoginError(error instanceof Error ? error.message : 'Unable to sign in.'); }
    finally { setLoggingIn(false); }
  };
  const logout = async () => { if (firebaseUser) await signOut(auth); setPreview(false); };
  const addCountry = async (country: Omit<Country, 'id'>) => { const saved = await countryService.createCountry(country); setCountries(current => [saved, ...current]); };
  const updateCountry = async (country: Country) => { const saved = await countryService.updateCountry(country.id, country); setCountries(current => current.map(item => item.id === saved.id ? saved : item)); };
  const removeCountry = async (id: number) => { await countryService.deleteCountry(id); setCountries(current => current.filter(item => item.id !== id)); };
  const saveRegion = async (level: RegionalEconomicLevel) => { if (firebaseUser) await saveRegionalLevel(level); setRegionalLevels(current => [...current.filter(item => item.id !== level.id), level].sort((a, b) => a.name.localeCompare(b.name))); };
  const removeRegion = async (id: number, remarks?: string) => { if (firebaseUser) await deleteRegionalLevel(id, remarks); setRegionalLevels(current => current.filter(item => item.id !== id)); };
  const navigate = (view: ActiveView) => {
    setActiveView(view);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${view}`);
  };

  if (!authReady && !preview) return <div className={`grid h-screen place-items-center ${theme === 'dark' ? 'bg-[#080d16]' : 'bg-slate-50'}`}><div className="flex flex-col items-center gap-4"><div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" /><p className="text-xs font-semibold text-slate-500">Preparing registry workspace</p></div></div>;

  if (!firebaseUser && !preview) return <div className={`relative grid min-h-screen place-items-center overflow-hidden px-5 ${theme === 'dark' ? 'bg-[#080d16] text-white' : 'bg-[#f5f7f8] text-slate-950'}`}><div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,#10b981_0,transparent_25%),radial-gradient(circle_at_80%_80%,#0f766e_0,transparent_24%)]" /><section className={`relative w-full max-w-md rounded-[28px] border p-7 shadow-2xl md:p-9 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90 shadow-black/30' : 'border-white bg-white/90 shadow-slate-300/40'}`}><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-500/20">LR</div><p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Secure workspace</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Location Register</h1><p className={`mt-3 text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Govern national location hierarchies from one controlled, auditable workspace.</p><button onClick={login} disabled={loggingIn} className={`mt-8 flex w-full items-center justify-center gap-3 rounded-xl border py-3 text-sm font-bold transition ${theme === 'dark' ? 'border-slate-700 bg-white text-slate-950 hover:bg-slate-100' : 'border-slate-200 bg-slate-950 text-white hover:bg-slate-800'}`}>{loggingIn ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Icon name="lock" className="h-5 w-5" />} {loggingIn ? 'Signing in…' : 'Continue with Google'}</button>{showPreview && <button onClick={() => setPreview(true)} className={`mt-3 w-full rounded-xl py-3 text-sm font-semibold ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Open preview workspace</button>}{loginError && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 text-xs text-red-800">{loginError}</p>}<p className={`mt-7 text-[10px] leading-5 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Authorized personnel only. Access and data changes should be monitored under your organization’s security policy.</p></section></div>;

  return <FirebaseErrorBoundary theme={theme}><div className="flex h-screen overflow-hidden"><Sidebar theme={theme} activeView={activeView} isOpen={sidebarOpen} user={user} onNavigate={navigate} onClose={() => setSidebarOpen(false)} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} onLogout={logout} /><MainContent theme={theme} activeView={activeView} user={user} countries={countries} regionalLevels={regionalLevels} onToggleSidebar={() => setSidebarOpen(true)} onNavigate={navigate} onAddCountry={addCountry} onUpdateCountry={updateCountry} onDeleteCountry={removeCountry} onSaveRegionalLevel={saveRegion} onDeleteRegionalLevel={removeRegion} /></div></FirebaseErrorBoundary>;
};

export default AdminDashboard;

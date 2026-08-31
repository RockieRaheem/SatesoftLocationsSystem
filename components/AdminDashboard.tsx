import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ActiveView, Country, RegionalEconomicLevel, Theme, User } from '../types.ts';
import { apiFetch } from '../src/services/api.ts';
import { countryService } from '../src/services/countryService.ts';
import { regionalLevelService } from '../src/services/regionalLevelService.ts';
import { isSupabaseConfigured, supabase } from '../src/supabase/browser.ts';
import FirebaseErrorBoundary from './FirebaseErrorBoundary.tsx';
import Icon from './Icon.tsx';
import MainContent from './MainContent.tsx';
import Sidebar from './Sidebar.tsx';

const registryViews: ActiveView[] = ['dashboard', 'countries', 'country-admin-levels', 'country-electoral-levels', 'regional-economic-levels', 'country-profile', 'profile'];
const emptyUser: User = { id: '', name: 'Registry user', email: '', role: 'Viewer', bio: 'Location registry team member', avatar: null };
const messageFrom = (error: unknown) => error instanceof Error ? error.message : 'The operation could not be completed.';

const AdminDashboard: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('registry-theme') === 'light' ? 'light' : 'dark');
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const requested = window.location.hash.slice(1) as ActiveView;
    return registryViews.includes(requested) ? requested : 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User>(emptyUser);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regionalLevels, setRegionalLevels] = useState<RegionalEconomicLevel[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setFeedback(error.message);
      setSession(data.session);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('registry-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!session) { setCountries([]); setRegionalLevels([]); setUser(emptyUser); return; }
    const authUser = session.user;
    setUser({
      id: authUser.id,
      name: authUser.user_metadata.full_name || authUser.user_metadata.name || 'Registry user',
      email: authUser.email || '', role: 'Viewer', bio: 'Location registry team member',
      avatar: authUser.user_metadata.avatar_url || authUser.user_metadata.picture || null,
    });
    Promise.all([
      countryService.getAllCountries(),
      regionalLevelService.getAll(),
      apiFetch('/api/profile').then(response => response.json()),
    ]).then(([countryData, regionData, profile]) => {
      setCountries(countryData);
      setRegionalLevels(regionData);
      setUser(current => ({
        ...current, name: profile.display_name || current.name, email: profile.email || current.email,
        avatar: profile.avatar_url || current.avatar,
        role: profile.role === 'admin' ? 'Administrator' : profile.role === 'editor' ? 'Editor' : 'Viewer',
      }));
    }).catch(error => setFeedback(messageFrom(error)));
  }, [session]);

  useEffect(() => {
    const syncHash = () => {
      const requested = window.location.hash.slice(1) as ActiveView;
      if (registryViews.includes(requested)) setActiveView(requested);
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const login = async () => {
    if (!supabase) return;
    setLoggingIn(true); setFeedback('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
    });
    if (error) { setFeedback(error.message); setLoggingIn(false); }
  };
  const logout = async () => { if (supabase) await supabase.auth.signOut(); };
  const addCountry = async (country: Omit<Country, 'id'>) => {
    try { const saved = await countryService.createCountry(country); setCountries(current => [saved, ...current]); }
    catch (error) { setFeedback(messageFrom(error)); throw error; }
  };
  const updateCountry = async (country: Country) => {
    try { const saved = await countryService.updateCountry(country.id, country); setCountries(current => current.map(item => item.id === saved.id ? saved : item)); }
    catch (error) { setFeedback(messageFrom(error)); throw error; }
  };
  const removeCountry = async (id: number) => {
    try { await countryService.deleteCountry(id); setCountries(current => current.filter(item => item.id !== id)); }
    catch (error) { setFeedback(messageFrom(error)); throw error; }
  };
  const saveRegion = async (level: RegionalEconomicLevel) => {
    try { const saved = await regionalLevelService.save(level); setRegionalLevels(current => [...current.filter(item => item.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name))); }
    catch (error) { setFeedback(messageFrom(error)); throw error; }
  };
  const removeRegion = async (id: number) => {
    try { await regionalLevelService.remove(id); setRegionalLevels(current => current.filter(item => item.id !== id)); }
    catch (error) { setFeedback(messageFrom(error)); throw error; }
  };
  const navigate = (view: ActiveView) => {
    setActiveView(view);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${view}`);
  };

  if (!authReady) return <div className={`grid h-screen place-items-center ${theme === 'dark' ? 'bg-[#080d16]' : 'bg-slate-50'}`}><div className="flex flex-col items-center gap-4"><div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" /><p className="text-xs font-semibold text-slate-500">Preparing registry workspace</p></div></div>;

  if (!session) return <div className={`relative grid min-h-screen place-items-center overflow-hidden px-5 ${theme === 'dark' ? 'bg-[#080d16] text-white' : 'bg-[#f5f7f8] text-slate-950'}`}><div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,#10b981_0,transparent_25%),radial-gradient(circle_at_80%_80%,#0f766e_0,transparent_24%)]" /><section className={`relative w-full max-w-md rounded-[28px] border p-7 shadow-2xl md:p-9 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90 shadow-black/30' : 'border-white bg-white/90 shadow-slate-300/40'}`}><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-500/20">LR</div><p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Secure workspace</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Location Register</h1><p className={`mt-3 text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Govern national location hierarchies from one controlled, auditable workspace.</p><button onClick={login} disabled={loggingIn || !isSupabaseConfigured} className={`mt-8 flex w-full items-center justify-center gap-3 rounded-xl border py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${theme === 'dark' ? 'border-slate-700 bg-white text-slate-950 hover:bg-slate-100' : 'border-slate-200 bg-slate-950 text-white hover:bg-slate-800'}`}>{loggingIn ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Icon name="lock" className="h-5 w-5" />} {loggingIn ? 'Redirecting…' : 'Continue with Google'}</button>{!isSupabaseConfigured && <p role="alert" className="mt-4 rounded-xl bg-amber-100 p-3 text-xs leading-5 text-amber-900">Supabase is not configured. Copy .env.example to .env and add this project’s public connection values.</p>}{feedback && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 text-xs text-red-800">{feedback}</p>}<p className={`mt-7 text-[10px] leading-5 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Authorized personnel only. Access and data changes are protected by database row-level security.</p></section></div>;

  return <FirebaseErrorBoundary theme={theme}><div className="flex h-screen overflow-hidden">{feedback && <div role="alert" className="fixed right-5 top-5 z-[100] flex max-w-md items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-900 shadow-xl"><span className="flex-1">{feedback}</span><button onClick={() => setFeedback('')} aria-label="Dismiss message">×</button></div>}<Sidebar theme={theme} activeView={activeView} isOpen={sidebarOpen} user={user} onNavigate={navigate} onClose={() => setSidebarOpen(false)} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} onLogout={logout} /><MainContent theme={theme} activeView={activeView} user={user} countries={countries} regionalLevels={regionalLevels} onToggleSidebar={() => setSidebarOpen(true)} onNavigate={navigate} onAddCountry={addCountry} onUpdateCountry={updateCountry} onDeleteCountry={removeCountry} onSaveRegionalLevel={saveRegion} onDeleteRegionalLevel={removeRegion} /></div></FirebaseErrorBoundary>;
};

export default AdminDashboard;

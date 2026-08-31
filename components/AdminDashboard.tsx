import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ActiveView, Country, RegionalEconomicLevel, Theme, User } from '../types.ts';
import { apiFetch } from '../src/services/api.ts';
import { countryService } from '../src/services/countryService.ts';
import { regionalLevelService } from '../src/services/regionalLevelService.ts';
import { isSupabaseConfigured, supabase } from '../src/supabase/browser.ts';
import AppErrorBoundary from './AppErrorBoundary.tsx';
import Icon from './Icon.tsx';
import MainContent from './MainContent.tsx';
import Sidebar from './Sidebar.tsx';

const registryViews: ActiveView[] = ['dashboard', 'countries', 'country-admin-levels', 'country-electoral-levels', 'regional-economic-levels', 'country-profile', 'profile'];
const emptyUser: User = { id: '', name: 'Registry user', email: '', role: 'Viewer', bio: 'Location registry team member', avatar: null };
const messageFrom = (error: unknown) => error instanceof Error ? error.message : 'The operation could not be completed.';

const AdminDashboard: React.FC = () => {
  const theme: Theme = 'light';
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
    document.documentElement.className = '';
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

  if (!authReady) return <div className="grid h-screen place-items-center bg-[#f7f7f3]"><div className="flex flex-col items-center gap-4"><div className="h-9 w-9 animate-spin rounded-full border-2 border-[#dedcd4] border-t-[#1f1f1f]" /><p className="text-xs font-medium text-[#77766f]">Preparing registry workspace</p></div></div>;

  if (!session) return <div className="relative grid min-h-screen overflow-hidden bg-[#f7f7f3] text-[#1f1f1f] lg:grid-cols-[1fr_520px]">
    <section className="relative hidden overflow-hidden bg-[#f9c80e] p-14 lg:flex lg:flex-col lg:justify-between"><div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-[#1f1f1f] text-[13px] font-bold text-white">LR<span className="absolute bottom-0 h-1 w-full bg-white" /></div><div className="relative max-w-xl"><p className="label-caps text-[#5c4900]">National location infrastructure</p><h1 className="mt-5 text-[58px] font-semibold leading-[0.98] tracking-[-0.055em]">Every place<br />has a place.</h1><p className="mt-6 max-w-md text-[15px] leading-7 text-black/65">One controlled workspace for Uganda’s administrative and electoral location hierarchy.</p></div><p className="relative text-[11px] font-medium text-black/55">Location Register · Uganda</p><div className="absolute -bottom-36 -right-28 h-[420px] w-[420px] rounded-full border-[70px] border-black/10" /><div className="absolute right-20 top-24 h-24 w-24 rounded-full bg-white/30" /></section>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-sm"><div className="mb-12 flex items-center gap-3 lg:hidden"><div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-[#1f1f1f] text-xs font-bold text-white">LR<span className="absolute bottom-0 h-1 w-full bg-[#f9c80e]" /></div><span className="text-sm font-semibold">Location Register</span></div><p className="label-caps text-[#8b6b00]">Secure workspace</p><h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em]">Welcome back</h2><p className="mt-3 text-sm leading-6 text-[#77766f]">Sign in with your authorized Google account to continue to the registry.</p><button onClick={login} disabled={loggingIn || !isSupabaseConfigured} className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#1f1f1f] py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">{loggingIn ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Icon name="lock" className="h-[18px] w-[18px]" />} {loggingIn ? 'Redirecting…' : 'Continue with Google'}</button>{!isSupabaseConfigured && <p role="alert" className="mt-4 rounded-xl bg-[#fff4c7] p-3 text-xs leading-5 text-[#6e5700]">Supabase is not configured. Copy .env.example to .env and add this project’s public connection values.</p>}{feedback && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-800">{feedback}</p>}<div className="mt-8 flex items-start gap-2 border-t border-[#e6e4dd] pt-5 text-[10px] leading-5 text-[#96948c]"><Icon name="shield-check" className="mt-0.5 h-4 w-4 shrink-0" /><p>Access and data changes are protected by Supabase authentication and row-level security.</p></div></div></section>
  </div>;

  return <AppErrorBoundary theme={theme}><div className="flex h-screen overflow-hidden">{feedback && <div role="alert" className="fixed right-5 top-5 z-[100] flex max-w-md items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-900 shadow-panel"><span className="flex-1">{feedback}</span><button onClick={() => setFeedback('')} aria-label="Dismiss message">×</button></div>}<Sidebar activeView={activeView} isOpen={sidebarOpen} user={user} onNavigate={navigate} onClose={() => setSidebarOpen(false)} onLogout={logout} /><MainContent theme={theme} activeView={activeView} user={user} countries={countries} regionalLevels={regionalLevels} onToggleSidebar={() => setSidebarOpen(true)} onNavigate={navigate} onAddCountry={addCountry} onUpdateCountry={updateCountry} onDeleteCountry={removeCountry} onSaveRegionalLevel={saveRegion} onDeleteRegionalLevel={removeRegion} /></div></AppErrorBoundary>;
};

export default AdminDashboard;

import React, { Suspense, lazy, useState } from 'react';
import type { ActiveView, Country, RegionalEconomicLevel, Theme, User } from '../types.ts';
import Icon from './Icon.tsx';
import RegistryOverview from './RegistryOverview.tsx';

const CountriesPage = lazy(() => import('./CountriesPage.tsx'));
const CountryAdminLevelsPage = lazy(() => import('./CountryAdminLevelsPage.tsx'));
const CountryElectoralLevelsPage = lazy(() => import('./CountryElectoralLevelsPage.tsx'));
const RegionalEconomicLevelsPage = lazy(() => import('./RegionalEconomicLevelsPage.tsx'));
const CountryProfilePage = lazy(() => import('./CountryProfilePage.tsx'));

interface MainContentProps {
  theme: Theme; activeView: ActiveView; user: User; countries: Country[]; regionalLevels: RegionalEconomicLevel[];
  onToggleSidebar: () => void; onNavigate: (view: ActiveView) => void;
  onAddCountry: (country: Omit<Country, 'id'>) => Promise<void>; onUpdateCountry: (country: Country) => Promise<void>;
  onDeleteCountry: (id: number) => Promise<void>; onSaveRegionalLevel: (level: RegionalEconomicLevel) => Promise<void>;
  onDeleteRegionalLevel: (id: number, remarks?: string) => Promise<void>;
}

const titles: Partial<Record<ActiveView, string>> = {
  dashboard: 'Dashboard', countries: 'Countries', 'country-admin-levels': 'Country Admin Levels',
  'country-electoral-levels': 'Country Electoral Levels', 'regional-economic-levels': 'Regional Economic Levels',
  'country-profile': 'Country Profile', profile: 'My Profile',
};

const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();

const MainContent: React.FC<MainContentProps> = props => {
  const { theme, activeView, user, countries, regionalLevels, onToggleSidebar, onNavigate, onAddCountry, onUpdateCountry, onDeleteCountry, onSaveRegionalLevel, onDeleteRegionalLevel } = props;
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const dark = theme === 'dark';
  const render = () => {
    switch (activeView) {
      case 'countries': return <CountriesPage theme={theme} countries={countries} onAddCountry={onAddCountry} onUpdateCountry={onUpdateCountry} onDeleteCountry={onDeleteCountry} onViewProfile={country => { setSelectedCountry(country); onNavigate('country-profile'); }} />;
      case 'country-admin-levels': return <CountryAdminLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'country-electoral-levels': return <CountryElectoralLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'regional-economic-levels': return <RegionalEconomicLevelsPage theme={theme} regionalLevels={regionalLevels} countries={countries} onSave={onSaveRegionalLevel} onDelete={onDeleteRegionalLevel} />;
      case 'country-profile': return <CountryProfilePage theme={theme} country={selectedCountry} onNavigate={onNavigate} />;
      case 'profile': return <section className={`max-w-3xl rounded-lg border p-6 shadow-sm ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}><div className="flex items-center gap-4">{user.avatar ? <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-yellow-500 text-xl font-black text-slate-900">{initials(user.name)}</div>}<div><h2 className="text-xl font-bold">{user.name}</h2><p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p></div></div><dl className={`mt-8 grid gap-4 rounded-lg border p-5 sm:grid-cols-2 ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Role</dt><dd className="mt-1 text-sm font-semibold">{user.role}</dd></div><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Access</dt><dd className="mt-1 text-sm font-semibold text-emerald-500">Authenticated</dd></div></dl></section>;
      case 'dashboard': default: return <RegistryOverview theme={theme} countries={countries} onNavigate={onNavigate} />;
    }
  };

  return <main className={`flex min-w-0 flex-1 flex-col overflow-hidden ${dark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
    <header className="flex h-20 shrink-0 items-center justify-between px-4 md:px-6"><div className="flex min-w-0 items-center"><button onClick={onToggleSidebar} aria-label="Toggle navigation" className={`mr-4 rounded-md p-2 transition active:scale-95 ${dark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}><Icon name="hamburger" className="h-6 w-6" /></button><h1 className={`truncate text-xl font-semibold md:text-2xl ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{titles[activeView] || 'Dashboard'}</h1></div><div className={`hidden items-center gap-2 rounded-md px-3 py-2 text-xs font-medium sm:flex ${dark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}`}><span className="h-2 w-2 rounded-full bg-emerald-500" /> Uganda data connected</div></header>
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 md:px-6 lg:px-4"><Suspense fallback={<div className="grid min-h-[320px] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-yellow-500" /></div>}>{render()}</Suspense></div>
  </main>;
};

export default MainContent;

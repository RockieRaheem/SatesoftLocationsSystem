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
  theme: Theme;
  activeView: ActiveView;
  user: User;
  countries: Country[];
  regionalLevels: RegionalEconomicLevel[];
  onToggleSidebar: () => void;
  onNavigate: (view: ActiveView) => void;
  onAddCountry: (country: Omit<Country, 'id'>) => Promise<void>;
  onUpdateCountry: (country: Country) => Promise<void>;
  onDeleteCountry: (id: number) => Promise<void>;
  onSaveRegionalLevel: (level: RegionalEconomicLevel) => Promise<void>;
  onDeleteRegionalLevel: (id: number, remarks?: string) => Promise<void>;
}

const pageMeta: Partial<Record<ActiveView, { eyebrow: string; title: string; description: string }>> = {
  dashboard: { eyebrow: 'Workspace', title: 'Registry overview', description: 'Monitor coverage, structure, and data readiness.' },
  countries: { eyebrow: 'Location registry', title: 'Country master records', description: 'Maintain standardized country metadata and configuration.' },
  'country-admin-levels': { eyebrow: 'Location registry', title: 'Administrative hierarchies', description: 'Define how territorial levels are named and nested.' },
  'country-electoral-levels': { eyebrow: 'Location registry', title: 'Electoral locations', description: 'Explore normalized Electoral Commission location data.' },
  'regional-economic-levels': { eyebrow: 'Location registry', title: 'Regional groupings', description: 'Manage economic communities and country membership.' },
  'country-profile': { eyebrow: 'Country master', title: 'Country profile', description: 'Review configuration and connected hierarchy data.' },
  profile: { eyebrow: 'System', title: 'Account', description: 'Review your authenticated workspace identity.' },
};

const MainContent: React.FC<MainContentProps> = props => {
  const { theme, activeView, user, countries, regionalLevels, onToggleSidebar, onNavigate, onAddCountry, onUpdateCountry, onDeleteCountry, onSaveRegionalLevel, onDeleteRegionalLevel } = props;
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const dark = theme === 'dark';
  const meta = pageMeta[activeView] ?? pageMeta.dashboard!;

  const render = () => {
    switch (activeView) {
      case 'countries': return <CountriesPage theme={theme} countries={countries} onAddCountry={onAddCountry} onUpdateCountry={onUpdateCountry} onDeleteCountry={onDeleteCountry} onViewProfile={country => { setSelectedCountry(country); onNavigate('country-profile'); }} />;
      case 'country-admin-levels': return <CountryAdminLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'country-electoral-levels': return <CountryElectoralLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'regional-economic-levels': return <RegionalEconomicLevelsPage theme={theme} regionalLevels={regionalLevels} countries={countries} onSave={onSaveRegionalLevel} onDelete={onDeleteRegionalLevel} />;
      case 'country-profile': return <CountryProfilePage theme={theme} country={selectedCountry} onNavigate={onNavigate} />;
      case 'profile': return <section className={`max-w-3xl rounded-3xl border p-6 md:p-8 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-xl font-black text-white">{user.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><h2 className="text-xl font-bold">{user.name}</h2><p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p></div></div><dl className={`mt-8 grid gap-4 rounded-2xl border p-5 sm:grid-cols-2 ${dark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}><div><dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</dt><dd className="mt-1 text-sm font-semibold">{user.role}</dd></div><div><dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Access</dt><dd className="mt-1 text-sm font-semibold text-emerald-500">Authenticated</dd></div></dl></section>;
      case 'dashboard': default: return <RegistryOverview theme={theme} countries={countries} onNavigate={onNavigate} />;
    }
  };

  return <main className={`min-w-0 flex-1 overflow-y-auto ${dark ? 'bg-[#080d16] text-slate-100' : 'bg-[#f5f7f8] text-slate-900'}`}>
    <header className={`sticky top-0 z-20 border-b backdrop-blur-xl ${dark ? 'border-slate-800/80 bg-[#080d16]/85' : 'border-slate-200/80 bg-[#f5f7f8]/85'}`}><div className="mx-auto flex h-20 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8"><button onClick={onToggleSidebar} aria-label="Open navigation" className={`rounded-xl border p-2.5 lg:hidden ${dark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}><Icon name="hamburger" className="h-5 w-5" /></button><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">{meta.eyebrow}</p><h1 className="truncate text-lg font-bold tracking-tight md:text-xl">{meta.title}</h1></div><div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold sm:flex ${dark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-white text-slate-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Uganda dataset connected</div></div></header>
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"><div className="mb-6"><p className={`max-w-2xl text-sm ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{meta.description}</p></div><Suspense fallback={<div className="grid min-h-[320px] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" /></div>}>{render()}</Suspense></div>
  </main>;
};

export default MainContent;

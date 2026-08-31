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

const pageMeta: Partial<Record<ActiveView, { eyebrow: string; title: string; description: string }>> = {
  dashboard: { eyebrow: 'Workspace', title: 'Registry overview', description: 'A clear view of Uganda’s national location registry.' },
  countries: { eyebrow: 'Registry', title: 'Countries', description: 'Maintain standardized country records and configuration.' },
  'country-admin-levels': { eyebrow: 'Registry', title: 'Administrative levels', description: 'Define how territorial levels are named and nested.' },
  'country-electoral-levels': { eyebrow: 'Uganda registry', title: 'Electoral locations', description: 'Explore normalized Electoral Commission location data.' },
  'regional-economic-levels': { eyebrow: 'Registry', title: 'Regional groupings', description: 'Manage economic communities and country membership.' },
  'country-profile': { eyebrow: 'Country record', title: 'Country profile', description: 'Review configuration and connected hierarchy data.' },
  profile: { eyebrow: 'Workspace', title: 'Your account', description: 'Identity and access for this registry workspace.' },
};

const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();

const MainContent: React.FC<MainContentProps> = props => {
  const { theme, activeView, user, countries, regionalLevels, onToggleSidebar, onNavigate, onAddCountry, onUpdateCountry, onDeleteCountry, onSaveRegionalLevel, onDeleteRegionalLevel } = props;
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const meta = pageMeta[activeView] ?? pageMeta.dashboard!;

  const render = () => {
    switch (activeView) {
      case 'countries': return <CountriesPage theme={theme} countries={countries} onAddCountry={onAddCountry} onUpdateCountry={onUpdateCountry} onDeleteCountry={onDeleteCountry} onViewProfile={country => { setSelectedCountry(country); onNavigate('country-profile'); }} />;
      case 'country-admin-levels': return <CountryAdminLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'country-electoral-levels': return <CountryElectoralLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'regional-economic-levels': return <RegionalEconomicLevelsPage theme={theme} regionalLevels={regionalLevels} countries={countries} onSave={onSaveRegionalLevel} onDelete={onDeleteRegionalLevel} />;
      case 'country-profile': return <CountryProfilePage theme={theme} country={selectedCountry} onNavigate={onNavigate} />;
      case 'profile': return <section className="surface-card max-w-3xl p-6 md:p-8"><div className="flex items-center gap-4">{user.avatar ? <img src={user.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" referrerPolicy="no-referrer" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#1f1f1f] text-lg font-semibold text-white">{initials(user.name)}</div>}<div><h2 className="text-xl font-semibold tracking-[-0.02em]">{user.name}</h2><p className="mt-1 text-sm text-[#77766f]">{user.email}</p></div></div><dl className="mt-8 grid gap-4 rounded-2xl border border-[#ebe9e2] bg-[#fafaf7] p-5 sm:grid-cols-2"><div><dt className="label-caps">Role</dt><dd className="mt-1.5 text-sm font-medium">{user.role}</dd></div><div><dt className="label-caps">Access</dt><dd className="mt-1.5 flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-[#2e7d32]" /> Authenticated</dd></div></dl></section>;
      case 'dashboard': default: return <RegistryOverview theme={theme} countries={countries} onNavigate={onNavigate} />;
    }
  };

  return <main className="min-w-0 flex-1 overflow-y-auto bg-[#f7f7f3] text-[#1f1f1f]">
    <header className="sticky top-0 z-20 border-b border-[#e6e4dd]/90 bg-[#f7f7f3]/90 backdrop-blur-xl"><div className="mx-auto flex h-[88px] max-w-[1500px] items-center gap-4 px-4 sm:px-7 lg:px-10"><button onClick={onToggleSidebar} aria-label="Open navigation" className="rounded-full border border-[#dedcd4] bg-white p-2.5 text-[#5f5f5a] lg:hidden"><Icon name="hamburger" className="h-5 w-5" /></button><div className="min-w-0 flex-1"><p className="label-caps text-[#8b6b00]">{meta.eyebrow}</p><h1 className="mt-1 truncate text-[22px] font-semibold tracking-[-0.035em] md:text-2xl">{meta.title}</h1></div><div className="hidden items-center gap-2 rounded-full border border-[#dedcd4] bg-white px-3.5 py-2 text-[11px] font-medium text-[#62615c] sm:flex"><span className="h-2 w-2 rounded-full bg-[#2e7d32]" /> Uganda data connected</div></div></header>
    <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-10 lg:py-9"><p className="mb-7 max-w-2xl text-sm leading-6 text-[#77766f]">{meta.description}</p><div className="registry-page"><Suspense fallback={<div className="grid min-h-[320px] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dedcd4] border-t-[#1f1f1f]" /></div>}>{render()}</Suspense></div></div>
  </main>;
};

export default MainContent;

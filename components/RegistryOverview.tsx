import React, { useEffect, useState } from 'react';
import type { ActiveView, Country, Theme } from '../types.ts';
import type { UgandaElectoralSummary } from '../electoral/types.ts';
import { apiFetch } from '../src/services/api.ts';
import Icon, { type IconName } from './Icon.tsx';

const RegistryOverview: React.FC<{ theme: Theme; countries: Country[]; onNavigate: (view: ActiveView) => void }> = ({ theme, countries, onNavigate }) => {
  const [summary, setSummary] = useState<UgandaElectoralSummary | null>(null);
  const dark = theme === 'dark';
  useEffect(() => { apiFetch('/api/electoral/uganda/summary').then(r => r.json()).then(setSummary).catch(() => undefined); }, []);
  const totalAdminLevels = countries.reduce((sum, country) => sum + (country.numberOfAdminLevels ?? 0), 0);
  const metrics: Array<[string, string, string, IconName]> = [
    ['Countries', countries.length.toLocaleString(), 'Master records', 'globe'],
    ['Admin schemas', totalAdminLevels.toLocaleString(), 'Hierarchy levels', 'map'],
    ['Uganda locations', (summary?.normalizedTotals.villagesAndCells ?? 0).toLocaleString(), 'Villages and cells', 'shield-check'],
    ['Review queue', (summary?.normalizedTotals.recordsNeedingVerification ?? 0).toLocaleString(), 'Records to verify', 'exclamation-triangle'],
  ];
  const panel = dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';

  return <div className="space-y-6">
    <section className={`overflow-hidden rounded-lg border shadow-sm ${panel}`}><div className="grid lg:grid-cols-[1.35fr_.65fr]"><div className="p-6 md:p-8"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Registry operational</span></div><h2 className={`mt-4 text-3xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Integrated Location Register<br />& Map System</h2><p className={`mt-3 max-w-2xl text-sm leading-6 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Manage country structures and trace Uganda’s Electoral Commission hierarchy from district to village.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => onNavigate('country-electoral-levels')} className="flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-md transition hover:bg-yellow-400">Open Uganda registry <Icon name="chevron-right" className="h-4 w-4" /></button><button onClick={() => onNavigate('countries')} className={`rounded-md border px-4 py-2.5 text-sm font-semibold ${dark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>Manage countries</button></div></div><div className="relative hidden min-h-64 overflow-hidden bg-yellow-500 lg:block"><div className="absolute -bottom-20 -right-12 h-72 w-72 rounded-full border-[48px] border-slate-900/15" /><div className="absolute left-12 top-12 h-16 w-16 rounded-full bg-white/25" /><div className="absolute bottom-16 left-14 h-3 w-24 rounded-full bg-slate-900" /></div></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, hint, icon]) => <article key={label} className={`rounded-lg border p-5 shadow-sm ${panel}`}><div className="flex items-start justify-between"><div><p className={`text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p><p className={`mt-2 text-3xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-md ${dark ? 'bg-slate-800 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}><Icon name={icon} className="h-5 w-5" /></span></div><p className={`mt-3 text-[11px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{hint}</p></article>)}</section>
    <div className="grid gap-6 lg:grid-cols-2"><section className={`rounded-lg border p-5 shadow-sm ${panel}`}><h3 className="font-bold">Registry workflow</h3><div className="mt-5 space-y-3">{[['01', 'Define country hierarchy'], ['02', 'Validate source records'], ['03', 'Publish stable locations']].map(([number, label]) => <div key={number} className={`flex items-center gap-4 rounded-md border p-3 ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}><span className="grid h-8 w-8 place-items-center rounded bg-yellow-500 text-xs font-black text-slate-900">{number}</span><span className="text-sm font-semibold">{label}</span></div>)}</div></section><section className={`rounded-lg border p-5 shadow-sm ${panel}`}><h3 className="font-bold">Data readiness</h3><div className="mt-5 space-y-4">{[['Server-side source', true], ['Stable location IDs', true], ['EC re-verification', false]].map(([label, ready]) => <div key={String(label)} className={`flex items-center justify-between border-b pb-4 text-sm last:border-0 ${dark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}><span>{label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ready ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{ready ? 'Ready' : 'Required'}</span></div>)}</div></section></div>
  </div>;
};

export default RegistryOverview;

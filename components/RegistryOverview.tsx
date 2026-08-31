import React, { useEffect, useState } from 'react';
import type { ActiveView, Country, Theme } from '../types.ts';
import type { UgandaElectoralSummary } from '../electoral/types.ts';
import { apiFetch } from '../src/services/api.ts';
import Icon, { type IconName } from './Icon.tsx';

const RegistryOverview: React.FC<{ theme: Theme; countries: Country[]; onNavigate: (view: ActiveView) => void }> = ({ countries, onNavigate }) => {
  const [summary, setSummary] = useState<UgandaElectoralSummary | null>(null);
  useEffect(() => { apiFetch('/api/electoral/uganda/summary').then(r => r.json()).then(setSummary).catch(() => undefined); }, []);
  const totalAdminLevels = countries.reduce((sum, country) => sum + (country.numberOfAdminLevels ?? 0), 0);
  const metrics: Array<[string, string, string, IconName]> = [
    ['Countries', countries.length.toLocaleString(), 'Master records', 'globe'],
    ['Admin levels', totalAdminLevels.toLocaleString(), 'Hierarchy definitions', 'map'],
    ['Villages & cells', (summary?.normalizedTotals.villagesAndCells ?? 0).toLocaleString(), 'Uganda records', 'shield-check'],
    ['Needs review', (summary?.normalizedTotals.recordsNeedingVerification ?? 0).toLocaleString(), 'Quality queue', 'exclamation-triangle'],
  ];

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[26px] border border-[#dfddd4] bg-white px-6 py-8 shadow-panel md:px-9 md:py-10">
      <div className="absolute inset-y-0 right-0 hidden w-[38%] overflow-hidden bg-[#f9c80e] lg:block"><div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full border-[42px] border-black/10" /><div className="absolute left-10 top-10 h-16 w-16 rounded-full bg-white/35" /><div className="absolute bottom-14 left-20 h-3 w-24 rounded-full bg-black/80" /></div>
      <div className="relative max-w-3xl lg:max-w-[58%]"><span className="inline-flex items-center gap-2 rounded-full bg-[#eef6ee] px-3 py-1.5 text-[11px] font-semibold text-[#2e6932]"><span className="h-1.5 w-1.5 rounded-full bg-[#2e7d32]" /> Registry operational</span><h2 className="mt-6 text-[34px] font-semibold leading-[1.05] tracking-[-0.045em] text-[#1f1f1f] md:text-[44px]">Every location,<br />clearly connected.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#66655f] md:text-[15px]">A trusted national structure for territorial definitions, electoral locations, and the data-quality decisions behind them.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => onNavigate('country-electoral-levels')} className="button-primary">Explore Uganda registry <Icon name="chevron-right" className="h-4 w-4" /></button><button onClick={() => onNavigate('countries')} className="button-secondary">View countries</button></div></div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, hint, icon], index) => <article key={label} className="surface-card p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-[#77766f]">{label}</p><p className="mt-2.5 text-[30px] font-semibold tracking-[-0.04em] text-[#1f1f1f]">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${index === 3 ? 'bg-[#fff1ee] text-[#9b2c20]' : 'bg-[#fff4c7] text-[#5c4900]'}`}><Icon name={icon} className="h-[19px] w-[19px]" /></span></div><p className="mt-3 text-[11px] text-[#aaa79e]">{hint}</p></article>)}</section>
    <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <section className="surface-card p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-base font-semibold tracking-[-0.02em]">Registry workflow</h3><p className="mt-1 text-xs text-[#88867f]">A deliberate path from source to service.</p></div><span className="rounded-full bg-[#f4f3ee] px-3 py-1 text-[10px] font-semibold text-[#77766f]">3 stages</span></div><div className="mt-6 grid gap-3 md:grid-cols-3">{[['01', 'Define', 'Set the national terms and hierarchy.'], ['02', 'Validate', 'Review lineage, gaps, and conflicts.'], ['03', 'Publish', 'Release stable records to services.']].map(([number, title, copy]) => <div key={number} className="rounded-2xl border border-[#ebe9e2] bg-[#fafaf7] p-4"><span className="text-[10px] font-bold tracking-[0.14em] text-[#967500]">{number}</span><h4 className="mt-4 text-sm font-semibold">{title}</h4><p className="mt-1.5 text-xs leading-5 text-[#77766f]">{copy}</p></div>)}</div></section>
      <section className="surface-card p-5 md:p-6"><h3 className="text-base font-semibold tracking-[-0.02em]">Data readiness</h3><p className="mt-1 text-xs text-[#88867f]">Current operational posture.</p><div className="mt-6 space-y-5">{[['Server-side source', true], ['Stable location IDs', true], ['EC re-verification', false]].map(([label, ready]) => <div key={String(label)} className="flex items-center justify-between border-b border-[#efede7] pb-4 text-xs last:border-0 last:pb-0"><span className="text-[#65645e]">{label}</span><span className={`rounded-full px-2.5 py-1 font-semibold ${ready ? 'bg-[#eef6ee] text-[#2e6932]' : 'bg-[#fff4c7] text-[#6e5700]'}`}>{ready ? 'Ready' : 'Pending'}</span></div>)}</div></section>
    </div>
  </div>;
};

export default RegistryOverview;

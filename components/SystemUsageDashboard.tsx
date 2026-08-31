import React from 'react';
import type { Theme } from '../types.ts';
import Icon, { type IconName } from './Icon.tsx';

const services: Array<{ name: string; detail: string; icon: IconName; status: string }> = [
  { name: 'Application server', detail: 'Express and Vite runtime', icon: 'cloud', status: 'Operational' },
  { name: 'Supabase Database', detail: 'PostgreSQL with row-level security', icon: 'cash', status: 'Connected' },
  { name: 'Supabase Authentication', detail: 'Google OAuth and JWT sessions', icon: 'shield-check', status: 'Protected' },
  { name: 'Supabase Storage', detail: 'Regional flag assets', icon: 'archive', status: 'Connected' },
];

const SystemUsageDashboard: React.FC<{ theme: Theme }> = ({ theme }) => {
  const dark = theme === 'dark';
  const panel = dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';
  return <div className="space-y-6">
    <section className={`rounded-lg border p-6 shadow-sm ${panel}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">System Usage</h2><p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Current infrastructure, security, and service availability.</p></div><span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800"><span className="h-2 w-2 rounded-full bg-emerald-500" /> All systems operational</span></div></section>
    <section className="grid gap-4 md:grid-cols-2">{services.map(service => <article key={service.name} className={`rounded-lg border p-5 shadow-sm ${panel}`}><div className="flex items-start gap-4"><span className={`grid h-11 w-11 place-items-center rounded-lg ${dark ? 'bg-slate-800 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}><Icon name={service.icon} className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{service.name}</h3><span className="text-xs font-semibold text-emerald-500">{service.status}</span></div><p className={`mt-1 text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{service.detail}</p></div></div></article>)}</section>
    <section className={`rounded-lg border p-6 shadow-sm ${panel}`}><h3 className="font-bold">Database security posture</h3><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Database', 'Supabase PostgreSQL'], ['Access control', 'Row-level security'], ['Browser credential', 'Publishable key'], ['Privileged key', 'Server only']].map(([label, value]) => <div key={label} className={`rounded-md border p-4 ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}><dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-2 text-sm font-bold">{value}</dd></div>)}</dl></section>
  </div>;
};

export default SystemUsageDashboard;

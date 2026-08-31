import React from 'react';
import type { ActiveView, Theme, User } from '../types.ts';
import Icon, { type IconName } from './Icon.tsx';

interface SidebarProps {
  theme: Theme;
  activeView: ActiveView;
  isOpen: boolean;
  user: User;
  onNavigate: (view: ActiveView) => void;
  onClose: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const groups: Array<{ label: string; items: Array<{ view: ActiveView; label: string; description: string; icon: IconName }> }> = [
  { label: 'Workspace', items: [{ view: 'dashboard', label: 'Overview', description: 'Coverage and activity', icon: 'dashboard' }] },
  { label: 'Location registry', items: [
    { view: 'countries', label: 'Countries', description: 'Country master records', icon: 'globe' },
    { view: 'country-admin-levels', label: 'Administrative levels', description: 'Territorial structures', icon: 'map' },
    { view: 'country-electoral-levels', label: 'Electoral locations', description: 'Uganda hierarchy browser', icon: 'shield-check' },
    { view: 'regional-economic-levels', label: 'Regional groupings', description: 'Economic communities', icon: 'countries' },
  ]},
  { label: 'System', items: [{ view: 'profile', label: 'Account', description: 'Identity and access', icon: 'user-circle' }] },
];

const Sidebar: React.FC<SidebarProps> = ({ theme, activeView, isOpen, user, onNavigate, onClose, onToggleTheme, onLogout }) => {
  const dark = theme === 'dark';
  return <>
    <button aria-label="Close navigation" onClick={onClose} className={`fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${dark ? 'border-slate-800 bg-[#0b111d] text-white' : 'border-slate-200 bg-white text-slate-950'}`}>
      <div className="flex h-20 items-center gap-3 px-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-500/20">LR</div><div className="min-w-0"><div className="truncate text-[15px] font-bold tracking-tight">Location Register</div><div className={`text-[11px] font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>National data workspace</div></div><button onClick={onClose} aria-label="Close sidebar" className={`ml-auto rounded-lg p-2 lg:hidden ${dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><Icon name="close" className="h-5 w-5" /></button></div>
      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Primary navigation">{groups.map(group => <div key={group.label} className="mb-7"><p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{group.label}</p><div className="space-y-1">{group.items.map(item => { const active = activeView === item.view; return <button key={item.view} onClick={() => { onNavigate(item.view); onClose(); }} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? dark ? 'bg-emerald-500/12 text-emerald-300 ring-1 ring-inset ring-emerald-500/20' : 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200' : dark ? 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? dark ? 'bg-emerald-500/15' : 'bg-white shadow-sm' : dark ? 'bg-slate-800/70' : 'bg-slate-100'}`}><Icon name={item.icon} className="h-[18px] w-[18px]" /></span><span className="min-w-0"><span className="block text-[13px] font-semibold">{item.label}</span><span className={`block truncate text-[10px] ${active ? 'opacity-70' : dark ? 'text-slate-600' : 'text-slate-400'}`}>{item.description}</span></span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}</button>; })}</div></div>)}</nav>
      <div className={`m-3 rounded-2xl border p-3 ${dark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}><div className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white">{user.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{user.name}</div><div className={`truncate text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{user.email}</div></div><button onClick={onToggleTheme} title="Toggle theme" className={`rounded-lg p-2 ${dark ? 'text-amber-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-white'}`}><Icon name={dark ? 'star' : 'cloud'} className="h-4 w-4" /></button></div><button onClick={onLogout} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'}`}><Icon name="logout" className="h-4 w-4" /> Sign out</button></div>
    </aside>
  </>;
};

export default Sidebar;

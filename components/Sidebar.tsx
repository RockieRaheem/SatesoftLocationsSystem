import React from 'react';
import type { ActiveView, Theme, User } from '../types.ts';
import Icon, { type IconName } from './Icon.tsx';

interface SidebarProps {
  theme: Theme; activeView: ActiveView; isOpen: boolean; user: User;
  onNavigate: (view: ActiveView) => void; onClose: () => void; onToggleTheme: () => void; onLogout: () => void;
}

const groups: Array<{ label: string; items: Array<{ view: ActiveView; label: string; icon: IconName }> }> = [
  { label: 'Workspace', items: [{ view: 'dashboard', label: 'Dashboard', icon: 'dashboard' }] },
  { label: 'Countries management', items: [
    { view: 'countries', label: 'Countries', icon: 'globe' },
    { view: 'country-admin-levels', label: 'Country admin levels', icon: 'map' },
    { view: 'country-electoral-levels', label: 'Country electoral levels', icon: 'shield-check' },
    { view: 'regional-economic-levels', label: 'Regional economic levels', icon: 'countries' },
  ]},
  { label: 'Account', items: [{ view: 'profile', label: 'My profile', icon: 'user-circle' }] },
];

const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();

const Sidebar: React.FC<SidebarProps> = ({ theme, activeView, isOpen, user, onNavigate, onClose, onToggleTheme, onLogout }) => {
  const dark = theme === 'dark';
  return <>
    <button aria-label="Close navigation" onClick={onClose} className={`fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${dark ? 'bg-slate-900 text-white' : 'border-r border-slate-200 bg-white text-slate-800'}`}>
      <div className="flex h-20 shrink-0 items-center gap-3 px-5"><div className="h-9 w-9 shrink-0 rounded-md bg-yellow-500 shadow-sm" /><span className="truncate text-lg font-bold">Location Register</span><button onClick={onClose} aria-label="Close sidebar" className={`ml-auto rounded-md p-2 lg:hidden ${dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><Icon name="close" className="h-5 w-5" /></button></div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2" aria-label="Primary navigation">{groups.map(group => <section key={group.label}><p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{group.label}</p><div className="space-y-1">{group.items.map(item => { const active = activeView === item.view; return <button key={item.view} onClick={() => { onNavigate(item.view); onClose(); }} className={`flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all active:scale-[.98] ${active ? 'bg-yellow-500 text-slate-900 shadow-md' : dark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}><Icon name={item.icon} className="h-5 w-5 shrink-0" /><span>{item.label}</span></button>; })}</div></section>)}</nav>
      <div className={`m-3 rounded-lg border p-3 ${dark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}><button onClick={() => onNavigate('profile')} className="flex w-full items-center gap-3 text-left">{user.avatar ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="grid h-9 w-9 place-items-center rounded-full bg-yellow-500 text-xs font-bold text-slate-900">{initials(user.name)}</div>}<div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user.name}</p><p className={`truncate text-[10px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</p></div></button><div className={`mt-3 grid grid-cols-2 gap-2 border-t pt-3 ${dark ? 'border-slate-700' : 'border-slate-200'}`}><button onClick={onToggleTheme} className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium ${dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-white'}`}><Icon name={dark ? 'star' : 'cloud'} className="h-4 w-4" /> Theme</button><button onClick={onLogout} className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium ${dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-white'}`}><Icon name="logout" className="h-4 w-4" /> Sign out</button></div></div>
    </aside>
  </>;
};

export default Sidebar;

import React from 'react';
import type { ActiveView, User } from '../types.ts';
import Icon, { type IconName } from './Icon.tsx';

interface SidebarProps {
  activeView: ActiveView;
  isOpen: boolean;
  user: User;
  onNavigate: (view: ActiveView) => void;
  onClose: () => void;
  onLogout: () => void;
}

const groups: Array<{ label: string; items: Array<{ view: ActiveView; label: string; icon: IconName }> }> = [
  { label: 'Workspace', items: [{ view: 'dashboard', label: 'Overview', icon: 'dashboard' }] },
  { label: 'Registry', items: [
    { view: 'countries', label: 'Countries', icon: 'globe' },
    { view: 'country-admin-levels', label: 'Administrative levels', icon: 'map' },
    { view: 'country-electoral-levels', label: 'Electoral locations', icon: 'shield-check' },
    { view: 'regional-economic-levels', label: 'Regional groupings', icon: 'countries' },
  ]},
];

const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();

const Sidebar: React.FC<SidebarProps> = ({ activeView, isOpen, user, onNavigate, onClose, onLogout }) => <>
  <button aria-label="Close navigation" onClick={onClose} className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
  <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-[#e6e4dd] bg-[#fbfbf8] text-[#1f1f1f] transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex h-[88px] items-center gap-3 px-5">
      <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-[#1f1f1f] text-[13px] font-bold tracking-[-0.04em] text-white"><span>LR</span><span className="absolute bottom-0 h-1 w-full bg-[#f9c80e]" /></div>
      <div className="min-w-0 flex-1"><div className="truncate text-[15px] font-semibold tracking-[-0.02em]">Location Register</div><div className="mt-0.5 text-[11px] text-[#77766f]">Uganda data workspace</div></div>
      <button onClick={onClose} aria-label="Close sidebar" className="rounded-full p-2 text-[#5f5f5a] hover:bg-[#efeee8] lg:hidden"><Icon name="close" className="h-5 w-5" /></button>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Primary navigation">
      {groups.map(group => <div key={group.label} className="mb-7">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8c8a82]">{group.label}</p>
        <div className="space-y-1">{group.items.map(item => {
          const active = activeView === item.view;
          return <button key={item.view} onClick={() => { onNavigate(item.view); onClose(); }} className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${active ? 'bg-[#fff3bd] text-[#1f1f1f]' : 'text-[#5f5f5a] hover:bg-[#f0efe9] hover:text-[#1f1f1f]'}`}>
            {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#1f1f1f]" />}
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${active ? 'bg-[#f9c80e] text-[#1f1f1f]' : 'text-[#77766f]'}`}><Icon name={item.icon} className="h-[17px] w-[17px]" /></span>
            <span>{item.label}</span>
          </button>;
        })}</div>
      </div>)}
    </nav>
    <div className="m-3 border-t border-[#e6e4dd] pt-4">
      <button onClick={() => onNavigate('profile')} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-[#f0efe9]">
        {user.avatar ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1f1f1f] text-[11px] font-semibold text-white">{initials(user.name)}</div>}
        <div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{user.name}</div><div className="mt-0.5 truncate text-[10px] text-[#8c8a82]">{user.role}</div></div>
        <Icon name="chevron-right" className="h-4 w-4 text-[#aaa89f]" />
      </button>
      <button onClick={onLogout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[#6f6e68] hover:bg-[#f0efe9] hover:text-[#1f1f1f]"><Icon name="logout" className="h-4 w-4" /> Sign out</button>
    </div>
  </aside>
</>;

export default Sidebar;

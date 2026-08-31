import React, { Suspense, lazy, useState } from 'react';
import type { ActiveView, Country, RegionalEconomicLevel, Theme, User } from '../types.ts';
import Icon from './Icon.tsx';
import { mockShops } from '../data.ts';

const CountriesPage = lazy(() => import('./CountriesPage.tsx'));
const CountriesMapPage = lazy(() => import('./CountriesMapPage.tsx'));
const CountryAdminLevelsPage = lazy(() => import('./CountryAdminLevelsPage.tsx'));
const CountryElectoralLevelsPage = lazy(() => import('./CountryElectoralLevelsPage.tsx'));
const RegionalEconomicLevelsPage = lazy(() => import('./RegionalEconomicLevelsPage.tsx'));
const CountryProfilePage = lazy(() => import('./CountryProfilePage.tsx'));
const LegacyFeatureRouter = lazy(() => import('./LegacyFeatureRouter.tsx'));

interface MainContentProps {
  theme: Theme; activeView: ActiveView; user: User; countries: Country[]; regionalLevels: RegionalEconomicLevel[];
  onToggleSidebar: () => void; onNavigate: (view: ActiveView) => void;
  onAddCountry: (country: Omit<Country, 'id'>) => Promise<void>; onUpdateCountry: (country: Country) => Promise<void>;
  onDeleteCountry: (id: number) => Promise<void>; onSaveRegionalLevel: (level: RegionalEconomicLevel) => Promise<void>;
  onDeleteRegionalLevel: (id: number, remarks?: string) => Promise<void>;
}

const titles: Partial<Record<ActiveView, string>> = {
  dashboard: 'Users Data', 'dashboard-users': 'Users Data', 'dashboard-system': 'System Usage', 'dashboard-traffic': 'Traffic Data', 'dashboard-products': 'Product Performance',
  'dashboard-customer': 'My Dashboard', 'customer-make-order': 'Make an Order', 'customer-purchases': 'My Purchases', 'customer-loyalty': 'Loyalty Points',
  countries: 'Countries', 'countries-map': 'Regional Map', 'country-admin-levels': 'Country Admin Levels',
  'country-electoral-levels': 'Country Electoral Levels', 'regional-economic-levels': 'Regional Economic Levels',
  'country-profile': 'Country Profile', profile: 'My Profile',
  settings: 'Settings', 'settings-cameras': 'Camera Settings', 'settings-api': 'API Settings', 'settings-calls': 'Call Settings',
  'id-verification': 'ID Verification', 'stock-listing': 'Stock Listing', inventory: 'Inventory Tracking', 'stock-purchase': 'Stock Purchase',
  'shop-users': 'Country Admins', 'super-users': 'Super Users', permissions: 'Permissions', roles: 'Roles', shops: 'Shops', 'shop-profile': 'Shop Profile', 'shop-surveillance': 'Surveillance', 'wallet-settings': 'Wallet Settings', leads: 'Leads',
  'finances-income-statement': 'Income Statement', 'finances-balance-sheet': 'Balance Sheet', 'finances-cash-flow': 'Cash Flow', 'income-statement-detail': 'Financial Details', 'balance-sheet-detail': 'Balance Sheet Detail', 'cash-flow-detail': 'Cash Flow Detail',
  'reports-messages': 'Messages', 'reports-calls': 'Calls', 'reports-daily-sales': 'Daily Sales', 'reports-stock-level': 'Stock Level', 'reports-product-profile': 'Product Profile', 'reports-packet-tracer': 'Packet Tracer', 'reports-packet-tracer-live': 'Live Packet Tracer', 'reports-packet-tracer-config': 'Packet Tracer Configuration',
  'client-list': 'Contributor List', 'client-wallets': 'Client Wallets', 'client-loyalty': 'Client Loyalty', 'admin-loyalty-mgt': 'Loyalty Management', 'system-message-settings': 'Message Settings',
  'product-chain-products': 'Products', 'product-chain-manufacturers': 'Manufacturers', 'product-chain-distributors': 'Distributors', 'product-chain-suppliers': 'Suppliers',
  'sales-desk': 'Sales Desk', 'mobi-agent-settings': 'Mobi Account Settings', 'mno-wallet-settings': 'MNO & Wallet Settings', 'mno-wallet-transactions': 'MNO & Wallet Transactions', 'exchange-rate': 'Exchange Rates', 'lookup-values': 'Tax Values',
};

const MainContent: React.FC<MainContentProps> = props => {
  const { theme, activeView, user, countries, regionalLevels, onToggleSidebar, onNavigate, onAddCountry, onUpdateCountry, onDeleteCountry, onSaveRegionalLevel, onDeleteRegionalLevel } = props;
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const dark = theme === 'dark';
  const render = () => {
    switch (activeView) {
      case 'countries': return <CountriesPage theme={theme} countries={countries} onAddCountry={onAddCountry} onUpdateCountry={onUpdateCountry} onDeleteCountry={onDeleteCountry} onViewProfile={country => { setSelectedCountry(country); onNavigate('country-profile'); }} />;
      case 'countries-map': return <CountriesMapPage theme={theme} shops={mockShops} regionalLevels={regionalLevels} countries={countries} />;
      case 'country-admin-levels': return <CountryAdminLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'country-electoral-levels': return <CountryElectoralLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'regional-economic-levels': return <RegionalEconomicLevelsPage theme={theme} regionalLevels={regionalLevels} countries={countries} onSave={onSaveRegionalLevel} onDelete={onDeleteRegionalLevel} />;
      case 'country-profile': return <CountryProfilePage theme={theme} country={selectedCountry} onNavigate={onNavigate} />;
      default: return <LegacyFeatureRouter activeView={activeView} theme={theme} user={user} countries={countries} regionalLevels={regionalLevels} onNavigate={onNavigate} onUpdateCountry={onUpdateCountry} />;
    }
  };

  return <main className={`flex min-w-0 flex-1 flex-col overflow-hidden ${dark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
    <header className="flex h-20 shrink-0 items-center justify-between px-4 md:px-6"><div className="flex min-w-0 items-center"><button onClick={onToggleSidebar} aria-label="Toggle navigation" className={`mr-4 rounded-md p-2 transition active:scale-95 ${dark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}><Icon name="hamburger" className="h-6 w-6" /></button><h1 className={`truncate text-xl font-semibold md:text-2xl ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{titles[activeView] || 'Dashboard'}</h1></div><div className={`hidden items-center gap-2 rounded-md px-3 py-2 text-xs font-medium sm:flex ${dark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}`}><span className="h-2 w-2 rounded-full bg-emerald-500" /> Uganda data connected</div></header>
    <div className="w-full flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 md:px-6 lg:px-4"><Suspense fallback={<div className="grid min-h-[320px] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-yellow-500" /></div>}>{render()}</Suspense></div>
  </main>;
};

export default MainContent;

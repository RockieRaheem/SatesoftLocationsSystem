
// ... existing imports ...
import React, { useState, useEffect } from 'react';
import Icon, { IconName } from './Icon';
import { Theme, ActiveView } from '../types';
import ThemeSwitch from './ThemeSwitch';
import { useTranslation } from '../contexts/LanguageContext';

interface SidebarProps {
    theme: Theme;
    toggleTheme: () => void;
    activeView: ActiveView;
    onNavigate: (view: ActiveView) => void;
    isCollapsed: boolean;
    allowCalls: boolean;
    onLogout?: () => void;
    userRole?: string;
}

interface NavLinkProps {
  icon: IconName;
  label: string;
  active?: boolean;
  theme: Theme;
  onClick?: () => void;
  isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active = false, theme, onClick, isCollapsed }) => {
  const activeClasses = 'bg-yellow-500 text-slate-900 shadow-md';
  const inactiveClasses = theme === 'dark' 
    ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'} ${
        active ? activeClasses : inactiveClasses
      }`}
      aria-label={isCollapsed ? label : undefined}
    >
      <Icon name={icon} className="h-5 w-5 flex-shrink-0" />
      <span className={`whitespace-nowrap transition-all duration-200 overflow-hidden ${isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-3 opacity-100'}`}>{label}</span>
      {isCollapsed && (
        <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
          {label}
        </span>
      )}
    </button>
  );
};

const SectionTitle: React.FC<{ theme: Theme; children: React.ReactNode, isCollapsed: boolean }> = ({ theme, children, isCollapsed }) => {
    if (isCollapsed) {
        return <hr className={`my-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />;
    }
    return <h3 className={`px-4 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{children}</h3>;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, toggleTheme, activeView, onNavigate, isCollapsed, allowCalls, onLogout, userRole }) => {
  const { t } = useTranslation();
  const isCustomer = userRole === 'Customer';
  const isFinancialInstitution = userRole === 'Financial Institution';
  // Treat 'Admin' from SignIn as Super Admin (same as 'Administrator')
  const isSuperAdmin = userRole === 'Administrator' || userRole === 'Admin';
  const isShopRole = ['Shop Owner', 'Shop Attendant'].includes(userRole || '');
  const isMobiAgent = userRole === 'Mobi Agent' || isSuperAdmin;

  // Active states for collapsible menus
  const isDashboardMenuActive = ['dashboard', 'dashboard-users', 'dashboard-system', 'dashboard-traffic', 'dashboard-products'].includes(activeView);
  const isStockMenuActive = ['stock-listing', 'stock-purchase', 'inventory'].includes(activeView);
  const isAccountMenuActive = ['profile', 'settings'].includes(activeView);
  const isUserMenuActive = ['shop-users', 'super-users', 'permissions', 'roles'].includes(activeView);
  const isShopMgtMenuActive = ['shops', 'shop-profile', 'shop-surveillance', 'wallet-settings'].includes(activeView);
  const isFinancesMenuActive = ['finances-income-statement', 'finances-balance-sheet', 'finances-cash-flow'].includes(activeView);
  const isCountriesMgtMenuActive = ['countries', 'country-admin-levels', 'country-electoral-levels', 'countries-map', 'regional-economic-levels', 'exchange-rate'].includes(activeView);
  const isSystemSettingsMenuActive = ['settings-api', 'system-message-settings', 'settings-calls'].includes(activeView);
  const isReportsMenuActive = ['reports-messages', 'reports-calls', 'reports-daily-sales', 'reports-stock-level', 'reports-product-profile'].includes(activeView);
  const isClientMgtMenuActive = ['client-list', 'client-wallets', 'client-loyalty'].includes(activeView);
  const isProductChainMenuActive = ['product-chain-products', 'product-chain-manufacturers', 'product-chain-distributors', 'product-chain-suppliers'].includes(activeView);
  const isPacketTracerMenuActive = ['reports-packet-tracer', 'reports-packet-tracer-live', 'reports-packet-tracer-config'].includes(activeView);
  const isMobiAgentMenuActive = ['mobi-agent-settings', 'mno-wallet-settings', 'mno-wallet-transactions', 'exchange-rate'].includes(activeView);

  // State for menu open/closed status
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(isDashboardMenuActive);
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(isStockMenuActive);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(isAccountMenuActive);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(isUserMenuActive);
  const [isShopMgtMenuOpen, setIsShopMgtMenuOpen] = useState(isShopMgtMenuActive);
  const [isFinancesMenuOpen, setIsFinancesMenuOpen] = useState(isFinancesMenuActive);
  const [isCountriesMgtMenuOpen, setIsCountriesMgtMenuOpen] = useState(isCountriesMgtMenuActive);
  const [isSystemSettingsMenuOpen, setIsSystemSettingsMenuOpen] = useState(isSystemSettingsMenuActive);
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(isReportsMenuActive);
  const [isClientMgtMenuOpen, setIsClientMgtMenuOpen] = useState(isClientMgtMenuActive);
  const [isProductChainMenuOpen, setIsProductChainMenuOpen] = useState(isProductChainMenuActive);
  const [isPacketTracerMenuOpen, setIsPacketTracerMenuOpen] = useState(isPacketTracerMenuActive);
  const [isMobiAgentMenuOpen, setIsMobiAgentMenuOpen] = useState(isMobiAgentMenuActive);

  // Effect to auto-open active menu
  useEffect(() => { if (isDashboardMenuActive) setIsDashboardMenuOpen(true); }, [isDashboardMenuActive]);
  useEffect(() => { if (isStockMenuActive) setIsStockMenuOpen(true); }, [isStockMenuActive]);
  useEffect(() => { if (isAccountMenuActive) setIsAccountMenuOpen(true); }, [isAccountMenuActive]);
  useEffect(() => { if (isUserMenuActive) setIsUserMenuOpen(true); }, [isUserMenuActive]);
  useEffect(() => { if (isShopMgtMenuActive) setIsShopMgtMenuOpen(true); }, [isShopMgtMenuActive]);
  useEffect(() => { if (isFinancesMenuActive) setIsFinancesMenuOpen(true); }, [isFinancesMenuActive]);
  useEffect(() => { if (isCountriesMgtMenuActive) setIsCountriesMgtMenuOpen(true); }, [isCountriesMgtMenuActive]);
  useEffect(() => { if (isSystemSettingsMenuActive) setIsSystemSettingsMenuOpen(true); }, [isSystemSettingsMenuActive]);
  useEffect(() => { if (isReportsMenuActive) setIsReportsMenuOpen(true); }, [isReportsMenuActive]);
  useEffect(() => { if (isClientMgtMenuActive) setIsClientMgtMenuOpen(true); }, [isClientMgtMenuActive]);
  useEffect(() => { if (isProductChainMenuActive) setIsProductChainMenuOpen(true); }, [isProductChainMenuActive]);
  useEffect(() => { if (isPacketTracerMenuActive) setIsPacketTracerMenuOpen(true); }, [isPacketTracerMenuActive]);
  useEffect(() => { if (isMobiAgentMenuActive) setIsMobiAgentMenuOpen(true); }, [isMobiAgentMenuActive]);

  // Determine sidebar classes based on collapsed state and screen size
  // When collapsed (closed), only the icons remain on the left side (w-16 on mobile, md:w-20 on desktop)
  const sidebarWidthClass = isCollapsed ? 'w-16 md:w-20' : 'w-64';
  const positionClasses = isCollapsed ? 'relative' : 'absolute md:relative left-0 top-0 h-full';
  const commonClasses = `z-50 flex flex-col h-full transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border-r border-slate-200'}`;

  return (
    <aside className={`${commonClasses} ${sidebarWidthClass} ${positionClasses}`}>
      <div className={`flex items-center space-x-3 mb-6 flex-shrink-0 p-4 transition-all duration-300 ${isCollapsed ? 'justify-center space-x-0' : 'px-4'}`}>
        <div className="w-8 h-8 bg-yellow-500 flex-shrink-0 rounded-md shadow-sm"></div>
        <span className={`text-xl font-bold whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Location Register</span>
      </div>
      
      <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-2 ${isCollapsed ? '' : 'pr-2'}`}>
        
        {/* CUSTOMER MENU */}
        {isCustomer && (
             <>
                <NavLink isCollapsed={isCollapsed} theme={theme} icon="dashboard" label="My Dashboard" active={activeView === 'dashboard-customer'} onClick={() => onNavigate('dashboard-customer')} />
                <NavLink isCollapsed={isCollapsed} theme={theme} icon="stock-purchase" label="Make Order" active={activeView === 'customer-make-order'} onClick={() => onNavigate('customer-make-order')} />
                <NavLink isCollapsed={isCollapsed} theme={theme} icon="cart" label="My Purchases" active={activeView === 'customer-purchases'} onClick={() => onNavigate('customer-purchases')} />
                <NavLink isCollapsed={isCollapsed} theme={theme} icon="star" label="Loyalty Points" active={activeView === 'customer-loyalty'} onClick={() => onNavigate('customer-loyalty')} />
                <NavLink isCollapsed={isCollapsed} theme={theme} icon="wallet" label="My Wallet" />
                <SectionTitle theme={theme} isCollapsed={isCollapsed}>Account</SectionTitle>
                <NavLink isCollapsed={isCollapsed} theme={theme} icon="user-circle" label={t('sidebar.myProfile', 'My profile')} active={activeView === 'profile'} onClick={() => onNavigate('profile')} />
                <NavLink isCollapsed={isCollapsed} theme={theme} icon="system-settings" label={t('sidebar.accountSettings', 'Account settings')} active={activeView === 'settings'} onClick={() => onNavigate('settings')} />
             </>
        )}

        {/* ADMIN / SHOP OWNER / FINANCIAL INSTITUTION MENU */}
        {!isCustomer && (
            <>
                {/* Collapsible Dashboard Menu */}
                <div>
                    <button onClick={() => isCollapsed ? onNavigate(isSuperAdmin ? 'dashboard-users' : 'dashboard') : setIsDashboardMenuOpen(!isDashboardMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isDashboardMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                        <div className="flex items-center"><Icon name="dashboard" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>{t('sidebar.dashboard', 'Dashboard')}</span></div>
                        <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isDashboardMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                        {isCollapsed && (
                            <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                            {t('sidebar.dashboard', 'Dashboard')}
                            </span>
                        )}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDashboardMenuOpen && !isCollapsed ? 'max-h-60' : 'max-h-0'}`}>
                        <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                            {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="user-mgt" label={t('sidebar.usersData', 'Users Data')} active={['dashboard', 'dashboard-users'].includes(activeView)} onClick={() => onNavigate('dashboard-users')} />}
                            {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="reports" label={t('sidebar.trafficData', 'Traffic Data')} active={activeView === 'dashboard-traffic'} onClick={() => onNavigate('dashboard-traffic')} />}
                            {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="system-settings" label={t('sidebar.systemUsage', 'System Usage')} active={activeView === 'dashboard-system'} onClick={() => onNavigate('dashboard-system')} />}
                        </div>
                    </div>
                </div>

                {/* Reports Menu */}
                <div>
                    <button onClick={() => isCollapsed ? onNavigate('reports-messages') : setIsReportsMenuOpen(!isReportsMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isReportsMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                        <div className="flex items-center"><Icon name="reports" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>{t('sidebar.reports', 'Reports')}</span></div>
                        <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isReportsMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                         {isCollapsed && (
                            <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                            {t('sidebar.reports', 'Reports')}
                            </span>
                        )}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isReportsMenuOpen && !isCollapsed ? 'max-h-60' : 'max-h-0'}`}>
                        <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                            <NavLink isCollapsed={isCollapsed} theme={theme} icon="chat-bubble" label="Messages" active={activeView === 'reports-messages'} onClick={() => onNavigate('reports-messages')} />
                            {allowCalls && <NavLink isCollapsed={isCollapsed} theme={theme} icon="phone" label="Calls" active={activeView === 'reports-calls'} onClick={() => onNavigate('reports-calls')} />}
                        </div>
                    </div>
                </div>
                
                {/* Packet Tracer Menu - Admin Only */}
                {isSuperAdmin && (
                    <div>
                        <button onClick={() => isCollapsed ? onNavigate('reports-packet-tracer') : setIsPacketTracerMenuOpen(!isPacketTracerMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isPacketTracerMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                            <div className="flex items-center"><Icon name="analytics" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>{t('sidebar.packetTracer', 'Packet Tracer')}</span></div>
                            <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isPacketTracerMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                            {isCollapsed && (
                                <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                                {t('sidebar.packetTracer', 'Packet Tracer')}
                                </span>
                            )}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPacketTracerMenuOpen && !isCollapsed ? 'max-h-40' : 'max-h-0'}`}>
                            <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="reports" label={t('sidebar.packetTracerLogs', 'Tracer Logs')} active={activeView === 'reports-packet-tracer'} onClick={() => onNavigate('reports-packet-tracer')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="analytics" label={t('sidebar.packetTracerLive', 'Live Trace')} active={activeView === 'reports-packet-tracer-live'} onClick={() => onNavigate('reports-packet-tracer-live')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="system-settings" label={t('sidebar.packetTracerConfig', 'Trace Config')} active={activeView === 'reports-packet-tracer-config'} onClick={() => onNavigate('reports-packet-tracer-config')} />
                            </div>
                        </div>
                    </div>
                )}

                <NavLink isCollapsed={isCollapsed} theme={theme} icon="users" label={t('sidebar.leads', 'Leads')} active={activeView === 'leads'} onClick={() => onNavigate('leads')} />

                {/* Collapsible Countries Management Menu - Admin Only */}
                {isSuperAdmin && (
                    <div>
                        <button onClick={() => isCollapsed ? onNavigate('countries') : setIsCountriesMgtMenuOpen(!isCountriesMgtMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isCountriesMgtMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                            <div className="flex items-center"><Icon name="globe" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>{t('sidebar.countriesMgt', 'Countries mgt')}</span></div>
                            <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isCountriesMgtMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                            {isCollapsed && (
                                <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                                {t('sidebar.countriesMgt', 'Countries mgt')}
                                </span>
                            )}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCountriesMgtMenuOpen && !isCollapsed ? 'max-h-[500px]' : 'max-h-0'}`}>
                            <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="countries" label={t('sidebar.countries', 'Countries')} active={activeView === 'countries'} onClick={() => onNavigate('countries')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="currencies" label={t('sidebar.currencies', 'Currencies')} active={activeView === 'exchange-rate'} onClick={() => onNavigate('exchange-rate')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="globe" label="Countries Map" active={activeView === 'countries-map'} onClick={() => onNavigate('countries-map')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="product-chain" label="REC Level" active={activeView === 'regional-economic-levels'} onClick={() => onNavigate('regional-economic-levels')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="shop-mgt" label={t('sidebar.countryAdminLevels', 'Country admin levels')} active={activeView === 'country-admin-levels'} onClick={() => onNavigate('country-admin-levels')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="analytics" label={t('sidebar.countryElectoralLevels', 'Country electoral levels')} active={activeView === 'country-electoral-levels'} onClick={() => onNavigate('country-electoral-levels')} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Client Mgt Menu */}
                {!isFinancialInstitution && (
                    <div>
                        <button onClick={() => isCollapsed ? onNavigate('client-list') : setIsClientMgtMenuOpen(!isClientMgtMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isClientMgtMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                            <div className="flex items-center"><Icon name="client-mgt" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>{t('sidebar.clientMgt', 'Contributor mgt')}</span></div>
                            <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isClientMgtMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                            {isCollapsed && (
                                <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                                {t('sidebar.clientMgt', 'Contributor mgt')}
                                </span>
                            )}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isClientMgtMenuOpen && !isCollapsed ? 'max-h-64' : 'max-h-0'}`}>
                            <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="users" label="Contributor list" active={activeView === 'client-list'} onClick={() => onNavigate('client-list')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="wallet" label="Wallets" active={activeView === 'client-wallets'} onClick={() => onNavigate('client-wallets')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="star" label={t('sidebar.loyaltyPoints', 'Loyalty Points')} active={activeView === 'client-loyalty'} onClick={() => onNavigate('client-loyalty')} />
                                <NavLink isCollapsed={isCollapsed} theme={theme} icon="analytics" label="Loyalty Management" active={activeView === 'admin-loyalty-mgt'} onClick={() => onNavigate('admin-loyalty-mgt')} />
                            </div>
                        </div>
                    </div>
                )}
                
                {!isFinancialInstitution && (
                  <SectionTitle theme={theme} isCollapsed={isCollapsed}>{t('sidebar.settings', 'Settings')}</SectionTitle>
                )}
                
                {/* Collapsible System Settings Menu */}
                {!isFinancialInstitution && (
                  <div>
                      <button onClick={() => isCollapsed ? onNavigate(isSuperAdmin ? 'settings-api' : 'settings-calls') : setIsSystemSettingsMenuOpen(!isSystemSettingsMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isSystemSettingsMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                          <div className="flex items-center"><Icon name="system-settings" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>System Settings</span></div>
                          <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isSystemSettingsMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                          {isCollapsed && (
                              <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                              System Settings
                              </span>
                          )}
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSystemSettingsMenuOpen && !isCollapsed ? 'max-h-60' : 'max-h-0'}`}>
                          <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                              
                              {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="api" label="API Settings" active={activeView === 'settings-api'} onClick={() => onNavigate('settings-api')} />}
                              {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="lock" label="Message Settings" active={activeView === 'system-message-settings'} onClick={() => onNavigate('system-message-settings')} />}
                              <NavLink isCollapsed={isCollapsed} theme={theme} icon="phone" label="Call Settings" active={activeView === 'settings-calls'} onClick={() => onNavigate('settings-calls')} />
                          </div>
                      </div>
                  </div>
                )}

                {/* Collapsible My Account Menu */}
                <div>
                    <button onClick={() => isCollapsed ? onNavigate('profile') : setIsAccountMenuOpen(!isAccountMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isAccountMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                        <div className="flex items-center"><Icon name="user-circle" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>{t('sidebar.myAccount', 'My account')}</span></div>
                        <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                        {isCollapsed && (
                            <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                            {t('sidebar.myAccount', 'My account')}
                            </span>
                        )}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAccountMenuOpen && !isCollapsed ? 'max-h-40' : 'max-h-0'}`}>
                        <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                            <NavLink isCollapsed={isCollapsed} theme={theme} icon="user-circle" label={t('sidebar.myProfile', 'My profile')} active={activeView === 'profile'} onClick={() => onNavigate('profile')} />
                            <NavLink isCollapsed={isCollapsed} theme={theme} icon="system-settings" label={t('sidebar.accountSettings', 'Account settings')} active={activeView === 'settings'} onClick={() => onNavigate('settings')} />
                        </div>
                    </div>
                </div>

                {/* Collapsible User Management Menu */}
                {!isFinancialInstitution && (
                  <div>
                      <button onClick={() => isCollapsed ? onNavigate('shop-users') : setIsUserMenuOpen(!isUserMenuOpen)} className={`w-full flex items-center justify-between text-sm font-medium rounded-md transition-all duration-200 active:scale-95 text-left relative group ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-2.5'} ${isUserMenuActive ? 'bg-yellow-500 text-slate-900 shadow-md' : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}`}>
                          <div className="flex items-center"><Icon name="user-mgt" className="h-5 w-5 flex-shrink-0" /><span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'w-auto ml-3 opacity-100'}`}>{t('sidebar.userMgt', 'User mgt')}</span></div>
                          <Icon name="chevron-down" className={`h-4 w-4 transition-all duration-200 ${isUserMenuOpen ? 'rotate-180' : ''} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} />
                          {isCollapsed && (
                              <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                              {t('sidebar.userMgt', 'User mgt')}
                              </span>
                          )}
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isUserMenuOpen && !isCollapsed ? 'max-h-96' : 'max-h-0'}`}>
                          <div className={`pt-1 space-y-1 ${isCollapsed ? 'hidden' : 'pl-4'}`}>
                              <NavLink isCollapsed={isCollapsed} theme={theme} icon="client-mgt" label={t('sidebar.shopUsers', 'Country User')} active={activeView === 'shop-users'} onClick={() => onNavigate('shop-users')} />
                              {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="user-circle" label={t('sidebar.superUsers', 'Super users')} active={activeView === 'super-users'} onClick={() => onNavigate('super-users')} />}
                              {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="key" label={t('sidebar.permissions', 'Permissions')} active={activeView === 'permissions'} onClick={() => onNavigate('permissions')} />}
                              {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="user-mgt" label={t('sidebar.roles', 'Roles')} active={activeView === 'roles'} onClick={() => onNavigate('roles')} /> }
                          </div>
                      </div>
                  </div>
                )}
                
                {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="subscription-mgt" label={t('sidebar.subscriptionMgt', 'Subscription mgt')} />}
                {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="shield-check" label={t('sidebar.idVerification', 'ID Verification')} active={activeView === 'id-verification'} onClick={() => onNavigate('id-verification')} />}
                {isSuperAdmin && <NavLink isCollapsed={isCollapsed} theme={theme} icon="lookup-values" label={t('sidebar.lookupValues', 'Tax values')} active={activeView === 'lookup-values'} onClick={() => onNavigate('lookup-values')} />}
            </>
        )}

      </nav>
      <div className="mt-auto pt-4 pb-4 px-4 flex-shrink-0">
        <ThemeSwitch theme={theme} onToggle={toggleTheme} isCollapsed={isCollapsed} />
        <div className="mt-2">
            <NavLink isCollapsed={isCollapsed} theme={theme} icon="logout" label={t('sidebar.logout', 'Logout')} onClick={onLogout} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

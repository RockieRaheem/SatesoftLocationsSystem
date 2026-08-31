
// ... existing imports ...
import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Theme, ActiveView, User, IDVerificationRequest, Role, ShopUser, SuperUser, Shop, Country, Notification, CameraDevice, CallRecord, DeletedCallRecord, ProductDefinition, StockItem, RegionalEconomicLevel } from '../types';
import { mockSuperUsers } from '../data';
import Icon from './Icon';
import Dashboard from './Dashboard';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import IDVerificationPage from './IDVerificationPage';
import StockListingPage from './StockListingPage';
import InventoryPage from './InventoryPage';
import CountriesPage from './CountriesPage';
import ShopUsersPage from './ShopUsersPage';
import SuperUsersPage from './SuperUsersPage';
import PermissionsPage from './PermissionsPage';
import StockPurchasePage from './StockPurchasePage';
import RolesPage from './RolesPage';
import ShopsPage from './ShopsPage';
import ShopProfilePage from './ShopProfilePage';
import ShopSurveillancePage from './ShopSurveillancePage';
import WalletSettingsPage from './WalletSettingsPage';
import LeadsPage from './LeadsPage';
import IncomeStatementPage from './IncomeStatementPage';
import BalanceSheetPage from './BalanceSheetPage';
import CashFlowPage from './CashFlowPage';
import IncomeStatementDetailPage from './IncomeStatementDetailPage';
import BalanceSheetDetailPage from './BalanceSheetDetailPage';
import CashFlowDetailPage from './CashFlowDetailPage';
import CountryAdminLevelsPage from './CountryAdminLevelsPage';
import CountryProfilePage from './CountryProfilePage';
import CountriesMapPage from './CountriesMapPage';
import CountryElectoralLevelsPage from './CountryElectoralLevelsPage';
import RegionalEconomicLevelsPage from './RegionalEconomicLevelsPage';
import ReportsCallsPage from './ReportsCallsPage';
import MessagesPage from './MessagesPage';
import DailySalesPage from './DailySalesPage';
import ProductProfilePage from './ProductProfilePage';
import PacketTracerPage from './PacketTracerPage';
import PacketTracerLivePage from './PacketTracerLivePage';
import PacketTracerConfigPage from './PacketTracerConfigPage';
import ClientsPage from './ClientsPage';
import ClientWalletsPage from './ClientWalletsPage';
import ClientLoyaltyPage from './ClientLoyaltyPage';
import AdminLoyaltyMgtPage from './AdminLoyaltyMgtPage';
import MessageSettingsPage from './MessageSettingsPage';
import ManufacturersPage from './ManufacturersPage';
import DistributorsPage from './DistributorsPage';
import SuppliersPage from './SuppliersPage';
import ProductsPage from './ProductsPage';
import SystemUsageDashboard from './SystemUsageDashboard';
import TrafficDashboard from './TrafficDashboard';
import ProductDashboard from './ProductDashboard';
import CameraSettingsPage from './CameraSettingsPage';
import ApiSettingsPage from './ApiSettingsPage';
import CallSettingsPage from './CallSettingsPage';
import LanguageSelector from './LanguageSelector';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import SalesDesk from './SalesDesk';
import CustomerDashboard from './CustomerDashboard';
import CustomerPurchasesPage from './CustomerPurchasesPage';
import CustomerMakeOrderPage from './CustomerMakeOrderPage';
import CustomerLoyaltyPage from './CustomerLoyaltyPage';
import StockLevelPage from './StockLevelPage';
import MobiAgentSettingsPage from './MobiAgentSettingsPage';
import MNOWalletSettingsPage from './MNOWalletSettingsPage';
import MNOWalletTransactionsPage from './MNOWalletTransactionsPage';
import ExchangeRatePage from './ExchangeRatePage';
import LookupValuesPage from './LookupValuesPage';

interface MainContentProps {
  theme: Theme;
  activeView: ActiveView;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  onNavigate: (view: ActiveView) => void;
  language: string;
  setLanguage: (lang: string) => void;
  verificationRequests: IDVerificationRequest[];
  setVerificationRequests: React.Dispatch<React.SetStateAction<IDVerificationRequest[]>>;
  shopRoles: Role[];
  setShopRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  superUserRoles: Role[];
  setSuperUserRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  shopUsers: ShopUser[];
  setShopUsers: React.Dispatch<React.SetStateAction<ShopUser[]>>;
  currentUser: User;
  selectedShop: Shop | null;
  setSelectedShop: React.Dispatch<React.SetStateAction<Shop | null>>;
  onToggleSidebar: () => void;
  countries: Country[];
  regionalLevels: RegionalEconomicLevel[];
  onSaveRegionalLevel: (level: RegionalEconomicLevel) => Promise<void>;
  onDeleteRegionalLevel: (id: number, remarks?: string) => Promise<void>;
  onAddCountry: (country: Omit<Country, 'id'>) => Promise<void>;
  onUpdateCountry: (country: Country) => Promise<void>;
  onDeleteCountry: (id: number) => Promise<void>;
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  cameraDevices: CameraDevice[];
  setCameraDevices: React.Dispatch<React.SetStateAction<CameraDevice[]>>;
  trackedKeywords: string[];
  setTrackedKeywords: React.Dispatch<React.SetStateAction<string[]>>;
  callRecords: CallRecord[];
  deletedCallRecords: DeletedCallRecord[];
  onDeleteCall: (callId: string, reason: string, deletedBy: string) => void;
  addCallRecord: (record: Omit<CallRecord, 'id'>) => void;
  allowCalls: boolean;
  setAllowCalls: React.Dispatch<React.SetStateAction<boolean>>;
  allowMicrophone: boolean;
  setAllowMicrophone: React.Dispatch<React.SetStateAction<boolean>>;
  products: ProductDefinition[];
  setProducts: React.Dispatch<React.SetStateAction<ProductDefinition[]>>;
  stockItems: StockItem[];
  setStockItems: React.Dispatch<React.SetStateAction<StockItem[]>>;
  onLogout: () => void;
}

const titles: Record<string, string> = {
    'dashboard': 'Income Statement',
    'dashboard-users': 'Users Data',
    'dashboard-system': 'System Usage',
    'dashboard-traffic': 'Traffic Data',
    'dashboard-products': 'Product Performance',
    'dashboard-customer': 'My Dashboard',
    'customer-purchases': 'My Purchases',
    'customer-make-order': 'Make an Order',
    'customer-loyalty': 'Loyalty Points',
    'profile': 'My Profile',
    'settings': 'Settings',
    'id-verification': 'ID Verification',
    'stock-listing': 'Stock Listing',
    'inventory': 'Inventory Tracking',
    'countries': 'Countries',
    'countries-map': 'Regional Map',
    'country-admin-levels': 'Country Admin Levels',
    'country-electoral-levels': 'Country Electoral Levels',
    'regional-economic-levels': 'Regional Economic Levels',
    'country-profile': 'Country Profile',
    'shop-users': 'Country admin',
    'super-users': 'Super Users',
    'permissions': 'Permissions',
    'roles': 'Roles',
    'stock-purchase': 'Stock Purchase',
    'shops': 'Shops',
    'shop-profile': 'Shop Profile',
    'finances-income-statement': 'Income Statement',
    'finances-balance-sheet': 'Balance Sheet',
    'finances-cash-flow': 'Cash Flow',
    'cash-flow-detail': 'Cash Flow Detail',
    'leads': 'Leads',
    'income-statement-detail': 'Financial Details',
    'balance-sheet-detail': 'Balance Sheet Detail',
    'reports-messages': 'Messages',
    'reports-calls': 'Calls',
    'reports-daily-sales': 'Daily Sales',
    'reports-stock-level': 'Stock Level',
    'reports-product-profile': 'Product Profile',
    'reports-packet-tracer': 'Packet Tracer',
    'reports-packet-tracer-live': 'Live Packet Tracer',
    'reports-packet-tracer-config': 'Packet Tracer Config',
    'client-list': 'Contributor List',
    'client-wallets': 'Client Wallets',
    'client-loyalty': 'Client Loyalty',
    'admin-loyalty-mgt': 'Loyalty Management',
    'system-message-settings': 'Message Settings',
    'product-chain-products': 'Products',
    'product-chain-manufacturers': 'Manufacturers',
    'product-chain-distributors': 'Distributors',
    'product-chain-suppliers': 'Suppliers',
    'settings-cameras': 'Camera Settings',
    'settings-api': 'API Settings',
    'settings-calls': 'Call Settings',
    'shop-surveillance': 'Surveillance',
    'wallet-settings': 'Wallet Settings',
    'sales-desk': 'Sales Desk',
    'mobi-agent-settings': 'Mobi Account Setting',
    'mno-wallet-settings': 'MNO & Wallet Settings',
    'mno-wallet-transactions': 'MNO & Wallet Transactions',
    'exchange-rate': 'Exchange Rate',
    'lookup-values': 'Tax values',
};

const MainContent: React.FC<MainContentProps> = ({ 
  theme, 
  activeView, 
  user, 
  setUser, 
  onNavigate, 
  language, 
  setLanguage,
  verificationRequests,
  setVerificationRequests,
  shopRoles,
  setShopRoles,
  superUserRoles,
  setSuperUserRoles,
  shopUsers,
  setShopUsers,
  currentUser,
  selectedShop,
  setSelectedShop,
  onToggleSidebar,
  countries,
  regionalLevels,
  onSaveRegionalLevel,
  onDeleteRegionalLevel,
  onAddCountry,
  onUpdateCountry,
  onDeleteCountry,
  shops,
  setShops,
  notifications,
  setNotifications,
  cameraDevices,
  setCameraDevices,
  trackedKeywords,
  setTrackedKeywords,
  callRecords,
  deletedCallRecords,
  onDeleteCall,
  addCallRecord,
  allowCalls,
  setAllowCalls,
  allowMicrophone,
  setAllowMicrophone,
  products,
  setProducts,
  stockItems,
  setStockItems,
  onLogout
}) => {
  const { t } = useTranslation();
  const [selectedCountryProfile, setSelectedCountryProfile] = useState<Country | null>(null);

  const handleViewShopProfile = (shop: Shop) => {
    setSelectedShop(shop);
    onNavigate('shop-profile');
  };
  
  const handleViewIncomeStatementDetail = (shop: Shop) => {
    setSelectedShop(shop);
    onNavigate('income-statement-detail');
  }

  const handleViewBalanceSheetDetail = (shop: Shop) => {
    setSelectedShop(shop);
    onNavigate('balance-sheet-detail');
  }

  const handleViewCashFlowDetail = (shop: Shop) => {
    setSelectedShop(shop);
    onNavigate('cash-flow-detail');
  }

  const handleViewCountryProfile = (country: Country) => {
    setSelectedCountryProfile(country);
    onNavigate('country-profile');
  }

  const renderContent = () => {
    const allUsers: (ShopUser | SuperUser)[] = [...shopUsers, ...mockSuperUsers];
    switch (activeView) {
      case 'profile':
        return <ProfilePage theme={theme} user={user} setUser={setUser} />;
      case 'settings':
        return <SettingsPage theme={theme} />;
      case 'settings-cameras':
        return <CameraSettingsPage theme={theme} cameraDevices={cameraDevices} setCameraDevices={setCameraDevices} shops={shops} users={allUsers} currentUser={currentUser} />;
      case 'settings-api':
        return <ApiSettingsPage theme={theme} currentUser={currentUser} />;
      case 'settings-calls':
        return <CallSettingsPage theme={theme} allowCalls={allowCalls} setAllowCalls={setAllowCalls} allowMicrophone={allowMicrophone} setAllowMicrophone={setAllowMicrophone} currentUser={currentUser} />;
      case 'id-verification':
        return <IDVerificationPage theme={theme} requests={verificationRequests} setRequests={setVerificationRequests} />;
      case 'stock-listing':
        return <StockListingPage theme={theme} currentUser={currentUser} shops={shops} users={shopUsers} stockItems={stockItems} setStockItems={setStockItems} products={products} setProducts={setProducts} />;
      case 'inventory':
        return <InventoryPage theme={theme} stockItems={stockItems} />;
      case 'stock-purchase':
        return <StockPurchasePage theme={theme} currentUser={currentUser} products={products} />;
      case 'countries':
        return <CountriesPage theme={theme} countries={countries} onAddCountry={onAddCountry} onUpdateCountry={onUpdateCountry} onDeleteCountry={onDeleteCountry} onViewProfile={handleViewCountryProfile} />;
      case 'countries-map':
        return <CountriesMapPage theme={theme} shops={shops} regionalLevels={regionalLevels} countries={countries} />;
      case 'country-admin-levels':
        return <CountryAdminLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'country-electoral-levels':
        return <CountryElectoralLevelsPage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'regional-economic-levels':
        return <RegionalEconomicLevelsPage theme={theme} regionalLevels={regionalLevels} countries={countries} onSave={onSaveRegionalLevel} onDelete={onDeleteRegionalLevel} />;
      case 'country-profile':
        return <CountryProfilePage theme={theme} country={selectedCountryProfile} onNavigate={onNavigate} />;
      case 'shop-users':
        return <ShopUsersPage theme={theme} shopRoles={shopRoles} setVerificationRequests={setVerificationRequests} shopUsers={shopUsers} setShopUsers={setShopUsers} currentUser={currentUser} />;
      case 'super-users':
        return <SuperUsersPage theme={theme} />;
      case 'permissions':
        return <PermissionsPage theme={theme} shopRoles={shopRoles} superUserRoles={superUserRoles} setShopRoles={setShopRoles} setSuperUserRoles={setSuperUserRoles} />;
      case 'roles':
        return <RolesPage theme={theme} shopRoles={shopRoles} superUserRoles={superUserRoles} setShopRoles={setShopRoles} setSuperUserRoles={setSuperUserRoles} shopUsers={shopUsers} setShopUsers={setShopUsers} />;
      case 'shops':
        return <ShopsPage theme={theme} shops={shops} setShops={setShops} onSelectShop={handleViewShopProfile} onViewStatement={handleViewIncomeStatementDetail} countries={countries} users={allUsers} />;
      case 'shop-profile':
        return <ShopProfilePage theme={theme} shop={selectedShop} users={allUsers} onNavigate={onNavigate} userRole={currentUser.role} currentUserId={currentUser.id} />;
      case 'shop-surveillance':
        return <ShopSurveillancePage theme={theme} cameraDevices={cameraDevices} />;
      case 'wallet-settings':
        return <WalletSettingsPage theme={theme} shops={shops} setShops={setShops} />;
      case 'leads':
        return <LeadsPage theme={theme} users={allUsers} />;
      case 'finances-income-statement':
        return <IncomeStatementPage theme={theme} onViewStatement={handleViewIncomeStatementDetail} />;
      case 'finances-balance-sheet':
        return <BalanceSheetPage theme={theme} onSelectShop={handleViewBalanceSheetDetail} />;
      case 'finances-cash-flow':
        return <CashFlowPage theme={theme} onSelectShop={handleViewCashFlowDetail} />;
      case 'income-statement-detail':
        return <IncomeStatementDetailPage theme={theme} shop={selectedShop} onNavigate={onNavigate} />;
      case 'balance-sheet-detail':
        return <BalanceSheetDetailPage theme={theme} shop={selectedShop} onNavigate={onNavigate} />;
      case 'cash-flow-detail':
        return <CashFlowDetailPage shop={selectedShop!} onBack={() => onNavigate('finances-cash-flow')} />;
      case 'reports-messages':
        return <MessagesPage theme={theme} currentUser={currentUser} users={allUsers} shops={shops} countries={countries} trackedKeywords={trackedKeywords} />;
      case 'reports-calls':
        return <ReportsCallsPage theme={theme} callRecords={callRecords} deletedCallRecords={deletedCallRecords} onDeleteCall={onDeleteCall} addCallRecord={addCallRecord} currentUser={currentUser} />;
      case 'reports-daily-sales':
        return <DailySalesPage theme={theme} />;
      case 'reports-stock-level':
        return <StockLevelPage theme={theme} />;
      case 'reports-product-profile':
        return <ProductProfilePage theme={theme} />;
      case 'reports-packet-tracer':
        return <PacketTracerPage theme={theme} />;
      case 'reports-packet-tracer-live':
        return <PacketTracerLivePage theme={theme} />;
      case 'reports-packet-tracer-config':
        return <PacketTracerConfigPage theme={theme} />;
      case 'client-list':
        return <ClientsPage theme={theme} currentUser={currentUser} addCallRecord={addCallRecord} />;
      case 'client-wallets':
        return <ClientWalletsPage theme={theme} shops={shops} currentUser={currentUser} />;
      case 'client-loyalty':
        return <ClientLoyaltyPage theme={theme} />;
      case 'admin-loyalty-mgt':
        return <AdminLoyaltyMgtPage theme={theme} />;
      case 'system-message-settings':
        return <MessageSettingsPage theme={theme} users={mockSuperUsers} shops={shops} countries={countries} trackedKeywords={trackedKeywords} setTrackedKeywords={setTrackedKeywords} />;
      case 'product-chain-products':
        return <ProductsPage theme={theme} onNavigate={onNavigate} products={products} setProducts={setProducts} />;
      case 'product-chain-manufacturers':
        return <ManufacturersPage theme={theme} currentUser={currentUser} />;
      case 'product-chain-distributors':
        return <DistributorsPage theme={theme} currentUser={currentUser} />;
      case 'product-chain-suppliers':
        return <SuppliersPage theme={theme} currentUser={currentUser} shops={shops} />;
      case 'dashboard-system':
        return <SystemUsageDashboard theme={theme} />;
      case 'dashboard-traffic':
        return <TrafficDashboard theme={theme} regionalLevels={regionalLevels} />;
      case 'dashboard-products':
        return <ProductDashboard theme={theme} />;
      case 'dashboard-customer':
        return <CustomerDashboard theme={theme} onNavigate={onNavigate} countries={countries} />;
      case 'customer-purchases':
        return <CustomerPurchasesPage theme={theme} />;
      case 'customer-make-order':
        return <CustomerMakeOrderPage theme={theme} currentUser={currentUser} countries={countries} />;
      case 'customer-loyalty':
        return <CustomerLoyaltyPage theme={theme} />;
      case 'sales-desk':
        return <SalesDesk theme={theme} currentUser={currentUser} onViewSalesHistory={() => onNavigate('reports-daily-sales')} onNavigate={onNavigate} />;
      case 'mobi-agent-settings':
        return <MobiAgentSettingsPage theme={theme} />;
      case 'mno-wallet-settings':
        return <MNOWalletSettingsPage theme={theme} />;
      case 'mno-wallet-transactions':
        return <MNOWalletTransactionsPage theme={theme} />;
      case 'exchange-rate':
        return <ExchangeRatePage theme={theme} countries={countries} onUpdateCountry={onUpdateCountry} />;
      case 'lookup-values':
        return <LookupValuesPage theme={theme} />;
      case 'dashboard':
      case 'dashboard-users':
      default:
        return <Dashboard theme={theme} shopRoles={shopRoles} superUserRoles={superUserRoles} shopUsers={shopUsers} superUsers={mockSuperUsers} notifications={notifications} onNavigate={onNavigate} trackedKeywords={trackedKeywords} userRole={currentUser.role} regionalLevels={regionalLevels} />;
    }
  };

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
       <div className="flex justify-between items-center px-4 py-4 md:px-6 md:py-6 flex-shrink-0 z-10">
        <div className="flex items-center">
          <button onClick={onToggleSidebar} className={`p-2 mr-4 rounded-md transition-all active:scale-95 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
            <Icon name="hamburger" className="h-6 w-6" />
          </button>
          <h1 className={`text-xl md:text-2xl font-semibold truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{t(`header.title.${activeView.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`, titles[activeView] || 'Dashboard')}</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:block">
             <LanguageSelector theme={theme} language={language} onLanguageChange={setLanguage} />
          </div>
          <NotificationDropdown theme={theme} notifications={notifications} setNotifications={setNotifications} />
          <ProfileDropdown theme={theme} user={user} onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto overflow-x-hidden w-full px-4 md:px-6 lg:px-4 pb-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;

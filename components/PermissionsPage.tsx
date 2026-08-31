
import React, { useState, useEffect } from 'react';
import { Theme, PermissionKey, RolePermissionSet, SuperUserPermissionKey, SuperUserRolePermissionSet, Role } from '../types';
import Icon from './Icon';
import AddRoleModal from './AddRoleModal'; 

// Helper to generate default permissions for all keys
const createDefaultPermissions = <K extends string>(keys: K[]): Record<K, boolean> => {
    return keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<K, boolean>);
};

const shopPermissionKeys: PermissionKey[] = [
    'phone_access', 'camera_access', 'personality_view', 'personality_edit', 'profile_edit',
    'finances_income', 'finances_balance', 'finances_cashflow',
    'stock_purchase', 'stock_listing', 'sales_desk',
    'reports_messages', 'reports_calls',
    'dashboard_users', 'dashboard_traffic', 'dashboard_system',
    'id_verification', 'countries_list', 'countries_admin',
    'user_mgt_shop', 'user_mgt_super', 'user_mgt_permissions', 'user_mgt_roles',
    'settings_cameras', 'settings_api', 'settings_calls', 'settings_messages',
    'wallet_view', 'wallet_add_debt', 'wallet_increase_limit', 'wallet_deposit', 'wallet_settings'
];

const superUserPermissionKeys: SuperUserPermissionKey[] = [
    'manageAdmins', 'manageShops', 'viewGlobalReports', 'systemConfiguration', 'manageBilling',
    'phone_access', 'camera_access', 'personality_view', 'personality_edit', 'profile_edit',
    'finances_income', 'finances_balance', 'finances_cashflow',
    'stock_purchase', 'stock_listing', 'sales_desk',
    'reports_messages', 'reports_calls',
    'dashboard_users', 'dashboard_traffic', 'dashboard_system',
    'id_verification', 'countries_list', 'countries_admin',
    'user_mgt_shop', 'user_mgt_super', 'user_mgt_permissions', 'user_mgt_roles',
    'settings_cameras', 'settings_api', 'settings_calls', 'settings_messages',
    'wallet_view', 'wallet_add_debt', 'wallet_increase_limit', 'wallet_deposit', 'wallet_settings'
];

// Initial Roles with defaults (mock)
const initialShopPermissions: RolePermissionSet[] = [
  { role: 'Manager', permissions: { ...createDefaultPermissions(shopPermissionKeys), stock_purchase: true, stock_listing: true, sales_desk: true, reports_messages: true, reports_calls: true, finances_income: true, profile_edit: true, phone_access: true, camera_access: true, wallet_view: true, wallet_add_debt: true, wallet_increase_limit: true, wallet_deposit: true, wallet_settings: true } },
  { role: 'Cashier', permissions: { ...createDefaultPermissions(shopPermissionKeys), sales_desk: true, reports_messages: true, profile_edit: true, phone_access: true, wallet_view: true, wallet_deposit: true, wallet_add_debt: true } },
  { role: 'Stocker', permissions: { ...createDefaultPermissions(shopPermissionKeys), stock_purchase: true, stock_listing: true, profile_edit: true } },
];

const initialSuperUserPermissions: SuperUserRolePermissionSet[] = [
  { role: 'Administrator', permissions: { ...createDefaultPermissions(superUserPermissionKeys), manageAdmins: true, manageShops: true, viewGlobalReports: true, systemConfiguration: true, manageBilling: true, dashboard_users: true, dashboard_traffic: true, dashboard_system: true, user_mgt_shop: true, user_mgt_super: true, user_mgt_permissions: true, user_mgt_roles: true, countries_list: true, countries_admin: true, settings_cameras: true, settings_api: true, settings_calls: true, settings_messages: true, id_verification: true, phone_access: true, camera_access: true, wallet_view: true, wallet_add_debt: true, wallet_increase_limit: true, wallet_deposit: true, wallet_settings: true } },
  { role: 'Auditor', permissions: { ...createDefaultPermissions(superUserPermissionKeys), viewGlobalReports: true, finances_income: true, finances_balance: true, finances_cashflow: true, reports_messages: true, reports_calls: true, dashboard_users: true, dashboard_traffic: true, wallet_view: true } },
  { role: 'Regional Manager', permissions: { ...createDefaultPermissions(superUserPermissionKeys), manageShops: true, viewGlobalReports: true, stock_listing: true, sales_desk: true, reports_messages: true, reports_calls: true, dashboard_users: true, phone_access: true, wallet_view: true, wallet_deposit: true } },
];

const functionLabels: Record<string, string> = {
  // Core Access
  phone_access: 'VOIP Hotline Communication',
  camera_access: 'Border Crossing Cameras',
  // Profile & Personality
  personality_view: 'View Contributor bio & personality',
  personality_edit: 'Edit Contributor bio & personality',
  profile_edit: 'Edit Contributor Account Profile',
  // Finances
  finances_income: 'Budgeting: Regional Income & Grants',
  finances_balance: 'Budgeting: Assets & Deficits',
  finances_cashflow: 'Budgeting: Funds disbursement log',
  // Stock
  stock_purchase: 'Registry database: New Entries',
  stock_listing: 'Registry database: View Location entries',
  // Sales
  sales_desk: 'System Administration Access',
  // Reports & Comms
  reports_messages: 'Citizen Support Rooms & Chat',
  reports_calls: 'VOIP Hotline Call Logs',
  // Dashboard
  dashboard_users: 'Dashboards: Regional demographics',
  dashboard_traffic: 'Dashboards: Search & Registry Traffic',
  dashboard_system: 'Dashboards: Registry Server status',
  // Admin / Verification
  id_verification: 'Passport & National ID Verification',
  // Countries
  countries_list: 'Global Countries List',
  countries_admin: 'Administrative Sub-levels Configuration',
  // Users
  user_mgt_shop: 'User Management: Country Users',
  user_mgt_super: 'User Management: Registry Officers',
  user_mgt_permissions: 'User Management: Access Control Matrix',
  user_mgt_roles: 'User Management: Role Configuration',
  // Settings
  settings_cameras: 'Border CCTV feed Integration',
  settings_api: 'Location Register REST API Settings',
  settings_calls: 'SIP Hotline System Setup',
  settings_messages: 'Registry Notification Templates',
  // Wallet Management
  wallet_view: 'Contributor wallets: Verify status',
  wallet_add_debt: 'Contributor wallets: Allocate query credits',
  wallet_increase_limit: 'Contributor wallets: Credit limits setup',
  wallet_deposit: 'Contributor wallets: Deposit currency',
  wallet_settings: 'Contributor wallets: Payment rules',
  // Super User Specific
  manageAdmins: 'Super: Manage Regional Admins',
  manageShops: 'Super: Manage Sovereign Countries',
  viewGlobalReports: 'Super: Global Telemetry & Population reports',
  systemConfiguration: 'Super: Platform Database schema',
  manageBilling: 'Super: Registry Access subscriptions',
};

interface PermissionsPageProps {
  theme: Theme;
  shopRoles: Role[];
  superUserRoles: Role[];
  setShopRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  setSuperUserRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

const PermissionsPage: React.FC<PermissionsPageProps> = ({ theme, shopRoles, superUserRoles, setShopRoles, setSuperUserRoles }) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'super'>('shop');
  const [shopPermissions, setShopPermissions] = useState<RolePermissionSet[]>(initialShopPermissions);
  const [superUserPermissions, setSuperUserPermissions] = useState<SuperUserRolePermissionSet[]>(initialSuperUserPermissions);
  const [isDirty, setIsDirty] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

  useEffect(() => {
    // Sync permissions state with roles from props if new roles added
    setShopPermissions(prev => {
        const existingRoles = new Set(prev.map(p => p.role));
        const newRolesToAdd = shopRoles
            .filter(r => !existingRoles.has(r.name))
            .map(r => ({ role: r.name, permissions: createDefaultPermissions(shopPermissionKeys) }));
        return [...prev, ...newRolesToAdd];
    });
    setSuperUserPermissions(prev => {
        const existingRoles = new Set(prev.map(p => p.role));
        const newRolesToAdd = superUserRoles
            .filter(r => !existingRoles.has(r.name))
            .map(r => ({ role: r.name, permissions: createDefaultPermissions(superUserPermissionKeys) }));
        return [...prev, ...newRolesToAdd];
    });
  }, [shopRoles, superUserRoles]);

  const handleShopPermissionChange = (role: string, funcKey: PermissionKey, value: boolean) => {
    setShopPermissions(prev => prev.map(p => p.role === role ? { ...p, permissions: { ...p.permissions, [funcKey]: value } } : p));
    setIsDirty(true);
  };

  const handleSuperUserPermissionChange = (role: string, funcKey: SuperUserPermissionKey, value: boolean) => {
    setSuperUserPermissions(prev => prev.map(p => p.role === role ? { ...p, permissions: { ...p.permissions, [funcKey]: value } } : p));
    setIsDirty(true);
  };

  const handleAddRole = (newRoleData: Omit<Role, 'id'>) => {
    if (newRoleData.userType === 'Shop User') {
        setShopRoles(prev => {
            const newId = (prev.length > 0 ? Math.max(...prev.map(r => r.id)) : 0) + 1;
            return [...prev, { ...newRoleData, id: newId }];
        });
    } else {
        setSuperUserRoles(prev => {
            const newId = (prev.length > 0 ? Math.max(...prev.map(r => r.id)) : 100) + 1;
            return [...prev, { ...newRoleData, id: newId }];
        });
    }
  };

  const handleSaveChanges = () => {
    // In a real app, this would make an API call.
    // For now, we just reset the dirty state.
    console.log("Saving permissions...");
    setIsDirty(false);
  };

  const TabButton: React.FC<{ tab: 'shop' | 'super'; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab 
          ? 'bg-yellow-500 text-slate-900'
          : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
    <AddRoleModal isOpen={isAddRoleModalOpen} onClose={() => setIsAddRoleModalOpen(false)} onSave={handleAddRole} theme={theme} />
    <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm flex flex-col h-full`}>
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Role Permissions</h2>
                 <button onClick={() => setIsAddRoleModalOpen(true)} className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600">
                    <Icon name="user-mgt" className="h-4 w-4" />
                    <span>Add New Role</span>
                </button>
            </div>
          <div className={`p-1 rounded-lg flex space-x-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <TabButton tab="shop" label="Country Users" />
            <TabButton tab="super" label="Super Users" />
          </div>
        </div>
      </div>

      <div className="p-0 flex-grow overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          {activeTab === 'shop' ? (
            <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
              <thead className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} sticky top-0 z-10`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Function</th>
                  {shopPermissions.map(p => <th key={p.role} scope="col" className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{p.role}</th>)}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {shopPermissionKeys.map(funcKey => (
                  <tr key={funcKey} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-normal ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{functionLabels[funcKey] || funcKey}</td>
                    {shopPermissions.map(p => (
                      <td key={`${p.role}-${funcKey}`} className="px-6 py-4 text-center">
                        <input 
                            type="checkbox" 
                            checked={p.permissions[funcKey] || false} 
                            onChange={(e) => handleShopPermissionChange(p.role, funcKey, e.target.checked)} 
                            className={`h-5 w-5 rounded cursor-pointer accent-yellow-500 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'}`} 
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
              <thead className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} sticky top-0 z-10`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Function</th>
                  {superUserPermissions.map(p => <th key={p.role} scope="col" className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{p.role}</th>)}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {superUserPermissionKeys.map(funcKey => (
                  <tr key={funcKey} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-normal ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{functionLabels[funcKey] || funcKey}</td>
                    {superUserPermissions.map(p => (
                      <td key={`${p.role}-${funcKey}`} className="px-6 py-4 text-center">
                        <input 
                            type="checkbox" 
                            checked={p.permissions[funcKey] || false} 
                            onChange={(e) => handleSuperUserPermissionChange(p.role, funcKey, e.target.checked)} 
                            className={`h-5 w-5 rounded cursor-pointer accent-yellow-500 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'}`} 
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isDirty && (
        <div className={`flex-shrink-0 p-4 border-t flex justify-end ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default PermissionsPage;

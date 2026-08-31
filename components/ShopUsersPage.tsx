import React, { useState, useMemo } from 'react';
import { Theme, ShopUser, IDVerificationRequest, Role, User } from '../types';
import Icon, { IconName } from './Icon';
import AddUserModal from './AddUserModal';
import ViewUserModal from './ViewUserModal';
import EditUserModal from './EditUserModal';
import ResetPasswordModal from './ResetPasswordModal';
import TerminateUserModal from './TerminateUserModal';
import ReactivateUserModal from './ReactivateUserModal';

const SummaryCard: React.FC<{ icon: IconName; title: string; value: string; theme: Theme }> = ({ icon, title, value, theme }) => {
    const iconContainerClasses = theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100';
    const iconClasses = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    
    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
            <div className={`p-3 rounded-full mr-4 ${iconContainerClasses}`}>
                <Icon name={icon} className={`h-6 w-6 ${iconClasses}`} />
            </div>
            <div>
                <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
};

const Avatar: React.FC<{ user: ShopUser }> = ({ user }) => {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    if (user.avatar) {
        return <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt={user.name} />;
    }
    return (
        <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-slate-800 text-xs font-bold">
            {initials}
        </div>
    );
};


interface ShopUsersPageProps {
  theme: Theme;
  shopRoles: Role[];
  setVerificationRequests: React.Dispatch<React.SetStateAction<IDVerificationRequest[]>>;
  shopUsers: ShopUser[];
  setShopUsers: React.Dispatch<React.SetStateAction<ShopUser[]>>;
  currentUser: User;
}

const ShopUsersPage: React.FC<ShopUsersPageProps> = ({ theme, shopRoles, setVerificationRequests, shopUsers, setShopUsers, currentUser }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // FIX: Renamed state variable for consistency and to address reported error.
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'terminated'>('active');
  
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [shopFilter, setShopFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 10;

  const handleActionClick = (user: ShopUser, action: 'view' | 'edit' | 'reset' | 'terminate' | 'reactivate') => {
    setSelectedUser(user);
    // FIX: Use renamed state setter.
    if (action === 'view') setIsViewUserModalOpen(true);
    if (action === 'edit') setIsEditModalOpen(true);
    if (action === 'reset') setIsResetModalOpen(true);
    if (action === 'terminate') setIsTerminateModalOpen(true);
    if (action === 'reactivate') setIsReactivateModalOpen(true);
  };

  const handleSaveUser = (newUser: Omit<ShopUser, 'id' | 'history' | 'status' | 'createdBy' | 'userType'>) => {
    setShopUsers(prev => {
        const newId = Math.max(...prev.map(u => u.id), 0) + 1;
        const userToAdd: ShopUser = {
            ...newUser,
            id: newId,
            status: 'Active',
            lastActivity: new Date().toISOString(),
            gender: 'Prefer not to say', // Default gender
            createdBy: currentUser.name,
            userType: 'Shop User',
            history: [{ date: new Date().toISOString(), action: 'Created', details: `User account created by ${currentUser.name}.` }],
        };
        return [userToAdd, ...prev];
    });

    setVerificationRequests(prev => {
        const newVerificationId = Math.max(...prev.map(r => r.id), 0) + 1;
        const newRequest: IDVerificationRequest = {
            id: newVerificationId,
            serial: `IV-${String(newVerificationId).padStart(3, '0')}`,
            userName: newUser.name,
            submissionDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            shopName: newUser.shop.join(', '),
            idType: newUser.idType,
            idNumber: newUser.idNumber,
            idDocument: { front: null, back: null },
            selfie: null,
        };
        return [newRequest, ...prev];
    });
  };

  const handleUpdateUser = (updatedUser: ShopUser) => {
    setShopUsers(prev => prev.map(u => u.id === updatedUser.id ? {
        ...updatedUser,
        history: [{ date: new Date().toISOString(), action: 'Updated', details: 'User profile updated.' }, ...u.history]
    } : u));
  };
  
  const handleTerminateUser = (details: { remarks: string; averageRating: number }) => {
    if (!selectedUser) return;
    setShopUsers(prev => prev.map(u => u.id === selectedUser.id ? {
        ...u,
        status: 'Terminated',
        shop: [],
        averageRating: u.averageRating ? Number(((u.averageRating + details.averageRating) / 2).toFixed(1)) : details.averageRating,
        history: [
            { date: new Date().toISOString(), action: 'Terminated', details: `User access has been terminated by ${currentUser.name}.` },
            { date: new Date().toISOString(), action: 'Rated', details: `Exit Review from ${u.shop.join(', ')}. Rated ${details.averageRating.toFixed(1)}/5. Remarks: ${details.remarks}. Rated by: ${currentUser.name}.` },
            ...u.history
        ]
    } : u));
    setIsTerminateModalOpen(false);
  };

  const handleReactivateUser = (userToReactivate: ShopUser, newShops: string[]) => {
    setShopUsers(prev => prev.map(u => u.id === userToReactivate.id ? {
        ...u,
        status: 'Active',
        shop: newShops,
        lastActivity: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), action: 'Updated', details: `User reactivated and assigned to: ${newShops.join(', ')}.` }, ...u.history]
    } : u));
    setIsReactivateModalOpen(false);
  };
  
  const uniqueShops = useMemo(() => [...new Set(shopUsers.flatMap(u => u.shop))].sort(), [shopUsers]);
  const uniqueCreators = useMemo(() => [...new Set(shopUsers.map(u => u.createdBy))].sort(), [shopUsers]);
  
  const summaryData = useMemo(() => {
    const now = new Date();
    const threeDaysAgo = new Date(new Date().setDate(now.getDate() - 3));
    let active = 0;
    let inactive = 0;
    
    shopUsers.forEach(user => {
      if (user.status === 'Active') {
        if (new Date(user.lastActivity) >= threeDaysAgo) {
          active++;
        } else {
          inactive++;
        }
      }
    });
    return {
      total: shopUsers.filter(u => u.status !== 'Terminated').length,
      active,
      inactive,
      terminated: shopUsers.filter(u => u.status === 'Terminated').length,
    }
  }, [shopUsers]);

  const activeShopUsers = useMemo(() => shopUsers.filter(u => u.status !== 'Terminated'), [shopUsers]);
  const terminatedShopUsers = useMemo(() => shopUsers.filter(u => u.status === 'Terminated'), [shopUsers]);
  
  const filteredUsers = useMemo(() => {
      const source = activeTab === 'active' ? activeShopUsers : terminatedShopUsers;
      return source.filter(user => {
          const searchTermLower = searchTerm.toLowerCase();
          const matchesSearch = searchTermLower === '' ||
              user.name.toLowerCase().includes(searchTermLower) ||
              user.email.toLowerCase().includes(searchTermLower);
          
          if(activeTab === 'terminated') return matchesSearch;

          const matchesStatus = statusFilter === '' || (
            statusFilter === 'Active' ? user.status === 'Active' && new Date(user.lastActivity) >= new Date(new Date().setDate(new Date().getDate() - 3)) :
            statusFilter === 'Inactive' ? user.status === 'Active' && new Date(user.lastActivity) < new Date(new Date().setDate(new Date().getDate() - 3)) :
            user.status === statusFilter
          );
          const matchesRole = roleFilter === '' || user.role === roleFilter;
          const matchesShop = shopFilter === '' || user.shop.includes(shopFilter);
          const matchesCreator = creatorFilter === '' || user.createdBy === creatorFilter;
          const matchesUserType = userTypeFilter === '' || user.userType === userTypeFilter;

          return matchesSearch && matchesStatus && matchesRole && matchesShop && matchesCreator && matchesUserType;
      });
  }, [activeShopUsers, terminatedShopUsers, searchTerm, statusFilter, roleFilter, shopFilter, creatorFilter, userTypeFilter, activeTab]);

  const totalPages = Math.ceil(filteredUsers.length / RECORDS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * RECORDS_PER_PAGE, currentPage * RECORDS_PER_PAGE);

  const handleResetFilters = () => {
    setStatusFilter(''); setRoleFilter(''); setShopFilter(''); setSearchTerm(''); setCurrentPage(1); setCreatorFilter(''); setUserTypeFilter('');
  };

  const getStatus = (user: ShopUser) => {
    if (user.status === 'Terminated') return { text: 'Terminated', classes: theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800' };
    const threeDaysAgo = new Date(new Date().setDate(new Date().getDate() - 3));
    if (new Date(user.lastActivity) < threeDaysAgo) {
      return { text: 'Dormant', classes: theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Active', classes: theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800' };
  };

  const Tab: React.FC<{ name: 'active' | 'terminated'; label: string; count: number; }> = ({ name, label, count }) => (
    <button onClick={() => { setActiveTab(name); setCurrentPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 ${activeTab === name ? 'border-yellow-500 text-yellow-500' : `border-transparent ${theme==='dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}`}>
        {label} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === name ? (theme==='dark' ? 'bg-yellow-500/10' : 'bg-yellow-100') : (theme==='dark' ? 'bg-slate-700' : 'bg-slate-200')}`}>{count}</span>
    </button>
  );

  return (
    <>
      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveUser} theme={theme} shopRoles={shopRoles} />
      {/* FIX: Use renamed state variables for ViewUserModal */}
      <ViewUserModal isOpen={isViewUserModalOpen} onClose={() => setIsViewUserModalOpen(false)} user={selectedUser} theme={theme} />
      <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdateUser} userToEdit={selectedUser} theme={theme} shopRoles={shopRoles} />
      <ResetPasswordModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} user={selectedUser} theme={theme} />
      <TerminateUserModal isOpen={isTerminateModalOpen} onClose={() => setIsTerminateModalOpen(false)} user={selectedUser} theme={theme} onConfirm={handleTerminateUser} />
      <ReactivateUserModal isOpen={isReactivateModalOpen} onClose={() => setIsReactivateModalOpen(false)} user={selectedUser} theme={theme} onReactivate={handleReactivateUser} availableShops={uniqueShops} />

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard theme={theme} icon="user-mgt" title="Total Active Users" value={summaryData.total.toString()} />
            <SummaryCard theme={theme} icon="check-circle" title="Online Users" value={summaryData.active.toString()} />
            <SummaryCard theme={theme} icon="exclamation-triangle" title="Dormant Users" value={summaryData.inactive.toString()} />
            <SummaryCard theme={theme} icon="delete" title="Blocked Users" value={summaryData.terminated.toString()} />
        </div>

        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border`}>
            <div className="p-4 border-b border-transparent">
                <div className="flex justify-between items-center">
                    <nav className="flex space-x-2">
                        <Tab name="active" label="Active Users" count={activeShopUsers.length} />
                        <Tab name="terminated" label="Terminated Users" count={terminatedShopUsers.length} />
                    </nav>
                    <button onClick={() => setIsFilterVisible(!isFilterVisible)} className={`p-2 rounded-md ${theme==='dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                        <Icon name="filter" className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                </div>
            </div>
            {isFilterVisible && (
                <div className={`border-t p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                         <div className={activeTab === 'terminated' ? 'opacity-50' : ''}>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} disabled={activeTab === 'terminated'} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} disabled:cursor-not-allowed`}>
                                <option value="">All</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Dormant</option>
                            </select>
                        </div>
                        <div className={activeTab === 'terminated' ? 'opacity-50' : ''}>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Role</label>
                            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} disabled={activeTab === 'terminated'} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} disabled:cursor-not-allowed`}>
                                <option value="">All</option>
                                {shopRoles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                            </select>
                        </div>
                        <div className={activeTab === 'terminated' ? 'opacity-50' : ''}>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Shop</label>
                            <select value={shopFilter} onChange={e => setShopFilter(e.target.value)} disabled={activeTab === 'terminated'} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} disabled:cursor-not-allowed`}>
                                <option value="">All</option>
                                {uniqueShops.map(shop => <option key={shop} value={shop}>{shop}</option>)}
                            </select>
                        </div>
                        <div className={activeTab === 'terminated' ? 'opacity-50' : ''}>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>User Type</label>
                            <select value={userTypeFilter} onChange={e => setUserTypeFilter(e.target.value)} disabled={activeTab === 'terminated'} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} disabled:cursor-not-allowed`}>
                                <option value="">All</option>
                                <option value="Shop User">Shop User</option>
                            </select>
                        </div>
                        <div className={activeTab === 'terminated' ? 'opacity-50' : ''}>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Created By</label>
                            <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)} disabled={activeTab === 'terminated'} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} disabled:cursor-not-allowed`}>
                                <option value="">All</option>
                                {uniqueCreators.map(creator => <option key={creator} value={creator}>{creator}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button onClick={handleResetFilters} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                            <Icon name="refresh" className="h-4 w-4" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm`}>
            <div className="p-4 flex justify-between items-center">
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="search" className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`block w-full pl-10 pr-3 py-2 border rounded-md sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-slate-300 bg-white text-slate-900'}`} />
                </div>
                {activeTab === 'active' && <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600"><Icon name="client-mgt" className="h-4 w-4" /><span>Add User</span></button>}
            </div>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                  <tr>
                    {['Name', 'Email', ...(activeTab === 'active' ? ['Shop(s)'] : []), 'Role', 'Created By', 'Avg. Rating', 'Status', 'Actions'].map((header) => (
                      <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                  {paginatedUsers.map((user) => {
                    const status = getStatus(user);
                    return (
                      <tr key={user.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-8 w-8 mr-3"><Avatar user={user} /></div><div className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</div></div></td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</td>
                        {activeTab === 'active' && <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.shop.join(', ')}</td>}
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.createdBy}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {user.averageRating ? (
                                <div className="flex items-center">
                                    <Icon name="star" className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span>{user.averageRating.toFixed(1)}</span>
                                </div>
                            ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.classes}`}>{status.text}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {activeTab === 'active' ? (
                            <div className="flex items-center space-x-4">
                                <button onClick={() => handleActionClick(user, 'view')} title="View Details" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}><Icon name="view" className="h-5 w-5"/></button>
                                <button onClick={() => handleActionClick(user, 'edit')} title="Edit User" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}><Icon name="edit" className="h-5 w-5"/></button>
                                <button onClick={() => handleActionClick(user, 'reset')} title="Reset Password" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}><Icon name="key" className="h-5 w-5"/></button>
                                {user.status !== 'Terminated' && <button onClick={() => handleActionClick(user, 'terminate')} title="Terminate Access" className={`${theme === 'dark' ? 'text-slate-500 hover:text-red-500' : 'text-slate-400 hover:text-red-600'}`}><Icon name="delete" className="h-5 w-5"/></button>}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-4">
                               <button onClick={() => handleActionClick(user, 'view')} title="View Details" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}><Icon name="view" className="h-5 w-5"/></button>
                               <button onClick={() => handleActionClick(user, 'reactivate')} title="Reactivate User" className={`${theme === 'dark' ? 'text-slate-500 hover:text-green-500' : 'text-slate-400 hover:text-green-600'}`}><Icon name="refresh" className="h-5 w-5"/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 flex justify-between items-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Showing {paginatedUsers.length > 0 ? (currentPage - 1) * RECORDS_PER_PAGE + 1 : 0} to {Math.min(currentPage * RECORDS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users</p>
              {totalPages > 1 && (<nav className="flex items-center space-x-1"><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className={`p-2 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Icon name="chevron-left" className="h-5 w-5" /></button>{[...Array(totalPages).keys()].map(n => <button key={n} onClick={() => setCurrentPage(n + 1)} className={`px-3 py-1 rounded-md text-sm ${currentPage === n + 1 ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200')}`}>{n + 1}</button>)}<button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Icon name="chevron-right" className="h-5 w-5" /></button></nav>)}
            </div>
        </div>
      </div>
    </>
  );
};

export default ShopUsersPage;
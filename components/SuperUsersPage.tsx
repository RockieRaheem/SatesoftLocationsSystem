
import React, { useState, useMemo } from 'react';
import { Theme, SuperUser, Role, User } from '../types';
import Icon, { IconName } from './Icon';
import { mockSuperUsers } from '../data';
import ViewUserModal from './ViewUserModal';
import EditUserModal from './EditUserModal';
import TerminateUserModal from './TerminateUserModal';

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

const Avatar: React.FC<{ user: SuperUser }> = ({ user }) => {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    if (user.avatar) {
        return <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt={user.name} />;
    }
    return (
        <div className="h-8 w-8 rounded-full bg-purple-400 flex items-center justify-center text-slate-800 text-xs font-bold">
            {initials}
        </div>
    );
};

interface SuperUsersPageProps {
    theme: Theme;
}

const SuperUsersPage: React.FC<SuperUsersPageProps> = ({ theme }) => {
    // Note: ideally this state should be lifted to App.tsx to persist across navigation, 
    // similar to shopUsers, but for this component demonstration we use local state initialized with mock data.
    const [superUsers, setSuperUsers] = useState<SuperUser[]>(mockSuperUsers);
    const [selectedUser, setSelectedUser] = useState<SuperUser | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
    
    // Filter States
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const RECORDS_PER_PAGE = 10;

    const uniqueRoles = useMemo(() => [...new Set(superUsers.map(u => u.role))].sort(), [superUsers]);
    
    const summaryData = useMemo(() => {
        const active = superUsers.filter(u => u.status === 'Active').length;
        const terminated = superUsers.filter(u => u.status === 'Terminated').length;
        return {
            total: superUsers.length,
            active,
            terminated
        };
    }, [superUsers]);

    const filteredUsers = useMemo(() => {
        return superUsers.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter ? user.role === roleFilter : true;
            const matchesStatus = statusFilter ? user.status === statusFilter : true;
            
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [superUsers, searchTerm, roleFilter, statusFilter]);

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * RECORDS_PER_PAGE, currentPage * RECORDS_PER_PAGE);
    const totalPages = Math.ceil(filteredUsers.length / RECORDS_PER_PAGE);

    const handleAction = (user: SuperUser, action: 'view' | 'edit' | 'terminate') => {
        setSelectedUser(user);
        if (action === 'view') setIsViewModalOpen(true);
        if (action === 'edit') setIsEditModalOpen(true);
        if (action === 'terminate') setIsTerminateModalOpen(true);
    };
    
    // Since EditUserModal expects ShopUser, we cast the type here as they share the structure now
    const handleUpdateUser = (updatedUser: any) => {
         setSuperUsers(prev => prev.map(u => u.id === updatedUser.id ? {
             ...updatedUser,
             history: [{ date: new Date().toISOString(), action: 'Updated', details: 'User profile updated.' }, ...u.history]
         } : u));
    };

    const handleTerminateUser = (details: { remarks: string; averageRating: number }) => {
        if (!selectedUser) return;
        setSuperUsers(prev => prev.map(u => u.id === selectedUser.id ? {
            ...u,
            status: 'Terminated',
            averageRating: u.averageRating ? Number(((u.averageRating + details.averageRating) / 2).toFixed(1)) : details.averageRating,
            history: [
                { date: new Date().toISOString(), action: 'Terminated', details: `User access has been terminated. Remarks: ${details.remarks}` },
                { date: new Date().toISOString(), action: 'Rated', details: `Exit Review. Rated ${details.averageRating.toFixed(1)}/5. Remarks: ${details.remarks}.` },
                ...u.history
            ]
        } : u));
        setIsTerminateModalOpen(false);
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {
        const classes = status === 'Active' 
            ? (theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800')
            : status === 'Terminated'
            ? (theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800')
            : (theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800');
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes}`}>{status}</span>;
    };

    return (
        <>
             {/* Type casting logic reused from ShopUsersPage for compatibility */}
            <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser as any} theme={theme} />
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdateUser} userToEdit={selectedUser as any} theme={theme} shopRoles={[]} /> 
            <TerminateUserModal isOpen={isTerminateModalOpen} onClose={() => setIsTerminateModalOpen(false)} onConfirm={handleTerminateUser} user={selectedUser as any} theme={theme} />

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard theme={theme} icon="user-circle" title="Total Super Users" value={summaryData.total.toString()} />
                    <SummaryCard theme={theme} icon="check-circle" title="Active" value={summaryData.active.toString()} />
                    <SummaryCard theme={theme} icon="delete" title="Terminated" value={summaryData.terminated.toString()} />
                </div>

                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border`}>
                    <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsFilterVisible(!isFilterVisible)}>
                         <div className="flex items-center">
                            <Icon name="filter" className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                            <h2 className="font-semibold">Filters</h2>
                        </div>
                        <Icon name="chevron-down" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
                    </div>
                    {isFilterVisible && (
                        <div className={`border-t p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Search</label>
                                    <div className="relative">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="search" className="h-4 w-4 text-gray-400" /></div>
                                         <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Name or Email..." className={`block w-full pl-9 pr-3 py-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Role</label>
                                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`block w-full px-3 py-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}>
                                        <option value="">All Roles</option>
                                        {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`block w-full px-3 py-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}>
                                        <option value="">All Statuses</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Terminated">Terminated</option>
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

                <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                            {['Name', 'Email', 'Role', 'Last Activity', 'Status', 'Actions'].map((header) => (
                                <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                {header}
                                </th>
                            ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {paginatedUsers.map((user) => (
                            <tr key={user.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 mr-3"><Avatar user={user} /></div>
                                        <div className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</div>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(user.lastActivity).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {getStatusBadge(user.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleAction(user, 'view')} title="View Details" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}><Icon name="view" className="h-5 w-5"/></button>
                                        <button onClick={() => handleAction(user, 'edit')} title="Edit User" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}><Icon name="edit" className="h-5 w-5"/></button>
                                        {user.status !== 'Terminated' && <button onClick={() => handleAction(user, 'terminate')} title="Terminate Access" className={`${theme === 'dark' ? 'text-slate-500 hover:text-red-500' : 'text-slate-400 hover:text-red-600'}`}><Icon name="delete" className="h-5 w-5"/></button>}
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                         <div className="p-4 flex justify-between items-center border-t border-transparent mt-2">
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Showing {paginatedUsers.length > 0 ? (currentPage - 1) * RECORDS_PER_PAGE + 1 : 0} to {Math.min(currentPage * RECORDS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users</p>
                            <nav className="flex items-center space-x-1">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className={`p-2 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Icon name="chevron-left" className="h-5 w-5" /></button>
                                {[...Array(totalPages).keys()].map(n => <button key={n} onClick={() => setCurrentPage(n + 1)} className={`px-3 py-1 rounded-md text-sm ${currentPage === n + 1 ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200')}`}>{n + 1}</button>)}
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Icon name="chevron-right" className="h-5 w-5" /></button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SuperUsersPage;

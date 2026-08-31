import React, { useState, useMemo } from 'react';
import { Theme, Role, ShopUser, SuperUser } from '../types';
import Icon from './Icon';
import AddRoleModal from './AddRoleModal';
import { mockSuperUsers } from '../data';
import ConfirmationModal from './ConfirmationModal';
import ViewRoleUsersModal from './ViewRoleUsersModal';
import ViewUserModal from './ViewUserModal';
import EditUserModal from './EditUserModal';

interface RolesPageProps {
  theme: Theme;
  shopRoles: Role[];
  superUserRoles: Role[];
  setShopRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  setSuperUserRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  shopUsers: ShopUser[];
  setShopUsers: React.Dispatch<React.SetStateAction<ShopUser[]>>;
}

const RolesPage: React.FC<RolesPageProps> = ({ theme, shopRoles, superUserRoles, setShopRoles, setSuperUserRoles, shopUsers, setShopUsers }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [viewingRole, setViewingRole] = useState<Role | null>(null);

    const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
    const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

    const allRoles = useMemo(() => [...shopRoles, ...superUserRoles].sort((a,b) => a.name.localeCompare(b.name)), [shopRoles, superUserRoles]);

    const userCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        shopUsers.forEach(user => {
            counts[user.role] = (counts[user.role] || 0) + 1;
        });
        mockSuperUsers.forEach(user => {
            counts[user.role] = (counts[user.role] || 0) + 1;
        });
        return counts;
    }, [shopUsers]);

    const handleSaveRole = (newRoleData: Omit<Role, 'id'>) => {
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

    const handleDeleteRole = () => {
        if (!roleToDelete) return;
        if (roleToDelete.userType === 'Shop User') {
            setShopRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
        } else {
            setSuperUserRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
        }
        setRoleToDelete(null);
    };

    const handleViewUser = (user: ShopUser | SuperUser) => {
        // SuperUser not fully editable/viewable yet, only allow ShopUser
        if ('shop' in user) {
            setSelectedUser(user);
            setIsViewUserModalOpen(true);
            setViewingRole(null);
        }
    }

    const handleEditUser = (user: ShopUser | SuperUser) => {
        if ('shop' in user) {
            setSelectedUser(user);
            setIsEditUserModalOpen(true);
            setViewingRole(null);
        }
    }

    const handleUpdateUser = (updatedUser: ShopUser) => {
        setShopUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };
    
    return (
        <>
            <AddRoleModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveRole} theme={theme} />
            <ConfirmationModal isOpen={!!roleToDelete} onClose={() => setRoleToDelete(null)} onConfirm={handleDeleteRole} title="Delete Role" message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This might affect users currently assigned to this role.`} theme={theme} intent="danger" confirmText="Delete Role" />
            <ViewRoleUsersModal isOpen={!!viewingRole} onClose={() => setViewingRole(null)} role={viewingRole} theme={theme} users={[...shopUsers, ...mockSuperUsers]} onViewUser={handleViewUser} onEditUser={handleEditUser} />
            <ViewUserModal isOpen={isViewUserModalOpen} onClose={() => setIsViewUserModalOpen(false)} user={selectedUser} theme={theme} />
            <EditUserModal isOpen={isEditUserModalOpen} onClose={() => setIsEditUserModalOpen(false)} onUpdate={handleUpdateUser} userToEdit={selectedUser} theme={theme} shopRoles={shopRoles} />
            
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>User Roles</h2>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600">
                        <Icon name="user-mgt" className="h-4 w-4" />
                        <span>Add New Role</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                        <tr>
                            {['Role Name', 'User Type', 'Description', 'Users', 'Actions'].map((header) => (
                            <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                {header}
                            </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {allRoles.map((role) => {
                                const count = userCounts[role.name] || 0;
                                return (
                                <tr key={role.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{role.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.userType === 'Shop User' ? (theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800') : (theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-800')}`}>
                                            {role.userType === 'Shop User' ? 'Country User' : role.userType}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{role.description || '-'}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <button onClick={() => count > 0 && setViewingRole(role)} disabled={count === 0} className={`font-medium ${count > 0 ? (theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700') : 'text-slate-500'} disabled:cursor-not-allowed`}>
                                            {count}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button title="Edit Role" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-blue-500`}><Icon name="edit" className="h-5 w-5"/></button>
                                            <button onClick={() => setRoleToDelete(role)} title="Delete Role" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-red-500`}><Icon name="delete" className="h-5 w-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default RolesPage;
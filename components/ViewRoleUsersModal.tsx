import React, { useState, useEffect } from 'react';
import { Role, ShopUser, SuperUser, Theme } from '../types';
import Icon from './Icon';

interface ViewRoleUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  theme: Theme;
  users: (ShopUser | SuperUser)[];
  onViewUser: (user: ShopUser | SuperUser) => void;
  onEditUser: (user: ShopUser | SuperUser) => void;
}

const Avatar: React.FC<{ user: ShopUser | SuperUser }> = ({ user }) => {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    if ('avatar' in user && user.avatar) {
        return <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt={user.name} />;
    }
    return (
        <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-slate-800 text-xs font-bold">
            {initials}
        </div>
    );
};


const ViewRoleUsersModal: React.FC<ViewRoleUsersModalProps> = ({ isOpen, onClose, role, theme, users, onViewUser, onEditUser }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen && !isClosing || !role) return null;
    
    const roleUsers = users.filter(u => u.role === role.name);

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Users with Role: {role.name}</h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{roleUsers.length} user(s) found</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-2 sm:p-6 overflow-y-auto">
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Name</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                {roleUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 mr-3"><Avatar user={user} /></div>
                                                <div className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</div>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => onViewUser(user)} title="View User" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                                    <Icon name="view" className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => onEditUser(user)} title="Edit User" className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                                    <Icon name="edit" className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ViewRoleUsersModal;

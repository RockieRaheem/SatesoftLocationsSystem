import React, { useState } from 'react';
import { ShopUser, Theme } from '../types';
import Icon from './Icon';
import MultiSelectDropdown from './MultiSelectDropdown';

interface ReactivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReactivate: (user: ShopUser, shops: string[]) => void;
  user: ShopUser | null;
  theme: Theme;
  availableShops: string[];
}

const ReactivateUserModal: React.FC<ReactivateUserModalProps> = ({ isOpen, onClose, onReactivate, user, theme, availableShops }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [selectedShops, setSelectedShops] = useState<string[]>([]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setSelectedShops([]);
        }, 300);
    };

    const handleConfirm = () => {
        if (!user || selectedShops.length === 0) {
            alert('Please select at least one shop to reactivate the user.');
            return;
        }
        onReactivate(user, selectedShops);
        handleClose();
    };

    if (!isOpen && !isClosing || !user) return null;

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Reactivate User</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className={`p-4 rounded-md border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Created by: {user.createdBy}</p>
                    </div>

                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        To reactivate this user, please assign them to one or more shops. Their status will be set to 'Active'.
                    </p>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Assign Shop(s)
                        </label>
                        <MultiSelectDropdown 
                            theme={theme}
                            options={availableShops}
                            selected={selectedShops}
                            onChange={setSelectedShops}
                            placeholder="Select shops..."
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={selectedShops.length === 0}
                        className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        Reactivate User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReactivateUserModal;
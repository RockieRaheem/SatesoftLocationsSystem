
import React, { useState } from 'react';
import { Theme, ApiConnection } from '../types';
import Icon from './Icon';

interface DeleteApiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: number, reason: string) => void;
    api: ApiConnection | null;
    theme: Theme;
}

const DeleteApiModal: React.FC<DeleteApiModalProps> = ({ isOpen, onClose, onConfirm, api, theme }) => {
    const [reason, setReason] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen || !api) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert('Please provide a reason for deletion.');
            return;
        }
        if (!password) {
            alert('Please enter your password to confirm.');
            return;
        }
        // In a real app, verify password here
        onConfirm(api.id, reason);
        onClose();
        setReason('');
        setPassword('');
    };

    const inputClasses = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-red-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Delete API Connection</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className={`p-3 rounded-md text-sm ${theme === 'dark' ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
                        Warning: This action cannot be undone. This will permanently remove the <strong>{api.name}</strong> connection.
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Reason for Deletion *</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} className={inputClasses} rows={3} placeholder="Why is this being deleted?" />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Confirm Password *</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} />
                    </div>
                </div>
                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={onClose} className={`px-4 py-2 mr-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteApiModal;

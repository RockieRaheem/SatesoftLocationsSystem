
import React, { useState } from 'react';
import { Theme, Lead } from '../types';
import Icon from './Icon';

interface DeleteLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: number, reason: string) => void;
    lead: Lead | null;
    theme: Theme;
}

const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({ isOpen, onClose, onConfirm, lead, theme }) => {
    const [reason, setReason] = useState('');
    const [password, setPassword] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setReason('');
            setPassword('');
        }, 300);
    };

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert("Please provide a reason for deleting this lead.");
            return;
        }
        if (!password) {
            alert("Please enter your password to confirm this action.");
            return;
        }
        // Simulate password check
        if (lead) {
            onConfirm(lead.id, reason);
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !lead) return null;

    const inputClass = `w-full px-3 py-2.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-500 text-sm transition-shadow ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`;

    return (
        <div className={`fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-md rounded-lg shadow-2xl flex flex-col transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold text-red-600 flex items-center`}>
                        <div className="p-2 bg-red-100 rounded-full mr-3">
                             <Icon name="delete" className="h-5 w-5 text-red-600" />
                        </div>
                        Delete Lead
                    </h2>
                    <button onClick={handleClose} className={`p-1 rounded hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className={`p-4 rounded-md border-l-4 border-red-500 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-200' : 'text-red-800'}`}>
                            Warning: You are about to permanently delete the lead for <strong>{lead.companyName}</strong>. This action cannot be undone.
                        </p>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Reason for Deletion <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            rows={3} 
                            className={inputClass} 
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g., Duplicate entry, invalid contact..."
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="password" 
                            className={inputClass}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t gap-3 ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={handleClose} className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm transition-colors ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-800' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-100'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteLeadModal;


import React, { useState } from 'react';
import { Theme, Distributor } from '../types';
import Icon from './Icon';

interface DeleteDistributorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: number, reason: string) => void;
    distributor: Distributor | null;
    theme: Theme;
}

const DeleteDistributorModal: React.FC<DeleteDistributorModalProps> = ({ isOpen, onClose, onConfirm, distributor, theme }) => {
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
            alert("Please provide a reason for deletion.");
            return;
        }
        if (!password) {
            alert("Please enter your password to confirm.");
            return;
        }
        // Simulate password check
        if (distributor) {
            onConfirm(distributor.id, reason);
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !distributor) return null;

    const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-red-500 text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className={`fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-md rounded-lg shadow-xl flex flex-col transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold text-red-500 flex items-center`}>
                        <Icon name="delete" className="h-5 w-5 mr-2" />
                        Delete Distributor
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        Are you sure you want to delete <strong>{distributor.companyName}</strong>? This action moves the distributor to the trash.
                    </p>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Reason</label>
                        <textarea 
                            rows={3} 
                            className={inputClass} 
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Why are you deleting this distributor?"
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                        <input 
                            type="password" 
                            className={inputClass}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Confirm your password"
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t space-x-3 ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={handleClose} className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-100'}`}>
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 flex items-center">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteDistributorModal;

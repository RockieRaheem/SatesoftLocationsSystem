
import React, { useState, useEffect } from 'react';
import { ClientWallet, Theme } from '../types';
import Icon from './Icon';

interface EditWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (wallet: ClientWallet, remarks: string) => void;
    wallet: ClientWallet | null;
    theme: Theme;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({ isOpen, onClose, onUpdate, wallet, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState<Partial<ClientWallet>>({});
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (isOpen && wallet) {
            setFormData({ ...wallet });
            setRemarks('');
        }
    }, [isOpen, wallet]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSave = () => {
        if (wallet && formData.creditLimit !== undefined) {
            if (!remarks.trim()) {
                alert("Please provide remarks for this update.");
                return;
            }
            onUpdate({
                ...wallet,
                creditLimit: Number(formData.creditLimit),
                status: formData.status as any
            }, remarks);
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !wallet) return null;

    const inputClass = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className={`fixed inset-0 bg-black z-[80] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Edit Wallet</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Client</label>
                        <input type="text" value={wallet.clientName} disabled className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border opacity-60 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`} />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Credit Limit ({wallet.currency})</label>
                        <input 
                            type="number" 
                            value={formData.creditLimit} 
                            onChange={e => setFormData({...formData, creditLimit: Number(e.target.value)})} 
                            className={inputClass}
                            min="0"
                        />
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Maximum allowable debt for this client.</p>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                        <select 
                            value={formData.status} 
                            onChange={e => setFormData({...formData, status: e.target.value as any})}
                            className={inputClass}
                        >
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Remarks (Required)</label>
                        <textarea 
                            value={remarks} 
                            onChange={e => setRemarks(e.target.value)} 
                            className={inputClass} 
                            rows={2}
                            placeholder="Reason for update..."
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                        Update Wallet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditWalletModal;

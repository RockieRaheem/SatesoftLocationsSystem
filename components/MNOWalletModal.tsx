
import React, { useState, useEffect } from 'react';
import { Theme, MNOWalletData } from '../types';
import Icon from './Icon';

interface MNOWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (wallet: any) => void;
    wallet?: MNOWalletData | null;
    theme: Theme;
    mode: 'add' | 'edit' | 'view';
}

const MNOWalletModal: React.FC<MNOWalletModalProps> = ({ isOpen, onClose, onSubmit, wallet, theme, mode }) => {
    const [formData, setFormData] = useState<Partial<MNOWalletData>>({
        agentId: '',
        name: '',
        network: 'MTN',
        balance: 0
    });

    useEffect(() => {
        if (wallet) {
            setFormData(wallet);
        } else {
            setFormData({
                agentId: '',
                name: '',
                network: 'MTN',
                balance: 0
            });
        }
    }, [wallet, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const isView = mode === 'view';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {mode === 'add' ? 'Add MNO Wallet' : mode === 'edit' ? 'Edit MNO Wallet' : 'View MNO Wallet'}
                    </h2>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Agent ID</label>
                        <input
                            type="text"
                            required
                            disabled={isView}
                            value={formData.agentId}
                            onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                            className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                            placeholder="e.g. AGT-001"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Wallet Name</label>
                        <input
                            type="text"
                            required
                            disabled={isView}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Network</label>
                            <select
                                required
                                disabled={isView}
                                value={formData.network}
                                onChange={(e) => setFormData({ ...formData, network: e.target.value as any })}
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                            >
                                <option value="MTN">MTN</option>
                                <option value="Airtel">Airtel</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Initial Balance (UGX)</label>
                            <input
                                type="number"
                                required
                                disabled={isView}
                                value={formData.balance}
                                onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                            {isView ? 'Close' : 'Cancel'}
                        </button>
                        {!isView && (
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors"
                            >
                                {mode === 'add' ? 'Add Wallet' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MNOWalletModal;

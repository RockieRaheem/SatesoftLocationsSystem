
import React, { useState, useEffect, useMemo } from 'react';
import { Theme, TransactionData, MNOWalletData } from '../types';
import Icon from './Icon';
import MNOWalletTransactionConfirmationModal from './MNOWalletTransactionConfirmationModal';

interface MNOWalletTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (transaction: any) => void;
    transaction?: TransactionData | null;
    wallets: MNOWalletData[];
    theme: Theme;
    mode: 'add' | 'view';
}

const MNOWalletTransactionModal: React.FC<MNOWalletTransactionModalProps> = ({ isOpen, onClose, onSubmit, transaction, wallets, theme, mode }) => {
    const [formData, setFormData] = useState<Partial<TransactionData>>({
        mnoWalletName: '',
        agentNumber: '',
        transactionType: undefined,
        amount: 0,
        previousBalance: 0,
        balance: 0,
        date: new Date().toISOString(),
        clientPhone: '',
        clientName: ''
    });

    const [showBalances, setShowBalances] = useState(true);
    const [displayAmount, setDisplayAmount] = useState('0');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const selectedWallet = useMemo(() => {
        return wallets.find(w => w.name === formData.mnoWalletName);
    }, [wallets, formData.mnoWalletName]);

    useEffect(() => {
        if (transaction) {
            setFormData(transaction);
            setDisplayAmount(transaction.amount.toLocaleString());
        } else {
            const firstWallet = wallets[0];
            const initialData = {
                mnoWalletName: firstWallet?.name || '',
                agentNumber: firstWallet?.agentId || '',
                transactionType: undefined,
                amount: 0,
                previousBalance: firstWallet?.balance || 0,
                balance: firstWallet?.balance || 0,
                date: new Date().toISOString(),
                clientPhone: '',
                clientName: ''
            };
            setFormData(initialData);
            setDisplayAmount('0');
        }
    }, [transaction, isOpen, wallets]);

    useEffect(() => {
        if (mode === 'add' && selectedWallet) {
            const prevBalance = selectedWallet.balance;
            const amount = formData.amount || 0;
            let newBalance = prevBalance;
            
            if (!formData.transactionType) {
                setFormData(prev => ({
                    ...prev,
                    agentNumber: selectedWallet.agentId,
                    previousBalance: prevBalance,
                    balance: prevBalance
                }));
                return;
            }

            if (formData.transactionType === 'Float top-up' || formData.transactionType === 'Float withdrawal') {
                newBalance = prevBalance + amount;
            } else {
                newBalance = prevBalance - amount;
            }
            
            setFormData(prev => ({
                ...prev,
                agentNumber: selectedWallet.agentId,
                previousBalance: prevBalance,
                balance: newBalance
            }));
        }
    }, [formData.mnoWalletName, formData.transactionType, formData.amount, mode, selectedWallet]);

    if (!isOpen) return null;

    const formatNumber = (val: string) => {
        const nums = val.replace(/[^0-9]/g, '');
        if (!nums) return '0';
        return parseInt(nums).toLocaleString();
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const numValue = parseInt(rawValue) || 0;
        setDisplayAmount(formatNumber(e.target.value));
        setFormData({ ...formData, amount: numValue });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmModalOpen(true);
    };

    const handleConfirm = () => {
        if (onSubmit) {
            onSubmit(formData);
        }
        setIsConfirmModalOpen(false);
    };

    const isView = mode === 'view';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {mode === 'add' ? 'Record Transaction' : 'Transaction Details'}
                    </h2>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>MNO Wallet</label>
                            <select
                                required
                                disabled={isView}
                                value={formData.mnoWalletName}
                                onChange={(e) => setFormData({ ...formData, mnoWalletName: e.target.value })}
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                            >
                                {wallets.map(w => (
                                    <option key={w.id} value={w.name}>{w.name} ({w.network})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Agent ID</label>
                            <input
                                type="text"
                                readOnly
                                value={formData.agentNumber}
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-500'}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Transaction Type</label>
                            <select
                                required
                                disabled={isView}
                                value={formData.transactionType || ''}
                                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                            >
                                <option value="" disabled>Select Transaction Type</option>
                                <option value="Float top-up">Float top-up</option>
                                <option value="Float withdrawal">Float withdrawal</option>
                                <option value="Deposit">Deposit</option>
                                <option value="Float Transfer">Float Transfer</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Phone number</label>
                            <input
                                type="text"
                                required
                                disabled={isView}
                                value={formData.clientPhone}
                                onChange={(e) => {
                                    const phone = e.target.value;
                                    // Mock name lookup
                                    let name = '';
                                    if (phone.length > 5) {
                                        name = 'Verified Client Name'; // Mocked name
                                    }
                                    setFormData({ ...formData, clientPhone: phone, clientName: name });
                                }}
                                placeholder="+256..."
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                            />
                            {formData.clientPhone && (
                                <div className={`mt-1 px-3 py-1.5 rounded bg-opacity-10 border border-dashed ${theme === 'dark' ? 'bg-yellow-500 border-yellow-500/30 text-yellow-500' : 'bg-yellow-600 border-yellow-600/30 text-yellow-700'}`}>
                                    <p className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Client Name (Auto-verified)</p>
                                    <p className="text-sm font-semibold">{formData.clientName || 'Searching...'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Amount (UGX)</label>
                        <input
                            type="text"
                            required
                            disabled={isView}
                            value={displayAmount}
                            onChange={handleAmountChange}
                            className={`w-full px-3 py-2 rounded-md border text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 disabled:bg-slate-900' : 'bg-slate-50 border-slate-300 text-slate-900 disabled:bg-slate-100'}`}
                        />
                    </div>

                    <div className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-center text-xs mb-2">
                            <div className="flex items-center gap-2">
                                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Previous Balance:</span>
                                <button 
                                    type="button"
                                    onClick={() => setShowBalances(!showBalances)}
                                    className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                                    title={showBalances ? "Hide Balances" : "Show Balances"}
                                >
                                    <Icon name={showBalances ? 'view' : 'x-mark'} className="h-3 w-3" />
                                </button>
                            </div>
                            <span className={`font-mono ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                {showBalances 
                                    ? new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(formData.previousBalance || 0)
                                    : '••••••••'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>New Balance:</span>
                            <span className="font-mono text-yellow-500">
                                {showBalances 
                                    ? new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(formData.balance || 0)
                                    : '••••••••'
                                }
                            </span>
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
                                Record Transaction
                            </button>
                        )}
                    </div>
                </form>

                <MNOWalletTransactionConfirmationModal 
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirm}
                    transaction={formData}
                    theme={theme}
                />
            </div>
        </div>
    );
};

export default MNOWalletTransactionModal;

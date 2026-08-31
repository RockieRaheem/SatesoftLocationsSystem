
import React, { useState, useEffect } from 'react';
import { ClientWallet, Theme, WalletTransaction } from '../types';
import Icon from './Icon';

interface WalletHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallet: ClientWallet | null;
    theme: Theme;
}

const WalletHistoryModal: React.FC<WalletHistoryModalProps> = ({ isOpen, onClose, wallet, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen && !isClosing || !wallet) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(amount);
    };

    // Sort transactions by date (newest first)
    const sortedHistory = [...(wallet.history || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getTransactionColor = (type: WalletTransaction['type']) => {
        switch (type) {
            case 'Deposit': return 'border-green-500 bg-green-500/10 text-green-500';
            case 'Withdrawal': return 'border-red-500 bg-red-500/10 text-red-500';
            case 'Correction': return 'border-yellow-500 bg-yellow-500/10 text-yellow-500';
            default: return 'border-slate-500 bg-slate-500/10 text-slate-500';
        }
    };

    const getIcon = (type: WalletTransaction['type']) => {
        switch (type) {
            case 'Deposit': return 'arrow-down';
            case 'Withdrawal': return 'arrow-up';
            default: return 'edit';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black z-[80] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Transaction History</h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Client: {wallet.clientName}</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-8 opacity-50">
                            <Icon name="history" className="h-12 w-12 mx-auto mb-2" />
                            <p>No transactions found.</p>
                        </div>
                    ) : (
                        <div className="relative pl-4 border-l border-slate-300 dark:border-slate-700 space-y-6">
                            {sortedHistory.map((tx) => (
                                <div key={tx.id} className="relative">
                                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-500' : 'bg-white border-slate-400'}`}></div>
                                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getTransactionColor(tx.type)} flex items-center gap-1`}>
                                                    <Icon name={getIcon(tx.type)} className="h-3 w-3" />
                                                    {tx.type}
                                                </span>
                                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {new Date(tx.date).toLocaleString()}
                                                </span>
                                            </div>
                                            {tx.amount !== undefined && (
                                                <span className={`font-bold ${tx.type === 'Withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {tx.type === 'Withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            {tx.remarks && (
                                                <div className="col-span-2">
                                                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks</p>
                                                    <p className={`italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>"{tx.remarks}"</p>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Performed By</p>
                                                <p className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{tx.performedBy}</p>
                                            </div>

                                            {tx.balanceAfter !== undefined && (
                                                <div className="text-right">
                                                    <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Balance After</p>
                                                    <p className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{formatCurrency(tx.balanceAfter)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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

export default WalletHistoryModal;

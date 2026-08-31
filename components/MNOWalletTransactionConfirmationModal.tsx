
import React from 'react';
import { Theme, TransactionData } from '../types';
import Icon from './Icon';

interface MNOWalletTransactionConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    transaction: Partial<TransactionData>;
    theme: Theme;
}

const MNOWalletTransactionConfirmationModal: React.FC<MNOWalletTransactionConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    transaction, 
    theme 
}) => {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
            <div className={`w-full max-w-sm rounded-lg shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className={`p-4 border-b text-center ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Confirm Transaction</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center space-y-1">
                        <p className={`text-xs uppercase tracking-widest font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Target Number</p>
                        <p className={`text-xl font-mono font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-slate-900'}`}>{transaction.clientPhone}</p>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{transaction.clientName || 'Unknown Name'}</p>
                    </div>

                    <div className={`p-4 rounded-lg space-y-3 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Type:</span>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{transaction.transactionType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Amount:</span>
                            <span className="font-bold text-yellow-500">{formatCurrency(transaction.amount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Wallet:</span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{transaction.mnoWalletName}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-md font-bold transition-all transform active:scale-[0.98] shadow-lg"
                        >
                            Confirm Transaction
                        </button>
                        <button
                            onClick={onClose}
                            className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Cancel & Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MNOWalletTransactionConfirmationModal;

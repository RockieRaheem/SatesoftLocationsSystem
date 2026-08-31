
import React, { useState, useEffect } from 'react';
import { ClientWallet, Theme } from '../types';
import Icon from './Icon';
import { formatDate } from '../utils';

interface ViewWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallet: ClientWallet | null;
    theme: Theme;
}

const ViewWalletModal: React.FC<ViewWalletModalProps> = ({ isOpen, onClose, wallet, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen && !isClosing || !wallet) return null;

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    };

    const availableCredit = wallet.creditLimit + wallet.balance; // Assuming balance is net (deposit - debt)
    const balanceColor = wallet.balance >= 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`fixed inset-0 bg-black z-[80] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Wallet Details</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Client Info Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{wallet.clientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Wallet ID: {wallet.id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${wallet.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {wallet.status}
                        </div>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current Balance</p>
                            <p className={`text-xl font-bold ${balanceColor}`}>{formatCurrency(wallet.balance, wallet.currency)}</p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                {wallet.balance < 0 ? 'Outstanding Debt' : 'Funds Available'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Credit Limit</p>
                            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{formatCurrency(wallet.creditLimit, wallet.currency)}</p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Max Allowed Debt</p>
                        </div>
                    </div>

                    {/* Calculated Stats */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Spending Power (Credit + Funds):</span>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{formatCurrency(availableCredit, wallet.currency)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                                className={`h-2.5 rounded-full ${availableCredit > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(100, Math.max(0, (availableCredit / wallet.creditLimit) * 100))}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={`pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created Date</p>
                                <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{formatDate(wallet.createdAt)}</p>
                            </div>
                            <div>
                                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Last Transaction</p>
                                <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{wallet.lastTransactionDate ? formatDate(wallet.lastTransactionDate) : 'N/A'}</p>
                            </div>
                        </div>
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

export default ViewWalletModal;

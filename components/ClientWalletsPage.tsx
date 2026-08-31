
import React, { useState, useMemo } from 'react';
import { Theme, ClientWallet, Shop, User, WalletTransaction } from '../types';
import Icon, { IconName } from './Icon';
import { formatDate } from '../utils';
import { mockClientWallets } from '../data';
import ViewWalletModal from './ViewWalletModal';
import EditWalletModal from './EditWalletModal';
import WalletTransactionModal from './WalletTransactionModal';
import WalletHistoryModal from './WalletHistoryModal';

interface ClientWalletsPageProps {
    theme: Theme;
    shops?: Shop[]; 
    currentUser: User;
}

const SummaryCard: React.FC<{ icon: IconName; title: string; value: string; theme: Theme; color?: string }> = ({ icon, title, value, theme, color = 'text-blue-500' }) => (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
        <div className={`p-3 rounded-full mr-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Icon name={icon} className={`h-6 w-6 ${color}`} />
        </div>
        <div>
            <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
        </div>
    </div>
);

const ClientWalletsPage: React.FC<ClientWalletsPageProps> = ({ theme, shops = [], currentUser }) => {
    const [wallets, setWallets] = useState<ClientWallet[]>(mockClientWallets);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<ClientWallet | null>(null);

    const filteredWallets = useMemo(() => {
        return wallets.filter(wallet => {
            const matchesSearch = wallet.clientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter ? wallet.status === statusFilter : true;
            return matchesSearch && matchesStatus;
        });
    }, [wallets, searchTerm, statusFilter]);

    const summary = useMemo(() => {
        const totalWallets = wallets.length;
        const totalDebt = wallets.reduce((acc, w) => acc + (w.balance < 0 ? Math.abs(w.balance) : 0), 0);
        const totalDeposits = wallets.reduce((acc, w) => acc + (w.balance > 0 ? w.balance : 0), 0);
        const active = wallets.filter(w => w.status === 'Active').length;
        return { totalWallets, totalDebt, totalDeposits, active };
    }, [wallets]);

    const handleViewWallet = (wallet: ClientWallet) => {
        setSelectedWallet(wallet);
        setIsViewModalOpen(true);
    };

    const handleEditWallet = (wallet: ClientWallet) => {
        setSelectedWallet(wallet);
        setIsEditModalOpen(true);
    };

    const handleViewHistory = (wallet: ClientWallet) => {
        setSelectedWallet(wallet);
        setIsHistoryModalOpen(true);
    };

    const handleUpdateWallet = (updatedWallet: ClientWallet, remarks: string) => {
        setWallets(prev => prev.map(w => {
            if (w.id === updatedWallet.id) {
                const newHistory: WalletTransaction = {
                    id: `tx-update-${Date.now()}`,
                    date: new Date().toISOString(),
                    type: 'Correction',
                    remarks: `Updated: ${remarks}`,
                    performedBy: currentUser.name,
                    balanceAfter: w.balance
                };
                return { 
                    ...updatedWallet, 
                    history: [newHistory, ...(w.history || [])] 
                };
            }
            return w;
        }));
    };

    const handleTransaction = (clientId: number, amount: number, type: 'Add' | 'Reduce', remarks: string) => {
        setWallets(prev => prev.map(w => {
            if (w.clientId === clientId) {
                const change = type === 'Add' ? amount : -amount;
                const newBalance = w.balance + change;
                const newHistory: WalletTransaction = {
                    id: `tx-${Date.now()}`,
                    date: new Date().toISOString(),
                    type: type === 'Add' ? 'Deposit' : 'Withdrawal',
                    amount: amount,
                    balanceAfter: newBalance,
                    remarks: remarks,
                    performedBy: currentUser.name
                };

                return {
                    ...w,
                    balance: newBalance,
                    lastTransactionDate: new Date().toISOString(),
                    history: [newHistory, ...(w.history || [])]
                };
            }
            return w;
        }));
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    };

    return (
        <>
            <ViewWalletModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} wallet={selectedWallet} theme={theme} />
            <EditWalletModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdateWallet} wallet={selectedWallet} theme={theme} />
            <WalletHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} wallet={selectedWallet} theme={theme} />
            
            <WalletTransactionModal 
                isOpen={isTransactionModalOpen} 
                onClose={() => setIsTransactionModalOpen(false)} 
                onTransaction={handleTransaction} 
                theme={theme} 
                shops={shops}
                clients={wallets.map(w => ({ id: w.clientId, name: w.clientName }))}
            />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard theme={theme} icon="wallet" title="Total Wallets" value={summary.totalWallets.toString()} color="text-purple-500" />
                    <SummaryCard theme={theme} icon="check-circle" title="Active Wallets" value={summary.active.toString()} color="text-green-500" />
                    <SummaryCard theme={theme} icon="arrow-down" title="Total Deposits" value={formatCurrency(summary.totalDeposits, 'UGX')} color="text-blue-500" />
                    <SummaryCard theme={theme} icon="arrow-up" title="Total Debt" value={formatCurrency(summary.totalDebt, 'UGX')} color="text-red-500" />
                </div>

                {/* Main Content */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden`}>
                    
                    {/* Header & Filters */}
                    <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="flex items-center space-x-4">
                            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Client Wallets</h2>
                            <button 
                                onClick={() => setIsTransactionModalOpen(true)}
                                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600"
                            >
                                <Icon name="plus" className="h-4 w-4" />
                                <span>Add Transaction</span>
                            </button>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <div className="relative flex-grow sm:flex-grow-0">
                                <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                                <input 
                                    type="text" 
                                    placeholder="Search client..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full sm:w-64 pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                                />
                            </div>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`text-sm rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Client Name</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Balance</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Credit Limit</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Last Transaction</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {filteredWallets.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">No wallets found.</td></tr>
                                ) : (
                                    filteredWallets.map((wallet) => (
                                        <tr key={wallet.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{wallet.clientName}</div>
                                                <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>ID: {wallet.clientId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`font-bold ${wallet.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    {formatCurrency(wallet.balance, wallet.currency)}
                                                </span>
                                                <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {wallet.balance < 0 ? 'Debt' : 'Credit'}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {formatCurrency(wallet.creditLimit, wallet.currency)}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {wallet.lastTransactionDate ? formatDate(wallet.lastTransactionDate) : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    wallet.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                                    wallet.status === 'Suspended' ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {wallet.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button onClick={() => handleViewHistory(wallet)} className="text-yellow-500 hover:text-yellow-700" title="View History">
                                                        <Icon name="history" className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleViewWallet(wallet)} className="text-blue-500 hover:text-blue-700" title="View Details">
                                                        <Icon name="view" className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleEditWallet(wallet)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" title="Edit Wallet">
                                                        <Icon name="edit" className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ClientWalletsPage;

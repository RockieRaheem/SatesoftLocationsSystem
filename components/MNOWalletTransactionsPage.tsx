
import React, { useState, useMemo } from 'react';
import { Theme, TransactionData } from '../types';
import { mockMNOTransactions, mockMNOWallets } from '../data';
import Icon from './Icon';
import DashboardKPICard from './DashboardKPICard';
import MNOWalletTransactionModal from './MNOWalletTransactionModal';

interface MNOWalletTransactionsPageProps {
    theme: Theme;
}

const MNOWalletTransactionsPage: React.FC<MNOWalletTransactionsPageProps> = ({ theme }) => {
    const [transactions, setTransactions] = useState<TransactionData[]>(mockMNOTransactions);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => 
            t.mnoWalletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.agentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchQuery]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = useMemo(() => {
        const totalTopUps = transactions
            .filter(t => t.transactionType === 'Float top-up' || t.transactionType === 'Float withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawals = transactions
            .filter(t => t.transactionType === 'Deposit' || t.transactionType === 'Float Transfer')
            .reduce((sum, t) => sum + t.amount, 0);
        const netFloat = totalTopUps - totalWithdrawals;
        return { totalTopUps, totalWithdrawals, netFloat, count: transactions.length };
    }, [transactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const handleAddTransaction = (newTx: Omit<TransactionData, 'id'>) => {
        const tx = { ...newTx, id: transactions.length + 1 };
        setTransactions([tx, ...transactions]);
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardKPICard 
                    title="Total Top-ups" 
                    value={formatCurrency(stats.totalTopUps)} 
                    icon="plus" 
                    theme={theme} 
                    color="green"
                />
                <DashboardKPICard 
                    title="Total Withdrawals" 
                    value={formatCurrency(stats.totalWithdrawals)} 
                    icon="minus" 
                    theme={theme} 
                    color="red"
                />
                <DashboardKPICard 
                    title="Net Float Change" 
                    value={formatCurrency(stats.netFloat)} 
                    icon="analytics" 
                    theme={theme} 
                    color="blue"
                />
                <DashboardKPICard 
                    title="Transaction Count" 
                    value={stats.count.toString()} 
                    icon="history" 
                    theme={theme} 
                    color="indigo"
                />
            </div>

            {/* Table Section */}
            <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-md font-medium transition-colors text-sm"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Record Transaction
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Date</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Wallet</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Agent ID</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Client Phone</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Type</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-right">Amount</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-right">Prev. Balance</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-right">New Balance</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`text-sm divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                            {paginatedTransactions.map((tx) => (
                                <tr key={tx.id} className={`hover:bg-opacity-50 transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                                    <td className={`px-4 py-3 whitespace-nowrap ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{formatDate(tx.date)}</td>
                                    <td className={`px-4 py-3 font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{tx.mnoWalletName}</td>
                                    <td className={`px-4 py-3 font-mono text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{tx.agentNumber}</td>
                                    <td className={`px-4 py-3 font-mono text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{tx.clientPhone || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            (tx.transactionType === 'Float top-up' || tx.transactionType === 'Float withdrawal') 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'
                                        }`}>
                                            {tx.transactionType}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-semibold ${
                                        (tx.transactionType === 'Float top-up' || tx.transactionType === 'Float withdrawal') 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {(tx.transactionType === 'Float top-up' || tx.transactionType === 'Float withdrawal') ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </td>
                                    <td className={`px-4 py-3 text-right ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{formatCurrency(tx.previousBalance)}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatCurrency(tx.balance)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center">
                                            <button 
                                                onClick={() => { setSelectedTransaction(tx); setIsViewModalOpen(true); }}
                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'}`}
                                                title="View Details"
                                            >
                                                <Icon name="view" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={`p-4 border-t flex items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                    <p className="text-xs text-slate-500">
                        Showing {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredTransactions.length, currentPage * itemsPerPage)} of {filteredTransactions.length} transactions
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className={`p-1 rounded border transition-colors disabled:opacity-50 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
                        >
                            <Icon name="chevron-left" className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-medium px-2">{currentPage} / {totalPages || 1}</span>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className={`p-1 rounded border transition-colors disabled:opacity-50 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
                        >
                            <Icon name="chevron-right" className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MNOWalletTransactionModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSubmit={handleAddTransaction} 
                theme={theme} 
                wallets={mockMNOWallets}
                mode="add"
            />
            {selectedTransaction && (
                <MNOWalletTransactionModal 
                    isOpen={isViewModalOpen} 
                    onClose={() => { setIsViewModalOpen(false); setSelectedTransaction(null); }} 
                    transaction={selectedTransaction} 
                    theme={theme} 
                    wallets={mockMNOWallets}
                    mode="view"
                />
            )}
        </div>
    );
};

export default MNOWalletTransactionsPage;

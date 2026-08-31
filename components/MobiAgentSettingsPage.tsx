
import React, { useState, useMemo } from 'react';
import { Theme, MNOData } from '../types';
import { mockMNOAccounts } from '../data';
import Icon from './Icon';
import DashboardKPICard from './DashboardKPICard';
import MobiAccountModal from './MobiAccountModal';
import ConfirmationModal from './ConfirmationModal';

interface MobiAgentSettingsPageProps {
    theme: Theme;
}

const MobiAgentSettingsPage: React.FC<MobiAgentSettingsPageProps> = ({ theme }) => {
    const [accounts, setAccounts] = useState<MNOData[]>(mockMNOAccounts);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<MNOData | null>(null);

    const filteredAccounts = useMemo(() => {
        return accounts.filter(acc => 
            acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            acc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (acc.mobileNumber && acc.mobileNumber.includes(searchQuery))
        );
    }, [accounts, searchQuery]);

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = useMemo(() => {
        const networks = new Set(accounts.filter(a => a.accountType === 'MNO').map(a => a.network)).size;
        const cashAtHand = accounts.filter(a => a.accountType === 'cash-at-hand').reduce((sum, a) => sum + (a.cashAtHand || 0), 0);
        const emoney = accounts.filter(a => a.accountType === 'MNO').reduce((sum, a) => sum + (a.emoneyAmount || 0), 0);
        return {
            networks,
            cashAtHand,
            emoney,
            totalInvestment: cashAtHand + emoney
        };
    }, [accounts]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(amount);
    };

    const handleAddAccount = (newAccount: Omit<MNOData, 'id'>) => {
        const account = { ...newAccount, id: accounts.length + 1 };
        setAccounts([...accounts, account]);
        setIsAddModalOpen(false);
    };

    const handleEditAccount = (updatedAccount: MNOData) => {
        setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
        setIsEditModalOpen(false);
    };

    const handleDeleteAccount = () => {
        if (selectedAccount) {
            setAccounts(accounts.filter(a => a.id !== selectedAccount.id));
            setIsDeleteModalOpen(false);
            setSelectedAccount(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardKPICard 
                    title="Number of Networks" 
                    value={stats.networks.toString()} 
                    icon="broadcast" 
                    theme={theme} 
                    color="blue"
                />
                <DashboardKPICard 
                    title="Cash at Hand" 
                    value={formatCurrency(stats.cashAtHand)} 
                    icon="cash" 
                    theme={theme} 
                    color="green"
                />
                <DashboardKPICard 
                    title="E-Money" 
                    value={formatCurrency(stats.emoney) } 
                    icon="wallet" 
                    theme={theme} 
                    color="yellow"
                />
                <DashboardKPICard 
                    title="Total Investment" 
                    value={formatCurrency(stats.totalInvestment)} 
                    icon="analytics" 
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
                            placeholder="Search accounts..."
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
                        Add Account
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">#</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Account</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Badge</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Country</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Account Number</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-right">Amount (UGX)</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`text-sm divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                            {paginatedAccounts.map((acc, index) => (
                                <tr key={acc.id} className={`hover:bg-opacity-50 transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                                    <td className="px-4 py-3 text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className={`px-4 py-3 font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{acc.name}</td>
                                    <td className="px-4 py-3">
                                        {acc.accountType === 'MNO' ? (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${acc.network === 'MTN' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'}`}>
                                                {acc.network}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500">
                                                CASH
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{acc.country}</td>
                                    <td className={`px-4 py-3 font-mono text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {acc.accountType === 'MNO' ? acc.mobileNumber : '000000000000'}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                        {formatCurrency(acc.accountType === 'MNO' ? (acc.emoneyAmount || 0) : (acc.cashAtHand || 0))}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedAccount(acc); setIsViewModalOpen(true); }}
                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'}`}
                                                title="View"
                                            >
                                                <Icon name="view" className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedAccount(acc); setIsEditModalOpen(true); }}
                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-yellow-900/30' : 'text-yellow-600 hover:bg-yellow-50'}`}
                                                title="Edit"
                                            >
                                                <Icon name="edit" className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedAccount(acc); setIsDeleteModalOpen(true); }}
                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                                                title="Delete"
                                            >
                                                <Icon name="trash" className="h-4 w-4" />
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
                        Showing {Math.min(filteredAccounts.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredAccounts.length, currentPage * itemsPerPage)} of {filteredAccounts.length} accounts
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
            <MobiAccountModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSubmit={handleAddAccount} 
                theme={theme} 
                mode="add"
            />
            {selectedAccount && (
                <>
                    <MobiAccountModal 
                        isOpen={isViewModalOpen} 
                        onClose={() => { setIsViewModalOpen(false); setSelectedAccount(null); }} 
                        account={selectedAccount} 
                        theme={theme} 
                        mode="view"
                    />
                    <MobiAccountModal 
                        isOpen={isEditModalOpen} 
                        onClose={() => { setIsEditModalOpen(false); setSelectedAccount(null); }} 
                        onSubmit={handleEditAccount} 
                        account={selectedAccount} 
                        theme={theme} 
                        mode="edit"
                    />
                    <ConfirmationModal 
                        isOpen={isDeleteModalOpen} 
                        onClose={() => { setIsDeleteModalOpen(false); setSelectedAccount(null); }} 
                        onConfirm={handleDeleteAccount} 
                        title="Delete Account" 
                        message={`Are you sure you want to delete the account "${selectedAccount.name}"? This action cannot be undone.`} 
                        theme={theme} 
                    />
                </>
            )}
        </div>
    );
};

export default MobiAgentSettingsPage;

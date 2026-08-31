
import React, { useState, useMemo } from 'react';
import { Theme, MNOWalletData } from '../types';
import { mockMNOWallets } from '../data';
import Icon from './Icon';
import DashboardKPICard from './DashboardKPICard';
import MNOWalletModal from './MNOWalletModal';
import ConfirmationModal from './ConfirmationModal';

interface MNOWalletSettingsPageProps {
    theme: Theme;
}

const MNOWalletSettingsPage: React.FC<MNOWalletSettingsPageProps> = ({ theme }) => {
    const [wallets, setWallets] = useState<MNOWalletData[]>(mockMNOWallets);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<MNOWalletData | null>(null);

    const filteredWallets = useMemo(() => {
        return wallets.filter(w => 
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.agentId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [wallets, searchQuery]);

    const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
    const paginatedWallets = filteredWallets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = useMemo(() => {
        const totalWallets = wallets.length;
        const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
        const mtnWallets = wallets.filter(w => w.network === 'MTN').length;
        const airtelWallets = wallets.filter(w => w.network === 'Airtel').length;
        return { totalWallets, totalBalance, mtnWallets, airtelWallets };
    }, [wallets]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(amount);
    };

    const handleAddWallet = (newWallet: Omit<MNOWalletData, 'id'>) => {
        const wallet = { ...newWallet, id: wallets.length + 1 };
        setWallets([...wallets, wallet]);
        setIsAddModalOpen(false);
    };

    const handleEditWallet = (updatedWallet: MNOWalletData) => {
        setWallets(wallets.map(w => w.id === updatedWallet.id ? updatedWallet : w));
        setIsEditModalOpen(false);
    };

    const handleDeleteWallet = () => {
        if (selectedWallet) {
            setWallets(wallets.filter(w => w.id !== selectedWallet.id));
            setIsDeleteModalOpen(false);
            setSelectedWallet(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardKPICard 
                    title="Total Wallets" 
                    value={stats.totalWallets.toString()} 
                    icon="wallet" 
                    theme={theme} 
                    color="blue"
                />
                <DashboardKPICard 
                    title="MTN Wallets" 
                    value={stats.mtnWallets.toString()} 
                    icon="broadcast" 
                    theme={theme} 
                    color="yellow"
                />
                <DashboardKPICard 
                    title="Airtel Wallets" 
                    value={stats.airtelWallets.toString()} 
                    icon="broadcast" 
                    theme={theme} 
                    color="red"
                />
                <DashboardKPICard 
                    title="Total Balance" 
                    value={formatCurrency(stats.totalBalance)} 
                    icon="analytics" 
                    theme={theme} 
                    color="green"
                />
            </div>

            {/* Table Section */}
            <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search wallets..."
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
                        Add Wallet
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">#</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Agent ID</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Wallet Name</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Network</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-right">Balance (UGX)</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`text-sm divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                            {paginatedWallets.map((wallet, index) => (
                                <tr key={wallet.id} className={`hover:bg-opacity-50 transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                                    <td className="px-4 py-3 text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className={`px-4 py-3 font-mono text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{wallet.agentId}</td>
                                    <td className={`px-4 py-3 font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{wallet.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${wallet.network === 'MTN' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'}`}>
                                            {wallet.network}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                        {formatCurrency(wallet.balance)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedWallet(wallet); setIsViewModalOpen(true); }}
                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'}`}
                                                title="View"
                                            >
                                                <Icon name="view" className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedWallet(wallet); setIsEditModalOpen(true); }}
                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-yellow-900/30' : 'text-yellow-600 hover:bg-yellow-50'}`}
                                                title="Edit"
                                            >
                                                <Icon name="edit" className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedWallet(wallet); setIsDeleteModalOpen(true); }}
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
                        Showing {Math.min(filteredWallets.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredWallets.length, currentPage * itemsPerPage)} of {filteredWallets.length} wallets
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
            <MNOWalletModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSubmit={handleAddWallet} 
                theme={theme} 
                mode="add"
            />
            {selectedWallet && (
                <>
                    <MNOWalletModal 
                        isOpen={isViewModalOpen} 
                        onClose={() => { setIsViewModalOpen(false); setSelectedWallet(null); }} 
                        wallet={selectedWallet} 
                        theme={theme} 
                        mode="view"
                    />
                    <MNOWalletModal 
                        isOpen={isEditModalOpen} 
                        onClose={() => { setIsEditModalOpen(false); setSelectedWallet(null); }} 
                        onSubmit={handleEditWallet} 
                        wallet={selectedWallet} 
                        theme={theme} 
                        mode="edit"
                    />
                    <ConfirmationModal 
                        isOpen={isDeleteModalOpen} 
                        onClose={() => { setIsDeleteModalOpen(false); setSelectedWallet(null); }} 
                        onConfirm={handleDeleteWallet} 
                        title="Delete Wallet" 
                        message={`Are you sure you want to delete the wallet "${selectedWallet.name}"? This action cannot be undone.`} 
                        theme={theme} 
                    />
                </>
            )}
        </div>
    );
};

export default MNOWalletSettingsPage;

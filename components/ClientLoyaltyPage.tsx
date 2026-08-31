
import React, { useState, useMemo } from 'react';
import { Theme, ClientWallet } from '../types';
import Icon, { IconName } from './Icon';
import { mockClientWallets } from '../data';
import { formatDate } from '../utils';

interface ClientLoyaltyPageProps {
    theme: Theme;
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

const ClientLoyaltyPage: React.FC<ClientLoyaltyPageProps> = ({ theme }) => {
    const [wallets] = useState<ClientWallet[]>(mockClientWallets);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWallets = useMemo(() => {
        return wallets.filter(w => 
            w.clientName.toLowerCase().includes(searchTerm.toLowerCase()) && 
            (w.loyaltyPoints !== undefined || w.totalPointsEarned !== undefined)
        );
    }, [wallets, searchTerm]);

    const summary = useMemo(() => {
        const totalPointsOutstanding = wallets.reduce((acc, w) => acc + (w.loyaltyPoints || 0), 0);
        const totalPointsRedeemed = wallets.reduce((acc, w) => acc + (w.totalPointsRedeemed || 0), 0);
        const totalEarned = wallets.reduce((acc, w) => acc + (w.totalPointsEarned || 0), 0);
        
        // Find top earner
        const topEarner = [...wallets].sort((a, b) => (b.totalPointsEarned || 0) - (a.totalPointsEarned || 0))[0];

        return { totalPointsOutstanding, totalPointsRedeemed, totalEarned, topEarner };
    }, [wallets]);

    // Mock redemption value for display context (assuming avg 1 pt = 100 UGX for summary visualization)
    const estimatedValueOutstanding = summary.totalPointsOutstanding * 100; 

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard theme={theme} icon="star" title="Points Outstanding" value={summary.totalPointsOutstanding.toLocaleString()} color="text-yellow-500" />
                <SummaryCard theme={theme} icon="gift" title="Total Redeemed" value={summary.totalPointsRedeemed.toLocaleString()} color="text-green-500" />
                <SummaryCard theme={theme} icon="cash" title="Value Outstanding (Est)" value={`UGX ${estimatedValueOutstanding.toLocaleString()}`} color="text-blue-500" />
                <SummaryCard theme={theme} icon="user-circle" title="Top Earner" value={summary.topEarner?.clientName || 'N/A'} color="text-purple-500" />
            </div>

            {/* Main Content */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden`}>
                
                {/* Header */}
                <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Client Loyalty Points</h2>
                    <div className="relative w-full sm:w-64">
                        <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input 
                            type="text" 
                            placeholder="Search client..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Client Name</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current Balance</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Lifetime Earned</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Lifetime Redeemed</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Last Transaction</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {filteredWallets.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-500">No loyalty records found.</td></tr>
                            ) : (
                                filteredWallets.map((wallet) => (
                                    <tr key={wallet.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{wallet.clientName}</div>
                                            <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>ID: {wallet.clientId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`font-bold text-yellow-500`}>
                                                {wallet.loyaltyPoints?.toLocaleString() || 0} pts
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {wallet.totalPointsEarned?.toLocaleString() || 0}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {wallet.totalPointsRedeemed?.toLocaleString() || 0}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {wallet.lastTransactionDate ? formatDate(wallet.lastTransactionDate) : 'Never'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientLoyaltyPage;

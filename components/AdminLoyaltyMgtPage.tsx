
import React, { useState } from 'react';
import { Theme, ClientWallet, LoyaltyTransfer } from '../types';
import Icon from './Icon';
import { formatDate } from '../utils';

interface AdminLoyaltyMgtPageProps {
    theme: Theme;
}

const mockClientWallets: ClientWallet[] = [
    {
        id: 'W-001',
        clientId: 1,
        clientName: 'John Doe',
        balance: 500,
        creditLimit: 1000,
        status: 'Active',
        currency: 'USD',
        createdAt: '2023-01-15T10:00:00Z',
        history: [],
        loyaltyPoints: 450,
        totalPointsEarned: 600,
        totalPointsRedeemed: 150
    },
    {
        id: 'W-002',
        clientId: 2,
        clientName: 'Jane Smith',
        balance: -200,
        creditLimit: 500,
        status: 'Active',
        currency: 'USD',
        createdAt: '2023-02-20T11:30:00Z',
        history: [],
        loyaltyPoints: 120,
        totalPointsEarned: 300,
        totalPointsRedeemed: 180
    },
    {
        id: 'W-003',
        clientId: 3,
        clientName: 'Robert Johnson',
        balance: 1500,
        creditLimit: 2000,
        status: 'Active',
        currency: 'USD',
        createdAt: '2023-03-10T09:15:00Z',
        history: [],
        loyaltyPoints: 890,
        totalPointsEarned: 1200,
        totalPointsRedeemed: 310
    }
];

const mockTransfers: LoyaltyTransfer[] = [
    {
        id: 'TR-001',
        date: '2024-03-04T10:00:00Z',
        fromClientId: 1,
        fromClientName: 'John Doe',
        toClientId: 2,
        toClientName: 'Jane Smith',
        points: 50,
        status: 'Pending',
        requestedBy: 'John Doe',
        remarks: 'Gift for friend'
    },
    {
        id: 'TR-002',
        date: '2024-03-02T15:30:00Z',
        fromClientId: 3,
        fromClientName: 'Robert Johnson',
        toClientId: 1,
        toClientName: 'John Doe',
        points: 100,
        status: 'Approved',
        requestedBy: 'Robert Johnson',
        remarks: 'Transfer request'
    }
];

const AdminLoyaltyMgtPage: React.FC<AdminLoyaltyMgtPageProps> = ({ theme }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'transfers' | 'redemptions'>('overview');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const totalPointsAcrossAll = mockClientWallets.reduce((acc, w) => acc + (w.loyaltyPoints || 0), 0);
    const totalRedeemedAcrossAll = mockClientWallets.reduce((acc, w) => acc + (w.totalPointsRedeemed || 0), 0);
    const pendingTransfersCount = mockTransfers.filter(t => t.status === 'Pending').length;

    const SummaryCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
        <div className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                    <h3 className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon name={icon} className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );

    const filteredWallets = mockClientWallets.filter(w => 
        w.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.clientId.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Loyalty Points Management</h2>
                <button 
                    onClick={() => setIsTransferModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                    <Icon name="share" className="h-5 w-5" />
                    New Transfer Request
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Active Points" value={totalPointsAcrossAll.toLocaleString()} icon="star" color="bg-yellow-500" />
                <SummaryCard title="Total Redeemed" value={totalRedeemedAcrossAll.toLocaleString()} icon="arrow-down" color="bg-red-500" />
                <SummaryCard title="Pending Transfers" value={pendingTransfersCount} icon="history" color="bg-blue-500" />
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Customer Overview
                </button>
                <button 
                    onClick={() => setActiveTab('transfers')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'transfers' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Transfer Requests
                </button>
                <button 
                    onClick={() => setActiveTab('redemptions')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'redemptions' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Redemption Records
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search customers by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
            </div>

            {/* Content Area */}
            <div className={`rounded-xl shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {activeTab === 'overview' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`${theme === 'dark' ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase font-semibold`}>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Earned</th>
                                    <th className="px-6 py-4">Redeemed</th>
                                    <th className="px-6 py-4">Current Balance</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                                {filteredWallets.map((wallet) => (
                                    <tr key={wallet.id} className={`${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500 font-bold text-xs mr-3">
                                                    {wallet.clientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{wallet.clientName}</p>
                                                    <p className="text-xs text-slate-500">ID: {wallet.clientId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500 font-medium">
                                            +{wallet.totalPointsEarned?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                                            -{wallet.totalPointsRedeemed?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-500">
                                            {wallet.loyaltyPoints?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">View History</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'transfers' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`${theme === 'dark' ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase font-semibold`}>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">From</th>
                                    <th className="px-6 py-4">To</th>
                                    <th className="px-6 py-4">Points</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                                {mockTransfers.map((transfer) => (
                                    <tr key={transfer.id} className={`${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {formatDate(transfer.date)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                            {transfer.fromClientName}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                            {transfer.toClientName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-500">
                                            {transfer.points}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                transfer.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                                transfer.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {transfer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {transfer.status === 'Pending' && (
                                                <div className="flex justify-end space-x-2">
                                                    <button className="p-1 text-green-500 hover:bg-green-50 rounded" title="Approve"><Icon name="check" className="h-5 w-5" /></button>
                                                    <button className="p-1 text-red-500 hover:bg-red-50 rounded" title="Reject"><Icon name="x-mark" className="h-5 w-5" /></button>
                                                </div>
                                            )}
                                            {transfer.status !== 'Pending' && (
                                                <span className="text-xs text-slate-400 italic">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'redemptions' && (
                    <div className="p-8 text-center">
                        <Icon name="history" className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Redemption Records</h3>
                        <p className="text-slate-500 mt-2">Detailed redemption history for all customers will appear here.</p>
                    </div>
                )}
            </div>

            {/* New Transfer Modal */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className={`w-full max-w-md rounded-xl shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>New Points Transfer</h3>
                            <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <Icon name="x-mark" className="h-6 w-6" />
                            </button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsTransferModalOpen(false); }}>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>From Customer</label>
                                <select className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                                    <option value="">Select sender...</option>
                                    {mockClientWallets.map(w => <option key={w.id} value={w.clientId}>{w.clientName} ({w.loyaltyPoints} pts)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>To Customer</label>
                                <select className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                                    <option value="">Select recipient...</option>
                                    {mockClientWallets.map(w => <option key={w.id} value={w.clientId}>{w.clientName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Points to Transfer</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Remarks</label>
                                <textarea 
                                    placeholder="Reason for transfer..."
                                    rows={3}
                                    className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsTransferModalOpen(false)}
                                    className={`flex-1 py-2 rounded-lg font-medium ${theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg font-bold shadow-sm transition-all active:scale-95"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLoyaltyMgtPage;

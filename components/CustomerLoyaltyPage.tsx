
import React, { useState } from 'react';
import { Theme, LoyaltyTransaction } from '../types';
import { formatDate } from '../utils';
import Icon from './Icon';

interface CustomerLoyaltyPageProps {
    theme: Theme;
}

const mockLoyaltyTransactions: LoyaltyTransaction[] = [
    {
        id: 'LT-001',
        date: '2024-03-01T10:30:00Z',
        type: 'Earned',
        points: 50,
        shopName: 'Main Street Grocery',
        description: 'Purchase of household items',
        purchaseId: 'PUR-101',
        items: [
            { name: 'Milk 1L', quantity: 2, price: 5.00, points: 20 },
            { name: 'Bread', quantity: 1, price: 2.50, points: 10 },
            { name: 'Eggs 12pk', quantity: 1, price: 4.50, points: 20 }
        ]
    },
    {
        id: 'LT-002',
        date: '2024-03-05T14:20:00Z',
        type: 'Earned',
        points: 30,
        shopName: 'Downtown Pharmacy',
        description: 'Medical supplies purchase',
        purchaseId: 'PUR-105',
        items: [
            { name: 'Vitamin C', quantity: 1, price: 15.00, points: 20 },
            { name: 'Face Masks', quantity: 1, price: 10.00, points: 10 }
        ]
    },
    {
        id: 'LT-003',
        date: '2024-03-10T09:15:00Z',
        type: 'Redeemed',
        points: 40,
        shopName: 'Main Street Grocery',
        description: 'Points redemption for discount',
        purchaseId: 'PUR-110',
        items: [
            { name: 'Rice 5kg', quantity: 1, price: 20.00, points: 25 },
            { name: 'Cooking Oil', quantity: 1, price: 12.00, points: 15 }
        ]
    },
    {
        id: 'LT-004',
        date: '2024-03-15T16:45:00Z',
        type: 'Earned',
        points: 100,
        shopName: 'Electronics Hub',
        description: 'Smartphone accessories',
        purchaseId: 'PUR-120',
        items: [
            { name: 'Phone Case', quantity: 1, price: 25.00, points: 40 },
            { name: 'Screen Protector', quantity: 1, price: 15.00, points: 30 },
            { name: 'Charging Cable', quantity: 2, price: 10.00, points: 30 }
        ]
    }
];

const CustomerLoyaltyPage: React.FC<CustomerLoyaltyPageProps> = ({ theme }) => {
    const [selectedTransaction, setSelectedTransaction] = useState<LoyaltyTransaction | null>(null);

    const totalPoints = 140;
    const earnedPoints = 180;
    const redeemedPoints = 40;

    const SummaryCard = ({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) => (
        <div className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                    <h3 className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value.toLocaleString()}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon name={icon} className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Loyalty Points</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Current Balance" value={totalPoints} icon="star" color="bg-yellow-500" />
                <SummaryCard title="Total Earned" value={earnedPoints} icon="arrow-up" color="bg-green-500" />
                <SummaryCard title="Total Redeemed" value={redeemedPoints} icon="arrow-down" color="bg-red-500" />
            </div>

            {/* Transactions Table */}
            <div className={`rounded-xl shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Points History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${theme === 'dark' ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase font-semibold`}>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Shop</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Points</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {mockLoyaltyTransactions.map((tx) => (
                                <tr key={tx.id} className={`${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                        {tx.shopName}
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {tx.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            tx.type === 'Earned' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                                        tx.type === 'Earned' ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        {tx.type === 'Earned' ? '+' : '-'}{tx.points}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                            onClick={() => setSelectedTransaction(tx)}
                                            className="text-yellow-500 hover:text-yellow-600 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                                        >
                                            <Icon name="view" className="h-4 w-4" />
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className={`w-full max-w-lg rounded-xl shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Transaction Details</h3>
                            <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-slate-600">
                                <Icon name="x-mark" className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Transaction ID</p>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{selectedTransaction.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Date</p>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{formatDate(selectedTransaction.date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Shop</p>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{selectedTransaction.shopName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Points</p>
                                    <p className={`text-sm font-bold ${selectedTransaction.type === 'Earned' ? 'text-green-500' : 'text-red-500'}`}>
                                        {selectedTransaction.type === 'Earned' ? '+' : '-'}{selectedTransaction.points}
                                    </p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Purchased Items</p>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Points</p>
                                </div>
                                <div className="space-y-2">
                                    {selectedTransaction.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <div className="flex flex-col">
                                                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                                                    {item.name} <span className="text-xs text-slate-500">x{item.quantity}</span>
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    Price: ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                            <span className={`font-bold ${selectedTransaction.type === 'Earned' ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedTransaction.type === 'Earned' ? '+' : '-'}{item.points || 0}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between font-bold">
                                        <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}>Total Points</span>
                                        <span className={selectedTransaction.type === 'Earned' ? 'text-green-500' : 'text-red-500'}>
                                            {selectedTransaction.type === 'Earned' ? '+' : '-'}{selectedTransaction.points}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`p-6 border-t flex justify-end ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                            <button 
                                onClick={() => setSelectedTransaction(null)}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerLoyaltyPage;

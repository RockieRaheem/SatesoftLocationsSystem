
import React, { useState, useMemo } from 'react';
import { Theme, CustomerPurchase } from '../types';
import { mockCustomerPurchases } from '../data';
import Icon from './Icon';

interface CustomerPurchasesPageProps {
    theme: Theme;
}

const CustomerPurchasesPage: React.FC<CustomerPurchasesPageProps> = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [purchases] = useState<CustomerPurchase[]>(mockCustomerPurchases);

    const filteredPurchases = useMemo(() => {
        return purchases.filter(purchase => 
            purchase.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [purchases, searchTerm]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
             <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border p-6`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>My Purchases</h2>
                    <div className="relative w-full sm:w-64">
                        <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input 
                            type="text" 
                            placeholder="Search purchases..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Date</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Items</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total</th>
                                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {filteredPurchases.length > 0 ? (
                                filteredPurchases.map((purchase) => (
                                    <tr key={purchase.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {formatDate(purchase.date)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                            {purchase.shopName}
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {purchase.itemsSummary}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                            {purchase.totalAmount.toLocaleString()} {purchase.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                purchase.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                purchase.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button className={`text-blue-500 hover:text-blue-700 font-medium`}>View Receipt</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className={`px-6 py-8 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        No purchases found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerPurchasesPage;

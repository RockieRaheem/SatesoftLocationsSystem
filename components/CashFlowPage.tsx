import React from 'react';
import { Theme, Shop } from '../types';
import { mockShops } from '../data';
import Icon from './Icon';

interface CashFlowPageProps {
    theme: Theme;
    onSelectShop: (shop: Shop) => void;
}

const CashFlowPage: React.FC<CashFlowPageProps> = ({ theme, onSelectShop }) => {
    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                    <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                        <tr>
                            {['Shop Name', 'Country', 'Operating Cash Flow', 'Capex', 'Actions'].map((header) => (
                                <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                        {mockShops.map((shop) => (
                            <tr key={shop.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{shop.name}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{shop.countryCode}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{shop.financials?.cashFlowStatement.operatingCashFlow.toLocaleString()}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{shop.financials?.cashFlowStatement.capex.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button 
                                        onClick={() => onSelectShop(shop)}
                                        title="View Performance"
                                        className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
                                    >
                                        <Icon name="view" className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CashFlowPage;
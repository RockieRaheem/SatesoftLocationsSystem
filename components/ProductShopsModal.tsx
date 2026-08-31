
import React, { useMemo, useState } from 'react';
import { Theme } from '../types';
import Icon, { IconName } from './Icon';
import { formatDate } from '../utils';

interface ProductShopsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: { name: string; id: number } | null;
    theme: Theme;
}

const SummaryCard: React.FC<{ title: string; value: number; icon: IconName; colorClass: string; theme: Theme }> = ({ title, value, icon, colorClass, theme }) => (
    <div className={`p-3 rounded-lg border flex flex-col justify-between h-20 flex-1 min-w-[140px] ${theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
        <div className="flex justify-between items-start">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</span>
            <Icon name={icon} className={`h-4 w-4 ${colorClass}`} />
        </div>
        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value.toLocaleString()}</div>
    </div>
);

const ProductShopsModal: React.FC<ProductShopsModalProps> = ({ isOpen, onClose, product, theme }) => {
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Generate mock shops based on product ID
    const allShops = useMemo(() => {
        if (!product) return [];
        const count = Math.floor((product.id * 17) % 20) + 15; // 15 to 35 shops to ensure scrolling
        const locations = ['Kampala', 'Jinja', 'Entebbe', 'Mbarara', 'Gulu', 'Mbale', 'Arua', 'Fort Portal'];
        const countries = ['Uganda', 'Kenya', 'Tanzania', 'Rwanda'];
        
        return Array.from({ length: count }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            
            const rand = Math.random();
            let status: 'Active' | 'Inactive' | 'Archived' = 'Active';
            if (rand > 0.85) status = 'Archived';
            else if (rand > 0.65) status = 'Inactive';
            
            return {
                id: i,
                name: `Shop ${String.fromCharCode(65 + (i % 26))}${i + 1} - ${locations[i % locations.length]}`,
                location: locations[i % locations.length],
                country: countries[i % countries.length],
                listedDate: date.toISOString(),
                status
            };
        }).sort((a, b) => new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime());
    }, [product]);

    const summary = useMemo(() => {
        return {
            total: allShops.length,
            active: allShops.filter(s => s.status === 'Active').length,
            inactive: allShops.filter(s => s.status === 'Inactive').length,
            archived: allShops.filter(s => s.status === 'Archived').length,
        };
    }, [allShops]);

    const filteredShops = useMemo(() => {
        if (statusFilter === 'All') return allShops;
        return allShops.filter(s => s.status === statusFilter);
    }, [allShops, statusFilter]);

    if (!isOpen || !product) return null;

    const getStatusBadge = (status: string) => {
        const base = "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide";
        switch (status) {
            case 'Active': return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>Active</span>;
            case 'Inactive': return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>Inactive</span>;
            case 'Archived': return <span className={`${base} bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300`}>Archived</span>;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 transition-opacity" onClick={onClose}>
            <div 
                className={`w-full max-w-5xl rounded-xl shadow-2xl flex flex-col h-full max-h-[85vh] ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Static */}
                <div className={`flex justify-between items-center p-6 border-b flex-shrink-0 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            Shop Distribution
                        </h2>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Managing listed locations for <span className="font-semibold text-yellow-500">{product.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                {/* Content Container - Flex Column to manage scrolling */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* Summary Cards Row - Static */}
                    <div className="p-6 pb-2 grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                        <SummaryCard theme={theme} title="Total Listed" value={summary.total} icon="reports" colorClass="text-blue-500" />
                        <SummaryCard theme={theme} title="Active" value={summary.active} icon="check-circle" colorClass="text-green-500" />
                        <SummaryCard theme={theme} title="Inactive" value={summary.inactive} icon="exclamation-triangle" colorClass="text-yellow-500" />
                        <SummaryCard theme={theme} title="Archived" value={summary.archived} icon="archive" colorClass="text-slate-500" />
                    </div>

                    {/* Filter & Table Area - Flex growing and inner scrolling */}
                    <div className="p-6 pt-2 flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Listing Details</h3>
                            <div className="flex items-center gap-3">
                                <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Filter by Status:</label>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={`text-xs px-3 py-1.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                >
                                    <option value="All">All Locations</option>
                                    <option value="Active">Active Only</option>
                                    <option value="Inactive">Inactive Only</option>
                                    <option value="Archived">Archived Only</option>
                                </select>
                            </div>
                        </div>

                        {/* The Table Wrapper - This is the only part that scrolls */}
                        <div className={`flex-1 border rounded-lg overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white shadow-inner'}`}>
                            <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                                <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50 shadow-sm'}`}>
                                    <tr>
                                        <th className={`px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop Name</th>
                                        <th className={`px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Location / Region</th>
                                        <th className={`px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Date Listed</th>
                                        <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {filteredShops.length > 0 ? filteredShops.map((shop) => (
                                        <tr key={shop.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                                {shop.name}
                                                <div className="text-[10px] opacity-60 font-normal uppercase tracking-tight">{shop.country}</div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {shop.location}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {formatDate(shop.listedDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {getStatusBadge(shop.status)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 italic">No locations match the selected status filter.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer - Static */}
                <div className={`p-4 px-6 border-t flex-shrink-0 ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total filtered results: <strong>{filteredShops.length}</strong>
                    </span>
                    <button onClick={onClose} className={`px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        Close Distribution View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductShopsModal;

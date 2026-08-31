import React, { useState, useMemo, useEffect } from 'react';
import { Theme, StockItem } from '../types';
import Icon, { IconName } from './Icon';
import { mockStockListings, mockShops } from '../data';

interface InventoryPageProps {
    theme: Theme;
    stockItems: StockItem[];
}

const SummaryCard: React.FC<{ title: string; value: string; icon: IconName; theme: Theme; colorClass?: string }> = ({ title, value, icon, theme, colorClass = "bg-yellow-500 text-slate-900" }) => (
    <div className={`p-4 rounded-lg shadow-sm border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-500'}`}>{title}</p>
            <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-md ${colorClass}`}>
            <Icon name={icon} className={`h-6 w-6`} />
        </div>
    </div>
);

const InventoryPage: React.FC<InventoryPageProps> = ({ theme, stockItems }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterShop, setFilterShop] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // 'Good', 'Low', 'Out'
    const [filterUnit, setFilterUnit] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Enhance stock data with status logic
    const inventoryData = useMemo(() => {
        return stockItems.map(item => {
            let status: 'Good' | 'Low Stock' | 'Out of Stock' = 'Good';
            if (item.quantity === 0) status = 'Out of Stock';
            else if (item.quantity <= (item.reorderPoint || 0)) status = 'Low Stock';
            
            return {
                ...item,
                status
            };
        });
    }, []);

    const filteredInventory = useMemo(() => {
        return inventoryData.filter(item => {
            const matchesSearch = 
                item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.productSN.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesShop = filterShop ? item.shopName === filterShop : true;
            const matchesStatus = filterStatus ? item.status === filterStatus : true;
            const matchesUnit = filterUnit ? item.unit === filterUnit : true;

            return matchesSearch && matchesShop && matchesStatus && matchesUnit;
        });
    }, [inventoryData, searchTerm, filterShop, filterStatus, filterUnit]);

    const summary = useMemo(() => {
        const totalItems = filteredInventory.length;
        const lowStock = filteredInventory.filter(i => i.status === 'Low Stock').length;
        const outOfStock = filteredInventory.filter(i => i.status === 'Out of Stock').length;
        const totalValue = filteredInventory.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

        return { totalItems, lowStock, outOfStock, totalValue };
    }, [filteredInventory]);

    const paginatedInventory = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredInventory.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredInventory, currentPage]);

    const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterShop('');
        setFilterStatus('');
        setFilterUnit('');
        setCurrentPage(1);
    };

    const uniqueShops = useMemo(() => [...new Set(mockStockListings.map(s => s.shopName))].sort(), []);

    const uniqueUnits = useMemo(() => {
        let items = mockStockListings;
        if (filterShop) {
            items = items.filter(i => i.shopName === filterShop);
        }
        return [...new Set(items.map(i => i.unit))].sort();
    }, [filterShop]);

    // Reset unit filter if the selected unit doesn't exist in the current shop selection
    useEffect(() => {
        if (filterUnit && !uniqueUnits.includes(filterUnit)) {
            setFilterUnit('');
        }
    }, [filterShop, uniqueUnits, filterUnit]);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Out of Stock': return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800'}`}>Out of Stock</span>;
            case 'Low Stock': return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>Low Stock</span>;
            default: return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'}`}>Good</span>;
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                <SummaryCard 
                    title="Total Inventory Value" 
                    value={`UGX ${(summary.totalValue / 1000000).toFixed(2)}M`} 
                    icon="cash" 
                    theme={theme} 
                    colorClass={theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'} 
                />
                <SummaryCard 
                    title="Total SKUs" 
                    value={summary.totalItems.toLocaleString()} 
                    icon="stock-listing" 
                    theme={theme} 
                    colorClass={theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'} 
                />
                <SummaryCard 
                    title="Low Stock Alerts" 
                    value={summary.lowStock.toLocaleString()} 
                    icon="exclamation-triangle" 
                    theme={theme} 
                    colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-100 text-yellow-700'} 
                />
                <SummaryCard 
                    title="Out of Stock" 
                    value={summary.outOfStock.toLocaleString()} 
                    icon="x-mark" 
                    theme={theme} 
                    colorClass={theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'} 
                />
            </div>

            {/* Collapsible Filter Section */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0`}>
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`w-full px-4 py-3 flex justify-between items-center text-sm font-medium transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center">
                        <Icon name="filter" className="h-4 w-4 mr-2 text-slate-400" />
                        <span>Filter Inventory</span>
                    </div>
                    <Icon name="chevron-down" className={`h-4 w-4 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                    <div className={`p-4 border-t transition-all animate-fade-in ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="w-full relative">
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Search Product</label>
                                <div className="relative">
                                    <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                                    <input 
                                        type="text" 
                                        placeholder="Name or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Shop</label>
                                <select 
                                    value={filterShop} 
                                    onChange={(e) => setFilterShop(e.target.value)}
                                    className={`w-full text-sm px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                                >
                                    <option value="">All Shops</option>
                                    {uniqueShops.map(shop => (
                                        <option key={shop} value={shop}>{shop}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Unit</label>
                                <select 
                                    value={filterUnit} 
                                    onChange={(e) => setFilterUnit(e.target.value)}
                                    className={`w-full text-sm px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                                >
                                    <option value="">All Units</option>
                                    {uniqueUnits.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Status</label>
                                <select 
                                    value={filterStatus} 
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className={`w-full text-sm px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Good">Good</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                             <button 
                                onClick={handleClearFilters}
                                className={`px-4 py-2 text-sm font-medium border rounded-md flex items-center gap-2 transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Icon name="refresh" className="h-4 w-4" />
                                Reset
                            </button>
                            <button 
                                onClick={() => setIsFilterOpen(false)}
                                className="px-6 py-2 text-sm font-bold bg-black text-yellow-500 rounded-md flex items-center gap-2 hover:bg-slate-900 transition-colors border border-black"
                            >
                                <Icon name="check-circle" className="h-4 w-4" />
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-grow flex flex-col overflow-hidden`}>
                <div className="p-4 border-b border-transparent">
                    <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Inventory Levels</h2>
                </div>
                <div className="overflow-x-auto flex-grow">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Product Name</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Shop</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Current Stock</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Reorder Point</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Supplier</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Status</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {paginatedInventory.map((item) => (
                                <tr key={item.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className="px-4 py-3 text-sm">
                                        <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.productName}</div>
                                        <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>SN: {item.productSN}</div>
                                    </td>
                                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {item.shopName}
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-center font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                        {item.quantity} {item.unit}
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {item.reorderPoint ? `${item.reorderPoint} ${item.unit}` : '-'}
                                    </td>
                                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {item.supplier || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button className={`text-blue-500 hover:text-blue-600`} title="View Details">
                                            <Icon name="view" className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredInventory.length === 0 && (
                                <tr>
                                    <td colSpan={7} className={`px-6 py-8 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        No inventory items found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                 {/* Pagination */}
                 <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center">
                         <p className={`text-sm mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredInventory.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredInventory.length)} of {filteredInventory.length} records
                         </p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-left" className="h-4 w-4" /></button>
                         <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-right" className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
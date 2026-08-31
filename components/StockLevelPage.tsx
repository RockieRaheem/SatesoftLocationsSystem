
import React, { useState, useMemo } from 'react';
import { Theme, StockItem } from '../types';
import Icon, { IconName } from './Icon';
import { mockStockListings, mockShops } from '../data';
import StockHistoryModal from './StockHistoryModal';
import StockReconciliationModal from './StockReconciliationModal';

interface StockLevelPageProps {
    theme: Theme;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: IconName; theme: Theme; colorClass?: string }> = ({ title, value, icon, theme, colorClass = "bg-yellow-500 text-slate-900" }) => (
    <div className={`p-4 rounded-lg shadow-sm border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-500'}`}>{title}</p>
            <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-md ${colorClass}`}>
            <Icon name={icon} className={`h-6 w-6`} />
        </div>
    </div>
);

const StockLevelPage: React.FC<StockLevelPageProps> = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterShop, setFilterShop] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);

    // Local state for stock data to allow reconciliation updates
    const [localStockListings, setLocalStockListings] = useState(mockStockListings);

    // Derived stock data including calculated fields
    const stockData = useMemo(() => {
        return localStockListings.map(item => {
            // Mock sold count to be consistent (using id hash)
            const soldMock = Math.floor((item.id * 17) % (item.quantity + 20));
            const stocked = item.quantity + soldMock;
            
            return {
                ...item,
                sold: soldMock,
                stocked: stocked,
                totalValue: item.quantity * item.unitPrice,
                // Determine mock level status
                levelStatus: item.quantity === 0 ? 'Out of Stock' : item.quantity < 20 ? 'Low' : 'Good'
            };
        });
    }, []);

    const filteredStock = useMemo(() => {
        return stockData.filter(item => {
            const matchesSearch = 
                item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.productSN.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesShop = filterShop ? item.shopName === filterShop : true;
            const matchesLevel = filterLevel ? item.levelStatus === filterLevel : true;

            return matchesSearch && matchesShop && matchesLevel;
        });
    }, [stockData, searchTerm, filterShop, filterLevel]);

    // Summary Statistics
    const summary = useMemo(() => {
        const totalValue = filteredStock.reduce((acc, item) => acc + item.totalValue, 0);
        const totalItems = filteredStock.length;
        const lowStock = filteredStock.filter(i => i.levelStatus === 'Low').length;
        const outOfStock = filteredStock.filter(i => i.levelStatus === 'Out of Stock').length;

        return { totalValue, totalItems, lowStock, outOfStock };
    }, [filteredStock]);

    const paginatedStock = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStock.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStock, currentPage]);

    const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterShop('');
        setFilterLevel('');
        setCurrentPage(1);
    };

    const uniqueShops = [...new Set(localStockListings.map(s => s.shopName))].sort();

    const handleReconcile = (item: StockItem, physicalCount: number, unit: string, remarks: string) => {
        setLocalStockListings(prev => prev.map(s => {
            if (s.id === item.id) {
                return { ...s, quantity: physicalCount, unit: unit };
            }
            return s;
        }));
        
        // Mock purchase entry creation
        const diff = physicalCount - item.quantity;
        if (diff > 0) {
            console.log(`Purchase entry created for ${item.productName}: +${diff} ${unit} (Flag: Stock Reconciliation, Remarks: ${remarks})`);
        } else if (diff < 0) {
            console.log(`Correction entry created for ${item.productName}: ${diff} ${unit} (Comment: Reduced during reconciliation, Remarks: ${remarks})`);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                <SummaryCard 
                    title="Total Stock Value" 
                    value={`UGX ${(summary.totalValue / 1000000).toFixed(2)}M`} 
                    icon="cash" 
                    theme={theme} 
                    colorClass={theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'} 
                />
                <SummaryCard 
                    title="Total Items" 
                    value={summary.totalItems.toLocaleString()} 
                    icon="stock-listing" 
                    theme={theme} 
                    colorClass={theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'} 
                />
                <SummaryCard 
                    title="Low Stock Items" 
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

            {/* Filter Section */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0 p-4`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Filter</h2>
                    <Icon name="chevron-down" className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop</label>
                        <select 
                            value={filterShop} 
                            onChange={(e) => setFilterShop(e.target.value)}
                            className={`w-full text-sm px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        >
                            <option value="">Select Shop</option>
                            {uniqueShops.map(shop => (
                                <option key={shop} value={shop}>{shop}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Level</label>
                        <select 
                            value={filterLevel} 
                            onChange={(e) => setFilterLevel(e.target.value)}
                            className={`w-full text-sm px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        >
                            <option value="">Select Level</option>
                            <option value="Good">Good</option>
                            <option value="Low">Low</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={handleClearFilters}
                            className={`px-4 py-2 text-sm font-medium border rounded-md flex items-center gap-2 transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Icon name="x-mark" className="h-4 w-4" />
                            Clear
                        </button>
                        <button 
                            className="px-4 py-2 text-sm font-medium bg-black text-yellow-500 rounded-md flex items-center gap-2 hover:bg-slate-900 transition-colors border border-black"
                        >
                            <Icon name="check-circle" className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-grow flex flex-col overflow-hidden`}>
                <div className={`p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-lg font-bold border-b-2 border-yellow-500 pb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Stock levels</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Crane"
                            className={`pl-3 pr-10 py-1.5 text-sm border rounded-md w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <div className={`absolute inset-y-0 right-0 pr-0 flex items-center`}>
                            <button className={`p-1.5 rounded-r-md ${theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-black text-white'}`}>
                                <Icon name="search" className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto flex-grow">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>#</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Product</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Shop</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Unit</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Stocked</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Sold</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>In stock</th>
                                <th scope="col" className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Value</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {paginatedStock.map((item, index) => {
                                const isYellowHighlight = (index + (currentPage - 1) * ITEMS_PER_PAGE) === 8; // Mimic the highlight in the image (9th item)
                                const rowClass = isYellowHighlight 
                                    ? 'bg-yellow-300 bg-opacity-90 text-slate-900 hover:bg-yellow-400' 
                                    : (theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50');
                                const textClass = isYellowHighlight ? 'text-slate-900' : (theme === 'dark' ? 'text-slate-300' : 'text-slate-600');
                                const secondaryTextClass = isYellowHighlight ? 'text-slate-700' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-500');

                                return (
                                    <tr key={item.id} className={rowClass}>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${textClass}`}>
                                            {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                                        </td>
                                        <td className={`px-4 py-4 text-sm`}>
                                            <div className={`font-medium ${textClass}`}>{item.productName}</div>
                                            <div className={`text-xs ${secondaryTextClass}`}>SN: {item.productSN}</div>
                                        </td>
                                        <td className={`px-4 py-4 text-sm ${textClass}`}>
                                            {item.shopName}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${textClass}`}>
                                            {item.unit}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-center ${textClass}`}>
                                            {item.stocked.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-center ${textClass}`}>
                                            {item.sold.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-center font-semibold ${textClass}`}>
                                            {item.quantity.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${textClass}`}>
                                            {item.totalValue.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button className={`text-green-500 hover:text-green-700 ${isYellowHighlight ? 'text-green-700' : ''}`} title="Edit">
                                                    <Icon name="edit" className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedItem(item as any); setIsHistoryModalOpen(true); }}
                                                    className={`text-slate-600 hover:text-black ${isYellowHighlight ? 'text-slate-800' : (theme === 'dark' ? 'text-slate-400 hover:text-white' : '')}`} 
                                                    title="History"
                                                >
                                                    <Icon name="history" className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedItem(item as any); setIsReconciliationModalOpen(true); }}
                                                    className={`text-blue-500 hover:text-blue-700 ${isYellowHighlight ? 'text-blue-700' : ''}`} 
                                                    title="Stock Reconciliation"
                                                >
                                                    <Icon name="adjustments" className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                 {/* Pagination */}
                 <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center">
                         <p className={`text-sm mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredStock.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredStock.length)} of {filteredStock.length} records
                        </p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-left" className="h-4 w-4" /></button>
                         <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-right" className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>

            <StockHistoryModal 
                isOpen={isHistoryModalOpen} 
                onClose={() => setIsHistoryModalOpen(false)} 
                item={selectedItem} 
                theme={theme} 
            />

            <StockReconciliationModal 
                isOpen={isReconciliationModalOpen} 
                onClose={() => setIsReconciliationModalOpen(false)} 
                item={selectedItem} 
                theme={theme} 
                onReconcile={handleReconcile}
            />
        </div>
    );
};

export default StockLevelPage;

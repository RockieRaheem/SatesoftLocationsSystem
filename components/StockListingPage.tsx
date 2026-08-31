
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Theme, StockItem, Shop, Purchase, SelectedProduct, User, ProductFormData, ProductDefinition } from '../types';
import Icon, { IconName } from './Icon';
import { mockStockListings, mockPurchases } from '../data';
import NewStockPurchaseModal from './NewStockPurchaseModal'; 
import EditStockItemModal from './EditStockItemModal';
import ArchiveStockItemModal from './ArchiveStockItemModal';
import OpeningStockModal from './OpeningStockModal';
import StockSalesModal from './StockSalesModal';
import ViewStockItemModal from './ViewStockItemModal';

interface StockListingPageProps {
    theme: Theme;
    currentUser: any;
    shops: Shop[];
    users: any[];
    stockItems: StockItem[];
    setStockItems: React.Dispatch<React.SetStateAction<StockItem[]>>;
    products: ProductDefinition[];
    setProducts: React.Dispatch<React.SetStateAction<ProductDefinition[]>>;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: IconName; theme: Theme; colorClass?: string }> = ({ title, value, icon, theme, colorClass = "bg-yellow-500 text-slate-900" }) => (
    <div className={`p-4 rounded-lg shadow-sm border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{title}</p>
            <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-md ${colorClass}`}>
            <Icon name={icon} className={`h-6 w-6`} />
        </div>
    </div>
);

const StockListingPage: React.FC<StockListingPageProps> = ({ theme, currentUser, shops, users, stockItems, setStockItems, products, setProducts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Filter State
    const [filterShopId, setFilterShopId] = useState('');
    const [filterManufacturer, setFilterManufacturer] = useState('');
    const [filterBarcode, setFilterBarcode] = useState('');
    
    // Modals
    const [isNewStockModalOpen, setIsNewStockModalOpen] = useState(false);
    const [isOpeningStockModalOpen, setIsOpeningStockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
    const [itemToArchive, setItemToArchive] = useState<StockItem | null>(null);
    const [itemToView, setItemToView] = useState<StockItem | null>(null);
    const [selectedProductForSales, setSelectedProductForSales] = useState<SelectedProduct | null>(null);
    const [selectedPurchaseForSales, setSelectedPurchaseForSales] = useState<Purchase | null>(null);
    
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
    
    // New Button Dropdown
    const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
    const newMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
                setIsNewMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Derived State
    const uniqueManufacturers = useMemo(() => {
        return [...new Set(stockItems.map(item => item.manufacturer).filter(Boolean))].sort();
    }, [stockItems]);

    const filteredStock = useMemo(() => {
        return stockItems.filter(item => {
            // Search Text
            const matchesSearch = 
                item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.customName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.productSN.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filters
            const matchesShop = filterShopId ? item.shopId.toString() === filterShopId : true;
            const matchesManufacturer = filterManufacturer ? item.manufacturer === filterManufacturer : true;
            const matchesBarcode = filterBarcode ? item.barcode.toLowerCase().includes(filterBarcode.toLowerCase()) : true;

            return matchesSearch && matchesShop && matchesManufacturer && matchesBarcode;
        });
    }, [stockItems, searchTerm, filterShopId, filterManufacturer, filterBarcode]);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);
    
    const paginatedStock = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStock.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStock, currentPage]);

    const startRecord = filteredStock.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
    const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, filteredStock.length);

    const summaryData = useMemo(() => {
        const totalProducts = stockItems.length;
        const available = stockItems.filter(i => i.quantity > 0).length;
        const depleted = stockItems.filter(i => i.quantity === 0).length;
        const categories = new Set(stockItems.map(i => i.category)).size;
        return { totalProducts, available, depleted, categories };
    }, [stockItems]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleSaveNewStock = (data: any) => {
        console.log("New stock added:", data);
        // In a real app, you'd transform `data` into a StockItem and add to state
        // Here we just close modal
    };

    const handleSaveOpeningStock = (newItem: StockItem) => {
        setStockItems(prev => [newItem, ...prev]);
    };
    
    const handleEditClick = (item: StockItem) => {
        setItemToEdit(item);
        setIsEditModalOpen(true);
    };

    const handleViewClick = (item: StockItem) => {
        setItemToView(item);
        setIsViewModalOpen(true);
    };

    const handleUpdateStockItem = (updatedItem: StockItem) => {
        if (stockItems.find(i => i.id === updatedItem.id)) {
            setStockItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        } else {
            // Creating new listed item
             setStockItems(prev => [updatedItem, ...prev]);
        }
        setIsEditModalOpen(false);
    };

    const handleArchiveClick = (item: StockItem) => {
        setItemToArchive(item);
        setIsArchiveModalOpen(true);
    };

    const handleConfirmArchive = (id: number, reason: string) => {
        setStockItems(prev => prev.filter(item => item.id !== id));
        // In a real app, you would send the archive request with reason and password to backend
        console.log(`Archived item ${id} with reason: ${reason}`);
    };
    
    const handleViewSales = (item: StockItem) => {
        // Find or create a mock purchase for this item
        const purchase = mockPurchases.find(p => p.shop === item.shopName) || mockPurchases[0];
        
        const product: SelectedProduct = {
            id: item.productSN,
            name: item.productName,
            sku: item.barcode,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            defaultUnit: item.unit,
            defaultUnitPrice: item.unitPrice,
            unitPricings: []
        };

        setSelectedProductForSales(product);
        setSelectedPurchaseForSales(purchase);
        setIsSalesModalOpen(true);
    };

    const handleResetFilters = () => {
        setFilterShopId('');
        setFilterManufacturer('');
        setFilterBarcode('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const toggleExpand = (id: number) => {
        setExpandedItemId(prev => prev === id ? null : id);
    };

    // Menu Actions
    const handleOpeningStock = () => {
        setIsNewMenuOpen(false);
        setIsOpeningStockModalOpen(true);
    };

    const handleListProduct = () => {
        setIsNewMenuOpen(false);
        setItemToEdit(null);
        setIsEditModalOpen(true);
    };

    const inputClass = `w-full text-sm px-3 py-2 rounded-md border outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;
    const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`;

    return (
        <>
            <StockSalesModal 
                isOpen={isSalesModalOpen}
                onClose={() => setIsSalesModalOpen(false)}
                purchase={selectedPurchaseForSales}
                product={selectedProductForSales}
                theme={theme}
                currentUser={currentUser}
            />
            <NewStockPurchaseModal 
                isOpen={isNewStockModalOpen} 
                onClose={() => setIsNewStockModalOpen(false)} 
                onSave={handleSaveNewStock} 
                theme={theme}
                currentUser={currentUser}
                products={products}
            />
            
            <OpeningStockModal
                isOpen={isOpeningStockModalOpen}
                onClose={() => setIsOpeningStockModalOpen(false)}
                onSave={handleSaveOpeningStock}
                onAddProduct={(newProduct) => setProducts(prev => [newProduct, ...prev])}
                theme={theme}
                shops={shops}
                productDefinitions={products}
                users={users}
            />

            <EditStockItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateStockItem}
                stockItem={itemToEdit}
                theme={theme}
                shops={shops}
                productDefinitions={products}
                users={users}
            />

            <ArchiveStockItemModal 
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                onConfirm={handleConfirmArchive}
                stockItem={itemToArchive}
                theme={theme}
            />

            <ViewStockItemModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                stockItem={itemToView}
                theme={theme}
            />

            <div className="space-y-6 h-full flex flex-col">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                    <SummaryCard title="Products" value={summaryData.totalProducts.toLocaleString()} icon="stock-listing" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Categories" value={summaryData.categories.toString()} icon="product-chain" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Available" value={summaryData.available.toLocaleString()} icon="check-circle" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Depleted" value={summaryData.depleted.toLocaleString()} icon="trash" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                </div>

                {/* Filter Section */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0`}>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`w-full px-4 py-3 flex justify-between items-center text-sm font-medium ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                        <span>Filter</span>
                        <Icon name="chevron-right" className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isFilterOpen && (
                        <div className={`p-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClass}>Shop</label>
                                    <select value={filterShopId} onChange={(e) => setFilterShopId(e.target.value)} className={inputClass}>
                                        <option value="">Select Shop</option>
                                        {shops.map(shop => (
                                            <option key={shop.id} value={shop.id}>{shop.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Manufacturer</label>
                                    <select value={filterManufacturer} onChange={(e) => setFilterManufacturer(e.target.value)} className={inputClass}>
                                        <option value="">Select Manufacturer</option>
                                        {uniqueManufacturers.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Barcode</label>
                                    <input 
                                        type="text" 
                                        value={filterBarcode} 
                                        onChange={(e) => setFilterBarcode(e.target.value)} 
                                        className={inputClass}
                                        placeholder="Enter Barcode"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    onClick={handleResetFilters}
                                    className={`px-4 py-2 text-sm font-medium border rounded-md flex items-center gap-2 transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <Icon name="x-mark" className="h-4 w-4" />
                                    Clear
                                </button>
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="px-4 py-2 text-sm font-medium bg-black text-yellow-500 rounded-md flex items-center gap-2 hover:bg-slate-900 transition-colors border border-black"
                                >
                                    <Icon name="check-circle" className="h-4 w-4" />
                                    Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Table */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-grow flex flex-col overflow-hidden`}>
                    {/* Table Header / Toolbar */}
                    <div className={`p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                            <h2 className={`text-lg font-bold border-b-2 border-yellow-500 pb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Stock listing</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search product name"
                                    className={`pl-3 pr-8 py-1.5 text-sm border rounded-md w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className={`absolute inset-y-0 right-0 pr-2 flex items-center`}>
                                    <button className={`p-1 ${theme === 'dark' ? 'text-yellow-500' : 'text-slate-900'}`}>
                                        <Icon name="search" className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto relative" ref={newMenuRef}>
                            <button 
                                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                                className="px-4 py-2 bg-black text-yellow-500 text-sm font-medium rounded-md hover:bg-slate-900 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Icon name="plus" className="h-4 w-4" />
                                New
                            </button>
                            
                            {/* Dropdown Menu */}
                            {isNewMenuOpen && (
                                <div className={`absolute top-full right-0 mt-2 w-40 rounded-md shadow-lg border z-20 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
                                    <button 
                                        onClick={handleOpeningStock}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}
                                    >
                                        Opening stock
                                    </button>
                                    <button 
                                        onClick={handleListProduct}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}
                                    >
                                        List product
                                    </button>
                                </div>
                            )}

                            <button className={`p-2 rounded-md border transition-colors ${theme === 'dark' ? 'bg-black text-yellow-500 border-black' : 'bg-black text-white border-black'}`}>
                                <Icon name="download" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-grow">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    {['#', 'Product', 'Custom name', 'Bar code', 'Category', 'Quantity', 'Price', 'Listed by', 'Listed on', 'Actions'].map((header) => (
                                        <th key={header} scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {paginatedStock.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <tr className={`${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} ${expandedItemId === item.id ? (theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50') : ''}`}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{startRecord + index}</span>
                                                    <button 
                                                        onClick={() => toggleExpand(item.id)}
                                                        className={`p-1 rounded-full border transition-all ${expandedItemId === item.id ? 'border-yellow-400 text-yellow-500 bg-yellow-500/10' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        <Icon name="chevron-right" className={`h-4 w-4 transition-transform duration-200 ${expandedItemId === item.id ? 'rotate-90' : ''}`} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.productName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{item.customName}</div>
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {item.barcode}
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {item.category}
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {item.currency} {item.unitPrice.toLocaleString()}
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {item.listedBy}
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {new Date(item.listedOn).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => handleEditClick(item)} className="text-green-500 hover:text-green-600" title="Edit Listing"><Icon name="edit" className="h-4 w-4" /></button>
                                                    <button onClick={() => handleArchiveClick(item)} className="text-red-500 hover:text-red-600" title="Archive Listing"><Icon name="archive" className="h-4 w-4" /></button>
                                                    <button onClick={() => handleViewClick(item)} className="text-blue-500 hover:text-blue-600" title="View Details"><Icon name="view" className="h-4 w-4" /></button>
                                                    <button 
                                                        onClick={() => handleViewSales(item)}
                                                        className="text-green-500 hover:text-green-600" 
                                                        title="View Sales"
                                                    >
                                                        <Icon name="stock-listing" className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedItemId === item.id && (
                                            <tr>
                                                <td colSpan={10} className="p-0 border-b-0">
                                                    <div className={`px-8 py-6 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-8">
                                                            <div>
                                                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Manufacturer:</p>
                                                                <p className={`text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.manufacturer}</p>
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Base unit:</p>
                                                                <p className={`text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.baseUnit}</p>
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Shop name:</p>
                                                                <p className={`text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.shopName}</p>
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Barcode:</p>
                                                                <p className={`text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.barcode}</p>
                                                            </div>
                                                            
                                                            <div>
                                                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Has MultipleSale Units:</p>
                                                                <p className={`text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.hasMultipleSaleUnits ? 'True' : 'False'}</p>
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>{item.unit}</p>
                                                                <p className={`text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.currency} {item.unitPrice.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="flex items-center">
                            <p className={`text-sm mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Showing {startRecord} to {endRecord} of {filteredStock.length.toLocaleString()} records
                            </p>
                            <select className={`p-1 rounded border text-xs ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-left" className="h-3 w-3 inline" /><Icon name="chevron-left" className="h-3 w-3 inline -ml-1" /></button>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-left" className="h-4 w-4" /></button>
                            
                            <span className={`px-3 py-1 rounded-md text-sm font-bold bg-yellow-400 text-slate-900`}>{currentPage}</span>
                            
                            {currentPage < totalPages && <button onClick={() => handlePageChange(currentPage + 1)} className={`px-3 py-1 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{currentPage + 1}</button>}
                            {currentPage + 1 < totalPages && <span className="text-slate-400">...</span>}
                            {currentPage + 1 < totalPages && <button onClick={() => handlePageChange(totalPages)} className={`px-3 py-1 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{totalPages}</button>}

                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-right" className="h-4 w-4" /></button>
                            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-right" className="h-3 w-3 inline" /><Icon name="chevron-right" className="h-3 w-3 inline -ml-1" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StockListingPage;

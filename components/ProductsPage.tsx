
import React, { useState, useMemo } from 'react';
import { Theme, ProductDefinition, ActiveView, Country } from '../types';
import { mockProductDefinitions, allAfricanCountries } from '../data';
import Icon, { IconName } from './Icon';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ViewProductModal from './ViewProductModal';
import ProductShopsModal from './ProductShopsModal';
import { formatDate } from '../utils';

interface ProductsPageProps {
    theme: Theme;
    onNavigate: (view: ActiveView) => void;
    products: ProductDefinition[];
    setProducts: React.Dispatch<React.SetStateAction<ProductDefinition[]>>;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: IconName; theme: Theme; color?: string }> = ({ title, value, icon, theme, color = 'text-slate-900' }) => (
    <div className={`p-4 rounded-lg shadow-sm border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{title}</p>
            <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-md ${theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'}`}>
            <Icon name={icon} className={`h-6 w-6`} />
        </div>
    </div>
);

const ProductsPage: React.FC<ProductsPageProps> = ({ theme, onNavigate, products, setProducts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<ProductDefinition | null>(null);
    const [productToView, setProductToView] = useState<ProductDefinition | null>(null);
    const [selectedProductForShops, setSelectedProductForShops] = useState<{name: string, id: number} | null>(null);
    const ITEMS_PER_PAGE = 10;

    // Advanced Filters State
    const [filterCountry, setFilterCountry] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCreatedBy, setFilterCreatedBy] = useState('');
    const [filterManufacturer, setFilterManufacturer] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterContainerUnit, setFilterContainerUnit] = useState('');
    const [filterPackageUnit, setFilterPackageUnit] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Derive unique options for dropdowns
    const uniqueCountries = useMemo(() => [...new Set(products.map(p => p.country).filter(Boolean))].sort(), [products]);
    const uniqueManufacturers = useMemo(() => [...new Set(products.map(p => p.manufacturer).filter(Boolean))].sort(), [products]);
    const uniqueCategories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort(), [products]);
    const uniqueCreators = useMemo(() => [...new Set(products.map(p => p.createdBy).filter(Boolean))].sort(), [products]);
    const uniqueContainerUnits = useMemo(() => [...new Set(products.map(p => p.containerUnit).filter(Boolean))].sort(), [products]);
    
    // Parse package units (saleUnits is comma separated string in mock data)
    const uniquePackageUnits = useMemo(() => {
        const allUnits = products.flatMap(p => p.saleUnits ? p.saleUnits.split(',').map(u => u.trim()) : []);
        return [...new Set(allUnits)].filter(Boolean).sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Text Search
            const matchesSearch = 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // Advanced Filters
            if (filterStatus && p.status !== filterStatus) return false;
            if (filterCreatedBy && p.createdBy !== filterCreatedBy) return false;
            if (filterManufacturer && p.manufacturer !== filterManufacturer) return false;
            if (filterCategory && p.category !== filterCategory) return false;
            if (filterContainerUnit && p.containerUnit !== filterContainerUnit) return false;
            
            // Package unit is a contains check since saleUnits is a list string
            if (filterPackageUnit && (!p.saleUnits || !p.saleUnits.includes(filterPackageUnit))) return false;

            if (filterStartDate) {
                const start = new Date(filterStartDate);
                const created = new Date(p.createdAt || '');
                if (created < start) return false;
            }
            if (filterEndDate) {
                const end = new Date(filterEndDate);
                end.setHours(23, 59, 59, 999);
                const created = new Date(p.createdAt || '');
                if (created > end) return false;
            }

            return true;
        });
    }, [products, searchTerm, filterCountry, filterStatus, filterCreatedBy, filterManufacturer, filterCategory, filterContainerUnit, filterPackageUnit, filterStartDate, filterEndDate]);

    const handleResetFilters = () => {
        setFilterCountry('');
        setFilterStatus('');
        setFilterCreatedBy('');
        setFilterManufacturer('');
        setFilterCategory('');
        setFilterContainerUnit('');
        setFilterPackageUnit('');
        setFilterStartDate('');
        setFilterEndDate('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleAddProduct = (newProductData: Omit<ProductDefinition, 'id' | 'sn' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        const newProduct: ProductDefinition = {
            ...newProductData,
            id: newId,
            sn: `PDT${Math.floor(Math.random() * 10000000)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Paul Mboya', // Mock current user
            createdBy: 'Paul Mboya',
        };
        setProducts([newProduct, ...products]);
    };

    const handleEditClick = (product: ProductDefinition) => {
        setProductToEdit(product);
        setIsEditModalOpen(true);
    };

    const handleViewClick = (product: ProductDefinition) => {
        setProductToView(product);
        setIsViewModalOpen(true);
    };

    const handleUpdateProduct = (updatedProduct: ProductDefinition) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startRecord = filteredProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
    const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedProductId(expandedProductId === id ? null : id);
    };

    const inputClass = `w-full text-sm px-3 py-2 rounded-md border outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;
    const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`;

    return (
        <>
        <AddProductModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleAddProduct}
            theme={theme}
        />
        <EditProductModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleUpdateProduct}
            productToEdit={productToEdit}
            theme={theme}
        />
        <ViewProductModal 
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            product={productToView}
            theme={theme}
        />
        <ProductShopsModal 
            isOpen={!!selectedProductForShops} 
            onClose={() => setSelectedProductForShops(null)} 
            product={selectedProductForShops} 
            theme={theme} 
        />
        
        <div className="space-y-6 h-full flex flex-col">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                <SummaryCard title="Countries" value={uniqueCountries.length.toString()} icon="countries" theme={theme} />
                <SummaryCard title="Manufacturers" value={uniqueManufacturers.length.toString()} icon="shop-mgt" theme={theme} />
                <SummaryCard title="Categories" value={uniqueCategories.length.toString()} icon="globe" theme={theme} />
                <SummaryCard title="Products" value={products.length.toLocaleString()} icon="stock-listing" theme={theme} />
            </div>

            {/* Filter Section */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0`}>
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`w-full px-4 py-3 flex justify-between items-center text-sm font-bold ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                    <span>Filter</span>
                    <Icon name="chevron-right" className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-90' : ''}`} />
                </button>
                {isFilterOpen && (
                    <div className={`p-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Row 1 */}
                            <div>
                                <label className={labelClass}>Status</label>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
                                    <option value="">Select status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Created by</label>
                                <select value={filterCreatedBy} onChange={(e) => setFilterCreatedBy(e.target.value)} className={inputClass}>
                                    <option value="">Select user</option>
                                    {uniqueCreators.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Manufacturer</label>
                                <select value={filterManufacturer} onChange={(e) => setFilterManufacturer(e.target.value)} className={inputClass}>
                                    <option value="">Select manufacturer</option>
                                    {uniqueManufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {/* Row 2 */}
                            <div>
                                <label className={labelClass}>Category</label>
                                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={inputClass}>
                                    <option value="">Select category</option>
                                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Container Unit</label>
                                <select value={filterContainerUnit} onChange={(e) => setFilterContainerUnit(e.target.value)} className={inputClass}>
                                    <option value="">Select container unit</option>
                                    {uniqueContainerUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Package Unit</label>
                                <select value={filterPackageUnit} onChange={(e) => setFilterPackageUnit(e.target.value)} className={inputClass}>
                                    <option value="">Select package unit</option>
                                    {uniquePackageUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>

                            {/* Row 3 */}
                            <div>
                                <label className={labelClass}>Start Date</label>
                                <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>End Date</label>
                                <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className={inputClass} />
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
                            <button className="px-4 py-2 text-sm font-medium bg-black text-yellow-500 rounded-md flex items-center gap-2 hover:bg-slate-900 transition-colors border border-black">
                                <Icon name="check-circle" className="h-4 w-4" />
                                Filter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Table Section */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-grow flex flex-col overflow-hidden`}>
                <div className={`p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-lg font-bold border-b-2 border-yellow-500 pb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Products</h2>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0 md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                className={`pl-9 pr-3 py-2 text-sm border rounded-md w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className={`absolute inset-y-0 right-0 pr-2 flex items-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} my-1 mr-1 rounded px-2`}>
                                <Icon name="search" className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-black text-yellow-500 text-sm font-medium rounded-md hover:bg-slate-900 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            New
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto flex-grow">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>#</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Image</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>SN</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Product</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Barcode</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Manufacturer</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Listed Shops</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created by</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {paginatedProducts.map((product, index) => (
                                <React.Fragment key={product.id}>
                                    <tr className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{startRecord + index}</span>
                                                <button 
                                                    onClick={() => toggleExpand(product.id)}
                                                    className={`p-1 rounded-full transition-transform ${expandedProductId === product.id ? 'rotate-180' : ''} ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                                                >
                                                    <Icon name="chevron-down" className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-10 h-10 rounded border overflow-hidden bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon name="stock-listing" className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{product.sn}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.name}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{product.barcode}</td>
                                        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{product.manufacturer}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedProductForShops({ name: product.name, id: product.id }); }}
                                                className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors text-white ${
                                                    theme === 'dark'
                                                    ? 'bg-slate-700 hover:bg-yellow-500 hover:text-slate-900'
                                                    : 'bg-slate-600 hover:bg-yellow-500 hover:text-slate-900'
                                                }`}
                                            >
                                                {Math.floor((product.id * 17) % 20) + 5}
                                            </button>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{product.createdBy}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => handleEditClick(product)} className="text-green-500 hover:text-green-600"><Icon name="edit" className="h-4 w-4" /></button>
                                                <button onClick={() => handleViewClick(product)} className="text-blue-500 hover:text-blue-600"><Icon name="view" className="h-4 w-4" /></button>
                                                <button className="text-red-500 hover:text-red-600"><Icon name="trash" className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedProductId === product.id && (
                                        <tr>
                                            <td colSpan={10} className={`px-6 py-6 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100'}`}>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4 gap-x-8">
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Category:</p>
                                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.category || 'Unknown'}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Base unit:</p>
                                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                                            {product.baseUnit} {product.baseQuantity ? `(${product.baseQuantity})` : ''}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="md:col-span-2">
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Sale Units</p>
                                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.saleUnits || '-'}</p>
                                                    </div>

                                                    {/* New Tracking Info */}
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Batch Tracking:</p>
                                                        <div className={`text-sm font-medium mt-1`}>
                                                            {product.hasBatchNumber ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Expiry Tracking:</p>
                                                        <div className={`text-sm font-medium mt-1`}>
                                                            {product.hasExpiryDate ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Date created:</p>
                                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{formatDate(product.createdAt)}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created by:</p>
                                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.createdBy}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Date last changed:</p>
                                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{formatDate(product.updatedAt)}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Changed by:</p>
                                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.updatedBy || '-'}</p>
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
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Showing {startRecord} to {endRecord} of {filteredProducts.length.toLocaleString()} records
                        <select className={`ml-2 p-1 rounded border text-xs ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                    </p>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className={`p-1 text-xs font-medium hover:underline disabled:opacity-50 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                            <Icon name="chevron-left" className="h-3 w-3 inline mr-1" />
                            <Icon name="chevron-left" className="h-3 w-3 inline -ml-2" />
                        </button>
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50`}
                        >
                            <Icon name="chevron-left" className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                        </button>
                        
                        <span className={`px-3 py-1 rounded-md text-sm font-bold bg-yellow-400 text-slate-900`}>
                            {currentPage}
                        </span>
                        
                        {currentPage < totalPages && (
                             <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                className={`px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-800 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                            >
                                {currentPage + 1}
                            </button>
                        )}
                        
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50`}
                        >
                            <Icon name="chevron-right" className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                        </button>
                        <button 
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`p-1 text-xs font-medium hover:underline disabled:opacity-50 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                            <Icon name="chevron-right" className="h-3 w-3 inline mr-1" />
                            <Icon name="chevron-right" className="h-3 w-3 inline -ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ProductsPage;

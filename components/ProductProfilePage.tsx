
import React, { useState, useMemo } from 'react';
import { Theme, ProductDefinition } from '../types';
import { mockProductDefinitions, mockStockListings } from '../data';
import Icon, { IconName } from './Icon';
import { BarChart } from './Charts';

interface ProductProfilePageProps {
    theme: Theme;
}

// Mock regional data for drilldown
const mockRegionalSales: Record<string, { value: number, districts: { name: string, value: number }[] }> = {
    "Central": { 
        value: 4500, 
        districts: [
            { name: "Kampala", value: 2200 },
            { name: "Wakiso", value: 1300 },
            { name: "Mukono", value: 1000 }
        ]
    },
    "Western": { 
        value: 3200, 
        districts: [
            { name: "Mbarara", value: 1200 },
            { name: "Kabale", value: 800 },
            { name: "Fort Portal", value: 1200 }
        ]
    },
    "Eastern": { 
        value: 2800, 
        districts: [
            { name: "Jinja", value: 1000 },
            { name: "Mbale", value: 900 },
            { name: "Iganga", value: 900 }
        ]
    },
    "Northern": { 
        value: 1500, 
        districts: [
            { name: "Gulu", value: 700 },
            { name: "Lira", value: 500 },
            { name: "Arua", value: 300 }
        ]
    }
};

const SalesDrillDownChart: React.FC<{ theme: Theme; height?: number }> = ({ theme, height = 300 }) => {
    const [currentLevel, setCurrentLevel] = useState<'Region' | 'District'>('Region');
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    const chartData = useMemo(() => {
        if (currentLevel === 'Region') {
            const colors = theme === 'dark' ? ['#60A5FA', '#34D399', '#FBBF24', '#F87171'] : ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
            return Object.keys(mockRegionalSales).map((region, index) => ({
                name: region,
                value: mockRegionalSales[region].value,
                color: colors[index % colors.length]
            }));
        } else if (selectedRegion) {
            // Use a single color for district drilldown
            const districtColor = theme === 'dark' ? '#818CF8' : '#6366F1';
            return mockRegionalSales[selectedRegion].districts.map(d => ({
                name: d.name,
                value: d.value,
                color: districtColor
            }));
        }
        return [];
    }, [currentLevel, selectedRegion, theme]);

    const handleBarClick = (item: any) => {
        if (currentLevel === 'Region') {
            setSelectedRegion(item.name);
            setCurrentLevel('District');
        }
    };

    const handleBack = () => {
        setCurrentLevel('Region');
        setSelectedRegion(null);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {currentLevel === 'District' && (
                        <button 
                            onClick={handleBack}
                            className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <Icon name="chevron-left" className="h-4 w-4" />
                        </button>
                    )}
                    <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        Sales by {currentLevel} {selectedRegion ? `(${selectedRegion})` : ''}
                    </h4>
                </div>
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {currentLevel === 'Region' ? 'Click bar to drill down' : ''}
                </span>
            </div>
            <div className="flex-grow">
                <BarChart data={chartData} theme={theme} onBarClick={handleBarClick} height={height} />
            </div>
        </div>
    );
};

const ShopListCard = ({ title, count, shops, icon, colorClass, theme }: { title: string, count: number, shops: {name: string, location: string}[], icon: IconName, colorClass: string, theme: Theme }) => (
    <div className={`rounded-lg border flex flex-col h-96 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
                <Icon name={icon} className={`h-5 w-5 ${colorClass}`} />
                <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{title}</h4>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
        </div>
        <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
            {shops.length > 0 ? (
                <ul className="space-y-1">
                    {shops.map((shop, idx) => (
                        <li key={idx} className={`text-sm p-2 rounded flex justify-between items-center transition-colors ${theme === 'dark' ? 'hover:bg-slate-700/50 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
                            <span className="font-medium">{shop.name}</span>
                            {shop.location && <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{shop.location}</span>}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={`h-full flex items-center justify-center text-xs ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>No shops found</div>
            )}
        </div>
    </div>
);

const ProductProfilePage: React.FC<ProductProfilePageProps> = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedProduct, setSearchedProduct] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'similar'>('overview');

    // Mock list of "Recent" or "Popular" products to suggest
    const suggestedProducts = [
        "Coca Cola 500ml",
        "Colgate Herbal Toothpaste 35g",
        "Good Doctor Super Doctor G08, ...",
        "Nanchuang Nail Clipper Cutter,...",
        "Krishna Candle Jumbo 8Pcs, Cue...",
        "Alteco Super Glue 3g, Krishna ...",
        "Best Star Baby Pants Maxi 8-18...",
        "Cotton Red Hankies, Dent Up He...",
        "Super Chunky Lollipops, Lato I...",
        "Choco Coffee, Choco Strawberry...",
        "Pago Pago Small Lollipop, Down..."
    ];

    const handleSearch = () => {
        if (searchTerm.trim()) {
            setSearchedProduct(searchTerm);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSelectProduct = (product: string) => {
        setSearchTerm(product);
        setSearchedProduct(product);
    };

    const productStats = useMemo(() => {
        if (!searchedProduct) return null;

        // Extract weight hint from name
        const weightMatch = searchedProduct.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)/i);
        const unitWeight = weightMatch ? parseFloat(weightMatch[1]) : 1;
        const unitType = weightMatch ? weightMatch[2].toLowerCase() : 'unit';
        
        const totalQtySold = Math.floor(Math.random() * 5000) + 500;
        
        // Calculate total weight
        let totalWeightVal = totalQtySold * unitWeight;
        let totalWeightStr = '';
        
        if (unitType === 'g') {
            totalWeightStr = (totalWeightVal / 1000).toFixed(2) + ' kg';
        } else if (unitType === 'ml') {
            totalWeightStr = (totalWeightVal / 1000).toFixed(2) + ' L';
        } else {
            totalWeightStr = totalWeightVal.toLocaleString() + ' ' + unitType;
        }

        // Price Calculations
        const basePrice = Math.floor(Math.random() * 50000) + 5000;
        const minPrice = Math.floor(basePrice * 0.85);
        const maxPrice = Math.floor(basePrice * 1.25);
        const avgPrice = Math.floor((minPrice + maxPrice) / 2);

        // Listing Status Logic
        const shopsListed = Math.floor(Math.random() * 20) + 5;
        const shopsDelisted = Math.floor(Math.random() * 5);
        const shopsOutOfStock = Math.floor(Math.random() * (shopsListed / 2)); // Subset of listed

        // Specific image for Colgate and Coca Cola
        let imageUrl = `https://placehold.co/400x400/e2e8f0/475569?text=${encodeURIComponent(searchedProduct.substring(0, 20))}`;
        if (searchedProduct.toLowerCase().includes('colgate')) {
            imageUrl = "https://images.unsplash.com/photo-1559587143-14426697d5a5?q=80&w=800&auto=format&fit=crop";
        } else if (searchedProduct.toLowerCase().includes('coca cola') || searchedProduct.toLowerCase().includes('coke')) {
            imageUrl = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop";
        }

        // Generate mock shop lists
        const generateMockShopList = (count: number, type: string) => {
            const locations = ['Kampala', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Entebbe', 'Mbale', 'Kasese'];
            return Array.from({ length: count }, (_, i) => ({
                name: `${type} Outlet ${String(i + 1).padStart(3, '0')}`,
                location: locations[Math.floor(Math.random() * locations.length)]
            }));
        };

        const listedShopsData = generateMockShopList(shopsListed, 'Retail');
        const outOfStockShopsData = generateMockShopList(shopsOutOfStock, 'Retail');
        const delistedShopsData = generateMockShopList(shopsDelisted, 'Former');

        const currentProduct = mockProductDefinitions.find(p => p.name === searchedProduct);
        const productCategory = currentProduct?.category || ['Household', 'Medical', 'Industrial'][Math.floor(Math.random() * 3)];

        const systemSimilar = mockProductDefinitions
            .filter(p => p.name !== searchedProduct && p.category === productCategory)
            .slice(0, 4);

        const similarProducts: any[] = (systemSimilar.length > 0 ? systemSimilar : Array.from({ length: 4 })).map((p: any, i: number) => {
            const name = p?.name || `Similar ${searchedProduct} Alternative ${i + 1}`;
            const category = p?.category || ['Household', 'Medical', 'Industrial'][Math.floor(Math.random() * 3)];
            const base = (Math.floor(Math.random() * 10) + 5) * 1000;
            
            // Try to find if this product has a price in mockStockListings
            const stockItem = mockStockListings.find(si => si.productName === name);
            const actualPrice = stockItem?.unitPrice || base;

            return {
                name,
                category,
                wholesale: {
                    dozen: { min: actualPrice * 10, max: actualPrice * 11 },
                    carton: { min: actualPrice * 100, max: actualPrice * 110 },
                },
                retail: {
                    dozen: { min: actualPrice * 11.5, max: actualPrice * 13, margin: 12 + Math.random() * 8 },
                    piece: { min: actualPrice * 1.1, max: actualPrice * 1.4, margin: 18 + Math.random() * 12 },
                }
            };
        });

        return {
            description: `High-quality stock item sourced directly from top-tier manufacturers to ensure consistent quality and customer satisfaction.`,
            purchasesThisYear: Math.floor(Math.random() * 150) + 20,
            returns: Math.floor(Math.random() * 50),
            expirations: Math.floor(Math.random() * 20),
            qtyTaken: totalQtySold,
            totalWeight: totalWeightStr,
            shopsListed: shopsListed,
            shopsDelisted: shopsDelisted,
            shopsOutOfStock: shopsOutOfStock,
            sku: currentProduct?.sn || `SKU-${Math.floor(Math.random() * 100000)}`,
            category: productCategory,
            imageUrl: imageUrl,
            lowestPrice: minPrice,
            averagePrice: avgPrice,
            highestPrice: maxPrice,
            stockOutLongest: `${Math.floor(Math.random() * 20) + 1} days`,
            stockOutShortest: `${Math.floor(Math.random() * 10) + 1} hours`,
            stockOutAverage: `${Math.floor(Math.random() * 5) + 1} days`,
            listedShopsData,
            outOfStockShopsData,
            delistedShopsData,
            similarProducts
        };
    }, [searchedProduct]);

    const hourlySalesData = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => ({
            name: `${i.toString().padStart(2, '0')}:00`,
            value: Math.floor(Math.random() * 50) + (i > 8 && i < 20 ? 20 : 5), // Higher sales during day
            color: theme === 'dark' ? '#A78BFA' : '#8B5CF6' // Violet
        }));
    }, [searchedProduct, theme]);

    const StatCard = ({ label, value, icon, colorClass }: { label: string, value: string | number, icon: IconName, colorClass: string }) => (
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between h-32 transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                <div className={`p-2 rounded-full ${colorClass.replace('text-', 'bg-').replace('500', '100')} ${theme === 'dark' ? 'bg-opacity-10' : ''}`}>
                    <Icon name={icon} className={`h-5 w-5 ${colorClass}`} />
                </div>
            </div>
            <div>
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</span>
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Recorded this year</div>
            </div>
        </div>
    );

    const inputClass = `w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-300 placeholder-slate-400'}`;

    return (
        <div className="w-full">
            {/* Search Header - Only visible when no product is selected */}
            {!searchedProduct && (
                <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-8 rounded-lg shadow-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} mb-6`}>
                    <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Product Profile Report</h1>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>View detailed performance metrics, distribution, and specifications for any product.</p>
                    
                    <div className="flex gap-3 max-w-2xl">
                        <div className="relative flex-grow">
                            <Icon name="search" className={`absolute left-4 top-3.5 h-5 w-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input 
                                type="text" 
                                placeholder="Search by product name or SKU..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`pl-11 ${inputClass}`}
                            />
                        </div>
                        <button 
                            onClick={handleSearch}
                            className="px-6 py-3 bg-yellow-500 text-slate-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                        >
                            Search
                        </button>
                    </div>

                    <div className="mt-8">
                        <p className={`text-sm font-semibold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Suggested Products</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedProducts.map((prod, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectProduct(prod)}
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-yellow-400' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    {prod}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {searchedProduct && productStats ? (
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden animate-fade-in`}>
                    {/* Product Header Info */}
                    <div className="p-8 pb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                                        {productStats.category}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                        Active Stock
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-mono ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                        {productStats.sku}
                                    </span>
                                </div>
                                <h2 className={`text-3xl font-bold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                    {searchedProduct}
                                </h2>
                            </div>
                            <button 
                                onClick={() => { setSearchedProduct(null); setSearchTerm(''); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <Icon name="search" className="h-4 w-4" />
                                <span className="text-sm font-medium">New Search</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation - Now below the name */}
                    <div className={`flex border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'}`}>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'overview' 
                                ? 'border-yellow-500 text-yellow-500' 
                                : `border-transparent ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}`}
                        >
                            Product Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('similar')}
                            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'similar' 
                                ? 'border-yellow-500 text-yellow-500' 
                                : `border-transparent ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}`}
                        >
                            Similar Products & Pricing
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'overview' ? (
                            <>
                                {/* Top Section: Image & Info */}
                                <div className="flex flex-col md:flex-row mb-8 items-start gap-4">
                                    <div className={`w-56 h-56 flex-shrink-0 rounded-xl overflow-hidden border flex items-center justify-center ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}>
                                        <Icon name="archive" className={`h-24 w-24 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
                                    </div>
                                    <div className={`flex-1 p-5 flex flex-col justify-between space-y-4 border rounded-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-800/10' : 'border-slate-200 bg-slate-50/30'}`}>
                                        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {productStats.description}
                                        </p>
                                        
                                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Distribution Reach & Stock Status</h4>
                                            <div className="flex flex-col space-y-3">
                                                
                                                {/* Progress Bar Breakdown */}
                                                <div className="w-full h-3 bg-gray-200 rounded-full flex overflow-hidden dark:bg-slate-700">
                                                    <div className="bg-green-500 h-full" style={{ width: `${((productStats.shopsListed - productStats.shopsOutOfStock) / (productStats.shopsListed + productStats.shopsDelisted)) * 100}%` }}></div>
                                                    <div className="bg-red-500 h-full" style={{ width: `${(productStats.shopsOutOfStock / (productStats.shopsListed + productStats.shopsDelisted)) * 100}%` }}></div>
                                                    <div className="bg-gray-500 h-full" style={{ width: `${(productStats.shopsDelisted / (productStats.shopsListed + productStats.shopsDelisted)) * 100}%` }}></div>
                                                </div>

                                                {/* Legend / Stats */}
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Active</span>
                                                        <span className={`text-base font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{productStats.shopsListed}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>OOS</span>
                                                        <span className={`text-base font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{productStats.shopsOutOfStock}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Delisted</span>
                                                        <span className={`text-base font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{productStats.shopsDelisted}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div>
                                    <h3 className={`text-lg font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                        <Icon name="analytics" className="h-5 w-5 mr-2 text-yellow-500" />
                                        Annual Performance Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <StatCard 
                                            label="Total Purchases" 
                                            value={productStats.purchasesThisYear} 
                                            icon="stock-purchase" 
                                            colorClass="text-blue-500" 
                                        />
                                        <StatCard 
                                            label="Quantity Taken" 
                                            value={productStats.qtyTaken.toLocaleString()} 
                                            icon="cash" 
                                            colorClass="text-green-500" 
                                        />
                                        <StatCard 
                                            label="Total Weight" 
                                            value={productStats.totalWeight} 
                                            icon="product-chain" 
                                            colorClass="text-purple-500" 
                                        />
                                        <StatCard 
                                            label="Returns" 
                                            value={productStats.returns} 
                                            icon="reply" 
                                            colorClass="text-red-500" 
                                        />
                                        <StatCard 
                                            label="Reported Expirations" 
                                            value={productStats.expirations} 
                                            icon="trash" 
                                            colorClass="text-orange-500" 
                                        />
                                        <StatCard 
                                            label="Active Shops" 
                                            value={productStats.shopsListed} 
                                            icon="shop-mgt" 
                                            colorClass="text-yellow-500" 
                                        />
                                        <StatCard 
                                            label="Shortest Stock Out" 
                                            value={productStats.stockOutShortest} 
                                            icon="history" 
                                            colorClass="text-emerald-500" 
                                        />
                                        <StatCard 
                                            label="Avg. Stock Out Time" 
                                            value={productStats.stockOutAverage} 
                                            icon="history" 
                                            colorClass="text-cyan-500" 
                                        />
                                        <StatCard 
                                            label="Longest Stock Out" 
                                            value={productStats.stockOutLongest} 
                                            icon="history" 
                                            colorClass="text-rose-500" 
                                        />
                                        <StatCard 
                                            label="Lowest Price" 
                                            value={`UGX ${productStats.lowestPrice.toLocaleString()}`} 
                                            icon="arrow-down" 
                                            colorClass="text-indigo-500" 
                                        />
                                        <StatCard 
                                            label="Average Price" 
                                            value={`UGX ${productStats.averagePrice.toLocaleString()}`} 
                                            icon="finances" 
                                            colorClass="text-teal-500" 
                                        />
                                        <StatCard 
                                            label="Highest Price" 
                                            value={`UGX ${productStats.highestPrice.toLocaleString()}`} 
                                            icon="arrow-up" 
                                            colorClass="text-pink-500" 
                                        />
                                    </div>
                                </div>

                                {/* Charts Section */}
                                <div className="mt-8 grid grid-cols-1 lg:grid-cols-1 gap-6">
                                    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Regional Sales Distribution</h3>
                                        <SalesDrillDownChart theme={theme} height={300} />
                                    </div>
                                    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Hourly Sales (24h)</h3>
                                        <div className="w-full">
                                            <BarChart data={hourlySalesData} theme={theme} height={300} labelInterval={2} />
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Lists Section */}
                                <div className="mt-8">
                                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Shop Distribution Status</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <ShopListCard 
                                            title="Listed Shops" 
                                            count={productStats.shopsListed} 
                                            shops={productStats.listedShopsData}
                                            icon="shop-mgt"
                                            colorClass="text-green-500"
                                            theme={theme}
                                        />
                                        <ShopListCard 
                                            title="Out of Stock" 
                                            count={productStats.shopsOutOfStock} 
                                            shops={productStats.outOfStockShopsData}
                                            icon="exclamation-triangle"
                                            colorClass="text-red-500"
                                            theme={theme}
                                        />
                                        <ShopListCard 
                                            title="Delisted Shops" 
                                            count={productStats.shopsDelisted} 
                                            shops={productStats.delistedShopsData}
                                            icon="trash"
                                            colorClass="text-gray-500"
                                            theme={theme}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Similar Products Market Analysis</h3>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Comparative pricing and profit margins for related items in the category.</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'} text-xs font-mono`}>
                                        Category: {productStats.category}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className={`text-xs uppercase tracking-wider font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                                <th className="px-4 py-4 border-b border-slate-700/50">Product Name</th>
                                                <th className="px-4 py-4 border-b border-slate-700/50 text-center" colSpan={2}>Wholesale (UGX)</th>
                                                <th className="px-4 py-4 border-b border-slate-700/50 text-center" colSpan={3}>Retail (UGX)</th>
                                            </tr>
                                            <tr className={`text-[10px] uppercase tracking-tighter font-bold ${theme === 'dark' ? 'bg-slate-800/50 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <th className="px-4 py-2 border-b border-slate-700/50 italic">Alternative Options</th>
                                                <th className="px-4 py-2 border-b border-slate-700/50 text-center">Dozen (Min-Max)</th>
                                                <th className="px-4 py-2 border-b border-slate-700/50 text-center">Carton (Min-Max)</th>
                                                <th className="px-4 py-2 border-b border-slate-700/50 text-center">Dozen (Min-Max)</th>
                                                <th className="px-4 py-2 border-b border-slate-700/50 text-center">Piece (Min-Max)</th>
                                                <th className="px-4 py-2 border-b border-slate-700/50 text-center text-yellow-500">Margin (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`text-sm divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                            {productStats.similarProducts.map((item: any, idx: number) => (
                                                <tr key={idx} className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col">
                                                            <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</span>
                                                            <span className={`text-[10px] uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{item.category}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center font-mono text-xs">
                                                        <div className="flex flex-col">
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.wholesale.dozen.min.toLocaleString()}</span>
                                                            <span className="text-[10px] opacity-50">-</span>
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.wholesale.dozen.max.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center font-mono text-xs">
                                                        <div className="flex flex-col">
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.wholesale.carton.min.toLocaleString()}</span>
                                                            <span className="text-[10px] opacity-50">-</span>
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.wholesale.carton.max.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center font-mono text-xs">
                                                        <div className="flex flex-col">
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.retail.dozen.min.toLocaleString()}</span>
                                                            <span className="text-[10px] opacity-50">-</span>
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.retail.dozen.max.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center font-mono text-xs">
                                                        <div className="flex flex-col">
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.retail.piece.min.toLocaleString()}</span>
                                                            <span className="text-[10px] opacity-50">-</span>
                                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item.retail.piece.max.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`px-2 py-1 rounded text-[10px] font-bold ${theme === 'dark' ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                                {item.retail.piece.margin.toFixed(1)}%
                                                            </div>
                                                            <span className={`text-[9px] mt-1 uppercase ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Avg. Piece</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={`p-6 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} text-center`}>
                                    <Icon name="analytics" className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm italic">Pricing data is aggregated from verified retail and wholesale partners across the region. Margins are calculated based on average landing costs vs. suggested retail prices.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                searchTerm && (
                    <div className="text-center py-12">
                        <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Icon name="search" className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Product Not Found</h3>
                        <p className={`mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Try searching for a different product name or SKU.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default ProductProfilePage;

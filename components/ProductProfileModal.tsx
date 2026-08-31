
import React, { useState, useMemo } from 'react';
import { Theme, ProductDefinition } from '../types';
import Icon, { IconName } from './Icon';
import { BarChart } from './Charts';
import { mockProductDefinitions } from '../data';

interface ProductProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string | null;
    theme: Theme;
}

// Mock regional data for drilldown (Duplicated for Modal context)
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
                    {currentLevel === 'Region' ? 'Click to drill down' : ''}
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

const StarRatingDisplay = ({ rating, theme }: { rating: number, theme: Theme }) => (
    <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Icon 
                key={star} 
                name="star" 
                className={`h-3 w-3 ${star <= Math.round(rating) ? 'text-yellow-400' : (theme === 'dark' ? 'text-slate-600' : 'text-slate-300')}`} 
            />
        ))}
    </div>
);

const ProductProfileModal: React.FC<ProductProfileModalProps> = ({ isOpen, onClose, productName, theme }) => {
    if (!isOpen || !productName) return null;

    // Mock Data Generation based on product name to simulate a real backend response
    const productStats = useMemo(() => {
        const product = mockProductDefinitions.find(p => p.name === productName);
        
        // Extract weight hint from name (e.g., "35g", "1kg")
        const weightMatch = productName.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)/i);
        const unitWeight = weightMatch ? parseFloat(weightMatch[1]) : 1; // Default 1 if no weight found
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
        let imageUrl = `https://placehold.co/400x400/e2e8f0/475569?text=${encodeURIComponent(productName.substring(0, 20))}`;
        if (productName.toLowerCase().includes('colgate')) {
            imageUrl = "https://images.unsplash.com/photo-1559587143-14426697d5a5?q=80&w=800&auto=format&fit=crop";
        } else if (productName.toLowerCase().includes('coca cola') || productName.toLowerCase().includes('coke')) {
            imageUrl = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop";
        }

        return {
            description: `High-quality stock item commonly used in household and retail environments. Sourced directly from top-tier manufacturers to ensure consistent quality and customer satisfaction.`,
            purchasesThisYear: Math.floor(Math.random() * 150) + 20,
            returns: Math.floor(Math.random() * 50),
            expirations: Math.floor(Math.random() * 20),
            qtyTaken: totalQtySold,
            totalWeight: totalWeightStr,
            shopsListed: shopsListed,
            shopsDelisted: shopsDelisted,
            shopsOutOfStock: shopsOutOfStock,
            sku: `SKU-${Math.floor(Math.random() * 100000)}`,
            category: ['Household', 'Medical', 'Industrial'][Math.floor(Math.random() * 3)],
            imageUrl: imageUrl,
            lowestPrice: minPrice,
            averagePrice: avgPrice,
            highestPrice: maxPrice,
            stockOutLongest: `${Math.floor(Math.random() * 20) + 1} days`,
            stockOutShortest: `${Math.floor(Math.random() * 10) + 1} hours`,
            stockOutAverage: `${Math.floor(Math.random() * 5) + 1} days`,
            isGlobal: product?.isGlobal ?? true,
            continents: product?.continents ?? [],
            economicZones: product?.economicZones ?? [],
            countries: product?.countries ?? [],
            listedShopsData: Array.from({ length: shopsListed }, (_, i) => ({ name: `Shop ${i + 1}`, location: 'Kampala' })),
            outOfStockShopsData: Array.from({ length: shopsOutOfStock }, (_, i) => ({ name: `Shop ${i + 10}`, location: 'Wakiso' })),
            delistedShopsData: Array.from({ length: shopsDelisted }, (_, i) => ({ name: `Shop ${i + 20}`, location: 'Mukono' }))
        };
    }, [productName]);

    const hourlySalesData = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => ({
            name: `${i.toString().padStart(2, '0')}:00`,
            value: Math.floor(Math.random() * 50) + (i > 8 && i < 20 ? 20 : 5), // Higher sales during day
            color: theme === 'dark' ? '#A78BFA' : '#8B5CF6' // Violet
        }));
    }, [productName, theme]);

    // Calculate Rate of Sale (Average units per hour based on 24h data)
    const rateOfSale = useMemo(() => {
        const total24h = hourlySalesData.reduce((acc, curr) => acc + curr.value, 0);
        return (total24h / 24).toFixed(1);
    }, [hourlySalesData]);

    // Mock Reviews
    const reviews = useMemo(() => [
        { id: 1, user: "John D.", rating: 5, date: "2 days ago", comment: "Fast moving product, customers love it." },
        { id: 2, user: "Sarah M.", rating: 4, date: "1 week ago", comment: "Good margins, but supply chain can be slow." },
        { id: 3, user: "Michael K.", rating: 5, date: "2 weeks ago", comment: "Consistent quality, zero returns so far." },
        { id: 4, user: "Lisa R.", rating: 3, date: "3 weeks ago", comment: "Packaging damaged on last delivery." },
    ], [productName]);

    const StatCard = ({ label, value, icon, colorClass }: { label: string, value: string | number, icon: IconName, colorClass: string }) => (
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between h-32`}>
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className={`w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} animate-fade-in`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Product Profile</h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{productStats.sku}</p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {/* Top Section: Image & Info */}
                    <div className="flex flex-col md:flex-row mb-6 items-start gap-3">
                        <div className={`w-56 h-56 flex-shrink-0 rounded-xl overflow-hidden border flex items-center justify-center ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}>
                            <Icon name="archive" className={`h-20 w-20 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
                        </div>
                        <div className={`flex-1 p-4 flex flex-col justify-between space-y-3 border rounded-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-800/10' : 'border-slate-200 bg-slate-50/30'}`}>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                                    {productStats.category}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                    Active Stock
                                </span>
                            </div>
                            <h1 className={`text-2xl font-bold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                {productName}
                            </h1>
                            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {productStats.description}
                            </p>
                            
                            <div className={`p-3 rounded-lg border mt-2 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <h4 className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Distribution Reach & Stock Status</h4>
                                <div className="flex flex-col space-y-3">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {productStats.isGlobal ? (
                                            <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">Global Reach</span>
                                        ) : (
                                            <>
                                                {productStats.continents.map(c => (
                                                    <span key={c} className="px-2 py-1 rounded bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider">{c}</span>
                                                ))}
                                                {productStats.economicZones.map(ez => (
                                                    <span key={ez} className="px-2 py-1 rounded bg-purple-500/20 text-purple-500 text-[10px] font-bold uppercase tracking-wider">{ez}</span>
                                                ))}
                                                {productStats.countries.map(c => (
                                                    <span key={c} className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-500 text-[10px] font-bold uppercase tracking-wider">{c}</span>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                    
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
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Annual Performance Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

                    {/* Charts Section */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-6">
                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Regional Sales Distribution</h3>
                            <SalesDrillDownChart theme={theme} height={300} />
                        </div>
                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                    Hourly Sales (24h)
                                </h4>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                    <Icon name="analytics" className="h-3 w-3" />
                                    Rate: {rateOfSale} units/hr
                                </div>
                            </div>
                            <BarChart data={hourlySalesData} theme={theme} height={300} labelInterval={2} />
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-8">
                         <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            <Icon name="chat-bubble" className="h-5 w-5 text-blue-500" />
                            Customer Reviews
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reviews.map(review => (
                                <div key={review.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                                {review.user.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{review.user}</p>
                                                <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{review.date}</p>
                                            </div>
                                        </div>
                                        <StarRatingDisplay rating={review.rating} theme={theme} />
                                    </div>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>"{review.comment}"</p>
                                </div>
                            ))}
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
                </div>

                <div className={`p-6 border-t flex justify-end ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <button 
                        onClick={onClose}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                    >
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductProfileModal;

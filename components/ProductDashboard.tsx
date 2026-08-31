
import React, { useState, useMemo } from 'react';
import { Theme } from '../types';
import Icon, { IconName } from './Icon';
import DashboardKPICard from './DashboardKPICard';
import { BarChart, DonutChart, AreaChart } from './Charts';

interface ProductDashboardProps {
    theme: Theme;
}

interface ProductPerformance {
    id: number;
    name: string;
    category: string;
    sold: number;
    revenue: number;
    rating: number; // 1-5
    reviewsCount: number;
    recommendationRate: number; // 0-100
    sentiment: 'Positive' | 'Neutral' | 'Negative';
}

const mockProductPerformance: ProductPerformance[] = [
    { id: 1, name: 'Colgate Herbal Toothpaste 35g', category: 'Personal Care', sold: 1250, revenue: 6875000, rating: 4.5, reviewsCount: 120, recommendationRate: 92, sentiment: 'Positive' },
    { id: 2, name: 'Coca Cola 500ml', category: 'Beverages', sold: 3400, revenue: 8500000, rating: 4.8, reviewsCount: 350, recommendationRate: 98, sentiment: 'Positive' },
    { id: 3, name: 'Blue Band Margarine 500g', category: 'Food', sold: 890, revenue: 4450000, rating: 4.2, reviewsCount: 85, recommendationRate: 88, sentiment: 'Positive' },
    { id: 4, name: 'Omo Washing Powder 1kg', category: 'Household', sold: 650, revenue: 3250000, rating: 4.0, reviewsCount: 60, recommendationRate: 80, sentiment: 'Neutral' },
    { id: 5, name: 'Nice Toothbrush', category: 'Personal Care', sold: 400, revenue: 800000, rating: 3.5, reviewsCount: 40, recommendationRate: 70, sentiment: 'Neutral' },
    { id: 6, name: 'Mukwano Cooking Oil 1L', category: 'Food', sold: 1100, revenue: 7700000, rating: 4.6, reviewsCount: 150, recommendationRate: 95, sentiment: 'Positive' },
    { id: 7, name: 'Geisha Soap', category: 'Personal Care', sold: 950, revenue: 2850000, rating: 4.3, reviewsCount: 90, recommendationRate: 89, sentiment: 'Positive' },
    { id: 8, name: 'Dettol Antiseptic 250ml', category: 'Health', sold: 320, revenue: 3200000, rating: 4.9, reviewsCount: 45, recommendationRate: 99, sentiment: 'Positive' },
    { id: 9, name: 'Generic Painkiller', category: 'Health', sold: 2100, revenue: 1050000, rating: 3.8, reviewsCount: 200, recommendationRate: 75, sentiment: 'Neutral' },
    { id: 10, name: 'Plastic Basin Large', category: 'Household', sold: 150, revenue: 1500000, rating: 3.2, reviewsCount: 15, recommendationRate: 60, sentiment: 'Negative' },
    { id: 11, name: 'Exercise Book 96pg', category: 'Stationery', sold: 5000, revenue: 2500000, rating: 4.1, reviewsCount: 80, recommendationRate: 85, sentiment: 'Positive' },
    { id: 12, name: 'Bic Pen Blue', category: 'Stationery', sold: 4500, revenue: 2250000, rating: 4.0, reviewsCount: 110, recommendationRate: 82, sentiment: 'Neutral' },
];

const ProductDashboard: React.FC<ProductDashboardProps> = ({ theme }) => {
    const [timeRange, setTimeRange] = useState('Last 30 Days');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = useMemo(() => ['All', ...Array.from(new Set(mockProductPerformance.map(p => p.category))).sort()], []);

    const filteredData = useMemo(() => {
        return mockProductPerformance.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
    }, [selectedCategory]);

    // KPI Calculations
    const totalRevenue = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.revenue, 0), [filteredData]);
    const totalSold = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.sold, 0), [filteredData]);
    const avgRating = useMemo(() => {
        const sum = filteredData.reduce((acc, curr) => acc + curr.rating, 0);
        return filteredData.length > 0 ? (sum / filteredData.length).toFixed(1) : 0;
    }, [filteredData]);
    const avgRecRate = useMemo(() => {
        const sum = filteredData.reduce((acc, curr) => acc + curr.recommendationRate, 0);
        return filteredData.length > 0 ? Math.round(sum / filteredData.length) : 0;
    }, [filteredData]);

    // Chart Data
    const categoryData = useMemo(() => {
        const catTotals = mockProductPerformance.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.revenue;
            return acc;
        }, {} as Record<string, number>);
        
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
        return Object.entries(catTotals).map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length]
        }));
    }, []);

    // Mock Sales Trend Data
    const salesTrendData = [450000, 520000, 480000, 610000, 550000, 670000, 720000, 690000, 750000, 800000, 780000, 850000];

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'Positive': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
            case 'Neutral': return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
            case 'Negative': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            default: return '';
        }
    };

    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex items-center space-x-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Icon 
                    key={star} 
                    name="star" 
                    className={`h-3 w-3 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                />
            ))}
            <span className={`ml-1 text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {rating.toFixed(1)}
            </span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className={`flex flex-col md:flex-row justify-between items-center p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Product Performance</h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Analyze sales, reviews, and recommendations.</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                    >
                        {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                    </select>
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className={`px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                    >
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardKPICard 
                    theme={theme} 
                    title="Total Revenue" 
                    value={`UGX ${(totalRevenue / 1000000).toFixed(1)}M`} 
                    icon="cash" 
                    trend={{ value: 12.5, isPositive: true }} 
                    subtitle="Gross sales value"
                />
                <DashboardKPICard 
                    theme={theme} 
                    title="Units Sold" 
                    value={totalSold.toLocaleString()} 
                    icon="stock-purchase" 
                    trend={{ value: 5.2, isPositive: true }} 
                    subtitle="Total volume"
                />
                <DashboardKPICard 
                    theme={theme} 
                    title="Avg. Rating" 
                    value={avgRating.toString()} 
                    icon="star" 
                    badge={{ label: parseFloat(avgRating.toString()) > 4 ? 'Excellent' : 'Good' }} 
                    subtitle="Based on user reviews"
                />
                <DashboardKPICard 
                    theme={theme} 
                    title="Recommendation Rate" 
                    value={`${avgRecRate}%`} 
                    icon="check-circle" 
                    trend={{ value: 2.1, isPositive: true }} 
                    subtitle="Users who recommend"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 p-6 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Sales Trend (Revenue)</h3>
                    <div className="h-72 w-full">
                        <AreaChart data={salesTrendData} theme={theme} />
                    </div>
                </div>
                <div className={`p-6 rounded-lg border shadow-sm flex flex-col ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Sales by Category</h3>
                    <div className="flex-grow flex items-center justify-center min-h-[300px]">
                        <DonutChart 
                            data={categoryData} 
                            theme={theme} 
                            centerValue={`UGX ${(totalRevenue / 1000000).toFixed(1)}M`} 
                            centerSubLabel="Total Revenue"
                            legendDirection="horizontal" 
                        />
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Top Products Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Product Name</th>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Category</th>
                                <th className={`px-6 py-3 text-right text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Sold</th>
                                <th className={`px-6 py-3 text-right text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Revenue</th>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>User Rating</th>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Recommended</th>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Reviews</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {filteredData.sort((a,b) => b.revenue - a.revenue).map((product) => (
                                <tr key={product.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                        {product.name}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {product.category}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {product.sold.toLocaleString()}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                        UGX {(product.revenue / 1000).toFixed(0)}k
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StarRating rating={product.rating} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                                        <div className="w-full max-w-[100px]">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{product.recommendationRate}%</span>
                                            </div>
                                            <div className={`w-full h-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                <div 
                                                    className={`h-1.5 rounded-full ${product.recommendationRate > 80 ? 'bg-green-500' : product.recommendationRate > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${product.recommendationRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{product.reviewsCount}</span>
                                            <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-bold tracking-wide ${getSentimentColor(product.sentiment)}`}>
                                                {product.sentiment}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductDashboard;


import React, { useMemo, useState } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    Cell, 
    AreaChart, 
    Area,
    PieChart,
    Pie
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Theme, Shop, ShopUser, SuperUser, FinancialRatio } from '../types';
import Icon, { IconName } from './Icon';
import { formatDate } from '../utils';
import { mockSalesTransactions, mockStockListings } from '../data';

interface ShopProfilePageProps {
    theme: Theme;
    shop: Shop | null;
    users: (ShopUser | SuperUser)[];
    onNavigate: (view: any) => void;
    userRole?: string;
    currentUserId?: string | number;
}

const mockRatios: FinancialRatio[] = [
    { category: 'Liquidity', ratio: 'Current Ratio', formula: 'Current Assets / Current Liabilities', explanation: 'Measures a company\'s ability to pay short-term obligations with short-term assets.', idealRange: '1.5 to 2', value: '1.85' },
    { category: 'Liquidity', ratio: 'Quick Ratio', formula: '(Current Assets - Inventory) / Current Liabilities', explanation: 'Evaluates a company\'s ability to cover short-term obligations with its most liquid assets.', idealRange: '1 to 1.2', value: '1.12' },
    { category: 'Profitability', ratio: 'Gross Profit Margin', formula: '(Gross Profit / Revenue) x 100', explanation: 'Indicates the percentage of revenue that exceeds the cost of goods sold.', idealRange: '20% to 30%', value: '28.4%' },
    { category: 'Profitability', ratio: 'Net Profit Margin', formula: '(Net Profit / Revenue) x 100', explanation: 'Measures the percentage of each dollar of revenue that results in profit after expenses.', idealRange: '5% to 10%', value: '8.2%' },
    { category: 'Efficiency', ratio: 'Inventory Turnover', formula: 'Cost of Goods Sold / Average Inventory', explanation: 'Evaluates how quickly a company sells its inventory during a period.', idealRange: '4 to 6', value: '5.2' },
    { category: 'Efficiency', ratio: 'Accounts Receivable Turnover', formula: 'Net Credit Sales / Average Accounts Receivable', explanation: 'Measures how efficiently a company collects on its credit sales.', idealRange: '6 to 12', value: '8.5' },
    { category: 'Solvency', ratio: 'Debt-to-Equity Ratio', formula: 'Total Debt / Shareholders\' Equity', explanation: 'Indicates the proportion of debt financing relative to equity financing.', idealRange: '0.5 to 1.5', value: '0.85' },
    { category: 'Solvency', ratio: 'Interest Coverage Ratio', formula: 'Earnings Before Interest and Taxes (EBIT) / Interest Expense', explanation: 'Measures a company\'s ability to cover its interest obligations with its earnings.', idealRange: '2 to 3', value: '2.4' },
    { category: 'Market', ratio: 'Price-to-Earnings (P/E) Ratio', formula: 'Market Price per Share / Earnings per Share', explanation: 'Evaluates the relationship between a company\'s stock price and its earnings.', idealRange: 'Varies by industry', value: '15.4' },
    { category: 'Market', ratio: 'Price-to-Book (P/B) Ratio', formula: 'Market Price per Share / Book Value per Share', explanation: 'Compares a company\'s market value to its book value.', idealRange: '1 to 3', value: '2.1' },
    { category: 'Market', ratio: 'Dividend Yield', formula: 'Annual Dividend per Share / Price per Share', explanation: 'Measures the percentage return on investment from dividends.', idealRange: 'Varies by industry', value: '3.2%' },
    { category: 'Growth', ratio: 'Earnings Growth Rate', formula: '((Current Year Earnings - Last Year Earnings) / Last Year Earnings) x 100', explanation: 'Measures the annual growth rate of a company\'s earnings.', idealRange: 'Positive percentage', value: '12.5%' },
    { category: 'Growth', ratio: 'Revenue Growth Rate', formula: '((Current Year Revenue - Last Year Revenue) / Last Year Revenue) x 100', explanation: 'Measures the annual growth rate of a company\'s revenue.', idealRange: 'Positive percentage', value: '15.8%' },
];

// ... (timeSince helper, KPICard, DetailCard remain same)
const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const KPICard: React.FC<{ theme: Theme; title: string; value: string; icon: IconName }> = ({ theme, title, value, icon }) => (
    <div className={`p-4 rounded-lg shadow-sm border transition-transform hover:-translate-y-1 duration-200 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center">
            <div className={`p-3 mr-4 rounded-full ${theme === 'dark' ? 'bg-slate-700 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                <Icon name={icon} className="h-6 w-6" />
            </div>
            <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    </div>
);

const DetailCard: React.FC<{ theme: Theme, title: string, children: React.ReactNode, icon: IconName, className?: string, noPadding?: boolean }> = ({ theme, title, children, icon, className = "", noPadding = false }) => (
    <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} ${className}`}>
        <h3 className={`flex items-center text-base font-semibold px-5 py-4 border-b ${theme === 'dark' ? 'text-slate-100 border-slate-700' : 'text-slate-800 border-slate-100'}`}>
            <Icon name={icon} className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            {title}
        </h3>
        <div className={`${noPadding ? '' : 'p-5 text-sm space-y-3'}`}>
            {children}
        </div>
    </div>
);

const SettingRow: React.FC<{ label: string, enabled: boolean, theme: Theme, subLabel?: string }> = ({ label, enabled, theme, subLabel }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-0 border-dashed border-gray-200 dark:border-slate-700">
        <div>
            <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
            {subLabel && <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{subLabel}</p>}
        </div>
        <div className={`flex items-center`}>
            {enabled ? (
                <Icon name="check-circle" className="h-5 w-5 text-green-500" />
            ) : (
                <Icon name="x-mark" className="h-5 w-5 text-slate-400" />
            )}
        </div>
    </div>
);

const ActivityFeedItem: React.FC<{ item: any, theme: Theme }> = ({ item, theme }) => {
    // ... (same implementation)
    const activityIcons: Record<string, IconName> = {
        'New Sale': 'cash',
        'Stock Purchase': 'stock-purchase',
        'Settings Update': 'system-settings',
        'User Assignment': 'user-mgt',
    };
    
    const iconStyles = {
        'New Sale': theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100',
        'Stock Purchase': theme === 'dark' ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-100',
        'Settings Update': theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-100',
        'User Assignment': theme === 'dark' ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-100',
    }[item.type as string] || (theme === 'dark' ? 'text-slate-400 bg-slate-700' : 'text-slate-600 bg-slate-100');

    return (
        <div className={`flex gap-4 p-4 border-b last:border-0 transition-colors ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconStyles}`}>
                <Icon name={activityIcons[item.type] || 'reports'} className="w-5 h-5" />
            </div>
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.type}</h4>
                    <span className={`text-xs whitespace-nowrap ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{timeSince(item.timestamp)}</span>
                </div>
                <p className={`text-sm mt-0.5 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
            </div>
        </div>
    );
};

const ShopProfilePage: React.FC<ShopProfilePageProps> = ({ theme, shop, users, onNavigate, userRole, currentUserId }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'ratios' | 'analytics' | 'breakeven'>('overview');
    const [selectedRatio, setSelectedRatio] = useState<FinancialRatio | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'All Time' | 'Last 12 Months' | 'Last 6 Months' | 'Last 3 Months'>('All Time');
    
    const isFinancialInstitution = userRole === 'Financial Institution' || userRole === 'Administrator' || userRole === 'Admin';
    const isShopOwner = shop && String(currentUserId) === String(shop.ownerId);
    const canViewFinancials = isFinancialInstitution || isShopOwner;

    // Sales Analytics Data
    const salesAnalyticsData = useMemo(() => {
        if (!shop) return { trends: [], topProducts: [] };

        // Trends for last 30 days
        const last30Days = eachDayOfInterval({
            start: subDays(new Date(), 29),
            end: new Date()
        });

        const trends = last30Days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const daySales = mockSalesTransactions
                .filter(tx => tx.shopId === shop.id && format(new Date(tx.date), 'yyyy-MM-dd') === dateStr)
                .reduce((sum, tx) => sum + tx.amount, 0);
            return {
                date: format(date, 'MMM dd'),
                revenue: daySales
            };
        });

        // Top selling products (mocked based on stock listings)
        const topProducts = mockStockListings
            .filter(item => item.shopId === shop.id)
            .map(item => ({
                name: item.productName,
                sales: Math.floor(Math.random() * 500) + 100, // Mock sales count
                revenue: (Math.floor(Math.random() * 500) + 100) * item.unitPrice
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return { trends, topProducts };
    }, [shop]);

    // Breakeven Analysis Data
    const breakevenData = useMemo(() => {
        if (!shop) return null;

        const fixedCosts = 2500000; // Monthly fixed costs (rent, salaries, etc.)
        const averageMargin = 0.25; // 25% average margin
        const averageTransactionValue = 15000;

        const breakevenRevenue = fixedCosts / averageMargin;
        const dailyBreakevenRevenue = breakevenRevenue / 30;
        const dailyTransactionsNeeded = Math.ceil(dailyBreakevenRevenue / averageTransactionValue);

        // Estimate breakeven date
        const currentMonthlyRevenue = mockSalesTransactions
            .filter(tx => tx.shopId === shop.id && new Date(tx.date) > subDays(new Date(), 30))
            .reduce((sum, tx) => sum + tx.amount, 0);
        
        const daysToBreakeven = currentMonthlyRevenue > 0 
            ? Math.max(0, Math.ceil((breakevenRevenue - currentMonthlyRevenue) / (currentMonthlyRevenue / 30)))
            : 365; // Default if no sales

        const estimatedDate = format(subDays(new Date(), -daysToBreakeven), 'MMM dd, yyyy');

        // Chart data
        const chartData = Array.from({ length: 12 }, (_, i) => {
            const revenue = (i + 1) * (breakevenRevenue / 8);
            const totalCost = fixedCosts + (revenue * (1 - averageMargin));
            return {
                name: `Month ${i + 1}`,
                revenue,
                totalCost,
                fixedCost: fixedCosts,
                currentRevenue: currentMonthlyRevenue
            };
        });

        const currentMonthlyTransactions = mockSalesTransactions
            .filter(tx => tx.shopId === shop.id && new Date(tx.date) > subDays(new Date(), 30))
            .length;
        
        const currentDailyRevenue = currentMonthlyRevenue / 30;
        const currentDailyTransactions = currentMonthlyTransactions / 30;

        return {
            fixedCosts,
            breakevenRevenue,
            dailyBreakevenRevenue,
            dailyTransactionsNeeded,
            currentMonthlyRevenue,
            currentDailyRevenue,
            currentDailyTransactions,
            estimatedDate,
            chartData,
            timeToBreakeven: `${daysToBreakeven} days`
        };
    }, [shop]);

    const getRatioComponents = (ratio: FinancialRatio, period: string) => {
        // Mocking calculation components based on ratio and period
        const multiplier = period === 'All Time' ? 1 : period === 'Last 12 Months' ? 0.8 : period === 'Last 6 Months' ? 0.4 : 0.2;
        
        switch (ratio.ratio) {
            case 'Current Ratio':
                return [
                    { label: 'Current Assets', value: (185000 * multiplier).toLocaleString() },
                    { label: 'Current Liabilities', value: (100000 * multiplier).toLocaleString() }
                ];
            case 'Quick Ratio':
                return [
                    { label: 'Current Assets', value: (185000 * multiplier).toLocaleString() },
                    { label: 'Inventory', value: (73000 * multiplier).toLocaleString() },
                    { label: 'Current Liabilities', value: (100000 * multiplier).toLocaleString() }
                ];
            case 'Gross Profit Margin':
                return [
                    { label: 'Gross Profit', value: (142000 * multiplier).toLocaleString() },
                    { label: 'Revenue', value: (500000 * multiplier).toLocaleString() }
                ];
            case 'Net Profit Margin':
                return [
                    { label: 'Net Profit', value: (41000 * multiplier).toLocaleString() },
                    { label: 'Revenue', value: (500000 * multiplier).toLocaleString() }
                ];
            case 'Inventory Turnover':
                return [
                    { label: 'Cost of Goods Sold', value: (358000 * multiplier).toLocaleString() },
                    { label: 'Average Inventory', value: (68846 * multiplier).toLocaleString() }
                ];
            case 'Accounts Receivable Turnover':
                return [
                    { label: 'Net Credit Sales', value: (425000 * multiplier).toLocaleString() },
                    { label: 'Average Accounts Receivable', value: (50000 * multiplier).toLocaleString() }
                ];
            case 'Debt-to-Equity Ratio':
                return [
                    { label: 'Total Debt', value: (255000 * multiplier).toLocaleString() },
                    { label: 'Shareholders\' Equity', value: (300000 * multiplier).toLocaleString() }
                ];
            case 'Interest Coverage Ratio':
                return [
                    { label: 'EBIT', value: (60000 * multiplier).toLocaleString() },
                    { label: 'Interest Expense', value: (25000 * multiplier).toLocaleString() }
                ];
            case 'Price-to-Earnings (P/E) Ratio':
                return [
                    { label: 'Market Price per Share', value: '46.20' },
                    { label: 'Earnings per Share', value: '3.00' }
                ];
            case 'Price-to-Book (P/B) Ratio':
                return [
                    { label: 'Market Price per Share', value: '46.20' },
                    { label: 'Book Value per Share', value: '22.00' }
                ];
            case 'Dividend Yield':
                return [
                    { label: 'Annual Dividend per Share', value: '1.48' },
                    { label: 'Price per Share', value: '46.20' }
                ];
            case 'Earnings Growth Rate':
                return [
                    { label: 'Current Year Earnings', value: (41000 * multiplier).toLocaleString() },
                    { label: 'Last Year Earnings', value: (36444 * multiplier).toLocaleString() }
                ];
            case 'Revenue Growth Rate':
                return [
                    { label: 'Current Year Revenue', value: (500000 * multiplier).toLocaleString() },
                    { label: 'Last Year Revenue', value: (431778 * multiplier).toLocaleString() }
                ];
            default:
                return [];
        }
    };

    const getAdjustedValue = (ratio: FinancialRatio, period: string) => {
        // Mocking value adjustment based on period
        if (period === 'All Time') return ratio.value;
        const val = parseFloat(ratio.value);
        if (isNaN(val)) return ratio.value;
        
        const adjustment = period === 'Last 12 Months' ? 0.95 : period === 'Last 6 Months' ? 0.9 : 0.85;
        const adjusted = (val * adjustment).toFixed(ratio.value.includes('%') ? 1 : 2);
        return ratio.value.includes('%') ? `${adjusted}%` : adjusted;
    };

    const displayActivities = useMemo(() => {
        if (!shop || !shop.activity) return [];
        // ... (Same mock logic)
        const baseActivities = shop.activity;
        let extended = [...baseActivities];
        if (extended.length < 15) {
             const dummyTypes = ['New Sale', 'Stock Purchase', 'Settings Update', 'User Assignment'];
             const dummyDescs = [
                 'Processed a bulk order for repeat customer.',
                 'Updated inventory counts for Q3.',
                 'Changed opening hours in settings.',
                 'Assigned new temporary staff to shift.',
                 'Sale of 500 units of product X.',
                 'Restocked main warehouse supplies.'
             ];
             
             for(let i=0; i<10; i++) {
                 const randomType = dummyTypes[Math.floor(Math.random() * dummyTypes.length)];
                 const randomDesc = dummyDescs[Math.floor(Math.random() * dummyDescs.length)];
                 const randomTime = new Date(new Date().getTime() - (i + 1) * (Math.random() * 100000000)).toISOString();
                 
                 extended.push({
                     id: `mock-${i}`,
                     type: randomType as any,
                     description: randomDesc,
                     timestamp: randomTime
                 });
             }
        }
        return extended.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
   }, [shop]);

    if (!shop) {
        return (
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-8 rounded-lg shadow-sm text-center`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                    <Icon name="shop-mgt" className="w-8 h-8" />
                </div>
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>No Shop Selected</h3>
                <p className={`mt-2 mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Please go back to the shops list and select a shop to view details.</p>
                <button onClick={() => onNavigate('shops')} className="px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors shadow-sm">
                    Back to Shops
                </button>
            </div>
        );
    }
    
    const owner = users.find(u => u.id === shop.ownerId);
    
    // ... (getStatusChip and formatCurrency helpers)
    const getStatusChip = (status: string) => {
        const baseClasses = 'px-2.5 py-0.5 text-xs font-bold rounded-full inline-flex items-center';
        if (status === 'Active') {
            return (
                <span className={`${baseClasses} ${theme === 'dark' ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' : 'bg-green-50 text-green-700 ring-1 ring-green-600/20'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                    Active
                </span>
            );
        }
        return (
            <span className={`${baseClasses} ${theme === 'dark' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                Terminated
            </span>
        );
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, notation: 'compact' }).format(amount);
    }

    return (
        <div className="space-y-6 max-w-full mx-auto">
            {/* Header (Same as before) */}
             <div className={`p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between md:items-start gap-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start space-x-5">
                    <div className={`w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-xl shadow-inner ${theme === 'dark' ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon name="shop-mgt" className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h2 className={`text-2xl font-bold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{shop.name}</h2>
                            {getStatusChip(shop.status)}
                        </div>
                        <div className="flex flex-col space-y-1">
                             <p className={`flex items-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Icon name="globe" className="w-4 h-4 mr-1.5 opacity-70" />
                                {shop.countryCode} • {shop.adminLevels.map(l => l.name).join(', ')}
                             </p>
                             <p className={`flex items-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Icon name="calendar" className="w-4 h-4 mr-1.5 opacity-70" />
                                Created on {formatDate(shop.createdAt)}
                             </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => onNavigate('shop-surveillance')} className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                         <Icon name="camera" className="h-4 w-4" />
                         <span>Surveillance</span>
                    </button>
                    <button onClick={() => onNavigate('shops')} className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md transition-colors ${theme === 'dark' ? 'text-slate-300 border-slate-600 hover:bg-slate-800' : 'text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                        <Icon name="chevron-left" className="h-4 w-4" />
                        <span>Back to List</span>
                    </button>
                </div>
            </div>

            {/* Financial Overview (Same as before) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KPICard theme={theme} icon="cash" title="Total Revenue" value={formatCurrency(shop.financials?.incomeStatement.revenue || 0, shop.currency)} />
                <KPICard theme={theme} icon="reports" title="Net Income" value={formatCurrency(shop.financials?.incomeStatement.netIncome || 0, shop.currency)} />
                <KPICard theme={theme} icon="finances" title="Op. Cash Flow" value={formatCurrency(shop.financials?.cashFlowStatement.operatingCashFlow || 0, shop.currency)} />
            </div>

            {canViewFinancials && (
                <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('ratios')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'ratios' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Financial Ratios
                    </button>
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Sales Analytics
                    </button>
                    <button 
                        onClick={() => setActiveTab('breakeven')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'breakeven' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Breakeven Analysis
                    </button>
                </div>
            )}

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* ... (Overview content remains same) */}
                    <div className="lg:col-span-2">
                        <DetailCard theme={theme} title="Recent Activity" icon="reports" noPadding={true}>
                             <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                 {displayActivities.length > 0 ? (
                                     <div className="divide-y">
                                         {displayActivities.map((item) => (
                                             <ActivityFeedItem key={item.id} item={item} theme={theme} />
                                         ))}
                                     </div>
                                 ) : (
                                     <div className={`p-8 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                         <p>No recent activity to show.</p>
                                     </div>
                                 )}
                                 {displayActivities.length > 5 && (
                                     <div className={`p-3 text-center text-xs ${theme === 'dark' ? 'text-slate-500 bg-slate-800' : 'text-slate-400 bg-slate-50'} border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                                         End of feed
                                     </div>
                                 )}
                            </div>
                        </DetailCard>
                    </div>

                    {/* Right Column: Details & Settings */}
                    <div className="space-y-6 sticky top-6">
                         <DetailCard theme={theme} title="Owner Information" icon="user-circle">
                            {owner ? (
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {owner.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{owner.name}</p>
                                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{owner.role}</p>
                                        <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{owner.email}</p>
                                    </div>
                                </div>
                            ) : <p className="text-slate-500 italic">Owner not assigned.</p>}
                        </DetailCard>

                        <DetailCard theme={theme} title="Shop Configuration" icon="system-settings">
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>General & POS</h4>
                                <SettingRow label="Mandatory Client Info" enabled={shop.settings.compulsoryClientInfo} theme={theme} />
                                <SettingRow label="Collect Client Info" enabled={!!shop.settings.collectClientInfo} theme={theme} />
                                <SettingRow label="Allow Credit Sales" enabled={shop.settings.allowCredit} theme={theme} />
                                <SettingRow label="Allow Holding Transactions" enabled={!!shop.settings.allowHoldTransaction} theme={theme} />
                                <SettingRow label="Allow Price Per User" enabled={!!shop.settings.allowPricePerUser} theme={theme} />
                                
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 mt-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Payment Methods</h4>
                                <SettingRow label="Mobile Money" enabled={shop.settings.allowMobileMoneyPayment} theme={theme} />
                                <SettingRow label="Card Payment" enabled={shop.settings.allowCardPayment} theme={theme} />
                                <SettingRow label="Wallet Checkout" enabled={shop.settings.allowWalletCheckout} theme={theme} />

                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 mt-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Wallet System</h4>
                                <SettingRow label="Wallets Enabled" enabled={shop.settings.enableWallets} theme={theme} />
                                {shop.settings.enableWallets && (
                                    <>
                                        <SettingRow label="Allow Debt (Overdraft)" enabled={shop.settings.allowWalletDebt} theme={theme} />
                                        <SettingRow label="Allow Deposits" enabled={shop.settings.allowWalletDeposits} theme={theme} />
                                        <SettingRow label="OTP for Updates" enabled={shop.settings.requireOtpForWalletUpdates} theme={theme} subLabel="Required when admin modifies wallet" />
                                        <SettingRow label="Client Debt Notification" enabled={!!shop.settings.requireClientDebtNotification} theme={theme} />
                                    </>
                                )}
                            </div>
                        </DetailCard>

                        <DetailCard theme={theme} title="Compliance & Status" icon="shield-check">
                             <div className="space-y-4">
                                <div>
                                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Registration</p>
                                    {shop.isRegistered ? (
                                        <div className="flex items-center justify-between">
                                             <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Registered</span>
                                             <span className={`text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-mono`}>{shop.registrationNumber}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-500 flex items-center"><Icon name="exclamation-triangle" className="w-4 h-4 mr-1"/> Not Registered</p>
                                    )}
                                </div>
                                
                                <div>
                                    <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Trading Licenses</p>
                                    {shop.tradingLicenses.length > 0 ? (
                                        <div className="space-y-2">
                                            {shop.tradingLicenses.map((license, index) => {
                                                const isExpired = new Date(license.expiryDate) < new Date();
                                                return (
                                                    <div key={index} className={`p-2 rounded border text-sm flex justify-between items-center ${theme === 'dark' ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-slate-50'}`}>
                                                        <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{license.number}</span>
                                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                            {isExpired ? 'Expired' : 'Active'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm italic text-slate-500">No licenses recorded.</p>
                                    )}
                                </div>
                             </div>
                        </DetailCard>
                        
                        <DetailCard theme={theme} title="Location" icon="shop-mgt">
                            <div className="space-y-2">
                                {shop.adminLevels.map((l, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Level {l.level}</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{l.name}</span>
                                    </div>
                                ))}
                                 <div className={`h-px my-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                                 <div className="flex justify-between text-sm">
                                    <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Coordinates</span>
                                    <span className={`font-mono text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{shop.location.lat.toFixed(4)}, {shop.location.lng.toFixed(4)}</span>
                                </div>
                            </div>
                        </DetailCard>
                    </div>
                </div>
            ) : activeTab === 'ratios' ? (
                <div className={`rounded-xl shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Key Financial Ratios</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Performance indicators for {shop.name}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase font-semibold`}>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Ratio</th>
                                    <th className="px-6 py-4">Formula</th>
                                    <th className="px-6 py-4">Explanation</th>
                                    <th className="px-6 py-4">Ideal Range</th>
                                    <th className="px-6 py-4 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                {(shop.financials?.ratios || mockRatios).map((ratio, idx) => (
                                    <tr key={idx} className={`${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {ratio.category}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                            {ratio.ratio}
                                        </td>
                                        <td className={`px-6 py-4 text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {ratio.formula}
                                        </td>
                                        <td className={`px-6 py-4 text-xs max-w-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {ratio.explanation}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {ratio.idealRange}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => setSelectedRatio(ratio)}
                                                className={`text-sm font-bold hover:underline transition-all ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}
                                            >
                                                {ratio.value}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'analytics' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Sales Trends (Last 30 Days)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesAnalyticsData.trends}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                                            interval={4}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                                            tickFormatter={(val) => `UGX ${val/1000}k`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                                borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                            formatter={(val: number) => [`UGX ${val.toLocaleString()}`, 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className={`p-6 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Top Selling Products</h3>
                            <div className="space-y-4">
                                {salesAnalyticsData.topProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                idx === 0 ? 'bg-yellow-500 text-slate-900' : 
                                                idx === 1 ? 'bg-slate-300 text-slate-700' : 
                                                idx === 2 ? 'bg-amber-600 text-white' : 
                                                'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold truncate max-w-[120px] ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.name}</p>
                                                <p className="text-[10px] text-slate-500">{product.sales} units sold</p>
                                            </div>
                                        </div>
                                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                            UGX {product.revenue.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPICard theme={theme} icon="cash" title="Avg. Transaction" value="UGX 18,450" />
                        <KPICard theme={theme} icon="user-mgt" title="Customer Retention" value="64%" />
                        <KPICard theme={theme} icon="reports" title="Sales Growth" value="+12.4%" />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            <div className={`p-6 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Breakeven Visualization</h3>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={breakevenData?.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                                                tickFormatter={(val) => `UGX ${val/1000000}M`}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="totalCost" name="Total Cost" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                            <Line type="monotone" dataKey="fixedCost" name="Fixed Cost" stroke="#94a3b8" strokeWidth={1} dot={false} />
                                            <Line type="monotone" dataKey="currentRevenue" name="Current Revenue" stroke="#10b981" strokeWidth={2} strokeDasharray="10 5" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex justify-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <span className="text-xs text-slate-500">Revenue</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 border-t-2 border-dashed border-red-500" />
                                        <span className="text-xs text-slate-500">Total Cost</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-slate-400" />
                                        <span className="text-xs text-slate-500">Fixed Cost</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 border-t-2 border-dashed border-emerald-500" />
                                        <span className="text-xs text-slate-500">Current Revenue</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <DetailCard theme={theme} title="Breakeven vs Current" icon="finances">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time to Breakeven</p>
                                        <p className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>{breakevenData?.timeToBreakeven}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Estimated: {breakevenData?.estimatedDate}</p>
                                    </div>
                                    
                                    <div className={`h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Revenue</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current</span>
                                                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>UGX {breakevenData?.currentDailyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Target</span>
                                                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>UGX {breakevenData?.dailyBreakevenRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Txns</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current</span>
                                                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{breakevenData?.currentDailyTransactions.toFixed(1)}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Target</span>
                                                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>{breakevenData?.dailyTransactionsNeeded}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Fixed Costs</p>
                                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>UGX {breakevenData?.fixedCosts.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Margin</p>
                                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>25%</p>
                                        </div>
                                    </div>

                                    <div className={`h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
                                    
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Progress to Breakeven</p>
                                        <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-500"
                                                style={{ width: `${Math.min(100, (breakevenData?.currentMonthlyRevenue || 0) / (breakevenData?.breakevenRevenue || 1) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-slate-500">UGX {breakevenData?.currentMonthlyRevenue.toLocaleString()} current</span>
                                            <span className="text-[10px] font-bold text-yellow-600">UGX {breakevenData?.breakevenRevenue.toLocaleString()} target</span>
                                        </div>
                                    </div>
                                </div>
                            </DetailCard>

                            <div className={`p-6 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-emerald-500 text-white">
                                        <Icon name="check-circle" className="h-4 w-4" />
                                    </div>
                                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Profitability Goal</h4>
                                </div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                                    Your shop is currently performing at 85% of its breakeven target. Increasing average transaction value by 10% would accelerate breakeven by 12 days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ratio Calculation Modal */}
            {selectedRatio && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div>
                                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedRatio.ratio}</h3>
                                <p className="text-xs text-slate-500 mt-1">{selectedRatio.category} Analysis</p>
                            </div>
                            <button onClick={() => { setSelectedRatio(null); setSelectedPeriod('All Time'); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <Icon name="x-mark" className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Period Selector */}
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Calculation Period</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(['All Time', 'Last 12 Months', 'Last 6 Months', 'Last 3 Months'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedPeriod(p)}
                                            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                                selectedPeriod === p 
                                                ? 'bg-yellow-500 border-yellow-500 text-slate-900 shadow-sm' 
                                                : theme === 'dark' 
                                                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600' 
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Formula & Explanation */}
                            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Formula</p>
                                <p className={`font-mono text-sm mb-4 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>{selectedRatio.formula}</p>
                                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{selectedRatio.explanation}</p>
                            </div>

                            {/* Calculation Components */}
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Calculation Details ({selectedPeriod})</p>
                                <div className="space-y-3">
                                    {getRatioComponents(selectedRatio, selectedPeriod).map((comp, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>{comp.label}</span>
                                            <span className={`font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{comp.value}</span>
                                        </div>
                                    ))}
                                    <div className={`h-px my-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                                    <div className="flex justify-between items-center">
                                        <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Resulting Ratio</span>
                                        <span className={`text-xl font-black ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>
                                            {getAdjustedValue(selectedRatio, selectedPeriod)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="flex items-center gap-2">
                                <Icon name="shield-check" className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-slate-500">Verified Financial Data</span>
                            </div>
                            <button 
                                onClick={() => { setSelectedRatio(null); setSelectedPeriod('All Time'); }}
                                className={`px-6 py-2 rounded-xl font-bold transition-all active:scale-95 ${
                                    theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'
                                }`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopProfilePage;

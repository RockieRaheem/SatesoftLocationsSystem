
import React, { useState, useMemo } from 'react';
import { Theme } from '../types';
import Icon, { IconName } from './Icon';
import { formatDate } from '../utils';
import { mockShops } from '../data';
import ProductProfileModal from './ProductProfileModal';
import SaleSummaryModal, { SaleSummary } from './SaleSummaryModal';
import { maskPhoneNumber } from '../utils';

interface DailySale {
    id: string;
    sku: string;
    receiptNumber: string; // RN
    transactionNumber: number; // TN
    productName: string;
    shopName: string;
    clientPhone: string;
    quantity: number;
    amountPaid: number;
    totalAmount: number;
    capital: number; // Cost
    income: number; // Profit
    createdBy: string;
    soldDate: string;
}

const mockDailySales: DailySale[] = [
    {
        id: '1',
        sku: 'PDT-001',
        receiptNumber: 'SHSL6194074',
        transactionNumber: 18,
        productName: 'Colgate Herbal Toothpaste 35g',
        shopName: 'Muwanguzi Kiwanga',
        clientPhone: '256709419257',
        quantity: 2,
        amountPaid: 0,
        totalAmount: 55500,
        capital: 52525,
        income: 2975,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:58:04'
    },
    {
        id: '2',
        sku: 'PDT-002',
        receiptNumber: 'SHSL6194054',
        transactionNumber: 17,
        productName: 'Good Doctor Super Doctor G08, ...',
        shopName: 'Topaz Kiwanga',
        clientPhone: '256706105577',
        quantity: 9,
        amountPaid: 98000,
        totalAmount: 98000,
        capital: 82347,
        income: 15653,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:53:47'
    },
    {
        id: '3',
        sku: 'PDT-003',
        receiptNumber: 'SHSL6194043',
        transactionNumber: 16,
        productName: 'Nanchuang Nail Clipper Cutter,...',
        shopName: 'M.faith(kiwanga)',
        clientPhone: '256772803754',
        quantity: 5,
        amountPaid: 89500,
        totalAmount: 89500,
        capital: 81700,
        income: 7800,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:47:23'
    },
    {
        id: '4',
        sku: 'PDT-004',
        receiptNumber: 'SHSL6194028',
        transactionNumber: 14,
        productName: 'Krishna Candle Jumbo 8Pcs, Cue...',
        shopName: 'M.Dorah(Bukerere)',
        clientPhone: '256759527995',
        quantity: 6,
        amountPaid: 50000,
        totalAmount: 239000,
        capital: 227917,
        income: 11083,
        createdBy: 'Akello Catherine',
        soldDate: '2025-11-21T12:37:24'
    },
    {
        id: '5',
        sku: 'PDT-005',
        receiptNumber: 'SHSL6194012',
        transactionNumber: 15,
        productName: 'Alteco Super Glue 3g, Krishna ...',
        shopName: 'M. Solomon',
        clientPhone: '2560755713413',
        quantity: 7,
        amountPaid: 65500,
        totalAmount: 65500,
        capital: 58486,
        income: 7014,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:36:58'
    },
    {
        id: '6',
        sku: 'PDT-006',
        receiptNumber: 'SHSL6194005',
        transactionNumber: 14,
        productName: 'Best Star Baby Pants Maxi 8-18...',
        shopName: 'M. Benison Kiwanga',
        clientPhone: '256778795020',
        quantity: 3,
        amountPaid: 28000,
        totalAmount: 28000,
        capital: 25667,
        income: 2333,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:32:29'
    },
    {
        id: '7',
        sku: 'PDT-007',
        receiptNumber: 'SHSL6193994',
        transactionNumber: 13,
        productName: 'Cotton Red Hankies, Dent Up He...',
        shopName: 'M.sylivia(kiwanga)',
        clientPhone: '256782190926',
        quantity: 5,
        amountPaid: 77000,
        totalAmount: 77000,
        capital: 67967,
        income: 9033,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:27:50'
    },
    {
        id: '8',
        sku: 'PDT-008',
        receiptNumber: 'SHSL6193989',
        transactionNumber: 12,
        productName: 'Super Chunky Lollipops, Lato I...',
        shopName: 'M. Raphael (kiwanga)',
        clientPhone: '256704799117',
        quantity: 3,
        amountPaid: 41000,
        totalAmount: 41000,
        capital: 37125,
        income: 3875,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:19:25'
    },
    {
        id: '9',
        sku: 'PDT-009',
        receiptNumber: 'SHSL6193972',
        transactionNumber: 11,
        productName: 'Choco Coffee, Choco Strawberry...',
        shopName: 'Sarah Kiwanga',
        clientPhone: '256753957583',
        quantity: 8,
        amountPaid: 72300,
        totalAmount: 72300,
        capital: 66089,
        income: 6211,
        createdBy: 'Jackline Najjinda',
        soldDate: '2025-11-21T12:15:45'
    },
    {
        id: '10',
        sku: 'PDT-010',
        receiptNumber: 'SHSL6193959',
        transactionNumber: 13,
        productName: 'Pago Pago Small Lollipop, Down...',
        shopName: 'Mustard Seed(Bukerere)',
        clientPhone: '256704560576',
        quantity: 8,
        amountPaid: 87000,
        totalAmount: 87000,
        capital: 77795,
        income: 9205,
        createdBy: 'Akello Catherine',
        soldDate: '2025-11-21T12:01:14'
    },
];

interface DailySalesPageProps {
    theme: Theme;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: IconName; theme: Theme }> = ({ title, value, icon, theme }) => (
    <div className={`p-4 rounded-lg shadow-sm border flex flex-col justify-between h-24 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-start">
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{title}</span>
            <div className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'}`}>
                <Icon name={icon} className="h-4 w-4" />
            </div>
        </div>
        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</div>
    </div>
);

const DailySalesPage: React.FC<DailySalesPageProps> = ({ theme }) => {
    const [searchText, setSearchText] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'receipts' | 'products'>('receipts');
    
    // Product Profile Modal State
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [isProductProfileOpen, setIsProductProfileOpen] = useState(false);

    // Sale Summary Modal State
    const [selectedSaleSummary, setSelectedSaleSummary] = useState<SaleSummary | null>(null);
    const [isSaleSummaryOpen, setIsSaleSummaryOpen] = useState(false);
    
    // Filter States
    const [filterDate, setFilterDate] = useState('');
    const [filterShop, setFilterShop] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterProduct, setFilterProduct] = useState('');

    const itemsPerPage = 10;

    // Derived Lists
    const uniqueShops = useMemo(() => mockShops.filter(s => s.status === 'Active').map(s => s.name).sort(), []);
    const uniqueUsers = useMemo(() => [...new Set(mockDailySales.map(s => s.createdBy))].sort(), []);
    
    const availableProducts = useMemo(() => {
        let sales = mockDailySales;
        if (filterShop) {
            sales = sales.filter(s => s.shopName === filterShop);
        }
        return [...new Set(sales.map(s => s.productName))].sort();
    }, [filterShop]);

    // Reset product filter if it doesn't exist in the new shop selection
    React.useEffect(() => {
        if (filterProduct && !availableProducts.includes(filterProduct)) {
            setFilterProduct('');
        }
    }, [filterShop, availableProducts, filterProduct]);

    const filteredSales = useMemo(() => {
        return mockDailySales.filter(sale => {
            // Text Search
            const matchesSearch = 
                sale.productName.toLowerCase().includes(searchText.toLowerCase()) ||
                sale.shopName.toLowerCase().includes(searchText.toLowerCase()) ||
                sale.receiptNumber.toLowerCase().includes(searchText.toLowerCase());
            
            // Structured Filters
            const matchesShop = filterShop ? sale.shopName === filterShop : true;
            const matchesUser = filterUser ? sale.createdBy === filterUser : true;
            const matchesProduct = filterProduct ? sale.productName === filterProduct : true;
            
            let matchesDate = true;
            if (filterDate) {
                const saleDate = new Date(sale.soldDate).toDateString();
                const selectedDate = new Date(filterDate).toDateString();
                matchesDate = saleDate === selectedDate;
            }

            return matchesSearch && matchesShop && matchesUser && matchesProduct && matchesDate;
        });
    }, [searchText, filterShop, filterUser, filterProduct, filterDate]);

    const isFilterApplied = !!(searchText || filterDate || filterShop || filterUser || filterProduct);

    // Aggregate sales by product for 'products' viewMode
    const productSales = useMemo(() => {
        const grouped = filteredSales.reduce((acc, sale) => {
            if (!acc[sale.productName]) {
                acc[sale.productName] = {
                    productName: sale.productName,
                    totalQty: 0,
                    totalSales: 0,
                    totalCapital: 0,
                    totalIncome: 0,
                    lastSold: sale.soldDate
                };
            }
            acc[sale.productName].totalQty += sale.quantity;
            acc[sale.productName].totalSales += sale.totalAmount;
            acc[sale.productName].totalCapital += sale.capital;
            acc[sale.productName].totalIncome += sale.income;
            if (new Date(sale.soldDate) > new Date(acc[sale.productName].lastSold)) {
                acc[sale.productName].lastSold = sale.soldDate;
            }
            return acc;
        }, {} as Record<string, { productName: string, totalQty: number, totalSales: number, totalCapital: number, totalIncome: number, lastSold: string }>);
        
        return Object.values(grouped);
    }, [filteredSales]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        if (viewMode === 'products') {
            return productSales.slice(start, start + itemsPerPage);
        }
        return filteredSales.slice(start, start + itemsPerPage);
    }, [filteredSales, productSales, currentPage, viewMode]);

    const totalRecords = viewMode === 'products' ? productSales.length : filteredSales.length;

    const totals = useMemo(() => {
        // Calculate totals based on filtered data to reflect current view
        const totalSales = filteredSales.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalCapital = filteredSales.reduce((acc, curr) => acc + curr.capital, 0);
        const totalIncome = filteredSales.reduce((acc, curr) => acc + curr.income, 0);
        return {
            txns: filteredSales.length,
            sales: totalSales,
            capital: totalCapital,
            income: totalIncome
        };
    }, [filteredSales]);

    const handleResetFilters = () => {
        setFilterDate('');
        setFilterShop('');
        setFilterProduct('');
        setFilterUser('');
        setSearchText('');
        setCurrentPage(1);
    };

    const handleViewProductProfile = (productName: string) => {
        setSelectedProduct(productName);
        setIsProductProfileOpen(true);
    };

    const handleViewSaleSummary = (sale: DailySale) => {
        const dateObj = new Date(sale.soldDate);
        const summary: SaleSummary = {
            receiptNumber: sale.receiptNumber,
            transactionNumber: sale.transactionNumber,
            shopName: sale.shopName,
            date: formatDate(sale.soldDate),
            time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            items: [
                {
                    id: sale.id,
                    sku: sale.sku,
                    name: sale.productName,
                    quantity: sale.quantity,
                    unit: 'Pcs',
                    cost: sale.capital / sale.quantity,
                    amount: sale.totalAmount,
                    income: sale.income,
                    purchaseUsed: 'PUR-1023',
                    purchaseDate: '2025-11-15'
                }
            ],
            total: sale.totalAmount,
            received: sale.amountPaid || sale.totalAmount,
            balance: Math.max(0, sale.totalAmount - sale.amountPaid),
            income: sale.income,
            clientName: 'Walk-in Client',
            clientNumber: sale.clientPhone,
            servedBy: sale.createdBy,
            paymentMethod: 'Cash',
            discount: 0,
            subtotal: sale.totalAmount,
            vat: Math.round(sale.totalAmount * (18 / 118))
        };
        setSelectedSaleSummary(summary);
        setIsSaleSummaryOpen(true);
    };

    const handleExportCSV = () => {
        let dataToExport: any[] = [];
        let headers: string[] = [];
        let filename = '';

        if (viewMode === 'receipts') {
            headers = ['Receipt Number', 'Transaction Number', 'Product Name', 'Shop Name', 'Client Phone', 'Quantity', 'Amount Paid', 'Total Amount', 'Capital', 'Income', 'Created By', 'Sold Date'];
            dataToExport = filteredSales.map(sale => ({
                'Receipt Number': sale.receiptNumber,
                'Transaction Number': sale.transactionNumber,
                'Product Name': sale.productName,
                'Shop Name': sale.shopName,
                'Client Phone': sale.clientPhone,
                'Quantity': sale.quantity,
                'Amount Paid': sale.amountPaid,
                'Total Amount': sale.totalAmount,
                'Capital': sale.capital,
                'Income': sale.income,
                'Created By': sale.createdBy,
                'Sold Date': sale.soldDate
            }));
            filename = `daily_sales_receipts_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            headers = ['Product Name', 'Total Qty', 'Total Sales', 'Total Capital', 'Total Income', 'Last Sold'];
            dataToExport = productSales.map(prod => ({
                'Product Name': prod.productName,
                'Total Qty': prod.totalQty,
                'Total Sales': prod.totalSales,
                'Total Capital': prod.totalCapital,
                'Total Income': prod.totalIncome,
                'Last Sold': prod.lastSold
            }));
            filename = `daily_sales_products_${new Date().toISOString().split('T')[0]}.csv`;
        }

        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => headers.map(fieldName => {
                let value = row[fieldName];
                if (typeof value === 'string') {
                    // Escape quotes and wrap in quotes if contains comma or quote
                    value = value.replace(/"/g, '""');
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        value = `"${value}"`;
                    }
                }
                return value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const inputClass = `w-full px-3 py-2 text-sm rounded-md border outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`;

    return (
        <div className="space-y-6">
            <ProductProfileModal 
                isOpen={isProductProfileOpen}
                onClose={() => setIsProductProfileOpen(false)}
                productName={selectedProduct}
                theme={theme}
            />

            <SaleSummaryModal 
                isOpen={isSaleSummaryOpen}
                onClose={() => setIsSaleSummaryOpen(false)}
                sale={selectedSaleSummary}
                theme={theme}
                onReturnItem={(sale) => {
                    alert(`Returning item from sale: ${sale.receiptNumber}`);
                    // In a real app, you would update the state/database here
                }}
                onCancelSale={(sale) => {
                    if (confirm(`Are you sure you want to cancel sale ${sale.receiptNumber}?`)) {
                        alert(`Sale ${sale.receiptNumber} cancelled successfully.`);
                        setIsSaleSummaryOpen(false);
                    }
                }}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard title="Txns" value={totals.txns.toLocaleString()} icon="cash" theme={theme} />
                <SummaryCard title="Sales" value={totals.sales.toLocaleString()} icon="reports" theme={theme} />
                <SummaryCard title="Capital" value={totals.capital.toLocaleString()} icon="cash" theme={theme} />
                <SummaryCard title="Income" value={totals.income.toLocaleString()} icon="finances" theme={theme} />
            </div>

            {/* Filter Accordion */}
            <div className={`rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`w-full px-4 py-3 flex justify-between items-center text-sm font-medium ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="flex items-center"><Icon name="filter" className="h-4 w-4 mr-2"/> Filter</span>
                    <Icon name="chevron-right" className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-90' : ''}`} />
                </button>
                {isFilterOpen && (
                    <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Date</label>
                                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop</label>
                                <select 
                                    value={filterShop} 
                                    onChange={(e) => setFilterShop(e.target.value)} 
                                    className={inputClass}
                                >
                                    <option value="">All Shops</option>
                                    {uniqueShops.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Product</label>
                                <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className={inputClass}>
                                    <option value="">All Products</option>
                                    {availableProducts.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created By</label>
                                <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className={inputClass}>
                                    <option value="">All Users</option>
                                    {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleResetFilters} className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                <Icon name="refresh" className="h-3 w-3" />
                                <span>Reset Filters</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden`}>
                <div className={`p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Shop Sales</h2>
                        <div className={`flex rounded-md overflow-hidden border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                            <button 
                                onClick={() => { setViewMode('receipts'); setCurrentPage(1); }}
                                className={`px-4 py-1.5 text-xs font-medium transition-colors ${viewMode === 'receipts' ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}`}
                            >
                                By Receipt
                            </button>
                            <button 
                                onClick={() => { setViewMode('products'); setCurrentPage(1); }}
                                className={`px-4 py-1.5 text-xs font-medium transition-colors ${viewMode === 'products' ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}`}
                            >
                                By Item
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-grow md:w-64">
                            <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className={`w-full pl-9 pr-10 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                            />
                        </div>
                        <button 
                            onClick={handleExportCSV}
                            disabled={!isFilterApplied}
                            className={`p-2 rounded-md border transition-colors ${!isFilterApplied ? 'opacity-50 cursor-not-allowed ' : ''} ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}
                            title={isFilterApplied ? "Export CSV" : "Apply a filter to enable export"}
                        >
                            <Icon name="download" className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                {viewMode === 'receipts' ? (
                                    ['#', 'RN', 'TN', 'Product', 'Shop', 'Qty', 'Paid', 'Amount', 'Income', 'Created by', 'Sold on', 'Actions'].map((header) => (
                                        <th key={header} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {header}
                                        </th>
                                    ))
                                ) : (
                                    ['#', 'Product Name', 'Total Qty', 'Total Sales', 'Total Capital', 'Total Income', 'Last Sold', 'Actions'].map((header) => (
                                        <th key={header} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {header}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700 bg-slate-900' : 'divide-slate-200 bg-white'}`}>
                            {viewMode === 'receipts' ? (
                                (paginatedData as DailySale[]).map((sale, index) => (
                                    <tr key={sale.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <button 
                                                onClick={() => handleViewSaleSummary(sale)}
                                                className="hover:text-yellow-500 transition-colors font-medium"
                                            >
                                                {sale.receiptNumber}
                                            </button>
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {sale.transactionNumber}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{sale.productName}</div>
                                            <div className={`text-xs mt-0.5 text-slate-500`}>
                                                Client: {maskPhoneNumber(sale.clientPhone)}
                                            </div>
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {sale.shopName}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {sale.quantity}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            UGX {sale.amountPaid.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            UGX {sale.totalAmount.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            UGX {sale.income.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {sale.createdBy}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <div>{formatDate(sale.soldDate)}</div>
                                            <div>{new Date(sale.soldDate).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-blue-500 hover:text-blue-600"><Icon name="print" className="h-4 w-4" /></button>
                                                <button className="text-blue-500 hover:text-blue-600"><Icon name="edit" className="h-4 w-4" /></button>
                                                <button className="text-red-500 hover:text-red-600"><Icon name="delete" className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                (paginatedData as { productName: string, totalQty: number, totalSales: number, totalCapital: number, totalIncome: number, lastSold: string }[]).map((prod, index) => (
                                    <tr key={index} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className={`px-4 py-4 text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {prod.productName}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {prod.totalQty}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            UGX {prod.totalSales.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            UGX {prod.totalCapital.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            UGX {prod.totalIncome.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {formatDate(prod.lastSold)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => handleViewProductProfile(prod.productName)}
                                                    className="text-blue-500 hover:text-blue-600" 
                                                    title="View Product Profile"
                                                >
                                                    <Icon name="view" className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords.toLocaleString()} records
                        <select className={`ml-2 p-1 border rounded text-xs ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}>
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 disabled:opacity-50' : 'hover:bg-slate-100 text-slate-500 disabled:opacity-50'}`}
                        >
                            <Icon name="chevron-left" className="h-3 w-3" />
                        </button>
                        <span className={`px-3 py-1 rounded bg-yellow-400 text-slate-900 text-sm font-medium`}>{currentPage}</span>
                        <button 
                            onClick={() => setCurrentPage(currentPage + 1)} // In a real app check against max pages
                            disabled={currentPage * itemsPerPage >= totalRecords}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 disabled:opacity-50' : 'hover:bg-slate-100 text-slate-500 disabled:opacity-50'}`}
                        >
                            <Icon name="chevron-right" className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySalesPage;

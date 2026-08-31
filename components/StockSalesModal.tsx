import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
    Package, 
    ShoppingCart, 
    User, 
    Hash, 
    Calendar, 
    FileText, 
    DollarSign, 
    Phone, 
    Truck, 
    ArrowUpRight, 
    TrendingUp, 
    Clock, 
    Smartphone, 
    BarChart3, 
    ChevronDown,
    Info,
    CheckCircle2,
    AlertCircle,
    X,
    ExternalLink,
    History,
    Layers,
    Tag,
    Plus,
    Receipt,
    ClipboardCheck,
    Box,
    ArrowRight,
    SmartphoneIcon,
    MonitorIcon,
    ChevronUp
} from 'lucide-react';
import { Purchase, SelectedProduct, Theme, StockSale, ReconciliationDetails, User as UserType } from '../types';
import Icon from './Icon';
import ViewReceiptModal from './ViewReceiptModal';
import NewSaleModal from './NewSaleModal';
import { mockPurchases } from '../data';
import { formatDate } from '../utils';

interface StockSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  product: SelectedProduct | null;
  theme: Theme;
  currentUser: UserType;
}

// Mock sales data generation
const generateMockSales = (product: SelectedProduct | null, purchase: Purchase | null): StockSale[] => {
    if (!product || !purchase) return [];

    const mockClients = ['John Doe', 'Jane Smith', 'Agro Farmers Ltd', 'Local Clinic', 'Walk-in Customer'];
    const mockCashiers = ['Alice Johnson', 'Bob Williams', 'Charlie Brown'];
    
    const sales: StockSale[] = [];
    const numSales = Math.floor(Math.random() * 4) + 1; // 1 to 4 sales
    let remainingQuantity = product.quantity;

    for (let i = 0; i < numSales && remainingQuantity > 0; i++) {
        const quantitySold = Math.min(remainingQuantity, Math.floor(Math.random() * (product.quantity / 2)) + 1);
        if (quantitySold <= 0) continue;
        remainingQuantity -= quantitySold;
        
        const saleUnitPrice = product.unitPrice * (1 + (Math.random() * 0.3 + 0.1)); // 10-40% markup
        const totalAmount = quantitySold * saleUnitPrice;
        
        const saleDate = new Date(purchase.dateOfPurchase);
        saleDate.setDate(new Date(purchase.dateOfPurchase).getDate() + Math.floor(Math.random() * 30) + 1); // Sale within 30 days of purchase
        saleDate.setHours(Math.floor(Math.random() * 12) + 8); // Sales between 8 AM and 8 PM
        saleDate.setMinutes(Math.floor(Math.random() * 60));

        sales.push({
            saleId: `SALE-${purchase.id}-${product.id}-${i+1}`,
            saleDate: saleDate.toISOString(), // Full ISO string with time
            quantitySold,
            saleUnitPrice,
            totalAmount,
            receiptNumber: `RCPT-${Math.floor(Math.random() * 9000) + 1000}`,
            clientName: mockClients[Math.floor(Math.random() * mockClients.length)],
            soldBy: mockCashiers[Math.floor(Math.random() * mockCashiers.length)],
        });
    }
    // Sort by date descending (most recent sale first)
    return sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
};


const StockSalesModal: React.FC<StockSalesModalProps> = ({ isOpen, onClose, purchase, product, theme, currentUser }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [sales, setSales] = useState<StockSale[]>([]);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<StockSale | null>(null);
    const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
    const [showSupplierInfo, setShowSupplierInfo] = useState(false);

    useEffect(() => {
        if (isOpen && product && purchase) {
            setSales(generateMockSales(product, purchase));
        }
        if (!isOpen) {
            setIsClosing(false);
            setIsReceiptModalOpen(false);
            setSelectedSale(null);
            setIsNewSaleModalOpen(false);
            setSales([]);
        }
    }, [isOpen, product, purchase]);

    const totalSold = useMemo(() => sales.reduce((sum, sale) => sum + sale.quantitySold, 0), [sales]);
    const remainingQuantity = product ? product.quantity - totalSold : 0;

    const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.totalAmount, 0), [sales]);
    const totalProfit = useMemo(() => totalRevenue * 0.33, [totalRevenue]); // Mock profit calculation

    const depletionPercentage = useMemo(() => {
        if (!product) return 0;
        const totalPurchased = product.quantity;
        return Math.min(Math.round((totalSold / totalPurchased) * 100), 100);
    }, [product, totalSold]);

    const handleSaveNewSale = (newSale: StockSale) => {
        setSales(prevSales => [newSale, ...prevSales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
        setIsNewSaleModalOpen(false);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleViewReceipt = (sale: StockSale) => {
        setSelectedSale(sale);
        setIsReceiptModalOpen(true);
    };

    if (!isOpen && !isClosing) return null;
    if (!purchase || !product) return null;

    const KPICard = ({ label, value, subValue, icon: IconComponent, color = "blue" }: { label: string; value: string | number; subValue?: string; icon: any; color?: string }) => {
        const colorClasses = {
            blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
            green: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
            amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
            purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
        }[color] || "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";

        return (
            <div className={`flex-1 p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'} flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all`}>
                <div className={`p-3 rounded-xl mb-3 ${colorClasses}`}>
                    <IconComponent className="h-5 w-5" />
                </div>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
                {subValue && <p className="text-[10px] font-bold text-emerald-500 mt-1">{subValue}</p>}
            </div>
        );
    };

    const DetailGridItem = ({ label, value, icon: IconComponent }: { label: string; value: string | number; icon: any }) => (
        <div className={`flex items-center space-x-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'} border`}>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
                <IconComponent className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                </div>
                <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{value}</p>
            </div>
        </div>
    );
    
    const ReconciliationItem: React.FC<{details: ReconciliationDetails}> = ({details}) => {
         const differenceColor = details.difference > 0 ? 'text-emerald-500' : details.difference < 0 ? 'text-rose-500' : (theme === 'dark' ? 'text-slate-200' : 'text-slate-700');
         const differenceSign = details.difference > 0 ? '+' : '';

        return (
            <div className="relative flex items-start mb-8">
                 <div className="absolute left-[-2.5rem] top-0 flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center z-10 ring-8 ring-offset-0" style={{ '--tw-ring-offset-color': theme === 'dark' ? '#0f172a' : '#ffffff' } as React.CSSProperties}>
                    <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <div className={`flex-1 p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Stock Reconciliation</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`}>
                            {formatDate(details.reconciledOn)}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{product?.quantity} {product?.unit}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Physical</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{details.physicalCount} {product?.unit}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diff</p>
                            <p className={`text-sm font-bold ${differenceColor}`}>{differenceSign}{details.difference} {product?.unit}</p>
                        </div>
                    </div>
                    {details.remarks && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                            <p className={`text-xs italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>"{details.remarks}"</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <ViewReceiptModal 
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                sale={selectedSale}
                product={product}
                purchase={purchase}
                theme={theme}
            />
            <NewSaleModal
                isOpen={isNewSaleModalOpen}
                onClose={() => setIsNewSaleModalOpen(false)}
                onSave={handleSaveNewSale}
                product={product}
                purchase={purchase}
                remainingQuantity={remainingQuantity}
                theme={theme}
                currentUser={currentUser}
            />
            
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h2>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purchase</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">{product.category} stock</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center text-xs text-slate-400 font-medium">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatDistanceToNow(new Date(purchase.dateOfPurchase), { addSuffix: true })}
                                        </div>
                                        <button 
                                            onClick={handleClose}
                                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <X className="h-5 w-5 text-slate-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                                {/* Description Box */}
                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'} text-sm text-slate-500 dark:text-slate-400 leading-relaxed`}>
                                    New stock received from {purchase.bulkEntrySerial.includes('BES') ? 'Main Distributor' : 'Local Supplier'} - Fresh batch of {product.quantity} units ready for retail sale. Premium quality inventory now available for customers.
                                </div>

                                {/* KPI Cards */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <KPICard 
                                        label="In Stock" 
                                        value={remainingQuantity} 
                                        icon={Box} 
                                        color="green" 
                                    />
                                    <KPICard 
                                        label="Units Sold" 
                                        value={totalSold} 
                                        icon={ShoppingCart} 
                                        color="blue" 
                                    />
                                    <KPICard 
                                        label="Revenue" 
                                        value={`UGX ${totalRevenue.toLocaleString()}`} 
                                        subValue={`UGX ${totalProfit.toLocaleString()} profit`}
                                        icon={TrendingUp} 
                                        color="green" 
                                    />
                                </div>

                                {/* Inventory Depletion Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory depletion</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{depletionPercentage}% sold</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${depletionPercentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <DetailGridItem label="By" value={purchase.actionBy} icon={User} />
                                    <DetailGridItem label="Batch" value={product.batchNumber || "N/A"} icon={Hash} />
                                    <DetailGridItem label="Expiry" value={formatDate(purchase.dateOfPurchase)} icon={Calendar} />
                                    <DetailGridItem label="Invoice" value={purchase.invoiceNumber} icon={FileText} />
                                    <DetailGridItem label="Value" value={`UGX ${(product.quantity * product.unitPrice).toLocaleString()}`} icon={DollarSign} />
                                    <DetailGridItem label="Unit" value={`UGX ${product.unitPrice.toLocaleString()}`} icon={DollarSign} />
                                </div>

                                {/* Action Bar */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                                    <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {formatDate(purchase.dateOfPurchase)}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button 
                                            onClick={() => setIsNewSaleModalOpen(true)}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            <span>{sales.length} Sales</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => setShowSupplierInfo(true)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                                        >
                                            <Truck className="h-4 w-4" />
                                            <span>Supplier Info</span>
                                        </button>
                                    </div>
                                </div>

                                <div className={`h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />

                                {/* Sales Timeline Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30" />
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Sales</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sales.length} transactions</span>
                                    </div>

                                    <div className="relative pl-8 space-y-4">
                                        {/* Vertical Line */}
                                        <div className={`absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />

                                        {sales.length > 0 ? sales.map((sale, index) => (
                                            <div key={sale.saleId} className="relative">
                                                {/* Timeline Dot */}
                                                <div className={`absolute -left-[25px] top-4 w-4 h-4 rounded-full border-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} z-10`} />
                                                
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-md transition-all group`}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                                {sales.length - index}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                                                                    <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Cash Sale</span>
                                                                    <span className="text-emerald-500 font-bold">UGX {sale.totalAmount.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {formatDistanceToNow(new Date(sale.saleDate), { addSuffix: true })}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                                                        <div>
                                                            <p className="text-slate-400 font-medium mb-0.5">Receipt: <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{sale.receiptNumber}</span></p>
                                                            <p className="text-slate-400 font-medium">Client: <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{sale.clientName}</span></p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-400 font-medium mb-0.5">Seller: <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{sale.soldBy}</span></p>
                                                            <p className="text-slate-400 font-medium">Qty: <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{sale.quantitySold} unit</span></p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                                                <SmartphoneIcon className="h-3 w-3" />
                                                                <span className="text-[10px] font-bold uppercase">Android</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v1.2.60</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleViewReceipt(sale)}
                                                            className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-[10px] font-bold uppercase tracking-widest"
                                                        >
                                                            <ArrowUpRight className="h-3 w-3 mr-1" />
                                                            Details
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center py-12 w-full bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                                                <ShoppingCart className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No sales recorded for this batch yet</p>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center space-x-3 pt-4">
                                            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of timeline</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Info className="h-4 w-4" />
                                    <span>Batch reconciliation is up to date</span>
                                </div>
                                <button 
                                    onClick={handleClose}
                                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/10 dark:shadow-white/10"
                                >
                                    Close Details
                                </button>
                            </div>

                            {/* Supplier Info Modal */}
                            <AnimatePresence>
                                {showSupplierInfo && (
                                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setShowSupplierInfo(false)}
                                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                                                        <Truck className="h-5 w-5" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Supplier Information</h4>
                                                </div>
                                                <button onClick={() => setShowSupplierInfo(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <X className="h-4 w-4 text-slate-500" />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company Name</p>
                                                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">Global Pharm Logistics Ltd</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Person</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">James Wilson</p>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">+256 772 123 456</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Physical Address</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Plot 45, Industrial Area, Kampala</p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => setShowSupplierInfo(false)}
                                                className="w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                                            >
                                                Got it
                                            </button>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StockSalesModal;
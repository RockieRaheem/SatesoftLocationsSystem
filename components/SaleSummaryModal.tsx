import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Ban, Check, ChevronLeft, AlertCircle, Edit2, Save } from 'lucide-react';
import { Theme, Purchase } from '../types';
import { maskPhoneNumber, formatDate } from '../utils';
import { mockPurchases } from '../data';

export interface SaleItem {
    id: string;
    sku: string;
    name: string;
    quantity: number;
    unit: string;
    cost: number;
    amount: number;
    income: number;
    purchaseUsed: string;
    purchaseDate: string;
}

export interface SaleSummary {
    receiptNumber: string;
    transactionNumber: number;
    shopName: string;
    date: string;
    time: string;
    items: SaleItem[];
    total: number;
    received: number;
    balance: number;
    income: number;
    clientName: string;
    clientNumber: string;
    servedBy: string;
    paymentMethod: string;
    discount: number;
    subtotal: number;
    vat: number;
}

interface SaleSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: SaleSummary | null;
    theme: Theme;
    onReturnItem?: (sale: SaleSummary) => void;
    onCancelSale?: (sale: SaleSummary) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode, isDark: boolean }> = ({ label, value, isDark }) => (
    <div>
        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</div>
        <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</div>
    </div>
);

const SaleSummaryModal: React.FC<SaleSummaryModalProps> = ({ isOpen, onClose, sale, theme, onReturnItem, onCancelSale }) => {
    const [viewingPurchaseId, setViewingPurchaseId] = useState<string | null>(null);
    const [viewingProductId, setViewingProductId] = useState<string | null>(null);
    const [lastViewedProductId, setLastViewedProductId] = useState<string | null>(null);
    const [isEditingPurchase, setIsEditingPurchase] = useState(false);
    const [editFormData, setEditFormData] = useState<Purchase | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);

    const selectedPurchase = useMemo(() => {
        if (!viewingPurchaseId) return null;
        return purchases.find(p => p.bulkEntrySerial === viewingPurchaseId) || null;
    }, [viewingPurchaseId, purchases]);

    useEffect(() => {
        if (!isOpen) {
            setViewingPurchaseId(null);
            setViewingProductId(null);
            setLastViewedProductId(null);
            setIsEditingPurchase(false);
            setEditFormData(null);
        }
    }, [isOpen]);

    const handleStartEdit = () => {
        if (selectedPurchase) {
            setEditFormData({ ...selectedPurchase });
            setIsEditingPurchase(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingPurchase(false);
        setEditFormData(null);
    };

    const handleSaveEdit = () => {
        if (editFormData) {
            setPurchases(prev => prev.map(p => p.id === editFormData.id ? editFormData : p));
            setIsEditingPurchase(false);
            setEditFormData(null);
        }
    };

    const handleInputChange = (field: keyof Purchase, value: any) => {
        if (editFormData) {
            setEditFormData({ ...editFormData, [field]: value });
        }
    };

    if (!sale) return null;

    const isDark = theme === 'dark';

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col ${
                            isDark ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900'
                        }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                {viewingPurchaseId && (
                                    <button 
                                        onClick={() => setViewingPurchaseId(null)}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        title="Back to Sale Summary"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-400" />
                                    </button>
                                )}
                                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                                    {viewingPurchaseId && selectedPurchase 
                                        ? (
                                            <div className="flex flex-col">
                                                <span>{selectedPurchase.bulkEntrySerial} [{formatDate(selectedPurchase.dateOfPurchase)}]</span>
                                                {viewingProductId && (
                                                    <span className="text-xs text-yellow-500 font-medium">
                                                        Item: {selectedPurchase.products.find(p => p.sku === viewingProductId)?.name || viewingProductId}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                        : viewingPurchaseId ? 'Purchase Details' : 'Sale Summary'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <AnimatePresence mode="wait">
                                {viewingPurchaseId ? (
                                    <motion.div
                                        key="purchase-view"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        {selectedPurchase ? (
                                            <div className="space-y-6">
                                                <div className={`p-6 border rounded-xl ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
                                                    {isEditingPurchase && editFormData ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] uppercase font-bold text-gray-500">Bulk Entry Serial</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={editFormData.bulkEntrySerial}
                                                                    onChange={(e) => handleInputChange('bulkEntrySerial', e.target.value)}
                                                                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] uppercase font-bold text-gray-500">Supplier (Shop)</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={editFormData.shop}
                                                                    onChange={(e) => handleInputChange('shop', e.target.value)}
                                                                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] uppercase font-bold text-gray-500">Invoice #</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={editFormData.invoiceNumber}
                                                                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                                                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] uppercase font-bold text-gray-500">Date of Purchase</label>
                                                                <input 
                                                                    type="date" 
                                                                    value={editFormData.dateOfPurchase.split('T')[0]}
                                                                    onChange={(e) => handleInputChange('dateOfPurchase', e.target.value)}
                                                                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] uppercase font-bold text-gray-500">Total Amount</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={editFormData.amount}
                                                                    onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                                                                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] uppercase font-bold text-gray-500">Entries Made</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={editFormData.entriesMade}
                                                                    onChange={(e) => handleInputChange('entriesMade', Number(e.target.value))}
                                                                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] uppercase font-bold text-gray-500">Action By</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={editFormData.actionBy}
                                                                    onChange={(e) => handleInputChange('actionBy', e.target.value)}
                                                                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2 pt-4">
                                                                <input 
                                                                    type="checkbox" 
                                                                    id="reconciled"
                                                                    checked={editFormData.reconciled}
                                                                    onChange={(e) => handleInputChange('reconciled', e.target.checked)}
                                                                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                                                                />
                                                                <label htmlFor="reconciled" className="text-sm font-bold text-slate-700 dark:text-slate-200">Reconciled</label>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                            <DetailItem isDark={isDark} label="Bulk Entry Serial" value={selectedPurchase.bulkEntrySerial} />
                                                            <DetailItem isDark={isDark} label="Supplier (Shop)" value={selectedPurchase.shop} />
                                                            <DetailItem isDark={isDark} label="Invoice #" value={selectedPurchase.invoiceNumber} />
                                                            <DetailItem isDark={isDark} label="Date of Purchase" value={formatDate(selectedPurchase.dateOfPurchase)} />
                                                            <DetailItem isDark={isDark} label="Total Amount" value={<span className="text-lg">{selectedPurchase.amount}</span>} />
                                                            <DetailItem isDark={isDark} label="Entries Made" value={selectedPurchase.entriesMade} />
                                                            <DetailItem isDark={isDark} label="Action By" value={selectedPurchase.actionBy} />
                                                            <DetailItem isDark={isDark} label="Date of Entry" value={selectedPurchase.dateOfEntry} />
                                                            <DetailItem isDark={isDark} label="Status" value={
                                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                                                                    selectedPurchase.reconciled 
                                                                        ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800')
                                                                        : (isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800')
                                                                }`}>
                                                                    {selectedPurchase.reconciled ? 'RECONCILED' : 'UNRECONCILED'}
                                                                </span>
                                                            } />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className={`text-md font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                        {viewingProductId ? 'Selected Product Detail' : 'Product Details'}
                                                    </h4>
                                                    <button 
                                                        onClick={() => {
                                                            if (viewingProductId) {
                                                                setLastViewedProductId(viewingProductId);
                                                                setViewingProductId(null);
                                                            } else if (lastViewedProductId) {
                                                                setViewingProductId(lastViewedProductId);
                                                            }
                                                        }}
                                                        className="text-xs text-yellow-500 hover:underline font-bold"
                                                    >
                                                        {viewingProductId ? 'Show other purchase' : 'Hide other purchase'}
                                                    </button>
                                                </div>
                                                <div className={`border rounded-xl divide-y overflow-hidden ${isDark ? 'border-white/10 divide-white/10' : 'border-gray-100 divide-gray-100'}`}>
                                                        {(isEditingPurchase && editFormData ? editFormData.products : selectedPurchase.products)
                                                            .filter(p => !viewingProductId || p.sku === viewingProductId)
                                                            .map((product, idx) => (
                                                            <div key={product.sku} className={`p-4 space-y-4 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                                                                {isEditingPurchase && editFormData ? (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] uppercase font-bold text-gray-500">Product Name</label>
                                                                            <input 
                                                                                type="text" 
                                                                                value={product.name}
                                                                                onChange={(e) => {
                                                                                    const newProducts = [...editFormData.products];
                                                                                    const pIdx = editFormData.products.findIndex(p => p.sku === product.sku);
                                                                                    newProducts[pIdx] = { ...product, name: e.target.value };
                                                                                    handleInputChange('products', newProducts);
                                                                                }}
                                                                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] uppercase font-bold text-gray-500">SKU</label>
                                                                            <input 
                                                                                type="text" 
                                                                                value={product.sku}
                                                                                disabled
                                                                                className={`w-full px-3 py-2 rounded-md border text-sm opacity-60 cursor-not-allowed ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] uppercase font-bold text-gray-500">Quantity</label>
                                                                            <input 
                                                                                type="number" 
                                                                                value={product.quantity}
                                                                                onChange={(e) => {
                                                                                    const newProducts = [...editFormData.products];
                                                                                    const pIdx = editFormData.products.findIndex(p => p.sku === product.sku);
                                                                                    newProducts[pIdx] = { ...product, quantity: Number(e.target.value) };
                                                                                    handleInputChange('products', newProducts);
                                                                                }}
                                                                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] uppercase font-bold text-gray-500">Unit Price</label>
                                                                            <input 
                                                                                type="number" 
                                                                                value={product.unitPrice}
                                                                                onChange={(e) => {
                                                                                    const newProducts = [...editFormData.products];
                                                                                    const pIdx = editFormData.products.findIndex(p => p.sku === product.sku);
                                                                                    newProducts[pIdx] = { ...product, unitPrice: Number(e.target.value) };
                                                                                    handleInputChange('products', newProducts);
                                                                                }}
                                                                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] uppercase font-bold text-gray-500">Batch Number</label>
                                                                            <input 
                                                                                type="text" 
                                                                                value={product.batchNumber || ''}
                                                                                onChange={(e) => {
                                                                                    const newProducts = [...editFormData.products];
                                                                                    const pIdx = editFormData.products.findIndex(p => p.sku === product.sku);
                                                                                    newProducts[pIdx] = { ...product, batchNumber: e.target.value };
                                                                                    handleInputChange('products', newProducts);
                                                                                }}
                                                                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] uppercase font-bold text-gray-500">Expiry Date</label>
                                                                            <input 
                                                                                type="date" 
                                                                                value={product.expirationDate ? product.expirationDate.split('T')[0] : ''}
                                                                                onChange={(e) => {
                                                                                    const newProducts = [...editFormData.products];
                                                                                    const pIdx = editFormData.products.findIndex(p => p.sku === product.sku);
                                                                                    newProducts[pIdx] = { ...product, expirationDate: e.target.value };
                                                                                    handleInputChange('products', newProducts);
                                                                                }}
                                                                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{product.name}</p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{`UGX ${(product.quantity * product.unitPrice).toLocaleString()}`}</p>
                                                                                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{`${product.quantity} ${product.unit}(s) at UGX ${product.unitPrice.toLocaleString()}`}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`text-[10px] grid grid-cols-2 gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                                            <p><span className="opacity-60 uppercase font-bold">Batch:</span> {product.batchNumber || 'N/A'}</p>
                                                                            <p><span className="opacity-60 uppercase font-bold">Expiry:</span> {product.expirationDate ? formatDate(product.expirationDate) : 'N/A'}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {selectedPurchase.products.filter(p => !viewingProductId || p.sku === viewingProductId).length === 0 && (
                                                            <div className="p-8 text-center text-sm text-gray-500 italic">Product record not found in this purchase.</div>
                                                        )}
                                                    </div>
                                                </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500">Purchase record not found.</p>
                                                <button 
                                                    onClick={() => setViewingPurchaseId(null)}
                                                    className="mt-4 text-yellow-500 font-bold hover:underline"
                                                >
                                                    Back to Sale Summary
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="sale-view"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        {/* Shop Info & Transaction Number */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-300">{sale.shopName}</h3>
                                                <div className="text-sm text-gray-500 mt-1 uppercase font-medium">
                                                    SN: {sale.receiptNumber}
                                                </div>
                                                <div className="text-sm text-slate-700 dark:text-slate-400 mt-2 font-bold">
                                                    {sale.date}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-5xl font-bold text-slate-600 dark:text-slate-300">
                                                    {sale.transactionNumber}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 font-bold">
                                                    {sale.time}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-gray-500 border-b border-gray-100 dark:border-white/5">
                                                        <th className="pb-3 text-left font-bold">#</th>
                                                        <th className="pb-3 text-left font-bold">Item</th>
                                                        <th className="pb-3 text-right font-bold">Qty</th>
                                                        <th className="pb-3 text-right font-bold">Cost</th>
                                                        <th className="pb-3 text-right font-bold">Amount</th>
                                                        <th className="pb-3 text-right font-bold">Income</th>
                                                        <th className="pb-3 text-right font-bold">Purchase Used</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                                    {sale.items.map((item, index) => (
                                                        <tr key={item.id} className="group">
                                                            <td className="py-4 text-gray-400">{index + 1}</td>
                                                            <td className="py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-white/10 flex-shrink-0" />
                                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-right text-slate-600 dark:text-slate-300">
                                                                {item.quantity} {item.unit}
                                                            </td>
                                                            <td className="py-4 text-right text-slate-600 dark:text-slate-300">
                                                                {item.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="py-4 text-right text-slate-600 dark:text-slate-300">
                                                                {item.amount.toLocaleString()}
                                                            </td>
                                                            <td className="py-4 text-right text-slate-600 dark:text-slate-300">
                                                                {item.income.toLocaleString()}
                                                            </td>
                                                            <td className="py-4 text-right min-w-[180px]">
                                                                <button 
                                                                    onClick={() => {
                                                                        setViewingPurchaseId(item.purchaseUsed);
                                                                        setViewingProductId(item.sku);
                                                                        setLastViewedProductId(item.sku);
                                                                        const p = purchases.find(p => p.bulkEntrySerial === item.purchaseUsed);
                                                                        if (p) {
                                                                            setEditFormData({ ...p });
                                                                            setIsEditingPurchase(true);
                                                                        }
                                                                    }}
                                                                    className="text-yellow-500 hover:text-yellow-600 transition-all text-right flex flex-col items-end ml-auto group"
                                                                >
                                                                    <span className="font-medium group-hover:font-bold tracking-tight">{item.sku} {item.purchaseUsed}</span>
                                                                    <span className="text-[10px] font-thin group-hover:font-medium opacity-70 mt-0.5">{formatDate(item.purchaseDate)}</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Summary Details */}
                                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5 w-full">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                    {sale.subtotal.toLocaleString()}
                                                </span>
                                            </div>
                                            {sale.discount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-blue-500 font-medium">Discount</span>
                                                    <span className="text-lg font-bold text-blue-500">
                                                        <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                        -{sale.discount.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">VAT (18%)</span>
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                    {sale.vat.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Total Payable</span>
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                    {sale.total.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Received</span>
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                    {sale.received.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Purchased <span className="font-bold text-slate-700 dark:text-slate-200">{sale.items.length} items</span></span>
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                    {sale.total.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Balance</span>
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                    {sale.balance.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Income</span>
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="text-[10px] mr-1 uppercase opacity-60">UGX</span>
                                                    {sale.income.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Client name</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{sale.clientName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Client number</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{maskPhoneNumber(sale.clientNumber)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500 font-medium">Served by:</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{sale.servedBy}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 bg-gray-50/50 dark:bg-white/5">
                            {viewingPurchaseId ? (
                                isEditingPurchase ? (
                                    <>
                                        <button 
                                            onClick={handleSaveEdit}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all active:scale-95 ${
                                                isDark 
                                                    ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                                    : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md'
                                            }`}
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-2 px-6 py-2 border border-slate-200 dark:border-white/10 rounded-md text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleStartEdit}
                                            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-slate-900 rounded-md text-sm font-bold hover:bg-yellow-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => setViewingPurchaseId(null)}
                                            className="flex items-center gap-2 px-6 py-2 border border-slate-200 dark:border-white/10 rounded-md text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Close
                                        </button>
                                    </>
                                )
                            ) : (
                                <>
                                    <button 
                                        onClick={() => {
                                            if (onReturnItem && sale) onReturnItem(sale);
                                            else console.log('Return item clicked for sale:', sale.receiptNumber);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 rounded-md text-sm font-bold hover:bg-black/90 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Return item
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (onCancelSale && sale) onCancelSale(sale);
                                            else console.log('Cancel sale clicked for sale:', sale.receiptNumber);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-md text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <Ban className="w-4 h-4" />
                                        Cancel Sale
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-md text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>
    );
};

export default SaleSummaryModal;

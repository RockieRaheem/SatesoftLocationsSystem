
import React, { useState } from 'react';
import { Theme, StockItem } from '../types';
import Icon from './Icon';

interface ViewStockItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    stockItem: StockItem | null;
    theme: Theme;
}

const ViewStockItemModal: React.FC<ViewStockItemModalProps> = ({ isOpen, onClose, stockItem, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen || !stockItem) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const labelClass = `text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`;
    const valueClass = `text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`;
    const sectionTitleClass = `text-sm font-bold border-b pb-2 mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-yellow-500 border-slate-700' : 'text-slate-800 border-slate-200'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div 
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl border flex flex-col ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                } ${isClosing ? 'animate-out fade-out zoom-out duration-300' : 'animate-in fade-in zoom-in duration-300'}`}
            >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Icon name="stock-listing" className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                Stock Item Details
                            </h2>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                SN: {stockItem.productSN}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleClose}
                        className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Basic Info */}
                    <section>
                        <h3 className={sectionTitleClass}>
                            <Icon name="product-chain" className="h-4 w-4" />
                            Product Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className={labelClass}>Product Name</p>
                                <p className={valueClass}>{stockItem.productName}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Custom Name</p>
                                <p className={valueClass}>{stockItem.customName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Barcode</p>
                                <p className={valueClass}>{stockItem.barcode || 'N/A'}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Category</p>
                                <p className={valueClass}>{stockItem.category}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Manufacturer</p>
                                <p className={valueClass}>{stockItem.manufacturer || 'N/A'}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Base Unit</p>
                                <p className={valueClass}>{stockItem.baseUnit || 'N/A'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Inventory & Pricing */}
                    <section>
                        <h3 className={sectionTitleClass}>
                            <Icon name="check-circle" className="h-4 w-4" />
                            Inventory & Pricing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className={labelClass}>Quantity</p>
                                <p className={valueClass}>{stockItem.quantity} {stockItem.unit}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Unit Price</p>
                                <p className={valueClass}>{stockItem.currency} {stockItem.unitPrice.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Reorder Point</p>
                                <p className={valueClass}>{stockItem.reorderPoint || 'N/A'}</p>
                            </div>
                            <div>
                                <p className={labelClass}>VAT Type</p>
                                <p className={valueClass}>{stockItem.vatType || 'None'}</p>
                            </div>
                            <div>
                                <p className={labelClass}>VAT Percentage</p>
                                <p className={valueClass}>{stockItem.vatPercentage || 0}%</p>
                            </div>
                            <div>
                                <p className={labelClass}>Supplier</p>
                                <p className={valueClass}>{stockItem.supplier || 'N/A'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Listing Metadata */}
                    <section className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={sectionTitleClass}>
                            <Icon name="user" className="h-4 w-4" />
                            Listing Metadata
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className={labelClass}>Listed By</p>
                                <p className={valueClass}>{stockItem.listedBy}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Listed On</p>
                                <p className={valueClass}>
                                    {new Date(stockItem.listedOn).toLocaleString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className={labelClass}>Shop Name</p>
                                <p className={valueClass}>{stockItem.shopName}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Shop ID</p>
                                <p className={valueClass}>#{stockItem.shopId}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className={labelClass}>Remarks</p>
                                <p className={`${valueClass} italic`}>"{stockItem.remarks || 'No remarks provided.'}"</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-end ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <button 
                        onClick={handleClose}
                        className="px-6 py-2 bg-black text-yellow-500 font-bold rounded-lg hover:bg-slate-900 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewStockItemModal;

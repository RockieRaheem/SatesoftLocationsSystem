
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, SelectedProduct, Purchase, Theme } from '../types';
import Icon from './Icon';
import { mockProductDefinitions } from '../data';

interface EditStockPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Purchase) => void;
  purchase: Purchase | null;
  theme: Theme;
}

// Map mock definitions to Product interface used by purchase flow
const allProducts: Product[] = mockProductDefinitions.map(pd => ({
    id: pd.id.toString(),
    name: pd.name,
    sku: pd.sn,
    defaultUnit: pd.baseUnit || 'Unit',
    defaultUnitPrice: 0,
    hasBatchNumber: pd.hasBatchNumber,
    hasExpiryDate: pd.hasExpiryDate
}));

const suppliers = [
    'Microvet Agroinputs Hub Mublo',
    'Equacare Pharmacy',
    'Korine Distributors Limited',
    'Mickey Tablets and More UG'
];

const availableUnits = ['Piece', 'Box', 'Pack', 'Bottle', 'Carton', 'Dozen', 'Kg', 'Unit'];

const EditStockPurchaseModal: React.FC<EditStockPurchaseModalProps> = ({ isOpen, onClose, onUpdate, purchase, theme }) => {
    const [selectedProducts, setSelectedProducts] = useState<Map<string, SelectedProduct>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [supplier, setSupplier] = useState('');
    const [dateOfPurchase, setDateOfPurchase] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const productSelectorRef = useRef<HTMLDivElement>(null);

    const selectedProductsArray = useMemo(() => Array.from(selectedProducts.values()), [selectedProducts]);

    useEffect(() => {
        if (purchase) {
            setSupplier(purchase.shop);
            setDateOfPurchase(purchase.dateOfPurchase);
            setInvoiceNumber(purchase.invoiceNumber);
            const productMap = new Map<string, SelectedProduct>();
            purchase.products.forEach(p => {
                // Ensure product flags are merged if missing from stored data
                const def = allProducts.find(ap => ap.sku === p.sku);
                const merged = { ...def, ...p };
                productMap.set(p.sku, merged);
            });
            setSelectedProducts(productMap);
        }
    }, [purchase, isOpen]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productSelectorRef.current && !productSelectorRef.current.contains(event.target as Node)) {
                setIsProductDropdownOpen(false);
            }
        };

        if (isOpen && isProductDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isProductDropdownOpen]);

    const filteredProducts = useMemo(() => 
        allProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        ), [searchQuery]);
    
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleUpdate = () => {
        if (!purchase) return;

        // Validation for expiry dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const product of selectedProductsArray) {
            if (product.hasExpiryDate) {
                if (!product.expirationDate) {
                     alert(`Please enter an expiry date for ${product.name}`);
                     return;
                }
                const expDate = new Date(product.expirationDate);
                if (expDate <= today) {
                    alert(`Expiry date for ${product.name} must be in the future.`);
                    return;
                }
            }
        }

        const totalAmount = selectedProductsArray.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
        const formattedAmount = `UGX ${new Intl.NumberFormat('en-US').format(totalAmount)}`;
        
        const entryTimestamp = new Date().toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const updatedPurchase: Purchase = {
            ...purchase,
            shop: supplier,
            entriesMade: selectedProducts.size,
            amount: formattedAmount,
            dateOfEntry: entryTimestamp,
            dateOfPurchase: dateOfPurchase,
            invoiceNumber: invoiceNumber,
            products: selectedProductsArray,
        };
        
        onUpdate(updatedPurchase);
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    const handleToggleProduct = (product: Product) => {
        setSelectedProducts(prev => {
            const newMap = new Map(prev);
            if (newMap.has(product.sku)) {
                newMap.delete(product.sku);
            } else {
                newMap.set(product.sku, { 
                    ...product, 
                    unit: product.defaultUnit, 
                    quantity: 1, 
                    unitPrice: product.defaultUnitPrice, 
                    batchNumber: '', 
                    expirationDate: '', 
                    remarks: '' 
                });
            }
            return newMap;
        });
    };
    
    const handleRemoveProduct = (sku: string) => {
        setSelectedProducts(prev => {
            const newMap = new Map(prev);
            newMap.delete(sku);
            return newMap;
        });
    }

    const handleSelectedProductChange = <K extends keyof SelectedProduct>(sku: string, field: K, value: SelectedProduct[K]) => {
         setSelectedProducts((prev: Map<string, SelectedProduct>) => {
            const newMap = new Map(prev);
            const product = newMap.get(sku);
            if (product) {
                const updatedProduct = { ...product, [field]: value };
                newMap.set(sku, updatedProduct);
            }
            return newMap;
        });
    }

    const handlePurchasePriceChange = (sku: string, purchasePriceValue: number) => {
        setSelectedProducts((prev: Map<string, SelectedProduct>) => {
            const newMap = new Map(prev);
            const product = newMap.get(sku);
            if (product) {
                const purchasePrice = purchasePriceValue || 0;
                // Avoid division by zero
                const newUnitPrice = product.quantity > 0 ? purchasePrice / product.quantity : 0;
                const updatedProduct = { ...product, unitPrice: newUnitPrice };
                newMap.set(sku, updatedProduct);
            }
            return newMap;
        });
    };

    const commonInputClasses = theme === 'dark'
        ? 'bg-slate-800 border-slate-700 text-slate-200'
        : 'bg-white border-slate-300 text-slate-900';
    const commonDropdownClasses = theme === 'dark' 
        ? 'bg-slate-800 border-slate-700 text-slate-300'
        : 'bg-white border-slate-300 text-slate-800';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Edit Stock Purchase</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Product Selection */}
                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Select Products</label>
                        <div className="relative" ref={productSelectorRef}>
                           <button 
                             type="button"
                             onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                              className={`w-full border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default sm:text-sm flex justify-between items-center ${commonDropdownClasses} ${commonFocusClasses}`}
                             aria-haspopup="listbox"
                             aria-expanded={isProductDropdownOpen}
                           >
                                <span>
                                    {selectedProducts.size > 0 ? `${selectedProducts.size} product(s) selected` : 'Choose products to purchase...'}
                                </span>
                                <Icon name="chevron-up-down" className="h-5 w-5 text-gray-400" />
                           </button>
                           {isProductDropdownOpen && (
                                <div className={`absolute mt-1 w-full rounded-md shadow-lg z-10 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                                    <div className="p-2">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Icon name="search" className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-md ${theme === 'dark' ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-100 text-slate-900 border-slate-300'} ${commonFocusClasses}`}
                                            />
                                        </div>
                                    </div>
                                    <ul className="max-h-48 overflow-y-auto" role="listbox">
                                        {filteredProducts.map(product => (
                                            <li key={product.sku} className={`cursor-default select-none relative py-2 pl-3 pr-9 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-800 hover:bg-slate-100'}`}>
                                                <div className="flex items-center">
                                                    <input 
                                                        id={`product-edit-${product.sku}`}
                                                        type="checkbox"
                                                        checked={selectedProducts.has(product.sku)}
                                                        onChange={() => handleToggleProduct(product)}
                                                        className={`h-4 w-4 text-yellow-500 rounded focus:ring-yellow-500 ${theme === 'dark' ? 'border-slate-600 bg-slate-700 focus:ring-offset-slate-900' : 'border-slate-300 bg-slate-100 focus:ring-offset-white'}`}
                                                    />
                                                    <label htmlFor={`product-edit-${product.sku}`} className="ml-3 cursor-pointer">
                                                        <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{product.name}</p>
                                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{product.sku}</p>
                                                    </label>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                           )}
                        </div>
                    </div>

                     {/* Purchase Details */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="supplier-edit" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Supplier</label>
                            <select 
                                id="supplier-edit" 
                                name="supplier" 
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border sm:text-sm rounded-md ${commonInputClasses} ${commonFocusClasses}`}
                                value={supplier}
                                onChange={(e) => setSupplier(e.target.value)}
                            >
                                <option value="">Select supplier...</option>
                                {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="invoiceNumber-edit" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Invoice Number</label>
                            <input 
                                type="text" 
                                id="invoiceNumber-edit" 
                                name="invoiceNumber" 
                                placeholder="Invoice #"
                                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="dateOfPurchase-edit" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Date of Purchase</label>
                            <input 
                                type="date" 
                                id="dateOfPurchase-edit" 
                                name="dateOfPurchase" 
                                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}
                                value={dateOfPurchase}
                                onChange={(e) => setDateOfPurchase(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Selected Products Details */}
                    <div className={`border rounded-md divide-y ${theme === 'dark' ? 'border-slate-700 divide-slate-700' : 'border-slate-200 divide-slate-200'}`}>
                        {selectedProductsArray.length > 0 ? (
                            selectedProductsArray.map((product) => (
                                <div key={product.sku} className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{product.name}</p>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{product.sku}</p>
                                    </div>
                                    <button onClick={() => handleRemoveProduct(product.sku)} className="text-red-500 hover:text-red-700 -mt-1 -mr-1 p-1" aria-label={`Remove ${product.name}`}>
                                        <Icon name="x-mark" className="h-5 w-5"/>
                                    </button>
                                </div>
                                 <div className="space-y-4">
                                    {/* Row 1 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label htmlFor={`unit-edit-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Unit</label>
                                            <select id={`unit-edit-${product.sku}`} className={`w-full rounded-md shadow-sm text-sm pl-3 pr-10 py-2 border ${commonInputClasses} ${commonFocusClasses}`} value={product.unit} onChange={(e) => handleSelectedProductChange(product.sku, 'unit', e.target.value)}>
                                                {availableUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor={`quantity-edit-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Quantity</label>
                                            <input id={`quantity-edit-${product.sku}`} type="number" className={`w-full rounded-md shadow-sm text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} value={product.quantity} onChange={(e) => handleSelectedProductChange(product.sku, 'quantity', parseFloat(e.target.value) || 0)}/>
                                        </div>
                                        <div>
                                            <label htmlFor={`unit_price-edit-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Unit Price</label>
                                            <input id={`unit_price-edit-${product.sku}`} type="number" className={`w-full rounded-md shadow-sm text-sm text-right px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} value={product.unitPrice} onChange={(e) => handleSelectedProductChange(product.sku, 'unitPrice', parseFloat(e.target.value) || 0)}/>
                                        </div>
                                        <div>
                                            <label htmlFor={`purchase_price-edit-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Purchase Price</label>
                                            <input id={`purchase_price-edit-${product.sku}`} type="number" className={`w-full rounded-md shadow-sm text-sm text-right px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} value={isNaN(product.quantity * product.unitPrice) ? '' : (product.quantity * product.unitPrice).toFixed(2)} onChange={(e) => handlePurchasePriceChange(product.sku, parseFloat(e.target.value) || 0)}/>
                                        </div>
                                    </div>
                                    {/* Row 2 - Conditional Batch/Expiry */}
                                    {(product.hasBatchNumber || product.hasExpiryDate) && (
                                        <div className={`grid grid-cols-1 ${product.hasBatchNumber && product.hasExpiryDate ? 'sm:grid-cols-2' : ''} gap-4`}>
                                            {product.hasBatchNumber && (
                                                <div>
                                                    <label htmlFor={`batch-edit-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Batch # <span className="text-gray-400">(Opt)</span></label>
                                                    <input id={`batch-edit-${product.sku}`} type="text" placeholder="Batch #" className={`w-full rounded-md shadow-sm text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} value={product.batchNumber || ''} onChange={(e) => handleSelectedProductChange(product.sku, 'batchNumber', e.target.value)}/>
                                                </div>
                                            )}
                                            {product.hasExpiryDate && (
                                                <div>
                                                    <label htmlFor={`expiry-edit-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Expiry <span className="text-gray-400">(Opt)</span></label>
                                                    <input id={`expiry-edit-${product.sku}`} type="date" className={`w-full rounded-md shadow-sm text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} value={product.expirationDate || ''} onChange={(e) => handleSelectedProductChange(product.sku, 'expirationDate', e.target.value)}/>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Row 3 */}
                                    <div>
                                        <label htmlFor={`remarks-edit-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Remarks</label>
                                        <input id={`remarks-edit-${product.sku}`} type="text" placeholder="Enter remarks or notes..." className={`w-full rounded-md shadow-sm text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} value={product.remarks || ''} onChange={(e) => handleSelectedProductChange(product.sku, 'remarks', e.target.value)}/>
                                    </div>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>No products selected.</div>
                        )}
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdate}
                        className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!supplier || !dateOfPurchase || selectedProducts.size === 0}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStockPurchaseModal;

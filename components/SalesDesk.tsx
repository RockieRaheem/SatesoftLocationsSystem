
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, AlertCircle, Pencil, Printer, Save, RotateCcw } from 'lucide-react';
import { Theme, Shop, StockItem, User, ActiveView, Client, ClientWallet } from '../types';
import Icon, { IconName } from './Icon';
import { mockShops, mockStockListings, mockClients, mockClientWallets } from '../data';
import PhoneInput from './PhoneInput';
import SaleSummaryModal, { SaleSummary } from './SaleSummaryModal';

interface SalesDeskProps {
    theme: Theme;
    currentUser: User;
    onViewSalesHistory: () => void;
    onNavigate: (view: ActiveView) => void;
}

interface CartItem extends StockItem {
    cartQuantity: number;
    originalPrice: number;
    minPrice: number;
}

type PaymentMethod = 'Cash' | 'Mobile Money' | 'Card' | 'Debt' | 'Client Wallet' | 'Loyalty Points';

const OutstandingDebtModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onPayBalance: () => void; 
    clientName: string; 
    amount: number;
    theme: Theme; 
}> = ({ isOpen, onClose, onPayBalance, clientName, amount, theme }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-red-900' : 'bg-white border-red-100'} border-2 rounded-xl shadow-2xl w-full max-w-md p-6 animate-bounce-in`}>
                <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <Icon name="exclamation-triangle" className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Outstanding Debt</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Client Alert</p>
                    </div>
                </div>
                
                <p className={`mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Client <strong>{clientName}</strong> has an outstanding balance of <span className="text-red-500 font-bold">UGX {Math.abs(amount).toLocaleString()}</span>. 
                    Does the client wish to clear this balance now?
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        Continue Sale
                    </button>
                    <button 
                        onClick={onPayBalance}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                    >
                        View Wallet
                    </button>
                </div>
            </div>
        </div>
    );
}

const SalesDesk: React.FC<SalesDeskProps> = ({ theme, currentUser, onViewSalesHistory, onNavigate }) => {
    const [selectedShopId, setSelectedShopId] = useState<string>('');
    const [productSearch, setProductSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountType, setDiscountType] = useState<'cash' | 'percentage'>('cash');
    const [discountValue, setDiscountValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedSale, setCompletedSale] = useState<SaleSummary | null>(null);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    
    // Mobile Money Flow State
    const [isMobileMoneyModalOpen, setIsMobileMoneyModalOpen] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpValue, setOtpValue] = useState('');

    // Price Edit State
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
    const [priceDiscountValue, setPriceDiscountValue] = useState<string>('');
    const [priceEditError, setPriceEditError] = useState<string | null>(null);

    // Final Confirmation State
    const [isFinalConfirmationOpen, setIsFinalConfirmationOpen] = useState(false);
    const [pendingSaleData, setPendingSaleData] = useState<SaleSummary | null>(null);
    const [shouldPrint, setShouldPrint] = useState(false);

    // Payment & Client State
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
    const [paymentReference, setPaymentReference] = useState<string>('');
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [currentClientWallet, setCurrentClientWallet] = useState<ClientWallet | undefined>(undefined);
    
    // New Client Info (if setting enabled)
    const [clientInfo, setClientInfo] = useState({ name: '', phone: { code: '+256', number: '' } });
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const clientDropdownRef = useRef<HTMLDivElement>(null);

    const selectedShop = useMemo(() => mockShops.find(s => s.id.toString() === selectedShopId), [selectedShopId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProductDropdownOpen(false);
            }
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
                setIsClientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Automatically select first active shop if available
    useEffect(() => {
        const activeShops = mockShops.filter(s => s.status === 'Active');
        if (!selectedShopId && activeShops.length > 0) {
            setSelectedShopId(activeShops[0].id.toString());
        }
    }, []);

    // Check for outstanding debt when client is selected
    useEffect(() => {
        if (selectedClientId) {
            const wallet = mockClientWallets.find(w => w.clientId.toString() === selectedClientId);
            setCurrentClientWallet(wallet);
            if (wallet && wallet.balance < 0) {
                setShowDebtModal(true);
            }
        } else {
            setCurrentClientWallet(undefined);
        }
    }, [selectedClientId]);

    // Filter available products based on selected shop
    const availableProducts = useMemo(() => {
        if (!selectedShopId) return [];
        
        // Filter listings for the specific shop
        const shopListings = mockStockListings.filter(item => 
            item.shopId.toString() === selectedShopId
        );

        // Apply search filter
        if (!productSearch) return shopListings;

        return shopListings.filter(item => 
            item.productName.toLowerCase().includes(productSearch.toLowerCase()) || 
            item.customName.toLowerCase().includes(productSearch.toLowerCase()) || 
            item.barcode.includes(productSearch)
        );
    }, [selectedShopId, productSearch]);

    // Clear validation error when cart or payment details change
    useEffect(() => {
        setValidationError(null);
    }, [cart, paymentMethod, receivedAmount, clientInfo, paymentReference, selectedClientId]);

    const handleAddToCart = (item: StockItem) => {
        if (item.quantity <= 0) return; // Prevent adding out of stock items

        setCart(prev => {
            const existing = prev.find(cartItem => cartItem.id === item.id);
            
            // Check if adding one more exceeds stock
            const currentQtyInCart = existing ? existing.cartQuantity : 0;
            if (currentQtyInCart + 1 > item.quantity) {
                alert(`Cannot add more. Only ${item.quantity} in stock.`);
                return prev;
            }

            if (existing) {
                return prev.map(cartItem => 
                    cartItem.id === item.id 
                        ? { ...cartItem, cartQuantity: cartItem.cartQuantity + 1 } 
                        : cartItem
                );
            }
            
            const lowestPrice = item.unitPricings?.[0]?.lowestPrice || item.unitPrice * 0.9;
            return [...prev, { 
                ...item, 
                cartQuantity: 1, 
                originalPrice: item.unitPrice,
                minPrice: lowestPrice
            }];
        });
        setProductSearch('');
        setIsProductDropdownOpen(false);
    };

    const handleQuantityChange = (itemId: number, quantity: number) => {
        if (quantity < 1) return;
        
        const originalItem = mockStockListings.find(i => i.id === itemId);
        if (!originalItem) return;

        if (quantity > originalItem.quantity) {
            alert(`Cannot exceed stock quantity of ${originalItem.quantity}`);
            return;
        }

        setCart(prev => prev.map(item => item.id === itemId ? { ...item, cartQuantity: quantity } : item));
    };

    const handleRemoveItem = (itemId: number) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear the cart?')) {
            setCart([]);
            setReceivedAmount('');
            setSelectedClientId('');
            setPaymentMethod('Cash');
            setPaymentReference('');
            setClientInfo({ name: '', phone: { code: '+256', number: '' } });
        }
    };

    const handleOpenPriceEdit = (item: CartItem) => {
        setEditingCartItem(item);
        // Calculate current discount
        const currentDiscount = item.originalPrice - item.unitPrice;
        setPriceDiscountValue(currentDiscount > 0 ? currentDiscount.toString() : '');
        setPriceEditError(null);
        setIsPriceModalOpen(true);
    };

    const handleApplyPriceDiscount = () => {
        if (!editingCartItem) return;
        
        const discount = parseFloat(priceDiscountValue) || 0;
        const maxAllowedDiscount = editingCartItem.originalPrice - editingCartItem.minPrice;
        
        if (paymentMethod === 'Debt' && selectedShop?.settings.disableDiscountForDebt && discount > 0) {
            setPriceEditError('Discounts are not allowed for debt payments.');
            return;
        }

        if (discount > maxAllowedDiscount) {
            setPriceEditError(`Discount cannot exceed ${maxAllowedDiscount.toLocaleString()}`);
            return;
        }
        
        if (discount < 0) {
            setPriceEditError(`Discount cannot be negative`);
            return;
        }

        const newPrice = editingCartItem.originalPrice - discount;

        setCart(prev => prev.map(item => 
            item.id === editingCartItem.id 
                ? { ...item, unitPrice: newPrice } 
                : item
        ));
        
        setIsPriceModalOpen(false);
        setEditingCartItem(null);
        setPriceDiscountValue('');
    };

    const handleClearPriceDiscount = () => {
        if (!editingCartItem) return;
        
        setCart(prev => prev.map(item => 
            item.id === editingCartItem.id 
                ? { ...item, unitPrice: item.originalPrice } 
                : item
        ));
        
        setIsPriceModalOpen(false);
        setEditingCartItem(null);
        setPriceDiscountValue('');
    };

    const handleProceedToConfirmation = (appliedDiscount: number) => {
        const originalTotal = cart.reduce((sum, item) => sum + (item.originalPrice * item.cartQuantity), 0);
        const totalPayable = cart.reduce((sum, item) => sum + (item.unitPrice * item.cartQuantity), 0);
        const inlineDiscount = originalTotal - totalPayable;
        const finalTotal = totalPayable - appliedDiscount;
        const vatAmount = Math.round(finalTotal * (18 / 118));
        
        // For digital payments, received is always finalTotal
        const isDigital = ['Card', 'Mobile Money', 'Client Wallet', 'Loyalty Points', 'Debt'].includes(paymentMethod);
        const received = isDigital ? finalTotal : (receivedAmount ? Number(receivedAmount) : finalTotal);
        
        const summary: SaleSummary = {
            receiptNumber: `RCP-${Math.floor(Math.random() * 1000000)}`,
            transactionNumber: Math.floor(Math.random() * 1000),
            shopName: selectedShop?.name || 'Main Shop',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            items: cart.map(item => ({
                id: item.id.toString(),
                sku: item.productSN,
                name: item.productName,
                quantity: item.cartQuantity,
                unit: item.unit,
                cost: item.unitPrice * 0.8, // Mock cost
                amount: item.unitPrice * item.cartQuantity,
                income: (item.unitPrice - (item.unitPrice * 0.8)) * item.cartQuantity,
                purchaseUsed: 'PUR-001', // Mock
                purchaseDate: new Date().toISOString()
            })),
            total: finalTotal,
            received: received,
            balance: received - finalTotal,
            income: cart.reduce((sum, item) => sum + ((item.unitPrice - (item.unitPrice * 0.8)) * item.cartQuantity), 0) - appliedDiscount,
            paymentMethod: paymentMethod,
            clientName: clientInfo.name || 'Walk-in Client',
            clientNumber: clientInfo.phone.number || 'N/A',
            servedBy: currentUser.name,
            discount: inlineDiscount + appliedDiscount,
            subtotal: originalTotal,
            vat: vatAmount
        };

        setPendingSaleData(summary);
        setIsDiscountModalOpen(false);
        
        if (isDigital) {
            setIsOtpModalOpen(true);
        } else {
            setIsFinalConfirmationOpen(true);
        }
    };

    const handleVerifyOtp = () => {
        if (otpValue.length === 6) {
            setIsOtpModalOpen(false);
            setOtpValue('');
            if (paymentMethod === 'Mobile Money') {
                setIsMobileMoneyModalOpen(true);
            } else {
                setIsFinalConfirmationOpen(true);
            }
        } else {
            setValidationError('Please enter a valid 6-digit OTP');
        }
    };

    const handleConfirmPurchase = () => {
        setValidationError(null);

        if (cart.length === 0) {
            setValidationError('Cart is empty.');
            return;
        }
        
        // Validation based on Payment Method
        const isDigitalOrDebt = ['Card', 'Debt', 'Client Wallet', 'Loyalty Points', 'Mobile Money'].includes(paymentMethod);
        
        if (isDigitalOrDebt) {
             if (!clientInfo.phone.number) {
                 setValidationError('Please enter the client contact number.');
                 return;
             }
             if (!paymentReference && !['Client Wallet', 'Debt', 'Loyalty Points', 'Mobile Money'].includes(paymentMethod)) {
                 setValidationError('Please enter a reference number.');
                 return;
             }
        }
        
        if (paymentMethod === 'Debt' || paymentMethod === 'Client Wallet') {
            if (paymentMethod === 'Debt' && !selectedShop?.settings.allowWalletDebt) {
                setValidationError('Debt payment is not allowed for this shop.');
                return;
            }
            if (paymentMethod === 'Client Wallet' && !selectedShop?.settings.allowWalletCheckout) {
                setValidationError('Wallet payment is not allowed for this shop.');
                return;
            }
            if (!selectedClientId) {
                setValidationError(`Please select a registered client for ${paymentMethod.toLowerCase()} transactions.`);
                return;
            }
        } else if (!isDigitalOrDebt) {
            // Cash
             if (balance < 0) {
                setValidationError('Received amount is less than the total amount.');
                return;
            }
        }

        if (paymentMethod === 'Cash' && selectedShop?.settings.collectClientInfo) {
            if (!clientInfo.name || !clientInfo.phone.number) {
                setValidationError('Please provide Client Name and Phone Number.');
                return;
            }
        }

        // Check for inline discounts
        const hasInlineDiscount = cart.some(item => item.unitPrice < item.originalPrice);
        
        // Check if discount should be disabled for debt
        const shouldDisableDiscountForDebt = paymentMethod === 'Debt' && selectedShop?.settings.disableDiscountForDebt;

        if (hasInlineDiscount || shouldDisableDiscountForDebt) {
            // Proceed directly to confirmation without checkout discount
            handleProceedToConfirmation(0);
        } else {
            // Trigger Discount Modal
            setIsDiscountModalOpen(true);
        }
    };

    const completePurchase = () => {
        if (!pendingSaleData) return;
        
        setIsProcessing(true);
        
        // Simulate API call
        setTimeout(() => {
            setCompletedSale(pendingSaleData);
            setCart([]);
            setReceivedAmount('');
            setDiscountValue('');
            setDiscountType('cash');
            setIsFinalConfirmationOpen(false);
            setPendingSaleData(null);
            setShowDiscountInput(false);
            setIsProcessing(false);
            setPaymentReference('');
            setClientInfo({ name: '', phone: { code: '+256', number: '' } });
            setSelectedClientId('');
            
            if (shouldPrint) {
                console.log('Printing receipt...');
                // In a real app, trigger print dialog here
            }
        }, 1000);
    };

    const handleHoldTransaction = () => {
        if (cart.length === 0) {
            return;
        }
        setCart([]);
        setReceivedAmount('');
    };

    const handleGoToWallet = () => {
        setShowDebtModal(false);
        onNavigate('client-wallets');
    };
    
    const handlePaymentMethodSelect = (method: PaymentMethod) => {
         const hasInlineDiscount = cart.some(item => item.unitPrice < item.originalPrice);
         if (method === 'Debt' && selectedShop?.settings.disableDiscountForDebt && hasInlineDiscount) {
             setValidationError('Discounts are not allowed for debt payments. Please remove discounts from items first.');
             return;
         }
         setPaymentMethod(method);
         // Reset specific fields when switching
         if (method === 'Cash') {
             setPaymentReference('');
         }
    }
    
    // Calculations
    const originalTotalAmount = cart.reduce((sum, item) => sum + (item.originalPrice * item.cartQuantity), 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.cartQuantity), 0);
    const inlineDiscountTotal = originalTotalAmount - totalAmount;
    
    // If Debt, Wallet, Points, Card, MM, received is effectively 0 for balance calc logic visual
    const isCashPayment = paymentMethod === 'Cash';
    const effectiveReceived = isCashPayment ? (parseFloat(receivedAmount) || 0) : 0;
    const balance = effectiveReceived - totalAmount;
    
    const currentCurrency = cart.length > 0 ? cart[0].currency : 'UGX';

    const inputClass = `w-full px-4 py-2.5 rounded-md border text-sm outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`;
    const tableHeaderClass = `px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`;
    
    const paymentMethods: { id: PaymentMethod, icon: IconName, label: string }[] = [
        { id: 'Cash', icon: 'cash', label: 'Cash' },
        { id: 'Mobile Money', icon: 'phone', label: 'Mobile Money' },
        { id: 'Card', icon: 'wallet', label: 'Card' }, 
        { id: 'Client Wallet', icon: 'wallet', label: 'Wallet' },
        { id: 'Loyalty Points', icon: 'star', label: 'Points' },
        { id: 'Debt', icon: 'user-circle', label: 'Debt' },
    ];

    const isDigitalOrDebt = ['Mobile Money', 'Card', 'Debt', 'Client Wallet', 'Loyalty Points'].includes(paymentMethod);

    return (
        <>
            <OutstandingDebtModal 
                isOpen={showDebtModal} 
                onClose={() => setShowDebtModal(false)} 
                onPayBalance={handleGoToWallet} 
                clientName={mockClients.find(c => c.id.toString() === selectedClientId)?.name || 'Client'} 
                amount={currentClientWallet?.balance || 0}
                theme={theme}
            />
            
            <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
                {/* Top Action Bar */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-shrink-0`}>
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-grow items-end">
                        
                        {/* Shop Selector */}
                        <div className="w-full sm:w-64">
                            <label className={`block text-[10px] font-bold mb-1.5 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Shop Location</label>
                            <div className="relative group">
                                <select 
                                    value={selectedShopId} 
                                    onChange={(e) => { setSelectedShopId(e.target.value); setCart([]); }}
                                    className={`${inputClass} appearance-none cursor-pointer font-semibold pr-10 border-slate-200 dark:border-slate-700 hover:border-yellow-500 transition-colors`}
                                >
                                    <option value="" disabled>Select a shop</option>
                                    {mockShops.filter(s => s.status === 'Active').map(shop => (
                                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-yellow-500 transition-colors">
                                    <Icon name="chevron-down" className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Product Search */}
                        <div className="w-full flex-grow relative" ref={dropdownRef}>
                            <label className={`block text-[10px] font-bold mb-1.5 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Add Product</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-yellow-500 transition-colors">
                                    <Icon name="search" className="h-5 w-5" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Scan barcode or type product name..." 
                                    value={productSearch}
                                    onChange={(e) => { setProductSearch(e.target.value); setIsProductDropdownOpen(true); }}
                                    onFocus={() => setIsProductDropdownOpen(true)}
                                    className={`${inputClass} pl-11 border-slate-200 dark:border-slate-700`}
                                    disabled={!selectedShopId}
                                    autoFocus
                                />
                            </div>
                            
                            {isProductDropdownOpen && (
                                <div className={`absolute z-20 w-full mt-1 rounded-md shadow-xl max-h-[60vh] overflow-y-auto border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    {availableProducts.length > 0 ? (
                                        availableProducts.map(item => {
                                            const isOutOfStock = item.quantity <= 0;
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className={`px-4 py-3 flex justify-between items-center transition-colors border-b last:border-0 ${
                                                        isOutOfStock 
                                                            ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50' 
                                                            : `cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-slate-50 border-slate-100'}`
                                                    }`}
                                                    onClick={() => !isOutOfStock && handleAddToCart(item)}
                                                >
                                                    <div className="flex-grow">
                                                        <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-500 line-through' : (theme === 'dark' ? 'text-slate-200' : 'text-slate-800')}`}>
                                                            {item.productName}
                                                        </p>
                                                        <div className="flex gap-3 mt-1">
                                                            <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{item.barcode}</span>
                                                            <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.customName !== item.productName ? `(${item.customName})` : ''}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right min-w-[100px]">
                                                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                                            {item.currency} {item.unitPrice.toLocaleString()}
                                                        </p>
                                                        <p className={`text-xs font-medium ${isOutOfStock ? 'text-red-500' : (item.quantity < 10 ? 'text-yellow-500' : 'text-green-500')}`}>
                                                            {isOutOfStock ? 'Out of Stock' : `${item.quantity} ${item.unit} available`}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className={`px-4 py-8 text-sm text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {productSearch ? 'No matching products found' : 'Start typing to search products...'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end lg:self-center">
                        {cart.length > 0 && (
                            <button 
                                onClick={() => setCart([])}
                                className={`px-4 py-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${theme === 'dark' ? 'border-red-900/30 text-red-400 hover:bg-red-900/20' : 'border-red-100 text-red-600 hover:bg-red-50'}`}
                            >
                                <Icon name="trash" className="h-4 w-4" />
                                Clear Cart
                            </button>
                        )}
                        <button 
                            onClick={onViewSalesHistory}
                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                            <Icon name="history" className="h-4 w-4" />
                            Recent Sales
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
                    
                    {/* Cart Table (Left) */}
                    <div className={`flex-grow flex flex-col rounded-lg border shadow-sm overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className="overflow-y-auto flex-grow custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                                <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    <tr>
                                        <th className={tableHeaderClass}>Product</th>
                                        <th className={tableHeaderClass}>Unit Price</th>
                                        <th className={`${tableHeaderClass} text-center`}>Qty</th>
                                        <th className={`${tableHeaderClass} text-right`}>Total</th>
                                        <th className={`${tableHeaderClass} text-center w-16`}></th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700 bg-slate-900' : 'divide-slate-100 bg-white'}`}>
                                    {cart.length > 0 ? (
                                        cart.map((item) => (
                                            <tr key={item.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                                <td className="px-6 py-4">
                                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.productName}</div>
                                                    <div className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{item.barcode}</div>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm cursor-pointer group ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                                                    onClick={() => handleOpenPriceEdit(item)}>
                                                    <div className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                                                        {item.unitPrice.toLocaleString()}
                                                        <Icon name="pencil" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    {item.unitPrice < item.originalPrice && (
                                                        <div className="text-[10px] text-blue-500 font-bold">
                                                            Disc: -{(item.originalPrice - item.unitPrice).toLocaleString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center">
                                                        <button 
                                                            onClick={() => handleQuantityChange(item.id, item.cartQuantity - 1)}
                                                            className={`w-6 h-6 flex items-center justify-center rounded text-xs border ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}
                                                        >
                                                            -
                                                        </button>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            max={item.quantity}
                                                            value={item.cartQuantity} 
                                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                            className={`w-12 mx-2 text-center text-sm rounded border-none bg-transparent focus:ring-0 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                                                        />
                                                         <button 
                                                            onClick={() => handleQuantityChange(item.id, item.cartQuantity + 1)}
                                                            className={`w-6 h-6 flex items-center justify-center rounded text-xs border ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                                    {(item.unitPrice * item.cartQuantity).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                        <Icon name="x-mark" className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-32 text-center">
                                                <div className={`flex flex-col items-center justify-center ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>
                                                    <Icon name="cart" className="h-16 w-16 mb-4 opacity-50" />
                                                    <p className="text-lg font-medium">Cart is empty</p>
                                                    <p className="text-sm">Search and select products to add them to the sale.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Checkout Panel (Right) */}
                    <div className={`w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pb-4`}>
                        
                         {/* Payment Method */}
                        <div className={`rounded-xl border shadow-sm p-5 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <label className={`block text-[10px] font-bold mb-3 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => handlePaymentMethodSelect(method.id)}
                                        className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border text-[10px] font-bold transition-all duration-200 ${
                                            paymentMethod === method.id
                                                ? 'bg-yellow-500 text-slate-900 border-yellow-500 shadow-md scale-[1.02]'
                                                : theme === 'dark'
                                                ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <Icon name={method.icon} className={`h-5 w-5 mb-1.5 ${paymentMethod === method.id ? 'text-slate-900' : 'text-slate-400'}`} />
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Totals & Input Card */}
                        <div className={`rounded-xl border shadow-sm p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Payment Details</h3>
                            
                            <div className="space-y-3.5 mb-6">
                                 <div className="flex justify-between items-center">
                                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Subtotal</span>
                                    <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{originalTotalAmount.toLocaleString()}</span>
                                </div>
                                {inlineDiscountTotal > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm text-blue-500 font-semibold`}>Discount</span>
                                        <span className={`text-sm font-bold text-blue-500`}>-{inlineDiscountTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>VAT (18%)</span>
                                    <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{Math.round(totalAmount * (18 / 118)).toLocaleString()}</span>
                                </div>
                                <div className={`h-px my-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                                 <div className="flex justify-between items-end">
                                    <span className={`text-sm font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Payable</span>
                                    <div className="text-right">
                                        <span className="text-xs font-bold mr-1 text-slate-400 uppercase">{currentCurrency}</span>
                                        <span className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-yellow-500' : 'text-slate-900'}`}>
                                            {totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Received (Cash only) */}
                            {isCashPayment && (
                                <div className="mb-4">
                                    <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Amount Received
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={receivedAmount}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setReceivedAmount(val);
                                            }}
                                            className={`w-full pl-4 pr-4 py-3 text-right font-mono text-xl rounded-md border outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Balance Display (Cash only) */}
                            {isCashPayment && (
                                <div className={`flex justify-between items-center p-3 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Change / Balance</span>
                                    <span className={`text-lg font-bold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {balance.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Inline Payment Info for Non-Cash methods */}
                        {isDigitalOrDebt && (
                             <div className={`rounded-lg border shadow-sm p-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                 <h4 className={`text-xs font-bold mb-3 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                                     Payment Reference & Contact
                                 </h4>
                                 <div className="space-y-3">
                                     {(paymentMethod === 'Client Wallet' || paymentMethod === 'Debt') ? (
                                         <div className="relative" ref={clientDropdownRef}>
                                             <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Select Client</label>
                                             <div 
                                                 className={`relative flex items-center w-full px-4 py-3 rounded-md border cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-600 hover:border-slate-500' : 'bg-white border-slate-300 hover:border-slate-400'}`}
                                                 onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                             >
                                                 <div className="flex-1">
                                                     {selectedClientId ? (
                                                         <div className="flex flex-col">
                                                             <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                                                 {mockClients.find(c => c.id.toString() === selectedClientId)?.name}
                                                             </span>
                                                             <span className="text-[10px] text-slate-500">
                                                                 {mockClients.find(c => c.id.toString() === selectedClientId)?.phone}
                                                             </span>
                                                         </div>
                                                     ) : (
                                                         <span className="text-sm text-slate-400">Select Registered Client</span>
                                                     )}
                                                 </div>
                                                 <Icon name="chevron-down" className={`w-4 h-4 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                                             </div>

                                             {isClientDropdownOpen && (
                                                 <div className={`absolute z-50 left-0 right-0 mt-1 rounded-lg border shadow-xl overflow-hidden animate-fade-in-down ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                     <div className={`p-2 border-bottom ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                                                         <div className="relative">
                                                             <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                             <input 
                                                                 type="text"
                                                                 placeholder="Search client name or phone..."
                                                                 value={clientSearchQuery}
                                                                 onChange={(e) => setClientSearchQuery(e.target.value)}
                                                                 className={`w-full pl-9 pr-4 py-2 text-sm rounded-md outline-none border focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                                                 onClick={(e) => e.stopPropagation()}
                                                                 autoFocus
                                                             />
                                                         </div>
                                                     </div>
                                                     <div className="max-h-60 overflow-y-auto">
                                                         {mockClients
                                                             .filter(c => c.status === 'Active' && (c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) || c.phone.includes(clientSearchQuery)))
                                                             .filter(c => paymentMethod === 'Client Wallet' ? c.walletEnabled : true)
                                                             .map(client => (
                                                                 <div 
                                                                     key={client.id}
                                                                     className={`px-4 py-3 cursor-pointer transition-colors border-b last:border-0 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-50 hover:bg-slate-50'} ${selectedClientId === client.id.toString() ? (theme === 'dark' ? 'bg-slate-700' : 'bg-green-50') : ''}`}
                                                                     onClick={(e) => {
                                                                         e.stopPropagation();
                                                                         setSelectedClientId(client.id.toString());
                                                                         setClientInfo({ ...clientInfo, name: client.name, phone: { code: '+256', number: client.phone.replace('+256', '') } });
                                                                         setIsClientDropdownOpen(false);
                                                                         setClientSearchQuery('');
                                                                     }}
                                                                 >
                                                                     <div className="flex flex-col">
                                                                         <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{client.name}</span>
                                                                         <span className="text-xs text-slate-500">{client.phone}</span>
                                                                     </div>
                                                                 </div>
                                                             ))}
                                                         {mockClients
                                                             .filter(c => c.status === 'Active' && (c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) || c.phone.includes(clientSearchQuery)))
                                                             .filter(c => paymentMethod === 'Client Wallet' ? c.walletEnabled : true)
                                                             .length === 0 && (
                                                             <div className="px-4 py-6 text-center">
                                                                 <Icon name="search" className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                                 <p className="text-xs text-slate-500">No matching clients found</p>
                                                             </div>
                                                         )}
                                                     </div>
                                                 </div>
                                             )}
                                         </div>
                                     ) : (
                                         <div>
                                            <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Client Contact</label>
                                            <PhoneInput theme={theme} value={clientInfo.phone} onChange={(val) => setClientInfo({...clientInfo, phone: val})} />
                                         </div>
                                     )}
                                     {paymentMethod !== 'Mobile Money' && (
                                         <div>
                                             <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Reference Number</label>
                                             <input 
                                                type="text" 
                                                value={paymentReference}
                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                className={inputClass} 
                                                placeholder="Transaction ID / Ref"
                                            />
                                         </div>
                                     )}
                                 </div>
                             </div>
                        )}

                        {/* Collect Client Info (Cash + Setting Enabled) */}
                        {isCashPayment && selectedShop?.settings.collectClientInfo && (
                             <div className={`rounded-lg border shadow-sm p-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                 <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                                     Client Information
                                 </label>
                                 <div className="space-y-3">
                                     <input 
                                        type="text" 
                                        placeholder="Client Name"
                                        value={clientInfo.name}
                                        onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                                        className={inputClass}
                                     />
                                     <PhoneInput theme={theme} value={clientInfo.phone} onChange={(val) => setClientInfo({...clientInfo, phone: val})} />
                                 </div>
                             </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {validationError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold animate-shake">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                 <button 
                                    onClick={handleClearCart}
                                    disabled={cart.length === 0}
                                    className={`py-3 rounded-md text-sm font-bold border transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmPurchase}
                                    disabled={cart.length === 0}
                                    className="py-3 rounded-md text-sm font-bold bg-black text-yellow-500 hover:bg-slate-900 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                        
                        {selectedShop?.settings.allowHoldTransaction && (
                             <button 
                                onClick={handleHoldTransaction}
                                disabled={cart.length === 0}
                                className={`w-full py-3 rounded-md text-sm font-bold border border-dashed transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                            >
                                Hold Transaction
                            </button>
                        )}

                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <AnimatePresence>
                {isOtpModalOpen && (
                    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl p-6 ${
                                theme === 'dark' ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900'
                            }`}
                        >
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <Icon name="phone" className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Client OTP Verification</h3>
                                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Enter the 6-digit OTP sent to the client's phone to authorize the payment.
                                    </p>
                                </div>

                                {pendingSaleData && (
                                    <div className={`p-4 rounded-xl border-2 border-dashed ${
                                        theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            Amount to Pay
                                        </span>
                                        <span className="text-3xl font-black text-blue-600">
                                            {pendingSaleData.total.toLocaleString()} {selectedShop?.settings.currency || 'UGX'}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="text-left">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        One-Time Password (OTP)
                                    </label>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        autoFocus
                                        value={otpValue}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            setOtpValue(val);
                                        }}
                                        className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${
                                            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                        placeholder="000000"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                     <button
                                        disabled={otpValue.length !== 6}
                                        onClick={handleVerifyOtp}
                                        className="w-full py-4 bg-black text-yellow-500 hover:bg-slate-900 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Verify & Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsOtpModalOpen(false);
                                            setOtpValue('');
                                        }}
                                        className={`w-full py-3 text-sm font-bold rounded-xl transition-colors ${
                                            theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Mobile Money Request Modal */}
            <AnimatePresence>
                {isMobileMoneyModalOpen && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl p-6 ${
                                theme === 'dark' ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900'
                            }`}
                        >
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <Icon name="phone" className="w-8 h-8 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Payment Request Sent</h3>
                                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Client has been sent a payment request for notification on the phone.
                                    </p>
                                </div>

                                {pendingSaleData && (
                                    <div className={`p-4 rounded-xl border-2 border-dashed ${
                                        theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            Request Amount
                                        </span>
                                        <span className="text-3xl font-black text-yellow-600">
                                            {pendingSaleData.total.toLocaleString()} {selectedShop?.settings.currency || 'UGX'}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="text-left">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Reference Number
                                    </label>
                                    <input 
                                        type="text"
                                        autoFocus
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        className={`w-full px-4 py-3 text-lg font-mono rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500 ${
                                            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                        placeholder="Enter Reference ID..."
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                     <button
                                        disabled={!paymentReference}
                                        onClick={() => {
                                            setIsMobileMoneyModalOpen(false);
                                            setIsFinalConfirmationOpen(true);
                                        }}
                                        className="w-full py-4 bg-black text-yellow-500 hover:bg-slate-900 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit
                                    </button>
                                    <button
                                        onClick={() => setIsMobileMoneyModalOpen(false)}
                                        className={`w-full py-3 font-bold rounded-xl transition-all active:scale-95 ${
                                            theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Price Edit Modal */}
            <AnimatePresence>
                {isPriceModalOpen && editingCartItem && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 ${
                                theme === 'dark' ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Edit Unit Price</h3>
                                <button onClick={() => setIsPriceModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Minimum</div>
                                        <div className="font-mono font-bold">{editingCartItem.minPrice.toLocaleString()}</div>
                                    </div>
                                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Original</div>
                                        <div className="font-mono font-bold">{editingCartItem.originalPrice.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Discount Amount (UGX)
                                    </label>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        autoFocus
                                        value={priceDiscountValue}
                                        onChange={(e) => setPriceDiscountValue(e.target.value.replace(/[^0-9.]/g, ''))}
                                        className={`w-full px-4 py-3 text-lg font-mono rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${
                                            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                        placeholder="Enter discount..."
                                    />
                                </div>

                                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">New Unit Price:</span>
                                        <span className="text-xl font-bold font-mono">
                                            {(editingCartItem.originalPrice - (parseFloat(priceDiscountValue) || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {priceEditError && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                                        <AlertCircle className="w-4 h-4" />
                                        {priceEditError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <button
                                        onClick={handleApplyPriceDiscount}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        Apply Price
                                    </button>

                                    {editingCartItem.unitPrice < editingCartItem.originalPrice && (
                                        <button
                                            onClick={handleClearPriceDiscount}
                                            className={`w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-500 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800`}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Clear Discount
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Discount Confirmation Modal */}
            <AnimatePresence>
                {isDiscountModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl p-6 ${
                                theme === 'dark' ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900'
                            }`}
                        >
                            {!showDiscountInput ? (
                                <div className="text-center space-y-6">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Discount Client?</h3>
                                        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Do you want to discount for the client?
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => setShowDiscountInput(true)}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95"
                                        >
                                            Yes, Discount
                                        </button>
                                        <button
                                            onClick={() => handleProceedToConfirmation(0)}
                                            className={`w-full py-3 font-bold rounded-xl transition-all active:scale-95 ${
                                                theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            No, Don't Discount
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold">Enter Discount</h3>
                                        <button 
                                            onClick={() => setShowDiscountInput(false)}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Discount Type Selection */}
                                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                            <button
                                                onClick={() => {
                                                    setDiscountType('cash');
                                                    setDiscountValue('');
                                                }}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                                    discountType === 'cash'
                                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600'
                                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                            >
                                                Cash (UGX)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDiscountType('percentage');
                                                    setDiscountValue('');
                                                }}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                                    discountType === 'percentage'
                                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600'
                                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                            >
                                                Percentage (%)
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                {discountType === 'cash' ? 'Discount Amount (UGX)' : 'Discount Percentage (%)'}
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoFocus
                                                    value={discountValue}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                        if (discountType === 'percentage') {
                                                            if (Number(val) > 100) return;
                                                        }
                                                        setDiscountValue(val);
                                                    }}
                                                    className={`w-full px-4 py-3 text-lg font-mono rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                    }`}
                                                    placeholder={discountType === 'cash' ? 'Enter amount...' : 'Enter percentage...'}
                                                />
                                                {discountType === 'percentage' && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                                        %
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-500">Subtotal:</span>
                                                <span className="font-bold">UGX {totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-blue-500">
                                                <span>Discount:</span>
                                                <span className="font-bold">
                                                    - UGX {
                                                        discountType === 'cash' 
                                                            ? (Number(discountValue) || 0).toLocaleString()
                                                            : ((totalAmount * (Number(discountValue) || 0)) / 100).toLocaleString()
                                                    }
                                                </span>
                                            </div>
                                            <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2 flex justify-between">
                                                <span className="font-bold">Total Payable:</span>
                                                <span className="font-bold text-lg">
                                                    UGX {
                                                        (totalAmount - (
                                                            discountType === 'cash' 
                                                                ? (Number(discountValue) || 0) 
                                                                : ((totalAmount * (Number(discountValue) || 0)) / 100)
                                                        )).toLocaleString()
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            disabled={isProcessing}
                                            onClick={() => {
                                                const amount = discountType === 'cash' 
                                                    ? (Number(discountValue) || 0) 
                                                    : ((totalAmount * (Number(discountValue) || 0)) / 100);
                                                handleProceedToConfirmation(amount);
                                            }}
                                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="w-5 h-5" />
                                                    Confirm & Proceed
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Final Confirmation Modal */}
            <AnimatePresence>
                {isFinalConfirmationOpen && pendingSaleData && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 ${
                                theme === 'dark' ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Confirm Transaction</h3>
                                <button onClick={() => setIsFinalConfirmationOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Summary Details */}
                                <div className={`p-4 rounded-xl space-y-3 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Client:</span>
                                        <span className="font-bold">{pendingSaleData.clientName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Payment Method:</span>
                                        <span className="font-bold">{pendingSaleData.paymentMethod}</span>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Subtotal:</span>
                                        <span className="font-bold">UGX {pendingSaleData.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-500">
                                        <span>Discount:</span>
                                        <span className="font-bold">- UGX {pendingSaleData.discount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">VAT (18%):</span>
                                        <span className="font-bold">UGX {pendingSaleData.vat.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Payable:</span>
                                        <span className="text-blue-600">UGX {pendingSaleData.total.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Amount Received:</span>
                                        <span className="font-bold">UGX {pendingSaleData.received.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Balance:</span>
                                        <span className="font-bold">UGX {pendingSaleData.balance.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Print Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                            <Printer className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">Print Receipt</div>
                                            <div className="text-xs text-slate-500">Automatically print after saving</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShouldPrint(!shouldPrint)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${shouldPrint ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${shouldPrint ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setIsFinalConfirmationOpen(false)}
                                        className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                                            theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Pencil className="w-5 h-5" />
                                        Edit
                                    </button>
                                    <button
                                        disabled={isProcessing}
                                        onClick={completePurchase}
                                        className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                                            shouldPrint ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {shouldPrint ? <Printer className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                                {shouldPrint ? 'Save & Print' : 'Save'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sale Summary Modal (Confirmation Page) */}
            <SaleSummaryModal 
                isOpen={!!completedSale}
                onClose={() => setCompletedSale(null)}
                sale={completedSale}
                theme={theme}
            />
        </>
    );
};

export default SalesDesk;


import React, { useState, useMemo, useEffect } from 'react';
import { Theme, Shop, StockItem, User, Country, ClientWallet } from '../types';
import Icon, { IconName } from './Icon';
import { mockShops, mockStockListings, mockClientWallets } from '../data';

interface CustomerMakeOrderPageProps {
    theme: Theme;
    currentUser: User;
    countries?: Country[];
}

interface CartItem extends StockItem {
    cartQuantity: number;
}

const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    currency: string;
    onConfirm: (method: string) => void;
    theme: Theme;
    potentialPoints: number;
    loyaltyProgramEnabled: boolean;
    wallet: ClientWallet | undefined;
    loyaltyRedemptionValue: number;
}> = ({ isOpen, onClose, amount, currency, onConfirm, theme, potentialPoints, loyaltyProgramEnabled, wallet, loyaltyRedemptionValue }) => {
    const [method, setMethod] = useState('Mobile Money');
    
    if (!isOpen) return null;

    const pointsValue = wallet ? wallet.loyaltyPoints * loyaltyRedemptionValue : 0;
    const canRedeemPoints = wallet && pointsValue >= amount;

    const handleConfirm = () => {
        if (method === 'Loyalty Points' && !canRedeemPoints) {
            alert("Insufficient loyalty points balance for this transaction.");
            return;
        }
        onConfirm(method);
    }

    // Should points be awarded for this method?
    const willEarnPoints = loyaltyProgramEnabled && ['Cash', 'Mobile Money', 'Card'].includes(method);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Checkout</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount: <span className="font-bold">{currency} {amount.toLocaleString()}</span></p>
                </div>
                <div className="p-6 space-y-4">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Select Payment Method</label>
                    <div className="space-y-2">
                        {['Mobile Money', 'Card', 'Wallet', 'Cash on Delivery', 'Debt', 'Loyalty Points'].map((m) => {
                             const isDisabled = m === 'Loyalty Points' && !canRedeemPoints;
                             return (
                                <button
                                    key={m}
                                    onClick={() => !isDisabled && setMethod(m)}
                                    disabled={isDisabled}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                        method === m 
                                            ? 'border-yellow-500 ring-1 ring-yellow-500 bg-yellow-500/5' 
                                            : (isDisabled 
                                                ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800' 
                                                : (theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'))
                                    }`}
                                >
                                    <div className="text-left">
                                        <span className={`block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{m}</span>
                                        {m === 'Loyalty Points' && wallet && (
                                            <span className="text-[10px] text-slate-500">
                                                Bal: {wallet.loyaltyPoints} pts ({currency} {pointsValue.toLocaleString()})
                                            </span>
                                        )}
                                    </div>
                                    {method === m && <Icon name="check-circle" className="h-5 w-5 text-yellow-500" />}
                                </button>
                            )
                        })}
                    </div>

                    {/* Points Earning Preview */}
                    {loyaltyProgramEnabled && (
                        <div className={`p-3 rounded-md flex items-center ${willEarnPoints ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            <Icon name="star" className="h-5 w-5 mr-2" />
                            <span className="text-xs font-semibold">
                                {willEarnPoints 
                                    ? `You will earn ${potentialPoints} Loyalty Point${potentialPoints !== 1 ? 's' : ''}` 
                                    : "No loyalty points earned with this payment method."
                                }
                            </span>
                        </div>
                    )}

                </div>
                <div className={`p-6 border-t flex justify-end gap-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <button onClick={onClose} className={`px-4 py-2 rounded text-sm font-medium ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white border text-slate-700'}`}>Cancel</button>
                    <button onClick={handleConfirm} className="px-4 py-2 rounded text-sm font-bold bg-yellow-500 text-slate-900 hover:bg-yellow-600">Pay & Order</button>
                </div>
            </div>
        </div>
    );
};

const CustomerMakeOrderPage: React.FC<CustomerMakeOrderPageProps> = ({ theme, currentUser, countries }) => {
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // Fetch Customer Wallet (Mock for ID 99)
    const customerWallet = useMemo(() => mockClientWallets.find(w => w.clientId === 99), []);

    // Automatically select first active shop if none selected
    useEffect(() => {
        const activeShops = mockShops.filter(s => s.status === 'Active');
        if (!selectedShop && activeShops.length > 0) {
            setSelectedShop(activeShops[0]);
        }
    }, []);

    const shopProducts = useMemo(() => {
        if (!selectedShop) return [];
        return mockStockListings.filter(item => 
            item.shopId === selectedShop.id && 
            (item.productName.toLowerCase().includes(productSearch.toLowerCase()) || item.category.toLowerCase().includes(productSearch.toLowerCase()))
        );
    }, [selectedShop, productSearch]);

    const handleShopSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const shopId = parseInt(e.target.value);
        const shop = mockShops.find(s => s.id === shopId);
        setSelectedShop(shop || null);
        setCart([]); // Clear cart when switching shops
    };

    const handleAddToCart = (item: StockItem) => {
        if (item.quantity <= 0) return;
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                if (existing.cartQuantity >= item.quantity) {
                    alert("Cannot add more than available stock.");
                    return prev;
                }
                return prev.map(i => i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
            }
            return [...prev, { ...item, cartQuantity: 1 }];
        });
    };

    const handleRemoveFromCart = (itemId: number) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };
    
    const handleUpdateQty = (itemId: number, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = i.cartQuantity + delta;
                const originalItem = mockStockListings.find(s => s.id === itemId);
                const maxQty = originalItem ? originalItem.quantity : i.quantity;
                
                return newQty > 0 && newQty <= maxQty ? { ...i, cartQuantity: newQty } : i;
            }
            return i;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.cartQuantity), 0);
    const currentCurrency = selectedShop?.currency || 'UGX';

    // Loyalty Calculation
    const shopCountry = useMemo(() => countries?.find(c => c.countryCode === selectedShop?.countryCode), [countries, selectedShop]);
    const loyaltyProgram = shopCountry?.loyaltyProgram;
    
    const potentialPoints = useMemo(() => {
        if (loyaltyProgram && loyaltyProgram.enabled && loyaltyProgram.earningThreshold > 0) {
            return Math.floor(cartTotal / loyaltyProgram.earningThreshold);
        }
        return 0;
    }, [cartTotal, loyaltyProgram]);

    const handlePlaceOrder = (method: string) => {
        let message = `Order placed successfully at ${selectedShop?.name} via ${method}!\nTotal: ${currentCurrency} ${cartTotal.toLocaleString()}`;
        
        if (['Cash', 'Mobile Money', 'Card'].includes(method) && potentialPoints > 0) {
            message += `\n\nYou earned ${potentialPoints} Loyalty Points!`;
            // Here you would update the wallet state in a real app
        } else if (method === 'Loyalty Points') {
            // Deduct points logic would go here
             const pointsUsed = Math.ceil(cartTotal / (loyaltyProgram?.redemptionValue || 1));
             message += `\n\nRedeemed ${pointsUsed} Loyalty Points.`;
        }

        alert(message);
        setIsPaymentOpen(false);
        setCart([]);
    };

    const inputClass = `w-full px-3 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
            <PaymentModal 
                isOpen={isPaymentOpen} 
                onClose={() => setIsPaymentOpen(false)} 
                amount={cartTotal}
                currency={currentCurrency}
                onConfirm={handlePlaceOrder} 
                theme={theme} 
                potentialPoints={potentialPoints}
                loyaltyProgramEnabled={!!loyaltyProgram?.enabled}
                wallet={customerWallet}
                loyaltyRedemptionValue={loyaltyProgram?.redemptionValue || 0}
            />

            {/* Left Section: Shop Selection & Products */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Header with Shop Selection */}
                <div className={`flex-shrink-0 p-4 rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:w-1/2">
                            <label className={`block text-xs font-bold uppercase mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Select Shop</label>
                            <div className="relative">
                                <select 
                                    value={selectedShop?.id || ''}
                                    onChange={handleShopSelect}
                                    className={`${inputClass} appearance-none cursor-pointer font-semibold`}
                                >
                                    <option value="" disabled>-- Choose a Shop --</option>
                                    {mockShops.filter(s => s.status === 'Active').map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.location.lat.toFixed(2)}, {s.location.lng.toFixed(2)})</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Icon name="chevron-down" className="h-4 w-4 text-slate-500" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-1/2">
                            <label className={`block text-xs font-bold uppercase mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Search Items</label>
                            <div className="relative">
                                <Icon name="search" className={`absolute left-3 top-3 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                                <input 
                                    type="text" 
                                    placeholder="Filter products..." 
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className={`${inputClass} pl-10`}
                                    disabled={!selectedShop}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-grow overflow-y-auto min-h-0 custom-scrollbar">
                     {selectedShop ? (
                         shopProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pr-1">
                                {shopProducts.map(item => (
                                    <div key={item.id} className={`p-3 rounded-lg border flex flex-col justify-between transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-yellow-400'}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                                    {item.category}
                                                </span>
                                                {item.quantity < 10 && item.quantity > 0 && (
                                                    <span className="text-[10px] font-bold text-red-500">Low Stock</span>
                                                )}
                                            </div>
                                            <h4 className={`font-medium text-sm line-clamp-2 mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.productName}</h4>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{item.quantity} {item.unit} available</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-slate-700">
                                            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                                {item.currency} {item.unitPrice.toLocaleString()}
                                            </span>
                                            <button 
                                                onClick={() => handleAddToCart(item)}
                                                disabled={item.quantity <= 0}
                                                className={`p-1.5 rounded-md transition-colors ${item.quantity > 0 ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                            >
                                                <Icon name="plus" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                 <Icon name="search" className="h-12 w-12 mb-2 opacity-20" />
                                 <p>No products found in this shop.</p>
                             </div>
                         )
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-slate-500">
                             <Icon name="shop-mgt" className="h-12 w-12 mb-2 opacity-20" />
                             <p>Please select a shop to view products.</p>
                         </div>
                     )}
                </div>
            </div>

            {/* Right Section: Cart Sidebar */}
            <div className={`w-full lg:w-96 flex flex-col flex-shrink-0 rounded-lg shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Current Order</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{cart.length} items selected</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                    {cart.length > 0 ? (
                        cart.map(item => (
                            <div key={item.id} className={`flex flex-col p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <p className={`font-medium text-sm truncate w-40 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`} title={item.productName}>{item.productName}</p>
                                    <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <Icon name="x-mark" className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {item.unitPrice.toLocaleString()} x {item.cartQuantity}
                                    </p>
                                    <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-md">
                                        <button onClick={() => handleUpdateQty(item.id, -1)} className="px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-l-md transition-colors text-xs font-bold">-</button>
                                        <span className="px-2 text-xs font-bold min-w-[20px] text-center">{item.cartQuantity}</span>
                                        <button onClick={() => handleUpdateQty(item.id, 1)} className="px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-r-md transition-colors text-xs font-bold">+</button>
                                    </div>
                                </div>
                                <div className="text-right mt-2 text-sm font-bold">
                                    {item.currency} {(item.unitPrice * item.cartQuantity).toLocaleString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                             <Icon name="cart" className="h-10 w-10 mb-2" />
                             <p className="text-sm">Your cart is empty</p>
                        </div>
                    )}
                </div>

                <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                     <div className="flex justify-between items-center mb-4">
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount</span>
                        <span className={`text-xl font-bold text-yellow-500`}>{currentCurrency} {cartTotal.toLocaleString()}</span>
                    </div>
                     <button 
                         onClick={() => setIsPaymentOpen(true)}
                         disabled={cart.length === 0}
                         className={`w-full py-3 font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' : 'bg-black text-yellow-500 hover:bg-slate-900'}`}
                     >
                         <Icon name="check-circle" className="h-5 w-5" />
                         Proceed to Checkout
                     </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerMakeOrderPage;

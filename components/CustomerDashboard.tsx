
import React, { useMemo } from 'react';
import { Theme, ActiveView, Country, ClientWallet } from '../types';
import { mockClientWallets } from '../data';
import Icon from './Icon';

interface CustomerDashboardProps {
    theme: Theme;
    onNavigate: (view: ActiveView) => void;
    countries?: Country[];
}

const TransactionCard: React.FC<{ theme: Theme; date: string; shop: string; amount: string; items: number }> = ({ theme, date, shop, amount, items }) => (
    <div className={`p-4 rounded-lg border flex justify-between items-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{shop}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{date} • {items} Items</p>
        </div>
        <div className={`text-right`}>
             <p className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{amount}</p>
             <span className={`text-xs px-2 py-0.5 rounded bg-green-100 text-green-700`}>Completed</span>
        </div>
    </div>
);

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ theme, onNavigate, countries }) => {
    // Mock retrieval of logged-in customer's wallet (Using ID 99 from data.ts)
    const customerWallet = useMemo(() => mockClientWallets.find(w => w.clientId === 99), []);
    
    const loyaltyProgram = useMemo(() => {
        if (!customerWallet || !countries) return null;
        const country = countries.find(c => c.currencyCode === customerWallet.currency); // Infer country from currency for mock
        return country?.loyaltyProgram;
    }, [customerWallet, countries]);

    const recentPurchases = [
        { id: 1, date: 'Today, 10:30 AM', shop: 'Muwanguzi Kiwanga', amount: 'UGX 25,000', items: 3 },
        { id: 2, date: 'Yesterday, 4:15 PM', shop: 'Topaz Kiwanga', amount: 'UGX 12,500', items: 2 },
        { id: 3, date: '20 Oct, 2023', shop: 'Super Market A', amount: 'UGX 150,000', items: 15 },
    ];

    const handleQuickAction = (action: string) => {
        if (action === 'Make Order') {
            onNavigate('customer-make-order');
        } else if (action === 'My Orders') {
            onNavigate('customer-purchases');
        }
    };
    
    const pointsBalance = customerWallet?.loyaltyPoints || 0;
    const pointsRedeemed = customerWallet?.totalPointsRedeemed || 0;
    const pointsValue = loyaltyProgram ? pointsBalance * loyaltyProgram.redemptionValue : 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Welcome back, Contributor</h1>
                <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Icon name="bell" className="w-6 h-6" />
                </button>
            </div>

            {/* Wallet and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-yellow-100 text-sm font-medium">Wallet Balance</p>
                            <h2 className="text-3xl font-bold mt-1">{customerWallet?.currency || 'UGX'} {customerWallet?.balance.toLocaleString() || '0'}</h2>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Icon name="wallet" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                         <button className="flex-1 bg-white text-yellow-600 py-2 rounded-lg font-bold text-sm shadow hover:bg-yellow-50 transition-colors">
                             Top Up
                         </button>
                         <button className="flex-1 bg-yellow-700/50 text-white py-2 rounded-lg font-bold text-sm hover:bg-yellow-700/70 transition-colors">
                             Transfer
                         </button>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-center relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-2 z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                                <Icon name="star" className="w-6 h-6" />
                            </div>
                            <div>
                                 <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Loyalty Points</p>
                                 <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{pointsBalance.toLocaleString()} Pts</h2>
                            </div>
                        </div>
                        <div className={`text-right text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            <p>Redeemed: {pointsRedeemed.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 z-10">
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            Current Value: <span className="font-bold text-green-500">{customerWallet?.currency} {pointsValue.toLocaleString()}</span>
                        </p>
                        {loyaltyProgram && loyaltyProgram.enabled ? (
                             <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Earn 1 point for every {loyaltyProgram.earningThreshold.toLocaleString()} {customerWallet?.currency} spent.
                             </p>
                        ) : (
                            <p className={`text-xs mt-1 italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Loyalty program not active in your region.</p>
                        )}
                    </div>
                    
                    {/* Decorative Icon in background */}
                    <div className="absolute -right-4 -bottom-4 text-purple-500/5 pointer-events-none">
                        <Icon name="star" className="w-32 h-32" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Purchases</h3>
                    <button onClick={() => onNavigate('customer-purchases')} className="text-sm text-yellow-600 hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                    {recentPurchases.map(purchase => (
                        <TransactionCard key={purchase.id} theme={theme} {...purchase} />
                    ))}
                </div>
            </div>

             {/* Quick Actions */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Scan to Pay', 'Make Order', 'My Orders', 'Support'].map((action, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleQuickAction(action)}
                        className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                        <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Icon name={i === 0 ? 'cash' : i === 1 ? 'search' : i === 2 ? 'cart' : 'chat-bubble'} className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                        </div>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{action}</span>
                    </button>
                ))}
             </div>
        </div>
    );
};

export default CustomerDashboard;


import React, { useState } from 'react';
import { Theme, Shop } from '../types';
import Icon from './Icon';

interface WalletSettingsPageProps {
    theme: Theme;
    shops: Shop[];
    setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
}

const WalletSettingsPage: React.FC<WalletSettingsPageProps> = ({ theme, shops, setShops }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleSetting = (shopId: number, setting: 'enableWallets' | 'requireOtpForWalletUpdates' | 'requireClientDebtNotification') => {
        setShops(prev => prev.map(shop => {
            if (shop.id === shopId) {
                const newSettings = { ...shop.settings, [setting]: !shop.settings[setting] };
                return { ...shop, settings: newSettings };
            }
            return shop;
        }));
    };

    const handleLimitChange = (shopId: number, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setShops(prev => prev.map(shop => {
                if (shop.id === shopId) {
                    return { ...shop, settings: { ...shop.settings, defaultWalletLimit: numValue } };
                }
                return shop;
            }));
        }
    };

    const filteredShops = shops.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) && s.status === 'Active');

    const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
        <button 
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-green-500' : 'bg-slate-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span 
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );

    const inputClass = `w-full text-sm px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border p-6`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Shop Wallet Configuration</h2>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Configure wallet features, debt limits, and security settings for each shop.</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input 
                            type="text" 
                            placeholder="Search active shops..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop Name</th>
                                <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Enable Wallets</th>
                                <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Require OTP <br/><span className="font-normal normal-case text-[10px] opacity-70">(For updates)</span>
                                </th>
                                <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider w-40 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Default Max Amount
                                </th>
                                <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Notify Client <br/><span className="font-normal normal-case text-[10px] opacity-70">(On debt added)</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {filteredShops.map(shop => (
                                <tr key={shop.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className={`px-4 py-4 whitespace-nowrap font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                        {shop.name}
                                        <div className={`text-xs font-normal ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{shop.countryCode}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <ToggleSwitch 
                                            checked={shop.settings.enableWallets} 
                                            onChange={() => handleToggleSetting(shop.id, 'enableWallets')} 
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <ToggleSwitch 
                                            checked={shop.settings.requireOtpForWalletUpdates} 
                                            onChange={() => handleToggleSetting(shop.id, 'requireOtpForWalletUpdates')} 
                                            disabled={!shop.settings.enableWallets}
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input 
                                            type="number" 
                                            value={shop.settings.defaultWalletLimit || 0} 
                                            onChange={(e) => handleLimitChange(shop.id, e.target.value)}
                                            disabled={!shop.settings.enableWallets}
                                            className={inputClass}
                                            min="0"
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <ToggleSwitch 
                                            checked={!!shop.settings.requireClientDebtNotification} 
                                            onChange={() => handleToggleSetting(shop.id, 'requireClientDebtNotification')} 
                                            disabled={!shop.settings.enableWallets}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {filteredShops.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-500">No shops found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WalletSettingsPage;

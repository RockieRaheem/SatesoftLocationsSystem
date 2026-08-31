
import React, { useState, useMemo } from 'react';
import { Theme, ExchangeRateData, Country } from '../types';
import { mockExchangeRates } from '../data';
import Icon from './Icon';
import DashboardKPICard from './DashboardKPICard';
import ExchangeRateModal from './ExchangeRateModal';
import ConfirmationModal from './ConfirmationModal';
import DenominatorsModal from './DenominatorsModal';
import CurrencyProfileModal from './CurrencyProfileModal';
import SecurityDeleteModal from './SecurityDeleteModal';

interface ExchangeRatePageProps {
    theme: Theme;
    countries?: Country[];
    onUpdateCountry?: (country: Country) => Promise<void>;
}

const ExchangeRatePage: React.FC<ExchangeRatePageProps> = ({ theme, countries = [], onUpdateCountry }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'denominations' | 'rates'>('profile');
    const [rates, setRates] = useState<ExchangeRateData[]>(mockExchangeRates);
    const [searchQuery, setSearchQuery] = useState('');
    const [denomSearchQuery, setDenomSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDenomModalOpen, setIsDenomModalOpen] = useState(false);
    
    const [selectedRate, setSelectedRate] = useState<ExchangeRateData | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    // Currency Profile State
    const [profileCountry, setProfileCountry] = useState<Country | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileModalMode, setProfileModalMode] = useState<'view' | 'edit'>('view');
    const [denomModalMode, setDenomModalMode] = useState<'view' | 'edit'>('view');
    const [isDenomDeleteOpen, setIsDenomDeleteOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const filteredRates = useMemo(() => {
        return rates.filter(r => 
            r.fromCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.toCurrency.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rates, searchQuery]);

    const filteredCountries = useMemo(() => {
        return countries.filter(c => 
            c.name.toLowerCase().includes(denomSearchQuery.toLowerCase()) ||
            c.currency.toLowerCase().includes(denomSearchQuery.toLowerCase()) ||
            c.currencyCode.toLowerCase().includes(denomSearchQuery.toLowerCase())
        );
    }, [countries, denomSearchQuery]);

    const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
    const paginatedRates = filteredRates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleUpdateDenominations = async (updatedCountry: Country) => {
        if (!onUpdateCountry) return;
        try {
            await onUpdateCountry(updatedCountry);
        } catch (error) {
            console.error("Failed to update denominations", error);
        }
    };

    const handleConfirmDenomDelete = async (remarks: string, password: string) => {
        if (!selectedCountry || !onUpdateCountry) return;
        
        // Mock password check
        if (password !== 'admin123') {
            throw new Error('Invalid authorization password.');
        }

        console.log(`Deleting denominations for ${selectedCountry.name}. Reason: ${remarks}`);
        
        const updated = { ...selectedCountry, currencyDenominators: [] };
        await onUpdateCountry(updated);
        setIsDenomDeleteOpen(false);
        setSelectedCountry(null);
    };

    const stats = useMemo(() => {
        const totalRates = rates.length;
        const lastUpdated = rates.length > 0 ? new Date(Math.max(...rates.map(r => new Date(r.updatedAt).getTime()))).toLocaleString() : 'N/A';
        const totalCurrencies = new Set(countries.map(c => c.currencyCode)).size;
        return { totalRates, lastUpdated, totalCurrencies };
    }, [rates, countries]);

    const handleAddRate = (newRate: Omit<ExchangeRateData, 'id'>) => {
        const newId = rates.length > 0 ? Math.max(...rates.map(r => r.id)) + 1 : 1;
        const rate = { ...newRate, id: newId, updatedAt: new Date().toISOString() };
        setRates([...rates, rate]);
        setIsAddModalOpen(false);
    };

    const handleEditRate = (updatedRate: ExchangeRateData) => {
        setRates(rates.map(r => r.id === updatedRate.id ? { ...updatedRate, updatedAt: new Date().toISOString() } : r));
        setIsEditModalOpen(false);
    };

    const handleDeleteRate = () => {
        if (selectedRate) {
            setRates(rates.filter(r => r.id !== selectedRate.id));
            setIsDeleteModalOpen(false);
            setSelectedRate(null);
        }
    };

    const handleSaveProfile = async (updatedCountry: Country) => {
        if (!onUpdateCountry) return;
        
        setIsSavingProfile(true);
        try {
            await onUpdateCountry(updatedCountry);
            // Optionally update local list if needed, though usually parent handles it
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className={`flex border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 relative ${
                        activeTab === 'profile' 
                        ? 'text-yellow-500 border-yellow-500 bg-yellow-500/5' 
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Icon name="user-circle" className="h-4 w-4" />
                        Currency Profiles
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('denominations')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 relative ${
                        activeTab === 'denominations' 
                        ? 'text-yellow-500 border-yellow-500 bg-yellow-500/5' 
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Icon name="currencies" className="h-4 w-4" />
                        Denominations
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('rates')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 relative ${
                        activeTab === 'rates' 
                        ? 'text-yellow-500 border-yellow-500 bg-yellow-500/5' 
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Icon name="history" className="h-4 w-4" />
                        Exchange Rates
                    </div>
                </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-6">
                {activeTab === 'profile' && (
                    <div className={`rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus-within:border-yellow-500/50' : 'bg-white border-slate-200 focus-within:border-yellow-500/30'} transition-all`}>
                        <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Icon name="globe" className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className={`font-black text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Currency Registry</h3>
                                    <p className="text-xs text-slate-500 font-medium">Global currency profile configurations by country.</p>
                                </div>
                            </div>
                            <div className="relative w-64">
                                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search country..."
                                    value={denomSearchQuery}
                                    onChange={(e) => setDenomSearchQuery(e.target.value)}
                                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className={`text-[10px] uppercase tracking-[0.2em] font-black ${theme === 'dark' ? 'bg-slate-800/50 text-slate-500 border-slate-800' : 'bg-slate-50/50 text-slate-400 border-slate-100'} border-b`}>
                                    <tr>
                                        <th className="px-6 py-4">Country</th>
                                        <th className="px-6 py-4">Currency</th>
                                        <th className="px-6 py-4">Symbol</th>
                                        <th className="px-6 py-4">Decimals</th>
                                        <th className="px-6 py-4">Rounding</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                    {filteredCountries.map(country => (
                                        <tr key={country.id} className={`group transition-all ${theme === 'dark' ? 'hover:bg-yellow-500/5' : 'hover:bg-yellow-50/30'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`} alt={country.name} className="shadow-sm rounded-sm" />
                                                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{country.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-yellow-500 uppercase">{country.currencyCode}</td>
                                            <td className={`px-6 py-4 text-sm font-black ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{country.currencySymbol}</td>
                                            <td className={`px-6 py-4 text-sm font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{country.decimalPlaces || 0}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {country.roundingConfig?.condition || 'Nearest'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => { setProfileCountry(country); setProfileModalMode('view'); setIsProfileModalOpen(true); }}
                                                        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                                                        title="View Profile"
                                                    >
                                                        <Icon name="eye" className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setProfileCountry(country); setProfileModalMode('edit'); setIsProfileModalOpen(true); }}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 group-hover:bg-yellow-500 group-hover:text-slate-900`}
                                                    >
                                                        <Icon name="edit" className="h-3 w-3" />
                                                        Config
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'denominations' && (
                    <div className={`rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} transition-all`}>
                        <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Icon name="currencies" className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className={`font-black text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Denomination Management</h3>
                                    <p className="text-xs text-slate-500 font-medium">Manage cash denominations (notes & coins) for active countries.</p>
                                </div>
                            </div>
                            <div className="relative w-64">
                                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search country..."
                                    value={denomSearchQuery}
                                    onChange={(e) => setDenomSearchQuery(e.target.value)}
                                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className={`text-[10px] uppercase tracking-[0.2em] font-black ${theme === 'dark' ? 'bg-slate-800/50 text-slate-500 border-slate-800' : 'bg-slate-50/50 text-slate-400 border-slate-100'} border-b`}>
                                    <tr>
                                        <th className="px-6 py-4">Country</th>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Denoms</th>
                                        <th className="px-6 py-4">Notes</th>
                                        <th className="px-6 py-4">Coins</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                    {filteredCountries.map(c => (
                                        <tr key={c.id} className={`group transition-all ${theme === 'dark' ? 'hover:bg-yellow-500/5' : 'hover:bg-yellow-50/30'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={`https://flagcdn.com/w20/${c.countryCode.toLowerCase()}.png`} alt={c.name} className="shadow-sm rounded-sm" />
                                                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{c.currencyCode}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-black ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {c.currencyDenominators?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-emerald-500">
                                                    {c.currencyDenominators?.filter(d => d.type === 'Note').length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-blue-500">
                                                    {c.currencyDenominators?.filter(d => d.type === 'Coin').length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => { setSelectedCountry(c); setDenomModalMode('view'); setIsDenomModalOpen(true); }}
                                                        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                                                        title="View Denominations"
                                                    >
                                                        <Icon name="eye" className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedCountry(c); setDenomModalMode('edit'); setIsDenomModalOpen(true); }}
                                                        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-yellow-500/70 hover:text-yellow-500' : 'hover:bg-slate-100 text-yellow-600/70 hover:text-yellow-600'}`}
                                                        title="Edit Denominations"
                                                    >
                                                        <Icon name="edit" className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedCountry(c); setIsDenomDeleteOpen(true); }}
                                                        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-red-500/10 text-red-500/70 hover:text-red-500' : 'hover:bg-red-50 text-red-600/70 hover:text-red-600'}`}
                                                        title="Clear All Denominations"
                                                    >
                                                        <Icon name="trash" className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'rates' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <DashboardKPICard 
                                title="Total Pair Rates" 
                                value={stats.totalRates.toString()} 
                                icon="currencies" 
                                theme={theme} 
                                color="blue"
                            />
                            <DashboardKPICard 
                                title="Available Currencies" 
                                value={stats.totalCurrencies.toString()} 
                                icon="globe" 
                                theme={theme} 
                                color="green"
                            />
                            <DashboardKPICard 
                                title="Last Rate Update" 
                                value={stats.lastUpdated} 
                                icon="history" 
                                theme={theme} 
                                color="indigo"
                            />
                        </div>

                        <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-800/20' : 'border-slate-200 bg-slate-50'}`}>
                                <h2 className={`font-bold text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                    <Icon name="history" className="h-5 w-5 text-yellow-500" />
                                    Currency Exchange Rates
                                </h2>
                                <div className="flex flex-col md:flex-row items-center gap-4 flex-1 max-w-2xl justify-end">
                                    <div className="relative flex-1 max-w-md w-full">
                                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search exchange rates..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-md font-bold transition-colors text-sm w-full md:w-auto"
                                    >
                                        <Icon name="plus" className="h-4 w-4" />
                                        Add Rate
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">#</th>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">From Currency</th>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">To Currency</th>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-right">Rate</th>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Last Updated</th>
                                            <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`text-sm divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                        {paginatedRates.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No exchange rates found.</td>
                                            </tr>
                                        ) : (
                                            paginatedRates.map((rate, index) => (
                                                <tr key={rate.id} className={`hover:bg-opacity-50 transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                                                    <td className="px-4 py-3 text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                    <td className={`px-4 py-3 font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{rate.fromCurrency}</td>
                                                    <td className={`px-4 py-3 font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{rate.toCurrency}</td>
                                                    <td className={`px-4 py-3 text-right font-mono font-semibold text-yellow-500`}>{rate.rate.toFixed(4)}</td>
                                                    <td className={`px-4 py-3 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{new Date(rate.updatedAt).toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                onClick={() => { setSelectedRate(rate); setIsEditModalOpen(true); }}
                                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-yellow-900/30' : 'text-yellow-600 hover:bg-yellow-50'}`}
                                                                title="Edit"
                                                            >
                                                                <Icon name="edit" className="h-4 w-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => { setSelectedRate(rate); setIsDeleteModalOpen(true); }}
                                                                className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                                                                title="Delete"
                                                            >
                                                                <Icon name="trash" className="h-4 w-4" />
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
                            <div className={`p-4 border-t flex items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                                <p className="text-xs text-slate-500">
                                    Showing {Math.min(filteredRates.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredRates.length, currentPage * itemsPerPage)} of {filteredRates.length} rates
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        className={`p-1 rounded border transition-colors disabled:opacity-50 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
                                    >
                                        <Icon name="chevron-left" className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs font-medium px-2">{currentPage} / {totalPages || 1}</span>
                                    <button
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        className={`p-1 rounded border transition-colors disabled:opacity-50 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
                                    >
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ExchangeRateModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSubmit={handleAddRate} 
                theme={theme} 
                mode="add"
            />
            
            {selectedRate && (
                <>
                    <ExchangeRateModal 
                        isOpen={isEditModalOpen} 
                        onClose={() => { setIsEditModalOpen(false); setSelectedRate(null); }} 
                        onSubmit={handleEditRate} 
                        rate={selectedRate} 
                        theme={theme} 
                        mode="edit"
                    />
                    <ConfirmationModal 
                        isOpen={isDeleteModalOpen} 
                        onClose={() => { setIsDeleteModalOpen(false); setSelectedRate(null); }} 
                        onConfirm={handleDeleteRate} 
                        title="Delete Exchange Rate" 
                        message={`Are you sure you want to delete the exchange rate for ${selectedRate.fromCurrency}/${selectedRate.toCurrency}?`} 
                        theme={theme} 
                    />
                </>
            )}

            {selectedCountry && (
                <>
                    <DenominatorsModal 
                        isOpen={isDenomModalOpen}
                        onClose={() => { setIsDenomModalOpen(false); setSelectedCountry(null); }}
                        country={selectedCountry}
                        onUpdate={handleUpdateDenominations}
                        theme={theme}
                        mode={denomModalMode}
                    />
                    <SecurityDeleteModal
                        isOpen={isDenomDeleteOpen}
                        onClose={() => { setIsDenomDeleteOpen(false); setSelectedCountry(null); }}
                        onConfirm={handleConfirmDenomDelete}
                        title="Delete Denomination Configuration"
                        message={`You are about to clear all cash denominations for ${selectedCountry.name}. This will reset the notes and coins list to empty. This action is irreversible.`}
                        theme={theme}
                    />
                </>
            )}

            <CurrencyProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                country={profileCountry}
                onSave={handleSaveProfile}
                theme={theme}
                mode={profileModalMode}
            />
        </div>
    );
};

export default ExchangeRatePage;

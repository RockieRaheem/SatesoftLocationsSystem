
import React, { useState } from 'react';
import { Country, Theme, LoyaltyProgram } from '../types';
import Icon from './Icon';

interface AddCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Country, 'id'>) => void;
  theme: Theme;
}

const continents = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'South America', 'Australia/Oceania'];

const AddCountryModal: React.FC<AddCountryModalProps> = ({ isOpen, onClose, onSave, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [country, setCountry] = useState({
        name: '',
        continent: '',
        economicZones: '',
        currency: '',
        currencySymbol: '',
        currencyCode: '',
        countryCode: '',
        phoneCode: '',
        vat: '',
        numberOfElectoralLevels: '',
        numberOfEconomicLevels: '',
        loyaltyProgram: { enabled: false, earningThreshold: 15000, redemptionValue: 100 } as LoyaltyProgram
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCountry(prev => ({...prev, [name]: value}));
    };
    
    const handleLoyaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setCountry(prev => ({
            ...prev,
            loyaltyProgram: {
                ...prev.loyaltyProgram,
                [name]: type === 'checkbox' ? checked : parseInt(value) || 0
            }
        }));
    };
    
    const resetForm = () => {
        setCountry({
            name: '',
            continent: '',
            economicZones: '',
            currency: '',
            currencySymbol: '',
            currencyCode: '',
            countryCode: '',
            phoneCode: '',
            vat: '',
            numberOfElectoralLevels: '',
            numberOfEconomicLevels: '',
            loyaltyProgram: { enabled: false, earningThreshold: 15000, redemptionValue: 100 }
        });
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            resetForm();
        }, 300);
    };

    const handleSave = () => {
        setError(null);
        const vatValue = parseFloat(country.vat);
        const zonesArray = country.economicZones.split(',').map(z => z.trim()).filter(Boolean);
        const electoralLevels = parseInt(country.numberOfElectoralLevels) || 0;
        const economicLevels = parseInt(country.numberOfEconomicLevels) || 0;

        if (country.name && country.currency && country.continent && !isNaN(vatValue)) {
            onSave({ 
                ...country, 
                vat: vatValue, 
                economicZones: zonesArray,
                numberOfElectoralLevels: electoralLevels,
                numberOfEconomicLevels: economicLevels,
                adminLevels: []
            });
            handleClose();
        } else {
            setError('Please fill all required fields correctly.');
        }
    };
    
    if (!isOpen && !isClosing) return null;
    
    const commonInputClasses = theme === 'dark'
        ? 'bg-slate-800 border-slate-700 text-slate-200'
        : 'bg-white border-slate-300 text-slate-900';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Add New Country</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {error && (
                        <div className="p-3 rounded-md bg-red-100 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <Icon name="exclamation-triangle" className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Country Name</label>
                            <input type="text" name="name" id="name" value={country.name} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div>
                            <label htmlFor="continent" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Continent</label>
                            <select name="continent" id="continent" value={country.continent} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}>
                                <option value="" disabled>Select a continent</option>
                                {continents.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="economicZones" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Economic Zones (comma-separated)</label>
                            <input type="text" name="economicZones" id="economicZones" value={country.economicZones} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div>
                            <label htmlFor="currency" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Currency</label>
                            <input type="text" name="currency" id="currency" value={country.currency} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div>
                            <label htmlFor="currencySymbol" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Currency Symbol</label>
                            <input type="text" name="currencySymbol" id="currencySymbol" value={country.currencySymbol} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div>
                            <label htmlFor="currencyCode" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Currency Code</label>
                            <input type="text" name="currencyCode" id="currencyCode" value={country.currencyCode} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div>
                            <label htmlFor="countryCode" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Country Code</label>
                            <input type="text" name="countryCode" id="countryCode" value={country.countryCode} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                         <div>
                            <label htmlFor="phoneCode" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Phone Code</label>
                            <input type="text" name="phoneCode" id="phoneCode" value={country.phoneCode} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div>
                            <label htmlFor="vat" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>VAT Value (%)</label>
                            <input type="number" name="vat" id="vat" value={country.vat} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div>
                            <label htmlFor="numberOfElectoralLevels" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Number of Electoral Levels</label>
                            <input type="number" name="numberOfElectoralLevels" id="numberOfElectoralLevels" value={country.numberOfElectoralLevels} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} placeholder="e.g. 3" />
                        </div>
                        <div>
                            <label htmlFor="numberOfEconomicLevels" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Number of Economic Levels</label>
                            <input type="number" name="numberOfEconomicLevels" id="numberOfEconomicLevels" value={country.numberOfEconomicLevels} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} placeholder="e.g. 2" />
                        </div>
                    </div>
                    
                    {/* Loyalty Program Section */}
                    <div className={`mt-4 p-4 rounded-lg border ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                        <h3 className={`text-md font-semibold mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Loyalty Program Configuration</h3>
                        <div className="flex items-center mb-4">
                            <input 
                                type="checkbox" 
                                name="enabled" 
                                id="loyalty-enabled"
                                checked={country.loyaltyProgram?.enabled || false}
                                onChange={handleLoyaltyChange}
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            />
                            <label htmlFor="loyalty-enabled" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Enable Loyalty Points for Customers</label>
                        </div>

                        {country.loyaltyProgram?.enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Spend Threshold (Earn 1 Point per...)
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            name="earningThreshold"
                                            value={country.loyaltyProgram.earningThreshold}
                                            onChange={handleLoyaltyChange}
                                            className={`block w-full rounded-md sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">{country.currencyCode}</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">E.g. Spend 15,000 to earn 1 point.</p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Redemption Value (1 Point =)
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            name="redemptionValue"
                                            value={country.loyaltyProgram.redemptionValue}
                                            onChange={handleLoyaltyChange}
                                            className={`block w-full rounded-md sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">{country.currencyCode}</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Monetary value of 1 point when redeeming.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                        Save Country
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AddCountryModal;

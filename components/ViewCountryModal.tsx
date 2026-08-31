

import React, { useState, useEffect } from 'react';
import { Country, Theme } from '../types';
import Icon, { IconName } from './Icon';

interface ViewCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  theme: Theme;
  onViewProfile?: (country: Country) => void;
}

const InfoSection: React.FC<{ theme: Theme; title: string; icon: IconName; children: React.ReactNode }> = ({ theme, title, icon, children }) => (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <h3 className={`flex items-center text-sm font-semibold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            <Icon name={icon} className="h-5 w-5 mr-3" />
            {title}
        </h3>
        {children}
    </div>
);

const DetailItem: React.FC<{ label: string; value: React.ReactNode; theme: Theme }> = ({ label, value, theme }) => (
    <div>
        <div className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
        <div className={`mt-1 text-base font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</div>
    </div>
);


const ViewCountryModal: React.FC<ViewCountryModalProps> = ({ isOpen, onClose, country, theme, onViewProfile }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleViewProfile = () => {
        if (country && onViewProfile) {
            onViewProfile(country);
            handleClose();
        }
    }

    if (!isOpen && !isClosing) return null;
    if (!country) return null;

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-start p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-4">
                        <img 
                            src={`https://flagcdn.com/w80/${country.countryCode.toLowerCase()}.png`}
                            alt={`Flag of ${country.name}`}
                            className="w-20 h-auto rounded-md shadow-md"
                        />
                        <div>
                            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{country.name}</h2>
                            <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{country.continent}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoSection theme={theme} title="Currency" icon="currencies">
                            <div className="space-y-4">
                                <DetailItem theme={theme} label="Name" value={country.currency} />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem theme={theme} label="Code" value={country.currencyCode} />
                                    <DetailItem theme={theme} label="Symbol" value={country.currencySymbol} />
                                </div>
                            </div>
                        </InfoSection>
                        <InfoSection theme={theme} title="Tax & Codes" icon="reports">
                            <div className="space-y-4">
                                <DetailItem theme={theme} label="VAT" value={`${country.vat}%`} />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem theme={theme} label="Country Code" value={country.countryCode} />
                                    <DetailItem theme={theme} label="Phone Code" value={country.phoneCode} />
                                </div>
                            </div>
                        </InfoSection>
                    </div>
                     <InfoSection theme={theme} title="Regions" icon="product-chain">
                        <div className="flex flex-wrap gap-2">
                            {country.economicZones.length > 0 ? country.economicZones.map(zone => (
                                <span key={zone} className={`px-3 py-1 text-sm font-medium rounded-full ${theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                                    {zone}
                                </span>
                            )) : <span className="text-sm italic text-slate-500">None</span>}
                        </div>
                     </InfoSection>

                     <InfoSection theme={theme} title="Defined Structure" icon="system-settings">
                        <div className="grid grid-cols-3 gap-6">
                            <DetailItem theme={theme} label="Total Admin Levels" value={country.numberOfAdminLevels || 'Not set'} />
                            <DetailItem theme={theme} label="Electoral Levels" value={country.numberOfElectoralLevels || 'Not set'} />
                            <DetailItem theme={theme} label="Economic Levels" value={country.numberOfEconomicLevels || 'Not set'} />
                        </div>
                        {country.adminLevelNames && country.adminLevelNames.length > 0 && (
                            <div className="mt-4">
                                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Level Names</p>
                                <ul className="mt-1 space-y-1">
                                    {country.adminLevelNames.sort((a, b) => a.level - b.level).map(levelName => (
                                        <li key={levelName.level} className={`text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                            <span className="font-semibold">Level {levelName.level}:</span> {levelName.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </InfoSection>

                     {country.loyaltyProgram?.enabled && (
                         <InfoSection theme={theme} title="Loyalty Program" icon="star">
                            <div className="grid grid-cols-2 gap-6">
                                <DetailItem theme={theme} label="Earning Threshold" value={`${country.currencySymbol} ${country.loyaltyProgram.earningThreshold.toLocaleString()} = 1 pt`} />
                                <DetailItem theme={theme} label="Point Value" value={`1 pt = ${country.currencySymbol} ${country.loyaltyProgram.redemptionValue.toLocaleString()}`} />
                            </div>
                         </InfoSection>
                     )}

                     <InfoSection theme={theme} title="Defined Admin Areas" icon="shop-mgt">
                        {(country.adminLevels?.length || 0) > 0 ? (
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                                {country.adminLevels.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)).map(level => (
                                    <li key={level.id} className={`text-sm rounded-md p-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <span className={`font-semibold inline-block w-16 text-xs px-2 py-0.5 rounded-md ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                            Level {level.level}
                                        </span>
                                        <span className="ml-2">{level.name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>No administrative areas have been added for this country.</p>
                        )}
                    </InfoSection>
                </div>

                <div className={`flex justify-between items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                     {onViewProfile && (
                        <button 
                            onClick={handleViewProfile}
                            className="flex items-center space-x-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                        >
                            <Icon name="analytics" className="h-4 w-4" />
                            <span>View More Info</span>
                        </button>
                    )}
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewCountryModal;

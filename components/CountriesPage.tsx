

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Theme, Country, AdminLevel } from '../types';
import Icon, { IconName } from './Icon';
import AddCountryModal from './AddCountryModal';
import ViewCountryModal from './ViewCountryModal';
import EditCountryModal from './EditCountryModal';
import MultiSelectDropdown from './MultiSelectDropdown';
import AddAdminLevelModal from './AddAdminLevelModal';

const SummaryCard: React.FC<{ icon: IconName; title: string; value: string; theme: Theme }> = ({ icon, title, value, theme }) => {
    const iconContainerClasses = theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100';
    const iconClasses = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    
    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
            <div className={`p-3 rounded-full mr-4 ${iconContainerClasses}`}>
                <Icon name={icon} className={`h-6 w-6 ${iconClasses}`} />
            </div>
            <div>
                <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
};

const FlagIcon: React.FC<{ countryCode: string, countryName: string }> = ({ countryCode, countryName }) => {
    const [error, setError] = useState(false);

    const handleError = () => {
        setError(true);
    };

    if (error) {
        return (
            <div className="w-5 h-auto flex items-center justify-center text-xs font-mono bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400" title={countryName}>
                {countryCode}
            </div>
        );
    }

    return (
        <img 
            src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
            alt={`Flag of ${countryName}`}
            className="w-5 h-auto"
            title={countryName}
            onError={handleError}
        />
    );
};

interface CountriesPageProps {
    theme: Theme;
    countries: Country[];
    onAddCountry: (country: Omit<Country, 'id'>) => Promise<void>;
    onUpdateCountry: (country: Country) => Promise<void>;
    onDeleteCountry: (id: number) => Promise<void>;
    onViewProfile: (country: Country) => void;
}

const CountriesPage: React.FC<CountriesPageProps> = ({ theme, countries, onAddCountry, onUpdateCountry, onDeleteCountry, onViewProfile }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddAdminLevelModalOpen, setIsAddAdminLevelModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    
    // Search and Sort states
    const [searchText, setSearchText] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Country | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

    // New filter states
    const [continentFilter, setContinentFilter] = useState('');
    const [zoneFilter, setZoneFilter] = useState<string[]>([]);
    const [vatFilter, setVatFilter] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const RECORDS_PER_PAGE = 10;

    const handleAddCountry = (newCountryData: Omit<Country, 'id' | 'adminLevels'>) => {
        onAddCountry({ ...newCountryData, adminLevels: [] });
    };

    const handleAddAdminLevel = (newAdminLevelData: Omit<AdminLevel, 'id'>) => {
        const country = countries.find(c => c.countryCode === newAdminLevelData.countryCode);
        if (country) {
            const newId = country.adminLevels.length > 0 ? Math.max(...country.adminLevels.map(al => al.id)) + 1 : 1;
            const updatedCountry = {
                ...country,
                adminLevels: [...country.adminLevels, { ...newAdminLevelData, id: newId }]
            };
            onUpdateCountry(updatedCountry);
        }
    };
    
    const handleUpdateCountry = (updatedCountry: Country) => {
        onUpdateCountry(updatedCountry);
        setIsEditModalOpen(false);
    };

    const handleViewClick = (country: Country) => {
        setSelectedCountry(country);
        setIsViewModalOpen(true);
    };

    const handleEditClick = (country: Country) => {
        setSelectedCountry(country);
        setIsEditModalOpen(true);
    };

    const uniqueFilterOptions = useMemo(() => {
        const uniqueContinents = [...new Set(countries.map(c => c.continent))];
        const uniqueZones = [...new Set(countries.flatMap(c => c.economicZones))].sort();
        
        return {
            continents: uniqueContinents,
            zones: uniqueZones
        };
    }, [countries]);

    const sortedAndFilteredCountries = useMemo(() => {
        let filtered = [...countries];
        
        if (searchText) {
            const lowercasedFilter = searchText.toLowerCase();
            filtered = filtered.filter(country => 
                country.name.toLowerCase().includes(lowercasedFilter) ||
                country.currencyCode.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (continentFilter) {
            filtered = filtered.filter(c => c.continent === continentFilter);
        }
        if (zoneFilter.length > 0) {
            filtered = filtered.filter(c => c.economicZones.some(zone => zoneFilter.includes(zone)));
        }
        if (vatFilter) {
            const vat = parseFloat(vatFilter);
            if (!isNaN(vat)) {
                filtered = filtered.filter(c => c.vat === vat);
            }
        }
        
        if (sortConfig.key !== null) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key as keyof Country];
                let bValue = b[sortConfig.key as keyof Country];

                // Handle potential undefined for optional fields
                if (['numberOfAdminLevels', 'numberOfElectoralLevels', 'numberOfEconomicLevels'].includes(sortConfig.key as string)) {
                    aValue = aValue || 0;
                    bValue = bValue || 0;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        
        return filtered;
    }, [countries, searchText, sortConfig, continentFilter, zoneFilter, vatFilter]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, continentFilter, zoneFilter, vatFilter]);

    const totalPages = useMemo(() => Math.ceil(sortedAndFilteredCountries.length / RECORDS_PER_PAGE), [sortedAndFilteredCountries.length]);

    const paginatedCountries = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return sortedAndFilteredCountries.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [sortedAndFilteredCountries, currentPage]);

    const startRecord = sortedAndFilteredCountries.length > 0 ? (currentPage - 1) * RECORDS_PER_PAGE + 1 : 0;
    const endRecord = Math.min(currentPage * RECORDS_PER_PAGE, sortedAndFilteredCountries.length);
    
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const summaryData = useMemo(() => {
        const filtered = sortedAndFilteredCountries;
        const uniqueContinents = [...new Set(filtered.map(c => c.continent))];
        const uniqueZones = [...new Set(filtered.flatMap(c => c.economicZones))];
        const totalVat = filtered.reduce((acc, c) => acc + c.vat, 0);
        const avgVat = filtered.length > 0 ? (totalVat / filtered.length).toFixed(1) : '0.0';

        return {
            continents: uniqueContinents.length,
            countries: filtered.length,
            zones: uniqueZones.length,
            avgVat: avgVat
        };
    }, [sortedAndFilteredCountries]);

    const handleResetFilters = () => {
        setContinentFilter('');
        setZoneFilter([]);
        setVatFilter('');
    };

    const requestSort = (key: keyof Country) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Country) => {
        if (sortConfig.key !== key) {
            return <Icon name="chevron-up-down" className="h-4 w-4 ml-2 opacity-30" />;
        }
        return sortConfig.direction === 'ascending' ? 
            <Icon name="chevron-down" className="h-4 w-4 ml-2 transform -rotate-180" /> : 
            <Icon name="chevron-down" className="h-4 w-4 ml-2" />;
    };

    const SortableHeader: React.FC<{ sortKey: keyof Country, children: React.ReactNode }> = ({ sortKey, children }) => (
        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            <button className="flex items-center" onClick={() => requestSort(sortKey)}>
                {children}
                {getSortIcon(sortKey)}
            </button>
        </th>
    );

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
            <AddCountryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddCountry} theme={theme} />
            <AddAdminLevelModal isOpen={isAddAdminLevelModalOpen} onClose={() => setIsAddAdminLevelModalOpen(false)} onSave={handleAddAdminLevel} theme={theme} countries={countries} />
            <ViewCountryModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} country={selectedCountry} theme={theme} onViewProfile={onViewProfile} />
            <EditCountryModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdateCountry} countryToEdit={selectedCountry} theme={theme} />
            
            <div className="flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SummaryCard theme={theme} icon="countries" title="Continents" value={summaryData.continents.toString()} />
                    <SummaryCard theme={theme} icon="shop-mgt" title="Countries" value={summaryData.countries.toString()} />
                    <SummaryCard theme={theme} icon="product-chain" title="Regions" value={summaryData.zones.toString()} />
                    <SummaryCard theme={theme} icon="reports" title="Avg. VAT Rate" value={`${summaryData.avgVat}%`} />
                </div>

                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border mt-6`}>
                    <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsFilterVisible(!isFilterVisible)}>
                        <div className="flex items-center">
                            <Icon name="filter" className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                            <h2 className={`text-md font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Filter</h2>
                        </div>
                        <Icon name="chevron-down" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
                    </div>
                    {isFilterVisible && (
                        <div className={`border-t p-6 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="continentFilter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Continent</label>
                                    <select id="continentFilter" value={continentFilter} onChange={e => setContinentFilter(e.target.value)} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                                        <option value="">All</option>
                                        {uniqueFilterOptions.continents.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="zoneFilter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Region</label>
                                    <MultiSelectDropdown
                                        theme={theme}
                                        options={uniqueFilterOptions.zones}
                                        selected={zoneFilter}
                                        onChange={setZoneFilter}
                                        placeholder="All Regions"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="vatFilter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>VAT Value (%)</label>
                                    <input type="number" id="vatFilter" value={vatFilter} onChange={e => setVatFilter(e.target.value)} placeholder="e.g. 18" className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button onClick={handleResetFilters} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                                    <Icon name="refresh" className="h-4 w-4" />
                                    <span>Reset Filters</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm flex flex-col flex-grow overflow-hidden`}>
                <div className="p-6 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'}`}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                                onClick={() => setIsAddAdminLevelModalOpen(true)}
                                className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-opacity-80 ${theme === 'dark' ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-300'}">
                                <Icon name="shop-mgt" className="h-4 w-4" />
                                <span>Add Admin Level</span>
                            </button>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600">
                                <Icon name="countries" className="h-4 w-4" />
                                <span>Add Country</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-auto flex-grow">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} sticky top-0 z-10`}>
                        <tr>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Flag</th>
                            <SortableHeader sortKey="name">Country</SortableHeader>
                            <SortableHeader sortKey="continent">Continent</SortableHeader>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Regions</th>
                            <SortableHeader sortKey="numberOfAdminLevels">Admin Levels</SortableHeader>
                            <SortableHeader sortKey="numberOfElectoralLevels">Electoral Levels</SortableHeader>
                            <SortableHeader sortKey="numberOfEconomicLevels">Economic Levels</SortableHeader>
                            <SortableHeader sortKey="phoneCode">Phone Code</SortableHeader>
                            <SortableHeader sortKey="vat">VAT</SortableHeader>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Point Value</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                        </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {paginatedCountries.map((country) => (
                                <tr key={country.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <FlagIcon countryCode={country.countryCode} countryName={country.name} />
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{country.name}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.continent}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.economicZones.join(', ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => handleViewClick(country)} className={`font-medium ${theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}`}>{country.numberOfAdminLevels || 0}</button>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.numberOfElectoralLevels || 0}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.numberOfEconomicLevels || 0}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.phoneCode}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.vat}%</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {country.loyaltyProgram?.enabled ? `${country.currencySymbol} ${country.loyaltyProgram.redemptionValue}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => handleViewClick(country)} title="View Country">
                                                <Icon name="view" className="h-5 w-5"/>
                                            </button>
                                            <button className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => handleEditClick(country)} title="Edit Country">
                                                <Icon name="edit" className="h-5 w-5"/>
                                            </button>
                                            <button className={`${theme === 'dark' ? 'text-red-500/50 hover:text-red-500' : 'text-red-400 hover:text-red-600'}`} onClick={() => onDeleteCountry(country.id)} title="Delete Country">
                                                <Icon name="trash" className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Showing <span className="font-medium">{startRecord}</span> to <span className="font-medium">{endRecord}</span> of <span className="font-medium">{sortedAndFilteredCountries.length}</span> records
                        </p>
                        {totalPages > 1 && (
                            <nav className="flex items-center space-x-1">
                                <button 
                                    className={`p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    aria-label="Previous page"
                                >
                                    <Icon name="chevron-left" className="h-5 w-5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                                            currentPage === page 
                                                ? 'bg-yellow-500 text-slate-900' 
                                                : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                                        }`}
                                        onClick={() => handlePageChange(page)}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button 
                                    className={`p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    aria-label="Next page"
                                >
                                    <Icon name="chevron-right" className="h-5 w-5" />
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CountriesPage;


import React, { useState, useMemo } from 'react';
import { Theme, Country, ElectoralLevelName } from '../types';
import Icon from './Icon';
import DefineElectoralLevelsModal from './DefineElectoralLevelsModal';
import ViewElectoralLevelsModal from './ViewElectoralLevelsModal';
import UgandaElectoralRegistry from './UgandaElectoralRegistry';

const FlagIcon: React.FC<{ countryCode: string, countryName: string }> = ({ countryCode, countryName }) => {
    return (
        <img 
            src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
            alt={`Flag of ${countryName}`}
            className="w-5 h-auto"
            title={countryName}
        />
    );
};

interface CountryElectoralLevelsPageProps {
    theme: Theme;
    countries: Country[];
    onUpdateCountry: (country: Country) => Promise<void>;
}

const CountryElectoralLevelsPage: React.FC<CountryElectoralLevelsPageProps> = ({ theme, countries, onUpdateCountry }) => {
    const [isDefineModalOpen, setIsDefineModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [countryToManage, setCountryToManage] = useState<Country | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSaveDefinitions = (countryCode: string, levels: ElectoralLevelName[], count: number) => {
        const country = countries.find(c => c.countryCode === countryCode);
        if (country) {
            const updatedCountry = {
                ...country,
                electoralLevelNames: levels,
                numberOfElectoralLevels: count,
                updatedBy: 'Current User', // Mock
                updatedAt: new Date().toISOString()
            };
            onUpdateCountry(updatedCountry);
        }
    };

    const handleEditClick = (country: Country) => {
        setCountryToManage(country);
        setIsDefineModalOpen(true);
    };

    const handleViewClick = (country: Country) => {
        setCountryToManage(country);
        setIsViewModalOpen(true);
    }

    const filteredCountries = useMemo(() => {
        return countries.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [countries, searchTerm]);

    return (
        <>
            <DefineElectoralLevelsModal 
                isOpen={isDefineModalOpen} 
                onClose={() => setIsDefineModalOpen(false)} 
                onSave={handleSaveDefinitions} 
                theme={theme} 
                countryToDefine={countryToManage} 
            />
            <ViewElectoralLevelsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                country={countryToManage}
                theme={theme}
            />
            
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm h-full flex flex-col`}>
                <UgandaElectoralRegistry theme={theme} />
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Country Electoral Levels</h2>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Manage electoral hierarchy definitions for each country.</p>
                    </div>
                    
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search countries..."
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-grow">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Country</th>
                                <th scope="col" className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Levels</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Defined Levels</th>
                                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {filteredCountries.map(country => (
                                <tr key={country.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FlagIcon countryCode={country.countryCode} countryName={country.name} />
                                            <span className={`ml-3 font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{country.name}</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {country.numberOfElectoralLevels || 0}
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {country.electoralLevelNames && country.electoralLevelNames.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {country.electoralLevelNames.sort((a,b) => a.level - b.level).map(l => (
                                                    <span key={l.level} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                                        {l.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="italic opacity-50">Not configured</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button 
                                                onClick={() => handleViewClick(country)}
                                                className={`${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                                title="View Levels"
                                                disabled={!country.numberOfElectoralLevels}
                                            >
                                                <Icon name="view" className="h-5 w-5"/>
                                            </button>
                                            <button 
                                                onClick={() => handleEditClick(country)}
                                                className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                                title="Edit Configuration"
                                            >
                                                <Icon name="edit" className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default CountryElectoralLevelsPage;

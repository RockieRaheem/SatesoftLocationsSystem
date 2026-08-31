
import React, { useMemo } from 'react';
import { Theme, Country } from '../types';
import Icon, { IconName } from './Icon';
import { formatDate } from '../utils';
import { BarChart } from './Charts';

interface CountryProfilePageProps {
    theme: Theme;
    country: Country | null;
    onNavigate: (view: any) => void;
}

const DetailCard: React.FC<{ theme: Theme, title: string, children: React.ReactNode, icon: IconName, className?: string }> = ({ theme, title, children, icon, className = "" }) => (
    <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} ${className}`}>
        <h3 className={`flex items-center text-sm font-bold uppercase tracking-wider px-5 py-4 border-b ${theme === 'dark' ? 'text-slate-200 border-slate-700' : 'text-slate-700 border-slate-100'}`}>
            <Icon name={icon} className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            {title}
        </h3>
        <div className="p-5">
            {children}
        </div>
    </div>
);

const InfoRow: React.FC<{ label: string, value: React.ReactNode, theme: Theme }> = ({ label, value, theme }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-0 border-dashed border-gray-200 dark:border-slate-700">
        <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
        <span className={`font-medium text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value || '-'}</span>
    </div>
);

const StatCard: React.FC<{ label: string, value: string, icon: IconName, colorClass: string, theme: Theme }> = ({ label, value, icon, colorClass, theme }) => (
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
        <div className="flex justify-between items-start">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
            <div className={`p-2 rounded-full ${colorClass.replace('text-', 'bg-').replace('500', '100')} ${theme === 'dark' ? 'bg-opacity-10' : ''}`}>
                <Icon name={icon} className={`h-5 w-5 ${colorClass}`} />
            </div>
        </div>
        <div className="mt-4">
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</span>
        </div>
    </div>
);

const CountryProfilePage: React.FC<CountryProfilePageProps> = ({ theme, country, onNavigate }) => {
    if (!country) return (
        <div className="p-8 text-center">
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>No country selected.</p>
            <button onClick={() => onNavigate('countries')} className="mt-4 text-blue-500 hover:underline">Back to Countries</button>
        </div>
    );

    // Mock Data generation for visualization
    const population = useMemo(() => (Math.floor(Math.random() * 50) + 10).toString() + "M", []);
    const gdp = useMemo(() => "$" + (Math.floor(Math.random() * 100) + 10).toString() + "B", []);
    const shopsCount = useMemo(() => Math.floor(Math.random() * 500) + 50, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className={`p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between md:items-center gap-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center space-x-5">
                    <div className={`w-24 h-16 flex-shrink-0 flex items-center justify-center rounded-md overflow-hidden shadow-sm bg-slate-100`}>
                        <img 
                            src={`https://flagcdn.com/w160/${country.countryCode.toLowerCase()}.png`} 
                            alt={`Flag of ${country.name}`} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className={`text-3xl font-bold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{country.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.continent}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium`}>
                                {country.countryCode}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => onNavigate('countries')} className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md transition-colors ${theme === 'dark' ? 'text-slate-300 border-slate-600 hover:bg-slate-800' : 'text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                        <Icon name="chevron-left" className="h-4 w-4" />
                        <span>Back to List</span>
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Population (Est)" value={population} icon="users" colorClass="text-blue-500" theme={theme} />
                <StatCard label="Registered Shops" value={shopsCount.toString()} icon="shop-mgt" colorClass="text-yellow-500" theme={theme} />
                <StatCard label="VAT Rate" value={`${country.vat}%`} icon="reports" colorClass="text-green-500" theme={theme} />
                <StatCard label="GDP (Est)" value={gdp} icon="analytics" colorClass="text-purple-500" theme={theme} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="space-y-6 lg:col-span-1">
                    <DetailCard theme={theme} title="General Information" icon="globe">
                        <InfoRow label="Official Name" value={country.name} theme={theme} />
                        <InfoRow label="ISO Code (2)" value={country.countryCode} theme={theme} />
                        <InfoRow label="Dialing Code" value={country.phoneCode} theme={theme} />
                        <InfoRow label="Currency" value={`${country.currency} (${country.currencyCode})`} theme={theme} />
                        <InfoRow label="Currency Symbol" value={country.currencySymbol} theme={theme} />
                    </DetailCard>

                     <DetailCard theme={theme} title="Regions" icon="product-chain">
                        <div className="flex flex-wrap gap-2">
                            {country.economicZones.length > 0 ? country.economicZones.map(zone => (
                                <span key={zone} className={`px-3 py-1 text-sm rounded-full border ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                                    {zone}
                                </span>
                            )) : <span className="text-sm italic text-slate-500">None listed</span>}
                        </div>
                    </DetailCard>

                     <DetailCard theme={theme} title="Metadata" icon="system-settings">
                        <InfoRow label="Total Admin Levels" value={country.numberOfAdminLevels || 0} theme={theme} />
                        <InfoRow label="Added By" value={country.createdBy} theme={theme} />
                        <InfoRow label="Last Updated" value={formatDate(country.updatedAt || new Date().toISOString())} theme={theme} />
                    </DetailCard>
                </div>

                {/* Right Column - Admin Levels & Charts */}
                <div className="space-y-6 lg:col-span-2">
                    
                    {/* Administrative Structure */}
                    <DetailCard theme={theme} title="Administrative Structure" icon="shop-mgt">
                        {country.adminLevelNames && country.adminLevelNames.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-2 overflow-x-auto pb-2">
                                    {country.adminLevelNames.sort((a,b) => a.level - b.level).map((lvl, idx) => (
                                        <div key={lvl.level} className="flex items-center">
                                            <div className={`px-3 py-1.5 rounded text-sm font-medium border ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                                                <span className="text-xs text-slate-500 block uppercase tracking-wide">Level {lvl.level}</span>
                                                {lvl.name}
                                            </div>
                                            {idx < (country.adminLevelNames?.length || 0) - 1 && (
                                                <Icon name="chevron-right" className="h-4 w-4 mx-2 text-slate-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-4">
                                    <h4 className={`text-sm font-bold mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Registered Areas ({country.adminLevels.length})</h4>
                                    <div className={`rounded-md border max-h-60 overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        {country.adminLevels.length > 0 ? (
                                            <table className="w-full text-sm text-left">
                                                <thead className={`${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                                                    <tr>
                                                        <th className="px-4 py-2">Name</th>
                                                        <th className="px-4 py-2">Level</th>
                                                        <th className="px-4 py-2">Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {country.adminLevels.map(area => (
                                                        <tr key={area.id}>
                                                            <td className={`px-4 py-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{area.name}</td>
                                                            <td className={`px-4 py-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{area.level}</td>
                                                            <td className={`px-4 py-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                                {country.adminLevelNames?.find(n => n.level === area.level)?.name || `Level ${area.level}`}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-4 text-center text-sm text-slate-500">No administrative areas defined yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-slate-500">Administrative hierarchy levels have not been defined for this country.</div>
                        )}
                    </DetailCard>

                    {/* Shops Distribution (Mock Chart) */}
                    <div className={`p-6 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                             Shop Distribution by Region (Mock Data)
                        </h3>
                        <div className="h-64">
                             <BarChart 
                                theme={theme}
                                data={[
                                    { name: 'North', value: 45, color: '#3b82f6' },
                                    { name: 'South', value: 80, color: '#10b981' },
                                    { name: 'East', value: 30, color: '#f59e0b' },
                                    { name: 'West', value: 55, color: '#ef4444' },
                                    { name: 'Central', value: 120, color: '#8b5cf6' }
                                ]} 
                                height={250}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CountryProfilePage;

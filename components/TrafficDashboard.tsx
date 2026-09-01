
import React, { useState, useMemo } from 'react';
import { Theme, RegionalEconomicLevel } from '../types';
import Icon, { IconName } from './Icon';
import { AreaChart, DonutChart } from './Charts';
import AfricaMap from './AfricaMap';
import CountryMapModal from './CountryMapModal';
import { mockShops } from '../data';

const StatCard: React.FC<{ title: string; value: string; change: string; isPositive: boolean; icon: IconName; theme: Theme }> = ({ title, value, change, isPositive, icon, theme }) => (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-xl p-6 border shadow-sm flex items-start justify-between transition-all hover:shadow-md`}>
        <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
            <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
            <div className={`flex items-center text-sm mt-2 font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <span className={`flex items-center px-1.5 py-0.5 rounded text-xs ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <Icon name={isPositive ? 'arrow-up' : 'arrow-down'} className="h-3 w-3 mr-1" />
                    {change}
                </span>
                <span className={`ml-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>vs last period</span>
            </div>
        </div>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            <Icon name={icon} className="h-6 w-6" />
        </div>
    </div>
);

const FilterButton: React.FC<{ label: string; active?: boolean; children?: React.ReactNode; theme: Theme; onClick: () => void }> = ({ label, active, children, theme, onClick }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        active 
        ? 'bg-yellow-500 text-slate-900 shadow-sm' 
        : (theme === 'dark' 
            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200')
    }`}>
        <span>{label}</span>
        {children}
    </button>
);

const SectionCard: React.FC<{ title: string; subtitle?: string; icon?: IconName; children: React.ReactNode; theme: Theme; className?: string }> = ({ title, subtitle, icon, children, theme, className = '' }) => (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-sm border ${className} flex flex-col`}>
        <div className={`px-6 py-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
            <div>
                <h2 className={`text-lg font-bold flex items-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                    {icon && <Icon name={icon} className={`h-5 w-5 mr-2.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />}
                    {title}
                </h2>
                {subtitle && <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
            </div>
            <button className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-50 text-slate-400'}`}>
                <Icon name="filter" className="h-4 w-4" />
            </button>
        </div>
        <div className="p-6 flex-grow">{children}</div>
    </div>
);

const TrafficDashboard: React.FC<{ theme: Theme; regionalLevels: RegionalEconomicLevel[] }> = ({ theme, regionalLevels }) => {
    const [activeFilter, setActiveFilter] = useState('Last 30 Days');
    const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
    
    const trafficTrendsData = [20, 35, 40, 30, 45, 55, 50, 65, 70, 60, 75, 85, 90, 80, 70, 75, 80, 95, 100, 90, 85, 95, 105, 110, 100, 90, 110, 115, 120, 125];

    const trafficSourceData = useMemo(() => [
        { name: 'Direct', value: 5400, color: theme === 'dark' ? '#8b5cf6' : '#7c3aed' },
        { name: 'Organic Search', value: 3600, color: theme === 'dark' ? '#22c55e' : '#16a34a' },
        { name: 'Referral', value: 1800, color: theme === 'dark' ? '#ec4899' : '#d946ef' },
        { name: 'Social Media', value: 1200, color: theme === 'dark' ? '#3b82f6' : '#2563eb' },
    ], [theme]);

    const topPagesData = [
        { page: '/home', visits: 3450, bounce: '25.4%' },
        { page: '/products/pricing', visits: 2120, bounce: '38.2%' },
        { page: '/features/analytics', visits: 1890, bounce: '41.9%' },
        { page: '/blog/new-features', visits: 980, bounce: '15.5%' },
        { page: '/about-us', visits: 750, bounce: '55.1%' },
        { page: '/contact', visits: 620, bounce: '48.0%' },
    ];

    const maxPageVisits = Math.max(...topPagesData.map(p => p.visits));

    // Mock density data for the map
    const visitorDensity = useMemo<Record<string, number>>(() => ({
        'KE': 450, 'UG': 320, 'TZ': 210, 'RW': 150, 'NG': 120, 'ZA': 90, 'GH': 80, 'EG': 60
    }), []);
    
    const headingColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
    const subHeadingColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className={`min-h-full font-sans pb-8`}>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${headingColor}`}>Traffic Overview</h1>
                    <p className={`text-sm mt-1 ${subHeadingColor}`}>Monitor your website performance and visitor insights.</p>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                    {['Last 7 Days', 'Last 30 Days', 'This Quarter'].map(filter => (
                        <FilterButton 
                            key={filter}
                            label={filter} 
                            theme={theme} 
                            active={activeFilter === filter} 
                            onClick={() => setActiveFilter(filter)}
                        />
                    ))}
                    <div className={`h-8 w-px mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                     <button className={`p-2 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Icon name="calendar" className="h-5 w-5" />
                    </button>
                    <button className={`p-2 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Icon name="download" className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Visits" value="12,450" change="5.2%" isPositive={true} icon="users" theme={theme} />
                    <StatCard title="Unique Visitors" value="9,820" change="3.1%" isPositive={true} icon="user-circle" theme={theme} />
                    <StatCard title="Page Views" value="48,123" change="8.7%" isPositive={true} icon="view" theme={theme} />
                    <StatCard title="Bounce Rate" value="45.2%" change="2.5%" isPositive={false} icon="arrows-pointing-out" theme={theme} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Traffic Chart */}
                    <SectionCard title="Traffic Trends" subtitle="Daily visitor count over time" theme={theme} className="lg:col-span-2 min-h-[400px]">
                        <div className="h-full w-full min-h-[300px]">
                            <AreaChart data={trafficTrendsData} theme={theme} />
                        </div>
                    </SectionCard>

                    {/* Traffic Sources */}
                    <SectionCard title="Traffic Sources" subtitle="Where your users are coming from" theme={theme} className="min-h-[400px]">
                        <div className="h-full flex flex-col justify-center">
                            <div className="h-64 relative">
                                <DonutChart 
                                    data={trafficSourceData} 
                                    theme={theme} 
                                    strokeWidth={25}
                                    centerValue="12k"
                                    centerSubLabel="Total Visits"
                                    showLegend={false}
                                />
                            </div>
                            <div className="mt-6 space-y-4">
                                {trafficSourceData.map(item => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{((item.value / 12000) * 100).toFixed(0)}%</span>
                                            <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>({item.value.toLocaleString()})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Visitor Map */}
                     <SectionCard title="Visitors by Location" subtitle="Geographic distribution of your traffic" icon="globe" theme={theme} className="min-h-[400px]">
                         <div className="h-[320px] w-full -ml-4">
                             <AfricaMap 
                                shops={mockShops} 
                                coverageByCountry={Object.fromEntries(
                                  Object.entries(visitorDensity).map(([code, count]) => [code, { count, label: 'Visitors' }])
                                )}
                                regionalLevels={regionalLevels} 
                                theme={theme} 
                                onCountryClick={(id, name) => setSelectedCountry({ id, name })}
                                onCountryDoubleClick={(id, name) => setSelectedCountry({ id, name })}
                             />
                         </div>
                         <div className="mt-4 grid grid-cols-2 gap-4">
                             {Object.entries(visitorDensity).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 4).map(([code, count]) => (
                                 <div key={code} className="flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                         <img src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`} alt={code} className="w-5 rounded-sm" />
                                         <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{code}</span>
                                     </div>
                                     <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{count}</span>
                                 </div>
                             ))}
                         </div>
                     </SectionCard>

                    {/* Top Pages Table */}
                    <SectionCard title="Top Landing Pages" subtitle="Most visited pages this period" icon="reports" theme={theme} className="min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`text-xs uppercase tracking-wider text-left ${theme === 'dark' ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'} border-b`}>
                                        <th className="pb-3 font-semibold">Page Path</th>
                                        <th className="pb-3 font-semibold w-32">Visits</th>
                                        <th className="pb-3 font-semibold text-right">Bounce</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {topPagesData.map((item, index) => (
                                        <tr key={index} className="group">
                                            <td className="py-3 pr-4">
                                                <div className={`font-medium text-sm truncate max-w-[200px] sm:max-w-xs ${theme === 'dark' ? 'text-slate-300 group-hover:text-yellow-400' : 'text-slate-700 group-hover:text-yellow-600'} transition-colors`}>
                                                    {item.page}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex flex-col justify-center">
                                                    <span className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{item.visits.toLocaleString()}</span>
                                                    <div className={`h-1.5 w-full rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                        <div 
                                                            className="h-1.5 rounded-full bg-blue-500" 
                                                            style={{ width: `${(item.visits / maxPageVisits) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {item.bounce}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-center">
                            <button className={`text-sm font-medium hover:underline ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>View All Pages</button>
                        </div>
                    </SectionCard>
                </div>
            </div>

            {selectedCountry && (
                <CountryMapModal
                    countryId={selectedCountry.id}
                    countryName={selectedCountry.name}
                    theme={theme}
                    onClose={() => setSelectedCountry(null)}
                />
            )}
        </div>
    );
};

export default TrafficDashboard;

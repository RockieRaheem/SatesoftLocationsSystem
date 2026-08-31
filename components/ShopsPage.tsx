
import React, { useState, useMemo } from 'react';
import { Theme, Shop, Country, TerminationReason, ShopUser, SuperUser } from '../types';
import Icon from './Icon';
import AddShopModal from './AddShopModal';
import EditShopModal from './EditShopModal';
import TerminateShopModal from './TerminateShopModal';
import ViewShopModal from './ViewShopModal';

interface ShopsPageProps {
    theme: Theme;
    shops: Shop[];
    setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
    onSelectShop: (shop: Shop) => void;
    onViewStatement: (shop: Shop) => void;
    countries: Country[];
    users: (ShopUser | SuperUser)[];
}

const ShopsPage: React.FC<ShopsPageProps> = ({ theme, shops, setShops, onSelectShop, onViewStatement, countries, users }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
    const [shopToEdit, setShopToEdit] = useState<Shop | null>(null);
    const [shopToView, setShopToView] = useState<Shop | null>(null);
    const [shopToTerminate, setShopToTerminate] = useState<Shop | null>(null);
    const [activeTab, setActiveTab] = useState<'Active' | 'Terminated'>('Active');
    
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        country: '',
        adminLevels: {} as Record<number, string>,
        createdBy: '',
        category: '',
        owner: '',
        startDate: '',
        endDate: '',
    });

    const uniqueFilterValues = useMemo(() => {
        const categories = [...new Set(shops.map(s => s.category))].filter(Boolean).sort();
        const creators = [...new Set(shops.map(s => s.createdBy))].filter(Boolean).sort();
        return { categories, creators };
    }, [shops]);
    
    const selectedCountryForFilter = useMemo(() => {
        return countries.find(c => c.countryCode === filters.country);
    }, [filters.country, countries]);

    const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
        const newFilters = { ...filters, [filterName]: value };
        if (filterName === 'country') {
            newFilters.adminLevels = {}; // Reset admin levels when country changes
        }
        setFilters(newFilters);
    };
    
    const handleAdminLevelFilterChange = (level: number, name: string) => {
        const newAdminLevels = { ...filters.adminLevels };
        // When a higher level changes, reset lower levels
        Object.keys(newAdminLevels).forEach(key => {
            if (parseInt(key) > level) {
                delete newAdminLevels[parseInt(key) as keyof typeof newAdminLevels];
            }
        });
        newAdminLevels[level] = name;
        setFilters(prev => ({ ...prev, adminLevels: newAdminLevels }));
    };

    const activeShops = useMemo(() => shops.filter(s => s.status === 'Active'), [shops]);
    const terminatedShops = useMemo(() => shops.filter(s => s.status === 'Terminated'), [shops]);

    const shopsToShow = useMemo(() => {
        let currentShops = activeTab === 'Active' ? activeShops : terminatedShops;

        return currentShops.filter(shop => {
            if (filters.country && shop.countryCode !== filters.country) return false;
            if (filters.category && shop.category !== filters.category) return false;
            if (filters.createdBy && shop.createdBy !== filters.createdBy) return false;
            if (filters.owner && shop.ownerId !== parseInt(filters.owner)) return false;
            if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                startDate.setHours(0,0,0,0);
                if (new Date(shop.createdAt) < startDate) return false;
            }
            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                endDate.setHours(23,59,59,999);
                if (new Date(shop.createdAt) > endDate) return false;
            }

            for (const levelStr in filters.adminLevels) {
                const level = parseInt(levelStr);
                const name = filters.adminLevels[level];
                if (name && !shop.adminLevels.some(al => al.level === level && al.name === name)) {
                    return false;
                }
            }
            return true;
        });
    }, [activeTab, activeShops, terminatedShops, filters]);

    const handleSaveShop = (newShopData: Omit<Shop, 'id'>) => {
        setShops(prevShops => {
            const newId = prevShops.length > 0 ? Math.max(...prevShops.map(s => s.id)) + 1 : 1;
            const newShop: Shop = { id: newId, ...newShopData };
            return [newShop, ...prevShops];
        });
    };
    
    const handleUpdateShop = (updatedShop: Shop) => {
        setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));
    };

    const handleOpenEditModal = (shop: Shop) => {
        setShopToEdit(shop);
        setIsEditModalOpen(true);
    };

    const handleOpenViewModal = (shop: Shop) => {
        setShopToView(shop);
        setIsViewModalOpen(true);
    };

    const handleOpenTerminateModal = (shop: Shop) => {
        setShopToTerminate(shop);
        setIsTerminateModalOpen(true);
    };

    const handleConfirmTerminate = (reason: TerminationReason, remarks: string) => {
        if (shopToTerminate) {
            setShops(prev => prev.map(s => s.id === shopToTerminate.id ? { ...s, status: 'Terminated', terminationReason: reason, terminationRemarks: remarks, terminatedAt: new Date().toISOString() } : s));
        }
        setIsTerminateModalOpen(false);
        setShopToTerminate(null);
    };

    const Tab: React.FC<{ name: 'Active' | 'Terminated'; label: string; count: number; }> = ({ name, label, count }) => (
        <button onClick={() => setActiveTab(name)} className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 ${activeTab === name ? 'border-yellow-500 text-yellow-500' : `border-transparent ${theme==='dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}`}>
            {label} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === name ? (theme==='dark' ? 'bg-yellow-500/10' : 'bg-yellow-100') : (theme==='dark' ? 'bg-slate-700' : 'bg-slate-200')}`}>{count}</span>
        </button>
    );
    
    const FilterInput: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
        <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
            {children}
        </div>
    );
    const filterInputClass = `w-full text-sm px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} border`;

    return (
        <>
            <AddShopModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveShop}
                theme={theme}
                countries={countries}
                users={users}
            />
            <EditShopModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateShop}
                shopToEdit={shopToEdit}
                theme={theme}
                countries={countries}
                users={users}
            />
            <TerminateShopModal
                isOpen={isTerminateModalOpen}
                onClose={() => setIsTerminateModalOpen(false)}
                onConfirm={handleConfirmTerminate}
                shop={shopToTerminate}
                theme={theme}
            />
            <ViewShopModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                shop={shopToView}
                theme={theme}
                countries={countries}
                users={users}
            />
            <div className="space-y-6">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border`}>
                    <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsFilterVisible(!isFilterVisible)}>
                        <div className="flex items-center"><Icon name="filter" className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} /><h2 className="font-semibold">Filters</h2></div>
                        <Icon name="chevron-down" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
                    </div>
                    {isFilterVisible && (
                        <div className={`border-t p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FilterInput label="Country"><select value={filters.country} onChange={e => handleFilterChange('country', e.target.value)} className={filterInputClass}><option value="">All</option>{countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}</select></FilterInput>
                                {selectedCountryForFilter?.adminLevelNames?.sort((a,b) => a.level - b.level).map(levelDef => {
                                    const parentLevelSelection = levelDef.level > 1 ? filters.adminLevels[levelDef.level - 1] : null;
                                    const parentAdminAreaId = parentLevelSelection ? selectedCountryForFilter.adminLevels.find(area => area.name === parentLevelSelection)?.id : undefined;
                                    const options = selectedCountryForFilter.adminLevels.filter(area => area.level === levelDef.level && (levelDef.level === 1 || area.parentAdminLevelId === parentAdminAreaId));
                                    
                                    return <FilterInput key={levelDef.level} label={levelDef.name}><select value={filters.adminLevels[levelDef.level] || ''} onChange={e => handleAdminLevelFilterChange(levelDef.level, e.target.value)} className={filterInputClass} disabled={levelDef.level > 1 && !parentLevelSelection}><option value="">All</option>{options.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}</select></FilterInput>
                                })}
                                <FilterInput label="Category"><select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} className={filterInputClass}><option value="">All</option>{uniqueFilterValues.categories.map(c => <option key={c} value={c}>{c}</option>)}</select></FilterInput>
                                <FilterInput label="Owner"><select value={filters.owner} onChange={e => handleFilterChange('owner', e.target.value)} className={filterInputClass}><option value="">All</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></FilterInput>
                                <FilterInput label="Created By"><select value={filters.createdBy} onChange={e => handleFilterChange('createdBy', e.target.value)} className={filterInputClass}><option value="">All</option>{uniqueFilterValues.creators.map(c => <option key={c} value={c}>{c}</option>)}</select></FilterInput>
                                <FilterInput label="Start Date"><input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} className={filterInputClass} /></FilterInput>
                                <FilterInput label="End Date"><input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} className={filterInputClass} /></FilterInput>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
                    <div className="flex justify-between items-center mb-4">
                        <nav className="flex space-x-2">
                            <Tab name="Active" label="Active Shops" count={activeShops.length} />
                            <Tab name="Terminated" label="Terminated Shops" count={terminatedShops.length} />
                        </nav>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600">
                            <Icon name="plus" className="h-4 w-4" />
                            <span>Add Shop</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    {['ID', 'Name', 'Country', 'Owner', 'Admin Levels', 'Last Updated By', 'Financials', 'Actions'].map((header) => (
                                        <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {shopsToShow.map((shop) => {
                                    const owner = users.find(u => u.id === shop.ownerId);
                                    return (
                                    <tr key={shop.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{shop.id}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{shop.name}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{shop.countryCode}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{owner?.name || 'N/A'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{shop.adminLevels.length}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{shop.updatedBy || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button 
                                                onClick={() => onViewStatement(shop)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${theme === 'dark' ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/80' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                                            >
                                                View Dashboard
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-4">
                                                <button onClick={() => handleOpenViewModal(shop)} title="Quick View" className={`${theme === 'dark' ? 'text-slate-500 hover:text-yellow-400' : 'text-slate-400 hover:text-yellow-600'}`}>
                                                    <Icon name="eye" className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => onSelectShop(shop)} title="View Profile" className={`${theme === 'dark' ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}>
                                                    <Icon name="view" className="h-5 w-5"/>
                                                </button>
                                                {activeTab === 'Active' && (
                                                    <>
                                                    <button onClick={() => handleOpenEditModal(shop)} title="Edit Shop" className={`${theme === 'dark' ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}>
                                                        <Icon name="edit" className="h-5 w-5"/>
                                                    </button>
                                                    <button onClick={() => handleOpenTerminateModal(shop)} title="Terminate Shop" className={`${theme === 'dark' ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'}`}>
                                                        <Icon name="delete" className="h-5 w-5"/>
                                                    </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShopsPage;

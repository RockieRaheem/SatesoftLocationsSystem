import React, { useState, useMemo } from 'react';
import { Theme, Country, AdminLevel, AdminLevelName } from '../types';
import Icon from './Icon';
import AddAdminLevelModal from './AddAdminLevelModal';
import DefineAdminLevelsModal from './DefineAdminLevelsModal';
import MultiSelectDropdown from './MultiSelectDropdown';

const FlagIcon: React.FC<{ countryCode: string, countryName: string }> = ({ countryCode, countryName }) => {
    return (
        <img 
            src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
            alt={`Flag of ${countryName}`}
            className="w-5 h-auto rounded-sm object-cover"
            title={countryName}
        />
    );
};

interface CountryAdminLevelsPageProps {
    theme: Theme;
    countries: Country[];
    onUpdateCountry: (country: Country) => Promise<void>;
}

const CountryAdminLevelsPage: React.FC<CountryAdminLevelsPageProps> = ({ theme, countries, onUpdateCountry }) => {
    const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
    const [isDefineLevelsModalOpen, setIsDefineLevelsModalOpen] = useState(false);
    const [countryToDefine, setCountryToDefine] = useState<Country | null>(null);

    // Active sub-page states for editing a country
    const [editingCountryId, setEditingCountryId] = useState<number | null>(null);
    const [activeLevelTab, setActiveLevelTab] = useState<number>(1);
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaParentId, setNewAreaParentId] = useState<string>('');

    // Filter states
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [levelFilter, setLevelFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState<string[]>([]);
    const [creatorFilter, setCreatorFilter] = useState('');
    const [updaterFilter, setUpdaterFilter] = useState('');

    const handleAddAdminArea = (newAdminLevelData: Omit<AdminLevel, 'id'>) => {
        const country = countries.find(c => c.countryCode === newAdminLevelData.countryCode);
        if (country) {
            const newId = (country.adminLevels.length > 0 ? Math.max(...country.adminLevels.map(al => al.id)) : 0) + 1;
            const updatedCountry = {
                ...country,
                adminLevels: [...country.adminLevels, { ...newAdminLevelData, id: newId }],
                updatedBy: 'Paul Mboya',
                updatedAt: new Date().toISOString()
            };
            onUpdateCountry(updatedCountry);
        }
    };
    
    const handleSaveDefinitions = (countryCode: string, levels: AdminLevelName[], count: number) => {
        const country = countries.find(c => c.countryCode === countryCode);
        if (country) {
            const updatedCountry = {
                ...country,
                adminLevelNames: levels,
                numberOfAdminLevels: count,
                updatedBy: 'Admin User',
                updatedAt: new Date().toISOString()
            };
            onUpdateCountry(updatedCountry);
        }
    };

    const uniqueFilterOptions = useMemo(() => {
        const levels = [...new Set(countries.map(c => c.numberOfAdminLevels).filter(Boolean) as number[])].sort((a, b) => a - b);
        const creators = [...new Set(countries.map(c => c.createdBy).filter(Boolean) as string[])].sort();
        const updaters = [...new Set(countries.map(c => c.updatedBy).filter(Boolean) as string[])].sort();
        return { levels, creators, updaters };
    }, [countries]);

    const filteredData = useMemo(() => {
        return countries
            .map(country => {
                const levelCounts = country.adminLevels.reduce((acc, level) => {
                    acc[level.level] = (acc[level.level] || 0) + 1;
                    return acc;
                }, {} as Record<number, number>);
                
                return {
                    ...country,
                    levelCounts,
                    totalAreas: country.adminLevels.length,
                };
            })
            .filter(country => {
                if (levelFilter && country.numberOfAdminLevels !== parseInt(levelFilter)) return false;
                if (countryFilter.length > 0 && !countryFilter.includes(country.name)) return false;
                if (creatorFilter && country.createdBy !== creatorFilter) return false;
                if (updaterFilter && country.updatedBy !== updaterFilter) return false;
                return true;
            });
    }, [countries, levelFilter, countryFilter, creatorFilter, updaterFilter]);

    const maxLevelsAcrossAll = useMemo(() => {
        return filteredData.reduce((max, country) => Math.max(max, country.numberOfAdminLevels || 0), 0);
    }, [filteredData]);

    const levelHeaders = Array.from({ length: maxLevelsAcrossAll }, (_, i) => i + 1);

    const handleResetFilters = () => {
        setLevelFilter('');
        setCountryFilter([]);
        setCreatorFilter('');
        setUpdaterFilter('');
    };

    // Sub-page level editor helper handlers
    const editingCountry = useMemo(() => {
        if (editingCountryId === null) return null;
        return countries.find(c => c.id === editingCountryId) || null;
    }, [countries, editingCountryId]);

    const activeAdminLevelsCount = editingCountry?.numberOfAdminLevels || 1;
    const safeActiveLevelTab = activeLevelTab > activeAdminLevelsCount ? 1 : activeLevelTab;

    const matchedLevelName = useMemo(() => {
        if (!editingCountry) return `Level ${safeActiveLevelTab}`;
        return editingCountry.adminLevelNames?.find(n => n.level === safeActiveLevelTab)?.name || `Level ${safeActiveLevelTab}`;
    }, [editingCountry, safeActiveLevelTab]);

    const tabs = useMemo(() => {
        if (!editingCountry) return [];
        return Array.from({ length: activeAdminLevelsCount }, (_, i) => {
            const levelNum = i + 1;
            const matchedName = editingCountry.adminLevelNames?.find(n => n.level === levelNum)?.name;
            return {
                level: levelNum,
                name: matchedName || `Level ${levelNum}`
            };
        });
    }, [editingCountry, activeAdminLevelsCount]);

    const currentTabAreas = useMemo(() => {
        if (!editingCountry) return [];
        return editingCountry.adminLevels.filter(al => al.level === safeActiveLevelTab);
    }, [editingCountry, safeActiveLevelTab]);

    const parentLevelAreas = useMemo(() => {
        if (!editingCountry || safeActiveLevelTab <= 1) return [];
        return editingCountry.adminLevels.filter(al => al.level === safeActiveLevelTab - 1);
    }, [editingCountry, safeActiveLevelTab]);

    const handleSaveLevelName = (level: number, newName: string) => {
        if (!editingCountry) return;
        const existingNames = editingCountry.adminLevelNames || [];
        const index = existingNames.findIndex(n => n.level === level);
        
        let updatedNames = [...existingNames];
        if (index > -1) {
            updatedNames[index] = { ...updatedNames[index], name: newName };
        } else {
            updatedNames.push({ level, name: newName });
        }
        
        const updatedCountry = {
            ...editingCountry,
            adminLevelNames: updatedNames,
            updatedBy: 'Paul Mboya',
            updatedAt: new Date().toISOString()
        };
        onUpdateCountry(updatedCountry);
    };

    const handleUpdateLevelCount = (newCount: number) => {
        if (!editingCountry || newCount < 1 || newCount > 15) return;
        const existingNames = editingCountry.adminLevelNames || [];
        const adjustedNames = Array.from({ length: newCount }, (_, i) => {
            const level = i + 1;
            const matched = existingNames.find(n => n.level === level);
            return {
                level,
                name: matched ? matched.name : `Level ${level}`
            };
        });

        const updatedCountry = {
            ...editingCountry,
            numberOfAdminLevels: newCount,
            adminLevelNames: adjustedNames,
            updatedBy: 'Paul Mboya',
            updatedAt: new Date().toISOString()
        };
        onUpdateCountry(updatedCountry);
    };

    const handleUpdateArea = (areaId: number, name: string, parentAdminLevelId?: number) => {
        if (!editingCountry) return;
        const updatedAreas = editingCountry.adminLevels.map(al => {
            if (al.id === areaId) {
                return {
                    ...al,
                    name: name.trim(),
                    parentAdminLevelId: parentAdminLevelId
                };
            }
            return al;
        });

        const updatedCountry = {
            ...editingCountry,
            adminLevels: updatedAreas,
            updatedBy: 'Paul Mboya',
            updatedAt: new Date().toISOString()
        };
        onUpdateCountry(updatedCountry);
    };

    const handleDeleteArea = (areaId: number) => {
        if (!editingCountry) return;
        const updatedAreas = editingCountry.adminLevels.filter(al => al.id !== areaId);
        const updatedCountry = {
            ...editingCountry,
            adminLevels: updatedAreas,
            updatedBy: 'Paul Mboya',
            updatedAt: new Date().toISOString()
        };
        onUpdateCountry(updatedCountry);
    };

    const handleAddNewArea = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCountry || !newAreaName.trim()) return;
        
        const maxId = editingCountry.adminLevels.length > 0 
            ? Math.max(...editingCountry.adminLevels.map(al => al.id)) 
            : 0;
        
        const newArea: AdminLevel = {
            id: maxId + 1,
            name: newAreaName.trim(),
            level: safeActiveLevelTab,
            countryCode: editingCountry.countryCode,
            parentAdminLevelId: newAreaParentId ? parseInt(newAreaParentId, 10) : undefined
        };

        const updatedCountry = {
            ...editingCountry,
            adminLevels: [...editingCountry.adminLevels, newArea],
            updatedBy: 'Paul Mboya',
            updatedAt: new Date().toISOString()
        };

        onUpdateCountry(updatedCountry);
        setNewAreaName('');
        setNewAreaParentId('');
    };

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <>
            <AddAdminLevelModal isOpen={isAddAreaModalOpen} onClose={() => setIsAddAreaModalOpen(false)} onSave={handleAddAdminArea} theme={theme} countries={countries} />
            <DefineAdminLevelsModal isOpen={isDefineLevelsModalOpen} onClose={() => setIsDefineLevelsModalOpen(false)} onSave={handleSaveDefinitions} theme={theme} countryToDefine={countryToDefine} />
            
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm transition-all duration-300`}>
                {editingCountryId !== null && editingCountry ? (
                    /* Dynamic sub-page for editing country admin levels and names */
                    <div className="space-y-6">
                        <button 
                            onClick={() => setEditingCountryId(null)} 
                            className={`flex items-center space-x-2 text-sm font-bold pb-2 hover:opacity-80 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                        >
                            <Icon name="chevron-left" className="h-4 w-4" />
                            <span>Back to Country Admin Levels</span>
                        </button>

                        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                            <div className="flex items-center space-x-3.5">
                                <FlagIcon countryCode={editingCountry.countryCode} countryName={editingCountry.name} />
                                <div>
                                    <h2 className="text-2xl font-bold">{editingCountry.name}</h2>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Manage level depths, custom naming, and administrative area configurations.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-md">
                                <Icon name="shield-check" className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-semibold font-mono text-slate-400">
                                    Paul Mboya
                                </span>
                            </div>
                        </div>

                        {/* Enable Custom Naming of Levels */}
                        <div className={`p-5 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center space-x-2 mb-4">
                                <Icon name="adjustments" className="h-5 w-5 text-yellow-500" />
                                <h3 className="font-bold text-base">Level Name Customization</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Array.from({ length: editingCountry.numberOfAdminLevels || 1 }, (_, i) => {
                                    const levelNum = i + 1;
                                    const existingNameObj = editingCountry.adminLevelNames?.find(n => n.level === levelNum);
                                    const currentName = existingNameObj?.name || '';
                                    return (
                                        <div key={levelNum} className="flex flex-col space-y-1 bg-slate-900/10 dark:bg-black/15 p-2.5 rounded border border-slate-700/20">
                                            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Level {levelNum}</label>
                                            <div className="flex space-x-1.5">
                                                <input
                                                    type="text"
                                                    defaultValue={currentName}
                                                    placeholder={`Level ${levelNum}`}
                                                    id={`level-name-input-${levelNum}`}
                                                    className={`flex-1 text-xs rounded border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${
                                                        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-950'
                                                    }`}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const inputElement = document.getElementById(`level-name-input-${levelNum}`) as HTMLInputElement;
                                                        const newName = inputElement ? inputElement.value : '';
                                                        handleSaveLevelName(levelNum, newName);
                                                    }}
                                                    className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-black rounded transition-colors"
                                                    title="Save"
                                                >
                                                    Rename
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-dashed border-slate-700/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <span className="text-xs text-slate-400">Add or remove levels from the hierarchy index</span>
                                <div className="flex items-center space-x-2 self-end sm:self-auto">
                                    <button 
                                        disabled={(editingCountry.numberOfAdminLevels || 1) <= 1}
                                        onClick={() => handleUpdateLevelCount((editingCountry.numberOfAdminLevels || 1) - 1)}
                                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded"
                                    >
                                        - Decrease Level
                                    </button>
                                    <span className="text-sm font-bold font-mono px-3 py-1 bg-slate-950 text-white rounded">
                                        {editingCountry.numberOfAdminLevels || 1}
                                    </span>
                                    <button 
                                        disabled={(editingCountry.numberOfAdminLevels || 1) >= 15}
                                        onClick={() => handleUpdateLevelCount((editingCountry.numberOfAdminLevels || 1) + 1)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded"
                                    >
                                        + Increase Level
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Each Level represented by a selected Tab ("tap") */}
                        <div>
                            <div className="flex border-b border-slate-700 mb-4 overflow-x-auto scroller-mini">
                                {tabs.map(tab => {
                                    const isSelected = tab.level === safeActiveLevelTab;
                                    return (
                                        <button
                                            key={tab.level}
                                            onClick={() => setActiveLevelTab(tab.level)}
                                            className={`py-3 px-5 font-bold text-sm whitespace-nowrap transition-all border-b-2 -mb-px flex items-center space-x-2 ${
                                                isSelected
                                                    ? 'border-yellow-500 text-yellow-500'
                                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            <span>{tab.name}</span>
                                            <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                                Lvl {tab.level}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* List of custom administrative areas belonging to selected Level represented in Rows */}
                            <div className="border border-slate-800 rounded-lg overflow-hidden mb-6">
                                <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center">
                                    <h4 className="font-semibold text-xs tracking-wider uppercase text-slate-400">
                                        Editing administrative areas of type: <span className="text-yellow-500">{matchedLevelName}</span>
                                    </h4>
                                    <span className="text-xs font-bold font-mono text-slate-400">
                                        {currentTabAreas.length} Areas Listed
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                        <thead className={theme === 'dark' ? 'bg-slate-800/40' : 'bg-slate-50'}>
                                            <tr>
                                                <th scope="col" className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Area ID
                                                </th>
                                                <th scope="col" className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Administrative Area Name
                                                </th>
                                                {safeActiveLevelTab > 1 && (
                                                    <th scope="col" className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        Parent Area ({tabs[safeActiveLevelTab - 2]?.name || `Level ${safeActiveLevelTab - 1}`})
                                                    </th>
                                                )}
                                                <th scope="col" className={`px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800 bg-slate-900/10' : 'divide-slate-200 bg-white'}`}>
                                            {currentTabAreas.length === 0 ? (
                                                <tr>
                                                    <td colSpan={safeActiveLevelTab > 1 ? 4 : 3} className="px-4 py-8 text-center text-slate-500 text-sm">
                                                        No areas defined yet for this level. Use the form below to add one!
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentTabAreas.map((area) => (
                                                    <tr key={area.id} className="hover:bg-slate-800/10 transition-colors">
                                                        <td className="px-4 py-3 text-xs font-mono text-slate-500">
                                                            #{area.id}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                defaultValue={area.name}
                                                                id={`area-name-input-${area.id}`}
                                                                className={`w-full max-w-md text-sm rounded border px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${
                                                                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                                                                }`}
                                                            />
                                                        </td>
                                                        {safeActiveLevelTab > 1 && (
                                                            <td className="px-4 py-3">
                                                                <select
                                                                    defaultValue={area.parentAdminLevelId || ''}
                                                                    id={`area-parent-select-${area.id}`}
                                                                    className={`w-full max-w-xs text-xs rounded border px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${
                                                                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                                                                    }`}
                                                                >
                                                                    <option value="">-- No Parent Selected --</option>
                                                                    {parentLevelAreas.map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end space-x-1.5">
                                                                <button
                                                                    onClick={() => {
                                                                        const nameInput = document.getElementById(`area-name-input-${area.id}`) as HTMLInputElement;
                                                                        const parentSelect = document.getElementById(`area-parent-select-${area.id}`) as HTMLSelectElement;
                                                                        const updatedName = nameInput ? nameInput.value.trim() : '';
                                                                        const updatedParentId = parentSelect && parentSelect.value ? parseInt(parentSelect.value, 10) : undefined;
                                                                        if (updatedName) {
                                                                            handleUpdateArea(area.id, updatedName, updatedParentId);
                                                                        }
                                                                    }}
                                                                    className="px-2.5 py-1 bg-yellow-500 text-slate-950 rounded font-bold text-xs flex items-center space-x-1 hover:bg-yellow-600 transition-colors"
                                                                    title="Save Row"
                                                                >
                                                                    <Icon name="check" className="h-3 w-3" />
                                                                    <span>Save</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteArea(area.id)}
                                                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs flex items-center space-x-1 transition-colors"
                                                                    title="Delete Row"
                                                                >
                                                                    <Icon name="trash" className="h-3 w-3" />
                                                                    <span>Delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Easy-to-use add area form inside/below active level tab */}
                            <form onSubmit={handleAddNewArea} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col md:flex-row items-end gap-4`}>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                                        Add New Area to {matchedLevelName}
                                    </label>
                                    <input
                                        type="text"
                                        value={newAreaName}
                                        onChange={e => setNewAreaName(e.target.value)}
                                        placeholder={`e.g., Central ${matchedLevelName}`}
                                        className={`w-full text-sm rounded border px-3 py-2 ${commonInputClasses} ${commonFocusClasses}`}
                                        required
                                    />
                                </div>
                                
                                {safeActiveLevelTab > 1 && (
                                    <div className="w-full md:w-72">
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                                            Parent Area ({tabs[safeActiveLevelTab - 2]?.name})
                                        </label>
                                        <select
                                            value={newAreaParentId}
                                            onChange={e => setNewAreaParentId(e.target.value)}
                                            className={`w-full text-sm rounded border px-3 py-2 ${commonInputClasses} ${commonFocusClasses}`}
                                        >
                                            <option value="">-- Select Parent --</option>
                                            {parentLevelAreas.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-sm font-bold rounded flex items-center space-x-1.5 w-full md:w-auto h-10 justify-center shadow"
                                >
                                    <Icon name="plus" className="h-4 w-4" />
                                    <span>Add Area</span>
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* Default List/Table view of Countries */
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Country Administrative Levels</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsAddAreaModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600">
                                   <Icon name="plus" className="h-4 w-4" />
                                   <span>Add Admin Area</span>
                                </button>
                            </div>
                        </div>

                        <div className={`${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} border rounded-lg mb-6`}>
                            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsFilterVisible(!isFilterVisible)}>
                                <div className="flex items-center">
                                    <Icon name="filter" className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                                    <h3 className="font-semibold">Filters</h3>
                                </div>
                                <Icon name="chevron-down" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
                            </div>
                            {isFilterVisible && (
                                <div className={`border-t p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Number of Levels</label>
                                            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className={`w-full text-sm px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}>
                                                <option value="">All</option>
                                                {uniqueFilterOptions.levels.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Countries</label>
                                            <MultiSelectDropdown theme={theme} options={countries.map(c => c.name)} selected={countryFilter} onChange={setCountryFilter} placeholder="Select countries" />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Added By</label>
                                            <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)} className={`w-full text-sm px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}>
                                                <option value="">All</option>
                                                {uniqueFilterOptions.creators.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Updated By</label>
                                            <select value={updaterFilter} onChange={e => setUpdaterFilter(e.target.value)} className={`w-full text-sm px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}>
                                                <option value="">All</option>
                                                {uniqueFilterOptions.updaters.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={handleResetFilters} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                                            <Icon name="refresh" className="h-4 w-4" />
                                            <span>Reset</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                                <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                    <tr>
                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Country</th>
                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Areas</th>
                                        {levelHeaders.map(levelNum => (
                                            <th key={levelNum} scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Level {levelNum}</th>
                                        ))}
                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                    {filteredData.map(country => (
                                        <tr key={country.id} className="hover:bg-slate-800/5 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FlagIcon countryCode={country.countryCode} countryName={country.name} />
                                                    <span className={`ml-3 font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{country.name}</span>
                                                </div>
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{country.totalAreas}</td>
                                            {levelHeaders.map(levelNum => {
                                                const count = country.levelCounts[levelNum] || 0;
                                                const levelName = country.adminLevelNames?.find(n => n.level === levelNum)?.name;
                                                const isDefinedForCountry = levelNum <= (country.numberOfAdminLevels || 0);
                                                return (
                                                    <td key={levelNum} className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {isDefinedForCountry ? (
                                                            <>
                                                                {levelName && <div className="text-xs truncate max-w-[120px]" title={levelName}>{levelName}</div>}
                                                                <div className="font-semibold">{count}</div>
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-500">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button 
                                                    onClick={() => { 
                                                        setEditingCountryId(country.id); 
                                                        setActiveLevelTab(1); 
                                                    }} 
                                                    title="Manage Levels & Areas" 
                                                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'} transition-all`}
                                                >
                                                    <Icon name="edit" className="h-5 w-5"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CountryAdminLevelsPage;

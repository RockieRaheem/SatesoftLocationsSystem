import React, { useState } from 'react';
import { Theme, RegionalEconomicLevel, Country } from '../types';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';

interface RegionalEconomicLevelsPageProps {
    theme: Theme;
    regionalLevels: RegionalEconomicLevel[];
    countries: Country[];
    onSave: (level: RegionalEconomicLevel) => Promise<void>;
    onDelete: (id: number, remarks?: string) => Promise<void>;
}

const RegionalEconomicLevelsPage: React.FC<RegionalEconomicLevelsPageProps> = ({ theme, regionalLevels, countries, onSave, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<RegionalEconomicLevel | null>(null);
    const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | null>(null);
    const [hoveredLevelId, setHoveredLevelId] = useState<number | null>(null);
    const [formData, setFormData] = useState<RegionalEconomicLevel | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [viewMode, setViewMode] = useState<'regions' | 'countries'>('regions');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [levelToDelete, setLevelToDelete] = useState<RegionalEconomicLevel | null>(null);
    const [error, setError] = useState<string | null>(null);

    const filteredLevels = regionalLevels
        .filter(level => 
            level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            level.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleCloseModal = () => {
        setModalType(null);
        setSelectedLevel(null);
        setFormData(null);
        setShowCountrySelector(false);
    };

    const handleCreate = () => {
        const newLevel: RegionalEconomicLevel = {
            id: Math.floor(Math.random() * 1000000),
            name: '',
            abbreviation: '',
            description: '',
            flag: 'https://picsum.photos/seed/africa/200/120',
            countries: [],
            color: '#eab308' // Default yellow-500
        };
        setSelectedLevel(newLevel);
        setFormData(newLevel);
        setModalType('create');
    };

    const handleEdit = (level: RegionalEconomicLevel) => {
        setSelectedLevel(level);
        setFormData({ ...level });
        setModalType('edit');
    };

    const handleSave = async () => {
        if (!formData) return;
        setIsSaving(true);
        try {
            await onSave(formData);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setSearchTerm('');
                setViewMode('regions');
                handleCloseModal();
            }, 1500);
        } catch (error) {
            console.error("Failed to save regional level", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleCountry = (countryName: string) => {
        if (!formData) return;
        const isSelected = formData.countries.includes(countryName);
        const newCountries = isSelected
            ? formData.countries.filter(c => c !== countryName)
            : [...formData.countries, countryName];
        
        setFormData({
            ...formData,
            countries: newCountries
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        // Keep legacy inline flag images bounded until they move to object storage.
        if (file.size > 200 * 1024) {
            setError("Image is too large. Please select an image under 200KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (formData) {
                setFormData({
                    ...formData,
                    flag: reader.result as string
                });
            }
        };
        reader.readAsDataURL(file);
    };

    const getCountryRegion = (countryName: string) => {
        const region = regionalLevels.find(rl => rl.countries.includes(countryName));
        return region ? region.abbreviation : null;
    };

    const handleRemoveCountry = (countryName: string) => {
        if (!formData) return;
        setFormData({
            ...formData,
            countries: formData.countries.filter(c => c !== countryName)
        });
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Regional Economic Levels</h1>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Manage and view Regional Economic Communities (RECs)</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
                            <button 
                                onClick={() => setViewMode('regions')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'regions' ? 'bg-white dark:bg-slate-700 text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Regions
                            </button>
                            <button 
                                onClick={() => setViewMode('countries')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'countries' ? 'bg-white dark:bg-slate-700 text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Countries
                            </button>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search regions..."
                                className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleCreate}
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-slate-900 rounded-md text-sm font-bold hover:bg-yellow-400 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Icon name="plus" className="w-4 h-4" />
                            <span>Create Region</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`flex-grow overflow-auto border rounded-xl shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                {viewMode === 'regions' ? (
                    <table className="w-full text-left border-collapse">
                        <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <tr>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Flag</th>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Region Name</th>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Abbreviation</th>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Color</th>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Countries</th>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b text-right ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {filteredLevels.map((level) => (
                                <tr key={level.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-12 h-8 rounded overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                            <img src={level.flag} alt={`${level.abbreviation} Flag`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{level.name}</span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>
                                        {level.abbreviation}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <div 
                                                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm"
                                                style={{ backgroundColor: level.color }}
                                            />
                                            <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {level.color}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap relative">
                                        <div 
                                            onMouseEnter={() => setHoveredLevelId(level.id)}
                                            onMouseLeave={() => setHoveredLevelId(null)}
                                            className="inline-block cursor-help"
                                        >
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {level.countries.length} Countries
                                            </span>
                                            
                                            {hoveredLevelId === level.id && (
                                                <div className={`absolute left-6 top-full mt-1 z-20 w-48 p-3 rounded-lg shadow-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Member Countries</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {level.countries.slice(0, 10).map(cName => {
                                                            const country = countries.find(c => c.name === cName);
                                                            return (
                                                                <div key={cName} className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                                                    {country && <img src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`} alt="" className="w-2.5 h-auto" referrerPolicy="no-referrer" />}
                                                                    <span className="truncate max-w-[60px]">{cName}</span>
                                                                </div>
                                                            );
                                                        })}
                                                        {level.countries.length > 10 && (
                                                            <span className="text-[9px] text-slate-500">+{level.countries.length - 10} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button 
                                                onClick={() => { setSelectedLevel(level); setModalType('view'); }}
                                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-yellow-600 hover:bg-yellow-50'}`}
                                                title="View Details"
                                            >
                                                <Icon name="view" className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(level)}
                                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                                                title="Edit Region"
                                            >
                                                <Icon name="edit" className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setLevelToDelete(level);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-400/10' : 'text-red-600 hover:bg-red-50'}`}
                                                title="Delete Region"
                                            >
                                                <Icon name="trash" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLevels.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={`px-6 py-10 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        No regions found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <tr>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Country</th>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Assigned Region</th>
                                <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Region Name</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {countries
                                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((country) => {
                                    const region = regionalLevels.find(rl => rl.countries.includes(country.name));
                                    return (
                                        <tr key={country.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <img src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`} alt="" className="w-5 h-auto shadow-sm" referrerPolicy="no-referrer" />
                                                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{country.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {region ? (
                                                    <div className="flex items-center space-x-2">
                                                        <img src={region.flag} alt="" className="w-6 h-4 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                                                        <span className={`font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>{region.abbreviation}</span>
                                                    </div>
                                                ) : (
                                                    <span className={`text-xs italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Not Assigned</span>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {region ? region.name : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setLevelToDelete(null);
                }}
                onConfirm={(remarks) => {
                    if (levelToDelete) {
                        onDelete(levelToDelete.id, remarks);
                        console.log(`Deleted region ${levelToDelete.abbreviation} with remarks: ${remarks}`);
                    }
                    setDeleteModalOpen(false);
                    setLevelToDelete(null);
                }}
                title="Delete Regional Economic Level"
                message={`Are you sure you want to delete ${levelToDelete?.name} (${levelToDelete?.abbreviation})? This action cannot be undone. All member countries will become unmapped.`}
                theme={theme}
                confirmText="Delete Region"
                showRemarks={true}
            />

            {/* View/Edit/Create Modal */}
            {modalType && selectedLevel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                        <div className={`px-8 py-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                                    <Icon name={modalType === 'view' ? 'view' : (modalType === 'edit' ? 'edit' : 'plus')} className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                                        {modalType === 'view' ? 'Region Overview' : (modalType === 'edit' ? 'Edit Regional Level' : 'Create New Regional Level')}
                                    </h2>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {modalType === 'view' ? 'Comprehensive details of the regional economic community' : 'Fill in the details below to update the regional information'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className={`p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar relative">
                            {error && (
                                <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                    <Icon name="exclamation-triangle" className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            {showSuccess && (
                                <div className="absolute inset-0 z-40 flex items-center justify-center bg-inherit/80 backdrop-blur-sm">
                                    <div className={`p-6 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 transform animate-bounce ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                                            <Icon name="check-circle" className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                                                {modalType === 'create' ? 'Region Created!' : 'Changes Saved!'}
                                            </h3>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                The regional data has been synchronized.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className={`block text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Abbreviation</label>
                                            {modalType === 'view' ? (
                                                <div className={`px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'} font-bold text-lg`}>
                                                    {selectedLevel.abbreviation}
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    value={formData?.abbreviation || ''} 
                                                    onChange={(e) => setFormData(prev => prev ? { ...prev, abbreviation: e.target.value } : null)}
                                                    placeholder="e.g. EAC" 
                                                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`} 
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className={`block text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</label>
                                            {modalType === 'view' ? (
                                                <div className={`px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'} text-sm`}>
                                                    {selectedLevel.name}
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    value={formData?.name || ''} 
                                                    onChange={(e) => setFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                    placeholder="e.g. East African Community" 
                                                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`} 
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`block text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Description</label>
                                        {modalType === 'view' ? (
                                            <div className={`px-4 py-4 rounded-xl border leading-relaxed ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'} text-sm`}>
                                                {selectedLevel.description}
                                            </div>
                                        ) : (
                                            <textarea 
                                                rows={5} 
                                                value={formData?.description || ''} 
                                                onChange={(e) => setFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                placeholder="Describe the regional economic community..." 
                                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`} 
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className={`block text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Member Countries ({(modalType === 'view' ? selectedLevel : formData)?.countries.length || 0})</label>
                                            {modalType !== 'view' && (
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setShowCountrySelector(!showCountrySelector)}
                                                        className="text-xs font-bold text-yellow-600 hover:text-yellow-700 flex items-center space-x-1"
                                                    >
                                                        <Icon name="plus" className="w-3 h-3" />
                                                        <span>Add Country</span>
                                                    </button>
                                                    
                                                    {showCountrySelector && (
                                                        <div className={`absolute right-0 top-full mt-2 z-30 w-72 max-h-80 overflow-y-auto rounded-xl shadow-2xl border p-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                            <div className="sticky top-0 pb-2 mb-2 border-b border-slate-700/50 bg-inherit flex justify-between items-center px-2">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Countries</p>
                                                                <button 
                                                                    onClick={() => setShowCountrySelector(false)}
                                                                    className="text-[10px] font-bold text-yellow-500 hover:text-yellow-400"
                                                                >
                                                                    Done
                                                                </button>
                                                            </div>
                                                            <div className="space-y-1">
                                                                {countries
                                                                    .map(country => {
                                                                        const existingRegion = getCountryRegion(country.name);
                                                                        const isSelected = formData?.countries.includes(country.name);
                                                                        return (
                                                                            <button
                                                                                key={country.id}
                                                                                onClick={() => handleToggleCountry(country.name)}
                                                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'} ${isSelected ? (theme === 'dark' ? 'bg-slate-700/50' : 'bg-yellow-50') : ''}`}
                                                                            >
                                                                                <div className="flex items-center space-x-3">
                                                                                    <input 
                                                                                        type="checkbox" 
                                                                                        checked={isSelected} 
                                                                                        readOnly 
                                                                                        className="h-3 w-3 rounded text-yellow-500 focus:ring-yellow-500 accent-yellow-500"
                                                                                    />
                                                                                    <img src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`} alt="" className="w-4 h-auto" referrerPolicy="no-referrer" />
                                                                                    <span className={isSelected ? 'font-bold text-yellow-600' : ''}>{country.name}</span>
                                                                                </div>
                                                                                {existingRegion && (
                                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${theme === 'dark' ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                                                                        {existingRegion}
                                                                                    </span>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {(modalType === 'view' ? selectedLevel : formData)?.countries.map((countryName) => {
                                                const country = countries.find(c => c.name === countryName);
                                                return (
                                                    <div key={countryName} className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            {country && (
                                                                <img 
                                                                    src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`}
                                                                    alt={countryName}
                                                                    className="w-5 h-auto rounded-sm shadow-sm"
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                            )}
                                                            <span className={`text-xs truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{countryName}</span>
                                                        </div>
                                                        {modalType !== 'view' && (
                                                            <button 
                                                                onClick={() => handleRemoveCountry(countryName)}
                                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Icon name="close" className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className={`block text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Regional Flag</label>
                                        <div className={`relative aspect-[3/2] rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center p-2 group transition-all ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <img src={(modalType === 'view' ? selectedLevel : formData)?.flag} alt="Flag" className="w-full h-full object-cover rounded-xl shadow-lg" referrerPolicy="no-referrer" />
                                            {modalType !== 'view' && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                                                    <input 
                                                        type="file" 
                                                        id="flag-upload" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                    <label 
                                                        htmlFor="flag-upload"
                                                        className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-xl cursor-pointer hover:bg-slate-100 transition-colors"
                                                    >
                                                        Upload Flag
                                                    </label>
                                                    <button 
                                                        onClick={() => {
                                                            const newSeed = Math.random().toString(36).substring(7);
                                                            setFormData(prev => prev ? { ...prev, flag: `https://picsum.photos/seed/${newSeed}/200/120` } : null);
                                                        }}
                                                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xl hover:bg-slate-700 transition-colors"
                                                    >
                                                        Random Flag
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-yellow-50/50 border-yellow-100'}`}>
                                        <h4 className={`text-sm font-bold mb-4 flex items-center space-x-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                            <Icon name="analytics" className="w-4 h-4 text-yellow-500" />
                                            <span>Quick Stats</span>
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Countries</span>
                                                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{(modalType === 'view' ? selectedLevel : formData)?.countries.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Region Color</span>
                                                {modalType === 'view' ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: selectedLevel.color }} />
                                                        <span className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{selectedLevel.color}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <input 
                                                            type="color" 
                                                            value={formData?.color || '#eab308'}
                                                            onChange={(e) => setFormData(prev => prev ? { ...prev, color: e.target.value } : null)}
                                                            className="w-8 h-8 rounded border-0 p-0 bg-transparent cursor-pointer"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={formData?.color || '#eab308'}
                                                            onChange={(e) => setFormData(prev => prev ? { ...prev, color: e.target.value } : null)}
                                                            className={`text-xs font-mono font-bold rounded p-1 w-20 ${theme === 'dark' ? 'bg-slate-700 text-slate-100 border-slate-600' : 'bg-white text-slate-900 border-slate-200'}`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
                                                <span className="flex items-center space-x-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    <span className={`text-xs font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>Active</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`px-8 py-5 border-t flex justify-end space-x-4 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                            <button 
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${theme === 'dark' ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'} disabled:opacity-50`}
                            >
                                {modalType === 'view' ? 'Close' : 'Cancel'}
                            </button>
                            {modalType !== 'view' && (
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving || !formData?.name || !formData?.abbreviation}
                                    className="px-6 py-2.5 bg-yellow-500 text-slate-900 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {isSaving && <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>}
                                    <span>{modalType === 'edit' ? 'Save Changes' : 'Create Region'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegionalEconomicLevelsPage;

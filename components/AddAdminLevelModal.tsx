import React, { useState, useMemo, useEffect } from 'react';
import { Country, Theme, AdminLevel } from '../types';
import Icon from './Icon';

interface AddAdminLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AdminLevel, 'id'>) => void;
  theme: Theme;
  countries: Country[];
}

const AddAdminLevelModal: React.FC<AddAdminLevelModalProps> = ({ isOpen, onClose, onSave, theme, countries }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adminLevel, setAdminLevel] = useState({
        countryCode: '',
        name: '',
        level: '1',
        parentAdminLevelId: '',
    });

    const availableParents = useMemo(() => {
        if (!adminLevel.countryCode) return [];
        const selectedCountry = countries.find(c => c.countryCode === adminLevel.countryCode);
        return selectedCountry?.adminLevels || [];
    }, [adminLevel.countryCode, countries]);

    useEffect(() => {
        // Reset parent if country changes
        setAdminLevel(prev => ({ ...prev, parentAdminLevelId: '' }));
    }, [adminLevel.countryCode]);
    
    const resetForm = () => {
        setAdminLevel({ countryCode: '', name: '', level: '1', parentAdminLevelId: '' });
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
        if (!adminLevel.countryCode || !adminLevel.name) {
            setError('Please select a country and provide a level name.');
            return;
        }
        onSave({
            countryCode: adminLevel.countryCode,
            name: adminLevel.name,
            level: parseInt(adminLevel.level, 10),
            parentAdminLevelId: adminLevel.parentAdminLevelId ? parseInt(adminLevel.parentAdminLevelId, 10) : undefined
        });
        handleClose();
    };
    
    if (!isOpen && !isClosing) return null;
    
    const commonInputClasses = theme === 'dark'
        ? 'bg-slate-800 border-slate-700 text-slate-200'
        : 'bg-white border-slate-300 text-slate-900';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Add Admin Level</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="p-3 rounded-md bg-red-100 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <Icon name="exclamation-triangle" className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Country</label>
                        <select name="countryCode" value={adminLevel.countryCode} onChange={e => setAdminLevel(prev => ({ ...prev, countryCode: e.target.value }))} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}>
                            <option value="">Select a country</option>
                            {countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Level Tier (e.g., 1 for Region, 2 for District)</label>
                        <input type="number" name="level" value={adminLevel.level} onChange={e => setAdminLevel(prev => ({ ...prev, level: e.target.value }))} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                    </div>
                     <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Level Name</label>
                        <input type="text" name="name" value={adminLevel.name} onChange={e => setAdminLevel(prev => ({ ...prev, name: e.target.value }))} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Parent Level (Optional)</label>
                        <select name="parentAdminLevelId" value={adminLevel.parentAdminLevelId} onChange={e => setAdminLevel(prev => ({ ...prev, parentAdminLevelId: e.target.value }))} disabled={!adminLevel.countryCode || availableParents.length === 0} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses} disabled:opacity-50`}>
                            <option value="">None (Top-level)</option>
                            {availableParents.map(p => <option key={p.id} value={p.id}>{p.name} (Lvl {p.level})</option>)}
                        </select>
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                        Save Level
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AddAdminLevelModal;
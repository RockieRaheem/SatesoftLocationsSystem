import React, { useState, useEffect } from 'react';
import { Country, Theme } from '../types';
import Icon from './Icon';

interface SetCountryLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (countryCode: string, count: number) => void;
  theme: Theme;
  countries: Country[];
}

const SetCountryLevelsModal: React.FC<SetCountryLevelsModalProps> = ({ isOpen, onClose, onSave, theme, countries }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [levelCount, setLevelCount] = useState<number | string>(1);

    useEffect(() => {
        if (selectedCountryCode) {
            const country = countries.find(c => c.countryCode === selectedCountryCode);
            setLevelCount(country?.numberOfAdminLevels || 1);
        }
    }, [selectedCountryCode, countries]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setSelectedCountryCode('');
            setLevelCount(1);
        }, 300);
    };

    const handleSave = () => {
        const count = Number(levelCount);
        if (!selectedCountryCode || isNaN(count) || count < 1 || count > 15) {
            alert('Please select a country and enter a valid number of levels (1-15).');
            return;
        }
        onSave(selectedCountryCode, count);
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Set Number of Levels</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Country</label>
                        <select value={selectedCountryCode} onChange={e => setSelectedCountryCode(e.target.value)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}>
                            <option value="">Select a country</option>
                            {countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Number of Administrative Levels</label>
                        <input
                            type="number"
                            value={levelCount}
                            onChange={e => setLevelCount(e.target.value)}
                            min="1"
                            max="15"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}
                            disabled={!selectedCountryCode}
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={!selectedCountryCode} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetCountryLevelsModal;
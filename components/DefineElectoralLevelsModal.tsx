
import React, { useState, useEffect } from 'react';
import { Country, Theme, ElectoralLevelName } from '../types';
import Icon from './Icon';

interface DefineElectoralLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (countryCode: string, levels: ElectoralLevelName[], count: number) => void;
  theme: Theme;
  countryToDefine: Country | null;
}

const DefineElectoralLevelsModal: React.FC<DefineElectoralLevelsModalProps> = ({ isOpen, onClose, onSave, theme, countryToDefine }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [levels, setLevels] = useState<Omit<ElectoralLevelName, 'level'>[]>([]);
    const [levelCount, setLevelCount] = useState<number>(1);

    useEffect(() => {
        if (isOpen && countryToDefine) {
            const initialCount = countryToDefine.numberOfElectoralLevels || 1;
            setLevelCount(initialCount);

            const existingNames = countryToDefine.electoralLevelNames || [];
            const initialLevels = Array.from({ length: initialCount }, (_, i) => {
                return { name: existingNames.find(n => n.level === i + 1)?.name || '' };
            });
            setLevels(initialLevels);
        }
    }, [isOpen, countryToDefine]);

    const handleLevelCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let count = parseInt(e.target.value, 10);
        if (isNaN(count)) count = 1;
        if (count < 1) count = 1;
        if (count > 10) count = 10; // Reasonable limit
        
        setLevelCount(count);

        setLevels(currentLevels => {
            return Array.from({ length: count }, (_, i) => ({
                name: currentLevels[i]?.name || ''
            }));
        });
    };

    const handleLevelNameChange = (index: number, name: string) => {
        const newLevels = [...levels];
        newLevels[index] = { name };
        setLevels(newLevels);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setLevels([]);
        }, 300);
    };

    const handleSave = () => {
        setError(null);
        if (!countryToDefine || levels.some(l => !l.name.trim())) {
            setError('Please ensure all level names are filled.');
            return;
        }
        const formattedLevels = levels.map((l, i) => ({ level: i + 1, name: l.name }));
        onSave(countryToDefine.countryCode, formattedLevels, levelCount);
        handleClose();
    };

    if (!isOpen && !isClosing || !countryToDefine) return null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        Define Electoral Levels for {countryToDefine.name}
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {error && (
                        <div className="p-3 rounded-md bg-red-100 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <Icon name="exclamation-triangle" className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Number of Electoral Levels</label>
                        <input
                            type="number"
                            value={levelCount}
                            onChange={handleLevelCountChange}
                            min="1"
                            max="10"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Level Names (from highest to lowest)</label>
                        <div className="space-y-3">
                            {levels.map((level, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <label className={`font-semibold w-12 text-right ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Lvl {index + 1}:</label>
                                    <input
                                        type="text"
                                        value={level.name}
                                        onChange={e => handleLevelNameChange(index, e.target.value)}
                                        placeholder={`e.g., Presidential, Parliamentary...`}
                                        className={`flex-grow block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                        Save Levels
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DefineElectoralLevelsModal;

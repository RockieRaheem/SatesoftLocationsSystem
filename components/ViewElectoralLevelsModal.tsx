
import React, { useState, useEffect } from 'react';
import { Country, Theme } from '../types';
import Icon from './Icon';

interface ViewElectoralLevelsModalProps {
    isOpen: boolean;
    onClose: () => void;
    country: Country | null;
    theme: Theme;
}

const ViewElectoralLevelsModal: React.FC<ViewElectoralLevelsModalProps> = ({ isOpen, onClose, country, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen && !isClosing || !country) return null;

    const levels = country.electoralLevelNames || [];

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            Electoral Levels
                        </h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.name}</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {levels.length > 0 ? (
                        <ul className="space-y-3">
                            {levels.sort((a, b) => a.level - b.level).map((level) => (
                                <li key={level.level} className={`flex items-center p-3 rounded-md border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold mr-3 ${theme === 'dark' ? 'bg-slate-700 text-yellow-500' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {level.level}
                                    </span>
                                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {level.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={`text-center p-6 rounded-lg border border-dashed ${theme === 'dark' ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                            <Icon name="info" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No electoral levels configured for this country.</p>
                        </div>
                    )}
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewElectoralLevelsModal;

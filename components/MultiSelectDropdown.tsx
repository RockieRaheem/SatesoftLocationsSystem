import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface MultiSelectDropdownProps {
    theme: Theme;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ theme, options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    const handleToggleOption = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const getButtonLabel = () => {
        if (selected.length === 0) return placeholder;
        if (selected.length === 1) return selected[0];
        return `${selected.length} selected`;
    };

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`mt-1 block w-full px-3 py-2 text-sm text-left rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 flex justify-between items-center ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            >
                <span>{getButtonLabel()}</span>
                <Icon name="chevron-up-down" className="h-4 w-4 text-slate-400" />
            </button>
            {isOpen && (
                <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                    <div className="p-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full text-sm pl-10 pr-4 py-2 border rounded-md ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-yellow-500`}
                            />
                        </div>
                    </div>
                    <ul className="py-1 max-h-48 overflow-y-auto">
                        {filteredOptions.map(option => (
                            <li key={option} className={`px-3 py-2 text-sm cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`} onClick={() => handleToggleOption(option)}>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        readOnly
                                        className={`h-4 w-4 rounded text-yellow-500 focus:ring-yellow-500 accent-yellow-500 ${theme === 'dark' ? 'bg-slate-600 border-slate-500' : 'bg-slate-200 border-slate-300'}`}
                                    />
                                    <span className={`ml-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{option}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;

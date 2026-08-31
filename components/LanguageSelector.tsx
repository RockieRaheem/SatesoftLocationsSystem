import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface LanguageSelectorProps {
    theme: Theme;
    language: string;
    onLanguageChange: (lang: string) => void;
}

const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
    { code: 'es', name: 'Spanish', native: 'Español' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ theme, language, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageSelect = (code: string) => {
        onLanguageChange(code);
        setIsOpen(false);
    }

    const dropdownMenuClasses = theme === 'dark'
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200';

    const linkClasses = (isSelected: boolean) => {
        const base = theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100';
        const active = theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900';
        return isSelected ? `${base} ${active}` : base;
    }

    const focusRingClasses = theme === 'dark'
        ? 'focus:ring-offset-slate-800'
        : 'focus:ring-offset-white';
        
    const currentLangCode = language.toUpperCase();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center space-x-2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'} ${focusRingClasses}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Select language"
            >
                <Icon name="globe" className="h-6 w-6" />
                <span className="font-semibold text-sm">{currentLangCode}</span>
            </button>
            {isOpen && (
                <div
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 border z-10 ${dropdownMenuClasses}`}
                    role="menu"
                    aria-orientation="vertical"
                >
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageSelect(lang.code)}
                            className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm transition-colors ${linkClasses(language === lang.code)}`}
                            role="menuitem"
                        >
                            <span>{lang.native}</span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
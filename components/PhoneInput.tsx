import React, { useState, useEffect, useMemo } from 'react';
import { Theme, PhoneNumber } from '../types';
import Icon from './Icon';

// A simplified list for the dropdown
const countryCodes = [
    { name: 'Uganda', code: '+256', countryCode: 'UG' },
    { name: 'Kenya', code: '+254', countryCode: 'KE' },
    { name: 'Tanzania', code: '+255', countryCode: 'TZ' },
    { name: 'Rwanda', code: '+250', countryCode: 'RW' },
    { name: 'South Sudan', code: '+211', countryCode: 'SS' },
    { name: 'Nigeria', code: '+234', countryCode: 'NG' },
    { name: 'South Africa', code: '+27', countryCode: 'ZA' },
];

interface PhoneInputProps {
    theme: Theme;
    value: PhoneNumber;
    onChange: (value: PhoneNumber) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ theme, value, onChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCountry = useMemo(() => {
        return countryCodes.find(c => c.code === value.code) || countryCodes[0];
    }, [value.code]);
    
    const baseClasses = `block w-full rounded-md shadow-sm sm:text-sm px-3 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 h-10`;

    return (
        <div className="relative mt-1">
            <div className="flex items-stretch">
                <div ref={dropdownRef} className="relative flex">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`inline-flex items-center px-3 border border-r-0 rounded-l-md h-10 transition-colors ${theme === 'dark' ? 'bg-slate-700 border-slate-700 hover:bg-slate-600' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}
                    >
                        <img src={`https://flagcdn.com/w20/${selectedCountry.countryCode.toLowerCase()}.png`} alt="" className="w-5 h-auto mr-2" />
                        <Icon name="chevron-down" className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                    {isDropdownOpen && (
                        <ul className={`absolute z-10 mt-1 w-48 rounded-md shadow-lg border max-h-48 overflow-y-auto ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                            {countryCodes.map(country => (
                                <li key={country.code} onClick={() => {
                                    onChange({ ...value, code: country.code });
                                    setIsDropdownOpen(false);
                                }}
                                className={`flex items-center px-3 py-2 text-sm cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                                    <img src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`} alt="" className="w-5 h-auto mr-3" />
                                    <span>{country.name} ({country.code})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <input
                    type="tel"
                    value={value.number}
                    onChange={(e) => onChange({ ...value, number: e.target.value })}
                    className={`${baseClasses} rounded-l-none flex-1 min-w-0`}
                    placeholder="772 123 456"
                />
            </div>
        </div>
    );
};

export default PhoneInput;

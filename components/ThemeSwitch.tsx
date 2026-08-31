import React from 'react';
import { Theme } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ThemeSwitchProps {
  theme: Theme;
  onToggle: () => void;
  isCollapsed: boolean;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ theme, onToggle, isCollapsed }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const label = isDark ? t('themeSwitch.darkMode', 'Dark Mode') : t('themeSwitch.lightMode', 'Light Mode');

  return (
    <div className={`flex items-center rounded-md ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'} transition-colors ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-4 py-2.5'}`}>
        <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            {label}
        </span>
        <button
            onClick={onToggle}
            role="switch"
            aria-checked={isDark}
            className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${isDark ? 'bg-slate-600 focus:ring-offset-slate-900' : 'bg-slate-300 focus:ring-offset-white'} ${isCollapsed && 'ml-0'}`}
            aria-label={label}
        >
            <span className="sr-only">Use dark mode</span>
            <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDark ? 'translate-x-5' : 'translate-x-0'}`}
            >
                <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${isDark ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'}`} aria-hidden="true">
                    {/* Sun icon for light mode */}
                    <svg className="h-3 w-3 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </span>
                <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${isDark ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'}`} aria-hidden="true">
                    {/* Moon icon for dark mode */}
                     <svg className="h-3 w-3 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </span>
            </span>
        </button>
    </div>
  );
};

export default ThemeSwitch;

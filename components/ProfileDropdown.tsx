
import React, { useState, useEffect, useRef } from 'react';
import { Theme, ActiveView, User } from '../types';
import Icon from './Icon';
import { useTranslation } from '../contexts/LanguageContext';

interface ProfileDropdownProps {
    theme: Theme;
    user: User;
    onNavigate: (view: ActiveView) => void;
    onLogout?: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ theme, user, onNavigate, onLogout }) => {
    const { t } = useTranslation();
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

    const handleNavigation = (view: ActiveView) => {
        onNavigate(view);
        setIsOpen(false);
    }

    const dropdownMenuClasses = theme === 'dark'
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200';

    const linkClasses = theme === 'dark'
        ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
        : 'text-slate-700 hover:bg-slate-100';

    const focusRingClasses = theme === 'dark'
        ? 'focus:ring-offset-slate-800'
        : 'focus:ring-offset-white';

    const avatarInitials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('');

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 rounded-full p-1 ${focusRingClasses}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="text-right hidden sm:block">
                    <p className={`font-medium leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                    <p className={`text-xs leading-tight ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</p>
                </div>
                {user.avatar ? (
                    <img className="w-10 h-10 rounded-full object-cover" src={user.avatar} alt="User avatar" />
                ) : (
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-800 font-bold text-lg">
                        {avatarInitials}
                    </div>
                )}
            </button>
            {isOpen && (
                <div
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 border z-10 ${dropdownMenuClasses}`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                >
                    <button
                        onClick={() => handleNavigation('profile')}
                        className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${linkClasses}`}
                        role="menuitem"
                    >
                        <Icon name="user-circle" className="h-5 w-5 mr-3" />
                        {t('profileDropdown.myProfile', 'My Profile')}
                    </button>
                    <button
                        onClick={() => handleNavigation('settings')}
                        className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${linkClasses}`}
                        role="menuitem"
                    >
                        <Icon name="system-settings" className="h-5 w-5 mr-3" />
                        {t('profileDropdown.settings', 'Settings')}
                    </button>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-slate-100'} border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
                            role="menuitem"
                        >
                            <Icon name="logout" className="h-5 w-5 mr-3" />
                            {t('sidebar.logout', 'Logout')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;

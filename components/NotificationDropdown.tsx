import React, { useState, useEffect, useRef } from 'react';
import { Theme, Notification } from '../types';
import Icon from './Icon';

interface NotificationDropdownProps {
    theme: Theme;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ theme, notifications, setNotifications }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                    theme === 'dark' 
                        ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white focus:ring-offset-slate-900' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus:ring-offset-white'
                }`}
                aria-label="View notifications"
            >
                <Icon name="bell" className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-black items-center justify-center shadow-sm border border-white/20 dark:border-black/20">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-md shadow-lg border z-20 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className={`flex justify-between items-center p-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-yellow-500 hover:underline">Mark all as read</button>
                        )}
                    </div>
                    <ul className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            [...notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(n => (
                                <li key={n.id} className={`p-3 border-b ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-200 hover:bg-slate-50'} ${n.read ? '' : 'cursor-pointer'}`} onClick={() => !n.read && handleMarkAsRead(n.id)}>
                                    <div className="flex items-start">
                                        {!n.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>}
                                        <div className={!n.read ? 'ml-2.5' : 'ml-5'}>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{n.message}</p>
                                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{timeSince(n.timestamp)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>No notifications yet.</li>
                        )}
                    </ul>
                    <div className={`p-2 text-center border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <button className="text-sm font-medium text-yellow-500 hover:underline">View all notifications</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default NotificationDropdown;

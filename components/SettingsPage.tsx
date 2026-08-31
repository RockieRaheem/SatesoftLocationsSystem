import React, { useState } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface SettingsPageProps {
  theme: Theme;
}

const SettingsCard: React.FC<{ theme: Theme, title: string, icon: any, children: React.ReactNode }> = ({ theme, title, icon, children }) => {
    const cardClasses = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
    return (
        <div className={`${cardClasses} rounded-lg shadow-sm overflow-hidden`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <h3 className="flex items-center text-lg font-semibold">
                    <Icon name={icon} className="h-5 w-5 mr-3" />
                    {title}
                </h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

const Toggle: React.FC<{ label: string, description: string, enabled: boolean, setEnabled: (enabled: boolean) => void, theme: Theme }> = ({ label, description, enabled, setEnabled, theme }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{label}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        </div>
        <button
            onClick={() => setEnabled(!enabled)}
            role="switch"
            aria-checked={enabled}
            className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${enabled ? 'bg-yellow-500' : (theme === 'dark' ? 'bg-slate-600' : 'bg-slate-200')} ${theme === 'dark' ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ theme }) => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [weeklySummary, setWeeklySummary] = useState(true);
    const [disableDiscountForDebt, setDisableDiscountForDebt] = useState(true);
    
    const inputClasses = theme === 'dark' 
    ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-yellow-500 focus:border-yellow-500' 
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Shop Settings */}
            <SettingsCard theme={theme} title="Shop Settings" icon="shopping-bag">
                <div className="space-y-4">
                    <Toggle theme={theme} label="Disable Discount for Debt" description="When enabled, the discount modal is skipped for debt payments." enabled={disableDiscountForDebt} setEnabled={setDisableDiscountForDebt} />
                </div>
            </SettingsCard>

            {/* Notification Settings */}
            <SettingsCard theme={theme} title="Notification Settings" icon="bell">
                <div className="space-y-4">
                    <Toggle theme={theme} label="Email Notifications" description="Get emails for important stock updates." enabled={emailNotifications} setEnabled={setEmailNotifications} />
                    <Toggle theme={theme} label="Push Notifications" description="Get push notifications on your devices." enabled={pushNotifications} setEnabled={setPushNotifications} />
                    <Toggle theme={theme} label="Weekly Summary" description="Receive a weekly summary of shop activities." enabled={weeklySummary} setEnabled={setWeeklySummary} />
                </div>
            </SettingsCard>

            {/* Permission Control */}
            <SettingsCard theme={theme} title="Permission Control" icon="shield-check">
                <div className="space-y-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Your current role is <span className={`font-semibold px-2 py-1 rounded-md text-xs ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>Administrator</span>. Your permissions are managed by the system administrator.</p>
                     <ul className={`list-disc list-inside text-sm pl-2 space-y-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        <li>Manage all stock purchases</li>
                        <li>Add, edit, and delete stock entries</li>
                        <li>Access all financial reports</li>
                        <li>Manage users and system settings</li>
                    </ul>
                </div>
            </SettingsCard>

            {/* Change Password */}
            <SettingsCard theme={theme} title="Change Password" icon="key">
                <form className="space-y-4">
                     <div>
                        <label htmlFor="current-password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Current Password</label>
                        <input type="password" name="current-password" id="current-password" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${inputClasses}`} />
                    </div>
                     <div>
                        <label htmlFor="new-password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>New Password</label>
                        <input type="password" name="new-password" id="new-password" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${inputClasses}`} />
                    </div>
                     <div>
                        <label htmlFor="confirm-password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Confirm New Password</label>
                        <input type="password" name="confirm-password" id="confirm-password" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${inputClasses}`} />
                    </div>
                    <div className="flex justify-end">
                         <button type="submit" className="px-6 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600">
                            Update Password
                        </button>
                    </div>
                </form>
            </SettingsCard>
        </div>
    );
};

export default SettingsPage;

import React, { ReactNode } from 'react';
import { Theme } from '../types';
import Icon, { IconName } from './Icon';

interface DashboardKPICardProps {
    theme: Theme;
    title: string;
    value: string;
    icon: IconName;
    trend?: { value: number; isPositive: boolean };
    badge?: { label: string };
    miniChart?: ReactNode;
    subtitle?: string;
    onClick?: () => void;
    color?: string;
}

const DashboardKPICard: React.FC<DashboardKPICardProps> = ({ theme, title, value, icon, trend, badge, miniChart, subtitle, onClick, color }) => {
    const cardClasses = `p-5 rounded-lg border flex flex-col justify-between h-full transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg ' + (theme === 'dark' ? 'hover:border-yellow-500/50' : 'hover:border-slate-300') : ''} ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;

    return (
        <div className={cardClasses} onClick={onClick}>
            <div>
                <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                    <Icon name={icon} className={`h-5 w-5 ${color ? color : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`} />
                </div>
                <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
                {subtitle && <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
            </div>
            <div className="flex justify-between items-end mt-4">
                <div className="flex items-center text-sm">
                    {trend && (
                        <div className={`flex items-center mr-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            <Icon name={trend.isPositive ? 'arrow-up' : 'arrow-down'} className="h-4 w-4 mr-1" />
                            <span>{trend.value}%</span>
                        </div>
                    )}
                    {badge && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
                {miniChart && <div className="w-24 h-8">{miniChart}</div>}
            </div>
        </div>
    );
};

export default DashboardKPICard;

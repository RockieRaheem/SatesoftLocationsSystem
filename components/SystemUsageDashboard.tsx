import React from 'react';
import { Theme } from '../types';
import Icon, { IconName } from './Icon';

// --- Reusable Components ---

const SectionCard: React.FC<{ title: string; icon: IconName; children: React.ReactNode; theme: Theme }> = ({ title, icon, children, theme }) => (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border`}>
        <h2 className={`text-lg font-semibold flex items-center px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-700 text-slate-100' : 'border-slate-200 text-slate-800'}`}>
            <Icon name={icon} className="h-5 w-5 mr-3" />
            {title}
        </h2>
        <div className="p-6">{children}</div>
    </div>
);

const ProgressBar: React.FC<{ percentage: number; colorClass: string; theme: Theme }> = ({ percentage, colorClass, theme }) => (
    <div className={`w-full rounded-full h-2.5 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
);

// --- Dashboard Sub-Components ---

const ServiceStatus: React.FC<{ theme: Theme }> = ({ theme }) => {
    const services: { name: string; icon: IconName; status: 'Up' | 'Down' }[] = [
        { name: 'httpd (Apache)', icon: 'globe' as IconName, status: 'Up' },
        { name: 'mysql', icon: 'cash' as IconName, status: 'Up' },
        { name: 'sshd', icon: 'shield-check' as IconName, status: 'Up' },
        { name: 'exim', icon: 'bell' as IconName, status: 'Down' },
        { name: 'named (DNS)', icon: 'globe' as IconName, status: 'Up' },
        { name: 'pure-ftpd', icon: 'upload' as IconName, status: 'Up' },
    ];

    const StatusIndicator: React.FC<{ status: 'Up' | 'Down' }> = ({ status }) => {
        const isUp = status === 'Up';
        return (
            <div className="flex items-center gap-2">
                <div className={`size-3 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>{status}</span>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
                <div key={service.name} className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <Icon name={service.icon} className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                        <p className={`text-base font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{service.name}</p>
                    </div>
                    <StatusIndicator status={service.status} />
                </div>
            ))}
        </div>
    );
};

const ResourceUsage: React.FC<{ theme: Theme }> = ({ theme }) => {
    const disks = [
        { name: '/ (root)', usage: 85, total: '500GB', used: '425GB', color: 'bg-red-500' },
        { name: '/tmp', usage: 5, total: '20GB', used: '1GB', color: 'bg-yellow-500' },
        { name: '/boot', usage: 30, total: '1GB', used: '300MB', color: 'bg-yellow-500' },
    ];
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`flex flex-col gap-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Server Load</p>
                    <p className="text-2xl font-bold text-yellow-500">1.75</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>CPU Count: 8</p>
                </div>
                <div className={`flex flex-col gap-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="flex justify-between items-baseline">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Memory Used</p>
                        <p className="text-xs font-semibold">75%</p>
                    </div>
                    <ProgressBar percentage={75} colorClass="bg-yellow-500" theme={theme} />
                    <p className={`text-xs text-right ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>12.0GB / 16.0GB</p>
                </div>
                <div className={`flex flex-col gap-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="flex justify-between items-baseline">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Swap Usage</p>
                        <p className="text-xs font-semibold">10%</p>
                    </div>
                    <ProgressBar percentage={10} colorClass="bg-green-500" theme={theme} />
                    <p className={`text-xs text-right ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>0.8GB / 8.0GB</p>
                </div>
            </div>
            <div>
                <h3 className={`text-base font-semibold mb-4 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Disk Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {disks.map(disk => (
                        <div key={disk.name} className="flex flex-col gap-2">
                            <div className="flex justify-between items-baseline">
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{disk.name}</p>
                                <p className="text-xs font-semibold">{disk.usage}%</p>
                            </div>
                            <ProgressBar percentage={disk.usage} colorClass={disk.color} theme={theme} />
                            <p className={`text-xs text-right ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{disk.used} / {disk.total}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Statistics: React.FC<{ theme: Theme }> = ({ theme }) => {
    const stats = [
        { name: 'Alias Domains', current: 1, max: 5, unit: '' },
        { name: 'Addon Domains', current: 2, max: Infinity, unit: '' },
        { name: 'Disk Usage', current: 2.5, max: 10, unit: 'GB' },
        { name: 'File Usage', current: 45123, max: 300000, unit: '' },
        { name: 'Databases', current: 4, max: 10, unit: '' },
        { name: 'Bandwidth', current: 15.2, max: 100, unit: 'GB' },
        { name: 'Subdomains', current: 3, max: 10, unit: '' },
        { name: 'Email Accounts', current: 25, max: 100, unit: '' },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stats.map(stat => {
                const percentage = isFinite(stat.max) ? (stat.current / stat.max) * 100 : 100;
                const colorClass = isFinite(stat.max) ? 'bg-yellow-500' : 'bg-green-500';
                return (
                    <div key={stat.name} className={`flex flex-col gap-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{stat.name}</p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                {stat.current}{stat.unit} / {isFinite(stat.max) ? `${stat.max}${stat.unit}` : '∞'}
                            </p>
                        </div>
                        <ProgressBar percentage={percentage} colorClass={colorClass} theme={theme} />
                    </div>
                );
            })}
        </div>
    );
};

const ServerInfo: React.FC<{ theme: Theme }> = ({ theme }) => {
    const info = {
        "Hosting Package": "Business Cloud 2",
        "Server Name": "server.locationregister.org",
        "cPanel Version": "110.0.12",
        "Apache Version": "2.4.54",
        "Database Version": "MySQL 8.0.32",
        "Architecture": "x86_64",
        "Operating System": "CentOS 7.9",
        "Shared IP Address": "192.0.2.1",
        "Kernel Version": "3.10.0-1160.83.1.el7",
    };
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {Object.entries(info).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                    <p className={`text-sm font-normal leading-normal ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{key}</p>
                    <p className={`text-sm font-medium leading-normal ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value}</p>
                </div>
            ))}
        </div>
    );
};


// --- Main Component ---

const SystemUsageDashboard: React.FC<{ theme: Theme }> = ({ theme }) => {
    return (
        <div className="space-y-6">
            <SectionCard title="Service Status" icon="system-settings" theme={theme}>
                <ServiceStatus theme={theme} />
            </SectionCard>
            <SectionCard title="Resource Usage" icon="reports" theme={theme}>
                <ResourceUsage theme={theme} />
            </SectionCard>
            <SectionCard title="General Statistics" icon="reports" theme={theme}>
                <Statistics theme={theme} />
            </SectionCard>
            <SectionCard title="Server Information" icon="system-settings" theme={theme}>
                <ServerInfo theme={theme} />
            </SectionCard>
        </div>
    );
};

export default SystemUsageDashboard;
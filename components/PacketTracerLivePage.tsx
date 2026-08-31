import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Theme, PacketTracerLog } from '../types';
import { mockPacketTracerLogs } from '../data';
import Icon from './Icon';
import PacketTraceModal from './PacketTraceModal';

interface PacketTracerLivePageProps {
    theme: Theme;
}

const FUNCTIONS = [
    { name: 'login', successMsg: 'User authenticated successfully', failMsg: 'Failed authentication: check credentials' },
    { name: 'create_sale', successMsg: 'Created sale record SAL-983', failMsg: 'Failed to record transaction: Insufficient funds' },
    { name: 'update_inventory', successMsg: 'Increased product stock counts by 40 units', failMsg: 'Warehouse lock timeout' },
    { name: 'fetch_countries', successMsg: 'Retrieved country paths and bounds coordinates', failMsg: 'API request failure: DNS resolution timed out' },
    { name: 'verify_identity', successMsg: 'Facial match score 98% approved', failMsg: 'Selfie biometric mismatch' },
    { name: 'update_exchange_rate', successMsg: 'Synced UGX/USD rates from central registry', failMsg: 'Rate feed source offline' },
    { name: 'generate_report', successMsg: 'Financial Balance Sheet PDF compiled', failMsg: 'Out of memory during PDF generation' }
];

const CUSTOMERS = ['paul.mboya@locationregister.org', 'alice@example.com', 'bob@example.com', 'clara@shop.com', 'david@finance.com', 'emma@mfg.com'];
const PLATFORMS: ('iOS' | 'Android' | 'Web' | 'Desktop')[] = ['Web', 'iOS', 'Android', 'Desktop'];

const PacketTracerLivePage: React.FC<PacketTracerLivePageProps> = ({ theme }) => {
    const [isStreaming, setIsStreaming] = useState(true);
    const [streamSpeed, setStreamSpeed] = useState<number>(2000); // ms
    const [logs, setLogs] = useState<PacketTracerLog[]>(() => {
        // Seed with standard mock packet logs but ensure timestamps are fresh
        return mockPacketTracerLogs.map((log, i) => ({
            ...log,
            timestamp: new Date(Date.now() - (i + 1) * 60000).toISOString()
        }));
    });
    
    // Live metrics state
    const [activeConnections, setActiveConnections] = useState(12);
    const [avgLatency, setAvgLatency] = useState(182);
    const [blockedRequests, setBlockedRequests] = useState(4);
    const [totalProcessedCount, setTotalProcessedCount] = useState(logs.length);

    // Modal state
    const [selectedLog, setSelectedLog] = useState<PacketTracerLog | null>(null);
    const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);

    // Filter states
    const [filterPlatform, setFilterPlatform] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // ID counter to generate unique log IDs
    const idCounter = useRef(100);

    // Sync active connections with live activity to make it feel super dynamic
    useEffect(() => {
        if (!isStreaming) return;
        const interval = setInterval(() => {
            setActiveConnections(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                return Math.max(5, Math.min(30, prev + change));
            });
            setAvgLatency(prev => {
                const change = Math.floor(Math.random() * 20) - 10;
                return Math.max(120, Math.min(320, prev + change));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [isStreaming]);

    // Live packet stream generator
    useEffect(() => {
        if (!isStreaming) return;

        const interval = setInterval(() => {
            const randomFunc = FUNCTIONS[Math.floor(Math.random() * FUNCTIONS.length)];
            const randomUser = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
            const randomPlatform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
            
            // 85% success rate simulation
            const isSuccess = Math.random() > 0.15;
            const status = isSuccess ? 'Success' : 'Failed';
            const details = isSuccess ? randomFunc.successMsg : randomFunc.failMsg;
            
            idCounter.current += 1;
            const newLog: PacketTracerLog = {
                id: idCounter.current,
                functionName: randomFunc.name,
                user: randomUser,
                ipAddress: `192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`,
                timestamp: new Date().toISOString(),
                status: status,
                details: details,
                platform: randomPlatform,
                version: `v2.${Math.floor(Math.random() * 4)}`
            };

            setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Cap at 50 logs of history
            setTotalProcessedCount(prev => prev + 1);
            if (!isSuccess) {
                setBlockedRequests(prev => prev + 1);
            }
        }, streamSpeed);

        return () => clearInterval(interval);
    }, [isStreaming, streamSpeed]);

    // Calculated fields
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesPlatform = filterPlatform ? log.platform === filterPlatform : true;
            const matchesStatus = filterStatus ? log.status === filterStatus : true;
            return matchesPlatform && matchesStatus;
        });
    }, [logs, filterPlatform, filterStatus]);

    const successRate = useMemo(() => {
        if (logs.length === 0) return '100%';
        const successCount = logs.filter(l => l.status === 'Success').length;
        return `${((successCount / logs.length) * 100).toFixed(1)}%`;
    }, [logs]);

    const handleViewTrace = (log: PacketTracerLog) => {
        setSelectedLog(log);
        setIsTraceModalOpen(true);
    };

    const handleClearFeed = () => {
        setLogs([]);
        setBlockedRequests(0);
    };

    const cardClass = `p-5 rounded-xl border flex items-center justify-between shadow-sm transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`;
    
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Trace detail modal */}
            <PacketTraceModal
                isOpen={isTraceModalOpen}
                onClose={() => setIsTraceModalOpen(false)}
                log={selectedLog}
                theme={theme}
            />

            {/* Header controls bar */}
            <div className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
                <div>
                    <div className="flex items-center gap-3">
                        <span className="flex h-3.5 w-3.5 relative">
                            {isStreaming && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isStreaming ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        </span>
                        <h1 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Live Packet Tracer Feed
                        </h1>
                    </div>
                    <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Real-time visualization and routing tracking of incoming API client payload actions.
                    </p>
                </div>

                {/* Dashboard interactions */}
                <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
                    {/* Pause / Resume */}
                    <button
                        onClick={() => setIsStreaming(!isStreaming)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isStreaming 
                                ? theme === 'dark' ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                : theme === 'dark' ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                        }`}
                    >
                        <Icon name={isStreaming ? 'pause' : 'play'} className="w-4 h-4" />
                        <span>{isStreaming ? 'Pause Feed' : 'Resume Feed'}</span>
                    </button>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Delay:</span>
                        <select
                            value={streamSpeed}
                            onChange={(e) => setStreamSpeed(Number(e.target.value))}
                            className="bg-transparent text-sm font-medium outline-none text-slate-700 dark:text-slate-200 border-none p-0 cursor-pointer focus:ring-0"
                            disabled={!isStreaming}
                        >
                            <option value="1000" className="dark:bg-slate-800">1.0s (Fast)</option>
                            <option value="2000" className="dark:bg-slate-800">2.0s (Normal)</option>
                            <option value="5000" className="dark:bg-slate-800">5.0s (Slow)</option>
                        </select>
                    </div>

                    {/* Clear Stream */}
                    <button
                        onClick={handleClearFeed}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            theme === 'dark' 
                                ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                        title="Clear stream logs history"
                    >
                        <Icon name="trash" className="w-4 h-4" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* KPI Performance Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Streams Card */}
                <div className={cardClass}>
                    <div className="space-y-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            WS Node Sockets
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {activeConnections}
                            </span>
                            <span className="text-xs font-medium text-green-500 animate-pulse bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                Active
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Icon name="broadcast" className="w-5 h-5" />
                    </div>
                </div>

                {/* Avg Latency Card */}
                <div className={cardClass}>
                    <div className="space-y-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Avg Payload latency
                        </span>
                        <div className="flex items-baseline gap-1 font-mono">
                            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {avgLatency}
                            </span>
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                ms
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-50 text-yellow-600'}`}>
                        <Icon name="history" className="w-5 h-5" />
                    </div>
                </div>

                {/* Success Performance */}
                <div className={cardClass}>
                    <div className="space-y-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            System Success Rate
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {successRate}
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                        <Icon name="shield-check" className="w-5 h-5" />
                    </div>
                </div>

                {/* Blocked Attacks */}
                <div className={cardClass}>
                    <div className="space-y-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Errors / Drops
                        </span>
                        <div className="flex items-baseline gap-1 font-mono">
                            <span className={`text-2xl font-bold text-red-500`}>
                                {blockedRequests}
                            </span>
                            <span className={`text-xs text-slate-400 font-normal`}>
                                / {totalProcessedCount} total
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                        <Icon name="shield-alert" className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Logs Board & Simulated Live Terminal */}
            <div className={`rounded-xl border shadow-sm overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
                {/* Board header */}
                <div className={`p-5 border-b flex flex-col sm:flex-row justify-between items-center gap-3 ${
                    theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                }`}>
                    <div className="flex items-center gap-2.5">
                        <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            Packet Tracer Log Stream
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            showing last {filteredLogs.length} matching
                        </span>
                    </div>

                    {/* Simple live filtering */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={filterPlatform}
                            onChange={(e) => setFilterPlatform(e.target.value)}
                            className={`px-3 py-1.5 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-yellow-500 ${
                                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                            }`}
                        >
                            <option value="">All Platforms</option>
                            <option value="Web">Web Only</option>
                            <option value="iOS">iOS Only</option>
                            <option value="Android">Android Only</option>
                            <option value="Desktop">Desktop Only</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className={`px-3 py-1.5 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-yellow-500 ${
                                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                            }`}
                        >
                            <option value="">All Statuses</option>
                            <option value="Success">Success Only</option>
                            <option value="Failed">Failed Only</option>
                        </select>
                    </div>
                </div>

                {/* Simulated live visual streaming grid layout representing raw packets */}
                {isStreaming && filteredLogs.length > 0 && (
                    <div className={`px-5 py-4 border-b flex items-center gap-2 overflow-x-auto select-none ${
                        theme === 'dark' ? 'bg-slate-950/40 border-slate-820' : 'bg-slate-50/50'
                    }`}>
                        <div className="text-[10px] font-bold text-slate-400 mr-2 flex-shrink-0 animate-pulse tracking-wider">
                            STREAM:
                        </div>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            {filteredLogs.slice(0, 8).map((log) => (
                                <div 
                                    key={`capsule-${log.id}`} 
                                    onClick={() => handleViewTrace(log)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border cursor-pointer hover:scale-105 transition-transform duration-200 ${
                                        log.status === 'Success'
                                            ? theme === 'dark' ? 'bg-green-950/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                                            : theme === 'dark' ? 'bg-red-950/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
                                    }`}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                                    <span>[{log.platform.slice(0,3).toUpperCase()}]</span>
                                    <span>{log.functionName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table list */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                                theme === 'dark' ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                                <th className="px-6 py-3.5">Packet ID</th>
                                <th className="px-6 py-3.5">Routing Function</th>
                                <th className="px-6 py-3.5">Client Identity</th>
                                <th className="px-6 py-3.5">Platform Node</th>
                                <th className="px-6 py-3.5">Origination Client IP</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5">Log Info</th>
                                <th className="px-6 py-3.5 text-right">Interactive Trace</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${
                            theme === 'dark' ? 'bg-slate-900 divide-slate-800' : 'bg-white divide-slate-200'
                        }`}>
                            {filteredLogs.map((log, index) => {
                                const isNewest = isStreaming && index === 0;
                                return (
                                    <tr 
                                        key={log.id} 
                                        className={`group transition-all duration-500 ${
                                            isNewest ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <td className="px-6 py-4.5 font-mono text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <span>#{log.id}</span>
                                                {isNewest && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4.5 font-medium text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                            <code>{log.functionName}</code>
                                        </td>
                                        <td className={`px-6 py-4.5 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {log.user}
                                        </td>
                                        <td className="px-6 py-4.5">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                                                theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                <Icon 
                                                    name={log.platform === 'iOS' || log.platform === 'Android' ? 'phone' : log.platform === 'Web' ? 'globe' : 'system-settings'} 
                                                    className="w-3.5 h-3.5 opacity-80" 
                                                />
                                                <span>{log.platform}</span>
                                                {log.version && (
                                                    <span className="opacity-60 font-mono">({log.version})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4.5 font-mono text-xs text-slate-400 dark:text-slate-500">
                                            {log.ipAddress}
                                        </td>
                                        <td className="px-6 py-4.5">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold leading-none ${
                                                log.status === 'Success'
                                                    ? theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800'
                                                    : theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4.5 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} max-w-sm truncate`} title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="px-6 py-4.5 text-right whitespace-nowrap">
                                            <button 
                                                onClick={() => handleViewTrace(log)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                                    theme === 'dark' 
                                                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:border-yellow-500 hover:text-yellow-500' 
                                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-yellow-500 hover:text-yellow-500'
                                                }`}
                                            >
                                                <Icon name="analytics" className="w-3.5 h-3.5 text-yellow-500 group-hover:animate-spin" />
                                                <span>Live Trace</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center">
                                        <div className={`text-slate-400 flex flex-col items-center justify-center gap-2`}>
                                            <Icon name="exclamation-triangle" className="w-8 h-8 opacity-60" />
                                            <span>No packets recorded matching current filter selection.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PacketTracerLivePage;

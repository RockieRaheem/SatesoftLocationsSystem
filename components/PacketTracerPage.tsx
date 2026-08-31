
import React, { useState, useMemo } from 'react';
import { Theme, PacketTracerLog } from '../types';
import { mockPacketTracerLogs } from '../data';
import Icon from './Icon';
import PacketTraceModal from './PacketTraceModal';

interface PacketTracerPageProps {
    theme: Theme;
}

const PacketTracerPage: React.FC<PacketTracerPageProps> = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [logs] = useState<PacketTracerLog[]>(mockPacketTracerLogs);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    // Modal State
    const [selectedLog, setSelectedLog] = useState<PacketTracerLog | null>(null);
    const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);

    const uniqueUsers = useMemo(() => [...new Set(logs.map(l => l.user))].sort(), [logs]);
    const platforms = ['iOS', 'Android', 'Web', 'Desktop'];

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = 
                log.functionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPlatform = filterPlatform ? log.platform === filterPlatform : true;
            const matchesUser = filterUser ? log.user === filterUser : true;
            
            return matchesSearch && matchesPlatform && matchesUser;
        });
    }, [logs, searchTerm, filterPlatform, filterUser]);

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Success': return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'}`}>Success</span>;
            case 'Failed': return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800'}`}>Failed</span>;
            default: return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>{status}</span>;
        }
    };
    
    const handleViewTrace = (log: PacketTracerLog) => {
        setSelectedLog(log);
        setIsTraceModalOpen(true);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterPlatform('');
        setFilterUser('');
        setCurrentPage(1);
    };

    const selectClass = `ml-2 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`;

    return (
        <>
        <PacketTraceModal 
            isOpen={isTraceModalOpen} 
            onClose={() => setIsTraceModalOpen(false)} 
            log={selectedLog} 
            theme={theme} 
        />
        <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm overflow-hidden border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} flex flex-col md:flex-row justify-between items-center gap-4`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Packet Tracer</h2>
                
                <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
                    <select 
                        value={filterPlatform} 
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">All Platforms</option>
                        {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select 
                        value={filterUser} 
                        onChange={(e) => setFilterUser(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">All Users</option>
                        {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>

                    <div className="relative flex-grow md:w-64">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className={`pl-3 pr-8 py-1.5 text-sm border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className={`absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none`}>
                            <Icon name="search" className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    {(filterPlatform || filterUser || searchTerm) && (
                        <button 
                            onClick={handleResetFilters}
                            className={`p-1.5 rounded-md border transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}
                            title="Reset Filters"
                        >
                            <Icon name="refresh" className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                    <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Function</th>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Platform</th>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>User</th>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Timestamp</th>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>IP Address</th>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Details</th>
                            <th className={`px-6 py-3 text-right text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Action</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                        {paginatedLogs.map((log) => (
                            <tr key={log.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {log.functionName}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <div className="flex items-center gap-2">
                                        <Icon name={log.platform === 'iOS' || log.platform === 'Android' ? 'phone' : log.platform === 'Web' ? 'globe' : 'system-settings'} className="h-4 w-4 opacity-70" />
                                        <span>{log.platform}</span>
                                        {log.version && <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>({log.version})</span>}
                                    </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {log.user}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {log.ipAddress}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {getStatusBadge(log.status)}
                                </td>
                                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} max-w-xs truncate`}>
                                    {log.details}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleViewTrace(log)}
                                        className="text-blue-500 hover:text-blue-600 transition-colors" 
                                        title="Trace Packet Flow"
                                    >
                                        <Icon name="view" className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={8} className={`px-6 py-8 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    No logs found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} entries
                    </div>
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`p-1 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            <Icon name="chevron-left" className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-1 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            <Icon name="chevron-right" className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default PacketTracerPage;

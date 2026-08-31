
import React, { useState, useMemo } from 'react';
import { Theme, CallRecord, DeletedCallRecord, User } from '../types';
import Icon from './Icon';
import DeleteCallModal from './DeleteCallModal';
import CallPlayerModal from './CallPlayerModal';
import TranscriptionModal from './TranscriptionModal';
import ActiveCallModal from './ActiveCallModal';
import { maskPhoneNumber } from '../utils';

interface ReportsCallsPageProps {
    theme: Theme;
    callRecords: CallRecord[];
    deletedCallRecords: DeletedCallRecord[];
    onDeleteCall: (callId: string, reason: string, deletedBy: string) => void;
    addCallRecord: (record: Omit<CallRecord, 'id'>) => void;
    currentUser: User;
}

const SummaryCard: React.FC<{ icon: any; title: string; value: string; theme: Theme; color?: string }> = ({ icon, title, value, theme, color = 'text-blue-500' }) => (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
        <div className={`p-3 rounded-full mr-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Icon name={icon} className={`h-6 w-6 ${color}`} />
        </div>
        <div>
            <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
        </div>
    </div>
);

const ReportsCallsPage: React.FC<ReportsCallsPageProps> = ({ theme, callRecords, deletedCallRecords, onDeleteCall, addCallRecord, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    
    // Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [callToDelete, setCallToDelete] = useState<CallRecord | null>(null);
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [playerCall, setPlayerCall] = useState<CallRecord | null>(null);
    const [isTranscriptionModalOpen, setIsTranscriptionModalOpen] = useState(false);
    const [transcriptionCall, setTranscriptionCall] = useState<CallRecord | null>(null);
    
    // Active Call State
    const [isActiveCallOpen, setIsActiveCallOpen] = useState(false);
    const [activeCallClient, setActiveCallClient] = useState<{ name: string; phone: string } | null>(null);


    const filteredCalls = useMemo(() => {
        const source = activeTab === 'active' ? callRecords : deletedCallRecords;
        return source.filter(call => {
            if (filterType && call.type !== filterType) return false;
            if (filterStatus && call.status !== filterStatus) return false;
            if (dateStart) {
                const dStart = new Date(dateStart);
                dStart.setHours(0,0,0,0);
                if (new Date(call.timestamp) < dStart) return false;
            }
            if (dateEnd) {
                const dEnd = new Date(dateEnd);
                dEnd.setHours(23,59,59,999);
                if (new Date(call.timestamp) > dEnd) return false;
            }
            return true;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [activeTab, callRecords, deletedCallRecords, filterType, filterStatus, dateStart, dateEnd]);

    const summary = useMemo(() => {
        const total = callRecords.length;
        const inbound = callRecords.filter(c => c.type === 'Inbound').length;
        const outbound = callRecords.filter(c => c.type === 'Outbound').length;
        const missed = callRecords.filter(c => c.status === 'Missed' || c.status === 'Voicemail').length;
        return { total, inbound, outbound, missed };
    }, [callRecords]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleConfirmDelete = (callId: string, reason: string) => {
        onDeleteCall(callId, reason, currentUser.name);
    };

    const handleReturnCall = (call: CallRecord) => {
        setActiveCallClient({ name: call.clientName, phone: call.phoneNumber });
        setIsActiveCallOpen(true);
    };

    const handleCallComplete = (details: { duration: number; status: 'Completed' | 'Missed' | 'Voicemail' }) => {
        if (activeCallClient) {
            addCallRecord({
                clientName: activeCallClient.name,
                phoneNumber: activeCallClient.phone,
                type: 'Outbound',
                duration: details.duration,
                timestamp: new Date().toISOString(),
                status: details.status,
                agentName: currentUser.name
            });
        }
    };

    const inputClass = `text-sm rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`;

    return (
        <>
            <DeleteCallModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} call={callToDelete} theme={theme} />
            <CallPlayerModal isOpen={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} call={playerCall} theme={theme} onReturnCall={handleReturnCall} />
            <TranscriptionModal isOpen={isTranscriptionModalOpen} onClose={() => setIsTranscriptionModalOpen(false)} call={transcriptionCall} theme={theme} />
            
            <ActiveCallModal 
                isOpen={isActiveCallOpen}
                onClose={() => setIsActiveCallOpen(false)}
                client={activeCallClient}
                currentUser={currentUser}
                theme={theme}
                onCallComplete={handleCallComplete}
            />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SummaryCard theme={theme} icon="phone" title="Total Calls" value={summary.total.toString()} color="text-blue-500" />
                    <SummaryCard theme={theme} icon="phone-incoming" title="Inbound" value={summary.inbound.toString()} color="text-green-500" />
                    <SummaryCard theme={theme} icon="phone-outgoing" title="Outbound" value={summary.outbound.toString()} color="text-purple-500" />
                    <SummaryCard theme={theme} icon="phone-missed" title="Missed/Voicemail" value={summary.missed.toString()} color="text-red-500" />
                </div>

                {/* Main Content Area */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden`}>
                    
                    {/* Filters & Tabs Header */}
                    <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                            <div className="flex space-x-4">
                                <button onClick={() => setActiveTab('active')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Call Records</button>
                                <button onClick={() => setActiveTab('deleted')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'deleted' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Deleted Calls</button>
                            </div>
                        </div>
                        
                        <div className={`p-4 rounded-md flex flex-wrap gap-4 items-end ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500">Type</label>
                                <select value={filterType} onChange={e => setFilterType(e.target.value)} className={inputClass}>
                                    <option value="">All</option>
                                    <option value="Inbound">Inbound</option>
                                    <option value="Outbound">Outbound</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500">Status</label>
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputClass}>
                                    <option value="">All</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Missed">Missed</option>
                                    <option value="Voicemail">Voicemail</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500">Start Date</label>
                                <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className={inputClass} />
                            </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500">End Date</label>
                                <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className={inputClass} />
                            </div>
                             <button onClick={() => { setFilterType(''); setFilterStatus(''); setDateStart(''); setDateEnd(''); }} className={`px-3 py-2 rounded-md text-sm border transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Date & Time</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Client</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Type</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Agent</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Duration</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                    {activeTab === 'deleted' && <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Deletion Info</th>}
                                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {filteredCalls.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">No call records found.</td></tr>
                                ) : (
                                    filteredCalls.map((call) => (
                                        <tr key={call.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {new Date(call.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{call.clientName}</div>
                                                <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{maskPhoneNumber(call.phoneNumber)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit ${
                                                    call.type === 'Inbound' 
                                                    ? (theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800') 
                                                    : (theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-800')
                                                }`}>
                                                    <Icon name={call.type === 'Inbound' ? 'phone-incoming' : 'phone-outgoing'} className="w-3 h-3 mr-1" />
                                                    {call.type}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {call.agentName}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {formatDuration(call.duration)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    call.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                                                    call.status === 'Missed' ? 'bg-red-100 text-red-800' : 
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {call.status}
                                                </span>
                                            </td>
                                            {activeTab === 'deleted' && (
                                                <td className="px-6 py-4 text-sm">
                                                     <div className="flex flex-col">
                                                        <span className="text-red-500 text-xs font-bold">Reason: {(call as DeletedCallRecord).deletionReason}</span>
                                                        <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>By: {(call as DeletedCallRecord).deletedBy}</span>
                                                     </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    {call.recordingUrl && (
                                                        <button onClick={() => { setPlayerCall(call); setIsPlayerModalOpen(true); }} className="text-blue-500 hover:text-blue-700" title="Play Recording">
                                                            <Icon name="play-circle" className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    {call.transcription && (
                                                        <button onClick={() => { setTranscriptionCall(call); setIsTranscriptionModalOpen(true); }} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" title="View Transcript">
                                                            <Icon name="transcript" className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleReturnCall(call)} className="text-green-500 hover:text-green-700" title="Return Call">
                                                        <Icon name="phone" className="h-4 w-4" />
                                                    </button>
                                                    {activeTab === 'active' && (
                                                        <button onClick={() => { setCallToDelete(call); setIsDeleteModalOpen(true); }} className="text-red-500 hover:text-red-700" title="Delete Record">
                                                            <Icon name="trash" className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportsCallsPage;

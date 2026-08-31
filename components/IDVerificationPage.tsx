import React, { useState, useMemo } from 'react';
import { Theme, IDVerificationRequest, VerificationStatus } from '../types';
import Icon, { IconName } from './Icon';
import { formatDate } from '../utils';
import IDVerificationViewModal from './IDVerificationViewModal';


const StatusBadge: React.FC<{ status: VerificationStatus, theme: Theme }> = ({ status, theme }) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full inline-block';
    const statusStyles = {
        Pending: theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
        Verified: theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800',
        Rejected: theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800',
    };
    return <span className={`${baseClasses} ${statusStyles[status]}`}>{status}</span>;
}

const SummaryCard: React.FC<{ icon: IconName; title: string; value: string; theme: Theme }> = ({ icon, title, value, theme }) => {
    const iconContainerClasses = theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100';
    const iconClasses = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';

    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
            <div className={`p-3 rounded-full mr-4 ${iconContainerClasses}`}>
                <Icon name={icon} className={`h-6 w-6 ${iconClasses}`} />
            </div>
            <div>
                <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
};

interface IDVerificationPageProps {
  theme: Theme;
  requests: IDVerificationRequest[];
  setRequests: React.Dispatch<React.SetStateAction<IDVerificationRequest[]>>;
}

const IDVerificationPage: React.FC<IDVerificationPageProps> = ({ theme, requests, setRequests }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<IDVerificationRequest | null>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const [statusFilter, setStatusFilter] = useState('');
    const [shopFilter, setShopFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const handleViewClick = (request: IDVerificationRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleStatusChange = (id: number, status: VerificationStatus, remark?: string) => {
        setRequests(prev => prev.map(req => 
            req.id === id 
            ? { ...req, status, rejectionReason: status === 'Rejected' ? remark : undefined } 
            : req
        ));
        setIsModalOpen(false);
    };

    const summaryData = useMemo(() => ({
        total: requests.length,
        pending: requests.filter(r => r.status === 'Pending').length,
        verified: requests.filter(r => r.status === 'Verified').length,
        rejected: requests.filter(r => r.status === 'Rejected').length,
    }), [requests]);

    const uniqueShops = useMemo(() => [...new Set(requests.map(r => r.shopName))], [requests]);

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (statusFilter && req.status !== statusFilter) return false;
            if (shopFilter && req.shopName !== shopFilter) return false;
            if (startDateFilter) {
                const startDate = new Date(startDateFilter);
                startDate.setHours(0,0,0,0);
                if (new Date(req.submissionDate) < startDate) return false;
            }
            if (endDateFilter) {
                const endDate = new Date(endDateFilter);
endDate.setHours(23,59,59,999);
                if (new Date(req.submissionDate) > endDate) return false;
            }
            return true;
        });
    }, [requests, statusFilter, shopFilter, startDateFilter, endDateFilter]);

    const handleResetFilters = () => {
        setStatusFilter('');
        setShopFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
    };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        <IDVerificationViewModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            request={selectedRequest}
            theme={theme}
            onStatusChange={handleStatusChange}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard theme={theme} icon="reports" title="Total" value={summaryData.total.toString()} />
            <SummaryCard theme={theme} icon="exclamation-triangle" title="Pending" value={summaryData.pending.toString()} />
            <SummaryCard theme={theme} icon="shield-check" title="Verified" value={summaryData.verified.toString()} />
            <SummaryCard theme={theme} icon="x-mark" title="Rejected" value={summaryData.rejected.toString()} />
        </div>

        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border`}>
            <div
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                aria-expanded={isFilterVisible}
            >
                <div className="flex items-center">
                    <Icon name="filter" className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    <h2 className={`text-md font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Filter Submissions</h2>
                </div>
                <Icon name="chevron-down" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
            </div>
            {isFilterVisible && (
                 <div className={`border-t p-6 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="statusFilter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                            <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Verified">Verified</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="shopFilter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Shop</label>
                            <select id="shopFilter" value={shopFilter} onChange={e => setShopFilter(e.target.value)} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                                <option value="">All Shops</option>
                                {uniqueShops.map(shop => <option key={shop} value={shop}>{shop}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDateFilter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Start Date</label>
                            <input type="date" id="startDateFilter" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}/>
                        </div>
                        <div>
                            <label htmlFor="endDateFilter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>End Date</label>
                            <input type="date" id="endDateFilter" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className={`mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}/>
                        </div>
                    </div>
                     <div className="mt-4 flex justify-end">
                        <button onClick={handleResetFilters} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                            <Icon name="refresh" className="h-4 w-4" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            )}
      </div>

        <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                    <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                    <tr>
                        {['#', 'Serial Number', 'Name', 'Shop', 'Date Submitted', 'Status', 'Actions'].map((header) => (
                        <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {header}
                        </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                        {filteredRequests.map((request, index) => (
                            <tr key={request.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{index + 1}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{request.serial}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{request.userName}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{request.shopName}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {formatDate(request.submissionDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={request.status} theme={theme} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button 
                                        onClick={() => handleViewClick(request)} 
                                        title="View Details"
                                        className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}>
                                        <Icon name="view" className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default IDVerificationPage;
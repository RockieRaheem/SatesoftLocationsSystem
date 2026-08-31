
import React, { useState, useMemo } from 'react';
import { Theme, Distributor, User } from '../types';
import Icon, { IconName } from './Icon';
import { mockDistributors } from '../data';
import { maskPhoneNumber, formatDate } from '../utils';
import DistributorModal from './DistributorModal';
import ViewDistributorModal from './ViewDistributorModal';
import DeleteDistributorModal from './DeleteDistributorModal';

const SummaryCard: React.FC<{ icon: IconName; title: string; value: string; theme: Theme; colorClass?: string }> = ({ icon, title, value, theme, colorClass = 'bg-yellow-500 text-slate-900' }) => {
    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
            <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
                <Icon name={icon} className={`h-6 w-6`} />
            </div>
            <div>
                <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
};

interface DistributorsPageProps {
    theme: Theme;
    currentUser: User;
}

const DistributorsPage: React.FC<DistributorsPageProps> = ({ theme, currentUser }) => {
    const [distributors, setDistributors] = useState<Distributor[]>(mockDistributors);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredData = useMemo(() => {
        return distributors.filter(d => 
            d.status === 'Active' && (
                d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.sn.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [distributors, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const handleSaveDistributor = (newDistributor: Partial<Distributor>) => {
        const newId = Math.max(...distributors.map(s => s.id), 0) + 1;
        const newSn = `DIST${Math.floor(Math.random() * 10000000)}`;
        const now = new Date().toISOString();
        
        const distributor: Distributor = {
            ...newDistributor as Distributor, // Type assertion for simplicity
            id: newId,
            sn: newSn,
            status: 'Active',
            suppliedShopsCount: 0,
            createdBy: currentUser.name,
            createdOn: now,
            history: [{ date: now, action: 'Created', details: `Created by ${currentUser.name}` }]
        };
        setDistributors([distributor, ...distributors]);
    };

    const handleUpdateDistributor = (updated: Partial<Distributor>) => {
        if (!selectedDistributor) return;
        const now = new Date().toISOString();
        const historyEntry = { date: now, action: 'Updated' as const, details: `Updated by ${currentUser.name}` };
        
        setDistributors(prev => prev.map(d => d.id === selectedDistributor.id ? { 
            ...d, 
            ...updated,
            history: [historyEntry, ...d.history] 
        } : d));
        setIsEditModalOpen(false);
    };

    const handleDeleteDistributor = (id: number, reason: string) => {
        const now = new Date().toISOString();
        const historyEntry = { date: now, action: 'Deleted' as const, details: `Deleted by ${currentUser.name}. Reason: ${reason}` };
        
        setDistributors(prev => prev.map(d => d.id === id ? { 
            ...d, 
            status: 'Deleted', 
            history: [historyEntry, ...d.history] 
        } : d));
    };

    const openEditModal = (d: Distributor) => {
        setSelectedDistributor(d);
        setIsEditModalOpen(true);
    };

    const openViewModal = (d: Distributor) => {
        setSelectedDistributor(d);
        setIsViewModalOpen(true);
    };

    const openDeleteModal = (d: Distributor) => {
        setSelectedDistributor(d);
        setIsDeleteModalOpen(true);
    };

    const summaryData = useMemo(() => {
        return {
            shops: distributors.length, // Placeholder logic matching image style
            male: 0,
            female: 0,
            total: 0
        };
    }, [distributors]);

    return (
        <>
            <DistributorModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSave={handleSaveDistributor} 
                theme={theme} 
            />
            <DistributorModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={handleUpdateDistributor} 
                initialData={selectedDistributor}
                theme={theme} 
                isEdit
            />
            <ViewDistributorModal 
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                distributor={selectedDistributor}
                theme={theme}
            />
            <DeleteDistributorModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteDistributor}
                distributor={selectedDistributor}
                theme={theme}
            />

            <div className="space-y-6 h-full flex flex-col">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                    <SummaryCard title="Shops" value={filteredData.length.toString()} icon="cart" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Male" value="0" icon="reports" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Female" value="0" icon="camera" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Total" value="0" icon="wallet" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                </div>

                {/* Filter Bar */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0 p-4`}>
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="flex items-center gap-4 w-full md:w-auto">
                            <h2 className={`text-lg font-bold border-b-2 border-yellow-500 pb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Distributors</h2>
                            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className={`pl-3 pr-8 py-1.5 text-sm border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                 <div className={`absolute inset-y-0 right-0 pr-2 flex items-center`}>
                                    <div className={`p-1 ${theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-black text-white'} rounded`}>
                                        <Icon name="search" className="h-3 w-3" />
                                    </div>
                                </div>
                            </div>
                         </div>
                         <div className="w-full md:w-auto flex justify-end">
                             <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Icon name="plus" className="h-4 w-4 text-yellow-500" />
                                New
                            </button>
                         </div>
                     </div>
                </div>

                {/* Table */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-grow flex flex-col overflow-hidden`}>
                    <div className="overflow-x-auto flex-grow">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>#</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Company</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Contact person</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Supplied Shops</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created by</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created on</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {paginatedData.map((d, index) => (
                                    <tr key={d.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{d.companyName}</div>
                                            <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>SN: {d.sn}</div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {d.contactPerson.firstName} {d.contactPerson.lastName} {d.contactPerson.otherName}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {d.phones[0] && d.phones[0].number ? `${d.phones[0].code}${maskPhoneNumber(d.phones[0].number)}` : d.phones[0]?.code || 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{d.suppliedShopsCount}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{d.createdBy}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {formatDate(d.createdOn)}, {new Date(d.createdOn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => openEditModal(d)} title="Edit" className="text-green-500 hover:text-green-600"><Icon name="edit" className="h-4 w-4" /></button>
                                                <button onClick={() => openDeleteModal(d)} title="Delete" className="text-red-500 hover:text-red-600"><Icon name="delete" className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                         <div className="flex items-center">
                             <p className={`text-sm mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Showing {paginatedData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} records
                            </p>
                            <select className={`ml-2 p-1 rounded border text-xs ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-left" className="h-3 w-3 inline" /><Icon name="chevron-left" className="h-3 w-3 inline -ml-1" /></button>
                            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-left" className="h-4 w-4" /></button>
                            <span className={`px-3 py-1 rounded-md text-sm font-bold bg-yellow-400 text-slate-900`}>{currentPage}</span>
                            {currentPage < totalPages && <button onClick={() => setCurrentPage(currentPage + 1)} className={`px-3 py-1 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{currentPage + 1}</button>}
                            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-right" className="h-4 w-4" /></button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"><Icon name="chevron-right" className="h-3 w-3 inline" /><Icon name="chevron-right" className="h-3 w-3 inline -ml-1" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DistributorsPage;

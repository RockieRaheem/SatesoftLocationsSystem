
import React, { useState, useMemo } from 'react';
import { Theme, Manufacturer, User } from '../types';
import Icon, { IconName } from './Icon';
import { mockManufacturers } from '../data';
import { maskPhoneNumber } from '../utils';
import ManufacturerModal from './ManufacturerModal';
import ViewManufacturerModal from './ViewManufacturerModal';
import DeleteManufacturerModal from './DeleteManufacturerModal';

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

interface ManufacturersPageProps {
    theme: Theme;
    currentUser: User;
}

const ManufacturersPage: React.FC<ManufacturersPageProps> = ({ theme, currentUser }) => {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>(mockManufacturers);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredData = useMemo(() => {
        return manufacturers.filter(m => 
            m.status === 'Active' && (
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.country.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [manufacturers, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const handleSaveManufacturer = (newManufacturer: Partial<Manufacturer>) => {
        const newId = Math.max(...manufacturers.map(s => s.id), 0) + 1;
        const newSn = `MFT${Math.floor(Math.random() * 10000000)}`;
        const now = new Date().toISOString();
        
        const manufacturer: Manufacturer = {
            ...newManufacturer as Manufacturer, // Type assertion for simplicity in mock
            id: newId,
            sn: newSn,
            status: 'Active',
            productsCount: 0,
            createdBy: currentUser.name,
            createdOn: now,
            history: [{ date: now, action: 'Created', details: `Created by ${currentUser.name}` }]
        };
        setManufacturers([manufacturer, ...manufacturers]);
    };

    const handleUpdateManufacturer = (updated: Partial<Manufacturer>) => {
        if (!selectedManufacturer) return;
        const now = new Date().toISOString();
        const historyEntry = { date: now, action: 'Updated' as const, details: `Updated by ${currentUser.name}` };
        
        setManufacturers(prev => prev.map(m => m.id === selectedManufacturer.id ? { 
            ...m, 
            ...updated,
            history: [historyEntry, ...m.history] 
        } : m));
        setIsEditModalOpen(false);
    };

    const handleDeleteManufacturer = (id: number, reason: string) => {
        const now = new Date().toISOString();
        const historyEntry = { date: now, action: 'Deleted' as const, details: `Deleted by ${currentUser.name}. Reason: ${reason}` };
        
        setManufacturers(prev => prev.map(m => m.id === id ? { 
            ...m, 
            status: 'Deleted', 
            history: [historyEntry, ...m.history] 
        } : m));
    };

    const openEditModal = (m: Manufacturer) => {
        setSelectedManufacturer(m);
        setIsEditModalOpen(true);
    };

    const openViewModal = (m: Manufacturer) => {
        setSelectedManufacturer(m);
        setIsViewModalOpen(true);
    };

    const openDeleteModal = (m: Manufacturer) => {
        setSelectedManufacturer(m);
        setIsDeleteModalOpen(true);
    };

    const summaryData = useMemo(() => {
        return {
            total: manufacturers.filter(m => m.status === 'Active').length,
            male: 0, // Placeholder based on image
            female: 0 // Placeholder based on image
        };
    }, [manufacturers]);

    return (
        <>
            <ManufacturerModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSave={handleSaveManufacturer} 
                theme={theme} 
            />
            <ManufacturerModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={handleUpdateManufacturer} 
                initialData={selectedManufacturer}
                theme={theme} 
                isEdit
            />
            <ViewManufacturerModal 
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                manufacturer={selectedManufacturer}
                theme={theme}
            />
            <DeleteManufacturerModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteManufacturer}
                manufacturer={selectedManufacturer}
                theme={theme}
            />

            <div className="space-y-6 h-full flex flex-col">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                    <SummaryCard title="Total" value={summaryData.total.toLocaleString()} icon="cart" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Male" value={summaryData.male.toString()} icon="analytics" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Female" value={summaryData.female.toString()} icon="camera" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Total" value="0" icon="wallet" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                </div>

                {/* Filter Bar */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0 p-4`}>
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="flex items-center gap-4 w-full md:w-auto">
                            <h2 className={`text-lg font-bold border-b-2 border-yellow-500 pb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Manufacturers</h2>
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
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Name</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Country</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Distributors</th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Products</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created by</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created on</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {paginatedData.map((m, index) => (
                                    <tr key={m.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{m.name}</div>
                                            <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>SN: {m.sn}</div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{m.country}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {m.phones[0] && m.phones[0].number ? `${m.phones[0].code}${maskPhoneNumber(m.phones[0].number)}` : m.phones[0]?.code || 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{m.distributorIds.length}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{m.productsCount}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{m.createdBy}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {new Date(m.createdOn).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => openEditModal(m)} title="Edit" className="text-green-500 hover:text-green-600"><Icon name="edit" className="h-4 w-4" /></button>
                                                <button onClick={() => openDeleteModal(m)} title="Delete" className="text-red-500 hover:text-red-600"><Icon name="delete" className="h-4 w-4" /></button>
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

export default ManufacturersPage;


import React, { useState, useMemo } from 'react';
import { Theme, Supplier, Shop, User, IDVerificationRequest } from '../types';
import Icon, { IconName } from './Icon';
import { mockSuppliers } from '../data';
import { maskPhoneNumber, formatDate } from '../utils';
import SupplierModal from './SupplierModal';
import ViewSupplierModal from './ViewSupplierModal';
import DeleteSupplierModal from './DeleteSupplierModal';
import RestoreSupplierModal from './RestoreSupplierModal';

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

interface SuppliersPageProps {
    theme: Theme;
    currentUser: User;
    shops: Shop[];
}

const SuppliersPage: React.FC<SuppliersPageProps> = ({ theme, currentUser, shops }) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'Active' | 'Deleted'>('Active');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const activeSuppliers = useMemo(() => suppliers.filter(s => s.status !== 'Deleted'), [suppliers]);
    const deletedSuppliers = useMemo(() => suppliers.filter(s => s.status === 'Deleted'), [suppliers]);

    const filteredData = useMemo(() => {
        const source = activeTab === 'Active' ? activeSuppliers : deletedSuppliers;
        return source.filter(supplier => {
            const matchesSearch = 
                supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.emails.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = statusFilter === 'All' || supplier.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [activeSuppliers, deletedSuppliers, activeTab, searchTerm, statusFilter]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const handleSaveSupplier = (newSupplier: Omit<Supplier, 'id' | 'sn' | 'status' | 'createdBy' | 'createdOn' | 'history'>) => {
        const newId = Math.max(...suppliers.map(s => s.id), 0) + 1;
        const newSn = `SUP${Math.floor(Math.random() * 10000000)}`;
        const now = new Date().toISOString();
        
        const supplier: Supplier = {
            ...newSupplier,
            id: newId,
            sn: newSn,
            status: (newSupplier as any).status || 'Active',
            createdBy: currentUser.name,
            createdOn: now,
            history: [{ date: now, action: 'Created', details: `Created by ${currentUser.name}` }]
        };
        setSuppliers([supplier, ...suppliers]);
    };

    const handleUpdateSupplier = (updatedSupplier: Supplier) => {
        const now = new Date().toISOString();
        const historyEntry = { date: now, action: 'Updated' as const, details: `Updated by ${currentUser.name}` };
        
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? { 
            ...updatedSupplier, 
            history: [historyEntry, ...s.history] 
        } : s));
        setIsEditModalOpen(false);
    };

    const handleDeleteSupplier = (id: number, reason: string) => {
        const now = new Date().toISOString();
        const historyEntry = { date: now, action: 'Deleted' as const, details: `Deleted by ${currentUser.name}. Reason: ${reason}` };
        
        setSuppliers(prev => prev.map(s => s.id === id ? { 
            ...s, 
            status: 'Deleted', 
            history: [historyEntry, ...s.history] 
        } : s));
    };

    const handleRestoreSupplier = (id: number) => {
        const now = new Date().toISOString();
        const historyEntry = { date: now, action: 'Restored' as const, details: `Restored by ${currentUser.name}` };
        
        setSuppliers(prev => prev.map(s => s.id === id ? { 
            ...s, 
            status: 'Active', 
            history: [historyEntry, ...s.history] 
        } : s));
    };

    const openEditModal = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsEditModalOpen(true);
    };

    const openViewModal = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsViewModalOpen(true);
    };

    const openDeleteModal = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDeleteModalOpen(true);
    };
    
    const openRestoreModal = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsRestoreModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800'}`}>Active</span>;
            case 'Inactive':
                return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>Inactive</span>;
            case 'Blacklisted':
                return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800'}`}>Blacklisted</span>;
            case 'Deleted':
                return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>Deleted</span>;
            default:
                return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{status}</span>;
        }
    };

    // Summary Data
    const summaryData = useMemo(() => {
        return {
            shops: suppliers.reduce((acc, s) => acc + (s.status !== 'Deleted' && s.locationType === 'Shop' ? s.locationIds.length : 0), 0),
            warehouses: suppliers.reduce((acc, s) => acc + (s.status !== 'Deleted' && s.locationType === 'Warehouse' ? s.locationIds.length : 0), 0),
            attendants: 0, // Placeholder
            capital: 0, // Placeholder
        };
    }, [suppliers]);

    return (
        <>
            <SupplierModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSave={handleSaveSupplier} 
                theme={theme} 
                shops={shops} 
            />
            <SupplierModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={(data) => handleUpdateSupplier({ ...selectedSupplier!, ...data })} 
                initialData={selectedSupplier}
                theme={theme} 
                shops={shops} 
                isEdit
            />
            <ViewSupplierModal 
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                supplier={selectedSupplier}
                theme={theme}
            />
            <DeleteSupplierModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteSupplier}
                supplier={selectedSupplier}
                theme={theme}
            />
            <RestoreSupplierModal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                onConfirm={handleRestoreSupplier}
                supplier={selectedSupplier}
                theme={theme}
            />

            <div className="space-y-6 h-full flex flex-col">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                    <SummaryCard title="Shops" value={summaryData.shops.toString()} icon="shop-mgt" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Warehouses" value={summaryData.warehouses.toString()} icon="system-settings" theme={theme} colorClass={theme === 'dark' ? 'bg-blue-500 text-slate-900' : 'bg-blue-400 text-slate-900'} />
                    <SummaryCard title="Capital" value={summaryData.capital.toString()} icon="cash" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                    <SummaryCard title="Attendants" value={summaryData.attendants.toString()} icon="users" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                </div>

                {/* Action Bar */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0 p-4 flex flex-col md:flex-row justify-between items-center gap-4`}>
                     <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
                        <h2 className={`text-lg font-bold border-b-2 border-yellow-500 pb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Suppliers</h2>
                        
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

                        {activeTab === 'Active' && (
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`py-1.5 px-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300'}`}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Blacklisted">Blacklisted</option>
                            </select>
                        )}
                     </div>

                     <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                         <div className="flex rounded-md overflow-hidden border border-slate-300 dark:border-slate-600">
                            <button 
                                onClick={() => { setActiveTab('Active'); setCurrentPage(1); setStatusFilter('All'); }}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === 'Active' ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}`}
                            >
                                Current
                            </button>
                            <button 
                                onClick={() => { setActiveTab('Deleted'); setCurrentPage(1); setStatusFilter('All'); }}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === 'Deleted' ? 'bg-red-500 text-white' : (theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}`}
                            >
                                Deleted
                            </button>
                        </div>
                        
                        {activeTab === 'Active' && (
                             <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Icon name="plus" className="h-4 w-4 text-yellow-500" />
                                New
                            </button>
                        )}
                     </div>
                </div>

                {/* Table */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-grow flex flex-col overflow-hidden`}>
                    <div className="overflow-x-auto flex-grow">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>#</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Company / Business</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Contact Person</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone (Primary)</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Locations</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created by</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created on</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {paginatedData.map((supplier, index) => (
                                    <tr key={supplier.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{supplier.companyName}</div>
                                            <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>SN: {supplier.sn}</div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {supplier.contactPerson.firstName} {supplier.contactPerson.lastName}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {supplier.phones[0] ? `${supplier.phones[0].code} ${maskPhoneNumber(supplier.phones[0].number)}` : 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>{supplier.locationType}s: {supplier.locationIds.length}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getStatusBadge(supplier.status)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {supplier.createdBy}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <div>{formatDate(supplier.createdOn)}</div>
                                            <div className="text-xs opacity-70">{new Date(supplier.createdOn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {activeTab === 'Active' ? (
                                                <div className="flex items-center space-x-3">
                                                    <button onClick={() => openViewModal(supplier)} title="View" className="text-green-500 hover:text-green-600"><Icon name="view" className="h-4 w-4" /></button>
                                                    <button onClick={() => openEditModal(supplier)} title="Edit" className="text-green-500 hover:text-green-600"><Icon name="edit" className="h-4 w-4" /></button>
                                                    <button onClick={() => openDeleteModal(supplier)} title="Delete" className="text-red-500 hover:text-red-600"><Icon name="delete" className="h-4 w-4" /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-3">
                                                    <button onClick={() => openViewModal(supplier)} title="View History" className="text-green-500 hover:text-green-600"><Icon name="view" className="h-4 w-4" /></button>
                                                    <button onClick={() => openRestoreModal(supplier)} title="Reinstate" className="text-blue-500 hover:text-blue-600 flex items-center gap-1"><Icon name="refresh" className="h-4 w-4" /></button>
                                                </div>
                                            )}
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
                                Showing {filteredData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} records
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

export default SuppliersPage;

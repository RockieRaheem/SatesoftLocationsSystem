
import React, { useState, useMemo } from 'react';
import { Theme, Lead, User, ShopUser, SuperUser } from '../types';
import Icon, { IconName } from './Icon';
import { mockLeads } from '../data';
import { maskPhoneNumber, formatDate } from '../utils';
import LeadModal from './LeadModal';
import ViewLeadModal from './ViewLeadModal';
import DeleteLeadModal from './DeleteLeadModal';

interface LeadsPageProps {
  theme: Theme;
  users?: (ShopUser | SuperUser)[];
}

const SummaryCard: React.FC<{ title: string; value: string; icon: IconName; theme: Theme; colorClass?: string }> = ({ title, value, icon, theme, colorClass = 'bg-yellow-500 text-slate-900' }) => {
    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border transition-all hover:shadow-md`}>
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

const LeadsPage: React.FC<LeadsPageProps> = ({ theme, users = [] }) => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const ITEMS_PER_PAGE = 10;

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.number.includes(searchTerm) ||
      lead.physicalLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const paginatedLeads = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startRecord = filteredLeads.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length);

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'Hot': return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-800'}`}>Hot</span>;
          case 'Warm': return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>Warm</span>;
          case 'Cold': return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>Cold</span>;
          default: return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{status}</span>;
      }
  };

  const handleSaveLead = (newLead: Partial<Lead>) => {
    const newId = Math.max(...leads.map(l => l.id), 0) + 1;
    const lead: Lead = {
        ...newLead as Lead,
        id: newId,
        createdBy: 'Current User',
        createdDate: new Date().toISOString()
    };
    setLeads([lead, ...leads]);
  };

  const handleUpdateLead = (updated: Partial<Lead>) => {
    if (!selectedLead) return;
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, ...updated } : l));
    setIsEditModalOpen(false);
  };

  const handleDeleteLead = (id: number) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const openViewModal = (lead: Lead) => {
      setSelectedLead(lead);
      setIsViewModalOpen(true);
  };
  
  const openEditModal = (lead: Lead) => {
      setSelectedLead(lead);
      setIsEditModalOpen(true);
  };

  const openDeleteModal = (lead: Lead) => {
      setSelectedLead(lead);
      setIsDeleteModalOpen(true);
  };

  const summaryData = {
      shops: 0, 
      attendants: 0,
      capital: 0,
      removedCapital: 0
  };

  return (
    <>
        <LeadModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSave={handleSaveLead} 
            theme={theme}
            users={users} 
        />
        <LeadModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleUpdateLead} 
            initialData={selectedLead}
            theme={theme}
            users={users} 
        />
        <ViewLeadModal 
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            lead={selectedLead}
            theme={theme}
        />
        <DeleteLeadModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteLead}
            lead={selectedLead}
            theme={theme}
        />

        <div className="space-y-6 h-full flex flex-col">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                <SummaryCard title="Shops" value={summaryData.shops.toString()} icon="shop-mgt" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                <SummaryCard title="Attendants" value={summaryData.attendants.toString()} icon="users" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                <SummaryCard title="Capital" value={summaryData.capital.toString()} icon="cash" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
                <SummaryCard title="Removed Capital" value={summaryData.removedCapital.toString()} icon="wallet" theme={theme} colorClass={theme === 'dark' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-400 text-slate-900'} />
            </div>

            {/* Filter Accordion */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0`}>
                <div 
                    className="flex justify-between items-center p-4 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                >
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Filter</span>
                    <Icon name="chevron-right" className={`h-4 w-4 text-slate-400 transition-transform ${isFilterVisible ? 'rotate-90' : ''}`} />
                </div>
                {isFilterVisible && (
                    <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Filter options would go here...</p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-grow flex flex-col overflow-hidden`}>
                
                {/* Header Toolbar */}
                <div className={`p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <h2 className={`text-lg font-bold border-b-2 border-yellow-500 pb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Leads</h2>
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
                    
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button className={`px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 ${theme === 'dark' ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-700'}`}>
                            <Icon name="upload" className="h-4 w-4" />
                            Upload
                        </button>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Icon name="plus" className="h-4 w-4 text-yellow-500" />
                            New
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto flex-grow">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>#</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Name</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Stage</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Source</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Physical location</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Owner</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created By</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Created on</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {paginatedLeads.map((lead, index) => (
                                <tr key={lead.id} className={`${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-colors cursor-pointer`} onClick={() => openViewModal(lead)}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <div className="flex items-center gap-2">
                                            {startRecord + index} <Icon name="chevron-right" className="h-3 w-3" />
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {lead.companyName}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {maskPhoneNumber(lead.phone.number)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {lead.stage}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {lead.source}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {lead.physicalLocation}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {lead.owner}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getStatusBadge(lead.status)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {lead.createdBy}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {formatDate(lead.createdDate)}<br/>
                                        {new Date(lead.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => openEditModal(lead)} className="text-green-500 hover:text-green-600 transition-transform active:scale-90" title="Edit"><Icon name="edit" className="h-4 w-4" /></button>
                                            <button onClick={() => openViewModal(lead)} className="text-green-500 hover:text-green-600 transition-transform active:scale-90" title="View"><Icon name="view" className="h-4 w-4" /></button>
                                            <button className="text-blue-500 hover:text-blue-600 transition-transform active:scale-90" title="Sync"><Icon name="refresh" className="h-4 w-4" /></button>
                                            <button onClick={() => openDeleteModal(lead)} className="text-red-500 hover:text-red-600 transition-transform active:scale-90" title="Delete"><Icon name="delete" className="h-4 w-4" /></button>
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
                        Showing {filteredLeads.length > 0 ? startRecord : 0} to {endRecord} of {filteredLeads.length} records
                        </p>
                        <select className={`ml-2 p-1 rounded border text-xs ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50 active:scale-90 transition-transform"><Icon name="chevron-left" className="h-3 w-3 inline" /><Icon name="chevron-left" className="h-3 w-3 inline -ml-1" /></button>
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 active:scale-90 transition-transform"><Icon name="chevron-left" className="h-4 w-4" /></button>
                        <span className={`px-3 py-1 rounded-md text-sm font-bold bg-yellow-400 text-slate-900`}>{currentPage}</span>
                        {currentPage < totalPages && <button onClick={() => setCurrentPage(currentPage + 1)} className={`px-3 py-1 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-transform ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{currentPage + 1}</button>}
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 active:scale-90 transition-transform"><Icon name="chevron-right" className="h-4 w-4" /></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50 active:scale-90 transition-transform"><Icon name="chevron-right" className="h-3 w-3 inline" /><Icon name="chevron-right" className="h-3 w-3 inline -ml-1" /></button>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};

export default LeadsPage;

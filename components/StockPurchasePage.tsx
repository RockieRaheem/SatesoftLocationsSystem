import React, { useState, useMemo } from 'react';
import { Theme, Purchase, User, ProductDefinition } from '../types';
import Icon from './Icon';
import NewStockPurchaseModal from './NewStockPurchaseModal';
import ViewPurchaseModal from './ViewPurchaseModal';
import EditStockPurchaseModal from './EditStockPurchaseModal';
import ConfirmationModal from './ConfirmationModal';
import EntriesModal from './EntriesModal';
import { mockPurchases } from '../data';
import { formatDate } from '../utils';

interface StockPurchasePageProps {
  theme: Theme;
  currentUser: User;
  products: ProductDefinition[];
}

const StockPurchasePage: React.FC<StockPurchasePageProps> = ({ theme, currentUser, products }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const handleSaveNewPurchase = (newPurchaseData: Omit<Purchase, 'id' | 'bulkEntrySerial'>) => {
    const newId = purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1;
    const newBulkEntrySerial = `BES-${String(newId).padStart(3, '0')}`;
    
    const newPurchase: Purchase = {
      ...newPurchaseData,
      id: newId,
      bulkEntrySerial: newBulkEntrySerial,
    };
    
    setPurchases(prev => [newPurchase, ...prev]);
  };

  const handleUpdatePurchase = (updatedPurchase: Purchase) => {
    setPurchases(prev => prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
  };
  
  const openViewModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsViewModalOpen(true);
  };

  const openEditModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (purchase: Purchase) => {
    setPurchaseToDelete(purchase);
    setIsDeleteModalOpen(true);
  };
  
  const openEntriesModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsEntriesModalOpen(true);
  }

  const handleDeletePurchase = () => {
    if (purchaseToDelete) {
      setPurchases(prev => prev.filter(p => p.id !== purchaseToDelete.id));
      setPurchaseToDelete(null);
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.bulkEntrySerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPurchases, currentPage]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const StatusBadge: React.FC<{ reconciled?: boolean }> = ({ reconciled }) => {
    const statusText = reconciled ? 'Reconciled' : 'Unreconciled';
    const colorClasses = reconciled 
      ? (theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800')
      : (theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800');
    
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{statusText}</span>;
  };
  
  return (
    <>
      <NewStockPurchaseModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSave={handleSaveNewPurchase} theme={theme} currentUser={currentUser} products={products} />
      <ViewPurchaseModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} purchase={selectedPurchase} theme={theme} currentUser={currentUser} />
      <EditStockPurchaseModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdatePurchase} purchase={selectedPurchase} theme={theme} />
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePurchase}
        title="Delete Purchase Record"
        message={`Are you sure you want to delete the purchase record ${purchaseToDelete?.bulkEntrySerial}? This action cannot be undone.`}
        theme={theme}
        intent="danger"
        confirmText="Delete"
      />
      <EntriesModal isOpen={isEntriesModalOpen} onClose={() => setIsEntriesModalOpen(false)} purchase={selectedPurchase} theme={theme} onUpdatePurchase={handleUpdatePurchase} currentUser={currentUser} />

      <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by serial, shop, or invoice..."
                className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'}`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
          <button onClick={() => setIsNewModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600">
            <Icon name="stock-purchase" className="h-4 w-4" />
            <span>New Stock Purchase</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
              <tr>
                {['#', 'Serial', 'Shop', 'Amount', 'Date', 'Status', 'Actions'].map((header) => (
                  <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
              {paginatedPurchases.map((purchase, index) => (
                <tr key={purchase.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{ (currentPage - 1) * itemsPerPage + index + 1 }</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{purchase.bulkEntrySerial}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{purchase.shop}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{purchase.amount}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {formatDate(purchase.dateOfPurchase)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge reconciled={purchase.reconciled} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => openViewModal(purchase)} title="View Details" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-yellow-500`}><Icon name="view" className="h-5 w-5"/></button>
                        <button onClick={() => openEditModal(purchase)} title="Edit" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-blue-500`}><Icon name="edit" className="h-5 w-5"/></button>
                        <button onClick={() => openEntriesModal(purchase)} title="View Entries" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-green-500`}><Icon name="stock-listing" className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(purchase)} title="Delete" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-red-500`}><Icon name="delete" className="h-5 w-5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPurchases.length)}</span> of <span className="font-medium">{filteredPurchases.length}</span> results
                </p>
                <nav className="flex items-center space-x-1">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className={`p-2 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Icon name="chevron-left" className="h-5 w-5" /></button>
                    {[...Array(totalPages).keys()].map(n => 
                        <button key={n} onClick={() => setCurrentPage(n + 1)} className={`px-3 py-1 rounded-md text-sm ${currentPage === n + 1 ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200')}`}>{n + 1}</button>
                    )}
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-md disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Icon name="chevron-right" className="h-5 w-5" /></button>
                </nav>
            </div>
        )}

      </div>
    </>
  );
};

export default StockPurchasePage;
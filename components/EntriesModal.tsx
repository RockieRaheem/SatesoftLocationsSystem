import React, { useState, useEffect } from 'react';
import { Purchase, Theme, SelectedProduct, ReconciliationDetails, User } from '../types';
import Icon from './Icon';
import StockSalesModal from './StockSalesModal';
import ReconciliationCard from './ReconciliationCard';
import { formatDate } from '../utils';

interface EntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  theme: Theme;
  onUpdatePurchase: (purchase: Purchase) => void;
  currentUser: User;
}

const EntriesModal: React.FC<EntriesModalProps> = ({ isOpen, onClose, purchase, theme, onUpdatePurchase, currentUser }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [selectedProductForSales, setSelectedProductForSales] = useState<SelectedProduct | null>(null);
    const [reconcilingSku, setReconcilingSku] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setIsSalesModalOpen(false);
            setSelectedProductForSales(null);
            setReconcilingSku(null);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleViewSalesClick = (product: SelectedProduct) => {
        setSelectedProductForSales(product);
        setIsSalesModalOpen(true);
    };
    
    const handleSaveReconciliation = (productToReconcile: SelectedProduct, details: Omit<ReconciliationDetails, 'reconciledOn'>) => {
        if (!purchase) return;
        const reconciliationData: ReconciliationDetails = {
            ...details,
            reconciledOn: new Date().toISOString(),
        };
        const updatedProducts = purchase.products.map(p =>
            p.sku === productToReconcile.sku ? { ...p, reconciliation: reconciliationData } : p
        );
        const updatedPurchase = { ...purchase, products: updatedProducts };
        onUpdatePurchase(updatedPurchase);
        setReconcilingSku(null); // Close the card on save
    };

    if (!isOpen && !isClosing) return null;
    if (!purchase) return null;

    return (
        <>
            <StockSalesModal
                isOpen={isSalesModalOpen}
                onClose={() => setIsSalesModalOpen(false)}
                purchase={purchase}
                product={selectedProductForSales}
                theme={theme}
                currentUser={currentUser}
            />
            <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
                <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                    <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            Entries for <span className="text-yellow-500">{purchase.bulkEntrySerial}</span>
                        </h2>
                        <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                            <Icon name="x-mark" className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                          <table className="min-w-full">
                            <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}>
                              <tr>
                                {['Product Name', 'SKU', 'Quantity', 'Unit Price', 'Batch #', 'Expiry Date', 'Actions'].map((header) => (
                                  <th key={header} scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            {purchase.products.map((product, index) => (
                                <tbody key={product.sku} className={`transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                                    <tr className={product.reconciliation ? (theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50') : ''}>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{product.name}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{product.sku}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{product.quantity} {product.unit}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>UGX {product.unitPrice.toLocaleString()}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{product.batchNumber || 'N/A'}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{product.expirationDate ? formatDate(product.expirationDate) : 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button title="View Sales" onClick={() => handleViewSalesClick(product)} className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-yellow-500`}>
                                                    <Icon name="cash" className="h-5 w-5"/>
                                                </button>
                                                {product.reconciliation ? (
                                                    <span title={`Reconciled on ${formatDate(product.reconciliation.reconciledOn)}`} className="text-green-500">
                                                        <Icon name="check-circle" className="h-5 w-5"/>
                                                    </span>
                                                ) : (
                                                    <button title="Reconcile Entry" onClick={() => setReconcilingSku(reconcilingSku === product.sku ? null : product.sku)} className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-green-500`}>
                                                        <Icon name="check-circle" className="h-5 w-5"/>
                                                    </button>
                                                )}
                                                <button title="Report Damage" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-orange-500`}>
                                                    <Icon name="exclamation-triangle" className="h-5 w-5"/>
                                                </button>
                                                <button title="Transfer Stock" className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-blue-500`}>
                                                    <Icon name="arrows-right-left" className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {product.remarks && !reconcilingSku && (
                                        <tr className={product.reconciliation ? (theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50') : ''}>
                                            <td colSpan={7} className={`px-4 pb-4 pt-0 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                <div className="pl-1">
                                                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>Remarks: </span>
                                                    <span className="italic">{product.remarks}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {reconcilingSku === product.sku && (
                                         <tr>
                                             <td colSpan={7} className="p-0">
                                                 <ReconciliationCard
                                                     product={product}
                                                     theme={theme}
                                                     onSave={(details) => handleSaveReconciliation(product, details)}
                                                     onCancel={() => setReconcilingSku(null)}
                                                 />
                                             </td>
                                         </tr>
                                    )}
                                </tbody>
                            ))}
                          </table>
                        </div>
                    </div>

                    <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                        <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EntriesModal;
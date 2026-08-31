
import React, { useState } from 'react';
import { StockItem, Theme } from '../types';
import Icon from './Icon';

interface ArchiveStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: number, reason: string) => void;
  stockItem: StockItem | null;
  theme: Theme;
}

const ArchiveStockItemModal: React.FC<ArchiveStockItemModalProps> = ({ isOpen, onClose, onConfirm, stockItem, theme }) => {
    const [reason, setReason] = useState('');
    const [password, setPassword] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setReason('');
            setPassword('');
        }, 300);
    };

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert("Please provide a reason for archiving.");
            return;
        }
        if (!password) {
            alert("Please enter your password to confirm.");
            return;
        }
        // In a real application, you would verify the password here.
        if (stockItem) {
            onConfirm(stockItem.id, reason);
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !stockItem) return null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className={`fixed inset-0 bg-black z-[80] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Archive Stock Item</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className={`p-4 border rounded-md ${theme === 'dark' ? 'bg-red-900/20 border-red-900/50' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                            You are about to archive <strong>{stockItem.productName}</strong> ({stockItem.quantity} {stockItem.unit}). This item will be hidden from the main list.
                        </p>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Reason for archiving <span className="text-red-500">*</span></label>
                        <textarea 
                            className={`w-full rounded-md shadow-sm p-3 border ${commonInputClasses} ${commonFocusClasses}`} 
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g., Damaged, Expired, Discontinued..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Password <span className="text-red-500">*</span></label>
                        <input 
                            type="password"
                            className={`w-full rounded-md shadow-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Confirm with password"
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="ml-3 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                    >
                        Archive
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveStockItemModal;

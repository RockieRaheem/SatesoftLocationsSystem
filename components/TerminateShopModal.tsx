import React, { useState } from 'react';
import { Shop, Theme, TerminationReason } from '../types';
import Icon from './Icon';

interface TerminateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: TerminationReason, remarks: string) => void;
  shop: Shop | null;
  theme: Theme;
}

const terminationReasons: TerminationReason[] = ['Business Closed', 'Breach of Contract', 'Owner Request', 'Other'];

const TerminateShopModal: React.FC<TerminateShopModalProps> = ({ isOpen, onClose, onConfirm, shop, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [reason, setReason] = useState<TerminationReason>('Business Closed');
    const [remarks, setRemarks] = useState('');

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setRemarks('');
            setReason('Business Closed');
        }, 300);
    };

    const handleConfirm = () => {
        if (!remarks.trim() && reason === 'Other') {
            alert('Remarks are required when selecting "Other" as the reason.');
            return;
        }
        onConfirm(reason, remarks);
    };

    if (!isOpen && !isClosing || !shop) return null;
    
    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
    const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-red-500/10`}>
                            <Icon name="delete" className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`} id="modal-title">
                                Terminate Shop
                            </h3>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Are you sure you want to terminate <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{shop.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Reason for Termination</label>
                                    <select value={reason} onChange={e => setReason(e.target.value as TerminationReason)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}>
                                        {terminationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Remarks</label>
                                    <textarea
                                        rows={3}
                                        value={remarks}
                                        onChange={e => setRemarks(e.target.value)}
                                        placeholder="Provide additional details..."
                                        className={`mt-1 w-full p-2 border rounded-md text-sm ${commonInputClasses} ${commonFocusClasses}`}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-black/50' : 'bg-slate-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg`}>
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleConfirm}
                    >
                        Confirm Termination
                    </button>
                    <button
                        type="button"
                        className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:w-auto sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TerminateShopModal;

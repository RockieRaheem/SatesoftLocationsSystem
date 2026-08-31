
import React, { useState } from 'react';
import { Theme, Supplier } from '../types';
import Icon from './Icon';

interface RestoreSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: number) => void;
    supplier: Supplier | null;
    theme: Theme;
}

const RestoreSupplierModal: React.FC<RestoreSupplierModalProps> = ({ isOpen, onClose, onConfirm, supplier, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleConfirm = () => {
        if (supplier) {
            onConfirm(supplier.id);
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !supplier) return null;

    return (
        <div className={`fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-md rounded-lg shadow-xl flex flex-col transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold text-blue-500 flex items-center`}>
                        <Icon name="refresh" className="h-5 w-5 mr-2" />
                        Reinstate Supplier
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        Are you sure you want to reinstate <strong>{supplier.companyName}</strong>? This will move the supplier back to the active list.
                    </p>
                </div>

                <div className={`flex justify-end items-center p-6 border-t space-x-3 ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={handleClose} className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-100'}`}>
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 flex items-center">
                        Reinstate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestoreSupplierModal;

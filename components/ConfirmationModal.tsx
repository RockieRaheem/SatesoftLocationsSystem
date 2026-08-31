import React, { useState, useEffect } from 'react';
import Icon, { IconName } from './Icon';
import { Theme } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks?: string) => void;
  title: string;
  message: string;
  theme: Theme;
  intent?: 'danger' | 'success';
  confirmText?: string;
  showRemarks?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    theme,
    intent = 'danger',
    confirmText = 'Confirm',
    showRemarks = false
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setRemarks('');
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };
    
    const handleConfirmClick = () => {
        onConfirm(remarks);
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    const intentConfig = {
        danger: {
            icon: 'delete' as IconName,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
            buttonBg: 'bg-red-600',
            buttonHoverBg: 'hover:bg-red-700',
        },
        success: {
            icon: 'check-circle' as IconName,
            iconBg: 'bg-green-500/10',
            iconColor: 'text-green-500',
            buttonBg: 'bg-green-600',
            buttonHoverBg: 'hover:bg-green-700',
        },
    };

    const config = intentConfig[intent] || intentConfig.danger;

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                            <Icon name={config.icon} className={`h-6 w-6 ${config.iconColor}`} />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`} id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {message}
                                </p>
                            </div>
                            {showRemarks && (
                                <div className="mt-4">
                                    <label htmlFor="remarks" className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Remarks / Reason for deletion
                                    </label>
                                    <textarea
                                        id="remarks"
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                                        placeholder="Enter remarks here..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-black/50' : 'bg-slate-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg`}>
                    <button
                        type="button"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${config.buttonBg} ${config.buttonHoverBg} focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                        onClick={handleConfirmClick}
                    >
                        {confirmText}
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

export default ConfirmationModal;
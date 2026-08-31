import React, { useState } from 'react';
import { ShopUser, Theme } from '../types';
import Icon from './Icon';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ShopUser | null;
  theme: Theme;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, user, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleConfirm = () => {
        alert(`Password reset OTP sent to ${user?.email}`);
        handleClose();
    };

    if (!isOpen && !isClosing || !user) return null;

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100'}`}>
                            <Icon name="key" className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`} id="modal-title">
                                Reset Password
                            </h3>
                            <div className="mt-2">
                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Are you sure you want to send a password reset OTP to <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{user.name}</strong>?
                                    <br />
                                    <span className="text-xs">(Email: {user.email}, Created by: {user.createdBy})</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-black/50' : 'bg-slate-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg`}>
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleConfirm}
                    >
                        Send OTP
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

export default ResetPasswordModal;
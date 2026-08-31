
import React, { useState } from 'react';
import { Theme, CameraDevice } from '../types';
import Icon from './Icon';

interface DeleteCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deviceId: number, remarks: string) => void;
  device: CameraDevice | null;
  theme: Theme;
}

const DeleteCameraModal: React.FC<DeleteCameraModalProps> = ({ isOpen, onClose, onConfirm, device, theme }) => {
    const [remarks, setRemarks] = useState('');
    const [password, setPassword] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setRemarks('');
            setPassword('');
        }, 300);
    };

    const handleConfirm = () => {
        if (!remarks.trim()) {
            alert("Please enter remarks for deletion.");
            return;
        }
        if (!password) {
            alert("Please enter your password to confirm.");
            return;
        }
        // In a real app, we would verify the password here.
        if (device) {
            onConfirm(device.id, remarks);
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !device) return null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';

    return (
        <div className={`fixed inset-0 bg-black z-[60] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Delete Device</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className={`p-4 border rounded-md ${theme === 'dark' ? 'bg-red-900/20 border-red-900/50' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                            You are about to delete <strong>{device.name}</strong>. This device will be moved to the deleted list.
                        </p>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Remarks (Reason for deletion)</label>
                        <textarea 
                            className={`w-full rounded-md shadow-sm p-3 border ${commonInputClasses} focus:outline-none focus:ring-2 focus:ring-red-500`} 
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="e.g., Device faulty, replaced..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                        <input 
                            type="password"
                            className={`w-full rounded-md shadow-sm px-3 py-2 border ${commonInputClasses} focus:outline-none focus:ring-2 focus:ring-red-500`} 
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
                        Delete Device
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCameraModal;

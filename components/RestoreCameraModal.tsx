
import React, { useState } from 'react';
import { Theme, CameraDevice, ShopUser, SuperUser } from '../types';
import Icon from './Icon';

interface RestoreCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deviceId: number, remarks: string) => void;
  device: CameraDevice | null;
  theme: Theme;
  users: (ShopUser | SuperUser)[];
}

const RestoreCameraModal: React.FC<RestoreCameraModalProps> = ({ isOpen, onClose, onConfirm, device, theme, users }) => {
    const [remarks, setRemarks] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setRemarks('');
        }, 300);
    };

    const handleConfirm = () => {
        if (!remarks.trim()) {
            alert("Please enter remarks for restoration.");
            return;
        }
        if (device) {
            const owner = users.find(u => u.id === device.ownerIdForOtp);
            alert(`Restoration initiated. An OTP request has been sent to ${owner?.name || 'the shop owner'}. Please verify in the Active Devices list.`);
            onConfirm(device.id, remarks);
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !device) return null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
    const owner = users.find(u => u.id === device.ownerIdForOtp);

    return (
        <div className={`fixed inset-0 bg-black z-[60] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Restore Device</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Restoring <strong>{device.name}</strong> will move it back to the Pending list. An OTP will be sent to the owner to re-verify the connection.
                    </p>
                    
                    {owner && (
                         <div className={`p-3 rounded border text-xs ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                             <strong>Owner to notify:</strong> {owner.name} ({owner.phonePrimary?.code} {owner.phonePrimary?.number})
                         </div>
                    )}

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Restoration Remarks</label>
                        <textarea 
                            className={`w-full rounded-md shadow-sm p-3 border ${commonInputClasses} focus:outline-none focus:ring-2 focus:ring-yellow-500`} 
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Reason for restoring..."
                            rows={3}
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600"
                    >
                        Send OTP & Restore
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestoreCameraModal;

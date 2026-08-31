
import React, { useState } from 'react';
import { Theme, CameraDevice } from '../types';
import Icon from './Icon';

interface VerifyCameraOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (deviceId: number) => void;
  device: CameraDevice | null;
  theme: Theme;
}

const VerifyCameraOTPModal: React.FC<VerifyCameraOTPModalProps> = ({ isOpen, onClose, onVerify, device, theme }) => {
    const [otp, setOtp] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setOtp('');
        }, 300);
    };

    const handleVerify = () => {
        if (otp.length < 4) {
            alert("Please enter a valid OTP.");
            return;
        }
        if (device) {
            onVerify(device.id);
        }
    };

    if (!isOpen && !isClosing || !device) return null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';

    return (
        <div className={`fixed inset-0 bg-black z-[60] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Verify Device Connection</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Enter the OTP sent to the shop owner's phone to approve <strong>{device.name}</strong>.
                    </p>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>One-Time Password (OTP)</label>
                        <input 
                            type="text" 
                            className={`w-full text-center text-xl tracking-widest rounded-md shadow-sm px-3 py-3 border ${commonInputClasses}`} 
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="• • • •"
                            maxLength={6}
                        />
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleVerify}
                        className="ml-3 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
                    >
                        Approve Device
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyCameraOTPModal;


import React, { useState, useEffect } from 'react';
import { Client, Theme } from '../types';
import Icon from './Icon';

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (client: Client) => void;
    client: Client | null;
    theme: Theme;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, onUpdate, client, theme }) => {
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen && client) {
            setFormData({ ...client });
            setStep(1);
            setOtp('');
        }
    }, [isOpen, client]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleWallet = () => {
        setFormData(prev => ({ ...prev, walletEnabled: !prev.walletEnabled }));
    };

    const handleSave = () => {
        if (!client) return;

        // Check if critical wallet settings changed
        const walletChanged = formData.walletEnabled !== client.walletEnabled;
        const limitChanged = formData.debtLimit !== client.debtLimit;

        // If wallet enabled or limit changed, require OTP
        if ((walletChanged && formData.walletEnabled) || (limitChanged && formData.walletEnabled)) {
            setStep(2);
        } else {
            finalizeUpdate();
        }
    };

    const handleVerifyOtp = () => {
        if (otp.length < 4) {
            alert("Please enter a valid 4-digit OTP sent to the client.");
            return;
        }
        finalizeUpdate();
    };

    const finalizeUpdate = () => {
        if (client) {
            onUpdate({
                ...client,
                ...formData as Client,
                debtLimit: Number(formData.debtLimit) || 0
            });
            handleClose();
        }
    };

    if (!isOpen && !isClosing || !client) return null;

    const inputClass = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className={`fixed inset-0 bg-black z-[80] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {step === 1 ? 'Edit Client' : 'Security Verification'}
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {step === 1 ? (
                        <>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Name</label>
                                <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Phone</label>
                                <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Location</label>
                                <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className={inputClass} />
                            </div>
                            
                            <div className={`p-4 rounded-lg border mt-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Allow Wallet</span>
                                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Enable digital wallet for this client.</p>
                                    </div>
                                    <button 
                                        onClick={handleToggleWallet}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.walletEnabled ? 'bg-green-500' : 'bg-slate-400'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.walletEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                                
                                {formData.walletEnabled && (
                                    <div className="mt-3 pt-3 border-t border-dashed border-slate-300 dark:border-slate-600">
                                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Debt Limit</label>
                                        <input 
                                            type="number" 
                                            name="debtLimit" 
                                            value={formData.debtLimit} 
                                            onChange={handleInputChange} 
                                            className={inputClass} 
                                            placeholder="0.00"
                                        />
                                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Changing this requires OTP verification from the client.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                                    <Icon name="lock" className="h-8 w-8" />
                                </div>
                            </div>
                            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                You are modifying wallet limits. An OTP has been sent to <strong>{client.phone}</strong>. Please enter it below to confirm.
                            </p>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={e => setOtp(e.target.value)} 
                                maxLength={4}
                                placeholder="Enter 4-digit OTP"
                                className={`w-full text-center text-2xl tracking-widest py-3 rounded-md border font-mono ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>
                    )}
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    {step === 1 ? (
                        <button onClick={handleSave} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                            Save Changes
                        </button>
                    ) : (
                        <button onClick={handleVerifyOtp} className="ml-3 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700">
                            Verify & Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditClientModal;

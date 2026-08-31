
import React, { useState, useMemo } from 'react';
import { Theme, Shop } from '../types';
import Icon from './Icon';

interface WalletTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransaction: (clientId: number, amount: number, type: 'Add' | 'Reduce', remarks: string) => void;
    theme: Theme;
    shops: Shop[];
    clients: { id: number, name: string }[];
}

const WalletTransactionModal: React.FC<WalletTransactionModalProps> = ({ isOpen, onClose, onTransaction, theme, shops, clients }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    
    const [formData, setFormData] = useState({
        shopId: '',
        clientId: '',
        amount: '',
        type: 'Add' as 'Add' | 'Reduce',
        remarks: ''
    });

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setStep(1);
            setOtp('');
            setFormData({ shopId: '', clientId: '', amount: '', type: 'Add', remarks: '' });
        }, 300);
    };

    const handleNext = () => {
        const shop = shops.find(s => s.id === parseInt(formData.shopId));
        
        if (!shop || !formData.clientId || !formData.amount) {
            alert("Please fill all required fields.");
            return;
        }

        // Check if OTP is required
        // Requirement: OTP required if adding debt (Reducing balance) AND shop setting is enabled
        if (formData.type === 'Reduce' && shop.settings.requireOtpForWalletUpdates) {
            setStep(2);
        } else {
            // No OTP needed, proceed
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        onTransaction(parseInt(formData.clientId), parseFloat(formData.amount), formData.type, formData.remarks);
        handleClose();
    };

    const handleVerifyOtp = () => {
        if (otp.length < 4) {
            alert("Please enter a valid 4-digit OTP.");
            return;
        }
        // In a real app, verify backend call here
        handleSubmit();
    };

    if (!isOpen && !isClosing) return null;

    const inputClass = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 border text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`;
    const labelClass = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`;

    return (
        <div className={`fixed inset-0 bg-black z-[90] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {step === 1 ? 'Update Wallet Balance' : 'Security Verification'}
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {step === 1 && (
                        <>
                            <div>
                                <label className={labelClass}>Shop</label>
                                <select value={formData.shopId} onChange={e => setFormData({...formData, shopId: e.target.value})} className={inputClass}>
                                    <option value="">Select Shop</option>
                                    {shops.map(shop => (
                                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Client</label>
                                <select value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className={inputClass}>
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Action</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className={inputClass}>
                                        <option value="Add">Add Funds</option>
                                        <option value="Reduce">Reduce Funds</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Amount</label>
                                    <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className={inputClass} min="0" placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Remarks (Optional)</label>
                                <textarea 
                                    value={formData.remarks} 
                                    onChange={e => setFormData({...formData, remarks: e.target.value})} 
                                    className={inputClass} 
                                    rows={2}
                                    placeholder="Reason for transaction..."
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                                    <Icon name="lock" className="h-8 w-8" />
                                </div>
                            </div>
                            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                This action requires verification. An OTP has been sent to the client's registered phone number.
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
                        <button onClick={handleNext} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                            Continue
                        </button>
                    ) : (
                        <button onClick={handleVerifyOtp} className="ml-3 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700">
                            Verify & Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletTransactionModal;


import React, { useState, useEffect } from 'react';
import { Theme, Distributor } from '../types';
import Icon from './Icon';
import { maskPhoneNumber } from '../utils';

interface ViewDistributorModalProps {
    isOpen: boolean;
    onClose: () => void;
    distributor: Distributor | null;
    theme: Theme;
}

const ViewDistributorModal: React.FC<ViewDistributorModalProps> = ({ isOpen, onClose, distributor, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen && !isClosing || !distributor) return null;

    const DetailItem = ({ label, value }: { label: string, value: string | number | React.ReactNode }) => (
        <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
            <div className={`mt-1 font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value || 'N/A'}</div>
        </div>
    );

    const fullName = `${distributor.contactPerson.firstName} ${distributor.contactPerson.lastName} ${distributor.contactPerson.otherName || ''}`;

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{distributor.companyName}</h2>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>SN: {distributor.sn}</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                     <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`text-sm font-bold mb-4 border-b pb-2 ${theme === 'dark' ? 'text-slate-200 border-slate-700' : 'text-slate-800 border-slate-200'}`}>Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Contact Person" value={fullName} />
                            <DetailItem label="Supplier" value={distributor.supplierName} />
                            <DetailItem label="Email Addresses" value={
                                <div className="space-y-1">
                                    {distributor.emails.map((email, idx) => email && (
                                        <div key={idx} className="flex items-center text-sm">
                                            <Icon name="chat-bubble" className="w-3 h-3 mr-2 opacity-50" />
                                            {email}
                                        </div>
                                    ))}
                                </div>
                            } />
                            <DetailItem label="Phone Numbers" value={
                                <div className="space-y-1">
                                    {distributor.phones.map((phone, idx) => phone.number && (
                                        <div key={idx} className="flex items-center text-sm">
                                            <Icon name="phone" className="w-3 h-3 mr-2 opacity-50" />
                                            {phone.code} {maskPhoneNumber(phone.number)}
                                        </div>
                                    ))}
                                </div>
                            } />
                        </div>
                     </div>

                     <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks</p>
                                <p className={`mt-1 text-sm italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>"{distributor.remarks || 'No remarks'}"</p>
                            </div>
                        </div>
                     </div>
                </div>

                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={handleClose} className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewDistributorModal;

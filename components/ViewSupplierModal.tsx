
import React, { useState, useEffect } from 'react';
import { Theme, Supplier } from '../types';
import Icon from './Icon';
import { maskPhoneNumber } from '../utils';

interface ViewSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: Supplier | null;
    theme: Theme;
}

const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({ isOpen, onClose, supplier, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setActiveTab('details');
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen && !isClosing || !supplier) return null;

    const DetailItem = ({ label, value }: { label: string, value: string | number | React.ReactNode }) => (
        <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
            <div className={`mt-1 font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value || 'N/A'}</div>
        </div>
    );

    const fullName = `${supplier.contactPerson.firstName} ${supplier.contactPerson.lastName} ${supplier.contactPerson.otherName || ''}`;

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{supplier.companyName}</h2>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>SN: {supplier.sn}</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className={`px-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex space-x-6">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            History log
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'details' ? (
                        <div className="space-y-6">
                             <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <h3 className={`text-sm font-bold mb-4 border-b pb-2 ${theme === 'dark' ? 'text-slate-200 border-slate-700' : 'text-slate-800 border-slate-200'}`}>Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailItem label="Contact Person" value={fullName} />
                                    <DetailItem label="Country" value={supplier.country} />
                                    <DetailItem label="Email Addresses" value={
                                        <div className="space-y-1">
                                            {supplier.emails.map((email, idx) => email && (
                                                <div key={idx} className="flex items-center text-sm">
                                                    <Icon name="chat-bubble" className="w-3 h-3 mr-2 opacity-50" />
                                                    {email} {idx === 0 && <span className="text-[10px] opacity-60 ml-2">(Primary)</span>}
                                                </div>
                                            ))}
                                        </div>
                                    } />
                                    <DetailItem label="Phone Numbers" value={
                                        <div className="space-y-1">
                                            {supplier.phones.map((phone, idx) => phone.number && (
                                                <div key={idx} className="flex items-center text-sm">
                                                    <Icon name="phone" className="w-3 h-3 mr-2 opacity-50" />
                                                    {phone.code} {maskPhoneNumber(phone.number)} {idx === 0 && <span className="text-[10px] opacity-60 ml-2">(Primary)</span>}
                                                </div>
                                            ))}
                                        </div>
                                    } />
                                </div>
                             </div>

                             <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <h3 className={`text-sm font-bold mb-4 border-b pb-2 ${theme === 'dark' ? 'text-slate-200 border-slate-700' : 'text-slate-800 border-slate-200'}`}>Business Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailItem label="Status" value={supplier.status} />
                                    <DetailItem label="Location Type" value={supplier.locationType} />
                                    <div className="md:col-span-2">
                                        <DetailItem label="Locations (Shops/Warehouses)" value={supplier.locationNames} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks</p>
                                        <p className={`mt-1 text-sm italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>"{supplier.remarks || 'No remarks'}"</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                             <div className="relative pl-4 border-l border-slate-300 dark:border-slate-700 space-y-8">
                                {supplier.history.map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-500' : 'bg-white border-slate-400'}`}></div>
                                        <div>
                                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.action}</p>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(item.date).toLocaleString()}</p>
                                            {item.details && <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.details}</p>}
                                        </div>
                                    </div>
                                ))}
                                {supplier.history.length === 0 && <p className="text-sm italic text-slate-500">No history recorded.</p>}
                             </div>
                        </div>
                    )}
                </div>

                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={handleClose} className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewSupplierModal;

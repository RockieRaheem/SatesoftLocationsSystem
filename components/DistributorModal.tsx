
import React, { useState, useEffect } from 'react';
import { Theme, Distributor, Supplier, PhoneNumber } from '../types';
import Icon from './Icon';
import PhoneInput from './PhoneInput';
import { mockSuppliers } from '../data';

interface DistributorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Distributor>) => void;
    initialData?: Distributor | null;
    theme: Theme;
    isEdit?: boolean;
}

const DistributorModal: React.FC<DistributorModalProps> = ({ isOpen, onClose, onSave, initialData, theme, isEdit = false }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState<{
        companyName: string;
        firstName: string;
        lastName: string;
        otherName: string;
        phones: PhoneNumber[];
        emails: string[];
        supplierId: string;
        remarks: string;
    }>({
        companyName: '',
        firstName: '',
        lastName: '',
        otherName: '',
        phones: [{ code: '+256', number: '' }, { code: '+256', number: '' }, { code: '+256', number: '' }],
        emails: ['', '', ''],
        supplierId: '',
        remarks: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const paddedEmails = [...(initialData.emails || [])];
                while (paddedEmails.length < 3) paddedEmails.push('');

                const paddedPhones = [...(initialData.phones || [])];
                while (paddedPhones.length < 3) paddedPhones.push({ code: '+256', number: '' });

                setFormData({
                    companyName: initialData.companyName || '',
                    firstName: initialData.contactPerson?.firstName || '',
                    lastName: initialData.contactPerson?.lastName || '',
                    otherName: initialData.contactPerson?.otherName || '',
                    phones: paddedPhones,
                    emails: paddedEmails,
                    supplierId: initialData.supplierId?.toString() || '',
                    remarks: initialData.remarks || ''
                });
            } else {
                // Reset
                setFormData({
                    companyName: '',
                    firstName: '',
                    lastName: '',
                    otherName: '',
                    phones: [{ code: '+256', number: '' }, { code: '+256', number: '' }, { code: '+256', number: '' }],
                    emails: ['', '', ''],
                    supplierId: '',
                    remarks: ''
                });
            }
            setIsClosing(false);
        }
    }, [isOpen, initialData]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleSave = () => {
        if (!formData.companyName) {
            alert("Company Name is required.");
            return;
        }

        const validEmails = formData.emails.filter(e => e.trim() !== '');
        const validPhones = formData.phones.filter(p => p.number.trim() !== '');
        
        const supplierName = mockSuppliers.find(s => s.id.toString() === formData.supplierId)?.companyName;

        const distributorData: Partial<Distributor> = {
            companyName: formData.companyName,
            contactPerson: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                otherName: formData.otherName
            },
            phones: validPhones,
            emails: validEmails,
            supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
            supplierName: supplierName,
            remarks: formData.remarks
        };
        onSave(distributorData);
        handleClose();
    };

    const handleEmailChange = (index: number, value: string) => {
        const newEmails = [...formData.emails];
        newEmails[index] = value;
        setFormData(prev => ({ ...prev, emails: newEmails }));
    };

    const handlePhoneChange = (index: number, value: PhoneNumber) => {
        const newPhones = [...formData.phones];
        newPhones[index] = value;
        setFormData(prev => ({ ...prev, phones: newPhones }));
    };

    if (!isOpen && !isClosing) return null;

    const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;
    const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`;

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {isEdit ? 'Edit Distributor' : 'Distributor'}
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className={labelClass}>Company name</label>
                        <input type="text" className={inputClass} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    </div>

                    <div>
                        <h3 className={`text-base font-semibold mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Contact person</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>First Name</label>
                                <input type="text" className={inputClass} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Last Name</label>
                                <input type="text" className={inputClass} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Other Name</label>
                                <input type="text" className={inputClass} value={formData.otherName} onChange={e => setFormData({...formData, otherName: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
                                <PhoneInput theme={theme} value={formData.phones[0]} onChange={(val) => handlePhoneChange(0, val)} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Alternative phone number</label>
                                <PhoneInput theme={theme} value={formData.phones[1]} onChange={(val) => handlePhoneChange(1, val)} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Other phone number</label>
                                <PhoneInput theme={theme} value={formData.phones[2]} onChange={(val) => handlePhoneChange(2, val)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email address</label>
                                <input type="email" className={inputClass} value={formData.emails[0]} onChange={e => handleEmailChange(0, e.target.value)} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Secondary email address</label>
                                <input type="email" className={inputClass} value={formData.emails[1]} onChange={e => handleEmailChange(1, e.target.value)} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Other email address</label>
                                <input type="email" className={inputClass} value={formData.emails[2]} onChange={e => handleEmailChange(2, e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Supplier</label>
                        <select className={inputClass} value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                            <option value="">Select Supplier</option>
                            {mockSuppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.companyName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Remarks</label>
                        <textarea 
                            rows={3} 
                            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 text-sm resize-none ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`} 
                            value={formData.remarks} 
                            onChange={e => setFormData({...formData, remarks: e.target.value})}
                        ></textarea>
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t space-x-3 ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-100'}`}>
                        <Icon name="x-mark" className="h-4 w-4 mr-2 inline" /> Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600 flex items-center">
                        <Icon name="check-circle" className="h-4 w-4 mr-2" /> Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DistributorModal;

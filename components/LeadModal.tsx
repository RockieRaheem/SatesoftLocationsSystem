
import React, { useState, useEffect } from 'react';
import { Theme, Lead, PhoneNumber, LeadStage } from '../types';
import Icon from './Icon';
import PhoneInput from './PhoneInput';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Lead>) => void;
    initialData?: Lead | null;
    theme: Theme;
    users: { name: string }[]; // Compatible with any user type that has a name
}

const stages: LeadStage[] = ['New', 'Contact Established', 'Negotiation', 'Won', 'Lost'];
const statuses = ['Hot', 'Warm', 'Cold'];
const sources = ['Referral', 'Offline Marketing', 'One on One', 'Exhibition', 'Social Media', 'Website', 'Other'];

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, initialData, theme, users }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState<{
        companyName: string;
        firstName: string;
        lastName: string;
        phone: PhoneNumber;
        alternativePhone: PhoneNumber;
        email: string;
        physicalAddress: string;
        latitude: string;
        longitude: string;
        stage: LeadStage;
        status: 'Hot' | 'Warm' | 'Cold';
        source: string;
        owner: string;
        remarks: string;
    }>({
        companyName: '',
        firstName: '',
        lastName: '',
        phone: { code: '+256', number: '' },
        alternativePhone: { code: '+256', number: '' },
        email: '',
        physicalAddress: '',
        latitude: '',
        longitude: '',
        stage: 'New',
        status: 'Hot',
        source: '',
        owner: '',
        remarks: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    companyName: initialData.companyName || '',
                    firstName: initialData.firstName || '',
                    lastName: initialData.lastName || '',
                    phone: initialData.phone || { code: '+256', number: '' },
                    alternativePhone: initialData.alternativePhone || { code: '+256', number: '' },
                    email: initialData.email || '',
                    physicalAddress: initialData.physicalLocation || '',
                    latitude: initialData.latitude || '',
                    longitude: initialData.longitude || '',
                    stage: initialData.stage || 'New',
                    status: initialData.status || 'Hot',
                    source: initialData.source || '',
                    owner: initialData.owner || '',
                    remarks: initialData.remarks || ''
                });
            } else {
                // Reset
                setFormData({
                    companyName: '',
                    firstName: '',
                    lastName: '',
                    phone: { code: '+256', number: '' },
                    alternativePhone: { code: '+256', number: '' },
                    email: '',
                    physicalAddress: '',
                    latitude: '',
                    longitude: '',
                    stage: 'New',
                    status: 'Hot',
                    source: '',
                    owner: '',
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
            alert("Shop Name is required.");
            return;
        }
         if (!formData.firstName || !formData.lastName) {
            alert("Name is required.");
            return;
        }
        if (!formData.phone.number) {
            alert("Phone number is required.");
            return;
        }

        const leadData: Partial<Lead> = {
            companyName: formData.companyName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            alternativePhone: formData.alternativePhone.number ? formData.alternativePhone : undefined,
            email: formData.email,
            physicalLocation: formData.physicalAddress,
            latitude: formData.latitude,
            longitude: formData.longitude,
            stage: formData.stage,
            status: formData.status,
            source: formData.source,
            owner: formData.owner,
            remarks: formData.remarks
        };
        onSave(leadData);
        handleClose();
    };

    const handlePhoneChange = (field: 'phone' | 'alternativePhone', value: PhoneNumber) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen && !isClosing) return null;

    const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;
    const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`;

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        Lead Details
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className={labelClass}>Shop Name</label>
                        <input type="text" className={inputClass} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>First Name</label>
                            <input type="text" className={inputClass} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input type="text" className={inputClass} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>Phone Number</label>
                            <PhoneInput theme={theme} value={formData.phone} onChange={(val) => handlePhoneChange('phone', val)} />
                        </div>
                        <div>
                            <label className={labelClass}>Alternative Phone Number</label>
                             <PhoneInput theme={theme} value={formData.alternativePhone} onChange={(val) => handlePhoneChange('alternativePhone', val)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <input type="email" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                         <div>
                            <label className={labelClass}>Physical address</label>
                            <input type="text" className={inputClass} value={formData.physicalAddress} onChange={e => setFormData({...formData, physicalAddress: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Latitude</label>
                            <input type="text" className={inputClass} value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                        </div>
                         <div>
                            <label className={labelClass}>Longitude</label>
                            <input type="text" className={inputClass} value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Stage</label>
                            <select className={inputClass} value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as LeadStage})}>
                                <option value="">Select a Stage</option>
                                {stages.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className={labelClass}>Status</label>
                            <select className={inputClass} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                <option value="">Select a Status</option>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Source</label>
                            <select className={inputClass} value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                                <option value="">Select a Source</option>
                                {sources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className={labelClass}>Owner</label>
                            <select className={inputClass} value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}>
                                <option value="">Select manager</option>
                                {users.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                            </select>
                        </div>
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

export default LeadModal;

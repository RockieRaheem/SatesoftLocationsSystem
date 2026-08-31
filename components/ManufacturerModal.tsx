

import React, { useState, useEffect } from 'react';
import { Theme, Manufacturer, PhoneNumber, Distributor } from '../types';
import Icon from './Icon';
import PhoneInput from './PhoneInput';
import MultiSelectDropdown from './MultiSelectDropdown';
import { allAfricanCountries, mockDistributors } from '../data';

interface ManufacturerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Manufacturer>) => void;
    initialData?: Manufacturer | null;
    theme: Theme;
    isEdit?: boolean;
}

const ManufacturerModal: React.FC<ManufacturerModalProps> = ({ isOpen, onClose, onSave, initialData, theme, isEdit = false }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;
        country: string;
        phones: PhoneNumber[];
        emails: string[];
        postalAddress: string;
        physicalLocation: string;
        website: string;
        distributorIds: string[];
        remarks: string;
    }>({
        name: '',
        country: '',
        phones: [{ code: '+256', number: '' }, { code: '+256', number: '' }, { code: '+256', number: '' }],
        emails: ['', '', ''],
        postalAddress: '',
        physicalLocation: '',
        website: '',
        distributorIds: [],
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
                    name: initialData.name || '',
                    country: initialData.country || '',
                    phones: paddedPhones,
                    emails: paddedEmails,
                    postalAddress: initialData.postalAddress || '',
                    physicalLocation: initialData.physicalLocation || '',
                    website: initialData.website || '',
                    distributorIds: (initialData.distributorIds || []).map(String),
                    remarks: initialData.remarks || ''
                });
            } else {
                // Reset
                setFormData({
                    name: '',
                    country: '',
                    phones: [{ code: '+256', number: '' }, { code: '+256', number: '' }, { code: '+256', number: '' }],
                    emails: ['', '', ''],
                    postalAddress: '',
                    physicalLocation: '',
                    website: '',
                    distributorIds: [],
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
        if (!formData.name) {
            alert("Name is required.");
            return;
        }
        
        const validEmails = formData.emails.filter(e => e.trim() !== '');
        const validPhones = formData.phones.filter(p => p.number.trim() !== '');

        const manufacturerData: Partial<Manufacturer> = {
            name: formData.name,
            country: formData.country,
            phones: validPhones,
            emails: validEmails,
            postalAddress: formData.postalAddress,
            physicalLocation: formData.physicalLocation,
            website: formData.website,
            distributorIds: formData.distributorIds.map(Number),
            remarks: formData.remarks
        };
        onSave(manufacturerData);
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

    const handleDistributorsChange = (selectedNames: string[]) => {
        const ids = selectedNames.map(name => mockDistributors.find(d => d.companyName === name)?.id.toString() || '').filter(Boolean);
        setFormData(prev => ({ ...prev, distributorIds: ids }));
    };

    if (!isOpen && !isClosing) return null;

    const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;
    const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`;

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {isEdit ? 'Edit Manufacturer' : 'Manufacturer'}
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    
                    <div>
                        <label className={labelClass}>Country</label>
                        <select className={inputClass} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}>
                            <option value="">Select Country</option>
                            {allAfricanCountries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            {/* Add common manufacturer countries */}
                            <option value="China">China</option>
                            <option value="India">India</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Pakistan">Pakistan</option>
                             <option value="United Arab Emirates">United Arab Emirates</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Name</label>
                        <input type="text" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>

                    <div>
                        <h3 className={`text-base font-semibold mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Contacts</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
                                <PhoneInput theme={theme} value={formData.phones[0]} onChange={(val) => handlePhoneChange(0, val)} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Secondary phone</label>
                                <PhoneInput theme={theme} value={formData.phones[1]} onChange={(val) => handlePhoneChange(1, val)} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Other phone</label>
                                <PhoneInput theme={theme} value={formData.phones[2]} onChange={(val) => handlePhoneChange(2, val)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             <div>
                                <label className={labelClass}>Postal address</label>
                                <input type="text" className={inputClass} value={formData.postalAddress} onChange={e => setFormData({...formData, postalAddress: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClass}>Physical location</label>
                                <input type="text" className={inputClass} value={formData.physicalLocation} onChange={e => setFormData({...formData, physicalLocation: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClass}>Website</label>
                                <input type="text" className={inputClass} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Distributor</label>
                        <MultiSelectDropdown 
                            theme={theme}
                            options={mockDistributors.map(d => d.companyName)}
                            selected={formData.distributorIds.map(id => mockDistributors.find(d => d.id.toString() === id)?.companyName || '')}
                            onChange={handleDistributorsChange}
                            placeholder="Select Distributor"
                        />
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

export default ManufacturerModal;

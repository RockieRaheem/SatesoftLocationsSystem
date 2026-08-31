
import React, { useState, useEffect } from 'react';
import { Theme, Supplier, Shop, PhoneNumber } from '../types';
import Icon from './Icon';
import PhoneInput from './PhoneInput';
import MultiSelectDropdown from './MultiSelectDropdown';
import { allAfricanCountries } from '../data';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Supplier>) => void;
    initialData?: Supplier | null;
    theme: Theme;
    shops: Shop[];
    isEdit?: boolean;
}

const warehouses = [
    { id: 101, name: 'Main Warehouse - Kampala' },
    { id: 102, name: 'Distribution Center - Jinja' },
    { id: 103, name: 'Storage Unit B' }
];

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, initialData, theme, shops, isEdit = false }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState<{
        locationType: 'Shop' | 'Warehouse';
        locationIds: string[];
        companyName: string;
        emails: string[];
        phones: PhoneNumber[];
        country: string;
        firstName: string;
        lastName: string;
        otherName: string;
        remarks: string;
        status: 'Active' | 'Inactive' | 'Blacklisted';
    }>({
        locationType: 'Shop',
        locationIds: [],
        companyName: '',
        emails: ['', '', ''],
        phones: [{ code: '+256', number: '' }, { code: '+256', number: '' }, { code: '+256', number: '' }],
        country: '',
        firstName: '',
        lastName: '',
        otherName: '',
        remarks: '',
        status: 'Active'
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const paddedEmails = [...(initialData.emails || [])];
                while (paddedEmails.length < 3) paddedEmails.push('');

                const paddedPhones = [...(initialData.phones || [])];
                while (paddedPhones.length < 3) paddedPhones.push({ code: '+256', number: '' });

                setFormData({
                    locationType: initialData.locationType || 'Shop',
                    locationIds: (initialData.locationIds || []).map(String),
                    companyName: initialData.companyName || '',
                    emails: paddedEmails,
                    phones: paddedPhones,
                    country: initialData.country || '',
                    firstName: initialData.contactPerson?.firstName || '',
                    lastName: initialData.contactPerson?.lastName || '',
                    otherName: initialData.contactPerson?.otherName || '',
                    remarks: initialData.remarks || '',
                    status: (initialData.status === 'Deleted' ? 'Active' : initialData.status) as 'Active' | 'Inactive' | 'Blacklisted'
                });
            } else {
                // Reset for Add mode
                 setFormData({
                    locationType: 'Shop',
                    locationIds: [],
                    companyName: '',
                    emails: ['', '', ''],
                    phones: [{ code: '+256', number: '' }, { code: '+256', number: '' }, { code: '+256', number: '' }],
                    country: '',
                    firstName: '',
                    lastName: '',
                    otherName: '',
                    remarks: '',
                    status: 'Active'
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
        // Basic Validation
        if (!formData.companyName || !formData.firstName || !formData.lastName) {
            alert("Please fill in required fields (Company Name, Contact Person).");
            return;
        }
        if (!formData.emails[0] || !formData.phones[0].number) {
             alert("Primary Email and Primary Phone Number are required.");
             return;
        }

        // Filter out empty emails and phones
        const validEmails = formData.emails.filter(e => e.trim() !== '');
        const validPhones = formData.phones.filter(p => p.number.trim() !== '');

        const locationList = formData.locationType === 'Shop' ? shops : warehouses;
        const locationNames = formData.locationIds.map(id => locationList.find(l => l.id.toString() === id)?.name || '').filter(Boolean).join(', ');

        const supplierData: Partial<Supplier> = {
            companyName: formData.companyName,
            locationType: formData.locationType,
            locationIds: formData.locationIds.map(Number),
            locationNames: locationNames || 'None',
            emails: validEmails,
            phones: validPhones,
            country: formData.country,
            contactPerson: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                otherName: formData.otherName
            },
            remarks: formData.remarks,
            status: formData.status
        };
        onSave(supplierData);
        handleClose();
    };

    const handleLocationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, locationType: e.target.value as any, locationIds: [] }));
    };

    const handleLocationChange = (selectedNames: string[]) => {
        const list = formData.locationType === 'Shop' ? shops : warehouses;
        const ids = selectedNames.map(name => list.find(l => l.name === name)?.id.toString() || '').filter(Boolean);
        setFormData(prev => ({ ...prev, locationIds: ids }));
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

    const locationOptions = formData.locationType === 'Shop' ? shops : warehouses;

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {isEdit ? 'Edit Supplier' : 'New Supplier'}
                    </h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* Location Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label className={labelClass}>Location Type</label>
                            <select className={inputClass} value={formData.locationType} onChange={handleLocationTypeChange}>
                                <option value="Shop">Shop</option>
                                <option value="Warehouse">Warehouse</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className={labelClass}>Select {formData.locationType}(s)</label>
                             <MultiSelectDropdown 
                                 theme={theme}
                                 options={locationOptions.map(s => s.name)}
                                 selected={formData.locationIds.map(id => locationOptions.find(l => l.id.toString() === id)?.name || '')}
                                 onChange={handleLocationChange}
                                 placeholder={`Select one or more ${formData.locationType.toLowerCase()}s`}
                             />
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Company or business name <span className="text-red-500">*</span></label>
                            <input type="text" className={inputClass} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Country</label>
                            <select className={inputClass} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}>
                                <option value="">Select Country</option>
                                {allAfricanCountries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                     {/* Status Field */}
                     <div>
                        <label className={labelClass}>Status</label>
                        <select className={inputClass} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Blacklisted">Blacklisted</option>
                        </select>
                    </div>
                    
                    {/* Emails - 3 Fields */}
                    <div>
                        <label className={labelClass}>Email Addresses</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Primary (Required) <span className="text-red-500">*</span></label>
                                <input type="email" className={inputClass} value={formData.emails[0]} onChange={e => handleEmailChange(0, e.target.value)} placeholder="primary@example.com" />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Secondary</label>
                                <input type="email" className={inputClass} value={formData.emails[1]} onChange={e => handleEmailChange(1, e.target.value)} placeholder="Optional" />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Tertiary</label>
                                <input type="email" className={inputClass} value={formData.emails[2]} onChange={e => handleEmailChange(2, e.target.value)} placeholder="Optional" />
                            </div>
                        </div>
                    </div>

                    {/* Phones - 3 Fields */}
                    <div>
                        <label className={labelClass}>Phone Numbers</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Primary (Required) <span className="text-red-500">*</span></label>
                                <PhoneInput theme={theme} value={formData.phones[0]} onChange={(val) => handlePhoneChange(0, val)} />
                            </div>
                             <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Secondary</label>
                                <PhoneInput theme={theme} value={formData.phones[1]} onChange={(val) => handlePhoneChange(1, val)} />
                            </div>
                            <div>
                                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Tertiary</label>
                                <PhoneInput theme={theme} value={formData.phones[2]} onChange={(val) => handlePhoneChange(2, val)} />
                            </div>
                        </div>
                    </div>

                    {/* Contact Person */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Contact person <span className="text-red-500">*</span></label>
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

                    {/* Remarks */}
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

export default SupplierModal;

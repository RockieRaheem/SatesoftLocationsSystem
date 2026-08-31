
import React, { useState, useEffect } from 'react';
import { Theme, CallGateway } from '../types';
import Icon from './Icon';

interface EditCallGatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (gateway: CallGateway) => void;
    gatewayToEdit: CallGateway | null;
    theme: Theme;
}

const EditCallGatewayModal: React.FC<EditCallGatewayModalProps> = ({ isOpen, onClose, onUpdate, gatewayToEdit, theme }) => {
    const [formData, setFormData] = useState<CallGateway | null>(null);

    useEffect(() => {
        if (gatewayToEdit) {
            setFormData({ ...gatewayToEdit });
        }
    }, [gatewayToEdit, isOpen]);

    if (!isOpen || !formData) return null;

    const handleSave = () => {
        if (!formData.name || !formData.host) {
            alert('Please fill in Name and Host.');
            return;
        }
        onUpdate(formData);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const inputClasses = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Edit Gateway</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Gateway Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Host / IP</label>
                            <input type="text" name="host" value={formData.host} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Port</label>
                            <input type="number" name="port" value={formData.port} onChange={e => setFormData(prev => prev ? { ...prev, port: parseInt(e.target.value) || 0 } : null)} className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Protocol</label>
                        <select name="protocol" value={formData.protocol} onChange={e => setFormData(prev => prev ? { ...prev, protocol: e.target.value as 'SIP' | 'IAX2' } : null)} className={inputClasses}>
                            <option value="SIP">SIP</option>
                            <option value="IAX2">IAX2</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                        <select name="status" value={formData.status} onChange={e => setFormData(prev => prev ? { ...prev, status: e.target.value as 'Active' | 'Inactive' } : null)} className={inputClasses}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>API Key / Secret</label>
                        <input type="password" name="apiKey" value={formData.apiKey || ''} onChange={handleChange} className={inputClasses} placeholder="Leave empty to keep unchanged" />
                    </div>
                </div>
                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={onClose} className={`px-4 py-2 mr-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 text-slate-900 hover:bg-yellow-600">Update Gateway</button>
                </div>
            </div>
        </div>
    );
};

export default EditCallGatewayModal;
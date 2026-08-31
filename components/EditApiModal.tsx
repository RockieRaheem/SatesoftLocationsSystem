
import React, { useState, useEffect } from 'react';
import { Theme, ApiConnection } from '../types';
import Icon from './Icon';

interface EditApiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (api: ApiConnection) => void;
    apiToEdit: ApiConnection | null;
    theme: Theme;
}

const EditApiModal: React.FC<EditApiModalProps> = ({ isOpen, onClose, onUpdate, apiToEdit, theme }) => {
    const [name, setName] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (apiToEdit) {
            setName(apiToEdit.name);
            setEndpoint(apiToEdit.endpoint);
            setApiKey(apiToEdit.apiKey);
            setStatus(apiToEdit.status);
            setDescription(apiToEdit.description);
        }
    }, [apiToEdit, isOpen]);

    if (!isOpen || !apiToEdit) return null;

    const handleUpdate = () => {
        if (!name || !endpoint || !apiKey) {
            alert('Please fill in all required fields.');
            return;
        }
        onUpdate({ ...apiToEdit, name, endpoint, apiKey, status, description });
        onClose();
    };

    const inputClasses = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col max-h-[90vh]`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Edit API Connection</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Endpoint URL *</label>
                        <input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>API Key *</label>
                        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as any)} className={inputClasses}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} rows={3} />
                    </div>
                </div>
                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={onClose} className={`px-4 py-2 mr-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                    <button onClick={handleUpdate} className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 text-slate-900 hover:bg-yellow-600">Update</button>
                </div>
            </div>
        </div>
    );
};

export default EditApiModal;

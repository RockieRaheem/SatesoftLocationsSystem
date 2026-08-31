
import React, { useState, useEffect } from 'react';
import { Theme, Country, CurrencyDenominator } from '../types';
import Icon from './Icon';

interface DenominatorsModalProps {
    isOpen: boolean;
    onClose: () => void;
    country: Country | null;
    onUpdate: (updatedCountry: Country) => void;
    theme: Theme;
    mode?: 'view' | 'edit';
}

const DenominatorsModal: React.FC<DenominatorsModalProps> = ({ 
    isOpen, 
    onClose, 
    country, 
    onUpdate, 
    theme,
    mode = 'edit'
}) => {
    const isView = mode === 'view';
    const [denominators, setDenominators] = useState<CurrencyDenominator[]>([]);
    const [newValue, setNewValue] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [newType, setNewType] = useState<'Note' | 'Coin'>('Note');
    const [newStatus, setNewStatus] = useState<'Active' | 'Inactive'>('Active');
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        if (country) {
            setDenominators(country.currencyDenominators || []);
            setEditingId(null);
            setNewValue('');
            setNewLabel('');
        }
    }, [country, isOpen]);

    if (!isOpen || !country) return null;

    const handleAdd = () => {
        if (!newValue || !newLabel) return;
        
        if (editingId !== null) {
            // Update existing
            const updated = denominators.map(d => 
                d.id === editingId 
                ? { ...d, value: parseFloat(newValue), label: newLabel, type: newType, status: newStatus } 
                : d
            ).sort((a, b) => b.value - a.value);
            setDenominators(updated);
            setEditingId(null);
        } else {
            // Add new
            const newDenominator: CurrencyDenominator = {
                id: denominators.length > 0 ? Math.max(...denominators.map(d => d.id)) + 1 : 1,
                value: parseFloat(newValue),
                label: newLabel,
                type: newType,
                status: newStatus
            };
    
            const updatedDenominators = [...denominators, newDenominator].sort((a, b) => b.value - a.value);
            setDenominators(updatedDenominators);
        }
        
        // Reset inputs
        setNewValue('');
        setNewLabel('');
    };

    const handleEdit = (d: CurrencyDenominator) => {
        setEditingId(d.id);
        setNewValue(d.value.toString());
        setNewLabel(d.label);
        setNewType(d.type);
        setNewStatus(d.status || 'Active');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewValue('');
        setNewLabel('');
        setNewStatus('Active');
    };

    const handleDelete = (id: number) => {
        setDenominators(denominators.filter(d => d.id !== id));
        if (editingId === id) handleCancelEdit();
    };

    const handleSave = () => {
        onUpdate({
            ...country,
            currencyDenominators: denominators
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <div>
                        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {isView ? 'View' : 'Manage'} Denominations: {country.name}
                        </h2>
                        <p className="text-xs text-slate-500 uppercase font-semibold">{country.currency} ({country.currencyCode})</p>
                    </div>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    {/* Add New Form */}
                    {!isView && (
                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {editingId !== null ? 'Edit Denominator' : 'Add New Denominator'}
                                </h3>
                                {editingId !== null && (
                                    <button 
                                        onClick={handleCancelEdit}
                                        className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                <div className="space-y-1">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Value (Numeric)</label>
                                    <input
                                        type="number"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                                        placeholder="e.g. 5000"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Label (Display)</label>
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                                        placeholder="e.g. 5,000"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as 'Note' | 'Coin')}
                                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                                    >
                                        <option value="Note">Note</option>
                                        <option value="Coin">Coin</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Status</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value as 'Active' | 'Inactive')}
                                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className={`px-4 py-2 rounded-md font-bold text-sm h-[38px] transition-all active:scale-95 ${
                                        editingId !== null 
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                        : 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                                    }`}
                                >
                                    {editingId !== null ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table of Denominators */}
                    <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                    <th className="px-4 py-3">Value</th>
                                    <th className="px-4 py-3">Label</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Status</th>
                                    {!isView && <th className="px-4 py-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className={`divide-y text-sm ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                {denominators.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No denominators recorded yet.</td>
                                    </tr>
                                ) : (
                                    denominators.map((d) => (
                                        <tr key={d.id} className={`${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} ${editingId === d.id ? (theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50') : ''}`}>
                                            <td className={`px-4 py-3 font-mono ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{d.value.toLocaleString()}</td>
                                            <td className={`px-4 py-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>{d.label}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    d.type === 'Note' 
                                                        ? (theme === 'dark' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-100 text-green-700')
                                                        : (theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-700')
                                                }`}>
                                                    {d.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    d.status === 'Active' 
                                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                                        : 'bg-slate-500/10 text-slate-400'
                                                }`}>
                                                    {d.status || 'Active'}
                                                </span>
                                            </td>
                                            {!isView && (
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleEdit(d)}
                                                            className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'}`}
                                                            title="Edit Denominator"
                                                        >
                                                            <Icon name="edit" className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(d.id)}
                                                            className={`p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors`}
                                                            title="Delete Denominator"
                                                        >
                                                            <Icon name="trash" className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={`p-4 border-t flex justify-end gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2.5 text-sm font-bold rounded-lg border transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                    >
                        {isView ? 'Close' : 'Cancel'}
                    </button>
                    {!isView && (
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 text-sm font-black rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
                        >
                            Save All Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DenominatorsModal;

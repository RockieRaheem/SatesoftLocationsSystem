
import React, { useState } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface LookupValue {
    id: string;
    type: 'VAT' | 'Import Duty' | 'Export Duty';
    name: string;
    description?: string;
    isActive: boolean;
}

interface LookupValuesPageProps {
    theme: Theme;
}

const LookupValuesPage: React.FC<LookupValuesPageProps> = ({ theme }) => {
    const [lookupValues, setLookupValues] = useState<LookupValue[]>([
        { id: '1', type: 'VAT', name: 'Standard VAT (18%)', isActive: true },
        { id: '2', type: 'VAT', name: 'Reduced VAT (5%)', isActive: true },
        { id: '3', type: 'VAT', name: 'Zero Rated VAT (0%)', isActive: true },
        { id: '4', type: 'Import Duty', name: 'Customs Duty (25%)', isActive: true },
        { id: '5', type: 'Import Duty', name: 'Excise Duty', isActive: true },
        { id: '6', type: 'Export Duty', name: 'Standard Export (15%)', isActive: true },
        { id: '7', type: 'Export Duty', name: 'Zero Rated', isActive: true },
    ]);

    const [filterType, setFilterType] = useState<string>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newValue, setNewValue] = useState({ type: 'VAT', name: '', description: '' });

    const types = ['All', 'VAT', 'Import Duty', 'Export Duty'];

    const filteredValues = filterType === 'All' 
        ? lookupValues 
        : lookupValues.filter(v => v.type === filterType);

    const handleAddValue = () => {
        if (!newValue.name) return;
        const id = (lookupValues.length + 1).toString();
        setLookupValues([...lookupValues, { ...newValue, id, isActive: true } as LookupValue]);
        setIsAddModalOpen(false);
        setNewValue({ type: 'VAT', name: '', description: '' });
    };

    const toggleStatus = (id: string) => {
        setLookupValues(lookupValues.map(v => 
            v.id === id ? { ...v, isActive: !v.isActive } : v
        ));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Tax Values</h1>
                    <p className="text-slate-500">Manage system-wide tax values and categories</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center transition-colors shadow-lg active:scale-95"
                >
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Add Value
                </button>
            </div>

            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                <div className="flex flex-wrap gap-2">
                    {types.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filterType === type
                                    ? 'bg-yellow-500 text-slate-900 shadow-md'
                                    : theme === 'dark'
                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={`${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase tracking-wider`}>
                            <th className="px-6 py-4 font-semibold">Type</th>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        {filteredValues.map((value) => (
                            <tr key={value.id} className={`${theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors group`}>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                        value.type === 'VAT' ? 'bg-blue-500/10 text-blue-500' :
                                        value.type === 'Import Duty' ? 'bg-purple-500/10 text-purple-500' :
                                        value.type === 'Export Duty' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-slate-500/10 text-slate-500'
                                    }`}>
                                        {value.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {value.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        value.isActive 
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                    }`}>
                                        {value.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => toggleStatus(value.id)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                theme === 'dark' ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                                            }`}
                                            title={value.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <Icon name={value.isActive ? 'lock' : 'key'} className="w-4 h-4" />
                                        </button>
                                        <button className={`p-2 rounded-lg transition-colors ${
                                            theme === 'dark' ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                                        }`}>
                                            <Icon name="edit" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredValues.length === 0 && (
                    <div className="p-12 text-center">
                        <Icon name="search" className="w-12 h-12 mx-auto text-slate-500 mb-4 opacity-20" />
                        <p className="text-slate-500">No lookup values found for this type.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add Lookup Value</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Value Type</label>
                                <select 
                                    value={newValue.type}
                                    onChange={(e) => setNewValue({...newValue, type: e.target.value})}
                                    className={`w-full p-3 rounded-xl border outline-none transition-all ${
                                        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white focus:border-yellow-500' : 'bg-slate-50 border-slate-200 focus:border-yellow-500'
                                    }`}
                                >
                                    {types.filter(t => t !== 'All').map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Value Name</label>
                                <input 
                                    type="text"
                                    value={newValue.name}
                                    onChange={(e) => setNewValue({...newValue, name: e.target.value})}
                                    placeholder="e.g. 15% VAT, Import Duty (25%), etc."
                                    className={`w-full p-3 rounded-xl border outline-none transition-all ${
                                        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white focus:border-yellow-500' : 'bg-slate-50 border-slate-200 focus:border-yellow-500'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                                <textarea 
                                    value={newValue.description}
                                    onChange={(e) => setNewValue({...newValue, description: e.target.value})}
                                    className={`w-full p-3 rounded-xl border outline-none transition-all h-24 resize-none ${
                                        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white focus:border-yellow-500' : 'bg-slate-50 border-slate-200 focus:border-yellow-500'
                                    }`}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900/50 flex justify-end space-x-3">
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddValue}
                                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 py-2 rounded-xl font-bold transition-all active:scale-95"
                            >
                                Save Value
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LookupValuesPage;

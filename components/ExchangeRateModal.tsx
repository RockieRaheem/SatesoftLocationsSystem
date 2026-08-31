
import React, { useState, useEffect } from 'react';
import { Theme, ExchangeRateData } from '../types';
import Icon from './Icon';

interface ExchangeRateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (rate: any) => void;
    rate?: ExchangeRateData | null;
    theme: Theme;
    mode: 'add' | 'edit';
}

const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({ isOpen, onClose, onSubmit, rate, theme, mode }) => {
    const [formData, setFormData] = useState<Partial<ExchangeRateData>>({
        fromCurrency: 'USD',
        toCurrency: 'UGX',
        rate: 0
    });

    useEffect(() => {
        if (rate) {
            setFormData(rate);
        } else {
            setFormData({
                fromCurrency: 'USD',
                toCurrency: 'UGX',
                rate: 0
            });
        }
    }, [rate, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {mode === 'add' ? 'Add Exchange Rate' : 'Edit Exchange Rate'}
                    </h2>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>From Currency</label>
                            <input
                                type="text"
                                required
                                value={formData.fromCurrency}
                                onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value.toUpperCase() })}
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                                placeholder="e.g. USD"
                                maxLength={3}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>To Currency</label>
                            <input
                                type="text"
                                required
                                value={formData.toCurrency}
                                onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value.toUpperCase() })}
                                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                                placeholder="e.g. UGX"
                                maxLength={3}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Exchange Rate</label>
                        <input
                            type="number"
                            step="0.0001"
                            required
                            value={formData.rate}
                            onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                            className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors"
                        >
                            {mode === 'add' ? 'Add Rate' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExchangeRateModal;

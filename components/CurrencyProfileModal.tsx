
import React, { useState, useEffect } from 'react';
import { Theme, Country, RoundingRule, RoundingConfig } from '../types';
import Icon from './Icon';

interface CurrencyProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    country: Country | null;
    onSave: (updatedCountry: Country) => Promise<void>;
    theme: Theme;
    mode: 'view' | 'edit';
}

const CurrencyProfileModal: React.FC<CurrencyProfileModalProps> = ({ 
    isOpen, 
    onClose, 
    country, 
    onSave, 
    theme, 
    mode 
}) => {
    const [formData, setFormData] = useState<Partial<Country>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (country) {
            setFormData({
                currency: country.currency,
                currencySymbol: country.currencySymbol,
                decimalPlaces: country.decimalPlaces || 0,
                roundingConfig: country.roundingConfig || { condition: 'Nearest' }
            });
        }
    }, [country, isOpen]);

    if (!isOpen || !country) return null;

    const handleSave = async () => {
        if (mode === 'view') return;
        setIsSaving(true);
        try {
            await onSave({ ...country, ...formData } as Country);
            onClose();
        } catch (error) {
            console.error("Failed to save currency profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    const addRule = (type: 'up' | 'down') => {
        const currentConfig = formData.roundingConfig || { condition: 'Nearest' };
        const ruleKey = type === 'up' ? 'upRules' : 'downRules';
        const newRules = [...(currentConfig[ruleKey] || []), { considerFigures: 0, roundTo: 0 }];
        
        setFormData({
            ...formData,
            roundingConfig: {
                ...currentConfig,
                [ruleKey]: newRules
            }
        });
    };

    const removeRule = (type: 'up' | 'down', index: number) => {
        const currentConfig = formData.roundingConfig || { condition: 'Nearest' };
        const ruleKey = type === 'up' ? 'upRules' : 'downRules';
        const newRules = (currentConfig[ruleKey] || []).filter((_, i) => i !== index);
        
        setFormData({
            ...formData,
            roundingConfig: {
                ...currentConfig,
                [ruleKey]: newRules
            }
        });
    };

    const updateRule = (type: 'up' | 'down', index: number, field: keyof RoundingRule, value: number) => {
        const currentConfig = formData.roundingConfig || { condition: 'Nearest' };
        const ruleKey = type === 'up' ? 'upRules' : 'downRules';
        const newRules = [...(currentConfig[ruleKey] || [])];
        newRules[index] = { ...newRules[index], [field]: value };
        
        setFormData({
            ...formData,
            roundingConfig: {
                ...currentConfig,
                [ruleKey]: newRules
            }
        });
    };

    const isEdit = mode === 'edit';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-5 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                        <img src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`} alt={country.name} className="shadow-sm rounded-sm" />
                        <div>
                            <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                {isEdit ? 'Edit' : 'View'} Currency Profile
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{country.name} • {country.currencyCode}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                    {/* Basic Info Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Currency Name</label>
                            <input
                                type="text"
                                disabled={!isEdit}
                                value={formData.currency || ''}
                                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all ${
                                    theme === 'dark' 
                                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10'
                                } ${!isEdit && 'opacity-70 bg-opacity-50 cursor-not-allowed'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Currency Symbol</label>
                            <input
                                type="text"
                                disabled={!isEdit}
                                value={formData.currencySymbol || ''}
                                onChange={(e) => setFormData({...formData, currencySymbol: e.target.value})}
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all ${
                                    theme === 'dark' 
                                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10'
                                } ${!isEdit && 'opacity-70 bg-opacity-50 cursor-not-allowed'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Decimal Places</label>
                            <input
                                type="number"
                                disabled={!isEdit}
                                min="0"
                                max="6"
                                value={formData.decimalPlaces || 0}
                                onChange={(e) => setFormData({...formData, decimalPlaces: parseInt(e.target.value) || 0})}
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all ${
                                    theme === 'dark' 
                                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10'
                                } ${!isEdit && 'opacity-70 bg-opacity-50 cursor-not-allowed'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Default Rounding Mode</label>
                            <select
                                disabled={!isEdit}
                                value={formData.roundingConfig?.condition || 'Nearest'}
                                onChange={(e) => setFormData({...formData, roundingConfig: { ...formData.roundingConfig as RoundingConfig, condition: e.target.value as any }})}
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all ${
                                    theme === 'dark' 
                                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10'
                                } ${!isEdit && 'opacity-70 bg-opacity-50 cursor-not-allowed'}`}
                            >
                                <option value="Nearest">Nearest</option>
                                <option value="Round Up">Round Up</option>
                                <option value="Round Down">Round Down</option>
                            </select>
                        </div>
                    </div>

                    {/* Advanced Rounding Logic */}
                    <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Icon name="cog-6-tooth" className="h-4 w-4 text-yellow-500" />
                            <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Advanced Rounding Configuration</h3>
                        </div>

                        {/* Round Up Rules */}
                        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className={`text-xs font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5`}>
                                    <Icon name="arrow-up" className="h-3.5 w-3.5" />
                                    Round Up Logic
                                </h4>
                                {isEdit && (
                                    <button 
                                        onClick={() => addRule('up')}
                                        className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                                    >
                                        + Add Rule
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {formData.roundingConfig?.upRules?.map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className={`text-[10px] font-bold uppercase tracking-tight px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Threshold</label>
                                                <input 
                                                    type="number"
                                                    disabled={!isEdit}
                                                    placeholder="e.g. 0.45"
                                                    value={rule.considerFigures}
                                                    onChange={(e) => updateRule('up', idx, 'considerFigures', parseFloat(e.target.value))}
                                                    className={`w-full px-3 py-1.5 text-xs rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className={`text-[10px] font-bold uppercase tracking-tight px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Round To</label>
                                                <input 
                                                    type="number"
                                                    disabled={!isEdit}
                                                    placeholder="e.g. 1"
                                                    value={rule.roundTo}
                                                    onChange={(e) => updateRule('up', idx, 'roundTo', parseFloat(e.target.value))}
                                                    className={`w-full px-3 py-1.5 text-xs rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                                                />
                                            </div>
                                        </div>
                                        {isEdit && (
                                            <button onClick={() => removeRule('up', idx)} className="text-red-400 hover:text-red-600 p-1 pt-5">
                                                <Icon name="trash" className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(!formData.roundingConfig?.upRules || formData.roundingConfig.upRules.length === 0) && (
                                    <p className="text-[10px] italic text-slate-400 text-center py-2">No custom round-up rules defined.</p>
                                )}
                            </div>
                        </div>

                        {/* Round Down Rules */}
                        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className={`text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5`}>
                                    <Icon name="arrow-down" className="h-3.5 w-3.5" />
                                    Round Down Logic
                                </h4>
                                {isEdit && (
                                    <button 
                                        onClick={() => addRule('down')}
                                        className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        + Add Rule
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {formData.roundingConfig?.downRules?.map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className={`text-[10px] font-bold uppercase tracking-tight px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Threshold</label>
                                                <input 
                                                    type="number"
                                                    disabled={!isEdit}
                                                    placeholder="e.g. 0.45"
                                                    value={rule.considerFigures}
                                                    onChange={(e) => updateRule('down', idx, 'considerFigures', parseFloat(e.target.value))}
                                                    className={`w-full px-3 py-1.5 text-xs rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className={`text-[10px] font-bold uppercase tracking-tight px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Round To</label>
                                                <input 
                                                    type="number"
                                                    disabled={!isEdit}
                                                    placeholder="e.g. 0"
                                                    value={rule.roundTo}
                                                    onChange={(e) => updateRule('down', idx, 'roundTo', parseFloat(e.target.value))}
                                                    className={`w-full px-3 py-1.5 text-xs rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                                                />
                                            </div>
                                        </div>
                                        {isEdit && (
                                            <button onClick={() => removeRule('down', idx)} className="text-red-400 hover:text-red-600 p-1 pt-5">
                                                <Icon name="trash" className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(!formData.roundingConfig?.downRules || formData.roundingConfig.downRules.length === 0) && (
                                    <p className="text-[10px] italic text-slate-400 text-center py-2">No custom round-down rules defined.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-5 border-t flex justify-end gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
                    <button
                        onClick={onClose}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                            theme === 'dark' 
                            ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {isEdit ? 'Cancel' : 'Close'}
                    </button>
                    {isEdit && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-slate-900 px-8 py-2.5 rounded-lg font-black text-sm transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Icon name="check" className="h-4 w-4" />}
                            Update Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurrencyProfileModal;

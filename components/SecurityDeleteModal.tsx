
import React, { useState } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface SecurityDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (remarks: string, password: string) => Promise<void>;
    title: string;
    message: string;
    theme: Theme;
}

const SecurityDeleteModal: React.FC<SecurityDeleteModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    theme 
}) => {
    const [remarks, setRemarks] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!remarks || !password) {
            setError('Please provide both remarks and your authorization password.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await onConfirm(remarks, password);
            setRemarks('');
            setPassword('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Authorization failed. Please check your password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                {/* Warning Header */}
                <div className="bg-red-500 p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Icon name="shield-alert" className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className={`p-4 rounded-xl border leading-relaxed text-sm ${theme === 'dark' ? 'bg-red-500/5 border-red-500/20 text-slate-300' : 'bg-red-50 border-red-100 text-slate-700'}`}>
                        {message}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                            <Icon name="exclamation-triangle" className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Deletion Remarks (Reason)
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="State the reason for this deletion..."
                                rows={3}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none ${
                                    theme === 'dark' 
                                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-red-500' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-red-500 shadow-sm'
                                }`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Authorization Password
                            </label>
                            <div className="relative">
                                <Icon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                                        theme === 'dark' 
                                        ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-red-500' 
                                        : 'bg-white border-slate-200 text-slate-900 focus:border-red-500 shadow-sm'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm border transition-all ${
                                theme === 'dark' 
                                ? 'border-slate-700 text-slate-400 hover:bg-slate-800' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !remarks || !password}
                            className="flex-[2] bg-red-500 hover:bg-red-600 active:scale-95 text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Icon name="trash" className="h-4 w-4" />
                            )}
                            Confirm Deletion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SecurityDeleteModal;

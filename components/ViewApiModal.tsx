
import React from 'react';
import { Theme, ApiConnection } from '../types';
import Icon from './Icon';

interface ViewApiModalProps {
    isOpen: boolean;
    onClose: () => void;
    api: ApiConnection | null;
    theme: Theme;
}

const ViewApiModal: React.FC<ViewApiModalProps> = ({ isOpen, onClose, api, theme }) => {
    if (!isOpen || !api) return null;

    const DetailItem = ({ label, value }: { label: string, value: string }) => (
        <div>
            <div className={`text-xs uppercase font-semibold tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
            <div className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} break-words`}>{value}</div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>API Details</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Name" value={api.name} />
                        <DetailItem label="Status" value={api.status} />
                    </div>
                    <DetailItem label="Endpoint" value={api.endpoint} />
                    <DetailItem label="API Key" value="••••••••••••••••••••" />
                    <DetailItem label="Description" value={api.description || 'N/A'} />
                    <DetailItem label="Created At" value={new Date(api.createdAt).toLocaleString()} />
                </div>
                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewApiModal;


import React from 'react';
import { Theme, CallGateway } from '../types';
import Icon from './Icon';

interface ViewCallGatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    gateway: CallGateway | null;
    theme: Theme;
}

const ViewCallGatewayModal: React.FC<ViewCallGatewayModalProps> = ({ isOpen, onClose, gateway, theme }) => {
    if (!isOpen || !gateway) return null;

    const DetailItem = ({ label, value }: { label: string, value: string | number }) => (
        <div>
            <div className={`text-xs uppercase font-semibold tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
            <div className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} break-words`}>{value}</div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Gateway Details</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Name" value={gateway.name} />
                        <DetailItem label="Status" value={gateway.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Host" value={gateway.host} />
                        <DetailItem label="Port" value={gateway.port} />
                    </div>
                    <DetailItem label="Protocol" value={gateway.protocol} />
                    <DetailItem label="API Key / Secret" value={gateway.apiKey ? '••••••••' : 'Not Set'} />
                    
                    <div className={`pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-2 gap-6">
                            <DetailItem label="Added By" value={gateway.createdBy} />
                            <DetailItem label="Added On" value={new Date(gateway.createdAt).toLocaleString()} />
                        </div>
                    </div>
                </div>
                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewCallGatewayModal;

import React, { useState } from 'react';
import { Theme, CallGateway, User } from '../types';
import Icon from './Icon';
import { mockCallGateways } from '../data';
import AddCallGatewayModal from './AddCallGatewayModal';
import ViewCallGatewayModal from './ViewCallGatewayModal';
import EditCallGatewayModal from './EditCallGatewayModal';

interface CallSettingsPageProps {
    theme: Theme;
    allowCalls: boolean;
    setAllowCalls: React.Dispatch<React.SetStateAction<boolean>>;
    allowMicrophone: boolean;
    setAllowMicrophone: React.Dispatch<React.SetStateAction<boolean>>;
    currentUser: User;
}

const CallSettingsPage: React.FC<CallSettingsPageProps> = ({ theme, allowCalls, setAllowCalls, allowMicrophone, setAllowMicrophone, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'gateways'>('general');
    const [gateways, setGateways] = useState<CallGateway[]>(mockCallGateways);
    const [isAddGatewayModalOpen, setIsAddGatewayModalOpen] = useState(false);
    const [isViewGatewayModalOpen, setIsViewGatewayModalOpen] = useState(false);
    const [isEditGatewayModalOpen, setIsEditGatewayModalOpen] = useState(false);
    
    const [gatewayToView, setGatewayToView] = useState<CallGateway | null>(null);
    const [gatewayToEdit, setGatewayToEdit] = useState<CallGateway | null>(null);

    const handleAddGateway = (newGateway: Omit<CallGateway, 'id' | 'createdAt' | 'status' | 'createdBy'>) => {
        const newId = Math.max(...gateways.map(g => g.id), 0) + 1;
        const gateway: CallGateway = {
            ...newGateway,
            id: newId,
            status: 'Active',
            createdAt: new Date().toISOString(),
            createdBy: currentUser.name,
        };
        setGateways([...gateways, gateway]);
    };

    const handleUpdateGateway = (updatedGateway: CallGateway) => {
        setGateways(prev => prev.map(g => g.id === updatedGateway.id ? updatedGateway : g));
    };

    const handleDeleteGateway = (id: number) => {
        if (confirm('Are you sure you want to remove this gateway?')) {
            setGateways(prev => prev.filter(g => g.id !== id));
        }
    }

    const openViewModal = (gateway: CallGateway) => {
        setGatewayToView(gateway);
        setIsViewGatewayModalOpen(true);
    };

    const openEditModal = (gateway: CallGateway) => {
        setGatewayToEdit(gateway);
        setIsEditGatewayModalOpen(true);
    };

    const Toggle: React.FC<{ label: string, description: string, enabled: boolean, setEnabled: (val: boolean) => void }> = ({ label, description, enabled, setEnabled }) => (
        <div className={`flex items-center justify-between p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="pr-4">
                <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{label}</p>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
            </div>
            <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-green-500' : 'bg-slate-400'}`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        </div>
    );

    return (
        <>
            <AddCallGatewayModal 
                isOpen={isAddGatewayModalOpen} 
                onClose={() => setIsAddGatewayModalOpen(false)} 
                onSave={handleAddGateway} 
                theme={theme} 
            />
            <ViewCallGatewayModal
                isOpen={isViewGatewayModalOpen}
                onClose={() => setIsViewGatewayModalOpen(false)}
                gateway={gatewayToView}
                theme={theme}
            />
            <EditCallGatewayModal
                isOpen={isEditGatewayModalOpen}
                onClose={() => setIsEditGatewayModalOpen(false)}
                onUpdate={handleUpdateGateway}
                gatewayToEdit={gatewayToEdit}
                theme={theme}
            />

            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        General Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('gateways')}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'gateways' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        Call Gateways
                    </button>
                </div>

                {activeTab === 'general' && (
                    <div className="space-y-4 max-w-3xl">
                        <Toggle 
                            label="Enable Call Features" 
                            description="Allow users to make and receive calls within the application. Disabling this will hide call-related menus and reports."
                            enabled={allowCalls}
                            setEnabled={setAllowCalls}
                        />
                    </div>
                )}

                {activeTab === 'gateways' && (
                    <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="p-4 flex justify-between items-center border-b border-inherit">
                            <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Configured Gateways</h3>
                            <button 
                                onClick={() => setIsAddGatewayModalOpen(true)}
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600"
                            >
                                <Icon name="plus" className="h-4 w-4" />
                                <span>Add Gateway</span>
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                                <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Name</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Host</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Protocol</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Added By</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                        <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                    {gateways.map((gateway) => (
                                        <tr key={gateway.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{gateway.name}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{gateway.host}:{gateway.port}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{gateway.protocol}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{gateway.createdBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${gateway.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {gateway.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button onClick={() => openViewModal(gateway)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} title="View Details">
                                                        <Icon name="view" className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => openEditModal(gateway)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`} title="Edit Gateway">
                                                        <Icon name="edit" className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteGateway(gateway.id)} className="text-red-500 hover:text-red-700" title="Delete">
                                                        <Icon name="delete" className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {gateways.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className={`px-6 py-8 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                                No gateways configured.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CallSettingsPage;
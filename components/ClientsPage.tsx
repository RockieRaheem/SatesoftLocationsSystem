
import React, { useState } from 'react';
import { Theme, Client, User, CallRecord } from '../types';
import { mockClients } from '../data';
import Icon from './Icon';
import ActiveCallModal from './ActiveCallModal';
import EditClientModal from './EditClientModal';
import { maskPhoneNumber, formatDate } from '../utils';

interface ClientsPageProps {
    theme: Theme;
    currentUser?: User; // Make optional to avoid breaking if not immediately passed, but logic assumes it exists
    addCallRecord: (record: Omit<CallRecord, 'id'>) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ theme, currentUser, addCallRecord }) => {
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [isActiveCallOpen, setIsActiveCallOpen] = useState(false);
    const [activeCallClient, setActiveCallClient] = useState<{ name: string; phone: string } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const handleCallClient = (client: Client) => {
        setActiveCallClient({ name: client.name, phone: client.phone });
        setIsActiveCallOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setIsEditModalOpen(true);
    };

    const handleUpdateClient = (updatedClient: Client) => {
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    };

    const handleCallComplete = (details: { duration: number; status: 'Completed' | 'Missed' | 'Voicemail' }) => {
        if (activeCallClient) {
            addCallRecord({
                clientName: activeCallClient.name,
                phoneNumber: activeCallClient.phone,
                type: 'Outbound',
                duration: details.duration,
                timestamp: new Date().toISOString(),
                status: details.status,
                agentName: currentUser?.name || 'Agent'
            });
        }
    };

    // Fallback mock user if currentUser prop is missing (though it should be passed)
    const defaultUser: User = currentUser || {
        id: 'agent-1',
        name: 'Agent',
        email: 'agent@locationregister.org',
        role: 'Agent',
        bio: '',
        avatar: null,
        gender: 'Male',
    };

    return (
        <>
            <ActiveCallModal 
                isOpen={isActiveCallOpen}
                onClose={() => setIsActiveCallOpen(false)}
                client={activeCallClient}
                currentUser={defaultUser}
                theme={theme}
                onCallComplete={handleCallComplete}
            />
            <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateClient}
                client={selectedClient}
                theme={theme}
            />

            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Contributor List</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Name</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Contact</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Location</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Last Order</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {clients.map((client) => (
                                <tr key={client.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{client.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{client.email}</div>
                                        <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{maskPhoneNumber(client.phone)}</div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {client.shopName || 'N/A'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {client.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {formatDate(client.lastOrderDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button 
                                                onClick={() => handleCallClient(client)}
                                                className="text-green-600 hover:text-green-800"
                                                title="Call Client"
                                            >
                                                <Icon name="phone" className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleEditClient(client)}
                                                className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`}
                                                title="Edit Client"
                                            >
                                                <Icon name="edit" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ClientsPage;

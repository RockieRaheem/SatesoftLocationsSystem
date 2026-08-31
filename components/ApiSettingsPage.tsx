
import React, { useState } from 'react';
import { Theme, ApiConnection, User } from '../types';
import Icon from './Icon';
import { mockApiConnections } from '../data';
import { formatDate } from '../utils';
import AddApiModal from './AddApiModal';
import EditApiModal from './EditApiModal';
import ViewApiModal from './ViewApiModal';
import DeleteApiModal from './DeleteApiModal';

interface ApiSettingsPageProps {
    theme: Theme;
    currentUser: User;
}

const ApiSettingsPage: React.FC<ApiSettingsPageProps> = ({ theme, currentUser }) => {
    const [apiConnections, setApiConnections] = useState<ApiConnection[]>(mockApiConnections);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedApi, setSelectedApi] = useState<ApiConnection | null>(null);
    const [apiToDelete, setApiToDelete] = useState<ApiConnection | null>(null);

    const filteredApis = apiConnections.filter(api => 
        api.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        api.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddApi = (newApi: Omit<ApiConnection, 'id' | 'createdAt'>) => {
        const newId = Math.max(...apiConnections.map(a => a.id), 0) + 1;
        setApiConnections([...apiConnections, { 
            ...newApi, 
            id: newId, 
            createdAt: new Date().toISOString() 
        }]);
    };

    const handleUpdateApi = (updatedApi: ApiConnection) => {
        setApiConnections(prev => prev.map(api => api.id === updatedApi.id ? updatedApi : api));
    };

    const handleDeleteApi = (id: number) => {
        setApiConnections(prev => prev.filter(api => api.id !== id));
    };

    const openView = (api: ApiConnection) => { setSelectedApi(api); setIsViewModalOpen(true); };
    const openEdit = (api: ApiConnection) => { setSelectedApi(api); setIsEditModalOpen(true); };
    const openDelete = (api: ApiConnection) => { setApiToDelete(api); setIsDeleteModalOpen(true); };

    return (
        <>
            <AddApiModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddApi} theme={theme} />
            <EditApiModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdateApi} apiToEdit={selectedApi} theme={theme} />
            <ViewApiModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} api={selectedApi} theme={theme} />
            <DeleteApiModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteApi} api={apiToDelete} theme={theme} />

            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm h-full flex flex-col`}>
                <div className="p-6 border-b border-transparent flex justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search APIs..."
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-yellow-500 sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        <span>Add API</span>
                    </button>
                </div>

                <div className="overflow-auto flex-grow p-6 pt-0">
                    <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                        <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <tr>
                                {['Name', 'Endpoint', 'Status', 'Created At', 'Actions'].map((header) => (
                                    <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                            {filteredApis.map((api) => (
                                <tr key={api.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{api.name}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{api.endpoint}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${api.status === 'Active' ? (theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800') : (theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600')}`}>
                                            {api.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(api.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => openView(api)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} title="View">
                                                <Icon name="view" className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => openEdit(api)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`} title="Edit">
                                                <Icon name="edit" className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => openDelete(api)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'}`} title="Delete">
                                                <Icon name="delete" className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredApis.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={`px-6 py-8 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        No API connections found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ApiSettingsPage;

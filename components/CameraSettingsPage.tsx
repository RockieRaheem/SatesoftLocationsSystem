
import React, { useState, useMemo } from 'react';
import { Theme, CameraDevice, Shop, ShopUser, SuperUser, User } from '../types';
import Icon, { IconName } from './Icon';
import AddCameraModal from './AddCameraModal';
import VerifyCameraOTPModal from './VerifyCameraOTPModal';
import ViewCameraModal from './ViewCameraModal';
import DeleteCameraModal from './DeleteCameraModal';
import RestoreCameraModal from './RestoreCameraModal';

interface CameraSettingsPageProps {
    theme: Theme;
    cameraDevices: CameraDevice[];
    setCameraDevices: React.Dispatch<React.SetStateAction<CameraDevice[]>>;
    shops: Shop[];
    users: (ShopUser | SuperUser)[];
    currentUser: User;
}

const SummaryCard: React.FC<{ icon: IconName; title: string; value: string; theme: Theme }> = ({ icon, title, value, theme }) => {
    const iconContainerClasses = theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100';
    const iconClasses = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    
    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
            <div className={`p-3 rounded-full mr-4 ${iconContainerClasses}`}>
                <Icon name={icon} className={`h-6 w-6 ${iconClasses}`} />
            </div>
            <div>
                <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
};

const Tab: React.FC<{ name: 'Active' | 'Deleted'; label: string; count: number; activeTab: string; onClick: () => void; theme: Theme }> = ({ name, label, count, activeTab, onClick, theme }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 ${activeTab === name ? 'border-yellow-500 text-yellow-500' : `border-transparent ${theme==='dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}`}>
        {label} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === name ? (theme==='dark' ? 'bg-yellow-500/10' : 'bg-yellow-100') : (theme==='dark' ? 'bg-slate-700' : 'bg-slate-200')}`}>{count}</span>
    </button>
);

const CameraSettingsPage: React.FC<CameraSettingsPageProps> = ({ theme, cameraDevices, setCameraDevices, shops, users, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'Active' | 'Deleted'>('Active');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

    const [deviceToVerify, setDeviceToVerify] = useState<CameraDevice | null>(null);
    const [deviceToView, setDeviceToView] = useState<CameraDevice | null>(null);
    const [deviceToDelete, setDeviceToDelete] = useState<CameraDevice | null>(null);
    const [deviceToRestore, setDeviceToRestore] = useState<CameraDevice | null>(null);


    // Filter States
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [shopFilter, setShopFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddDevice = (newDevice: Omit<CameraDevice, 'id' | 'status' | 'addedAt' | 'shopName'>) => {
        const shop = shops.find(s => s.id === newDevice.shopId);
        const newId = cameraDevices.length > 0 ? Math.max(...cameraDevices.map(c => c.id)) + 1 : 1;
        const device: CameraDevice = {
            ...newDevice,
            id: newId,
            status: 'Pending',
            shopName: shop?.name || 'Unknown Shop',
            addedAt: new Date().toISOString(),
            isLive: true // Default simulation state
        };
        setCameraDevices(prev => [device, ...prev]);
    };

    const handleVerifyDevice = (deviceId: number) => {
        setCameraDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'Approved' } : d));
        setIsVerifyModalOpen(false);
        setDeviceToVerify(null);
    };

    const handleConfirmDelete = (deviceId: number, remarks: string) => {
        setCameraDevices(prev => prev.map(d => d.id === deviceId ? { 
            ...d, 
            status: 'Deleted', 
            deletionRemarks: remarks,
            deletedAt: new Date().toISOString(),
            deletedBy: currentUser.name,
        } : d));
        setIsDeleteModalOpen(false);
        setDeviceToDelete(null);
    };

    const handleConfirmRestore = (deviceId: number, remarks: string) => {
        setCameraDevices(prev => prev.map(d => d.id === deviceId ? { 
            ...d, 
            status: 'Pending', 
            restorationRemarks: remarks, 
            restoredAt: new Date().toISOString(),
            restoredBy: currentUser.name,
            // We optionally keep or clear deletion remarks. Let's keep previous record but it won't be shown as active deletion reason.
        } : d));
        setIsRestoreModalOpen(false);
        setDeviceToRestore(null);
    };

    const openVerifyModal = (device: CameraDevice) => {
        setDeviceToVerify(device);
        setIsVerifyModalOpen(true);
    };

    const openViewModal = (device: CameraDevice) => {
        setDeviceToView(device);
        setIsViewModalOpen(true);
    };

    const openDeleteModal = (device: CameraDevice) => {
        setDeviceToDelete(device);
        setIsDeleteModalOpen(true);
    };

    const openRestoreModal = (device: CameraDevice) => {
        setDeviceToRestore(device);
        setIsRestoreModalOpen(true);
    };

    const handleResetFilters = () => {
        setStatusFilter('');
        setTypeFilter('');
        setShopFilter('');
        setSearchTerm('');
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            'Approved': theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800',
            'Pending': theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
            'Offline': theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800',
            'Error': theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800',
            'Deleted': theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500',
        }[status] || '';

        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles}`}>{status}</span>;
    };

    const activeDevices = useMemo(() => cameraDevices.filter(d => d.status !== 'Deleted'), [cameraDevices]);
    const deletedDevices = useMemo(() => cameraDevices.filter(d => d.status === 'Deleted'), [cameraDevices]);

    const summaryData = useMemo(() => {
        return {
            total: cameraDevices.length,
            active: cameraDevices.filter(d => d.status === 'Approved').length,
            pending: cameraDevices.filter(d => d.status === 'Pending').length,
            offline: cameraDevices.filter(d => ['Offline', 'Error'].includes(d.status)).length
        };
    }, [cameraDevices]);

    const uniqueShops = useMemo(() => [...new Set(cameraDevices.map(d => d.shopName))].sort(), [cameraDevices]);

    const filteredDevices = useMemo(() => {
        const sourceList = activeTab === 'Active' ? activeDevices : deletedDevices;
        return sourceList.filter(device => {
             const matchesSearch = searchTerm === '' || 
                device.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                device.connectionString.toLowerCase().includes(searchTerm.toLowerCase());
             const matchesStatus = statusFilter === '' || device.status === statusFilter;
             const matchesType = typeFilter === '' || device.type === typeFilter;
             const matchesShop = shopFilter === '' || device.shopName === shopFilter;

             return matchesSearch && matchesStatus && matchesType && matchesShop;
        });
    }, [activeTab, activeDevices, deletedDevices, searchTerm, statusFilter, typeFilter, shopFilter]);

    const commonSelectClasses = `block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`;

    return (
        <>
            <AddCameraModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSave={handleAddDevice} 
                theme={theme} 
                shops={shops}
                users={users}
            />
            <VerifyCameraOTPModal 
                isOpen={isVerifyModalOpen} 
                onClose={() => setIsVerifyModalOpen(false)} 
                onVerify={handleVerifyDevice} 
                device={deviceToVerify} 
                theme={theme} 
            />
            <ViewCameraModal 
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                device={deviceToView}
                theme={theme}
                users={users}
            />
            <DeleteCameraModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                device={deviceToDelete}
                theme={theme}
            />
            <RestoreCameraModal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                onConfirm={handleConfirmRestore}
                device={deviceToRestore}
                theme={theme}
                users={users}
            />

            <div className="h-full flex flex-col gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
                    <SummaryCard icon="camera" title="Total Devices" value={summaryData.total.toString()} theme={theme} />
                    <SummaryCard icon="check-circle" title="Active" value={summaryData.active.toString()} theme={theme} />
                    <SummaryCard icon="exclamation-triangle" title="Pending" value={summaryData.pending.toString()} theme={theme} />
                    <SummaryCard icon="x-mark" title="Offline" value={summaryData.offline.toString()} theme={theme} />
                </div>

                {/* Filters Card */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex-shrink-0`}>
                    <div className="p-4 border-b border-transparent">
                        <div className="flex justify-between items-center">
                            <nav className="flex space-x-2">
                                <Tab name="Active" label="Active Devices" count={activeDevices.length} activeTab={activeTab} onClick={() => setActiveTab('Active')} theme={theme} />
                                <Tab name="Deleted" label="Deleted Devices" count={deletedDevices.length} activeTab={activeTab} onClick={() => setActiveTab('Deleted')} theme={theme} />
                            </nav>
                            <button onClick={() => setIsFilterVisible(!isFilterVisible)} className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <div className="flex items-center">
                                    <Icon name="filter" className="h-5 w-5" />
                                    <Icon name="chevron-down" className={`h-4 w-4 ml-1 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                        </div>
                    </div>
                    {isFilterVisible && (
                         <div className={`border-t p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={commonSelectClasses} disabled={activeTab === 'Deleted'}>
                                        <option value="">All Statuses</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Offline">Offline</option>
                                        <option value="Error">Error</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Type</label>
                                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={commonSelectClasses}>
                                        <option value="">All Types</option>
                                        <option value="Camera">Camera</option>
                                        <option value="DVR">DVR</option>
                                        <option value="NVR">NVR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Shop</label>
                                    <select value={shopFilter} onChange={e => setShopFilter(e.target.value)} className={commonSelectClasses}>
                                        <option value="">All Shops</option>
                                        {uniqueShops.map(shop => <option key={shop} value={shop}>{shop}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button onClick={handleResetFilters} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                                    <Icon name="refresh" className="h-4 w-4" />
                                    <span>Reset</span>
                                </button>
                            </div>
                         </div>
                    )}
                </div>

                <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm flex flex-col flex-grow overflow-hidden`}>
                    <div className="p-4 flex justify-between items-center flex-shrink-0 border-b border-transparent">
                        <div className="relative w-full max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search devices..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className={`block w-full pl-10 pr-3 py-2 border rounded-md sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'}`} 
                            />
                        </div>
                        {activeTab === 'Active' && (
                            <button 
                                onClick={() => setIsAddModalOpen(true)} 
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600"
                            >
                                <Icon name="plus" className="h-4 w-4" />
                                <span>Add Device</span>
                            </button>
                        )}
                    </div>

                    <div className="overflow-auto flex-grow">
                        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <tr>
                                    {['Device Name', 'Type', 'Connection (IP/URL)', 'Shop', 'Category', 'Status', 'Actions'].map((header) => (
                                        <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                {filteredDevices.map((device) => (
                                    <tr key={device.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{device.name}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <div className="flex flex-col">
                                                <span className={`px-2 py-0.5 text-xs rounded border w-fit ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>{device.type}</span>
                                                {device.type !== 'Camera' && device.channels && (
                                                    <span className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{device.channels} Channels</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {device.connectionString.length > 20 ? device.connectionString.substring(0, 20) + '...' : device.connectionString}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{device.shopName}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{device.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getStatusBadge(device.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    onClick={() => openViewModal(device)}
                                                    className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
                                                    title="View Connection Info"
                                                >
                                                    <Icon name="view" className="h-5 w-5" />
                                                </button>

                                                {activeTab === 'Active' && (
                                                    <>
                                                        {device.status === 'Pending' && (
                                                            <button 
                                                                onClick={() => openVerifyModal(device)} 
                                                                className="text-yellow-500 hover:text-yellow-400 font-medium"
                                                                title="Enter OTP to Approve"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        {device.status === 'Approved' && (
                                                            <span className="text-green-500">
                                                                <Icon name="check-circle" className="h-5 w-5" />
                                                            </span>
                                                        )}
                                                        <button onClick={() => openDeleteModal(device)} className={`text-slate-400 hover:text-red-500 transition-colors`}>
                                                            <Icon name="delete" className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {activeTab === 'Deleted' && (
                                                     <button 
                                                        onClick={() => openRestoreModal(device)} 
                                                        className="flex items-center text-blue-500 hover:text-blue-400 font-medium transition-colors"
                                                        title="Restore Device"
                                                    >
                                                        <Icon name="refresh" className="h-4 w-4 mr-1" />
                                                        Restore
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDevices.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className={`px-6 py-8 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {activeTab === 'Active' 
                                                ? "No active devices found matching your filters." 
                                                : "No deleted devices found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CameraSettingsPage;

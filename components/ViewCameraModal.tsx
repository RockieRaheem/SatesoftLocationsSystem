
import React, { useState, useEffect } from 'react';
import { Theme, CameraDevice, ShopUser, SuperUser } from '../types';
import Icon, { IconName } from './Icon';

interface ViewCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: CameraDevice | null;
  theme: Theme;
  users: (ShopUser | SuperUser)[];
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode, theme: Theme, fullWidth?: boolean }> = ({ label, value, theme, fullWidth }) => (
    <div className={fullWidth ? "col-span-2" : ""}>
        <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
        <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value || 'N/A'}</div>
    </div>
);

const TimelineItem: React.FC<{ 
    action: string; 
    date: string; 
    by: string; 
    remarks?: string; 
    theme: Theme; 
    colorClass: string; 
    icon: IconName 
}> = ({ action, date, by, remarks, theme, colorClass, icon }) => (
    <div className="relative pl-8 pb-6 last:pb-0">
        <div className={`absolute left-0 top-1 flex items-center justify-center w-6 h-6 rounded-full ${colorClass} z-10`}>
            <Icon name={icon} className="w-3 h-3" />
        </div>
        <div className={`absolute left-3 top-7 bottom-0 w-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} last:hidden`}></div>
        <div>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{action}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {new Date(date).toLocaleString()} • by {by}
            </p>
            {remarks && (
                <div className={`mt-2 p-3 rounded border text-sm italic ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    "{remarks}"
                </div>
            )}
        </div>
    </div>
);

const ViewCameraModal: React.FC<ViewCameraModalProps> = ({ isOpen, onClose, device, theme, users }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen && !isClosing || !device) return null;

    const owner = users.find(u => u.id === device.ownerIdForOtp);
    const ownerName = owner ? owner.name : 'Unknown';
    const ownerPhone = owner?.phonePrimary ? `${owner.phonePrimary.code} ${owner.phonePrimary.number}` : 'N/A';

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

    const hasHistory = (device.deletedAt || device.restoredAt);

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Device Details</h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{device.name}</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Configuration</h3>
                            <div className="space-y-3">
                                <DetailItem theme={theme} label="Type" value={device.type} />
                                {device.channels && <DetailItem theme={theme} label="Channels" value={device.channels} />}
                                <DetailItem theme={theme} label="Category" value={device.category} />
                                <DetailItem theme={theme} label="Status" value={getStatusBadge(device.status)} />
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Connectivity</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Connection String</p>
                                    <div className={`mt-1 p-2 rounded font-mono text-xs break-all ${theme === 'dark' ? 'bg-black/30 text-yellow-400' : 'bg-slate-100 text-slate-800'}`}>
                                        {device.connectionString}
                                    </div>
                                </div>
                                <DetailItem theme={theme} label="Added On" value={new Date(device.addedAt).toLocaleString()} />
                                <DetailItem theme={theme} label="Shop" value={device.shopName} />
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                         <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Verification Contact</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <DetailItem theme={theme} label="Owner Name" value={ownerName} />
                            <DetailItem theme={theme} label="Phone" value={ownerPhone} />
                         </div>
                    </div>
                    
                    {hasHistory && (
                        <div>
                            <h3 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>History & Logs</h3>
                            <div className="space-y-0">
                                {/* Sort by date if needed, but here we assume restoration happens after deletion if both exist, or just show available */}
                                {device.restoredAt && (
                                     <TimelineItem 
                                        action="Device Restored"
                                        date={device.restoredAt}
                                        by={device.restoredBy || 'Unknown'}
                                        remarks={device.restorationRemarks}
                                        theme={theme}
                                        colorClass="bg-blue-500 text-white"
                                        icon="refresh"
                                    />
                                )}
                                {device.deletedAt && (
                                    <TimelineItem 
                                        action="Device Deleted"
                                        date={device.deletedAt}
                                        by={device.deletedBy || 'Unknown'}
                                        remarks={device.deletionRemarks}
                                        theme={theme}
                                        colorClass="bg-red-500 text-white"
                                        icon="delete"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewCameraModal;

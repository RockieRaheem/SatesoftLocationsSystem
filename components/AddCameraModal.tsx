
import React, { useState, useEffect } from 'react';
import { Theme, CameraDevice, Shop, ShopUser, SuperUser } from '../types';
import Icon from './Icon';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Omit<CameraDevice, 'id' | 'status' | 'addedAt' | 'shopName'>) => void;
  theme: Theme;
  shops: Shop[];
  users: (ShopUser | SuperUser)[];
}

const AddCameraModal: React.FC<AddCameraModalProps> = ({ isOpen, onClose, onSave, theme, shops, users }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Camera' as CameraDevice['type'],
        connectionString: '',
        shopId: '',
        category: 'Entrances' as CameraDevice['category'],
        ownerId: '',
        channels: 1,
    });

    const [availableOwners, setAvailableOwners] = useState<{id: number, name: string, phone: string}[]>([]);

    useEffect(() => {
        if (formData.shopId) {
            const shop = shops.find(s => s.id === parseInt(formData.shopId));
            if (shop) {
                const owner = users.find(u => u.id === shop.ownerId);
                const ownersList = [];
                
                if (owner) {
                    ownersList.push({ 
                        id: owner.id, 
                        name: `${owner.name} (Owner)`, 
                        phone: owner.phonePrimary?.number ? `${owner.phonePrimary.code} ${owner.phonePrimary.number}` : 'No Phone' 
                    });
                }
                
                // Mock a Co-owner for demonstration if the owner exists
                if (owner) {
                     ownersList.push({
                         id: 9999, // Mock ID
                         name: "Jane Doe (Co-owner)",
                         phone: "+256 700 123 456"
                     });
                }

                setAvailableOwners(ownersList);
                // Default select the first owner
                if (ownersList.length > 0) {
                    setFormData(prev => ({ ...prev, ownerId: ownersList[0].id.toString() }));
                }
            } else {
                setAvailableOwners([]);
            }
        } else {
            setAvailableOwners([]);
        }
    }, [formData.shopId, shops, users]);

    useEffect(() => {
        if (formData.type === 'Camera') {
            setFormData(prev => ({ ...prev, channels: 1 }));
        } else if (formData.channels === 1) {
             // Default to 4 channels when switching to DVR/NVR if it was 1
            setFormData(prev => ({ ...prev, channels: 4 }));
        }
    }, [formData.type]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setFormData({ name: '', type: 'Camera', connectionString: '', shopId: '', category: 'Entrances', ownerId: '', channels: 1 });
        }, 300);
    };

    const handleSave = () => {
        if (!formData.name || !formData.connectionString || !formData.shopId || !formData.ownerId) {
            alert("Please fill all fields.");
            return;
        }

        const selectedOwner = availableOwners.find(o => o.id === parseInt(formData.ownerId));
        
        alert(`OTP sent to ${selectedOwner?.name} at ${selectedOwner?.phone}`);

        onSave({
            name: formData.name,
            type: formData.type,
            connectionString: formData.connectionString,
            shopId: parseInt(formData.shopId),
            category: formData.category,
            ownerIdForOtp: parseInt(formData.ownerId),
            channels: formData.type === 'Camera' ? 1 : formData.channels,
        });
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-lg transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Add New Device</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Device Name</label>
                        <input 
                            type="text" 
                            className={`w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses}`} 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., Main Store NVR"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Device Type</label>
                            <select 
                                className={`w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses}`}
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as any})}
                            >
                                <option value="Camera">IP Camera</option>
                                <option value="DVR">DVR</option>
                                <option value="NVR">NVR</option>
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                            <select 
                                className={`w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses}`}
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value as any})}
                            >
                                <option value="Entrances">Entrances</option>
                                <option value="Checkout">Checkout</option>
                                <option value="Aisles">Aisles</option>
                                <option value="Storage">Storage</option>
                                <option value="Outside">Outside</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Channel Count - Only for NVR/DVR */}
                    {formData.type !== 'Camera' && (
                        <div>
                             <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Number of Channels</label>
                             <input 
                                type="number" 
                                min="1"
                                max="64"
                                className={`w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses}`} 
                                value={formData.channels}
                                onChange={e => setFormData({...formData, channels: parseInt(e.target.value) || 1})}
                            />
                        </div>
                    )}

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Connection String / IP</label>
                        <input 
                            type="text" 
                            className={`w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses}`} 
                            value={formData.connectionString}
                            onChange={e => setFormData({...formData, connectionString: e.target.value})}
                            placeholder="e.g., 192.168.1.105 or rtsp://..."
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Shop</label>
                        <select 
                            className={`w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses}`}
                            value={formData.shopId}
                            onChange={e => setFormData({...formData, shopId: e.target.value})}
                        >
                            <option value="">Select Shop...</option>
                            {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                        </select>
                    </div>

                    {formData.shopId && (
                        <div className={`p-4 border rounded-md ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Select Owner for OTP Verification</label>
                            {availableOwners.length > 0 ? (
                                <select 
                                    className={`w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses}`}
                                    value={formData.ownerId}
                                    onChange={e => setFormData({...formData, ownerId: e.target.value})}
                                >
                                    {availableOwners.map(owner => (
                                        <option key={owner.id} value={owner.id}>{owner.name} - {owner.phone}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-red-500">No owner found for this shop.</p>
                            )}
                            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                An OTP will be sent to the selected owner's phone number to verify this connection.
                            </p>
                        </div>
                    )}
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600"
                    >
                        Send OTP & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCameraModal;

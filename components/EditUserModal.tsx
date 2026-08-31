
import React, { useState, useEffect } from 'react';
import { ShopUser, Theme, PhoneNumber, Role } from '../types';
import Icon from './Icon';
import MultiSelectDropdown from './MultiSelectDropdown';
import PhoneInput from './PhoneInput';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: ShopUser) => void;
  userToEdit: ShopUser | null;
  theme: Theme;
  shopRoles: Role[];
}

const availableShops = [
    'Microvet Agroinputs Hub Mublo',
    'Equacare Pharmacy',
    'Korine Distributors Limited',
    'Mickey Tablets and More UG'
];

type UserEditState = Omit<ShopUser, 'phonePrimary' | 'phoneSecondary' | 'phoneWhatsapp'> & {
    phonePrimary: PhoneNumber;
    phoneSecondary: PhoneNumber;
    phoneWhatsapp: PhoneNumber;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onUpdate, userToEdit, theme, shopRoles }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [user, setUser] = useState<Partial<UserEditState>>({});

    useEffect(() => {
        if (userToEdit) {
            setUser({
                ...userToEdit,
                phonePrimary: userToEdit.phonePrimary || { code: '+256', number: '' },
                phoneSecondary: userToEdit.phoneSecondary || { code: '+256', number: '' },
                phoneWhatsapp: userToEdit.phoneWhatsapp || { code: '+256', number: '' },
            });
        }
    }, [userToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePhoneChange = (name: keyof UserEditState, value: PhoneNumber) => {
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if(event.target?.result) {
                    setUser(prev => ({ ...prev, avatar: event.target!.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSave = () => {
        if (!user.name || !user.email) {
            alert("Name and Email are required.");
            return;
        }
        if (user.userType === 'Shop User' && (!user.shop || user.shop.length === 0)) {
            alert("Please select at least one shop.");
            return;
        }
        
        const userToUpdate: ShopUser = {
            ...(user as ShopUser),
            phonePrimary: user.phonePrimary?.number ? user.phonePrimary : undefined,
            phoneSecondary: user.phoneSecondary?.number ? user.phoneSecondary : undefined,
            phoneWhatsapp: user.phoneWhatsapp?.number ? user.phoneWhatsapp : undefined,
        };
        
        onUpdate(userToUpdate);
        handleClose();
    };

    if (!isOpen && !isClosing || !userToEdit) return null;
    
    const commonInputClasses = `w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`;
    const labelClasses = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`;
    const commonFocusClasses = '';

    const avatarInitials = (user.name || '').split(' ').map(n => n[0]).join('').substring(0, 2);
    const isShopUser = user.userType === 'Shop User';

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Edit {userToEdit?.name}</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Avatar and User Info */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-slate-800 font-bold text-xl">{avatarInitials}</div>
                            )}
                            <label htmlFor="avatar-upload-edit" className="absolute -bottom-1 -right-1 bg-slate-700 p-1.5 rounded-full cursor-pointer hover:bg-slate-600">
                                <Icon name="camera" className="h-3 w-3 text-white" />
                                <input id="avatar-upload-edit" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                            <div>
                                <label className={labelClasses}>Full Name</label>
                                <input type="text" name="name" value={user.name || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                            </div>
                            <div>
                                <label className={labelClasses}>Email</label>
                                <input type="email" name="email" value={user.email || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                            </div>
                        </div>
                    </div>

                    {/* Shop and Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className={`md:col-span-2 ${!isShopUser ? 'hidden' : ''}`}>
                            <label className={labelClasses}>Shop(s)</label>
                             <MultiSelectDropdown 
                                theme={theme}
                                options={availableShops}
                                selected={user.shop || []}
                                onChange={(selectedShops) => setUser(prev => ({...prev, shop: selectedShops}))}
                                placeholder="Select one or more shops"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Role</label>
                            {isShopUser ? (
                                <select name="role" value={user.role || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}>
                                    {shopRoles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                                </select>
                            ) : (
                                <input type="text" value={user.role || ''} readOnly className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} opacity-70 cursor-not-allowed`} />
                            )}
                        </div>
                        <div>
                            <label className={labelClasses}>Created By</label>
                            <input type="text" value={user.createdBy || ''} readOnly className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} opacity-70 cursor-not-allowed`} />
                        </div>
                    </div>
                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Primary Phone</label>
                            <PhoneInput theme={theme} value={user.phonePrimary!} onChange={(val) => handlePhoneChange('phonePrimary', val)} />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Secondary Phone</label>
                            <PhoneInput theme={theme} value={user.phoneSecondary!} onChange={(val) => handlePhoneChange('phoneSecondary', val)} />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>WhatsApp</label>
                            <PhoneInput theme={theme} value={user.phoneWhatsapp!} onChange={(val) => handlePhoneChange('phoneWhatsapp', val)} />
                        </div>
                    </div>
                    {/* ID and Rating */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>ID Type</label>
                            <select name="idType" value={user.idType || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`}>
                                <option>National ID</option>
                                <option>Passport</option>
                                <option>Driver's License</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>ID Number</label>
                            <input type="text" name="idNumber" value={user.idNumber || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
                        </div>
                        <div className="md:col-span-2">
                             <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Average Rating</label>
                            <div className={`mt-1 flex items-center w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} opacity-70 cursor-not-allowed`}>
                                {user.averageRating ? (
                                    <>
                                        <Icon name="star" className="h-4 w-4 text-yellow-400 mr-2" />
                                        <span>{user.averageRating.toFixed(1)} / 5.0</span>
                                    </>
                                ) : (
                                    <span>Not Rated</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                        Update User
                    </button>
                </div>
            </div>
        </div>
    );
};
export default EditUserModal;

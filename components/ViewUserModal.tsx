import React, { useState, useEffect } from 'react';
import { ShopUser, Theme, PhoneNumber } from '../types';
import Icon, { IconName } from './Icon';
import { maskPhoneNumber } from '../utils';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ShopUser | null;
  theme: Theme;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode, theme: Theme }> = ({ label, value, theme }) => {
    const renderValue = () => {
        if (value === null || value === undefined || (typeof value === 'object' && !React.isValidElement(value) && Object.keys(value).length === 0)) {
            return <span className={`italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>N/A</span>;
        }
        if (typeof value === 'string' && value.trim() === '') {
             return <span className={`italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>N/A</span>;
        }
        return value;
    };
    
    return (
        <div>
            <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
            <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{renderValue()}</div>
        </div>
    );
};

const RatedEvent: React.FC<{ details: string, theme: Theme }> = ({ details, theme }) => {
    const ratingMatch = details.match(/Rated ([\d.]+)\/5/);
    const remarksMatch = details.match(/Remarks: (.*?)(?:\. Rated by:|$)/);
    const ratedByMatch = details.match(/Rated by: (.*)/);
    const shopMatch = details.match(/from (.*?)\. Rated/);
    
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
    const remarks = remarksMatch ? remarksMatch[1].trim() : 'No remarks provided.';
    const ratedBy = ratedByMatch ? ratedByMatch[1].replace(/\.$/, '').trim() : null;
    const shopName = shopMatch ? shopMatch[1].trim() : null;
    
    return (
        <div className={`mt-2 text-sm p-3 rounded-md border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            {rating !== null && (
                 <div className="flex items-center mb-2">
                     <span className="text-sm font-semibold mr-2">Rating:</span>
                     <div className="flex items-center">
                         {[...Array(5)].map((_, i) => (
                             <Icon key={i} name="star" className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400' : (theme === 'dark' ? 'text-slate-600' : 'text-slate-300')}`} />
                         ))}
                         <span className="ml-2 text-sm font-bold">{rating.toFixed(1)}/5.0</span>
                     </div>
                 </div>
            )}
            <p className={`italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>"{remarks}"</p>
            {(ratedBy || shopName) && 
                <p className={`text-xs text-right mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    &mdash; {ratedBy || 'System'} {shopName && `at ${shopName}`}
                </p>
            }
        </div>
    );
};

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setActiveTab('details');
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen && !isClosing || !user) return null;

    const formatPhoneNumber = (phone?: PhoneNumber) => {
        if (!phone || !phone.number) return null;
        return `${phone.code} ${maskPhoneNumber(phone.number)}`;
    };
    
    const avatarInitials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    
    const TabButton: React.FC<{ tabId: 'details' | 'history'; label: string }> = ({ tabId, label }) => {
        const isActive = activeTab === tabId;
        return (
            <button
                onClick={() => setActiveTab(tabId)}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    isActive
                        ? 'border-yellow-500 text-yellow-500'
                        : `border-transparent ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-start p-4 pt-8 overflow-y-auto transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-5xl flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b flex-shrink-0 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-4">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-slate-800 font-bold text-xl">{avatarInitials}</div>
                        )}
                        <div>
                            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</h2>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className={`px-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <nav className="flex space-x-4">
                        <TabButton tabId="details" label="User Details" />
                        <TabButton tabId="history" label="User History" />
                    </nav>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'details' && (
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-lg font-semibold mb-4">User Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    <DetailItem theme={theme} label="Role" value={user.role} />
                                    <DetailItem theme={theme} label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>} />
                                    <DetailItem theme={theme} label="Created By" value={user.createdBy} />
                                    <DetailItem theme={theme} label="Last Activity" value={new Date(user.lastActivity).toLocaleString()} />
                                    <DetailItem theme={theme} label="Average Rating" value={
                                        user.averageRating ? (
                                            <div className="flex items-center">
                                                <Icon name="star" className="h-4 w-4 text-yellow-400 mr-1" />
                                                <span>{user.averageRating.toFixed(1)} / 5.0</span>
                                            </div>
                                        ) : null
                                    } />
                                    <DetailItem theme={theme} label="Shop(s)" value={
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.shop.map(s => <span key={s} className={`px-2 py-0.5 text-xs rounded-full ${theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>{s}</span>)}
                                        </div>
                                    } />
                                </div>
                            </section>
                            <section>
                                <h3 className={`text-lg font-semibold pt-6 border-t mb-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Contact & ID</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    <DetailItem theme={theme} label="Primary Phone" value={formatPhoneNumber(user.phonePrimary)} />
                                    <DetailItem theme={theme} label="Secondary Phone" value={formatPhoneNumber(user.phoneSecondary)} />
                                    <DetailItem theme={theme} label="WhatsApp" value={formatPhoneNumber(user.phoneWhatsapp)} />
                                    <DetailItem theme={theme} label="ID Type" value={user.idType} />
                                    <DetailItem theme={theme} label="ID Number" value={user.idNumber} />
                                </div>
                            </section>
                        </div>
                    )}
                    {activeTab === 'history' && (
                         <div className="relative pl-6">
                            <div className={`absolute left-0 top-0 h-full w-0.5 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                            <ul className="space-y-6 pr-2">
                                {user.history.map((item, index) => (
                                    <li key={index} className="relative timeline-item-enter">
                                        <div className={`absolute -left-[27px] top-1 flex items-center justify-center w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'}`}></div>
                                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.action}</p>
                                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(item.date).toLocaleString()}</p>
                                        {item.action === 'Rated' && item.details ? (
                                            <RatedEvent details={item.details} theme={theme} />
                                        ) : (
                                            item.details && <p className={`text-sm mt-1 italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.details}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg flex-shrink-0 ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewUserModal;
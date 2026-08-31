
import React, { useState, useEffect } from 'react';
import { Theme, Lead } from '../types';
import Icon, { IconName } from './Icon';
import { maskPhoneNumber, formatDate } from '../utils';

interface ViewLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    theme: Theme;
}

const ViewLeadModal: React.FC<ViewLeadModalProps> = ({ isOpen, onClose, lead, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setShowMap(false);
            setIsFullScreen(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    if (!isOpen && !isClosing || !lead) return null;

    const DetailSection = ({ title, icon, children }: { title: string, icon: IconName, children?: React.ReactNode }) => (
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`text-sm font-bold mb-3 uppercase tracking-wider flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                <Icon name={icon} className="h-4 w-4" />
                {title}
            </h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );

    const DetailItem = ({ label, value, fullWidth = false }: { label: string, value: string | number | React.ReactNode, fullWidth?: boolean }) => (
        <div className={fullWidth ? 'col-span-full' : ''}>
            <div className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
            <div className={`mt-0.5 text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} break-words`}>{value || <span className="italic opacity-50">N/A</span>}</div>
        </div>
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Hot': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
            case 'Warm': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
            case 'Cold': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
            default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
        }
    };

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                
                {/* Header */}
                <div className={`flex justify-between items-start p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{lead.companyName}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusColor(lead.status)}`}>
                                {lead.status}
                            </span>
                        </div>
                        <p className={`text-sm mt-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Icon name="user-circle" className="h-4 w-4" />
                            {lead.firstName} {lead.lastName}
                        </p>
                    </div>
                    <button onClick={handleClose} className={`p-1 rounded-full hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 relative">
                    {showMap && lead.latitude && lead.longitude ? (
                        <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-[100] bg-black' : 'absolute inset-0 z-10 p-6'}`}>
                            <div className={`relative w-full h-full rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                                {/* Map Controls */}
                                <div className="absolute top-4 right-4 z-20 flex gap-2">
                                    <button 
                                        onClick={toggleFullScreen}
                                        className={`p-2 rounded-md shadow-lg flex items-center gap-2 text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                                        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                    >
                                        <Icon name={isFullScreen ? "arrows-pointing-in" : "arrows-pointing-out"} className="h-4 w-4" />
                                        {isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                    </button>
                                    <button 
                                        onClick={() => { setShowMap(false); setIsFullScreen(false); }}
                                        className={`p-2 rounded-md shadow-lg flex items-center gap-2 text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-red-900/80 text-red-200 hover:bg-red-800' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                    >
                                        <Icon name="x-mark" className="h-4 w-4" />
                                        Close Map
                                    </button>
                                </div>

                                {/* Map Iframe */}
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    marginHeight={0} 
                                    marginWidth={0} 
                                    title="Lead Location Map"
                                    src={`https://maps.google.com/maps?q=${lead.latitude},${lead.longitude}&hl=en&z=14&output=embed`}
                                    className="bg-slate-100"
                                ></iframe>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Contact Info */}
                        <DetailSection title="Contact Details" icon="phone">
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Primary Phone" value={lead.phone ? `${lead.phone.code} ${maskPhoneNumber(lead.phone.number)}` : 'N/A'} />
                                <DetailItem label="Alt. Phone" value={lead.alternativePhone?.number ? `${lead.alternativePhone.code} ${maskPhoneNumber(lead.alternativePhone.number)}` : 'N/A'} />
                                <DetailItem label="Email Address" value={lead.email} fullWidth />
                            </div>
                        </DetailSection>

                        {/* Lead Status */}
                        <DetailSection title="Lead Status" icon="analytics">
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Current Stage" value={lead.stage} />
                                <DetailItem label="Source" value={lead.source} />
                                <DetailItem label="Assigned Owner" value={lead.owner} />
                                <DetailItem label="Lead ID" value={`#${lead.id}`} />
                            </div>
                        </DetailSection>

                        {/* Location */}
                        <DetailSection title="Location" icon="globe">
                            <DetailItem label="Physical Address" value={lead.physicalLocation} fullWidth />
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <DetailItem label="Latitude" value={lead.latitude} />
                                <DetailItem label="Longitude" value={lead.longitude} />
                            </div>
                            {(lead.latitude && lead.longitude) && (
                                <div className="mt-3">
                                    <button 
                                        onClick={() => setShowMap(true)}
                                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                        <Icon name="map" className="h-3 w-3" /> View on Map
                                    </button>
                                </div>
                            )}
                        </DetailSection>

                        {/* Remarks */}
                        <DetailSection title="Remarks & Notes" icon="chat-bubble">
                            <div className={`p-3 rounded text-sm min-h-[80px] ${theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-600 border border-slate-100'}`}>
                                {lead.remarks || "No remarks provided."}
                            </div>
                        </DetailSection>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex justify-between items-center p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Created by <span className="font-medium">{lead.createdBy}</span> on {formatDate(lead.createdDate)} at {new Date(lead.createdDate).toLocaleTimeString()}
                    </div>
                    <button onClick={handleClose} className={`px-6 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewLeadModal;

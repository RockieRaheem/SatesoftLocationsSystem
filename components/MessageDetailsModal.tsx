
import React, { useState, useEffect } from 'react';
import { ChatMessage, Theme } from '../types';
import Icon from './Icon';

interface MessageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessage | null;
  theme: Theme;
}

const DetailRow: React.FC<{ label: string; value: string; theme: Theme }> = ({ label, value, theme }) => (
    <div className={`flex flex-col pb-3 border-b last:border-0 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value}</span>
    </div>
);

const MessageDetailsModal: React.FC<MessageDetailsModalProps> = ({ isOpen, onClose, message, theme }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    if (!isOpen && !isClosing || !message) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300" onClick={handleClose}>
            <div 
                className={`w-full max-w-md rounded-lg shadow-2xl transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex justify-between items-center p-5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Message Details</h3>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <DetailRow label="Sender Name" value={message.senderName} theme={theme} />
                    <DetailRow label="Role" value={message.senderRole} theme={theme} />
                    <DetailRow label="Shop / Location" value={message.shopName || 'N/A'} theme={theme} />
                    <DetailRow label="Sent At" value={new Date(message.timestamp).toLocaleString()} theme={theme} />
                    <DetailRow label="Message ID" value={message.id} theme={theme} />
                    
                    <div className="pt-2">
                        <span className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Content</span>
                        <div className={`p-3 rounded-md text-sm ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                            {message.content}
                        </div>
                    </div>
                </div>

                <div className={`flex justify-end p-5 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button 
                        onClick={handleClose} 
                        className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageDetailsModal;

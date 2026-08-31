
import React, { useState, useEffect } from 'react';
import { Theme, ChatRoom } from '../types';
import Icon from './Icon';

interface ChatRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (room: ChatRoom) => void;
    roomToEdit: ChatRoom | null;
    theme: Theme;
}

const ChatRoomModal: React.FC<ChatRoomModalProps> = ({ isOpen, onClose, onSave, roomToEdit, theme }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ChatRoom['type']>('General');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (roomToEdit) {
                setName(roomToEdit.name);
                setType(roomToEdit.type);
            } else {
                setName('');
                setType('General');
            }
            setIsClosing(false);
        }
    }, [isOpen, roomToEdit]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert('Room name is required');
            return;
        }

        const room: ChatRoom = {
            id: roomToEdit ? roomToEdit.id : `room-${Date.now()}`,
            name,
            type
        };

        onSave(room);
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    const inputClasses = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300">
            <div className={`w-full max-w-md rounded-lg shadow-xl transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {roomToEdit ? 'Edit Room' : 'Create New Room'}
                    </h3>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Room Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className={inputClasses} 
                            placeholder="e.g. Marketing Updates"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Room Type</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value as any)} 
                            className={inputClasses}
                        >
                            <option value="General">General</option>
                            <option value="Shop">Shop</option>
                            <option value="Region">Region</option>
                            <option value="Private">Private</option>
                        </select>
                    </div>
                </div>

                <div className={`flex justify-end p-5 border-t space-x-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button 
                        onClick={handleClose} 
                        className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 text-slate-900 hover:bg-yellow-600 shadow-sm"
                    >
                        Save Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoomModal;

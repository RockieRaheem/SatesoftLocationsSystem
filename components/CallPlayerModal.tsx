
import React, { useRef, useState, useEffect } from 'react';
import { CallRecord, Theme } from '../types';
import Icon from './Icon';

interface CallPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    call: CallRecord | null;
    theme: Theme;
    onReturnCall: (call: CallRecord) => void;
}

const CallPlayerModal: React.FC<CallPlayerModalProps> = ({ isOpen, onClose, call, theme, onReturnCall }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsPlaying(false);
    }, [isOpen]);

    if (!isOpen || !call) return null;

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-lg rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Call Recording</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-8 flex flex-col items-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon name="phone" className="h-10 w-10" />
                    </div>
                    <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{call.clientName}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{call.phoneNumber}</p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(call.timestamp).toLocaleString()}</p>

                    {call.recordingUrl ? (
                        <div className="w-full mt-6">
                            <audio 
                                ref={audioRef} 
                                src={call.recordingUrl} 
                                className="w-full" 
                                controls 
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                        </div>
                    ) : (
                        <p className="mt-6 text-sm italic text-red-500">Recording not available.</p>
                    )}
                </div>

                <div className={`flex justify-between p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                     <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Close</button>
                     <button 
                        onClick={() => { onReturnCall(call); onClose(); }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 shadow-sm"
                    >
                        <Icon name="phone" className="h-4 w-4" />
                        <span>Return Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallPlayerModal;


import React from 'react';
import { CallRecord, Theme } from '../types';
import Icon from './Icon';

interface TranscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    call: CallRecord | null;
    theme: Theme;
}

const TranscriptionModal: React.FC<TranscriptionModalProps> = ({ isOpen, onClose, call, theme }) => {
    if (!isOpen || !call) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-2xl rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col max-h-[80vh]`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-semibold flex items-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        <Icon name="transcript" className="h-5 w-5 mr-2 text-blue-500" />
                        Call Transcription
                    </h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="mb-4 flex justify-between items-center">
                         <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{call.clientName}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(call.timestamp).toLocaleString()}</p>
                         </div>
                         <span className={`px-2 py-1 rounded text-xs ${call.type === 'Inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{call.type}</span>
                    </div>
                    
                    <div className={`p-4 rounded-md border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} whitespace-pre-wrap font-mono text-sm`}>
                        {call.transcription || "No transcription available for this call."}
                    </div>
                </div>

                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                     <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default TranscriptionModal;

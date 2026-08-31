
import React, { useState, useEffect, useRef } from 'react';
import { Theme, User, Client } from '../types';
import Icon from './Icon';
import { maskPhoneNumber } from '../utils';

interface ActiveCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: { name: string; phone: string; avatar?: string } | null;
    currentUser: User;
    theme: Theme;
    allowMicrophone?: boolean; // Optional prop, defaults to true logic inside if missing, but passed from parent
    onCallComplete?: (details: { duration: number; status: 'Completed' | 'Missed' | 'Voicemail' }) => void;
}

const Waveform: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
    return (
        <div className="flex items-center justify-center space-x-1 h-8">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-100 ${color}`}
                    style={{
                        height: active ? `${Math.max(20, Math.random() * 100)}%` : '15%',
                        opacity: active ? 1 : 0.3
                    }}
                ></div>
            ))}
        </div>
    );
};

const ActiveCallModal: React.FC<ActiveCallModalProps> = ({ isOpen, onClose, client, currentUser, theme, allowMicrophone = true, onCallComplete }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState<'Connecting' | 'Connected' | 'Ending' | 'Mic Disabled'>('Connecting');
    const [activeSpeaker, setActiveSpeaker] = useState<'agent' | 'client'>('agent');
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    
    // Simulation refs
    const speakerInterval = useRef<number | null>(null);
    const animationFrame = useRef<number | null>(null);
    const [, setTick] = useState(0); // Trigger render for wave animation

    useEffect(() => {
        if (isOpen) {
            setDuration(0);
            setActiveSpeaker('agent');
            
            setStatus('Connecting');
            // Simulate Connection
            const connectTimeout = setTimeout(() => {
                setStatus('Connected');
            }, 1500);
            return () => clearTimeout(connectTimeout);
        }
    }, [isOpen, allowMicrophone]);

    // Timer Logic
    useEffect(() => {
        let timer: number;
        if (status === 'Connected') {
            timer = window.setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);

    // Speaker Switching Logic (Simulation)
    useEffect(() => {
        if (status === 'Connected') {
            speakerInterval.current = window.setInterval(() => {
                // Randomly switch speakers every 2-5 seconds
                if (Math.random() > 0.3) {
                    setActiveSpeaker(prev => prev === 'agent' ? 'client' : 'agent');
                }
            }, 3000);
        }
        return () => {
            if (speakerInterval.current) clearInterval(speakerInterval.current);
        };
    }, [status]);

    // Waveform Animation Loop
    useEffect(() => {
        if (status === 'Connected') {
            const loop = () => {
                setTick(t => t + 1);
                animationFrame.current = requestAnimationFrame(loop);
            };
            loop();
        }
        return () => {
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        };
    }, [status]);

    const handleEndCall = () => {
        const finalStatus = status === 'Connected' ? 'Completed' : 'Missed';
        const finalDuration = duration;
        
        setStatus('Ending');
        
        if (onCallComplete) {
            onCallComplete({
                duration: finalDuration,
                status: finalStatus
            });
        }

        setTimeout(() => {
            handleClose();
        }, 1000);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setStatus('Connecting');
        }, 300);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen && !isClosing || !client) return null;

    const avatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                
                {/* Header */}
                <div className={`p-4 flex justify-between items-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        {status === 'Connected' ? (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        ) : status === 'Mic Disabled' ? (
                            <Icon name="volume-off" className="h-4 w-4 text-red-500" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {status === 'Connected' ? 'Recording' : status}
                        </span>
                    </div>
                    <div className={`text-sm font-mono font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                        {formatTime(duration)}
                    </div>
                </div>

                {/* Call Body */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-8">
                    
                    {/* Participants */}
                    <div className="w-full flex justify-between items-center px-4">
                        
                        {/* Agent (Left) */}
                        <div className={`flex flex-col items-center transition-opacity duration-300 ${activeSpeaker === 'agent' ? 'opacity-100 scale-105' : 'opacity-60 scale-95'}`}>
                            <div className={`w-20 h-20 rounded-full mb-3 border-4 flex items-center justify-center overflow-hidden ${activeSpeaker === 'agent' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-transparent'}`}>
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white font-bold text-xl">
                                        {avatarInitials(currentUser.name)}
                                    </div>
                                )}
                            </div>
                            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>You</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Agent</p>
                        </div>

                        {/* Visualizer (Center) */}
                        <div className="flex-1 px-4">
                           {status === 'Connected' && (
                                <div className="space-y-2">
                                     {/* Agent Wave */}
                                     <div className={`transition-opacity duration-300 ${activeSpeaker === 'agent' ? 'opacity-100' : 'opacity-0'}`}>
                                         <Waveform active={true} color="bg-yellow-500" />
                                     </div>
                                     {/* Connector Line */}
                                     <div className={`h-px w-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                                     {/* Client Wave */}
                                     <div className={`transition-opacity duration-300 ${activeSpeaker === 'client' ? 'opacity-100' : 'opacity-0'}`}>
                                         <Waveform active={true} color="bg-blue-500" />
                                     </div>
                                </div>
                           )}
                           {status === 'Connecting' && (
                               <div className="flex justify-center space-x-1">
                                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                               </div>
                           )}
                           {status === 'Mic Disabled' && (
                               <div className="text-center">
                                   <Icon name="volume-off" className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                   <p className="text-xs text-red-500">Access Denied</p>
                               </div>
                           )}
                        </div>

                        {/* Client (Right) */}
                        <div className={`flex flex-col items-center transition-opacity duration-300 ${activeSpeaker === 'client' ? 'opacity-100 scale-105' : 'opacity-60 scale-95'}`}>
                            <div className={`w-20 h-20 rounded-full mb-3 border-4 flex items-center justify-center overflow-hidden ${activeSpeaker === 'client' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent'}`}>
                                {client.avatar ? (
                                    <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                        {avatarInitials(client.name)}
                                    </div>
                                )}
                            </div>
                            <p className={`text-sm font-semibold text-center ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{client.name}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{maskPhoneNumber(client.phone)}</p>
                        </div>

                    </div>
                    
                    <div className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <p className="text-sm">
                            {status === 'Connected' ? 'Call in progress...' : status === 'Mic Disabled' ? 'Please enable microphone in settings.' : 'Calling...'}
                        </p>
                    </div>

                </div>

                {/* Controls */}
                <div className={`p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="flex justify-center items-center space-x-6">
                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            disabled={status !== 'Connected'}
                            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'} disabled:opacity-50`}
                        >
                            <Icon name={isMuted ? 'volume-off' : 'volume-up'} className="h-6 w-6" />
                        </button>
                        
                        <button className={`p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-all disabled:opacity-50`} disabled={status !== 'Connected'}>
                            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
                                {[...Array(9)].map((_, i) => <div key={i} className="bg-current rounded-full w-1 h-1"></div>)}
                            </div>
                        </button>

                        <button 
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                            disabled={status !== 'Connected'}
                            className={`p-4 rounded-full transition-all ${isSpeakerOn ? 'bg-white text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'} disabled:opacity-50`}
                        >
                            <Icon name="broadcast" className="h-6 w-6" />
                        </button>

                        <button 
                            onClick={handleEndCall}
                            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transform hover:scale-110 transition-all"
                        >
                             <Icon name="phone-missed" className="h-8 w-8 transform rotate-135" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveCallModal;

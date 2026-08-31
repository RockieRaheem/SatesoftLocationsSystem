
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, PacketTracerLog } from '../types';
import Icon, { IconName } from './Icon';

interface PacketTraceModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: PacketTracerLog | null;
    theme: Theme;
}

interface TraceNode {
    id: number;
    name: string;
    type: string;
    ip: string;
    latency: string;
    status: 'Pending' | 'Processing' | 'Success' | 'Failed';
    icon: IconName;
    details: string;
    errorSuggestion?: string;
}

const PacketTraceModal: React.FC<PacketTraceModalProps> = ({ isOpen, onClose, log, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [steps, setSteps] = useState<TraceNode[]>([]);
    const [animationStep, setAnimationStep] = useState(0);
    const [isReplaying, setIsReplaying] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const startTrace = useCallback(() => {
        if (!log) return;

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setAnimationStep(0);
        setIsReplaying(true);
        
        const isSuccess = log.status === 'Success';
        
        // Determine source icon and name based on platform
        let sourceIcon: IconName = 'globe';
        let sourceName = 'Client Browser';
        
        if (log.platform === 'iOS' || log.platform === 'Android') {
            sourceIcon = 'phone';
            sourceName = `${log.platform} Device`;
        } else if (log.platform === 'Desktop') {
            sourceIcon = 'system-settings';
            sourceName = 'Desktop App';
        }
        
        // Define the base path
        const tracePath: TraceNode[] = [
            { id: 1, name: sourceName, type: 'Source', ip: log.ipAddress, latency: '0ms', status: 'Pending', icon: sourceIcon, details: `User: ${log.user} (${log.version || 'v1.0'})` },
            { id: 2, name: 'WAF / Firewall', type: 'Security', ip: '10.0.0.1', latency: '12ms', status: 'Pending', icon: 'shield-check', details: 'Packet inspection & XSS check' },
            { id: 3, name: 'Load Balancer', type: 'Routing', ip: '10.0.0.5', latency: '18ms', status: 'Pending', icon: 'share', details: 'Round-robin distribution' },
            { id: 4, name: 'API Gateway', type: 'Auth', ip: '192.168.1.20', latency: '45ms', status: 'Pending', icon: 'lock', details: 'JWT Verification & Rate Limiting' },
            { id: 5, name: 'Product Service', type: 'Application', ip: '192.168.1.50', latency: '120ms', status: 'Pending', icon: 'system-settings', details: 'Business Logic: Validate Product Data' },
            { id: 6, name: 'Primary DB', type: 'Database', ip: '192.168.1.100', latency: '185ms', status: 'Pending', icon: 'analytics', details: 'INSERT INTO products_table' },
            { id: 7, name: sourceName, type: 'Response', ip: log.ipAddress, latency: '210ms', status: 'Pending', icon: 'check-circle', details: 'Receive HTTP 201 Created' },
        ];

        // Inject error info if failed
        if (!isSuccess) {
            // Simulate failure at Step 5 (Application Layer) or Step 4 (Auth) based on log details text
            const failureStepIndex = log.details.toLowerCase().includes('permission') ? 3 : 4; // Index in array (id - 1)
            
            tracePath[failureStepIndex].errorSuggestion = log.details.toLowerCase().includes('permission') 
                ? "User role does not have sufficient privileges. Check 'Permissions' settings for this user role."
                : "Database connection timeout or constraint violation. Check database logs for deadlock or duplicate entry errors.";
        }

        setSteps(tracePath);

        // Start animation sequence
        let currentStep = 0;
        intervalRef.current = window.setInterval(() => {
            currentStep++;
            setAnimationStep(currentStep);
            
            setSteps(prev => prev.map(step => {
                if (step.id === currentStep) {
                    // If this is the failure step in a failed log
                    if (!isSuccess && (
                        (log.details.toLowerCase().includes('permission') && step.id === 4) || 
                        (!log.details.toLowerCase().includes('permission') && step.id === 5)
                    )) {
                        return { ...step, status: 'Failed' };
                    } 
                    return { ...step, status: 'Success' };
                }
                return step;
            }));

            const failureStepId = log.details.toLowerCase().includes('permission') ? 4 : 5;

            if (currentStep >= tracePath.length || (!isSuccess && currentStep === failureStepId)) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsReplaying(false);
            }
        }, 800);

    }, [log]);

    useEffect(() => {
        if (isOpen && log) {
            startTrace();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isOpen, log, startTrace]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    if (!isOpen && !isClosing || !log) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                
                {/* Header */}
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            <Icon name="analytics" className="h-6 w-6 text-yellow-500" />
                            Packet Trace: {log.functionName}
                        </h2>
                        <div className={`flex items-center gap-3 mt-1 text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span>ID: {log.id}</span>
                            <span>•</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span className={log.status === 'Success' ? 'text-green-500' : 'text-red-500'}>{log.status}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={startTrace} 
                            disabled={isReplaying}
                            className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                                isReplaying 
                                    ? 'opacity-50 cursor-not-allowed border-transparent text-slate-500' 
                                    : theme === 'dark' 
                                        ? 'border-slate-600 hover:bg-slate-800 text-slate-300' 
                                        : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                            <Icon name="refresh" className={`h-3 w-3 ${isReplaying ? 'animate-spin' : ''}`} />
                            <span>Replay</span>
                        </button>
                        <button onClick={handleClose} className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-slate-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Icon name="x-mark" className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Body - The Visualization */}
                <div className="p-8 overflow-y-auto flex-1 relative">
                    {/* Connecting Line Background */}
                    <div className="absolute left-[3.25rem] top-12 bottom-12 w-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
                    
                    {/* Active Packet Animation (Moving dot) */}
                    {animationStep > 0 && animationStep < steps.length && steps[animationStep]?.status !== 'Failed' && (
                         <div 
                            className="absolute left-[3.25rem] w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_#eab308] z-10 transition-all duration-700 ease-linear"
                            style={{ 
                                top: `${(animationStep - 0.5) * 96 + 48}px`, // Approximate calculation based on node height
                                opacity: 1 
                            }}
                         />
                    )}

                    <div className="space-y-8 relative z-10">
                        {steps.map((step, index) => {
                            const isActive = animationStep === step.id;
                            const isPending = animationStep < step.id;
                            
                            let statusColor = theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200';
                            let iconColor = theme === 'dark' ? 'text-slate-500' : 'text-slate-400';
                            
                            if (isActive && step.status !== 'Failed') {
                                statusColor = 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
                                iconColor = 'text-yellow-500';
                            } else if (step.status === 'Success') {
                                statusColor = theme === 'dark' ? 'bg-green-900/20 border-green-500/50' : 'bg-green-50 border-green-300';
                                iconColor = 'text-green-500';
                            } else if (step.status === 'Failed') {
                                statusColor = theme === 'dark' ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-300';
                                iconColor = 'text-red-500';
                            }

                            return (
                                <div key={step.id} className={`flex items-start gap-6 transition-all duration-500 ${isPending ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                                    {/* Node Icon */}
                                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${statusColor} transition-colors duration-300`}>
                                        <Icon name={step.icon} className={`h-6 w-6 ${iconColor}`} />
                                    </div>

                                    {/* Details Card */}
                                    <div className={`flex-1 p-4 rounded-lg border ${statusColor} flex flex-col transition-all duration-300`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{step.type}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{step.ip}</span>
                                                </div>
                                                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{step.name}</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-bold ${isActive && step.status !== 'Failed' ? 'text-yellow-500 animate-pulse' : (step.status === 'Success' ? 'text-green-500' : step.status === 'Failed' ? 'text-red-500' : 'text-slate-500')}`}>
                                                    {isActive && step.status !== 'Failed' ? 'Processing...' : step.status}
                                                </div>
                                                {step.status !== 'Pending' && (
                                                     <div className={`text-xs font-mono mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        Latency: {step.latency}
                                                     </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{step.details}</p>

                                        {/* Error Suggestion Block */}
                                        {step.status === 'Failed' && step.errorSuggestion && (
                                            <div className={`mt-3 p-3 rounded-md text-sm border flex items-start gap-2 animate-bounce-in ${theme === 'dark' ? 'bg-red-900/30 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                <Icon name="exclamation-triangle" className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold mb-1">Error Detected</p>
                                                    <p>{step.errorSuggestion}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                     <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Total Request Time: <span className="font-bold font-mono">{parseInt(log.status === 'Success' ? '210' : '185')}ms</span>
                     </div>
                    <button 
                        onClick={handleClose}
                        className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
                    >
                        Close Trace
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PacketTraceModal;

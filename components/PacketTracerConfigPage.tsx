import React, { useState } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface PacketTracerConfigPageProps {
    theme: Theme;
}

interface FilterRule {
    id: string;
    type: 'IP' | 'Function' | 'Platform';
    pattern: string;
    action: 'LOG_AND_TRACE' | 'LOG_ONLY' | 'DROP_SILENT' | 'ALERT_CRITICAL';
    enabled: boolean;
}

const PacketTracerConfigPage: React.FC<PacketTracerConfigPageProps> = ({ theme }) => {
    // 1. General Capture Toggles
    const [enablePacketCapture, setEnablePacketCapture] = useState(true);
    const [retentionDays, setRetentionDays] = useState(30);
    const [maxLogSize, setMaxLogSize] = useState(10); // in MB
    const [anonymizeIps, setAnonymizeIps] = useState(false);

    // 2. Performance & Sampling settings
    const [samplingRate, setSamplingRate] = useState(100); // percentage 0-100
    const [streamBufferLimit, setStreamBufferLimit] = useState(500); // lines

    // 3. Routing Filter Rules list
    const [rules, setRules] = useState<FilterRule[]>([
        { id: 'rule-1', type: 'Function', pattern: 'verify_identity', action: 'ALERT_CRITICAL', enabled: true },
        { id: 'rule-2', type: 'Platform', pattern: 'Desktop', action: 'LOG_ONLY', enabled: true },
        { id: 'rule-3', type: 'IP', pattern: '10.0.0.0/8', action: 'DROP_SILENT', enabled: false },
        { id: 'rule-4', type: 'Function', pattern: 'login', action: 'LOG_AND_TRACE', enabled: true }
    ]);

    // 4. Notification Toggles
    const [alertOnFailures, setAlertOnFailures] = useState(true);
    const [failureThreshold, setFailureThreshold] = useState(5); // failures/min
    const [alertEmail, setAlertEmail] = useState('ops@locationregister.org');
    const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/duqact/packet-alerts');

    // State for notification toast on save
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const handleToggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    const [newType, setNewType] = useState<'IP' | 'Function' | 'Platform'>('Function');
    const [newPattern, setNewPattern] = useState('');
    const [newAction, setNewAction] = useState<'LOG_AND_TRACE' | 'LOG_ONLY' | 'DROP_SILENT' | 'ALERT_CRITICAL'>('LOG_AND_TRACE');

    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPattern.trim()) return;
        const newRule: FilterRule = {
            id: `rule-${Date.now()}`,
            type: newType,
            pattern: newPattern,
            action: newAction,
            enabled: true
        };
        setRules(prev => [...prev, newRule]);
        setNewPattern('');
    };

    const handleSaveChanges = () => {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Control banner */}
            <div className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
                <div>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                            <Icon name="system-settings" className="w-5 h-5" />
                        </div>
                        <h1 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Tracer Configurations & Hooks
                        </h1>
                    </div>
                    <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Configure telemetry rules, sampling rates, anonymization settings, and real-time failure alerts.
                    </p>
                </div>
                <button
                    onClick={handleSaveChanges}
                    className="flex justify-center items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-xl shadow-md transition-all text-sm active:scale-95"
                >
                    <Icon name="shield-check" className="w-4 h-4" />
                    <span>Save Application Config</span>
                </button>
            </div>

            {/* Notification alert */}
            {showSaveSuccess && (
                <div className="p-4 bg-green-500 text-white font-semibold rounded-xl flex items-center gap-3 shadow-lg animate-bounce">
                    <Icon name="shield-check" className="w-5 h-5 flex-shrink-0" />
                    <span>Debugger configuration saved and propagated to all node ingress routes successfully!</span>
                </div>
            )}

            {/* Config Panels grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Panel 1: Ingress Toggles */}
                <div className={`p-6 rounded-xl border space-y-5 lg:col-span-2 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        <Icon name="broadcast" className="w-5 h-5 text-yellow-500" />
                        <span>Telemetry Capture Settings</span>
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Toggle 1 */}
                        <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                    Enable Active Tracer
                                </h3>
                                <p className="text-xs text-slate-400">Record incoming and outgoing WebSocket packet structures.</p>
                            </div>
                            <button
                                onClick={() => setEnablePacketCapture(!enablePacketCapture)}
                                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                                    enablePacketCapture ? 'bg-yellow-500 justify-end' : 'bg-slate-400 justify-start'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-md block" />
                            </button>
                        </div>

                        {/* Toggle 2 */}
                        <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                    Ip Anonymization Check
                                </h3>
                                <p className="text-xs text-slate-400">Mask the final octet of IP addresses (e.g. 192.168.1.xxx) for GDPR logs compliance.</p>
                            </div>
                            <button
                                onClick={() => setAnonymizeIps(!anonymizeIps)}
                                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                                    anonymizeIps ? 'bg-yellow-500 justify-end' : 'bg-slate-400 justify-start'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-md block" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Trace Logs Retention (Days)
                            </label>
                            <input
                                type="number"
                                value={retentionDays}
                                onChange={(e) => setRetentionDays(Number(e.target.value))}
                                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Sampling Rate (%)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={samplingRate}
                                onChange={(e) => setSamplingRate(Math.min(100, Math.max(1, Number(e.target.value))))}
                                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Max File Buffer Usage
                            </label>
                            <select
                                value={maxLogSize}
                                onChange={(e) => setMaxLogSize(Number(e.target.value))}
                                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-slate-800 ${
                                    theme === 'dark' ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'
                                }`}
                            >
                                <option value="5">5 MB Limit</option>
                                <option value="10">10 MB Limit</option>
                                <option value="50">50 MB Limit</option>
                                <option value="100">100 MB Limit</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                WebSocket RAM Buffer Limit (Rows)
                            </label>
                            <input
                                type="number"
                                value={streamBufferLimit}
                                onChange={(e) => setStreamBufferLimit(Number(e.target.value))}
                                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Panel 2: Ingress Alarm targets */}
                <div className={`p-6 rounded-xl border space-y-5 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        <Icon name="shield-alert" className="w-5 h-5 text-red-500" />
                        <span>System Alarm Webhooks</span>
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-1">
                            <div>
                                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                    Failure Alerts Trigger
                                </h3>
                                <p className="text-xs text-slate-400">Trigger active dispatch when drop rate climbs.</p>
                            </div>
                            <button
                                onClick={() => setAlertOnFailures(!alertOnFailures)}
                                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                                    alertOnFailures ? 'bg-yellow-500 justify-end' : 'bg-slate-400 justify-start'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-md block" />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                failure Threshold Limit
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={failureThreshold}
                                    onChange={(e) => setFailureThreshold(Number(e.target.value))}
                                    className={`w-28 px-3.5 py-2 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                    }`}
                                />
                                <span className="text-xs text-slate-400 font-medium">Drops / min limit before critical notification</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Operations Alert Email
                            </label>
                            <input
                                type="email"
                                value={alertEmail}
                                onChange={(e) => setAlertEmail(e.target.value)}
                                className={`w-full px-3.5 py-2 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Slack/Teams Webhook URL
                            </label>
                            <input
                                type="text"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className={`w-full px-3.5 py-2 rounded-xl border outline-none font-mono text-xs transition-all focus:ring-2 focus:ring-yellow-500 ${
                                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel 3: Complex Interactive Rules Filtering Matrix */}
            <div className={`p-6 rounded-xl border mt-6 space-y-6 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
                <div>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        <Icon name="key" className="w-5 h-5 text-yellow-500" />
                        <span>Interactive Gateway Capture Filters</span>
                    </h2>
                    <p className={`text-xs leading-relaxed mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Setup specialized action drop filters or custom alarm rules below. Ingress matches proceed down the array sequentially.
                    </p>
                </div>

                {/* Form to append rules */}
                <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Object</label>
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="Function">Function Name</option>
                            <option value="Platform">Platform Identifier</option>
                            <option value="IP">IP / Subnet CIDR</option>
                        </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-1 border-none">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Regex/String Pattern</label>
                        <input
                            type="text"
                            placeholder="e.g. login, verify_*, Android"
                            value={newPattern}
                            onChange={(e) => setNewPattern(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="space-y-1.5 border-none">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Handler Ingress Action</label>
                        <select
                            value={newAction}
                            onChange={(e) => setNewAction(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="LOG_AND_TRACE">Capture Details & Trace</option>
                            <option value="LOG_ONLY">Log text info only</option>
                            <option value="DROP_SILENT">Silently Drop packet</option>
                            <option value="ALERT_CRITICAL">Send System webhook & Page</option>
                        </select>
                    </div>

                    <div className="flex items-end border-none">
                        <button
                            type="submit"
                            className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold py-2 rounded-lg text-xs hover:bg-slate-800 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                        >
                            <Icon name="plus" className="w-3.5 h-3.5" />
                            <span>Add Rule Target</span>
                        </button>
                    </div>
                </form>

                {/* Filter Rules List Matrix */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                                theme === 'dark' ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                                <th className="px-6 py-3.5">Trigger Class</th>
                                <th className="px-6 py-3.5">Regex Matching Pattern</th>
                                <th className="px-6 py-3.5">Execution Action</th>
                                <th className="px-6 py-3.5 text-center">Active Connection</th>
                                <th className="px-6 py-3.5 text-right">Interactive Trash</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${
                            theme === 'dark' ? 'bg-slate-900 divide-slate-800' : 'bg-white divide-slate-200'
                        }`}>
                            {rules.map((rule) => {
                                return (
                                    <tr key={rule.id} className={`${rule.enabled ? '' : 'opacity-50'} transition-opacity duration-200`}>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                                                rule.type === 'Function' 
                                                    ? theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                                                    : rule.type === 'IP'
                                                    ? theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
                                                    : theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-700'
                                            }`}>
                                                <span>{rule.type}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                                            <code>{rule.pattern}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold leading-none ${
                                                rule.action === 'LOG_AND_TRACE'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                                                    : rule.action === 'ALERT_CRITICAL'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                                                    : rule.action === 'DROP_SILENT'
                                                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            }`}>
                                                {rule.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleRule(rule.id)}
                                                className={`mx-auto w-11 h-6 rounded-full transition-colors relative flex items-center ${
                                                    rule.enabled ? 'bg-yellow-500 justify-end' : 'bg-slate-400 justify-start'
                                                }`}
                                            >
                                                <span className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-md block" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="text-red-500 hover:text-red-600 font-semibold text-xs active:scale-90 transition-all"
                                            >
                                                <Icon name="trash" className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PacketTracerConfigPage;

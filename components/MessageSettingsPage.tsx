
import React, { useState, useMemo } from 'react';
import { Theme, SuperUser, Shop, Country, MessageAssignment } from '../types';
import Icon from './Icon';
import { mockMessageAssignments } from '../data';
import MultiSelectDropdown from './MultiSelectDropdown';

interface MessageSettingsPageProps {
    theme: Theme;
    users: SuperUser[];
    shops: Shop[];
    countries: Country[];
    trackedKeywords: string[];
    setTrackedKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}

const MessageSettingsPage: React.FC<MessageSettingsPageProps> = ({ theme, users, shops, countries, trackedKeywords, setTrackedKeywords }) => {
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [assignments, setAssignments] = useState<MessageAssignment[]>(mockMessageAssignments);
    const [assignmentType, setAssignmentType] = useState<'shops' | 'adminLevels'>('shops');
    
    const [newKeyword, setNewKeyword] = useState('');

    // SMS Settings State
    const [internationalSmsRate, setInternationalSmsRate] = useState(2.5);
    const [smsRates, setSmsRates] = useState<Record<string, number>>(() => {
        const initialRates: Record<string, number> = {};
        countries.forEach(c => {
            initialRates[c.countryCode] = c.smsLocalRate || 1.0;
        });
        return initialRates;
    });

    const currentUserAssignment = assignments.find(a => a.superUserId === selectedUser) || { superUserId: selectedUser || 0, assignedShopIds: [], assignedAdminLevels: [] };

    const handleShopToggle = (shopId: number) => {
        if (!selectedUser) return;
        
        const newShopIds = currentUserAssignment.assignedShopIds.includes(shopId)
            ? currentUserAssignment.assignedShopIds.filter(id => id !== shopId)
            : [...currentUserAssignment.assignedShopIds, shopId];
            
        updateAssignment({ assignedShopIds: newShopIds });
    };

    const handleAdminLevelAdd = (countryCode: string, level: number, name: string) => {
        if (!selectedUser) return;
        const exists = currentUserAssignment.assignedAdminLevels.some(al => al.countryCode === countryCode && al.level === level && al.name === name);
        if (exists) return;

        updateAssignment({ 
            assignedAdminLevels: [...currentUserAssignment.assignedAdminLevels, { countryCode, level, name }]
        });
    };

    const handleAdminLevelRemove = (index: number) => {
        if (!selectedUser) return;
        const newLevels = [...currentUserAssignment.assignedAdminLevels];
        newLevels.splice(index, 1);
        updateAssignment({ assignedAdminLevels: newLevels });
    };

    const updateAssignment = (updates: Partial<MessageAssignment>) => {
        setAssignments(prev => {
            const existingIndex = prev.findIndex(a => a.superUserId === selectedUser);
            if (existingIndex >= 0) {
                const newAssignments = [...prev];
                newAssignments[existingIndex] = { ...newAssignments[existingIndex], ...updates };
                return newAssignments;
            } else {
                return [...prev, { superUserId: selectedUser!, assignedShopIds: [], assignedAdminLevels: [], ...updates }];
            }
        });
    };

    const handleAddKeyword = () => {
        const trimmed = newKeyword.trim();
        if (trimmed && !trackedKeywords.includes(trimmed)) {
            setTrackedKeywords(prev => [...prev, trimmed]);
            setNewKeyword('');
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        setTrackedKeywords(prev => prev.filter(k => k !== keyword));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddKeyword();
        }
    }

    const handleSmsRateChange = (countryCode: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setSmsRates(prev => ({ ...prev, [countryCode]: numValue }));
        }
    };

    // Helper for dropdowns
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedLevelName, setSelectedLevelName] = useState('');

    const availableLevels = useMemo(() => {
        const country = countries.find(c => c.countryCode === selectedCountry);
        return country ? country.adminLevels : [];
    }, [selectedCountry, countries]);

    const inputClass = `w-full rounded-md text-sm px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`;

    return (
        <div className="space-y-6">
            {/* SMS Configuration Section */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex flex-col`}>
                <div className="p-6 border-b border-inherit">
                    <h2 className={`text-lg font-bold flex items-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                        <Icon name="chat-bubble" className="h-5 w-5 mr-2 text-blue-500" />
                        SMS Credit Configuration
                    </h2>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Define the number of credits consumed per SMS based on destination.
                    </p>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Global Setting */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-opacity-50 bg-blue-50 dark:bg-slate-800/50 dark:border-slate-700 border-blue-100">
                        <div className="mb-2 sm:mb-0">
                            <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>International / Roaming Rate</h3>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Credits consumed when sending SMS outside origin country.</p>
                        </div>
                        <div className="w-32">
                            <input 
                                type="number" 
                                step="0.1"
                                min="0"
                                value={internationalSmsRate}
                                onChange={(e) => setInternationalSmsRate(parseFloat(e.target.value) || 0)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Country Rates Table */}
                    <div>
                        <h3 className={`font-semibold text-sm mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Local SMS Rates (Per Country)</h3>
                        <div className="overflow-x-auto rounded-lg border border-inherit">
                            <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                                <thead className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                                    <tr>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Country</th>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone Code</th>
                                        <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Credits per Local SMS</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                                    {countries.map(country => (
                                        <tr key={country.countryCode}>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                                <div className="flex items-center">
                                                    <img src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`} alt="" className="w-5 h-auto mr-2 rounded-sm" />
                                                    {country.name}
                                                </div>
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{country.phoneCode}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    min="0"
                                                    value={smsRates[country.countryCode] || ''}
                                                    onChange={(e) => handleSmsRateChange(country.countryCode, e.target.value)}
                                                    className={`w-24 text-right text-sm px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${selectedUser ? 'h-[600px]' : 'h-auto'}`}>
                {/* User List */}
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden flex flex-col h-full`}>
                    <div className="p-4 border-b border-inherit">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Select Super User</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => setSelectedUser(user.id)}
                                className={`w-full text-left p-4 border-b last:border-0 transition-colors flex items-center ${selectedUser === user.id 
                                    ? (theme === 'dark' ? 'bg-slate-700 border-yellow-500' : 'bg-slate-100 border-yellow-500') 
                                    : (theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50')}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${theme === 'dark' ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                                    {user.name.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{user.name}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Assignment Area */}
                <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border flex flex-col h-full`}>
                    {selectedUser ? (
                        <>
                            <div className="p-6 border-b border-inherit flex-shrink-0">
                                <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                                    Assign Visibility for {users.find(u => u.id === selectedUser)?.name}
                                </h2>
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => setAssignmentType('shops')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${assignmentType === 'shops' ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')}`}
                                    >
                                        Specific Shops
                                    </button>
                                    <button 
                                        onClick={() => setAssignmentType('adminLevels')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${assignmentType === 'adminLevels' ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')}`}
                                    >
                                        Administrative Levels
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 overflow-y-auto">
                                {assignmentType === 'shops' && (
                                    <div>
                                        <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Select individual shops this user can view messages from.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {shops.map(shop => (
                                                <div 
                                                    key={shop.id}
                                                    onClick={() => handleShopToggle(shop.id)}
                                                    className={`p-3 rounded-md border cursor-pointer flex items-center justify-between transition-all ${
                                                        currentUserAssignment.assignedShopIds.includes(shop.id)
                                                        ? (theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'bg-yellow-50 border-yellow-500 text-slate-800')
                                                        : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')
                                                    }`}
                                                >
                                                    <span className="text-sm font-medium">{shop.name}</span>
                                                    {currentUserAssignment.assignedShopIds.includes(shop.id) && <Icon name="check-circle" className="h-5 w-5" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {assignmentType === 'adminLevels' && (
                                    <div className="space-y-6">
                                        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <h4 className="font-semibold text-sm mb-3">Add Rule</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                                <select 
                                                    value={selectedCountry} 
                                                    onChange={e => setSelectedCountry(e.target.value)}
                                                    className={`rounded-md text-sm p-2 border ${theme === 'dark' ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                                                >
                                                    <option value="">Select Country</option>
                                                    {countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}
                                                </select>
                                                <select
                                                    value={selectedLevelName}
                                                    onChange={e => setSelectedLevelName(e.target.value)}
                                                    disabled={!selectedCountry}
                                                    className={`rounded-md text-sm p-2 border ${theme === 'dark' ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                                                >
                                                    <option value="">Select Area</option>
                                                    {availableLevels.map(l => <option key={l.id} value={l.name}>{l.name} (Lvl {l.level})</option>)}
                                                </select>
                                                <button 
                                                    onClick={() => {
                                                        const lvl = availableLevels.find(l => l.name === selectedLevelName);
                                                        if (selectedCountry && lvl) handleAdminLevelAdd(selectedCountry, lvl.level, lvl.name);
                                                    }}
                                                    disabled={!selectedCountry || !selectedLevelName}
                                                    className="bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    Add Rule
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-sm mb-3">Active Rules</h4>
                                            {currentUserAssignment.assignedAdminLevels.length === 0 ? (
                                                <p className="text-sm italic opacity-60">No administrative level rules assigned.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {currentUserAssignment.assignedAdminLevels.map((al, idx) => (
                                                        <div key={idx} className={`flex justify-between items-center p-3 rounded border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                            <span className="text-sm">
                                                                <span className="font-bold text-yellow-500">{al.countryCode}</span> - {al.name} (Level {al.level})
                                                            </span>
                                                            <button onClick={() => handleAdminLevelRemove(idx)} className="text-red-500 hover:text-red-700">
                                                                <Icon name="x-mark" className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-50">
                            <Icon name="user-circle" className="h-16 w-16 mb-4" />
                            <p className="text-lg">Select a user from the list to manage their message visibility.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Word Cloud Configuration */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border p-6`}>
                 <h2 className={`text-lg font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                    <Icon name="cloud" className="h-5 w-5 mr-2" />
                    Word Cloud Configuration
                </h2>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Define specific keywords to be tracked in the word cloud analysis. If no keywords are added, the system will default to showing all frequently used words.
                </p>
                
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter keyword..."
                        className={inputClass}
                    />
                    <button 
                        onClick={handleAddKeyword}
                        disabled={!newKeyword.trim()}
                        className="px-4 py-2 bg-yellow-500 text-slate-900 rounded-md text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {trackedKeywords.length > 0 ? (
                        trackedKeywords.map((word, index) => (
                            <div key={index} className={`flex items-center px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                                <span>{word}</span>
                                <button onClick={() => handleRemoveKeyword(word)} className="ml-2 text-red-500 hover:text-red-700">
                                    <Icon name="x-mark" className="h-3 w-3" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className={`text-sm italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No specific keywords tracked. Defaulting to all words.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageSettingsPage;

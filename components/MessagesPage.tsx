
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Theme, ChatMessage, User, ShopUser, SuperUser, ChatRoom, Shop, Country, AdminLevel, AdminLevelName } from '../types';
import Icon from './Icon';
import { formatDate } from '../utils';
import { mockMessages, mockChatRooms } from '../data';
import MessageDetailsModal from './MessageDetailsModal';
import MessageAnalyticsModal from './MessageAnalyticsModal';
import ChatRoomModal from './ChatRoomModal';

interface MessagesPageProps {
    theme: Theme;
    currentUser: User;
    users: (ShopUser | SuperUser)[];
    shops: Shop[];
    countries: Country[];
    trackedKeywords: string[];
}

const MessagesPage: React.FC<MessagesPageProps> = ({ theme, currentUser, users, shops, countries, trackedKeywords }) => {
    // Data States
    const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
    const [rooms, setRooms] = useState<ChatRoom[]>(mockChatRooms);
    const [activeRoomId, setActiveRoomId] = useState<string>('general');
    
    // UI States
    const [newMessage, setNewMessage] = useState('');
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastContent, setBroadcastContent] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    
    // Room Management States
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [roomToEdit, setRoomToEdit] = useState<ChatRoom | null>(null);
    const [openRoomMenuId, setOpenRoomMenuId] = useState<string | null>(null);

    // Search & Filter States
    const [roomSearchQuery, setRoomSearchQuery] = useState('');
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    
    const [filterCountry, setFilterCountry] = useState('');
    const [filterAdminLevels, setFilterAdminLevels] = useState<Record<number, string>>({});
    const [filterShopId, setFilterShopId] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const chatMenuRef = useRef<HTMLDivElement>(null);
    const roomMenuRef = useRef<HTMLDivElement>(null);

    const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

    // --- Filtering Logic ---

    const selectedCountryData = useMemo<Country | undefined>(() => 
        countries.find(c => c.countryCode === filterCountry), 
    [countries, filterCountry]);

    const filteredShops = useMemo(() => {
        return shops.filter(shop => {
            if (filterCountry && shop.countryCode !== filterCountry) return false;
            
            for (const levelStr in filterAdminLevels) {
                const level = parseInt(levelStr);
                const name = filterAdminLevels[level];
                if (name && !shop.adminLevels.some(al => al.level === level && al.name === name)) {
                    return false;
                }
            }
            return true;
        });
    }, [shops, filterCountry, filterAdminLevels]);

    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            // Search Text Match
            if (roomSearchQuery && !room.name.toLowerCase().includes(roomSearchQuery.toLowerCase())) {
                return false;
            }

            // Filter Logic
            if (filterShopId) {
                // If a specific shop is selected in filters
                const selectedShopName = shops.find(s => s.id === parseInt(filterShopId))?.name;
                
                if (room.type === 'Shop' && selectedShopName) {
                    // Bidirectional check to handle partial names or variations
                    const shopNameLower = selectedShopName.toLowerCase();
                    const roomNameLower = room.name.toLowerCase();
                    if (!roomNameLower.includes(shopNameLower) && !shopNameLower.includes(roomNameLower)) {
                        return false;
                    }
                }
                // If filtering by specific shop, usually hide Region rooms to reduce noise unless they match search
                if (room.type === 'Region') return false;

            } else if (filterCountry || Object.keys(filterAdminLevels).length > 0) {
                // If filtering by Location (Country/Admin Level)
                if (room.type === 'Shop') {
                    // Only show shop rooms that are in the filtered list of shops
                    const isRelatedToFilteredShops = filteredShops.some(s => {
                        const sName = s.name.toLowerCase();
                        const rName = room.name.toLowerCase();
                        return rName.includes(sName) || sName.includes(rName);
                    });
                    if (!isRelatedToFilteredShops) return false;
                }
                if (room.type === 'Region') {
                    // If specific admin levels are selected, try to match region room names
                    const levels = Object.values(filterAdminLevels);
                    if (levels.length > 0) {
                        const matchesLevel = levels.some((lvlName: string) => room.name.toLowerCase().includes(lvlName.toLowerCase()));
                        if (!matchesLevel) return false;
                    }
                    // If only country is selected, keep region rooms as they might be relevant
                }
            }
            return true;
        });
    }, [rooms, roomSearchQuery, filterShopId, filteredShops, filterCountry, filterAdminLevels, shops]);

    const visibleMessages = useMemo(() => {
        return messages.filter(m => {
            const matchesRoom = m.roomId === activeRoomId;
            const matchesSearch = chatSearchQuery === '' || 
                                  m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()) || 
                                  m.senderName.toLowerCase().includes(chatSearchQuery.toLowerCase());
            return matchesRoom && matchesSearch;
        }).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, activeRoomId, chatSearchQuery]);

    // --- Date Grouping Helper ---
    const getDayLabel = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return formatDate(dateString);
    };

    const groupedMessages: Record<string, ChatMessage[]> = useMemo(() => {
        const groups: Record<string, ChatMessage[]> = {};
        visibleMessages.forEach(msg => {
            const label = getDayLabel(msg.timestamp);
            if (!groups[label]) groups[label] = [];
            groups[label].push(msg);
        });
        return groups;
    }, [visibleMessages]);

    // --- Effects ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [visibleMessages, activeRoomId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
            if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
                setIsChatMenuOpen(false);
            }
             if (roomMenuRef.current && !roomMenuRef.current.contains(event.target as Node)) {
                setOpenRoomMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Handlers ---
    const handleCountryChange = (val: string) => {
        setFilterCountry(val);
        setFilterAdminLevels({});
        setFilterShopId('');
    };

    const handleAdminLevelChange = (level: number, val: string) => {
        const newLevels = { ...filterAdminLevels };
        Object.keys(newLevels).forEach(k => { if (parseInt(k) > level) delete newLevels[parseInt(k)]; });
        if (val) newLevels[level] = val;
        else delete newLevels[level];
        setFilterAdminLevels(newLevels);
        setFilterShopId('');
    };
    
    const handleResetFilters = () => {
        setFilterCountry('');
        setFilterAdminLevels({});
        setFilterShopId('');
        setRoomSearchQuery('');
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: 999, 
            senderName: currentUser.name,
            senderRole: currentUser.role,
            shopName: 'HQ',
            content: newMessage,
            timestamp: new Date().toISOString(),
            roomId: activeRoomId
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
    };

    const handleBroadcast = () => {
        if (!broadcastContent.trim()) return;
        alert(`Broadcast sent to ${users.length} users.`);
        const broadcastMsg: ChatMessage = {
            id: `msg-bc-${Date.now()}`,
            senderId: 999,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            shopName: 'HQ',
            content: `[BROADCAST]: ${broadcastContent}`,
            timestamp: new Date().toISOString(),
            roomId: 'general'
        };
        setMessages([...messages, broadcastMsg]);
        setIsBroadcastModalOpen(false);
        setBroadcastContent('');
    };

    const handleMenuAction = (action: 'details' | 'reply' | 'share' | 'audio', message: ChatMessage) => {
        setOpenMenuId(null);
        if (action === 'details') {
            setSelectedMessage(message);
            setIsDetailsModalOpen(true);
        } else if (action === 'reply') {
            setNewMessage(`@${message.senderName} `);
        } else if (action === 'share') {
            alert(`Sharing message ID: ${message.id}`);
        } else if (action === 'audio') {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(message.content);
                window.speechSynthesis.speak(utterance);
            } else {
                alert("Text-to-speech is not supported in this browser.");
            }
        }
    };

    // Room Management Handlers
    const handleCreateRoom = () => {
        setRoomToEdit(null);
        setIsRoomModalOpen(true);
    };

    const handleEditRoom = (room: ChatRoom) => {
        setRoomToEdit(room);
        setIsRoomModalOpen(true);
        setOpenRoomMenuId(null);
    };

    const handleDeleteRoom = (roomId: string) => {
        if (confirm('Are you sure you want to delete this room?')) {
            const updatedRooms = rooms.filter(r => r.id !== roomId);
            setRooms(updatedRooms);
            if (activeRoomId === roomId && updatedRooms.length > 0) {
                setActiveRoomId(updatedRooms[0].id);
            }
            setOpenRoomMenuId(null);
        }
    };

    const handleSaveRoom = (room: ChatRoom) => {
        if (roomToEdit) {
            setRooms(prev => prev.map(r => r.id === room.id ? room : r));
        } else {
            setRooms(prev => [...prev, room]);
        }
        setIsRoomModalOpen(false);
    };

    const getHighlightedText = (text: string, highlight: string) => {
        if (!highlight.trim()) {
            return text;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? <span key={i} className="bg-yellow-200 text-slate-900 px-0.5 rounded-sm">{part}</span> : part
        );
    };

    const isFilterActive = filterCountry || filterShopId || Object.keys(filterAdminLevels).length > 0;
    const selectClass = `w-full text-xs rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`;

    return (
        <>
        <MessageDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} message={selectedMessage} theme={theme} />
        <MessageAnalyticsModal isOpen={isAnalyticsModalOpen} onClose={() => setIsAnalyticsModalOpen(false)} theme={theme} messages={visibleMessages} roomName={activeRoom?.name || 'Chat'} trackedKeywords={trackedKeywords} />
        <ChatRoomModal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} onSave={handleSaveRoom} roomToEdit={roomToEdit} theme={theme} />
        
        <div className={`flex h-[calc(100vh-140px)] rounded-xl overflow-hidden border shadow-sm ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            
            {/* Sidebar */}
            <div className={`w-80 flex flex-col border-r flex-shrink-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                
                {/* Sidebar Header */}
                <div className={`p-4 border-b space-y-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center">
                        <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Inbox</h2>
                        <div className="flex space-x-2">
                             <button onClick={handleCreateRoom} className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30' : 'bg-green-100 text-green-600 hover:bg-green-200'}`} title="Create Room">
                                <Icon name="plus" className="h-5 w-5" />
                            </button>
                             <button onClick={() => setIsBroadcastModalOpen(true)} className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'}`} title="Broadcast">
                                <Icon name="broadcast" className="h-5 w-5" />
                            </button>
                            <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className={`p-2 rounded-md transition-colors ${isFilterPanelOpen || isFilterActive ? 'bg-yellow-500 text-slate-900' : (theme === 'dark' ? 'bg-slate-700 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:text-slate-800')}`} title="Filters">
                                <Icon name="filter" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input 
                            type="text" 
                            placeholder="Search rooms..." 
                            value={roomSearchQuery}
                            onChange={(e) => setRoomSearchQuery(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'}`}
                        />
                    </div>
                </div>

                {/* Filter Panel */}
                {isFilterPanelOpen && (
                    <div className={`p-4 border-b space-y-3 bg-slate-50 dark:bg-slate-800/50 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div>
                            <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Country</label>
                            <select value={filterCountry} onChange={(e) => handleCountryChange(e.target.value)} className={selectClass}>
                                <option value="">All Countries</option>
                                {countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}
                            </select>
                        </div>
                        
                        {selectedCountryData?.adminLevelNames?.map((levelDef: AdminLevelName) => {
                             if (!selectedCountryData) return null;
                             const currentCountry = selectedCountryData;
                             const parentLevel = levelDef.level - 1;
                             const parentSelected = parentLevel === 0 || !!filterAdminLevels[parentLevel];
                             const options: AdminLevel[] = currentCountry.adminLevels.filter((al: AdminLevel) => 
                                al.level === levelDef.level && 
                                (levelDef.level === 1 || (parentSelected && al.parentAdminLevelId && currentCountry.adminLevels.find((p: AdminLevel) => p.name === filterAdminLevels[parentLevel])?.id === al.parentAdminLevelId))
                             );

                             return (
                                <div key={levelDef.level}>
                                    <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{levelDef.name}</label>
                                    <select 
                                        value={filterAdminLevels[levelDef.level] || ''} 
                                        onChange={(e) => handleAdminLevelChange(levelDef.level, e.target.value)}
                                        className={selectClass}
                                        disabled={!parentSelected}
                                    >
                                        <option value="">All {levelDef.name}s</option>
                                        {options.map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                                    </select>
                                </div>
                             )
                        })}

                        <div>
                            <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Shop</label>
                            <select value={filterShopId} onChange={(e) => setFilterShopId(e.target.value)} className={selectClass}>
                                <option value="">All Shops</option>
                                {filteredShops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={handleResetFilters}
                                className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Room List */}
                <div className="flex-1 overflow-y-auto" ref={roomMenuRef}>
                    {filteredRooms.map(room => (
                        <div 
                            key={room.id} 
                            className={`relative p-4 border-b transition-colors group cursor-pointer ${activeRoomId === room.id ? (theme === 'dark' ? 'bg-slate-800 border-l-4 border-l-yellow-500' : 'bg-slate-100 border-l-4 border-l-yellow-500') : (theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50')}`}
                            onClick={() => setActiveRoomId(room.id)}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium text-sm truncate pr-6 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                    {getHighlightedText(room.name, roomSearchQuery)}
                                </h4>
                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>10:30 AM</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-xs truncate w-4/5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {room.type === 'Shop' ? 'Shop updates...' : 'Latest message...'}
                                </p>
                                {room.type === 'General' && <Icon name="globe" className="h-3 w-3 text-yellow-500" />}
                                {room.type === 'Shop' && <Icon name="shop-mgt" className="h-3 w-3 text-blue-500" />}
                                {room.type === 'Region' && <Icon name="countries" className="h-3 w-3 text-green-500" />}
                                {room.type === 'Private' && <Icon name="lock" className="h-3 w-3 text-red-500" />}
                            </div>

                            {/* Room Actions Menu */}
                            <div className="absolute top-2 right-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setOpenRoomMenuId(openRoomMenuId === room.id ? null : room.id); }}
                                    className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                                >
                                    <Icon name="ellipsis-vertical" className="h-4 w-4" />
                                </button>
                                {openRoomMenuId === room.id && (
                                    <div className={`absolute right-0 mt-1 w-32 rounded-md shadow-xl py-1 border z-30 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); handleEditRoom(room); }} className={`w-full text-left px-3 py-2 text-xs flex items-center ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                                            <Icon name="edit" className="h-3 w-3 mr-2" /> Edit
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }} className={`w-full text-left px-3 py-2 text-xs flex items-center text-red-500 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                                            <Icon name="delete" className="h-3 w-3 mr-2" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredRooms.length === 0 && (
                        <div className="p-8 text-center">
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No rooms match your filters.</p>
                            {(isFilterActive || roomSearchQuery) && (
                                <button 
                                    onClick={handleResetFilters}
                                    className="mt-2 text-xs text-yellow-500 hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                
                {/* Chat Header */}
                <div className={`h-16 px-6 flex items-center justify-between border-b flex-shrink-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            {activeRoom?.type === 'General' ? <Icon name="globe" className="h-5 w-5" /> : <span className="font-bold text-sm">{activeRoom?.name.substring(0,2).toUpperCase()}</span>}
                        </div>
                        <div>
                            <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{activeRoom?.name}</h3>
                            <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>Active now</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button onClick={() => setIsAnalyticsModalOpen(true)} className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <Icon name="analytics" className="h-4 w-4" />
                            <span>Analytics</span>
                        </button>

                        <div className="relative hidden sm:block">
                            <Icon name="search" className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input 
                                type="text" 
                                placeholder="Search in chat..." 
                                value={chatSearchQuery}
                                onChange={(e) => setChatSearchQuery(e.target.value)}
                                className={`w-48 pl-9 pr-3 py-2 text-sm rounded-full border focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                            />
                        </div>
                        <div className="relative" ref={chatMenuRef}>
                            <button onClick={() => setIsChatMenuOpen(!isChatMenuOpen)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <Icon name="ellipsis-vertical" className="h-5 w-5" />
                            </button>
                            {isChatMenuOpen && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 border z-20 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <button onClick={() => { setIsAnalyticsModalOpen(true); setIsChatMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm sm:hidden ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                                        View Analytics
                                    </button>
                                    <button className={`w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                                        Mute Notifications
                                    </button>
                                    <button className={`w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                                        Clear Chat History
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                    {Object.keys(groupedMessages).length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-50">
                             <Icon name="chat-bubble" className="h-12 w-12 mb-2 text-gray-400" />
                             <p>No messages here yet.</p>
                        </div>
                    )}
                    
                    {(Object.entries(groupedMessages) as [string, ChatMessage[]][]).map(([dateLabel, msgs]) => (
                        <div key={dateLabel}>
                            <div className="flex justify-center mb-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                                    {dateLabel}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {msgs.map(msg => {
                                    const isMe = msg.senderName === currentUser.name;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                            <div className={`max-w-[85%] sm:max-w-[70%] relative`}>
                                                <div className={`rounded-2xl px-4 py-3 shadow-sm ${isMe 
                                                    ? (theme === 'dark' ? 'bg-yellow-600 text-white rounded-tr-none' : 'bg-yellow-500 text-slate-900 rounded-tr-none') 
                                                    : (theme === 'dark' ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none')}`}
                                                >
                                                    {!isMe && (
                                                        <div className="flex items-baseline justify-between mb-1 gap-2">
                                                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                                                {msg.senderName}
                                                            </span>
                                                            <span className={`text-[10px] px-1.5 rounded ${theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                                {msg.senderRole}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`flex items-center justify-end mt-1 space-x-1 ${isMe ? 'opacity-70' : 'opacity-50'}`}>
                                                        <span className="text-[10px]">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {!isMe && msg.shopName && (
                                                            <span className="text-[10px]">• {msg.shopName}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Message Actions Menu */}
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                                                    className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                                                >
                                                    <Icon name="ellipsis-vertical" className="h-4 w-4" />
                                                </button>
                                                
                                                {openMenuId === msg.id && (
                                                    <div ref={menuRef} className={`absolute top-6 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} w-32 rounded-md shadow-xl py-1 border z-10 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                        <button onClick={() => handleMenuAction('reply', msg)} className={`w-full text-left px-3 py-2 text-xs flex items-center ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                                                            <Icon name="reply" className="h-3 w-3 mr-2" /> Reply
                                                        </button>
                                                        <button onClick={() => handleMenuAction('audio', msg)} className={`w-full text-left px-3 py-2 text-xs flex items-center ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                                                            <Icon name="audio" className="h-3 w-3 mr-2" /> Listen
                                                        </button>
                                                        <button onClick={() => handleMenuAction('details', msg)} className={`w-full text-left px-3 py-2 text-xs flex items-center ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                                                            <Icon name="info" className="h-3 w-3 mr-2" /> Details
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                    <div className={`flex items-end gap-2 rounded-lg border p-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'}`}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className={`flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] text-sm py-2 ${theme === 'dark' ? 'text-slate-200 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className={`p-2 rounded-full mb-0.5 transition-all ${newMessage.trim() ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-600' : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'}`}
                        >
                            <Icon name="forward" className="h-5 w-5" />
                        </button>
                    </div>
                    <div className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Press Enter to send, Shift+Enter for new line
                    </div>
                </div>
            </div>
        </div>

        {/* Broadcast Modal */}
        {isBroadcastModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className={`w-full max-w-lg rounded-lg shadow-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex flex-col`}>
                    <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <h2 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            <Icon name="broadcast" className="h-6 w-6 mr-2 text-yellow-500" />
                            New Broadcast
                        </h2>
                        <button onClick={() => setIsBroadcastModalOpen(false)} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                            <Icon name="x-mark" className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className={`p-3 rounded border-l-4 border-yellow-500 ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-yellow-50 text-yellow-800'}`}>
                            <p className="text-sm">This message will be sent to <strong>all active users</strong> in the General Wall.</p>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Message Content</label>
                            <textarea 
                                value={broadcastContent}
                                onChange={(e) => setBroadcastContent(e.target.value)}
                                rows={5}
                                className={`w-full p-3 rounded-md border focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                                placeholder="Type your announcement here..."
                            />
                        </div>
                    </div>
                    <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                        <button onClick={() => setIsBroadcastModalOpen(false)} className={`px-4 py-2 mr-2 text-sm font-medium rounded-md border ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                        <button onClick={handleBroadcast} className="px-6 py-2 text-sm font-bold rounded-md bg-yellow-500 text-slate-900 hover:bg-yellow-600 shadow-md">Send Broadcast</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default MessagesPage;
    
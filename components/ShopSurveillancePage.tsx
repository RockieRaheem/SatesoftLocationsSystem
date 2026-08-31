
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Theme, CameraDevice } from '../types';
import Icon from './Icon';

// Default video for simulation
const DEFAULT_VIDEO_SRC = 'https://www.w3schools.com/html/mov_bbb.mp4';

interface ShopSurveillancePageProps {
  theme: Theme;
  cameraDevices: CameraDevice[];
}

// Helper component to handle video src
const VideoFeed: React.FC<{ src: string; className?: string; isMuted?: boolean; autoPlay?: boolean }> = ({ src, className, isMuted = true, autoPlay = true }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const actualSrc = src.startsWith('http') ? src : DEFAULT_VIDEO_SRC;

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = actualSrc;
        }
    }, [actualSrc]);

    return <video ref={videoRef} autoPlay={autoPlay} loop muted={isMuted} playsInline className={className} />;
};

const ShopSurveillancePage: React.FC<ShopSurveillancePageProps> = ({ theme, cameraDevices }) => {
    const [maximizedCameraId, setMaximizedCameraId] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeShopFilter, setActiveShopFilter] = useState('All');
    
    // Use Approved cameras from global state, adding simulation properties
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    
    // Sync with props but maintain local simulation state (isLive toggle)
    useEffect(() => {
        const approvedDevices = cameraDevices.filter(d => d.status === 'Approved').map(d => ({
            ...d,
            isLive: true // Default to live for approved devices in simulation
        }));
        setCameras(approvedDevices);
    }, [cameraDevices]);
    
    // Recording state: Map of CameraID -> Start Timestamp
    const [activeRecordings, setActiveRecordings] = useState<Record<number, number>>({});
    const [recordingDurations, setRecordingDurations] = useState<Record<number, string>>({});

    const uniqueShops = useMemo(() => ['All', ...Array.from(new Set(cameras.map(c => c.shopName))).sort()], [cameras]);

    const filteredCameras = useMemo(() => {
        let filtered = cameras;
        if (activeShopFilter !== 'All') {
            filtered = filtered.filter(c => c.shopName === activeShopFilter);
        }
        if (activeCategory !== 'All') {
            filtered = filtered.filter(c => c.category === activeCategory);
        }
        return filtered;
    }, [activeCategory, activeShopFilter, cameras]);

    // Dynamically update categories based on current shop selection
    const categories = useMemo(() => {
        const relevantCameras = activeShopFilter === 'All' 
            ? cameras 
            : cameras.filter(c => c.shopName === activeShopFilter);
            
        return ['All', ...Array.from(new Set(relevantCameras.map(c => c.category))).sort()];
    }, [activeShopFilter, cameras]);

    // Reset category if it doesn't exist in the new shop context
    useEffect(() => {
        if (!categories.includes(activeCategory)) {
            setActiveCategory('All');
        }
    }, [activeShopFilter, categories, activeCategory]);

    // Timer effect for recordings
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newDurations: Record<number, string> = {};
            
            Object.entries(activeRecordings).forEach(([id, startTime]) => {
                const diff = Math.floor((now - (startTime as number)) / 1000);
                const mins = Math.floor(diff / 60).toString().padStart(2, '0');
                const secs = (diff % 60).toString().padStart(2, '0');
                newDurations[parseInt(id)] = `${mins}:${secs}`;
            });
            
            setRecordingDurations(newDurations);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeRecordings]);

    const toggleCameraFeed = (cameraId: number) => {
        setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, isLive: !c.isLive } : c));
    };

    const toggleRecording = (cameraId: number) => {
        const isRecording = !!activeRecordings[cameraId];
        const cam = cameras.find(c => c.id === cameraId);

        // Handle Mock Recording for Simulated Cameras
        setActiveRecordings(prev => {
            const newRecordings = { ...prev };
            
            if (isRecording) {
                // Stop recording logic
                delete newRecordings[cameraId];
                // Mock download/save action
                const duration = recordingDurations[cameraId] || "00:00";
                const logContent = `Recording Log\nCamera: ${cam?.name}\nDuration: ${duration}\nDate: ${new Date().toLocaleString()}\nStatus: Saved successfully.`;
                const blob = new Blob([logContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `REC_${cam?.name.replace(/ /g, '_')}_${new Date().getTime()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                alert(`Simulated recording saved for ${cam?.name}`);
            } else {
                // Start recording
                newRecordings[cameraId] = Date.now();
            }
            return newRecordings;
        });
    };

    // Grid View
    const GridView = () => (
        <div className="space-y-6">
            {/* Enhanced Filter Bar */}
            <div className={`p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    <div className="flex flex-col sm:flex-row gap-4 lg:items-center flex-grow">
                        {/* Shop Filter */}
                        <div className="w-full sm:w-64">
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Filter by Shop
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Icon name="shop-mgt" className="h-4 w-4" />
                                </div>
                                <select 
                                    value={activeShopFilter} 
                                    onChange={(e) => setActiveShopFilter(e.target.value)}
                                    className={`block w-full pl-10 pr-10 py-2 text-sm rounded-md border appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-shadow ${
                                        theme === 'dark' 
                                        ? 'bg-slate-900 border-slate-600 text-slate-200 focus:border-slate-500' 
                                        : 'bg-slate-50 border-slate-300 text-slate-700 focus:border-yellow-500'
                                    }`}
                                >
                                    {uniqueShops.map(shop => (
                                        <option key={shop} value={shop}>{shop === 'All' ? 'All Shops' : shop}</option>
                                    ))}
                                </select>
                                <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Icon name="chevron-down" className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={`hidden sm:block w-px h-10 self-end mb-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                        {/* Category Filter */}
                         <div className="flex-grow overflow-x-auto no-scrollbar">
                             <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Category
                            </label>
                            <div className="flex space-x-2 pb-1">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                                            activeCategory === category
                                                ? 'bg-yellow-500 text-slate-900 shadow-md transform scale-105'
                                                : theme === 'dark'
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results & Reset */}
                     <div className={`flex items-center justify-between sm:justify-end gap-4 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="text-right">
                             <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                {filteredCameras.length}
                            </p>
                            <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Cameras
                            </p>
                        </div>
                        {(activeCategory !== 'All' || activeShopFilter !== 'All') && (
                            <button 
                                onClick={() => { setActiveShopFilter('All'); setActiveCategory('All'); }}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                            >
                                <Icon name="x-mark" className="h-3 w-3" />
                                <span>Clear</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCameras.map(camera => {
                    const isRecording = !!activeRecordings[camera.id];
                    return (
                        <div key={camera.id} className={`relative aspect-video rounded-lg overflow-hidden shadow-lg border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                            <VideoFeed 
                                src={camera.connectionString} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
                            
                            {/* Controls Overlay */}
                            <div className="absolute top-2 right-2 flex space-x-2">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); toggleCameraFeed(camera.id); }} 
                                    className={`p-2 rounded-full transition-colors ${camera.isLive ? 'bg-green-600 text-white' : 'bg-black/40 text-white hover:bg-black/70'}`}
                                    title={camera.isLive ? "Disconnect Feed" : "Connect Live Feed"}
                                >
                                    <Icon name={camera.isLive ? 'stop' : 'camera'} className="h-4 w-4" />
                                </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); toggleRecording(camera.id); }} 
                                    className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-white text-red-600' : 'bg-black/40 text-white hover:bg-black/70'}`}
                                    title={isRecording ? "Stop Recording" : "Record"}
                                >
                                    <Icon name={isRecording ? 'stop' : 'record'} className="h-4 w-4" />
                                </button>
                                <button onClick={() => setMaximizedCameraId(camera.id)} className={`p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors`}>
                                    <Icon name="arrows-pointing-out" className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="absolute top-2 left-3 flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-black uppercase tracking-wide">{camera.category}</span>
                                {camera.isLive && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500 text-white uppercase tracking-wide animate-pulse">LIVE</span>}
                                {isRecording && (
                                    <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wide animate-pulse">
                                        <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                                        REC {recordingDurations[camera.id] || "00:00"}
                                    </span>
                                )}
                            </div>
                            
                            <div className="absolute bottom-2 left-3">
                                <p className="text-white font-semibold text-sm drop-shadow-md">{camera.name}</p>
                                {camera.shopName && <p className="text-gray-300 text-xs drop-shadow-md">{camera.shopName}</p>}
                            </div>
                        </div>
                    );
                })}
                {filteredCameras.length === 0 && (
                     <div className={`col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                        <Icon name="camera" className="h-12 w-12 mb-2 opacity-50" />
                        <p>No active cameras found matching the filters.</p>
                     </div>
                )}
            </div>
        </div>
    );

    return (
        <div>
            {maximizedCameraId === null ? 
                <GridView /> : 
                <MaximizedView 
                    theme={theme} 
                    maximizedCameraId={maximizedCameraId} 
                    setMaximizedCameraId={setMaximizedCameraId} 
                    isRecording={!!activeRecordings[maximizedCameraId]}
                    recordingDuration={recordingDurations[maximizedCameraId]}
                    onToggleRecording={() => toggleRecording(maximizedCameraId)}
                    onToggleLive={() => toggleCameraFeed(maximizedCameraId)}
                    allCameras={cameras}
                    shopFilter={activeShopFilter}
                />
            }
        </div>
    );
};


// Maximized View Component
interface MaximizedViewProps {
    theme: Theme;
    maximizedCameraId: number;
    setMaximizedCameraId: (id: number | null) => void;
    isRecording: boolean;
    recordingDuration?: string;
    onToggleRecording: () => void;
    onToggleLive: () => void;
    allCameras: CameraDevice[];
    shopFilter: string;
}
const MaximizedView: React.FC<MaximizedViewProps> = ({ theme, maximizedCameraId, setMaximizedCameraId, isRecording, recordingDuration, onToggleRecording, onToggleLive, allCameras, shopFilter }) => {
    const maximizedCamera = allCameras.find(c => c.id === maximizedCameraId);
    
    // Player state
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [bufferedProgress, setBufferedProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);
    
    // Time Input and Seek Tooltip State
    const [isTimeInputActive, setIsTimeInputActive] = useState(false);
    const [timeInputValue, setTimeInputValue] = useState("00:00");
    const [seekTooltip, setSeekTooltip] = useState({ visible: false, position: 0, time: "00:00" });
    const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState(false);

    const playerContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const seekBarRef = useRef<HTMLDivElement>(null);
    let controlsTimeout = useRef<number | null>(null);

    const videoSrc = maximizedCamera?.connectionString.startsWith('http') ? maximizedCamera.connectionString : DEFAULT_VIDEO_SRC;

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = videoSrc;
        }
    }, [videoSrc]);

    // Reset player state when camera changes
    useEffect(() => {
        setIsPlaying(true);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setWasPlayingBeforeSeek(false);
    }, [maximizedCameraId]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);
    
    const handleTimeUpdate = () => {
        if (videoRef.current?.duration) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
            setCurrentTime(videoRef.current.currentTime);
        }
    };
    
    const handleProgress = () => {
        if (videoRef.current && videoRef.current.duration > 0) {
            if (videoRef.current.buffered.length > 0) {
                const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
                setBufferedProgress((bufferedEnd / videoRef.current.duration) * 100);
            }
        }
    };

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const togglePlayPause = () => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause();
    
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !seekBarRef.current || maximizedCamera?.isLive) return; // Disable seeking for live streams
        const rect = seekBarRef.current.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = videoRef.current.duration * percentage;
    };
    
    const skip = (seconds: number) => {
        if (videoRef.current && !maximizedCamera?.isLive) {
            videoRef.current.currentTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), videoRef.current.duration);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const newVolume = Number(e.target.value);
        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMuted = !videoRef.current.muted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
        if (!newMuted && volume === 0) {
            setVolume(0.5);
            videoRef.current.volume = 0.5;
        }
    };

    const toggleFullScreen = () => {
        if (!playerContainerRef.current) return;
        if (!isFullScreen) {
            playerContainerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
    
    const handleSetPlaybackRate = (rate: number) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
        setIsSpeedMenuOpen(false);
    };

    const handleTimeInputFocus = () => {
        if (!videoRef.current) return;
        setWasPlayingBeforeSeek(!videoRef.current.paused);
        videoRef.current.pause();
        setIsTimeInputActive(true);
        setTimeInputValue(formatTime(currentTime));
    };

    const handleTimeInputBlur = () => {
        setIsTimeInputActive(false);
        if (wasPlayingBeforeSeek && videoRef.current) {
            videoRef.current.play();
        }
    };

    const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsTimeInputActive(false);
            if (wasPlayingBeforeSeek && videoRef.current) videoRef.current.play();
            return;
        }
        if (e.key !== 'Enter') return;
        const parts = timeInputValue.split(':');
        if (parts.length === 2) {
            const timeInSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            if (videoRef.current && !isNaN(timeInSeconds) && timeInSeconds <= videoRef.current.duration) {
                videoRef.current.currentTime = timeInSeconds;
            }
        }
        setIsTimeInputActive(false);
        if (wasPlayingBeforeSeek && videoRef.current) videoRef.current.play();
    };

    const handleSeekBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!seekBarRef.current || !videoRef.current?.duration || maximizedCamera?.isLive) return;
        const rect = seekBarRef.current.getBoundingClientRect();
        const hoverPosition = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, hoverPosition / rect.width));
        setSeekTooltip({
            visible: true,
            position: percentage * 100,
            time: formatTime(videoRef.current.duration * percentage),
        });
    };

    const handleMouseMove = () => {
        setIsControlsVisible(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = window.setTimeout(() => setIsControlsVisible(false), 3000);
    };

    // Group filtered cameras by category for the sidebar
    const groupedCameras = useMemo(() => {
        const relevantCameras = shopFilter === 'All' 
            ? allCameras 
            : allCameras.filter(c => c.shopName === shopFilter);
            
        const groups: Record<string, CameraDevice[]> = {};
        relevantCameras.forEach(cam => {
            if (!groups[cam.category]) groups[cam.category] = [];
            groups[cam.category].push(cam);
        });
        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {} as Record<string, CameraDevice[]>);
    }, [allCameras, shopFilter]);


    return (
         <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
            <div className="w-full lg:w-64 flex-shrink-0">
                 <div className={`p-4 rounded-lg overflow-y-auto h-full custom-scrollbar ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                    <h3 className={`font-semibold mb-4 sticky top-0 z-10 ${theme === 'dark' ? 'text-slate-100 bg-slate-900' : 'text-slate-800 bg-white'} pb-2 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>Cameras</h3>
                    
                    {/* Vertical for lg screens */}
                    <div className="hidden lg:block space-y-6"> 
                        {Object.entries(groupedCameras).map(([category, groupCameras]) => (
                            <div key={category}>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{category}</h4>
                                <div className="space-y-3">
                                    {(groupCameras as CameraDevice[]).map(camera => (
                                        <div key={camera.id} onClick={() => setMaximizedCameraId(camera.id)} className={`relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all ${maximizedCameraId === camera.id ? 'border-yellow-500 shadow-lg' : 'border-transparent hover:border-slate-500'}`}>
                                            <VideoFeed src={camera.connectionString} isMuted={true} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors"></div>
                                            <p className="absolute bottom-1 left-2 text-white text-xs font-medium drop-shadow-sm">{camera.name}</p>
                                            {maximizedCameraId === camera.id && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>}
                                            {camera.isLive && <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded uppercase tracking-wider">Live</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Horizontal for smaller screens */}
                    <div className="lg:hidden"> 
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                             {allCameras.map(camera => (
                                <div key={camera.id} onClick={() => setMaximizedCameraId(camera.id)} className={`flex-shrink-0 w-40 relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all ${maximizedCameraId === camera.id ? 'border-yellow-500 shadow-lg' : 'border-transparent hover:border-slate-500'}`}>
                                    <VideoFeed src={camera.connectionString} isMuted={true} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors"></div>
                                    <p className="absolute bottom-1 left-2 text-white text-xs font-medium drop-shadow-sm truncate pr-2">{camera.name}</p>
                                    {maximizedCameraId === camera.id && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>}
                                    {camera.isLive && <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded uppercase tracking-wider">Live</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div ref={playerContainerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setIsControlsVisible(false)} className="flex-1 relative rounded-lg overflow-hidden bg-black shadow-2xl">
                {maximizedCamera && <>
                    <video 
                        ref={videoRef} 
                        key={maximizedCamera.id} 
                        autoPlay 
                        loop 
                        playsInline 
                        className="w-full h-full object-contain cursor-pointer" 
                        onClick={togglePlayPause} 
                        onTimeUpdate={handleTimeUpdate} 
                        onProgress={handleProgress} 
                        onLoadedMetadata={e => setDuration(e.currentTarget.duration)} 
                        onPlay={() => setIsPlaying(true)} 
                        onPause={() => setIsPlaying(false)} 
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-300 pointer-events-none ${!isPlaying && isControlsVisible ? 'opacity-100' : 'opacity-0'}`}><Icon name="play" className="h-16 w-16" /></div>

                    <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-white font-semibold text-lg drop-shadow-md">{maximizedCamera.name}</p>
                                <div className="flex items-center mt-1 space-x-2">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wide backdrop-blur-sm">{maximizedCamera.category}</span>
                                    
                                    <button 
                                        onClick={onToggleLive}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${maximizedCamera.isLive ? 'bg-green-500 text-white hover:bg-green-600 animate-pulse' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                                    >
                                        {maximizedCamera.isLive ? 'LIVE' : 'PLAYBACK'}
                                    </button>

                                    {isRecording && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/90 text-white uppercase tracking-wide animate-pulse">
                                            <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                                            REC {recordingDuration || "00:00"}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setMaximizedCameraId(null)} className="p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"><Icon name="arrows-pointing-in" className="h-5 w-5" /></button>
                        </div>
                    </div>

                    <div className={`absolute bottom-0 left-0 right-0 px-4 pb-2 pt-8 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <div ref={seekBarRef} onMouseMove={handleSeekBarHover} onMouseLeave={() => setSeekTooltip({ ...seekTooltip, visible: false })} onClick={handleSeek} className={`relative h-4 group ${maximizedCamera.isLive ? 'cursor-default' : 'cursor-pointer'}`}>
                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-white/30 rounded-full group-hover:h-1.5 transition-all">
                                <div className="absolute top-0 left-0 h-full bg-white/50 rounded-full" style={{ width: `${bufferedProgress}%` }}></div>
                                <div className="absolute top-0 left-0 h-full bg-yellow-500 rounded-full" style={{ width: `${progress}%` }}></div>
                                {!maximizedCamera.isLive && <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}></div>}
                            </div>
                            {!maximizedCamera.isLive && <div className="seek-tooltip" style={{ left: `${seekTooltip.position}%`, opacity: seekTooltip.visible ? 1 : 0 }}>{seekTooltip.time}</div>}
                        </div>
                        
                        <div className="flex items-center justify-between mt-1 text-white">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => skip(-10)} className="p-1 hover:text-yellow-400 transition-colors" title="Rewind 10s" disabled={!!maximizedCamera.isLive}><Icon name="backward" className="h-5 w-5" /></button>
                                    <button onClick={togglePlayPause} className="p-1 hover:text-yellow-400 transition-colors"><Icon name={isPlaying ? 'pause' : 'play'} className="h-7 w-7" /></button>
                                    <button onClick={() => skip(10)} className="p-1 hover:text-yellow-400 transition-colors" title="Skip 10s" disabled={!!maximizedCamera.isLive}><Icon name="forward" className="h-5 w-5" /></button>
                                </div>
                                
                                <div onMouseEnter={() => setIsVolumeHovered(true)} onMouseLeave={() => setIsVolumeHovered(false)} className="relative flex items-center">
                                    <button onClick={toggleMute} className="p-1 hover:text-yellow-400 transition-colors"><Icon name={isMuted || volume === 0 ? 'volume-off' : 'volume-up'} className="h-5 w-5" /></button>
                                    {isVolumeHovered && <div className="volume-popup"><input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="vertical-slider" /></div>}
                                </div>
                                
                                <div className="text-xs font-mono ml-2">
                                    {maximizedCamera.isLive ? (
                                        <span className="text-red-400 font-bold">LIVE FEED</span>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            {isTimeInputActive ? (
                                                <input 
                                                    type="text" 
                                                    value={timeInputValue} 
                                                    onChange={e => setTimeInputValue(e.target.value)} 
                                                    onKeyDown={handleTimeInputKeyDown} 
                                                    onBlur={handleTimeInputBlur} 
                                                    autoFocus 
                                                    className="bg-white/10 w-14 text-center outline-none ring-1 ring-yellow-500 rounded px-1 py-0.5 text-white" 
                                                />
                                            ) : (
                                                <span onClick={handleTimeInputFocus} className="cursor-pointer hover:text-yellow-400 transition-colors" title="Click to jump to time">{formatTime(currentTime)}</span>
                                            )} 
                                            <span className="opacity-60">/ {formatTime(duration)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4">
                                <button 
                                    onClick={onToggleRecording}
                                    className={`p-1.5 rounded-full transition-colors ${isRecording ? 'bg-white text-red-600' : 'hover:bg-white/10 text-white'}`}
                                    title={isRecording ? "Stop Recording" : "Start Recording"}
                                >
                                    <Icon name={isRecording ? 'stop' : 'record'} className="h-5 w-5" />
                                </button>
                                {!maximizedCamera.isLive && (
                                    <div className="relative">
                                        <button onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)} className="flex items-center gap-1 text-xs font-bold p-1.5 hover:bg-white/10 rounded transition-colors" title="Playback Speed">
                                            <span>{playbackRate}x</span>
                                        </button>
                                        {isSpeedMenuOpen && (
                                            <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg py-1 text-xs border border-white/10 shadow-xl overflow-hidden w-24">
                                                {[0.5, 1, 1.5, 2].map(rate => (
                                                    <button 
                                                        key={rate} 
                                                        onClick={() => handleSetPlaybackRate(rate)} 
                                                        className={`block w-full text-left px-3 py-2 hover:bg-white/10 transition-colors ${playbackRate === rate ? 'text-yellow-400 font-bold bg-white/5' : 'text-slate-300'}`}
                                                    >
                                                        {rate}x
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button onClick={toggleFullScreen} className="p-1 hover:text-yellow-400 transition-colors"><Icon name={isFullScreen ? 'compress' : 'expand'} className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </div>
                </>}
            </div>
        </div>
    );
};


export default ShopSurveillancePage;


import React, { useState } from 'react';
import { Theme, User, TemperamentResult, TemperamentType } from '../types';
import Icon from './Icon';
import { formatDate } from '../utils';
import SelfieVerificationModal from './SelfieVerificationModal';
import TemperamentTestModal from './TemperamentTestModal';
import { TEMPERAMENT_DATA } from '../data';

interface ProfilePageProps {
  theme: Theme;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

interface ImageUploaderProps {
    theme: Theme;
    label: string;
    imageUrl: string | null;
    isEditing: boolean;
    onFileSelect: (file: File) => void;
    inputId: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ theme, label, imageUrl, isEditing, onFileSelect, inputId }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEditing) setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (isEditing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    const baseDropzoneClasses = `relative flex justify-center items-center h-32 border-2 rounded-lg transition-all duration-200 overflow-hidden`;
    const darkDropzoneClasses = isDraggingOver ? 'border-yellow-500 bg-slate-800' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50';
    const lightDropzoneClasses = isDraggingOver ? 'border-yellow-500 bg-slate-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50';
    const dropzoneClasses = theme === 'dark' ? `${baseDropzoneClasses} border-dashed ${darkDropzoneClasses}` : `${baseDropzoneClasses} border-dashed ${lightDropzoneClasses}`;

    return (
        <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
            {isEditing ? (
                imageUrl ? (
                    <div className={`relative group h-32 w-full rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <label htmlFor={inputId} className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <div className="flex flex-col items-center"><Icon name="camera" className="h-6 w-6 mb-1"/><span className="text-xs font-medium">Change</span></div>
                        </label>
                        <input id={inputId} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                ) : (
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={dropzoneClasses}>
                        <div className="space-y-1 text-center p-4">
                            <Icon name="upload" className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="text-xs text-gray-500 mt-2">
                                <label htmlFor={inputId} className="relative cursor-pointer font-medium text-yellow-500 hover:text-yellow-600"><span>Upload</span><input id={inputId} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} /></label>
                                <span className="pl-1">or drag & drop</span>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                imageUrl ? (
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block h-32 w-full relative group rounded-lg overflow-hidden border border-transparent hover:border-yellow-500 transition-colors">
                         <img src={imageUrl} alt="ID Document" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                             <Icon name="expand" className="text-white opacity-0 group-hover:opacity-100 h-6 w-6 drop-shadow-md transform scale-75 group-hover:scale-100 transition-all" />
                         </div>
                    </a>
                ) : (
                    <div className={`flex items-center justify-center h-32 rounded-lg border border-dashed ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`text-sm italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Not uploaded</p>
                    </div>
                )
            )}
        </div>
    );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ theme, user, setUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<User>(user);
    const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
    const [isTemperamentModalOpen, setIsTemperamentModalOpen] = useState(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setUser(userData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setUserData(user);
        setIsEditing(false);
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'selfie' | 'avatar') => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setUserData(prev => ({ ...prev, [field]: event.target.result }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleIdDocumentChange = (file: File | null, side: 'front' | 'back') => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setUserData(prev => ({
                        ...prev,
                        idDocument: { ...(prev.idDocument || { front: null, back: null }), [side]: event.target.result }
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTemperamentSave = (result: TemperamentResult) => {
        const updatedHistory = [result, ...(user.temperamentHistory || [])];
        setUser(prev => ({ ...prev, temperamentHistory: updatedHistory }));
        setUserData(prev => ({ ...prev, temperamentHistory: updatedHistory }));
    };
    
    const avatarInitials = userData.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    const isVerified = !!(userData.idDocument?.front && userData.idDocument?.back && userData.selfie);
    const latestTemperament = userData.temperamentHistory && userData.temperamentHistory.length > 0 ? userData.temperamentHistory[0] : null;
    const previousTemperament = userData.temperamentHistory && userData.temperamentHistory.length > 1 ? userData.temperamentHistory[1] : null;

    const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 focus:ring-yellow-500 focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900 focus:ring-yellow-500 focus:border-yellow-500';
    const cardClasses = theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200';
    const labelClasses = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`;
    const valueClasses = `font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`;

    const calculateTotalWeaknesses = (result: TemperamentResult) => {
        if (!result.weaknessBreakdown) return 0;
        return Object.values(result.weaknessBreakdown).reduce((acc, val) => acc + val, 0);
    }

    const getImprovementText = () => {
        if (!userData.temperamentHistory || userData.temperamentHistory.length < 2) return null;
        const current = userData.temperamentHistory[0];
        const oldest = userData.temperamentHistory[userData.temperamentHistory.length - 1];
        
        const currentTotal = calculateTotalWeaknesses(current);
        const oldestTotal = calculateTotalWeaknesses(oldest);
        
        if (currentTotal < oldestTotal) {
            const improvement = Math.round(((oldestTotal - currentTotal) / oldestTotal) * 100);
            return `Improved weaknesses by ${improvement}% since start.`;
        } else if (currentTotal > oldestTotal) {
            return `Total weaknesses increased by ${currentTotal - oldestTotal} points over time.`;
        }
        return "Weakness count remains stable over time.";
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto relative">
             <SelfieVerificationModal 
                isOpen={isSelfieModalOpen}
                onClose={() => setIsSelfieModalOpen(false)}
                onSave={(selfieData) => {
                    setUserData(prev => ({ ...prev, selfie: selfieData }));
                    if (!isEditing) setUser(prev => ({ ...prev, selfie: selfieData })); 
                    setIsSelfieModalOpen(false);
                }}
                theme={theme}
            />
            <TemperamentTestModal 
                isOpen={isTemperamentModalOpen}
                onClose={() => setIsTemperamentModalOpen(false)}
                onSave={handleTemperamentSave}
                theme={theme}
            />
            
            {/* Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative shrink-0">
                 <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 {isEditing && (
                    <div className="absolute top-4 right-4">
                         <button className="bg-black/30 hover:bg-black/50 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm flex items-center transition-colors">
                             <Icon name="camera" className="h-3 w-3 mr-2" /> Edit Cover
                         </button>
                    </div>
                 )}
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-16 pb-10">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                         <div className="relative group">
                            <div className={`w-32 h-32 rounded-full border-4 ${theme === 'dark' ? 'border-slate-900' : 'border-white'} shadow-lg overflow-hidden bg-yellow-400 flex items-center justify-center`}>
                                {userData.avatar ? <img className="w-full h-full object-cover" src={userData.avatar} alt="User avatar" /> : <span className="text-slate-800 font-bold text-4xl">{avatarInitials}</span>}
                            </div>
                            {isEditing && (
                                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity border-4 border-transparent">
                                    <Icon name="camera" className="h-8 w-8 text-white" />
                                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                </label>
                            )}
                        </div>
                        <div className="text-center md:text-left mb-2">
                             <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} flex items-center gap-2 justify-center md:justify-start`}>
                                 {userData.name}
                                 {isVerified && !isEditing && <div className="bg-blue-500 rounded-full p-0.5"><Icon name="check-circle" className="h-4 w-4 text-white" /></div>}
                             </h1>
                             <p className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{userData.role}</p>
                             <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>{userData.email}</span>
                             </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} className={`px-5 py-2.5 text-sm font-medium border rounded-lg transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                                <button onClick={handleSave} className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-yellow-500 rounded-lg hover:bg-yellow-600 shadow-md transition-transform active:scale-95">Save Changes</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                <Icon name="edit" className="h-4 w-4" />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: About, Contact, Temperament, Social */}
                    <div className="space-y-8">
                        
                        {/* 1. About Card */}
                        <div className={`${cardClasses} p-6 rounded-xl shadow-sm`}>
                            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>About</h3>
                            {isEditing ? (
                                <textarea name="bio" value={userData.bio} onChange={handleInputChange} rows={4} className={`w-full rounded-lg shadow-sm sm:text-sm px-3 py-2 ${commonInputClasses}`} placeholder="Tell us about yourself..."></textarea>
                            ) : (
                                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{userData.bio || "No biography provided."}</p>
                            )}
                        </div>

                        {/* 2. Contact Information Card */}
                        <div className={`${cardClasses} p-6 rounded-xl shadow-sm`}>
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}><Icon name="phone" className="h-5 w-5 text-yellow-500" /> Contact Information</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClasses}>Email Address</label>
                                    {isEditing ? <input type="email" name="email" value={userData.email} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} /> : <div className="flex items-center"><span className={valueClasses}>{userData.email}</span></div>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Primary Phone</label>
                                    {isEditing ? <input type="tel" name="phonePrimary" value={userData.phonePrimary || ''} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} /> : <span className={valueClasses}>{userData.phonePrimary || 'Not provided'}</span>}
                                </div>
                                <div>
                                    <label className={labelClasses}>WhatsApp</label>
                                    {isEditing ? <input type="tel" name="phoneWhatsapp" value={userData.phoneWhatsapp || ''} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} /> : <span className={valueClasses}>{userData.phoneWhatsapp || 'Not provided'}</span>}
                                </div>
                            </div>
                        </div>
                        
                        {/* 3. Personality Card */}
                        <div className={`${cardClasses} rounded-xl shadow-sm overflow-hidden`}>
                            <div className={`px-6 py-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'}`}>
                                <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                    <Icon name="star" className="h-5 w-5 text-purple-500" />
                                    Personality
                                </h3>
                                {!latestTemperament && (
                                    <button onClick={() => setIsTemperamentModalOpen(true)} className="text-sm text-blue-500 hover:underline font-medium">Take Test</button>
                                )}
                            </div>
                            <div className="p-6">
                                {latestTemperament ? (
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-4">
                                            <div className={`flex-1 p-3 rounded-lg border-l-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`} style={{ borderLeftColor: TEMPERAMENT_DATA[latestTemperament.dominant].color }}>
                                                <p className={`text-[10px] uppercase font-bold mb-1 opacity-70`}>Dominant</p>
                                                <h4 className={`text-lg font-bold`} style={{ color: TEMPERAMENT_DATA[latestTemperament.dominant].color }}>{latestTemperament.dominant}</h4>
                                                <p className={`text-xs italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{TEMPERAMENT_DATA[latestTemperament.dominant].characteristic}</p>
                                            </div>
                                            <div className={`flex-1 p-3 rounded-lg border-l-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`} style={{ borderLeftColor: TEMPERAMENT_DATA[latestTemperament.secondary].color }}>
                                                <p className={`text-[10px] uppercase font-bold mb-1 opacity-70`}>Secondary</p>
                                                <h4 className={`text-lg font-bold`} style={{ color: TEMPERAMENT_DATA[latestTemperament.secondary].color }}>{latestTemperament.secondary}</h4>
                                                <p className={`text-xs italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{TEMPERAMENT_DATA[latestTemperament.secondary].characteristic}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h5 className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Key Strengths</h5>
                                                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{TEMPERAMENT_DATA[latestTemperament.dominant].positiveDescription.substring(0, 100)}...</p>
                                            </div>
                                            <div>
                                                <h5 className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>Growth Areas</h5>
                                                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{TEMPERAMENT_DATA[latestTemperament.dominant].negativeDescription.substring(0, 100)}...</p>
                                            </div>
                                        </div>

                                        {/* Weakness Improvement History Chart */}
                                        {userData.temperamentHistory && userData.temperamentHistory.length > 0 && (
                                            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                     <h5 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Weakness Reduction Journey</h5>
                                                     <span className={`text-[10px] ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{getImprovementText()}</span>
                                                </div>
                                                
                                                {userData.temperamentHistory.length > 1 ? (
                                                    <div className="flex items-end justify-between h-24 gap-2 pl-1 pb-1 border-b border-l border-slate-300 dark:border-slate-600">
                                                        {[...userData.temperamentHistory].reverse().map((result, idx) => {
                                                            const totalWeaknesses = calculateTotalWeaknesses(result);
                                                            const maxWeaknesses = 30; // Assumed max for scale
                                                            const height = Math.min(100, (totalWeaknesses / maxWeaknesses) * 100);
                                                            const isCurrent = idx === userData.temperamentHistory!.length - 1;
                                                            
                                                            return (
                                                                <div key={result.id} className="flex flex-col items-center flex-1 group relative">
                                                                    <div 
                                                                        className={`w-full max-w-[20px] min-w-[8px] rounded-t transition-all ${isCurrent ? 'bg-blue-500' : 'bg-red-400 opacity-60 hover:opacity-90'}`}
                                                                        style={{ height: `${height}%` }}
                                                                    ></div>
                                                                     {/* Tooltip */}
                                                                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                                                                        {totalWeaknesses} weaknesses
                                                                    </div>
                                                                    <span className="text-[9px] mt-1 opacity-70 overflow-hidden whitespace-nowrap w-full text-center">{formatDate(result.date)}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs italic text-center py-2 opacity-60">Take more tests to track progress.</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-2">
                                            <button onClick={() => setIsTemperamentModalOpen(true)} className={`text-xs px-3 py-1.5 rounded border transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700' : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                                                Retake Test
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-3">
                                            <Icon name="analytics" className="h-6 w-6" />
                                        </div>
                                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Unlock Your Profile</h4>
                                        <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Discover your strengths & weaknesses.
                                        </p>
                                        <button onClick={() => setIsTemperamentModalOpen(true)} className="px-4 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors shadow-md">
                                            Start Test
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Social Profiles Card */}
                         <div className={`${cardClasses} p-6 rounded-xl shadow-sm`}>
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                <Icon name="share" className="h-5 w-5 text-blue-500" /> Social Profiles
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>LinkedIn</label>
                                    {isEditing ? (
                                        <input type="text" name="socialLinkedIn" value={userData.socialLinkedIn || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} />
                                    ) : userData.socialLinkedIn ? (
                                        <a href={userData.socialLinkedIn} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-500 hover:underline">
                                            <Icon name="linkedin" className="h-4 w-4 mr-2" /> LinkedIn Profile
                                        </a>
                                    ) : <span className={`text-sm italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Not provided</span>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Twitter</label>
                                    {isEditing ? (
                                        <input type="text" name="socialTwitter" value={userData.socialTwitter || ''} onChange={handleInputChange} placeholder="https://twitter.com/..." className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} />
                                    ) : userData.socialTwitter ? (
                                        <a href={userData.socialTwitter} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-400 hover:underline">
                                            <Icon name="twitter" className="h-4 w-4 mr-2" /> Twitter Profile
                                        </a>
                                    ) : <span className={`text-sm italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Not provided</span>}
                                </div>
                                <div>
                                    <label className={labelClasses}>GitHub</label>
                                    {isEditing ? (
                                        <input type="text" name="socialGitHub" value={userData.socialGitHub || ''} onChange={handleInputChange} placeholder="https://github.com/..." className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} />
                                    ) : userData.socialGitHub ? (
                                        <a href={userData.socialGitHub} target="_blank" rel="noreferrer" className="flex items-center text-sm hover:underline">
                                            <Icon name="github" className="h-4 w-4 mr-2" /> GitHub Profile
                                        </a>
                                    ) : <span className={`text-sm italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Not provided</span>}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Details */}
                        <div className={`${cardClasses} p-6 rounded-xl shadow-sm`}>
                            <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Full Name</label>
                                    {isEditing ? <input type="text" name="name" value={userData.name} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} /> : <p className={valueClasses}>{userData.name}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    {isEditing ? (
                                        <select name="gender" value={userData.gender} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`}>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                            <option>Prefer not to say</option>
                                        </select>
                                    ) : <p className={valueClasses}>{userData.gender || 'Not specified'}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Date of Birth</label>
                                    {isEditing ? <input type="date" name="dateOfBirth" value={userData.dateOfBirth} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} /> : <p className={valueClasses}>{userData.dateOfBirth || 'Not specified'}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Identity Verification */}
                         <div className={`${cardClasses} p-6 rounded-xl shadow-sm`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                    <Icon name="shield-check" className={`h-5 w-5 ${isVerified ? 'text-green-500' : 'text-slate-400'}`} />
                                    Identity Verification
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isVerified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {isVerified ? 'Verified' : 'Pending'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className={labelClasses}>ID Type</label>
                                    {isEditing ? (
                                        <select name="idType" value={userData.idType} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`}>
                                            <option>National ID</option>
                                            <option>Passport</option>
                                            <option>Driver's License</option>
                                        </select>
                                    ) : <p className={valueClasses}>{userData.idType || 'Not specified'}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>ID Number</label>
                                    {isEditing ? <input type="text" name="idNumber" value={userData.idNumber} onChange={handleInputChange} className={`w-full rounded-lg sm:text-sm px-3 py-2 ${commonInputClasses}`} /> : <p className={`${valueClasses} font-mono`}>{userData.idNumber || 'Not specified'}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <ImageUploader theme={theme} label="ID Front" imageUrl={userData.idDocument?.front || null} isEditing={isEditing} onFileSelect={(file) => handleIdDocumentChange(file, 'front')} inputId="id-doc-front-upload" />
                                <ImageUploader theme={theme} label="ID Back" imageUrl={userData.idDocument?.back || null} isEditing={isEditing} onFileSelect={(file) => handleIdDocumentChange(file, 'back')} inputId="id-doc-back-upload" />
                            </div>

                            <div className="mt-8 pt-6 border-t border-dashed border-slate-300 dark:border-slate-700">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <label className={labelClasses}>Selfie Verification</label>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>A recent photo to verify ownership of the ID document.</p>
                                    </div>
                                    <div>
                                        {userData.selfie ? (
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                                                     <img src={userData.selfie} alt="Selfie" className="h-full w-full object-cover" />
                                                </div>
                                                {isEditing && <button onClick={() => setIsSelfieModalOpen(true)} className="text-sm text-blue-500 hover:underline">Retake</button>}
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsSelfieModalOpen(true)} className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                                                <Icon name="camera" className="h-4 w-4" /><span>Take Selfie</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

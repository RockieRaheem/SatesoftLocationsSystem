import React, { useState, useEffect } from 'react';
import { ShopUser, Theme } from '../types';
import Icon from './Icon';

interface TerminateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: { remarks: string; averageRating: number }) => void;
  user: ShopUser | null;
  theme: Theme;
}

const competenceParameters = ['Skills & Knowledge', 'Work Quality', 'Productivity', 'Communication', 'Teamwork'];

const StarRating: React.FC<{ rating: number; onRatingChange: (rating: number) => void; theme: Theme; }> = ({ rating, onRatingChange, theme }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    className="focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full"
                >
                    <Icon
                        name="star"
                        className={`h-6 w-6 transition-colors ${
                            star <= rating
                                ? 'text-yellow-400'
                                : (theme === 'dark' ? 'text-slate-600 hover:text-slate-500' : 'text-slate-300 hover:text-slate-400')
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

const TerminateUserModal: React.FC<TerminateUserModalProps> = ({ isOpen, onClose, onConfirm, user, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [ratings, setRatings] = useState<Record<string, number>>(() => {
        const initialState: Record<string, number> = {};
        competenceParameters.forEach(p => initialState[p] = 0);
        return initialState;
    });
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        // FIX: Cast `Object.values(ratings)` to `number[]` to resolve type errors.
        const ratingValues = Object.values(ratings) as number[];
        const ratedItems = ratingValues.filter(r => r > 0);
        if (ratedItems.length > 0) {
            const sum = ratedItems.reduce((acc, curr) => acc + curr, 0);
            setAverageRating(sum / ratedItems.length);
        } else {
            setAverageRating(0);
        }
    }, [ratings]);

    const handleRatingChange = (parameter: string, rating: number) => {
        setRatings(prev => ({ ...prev, [parameter]: rating }));
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setRemarks('');
            const initialState: Record<string, number> = {};
            competenceParameters.forEach(p => initialState[p] = 0);
            setRatings(initialState);
        }, 300);
    };

    const handleConfirm = () => {
        if (!remarks.trim() || Object.values(ratings).some(r => r === 0)) {
            alert('Remarks and all competence ratings are required to terminate a user.');
            return;
        }
        onConfirm({ remarks, averageRating });
    };

    if (!isOpen && !isClosing || !user) return null;

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Terminate User Access</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        You are about to terminate access for the following user. This action will be recorded and cannot be undone. Please provide remarks and a competence rating.
                    </p>
                    <div className={`p-4 rounded-md border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Shop(s): {user.shop.join(', ')}</p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Created by: {user.createdBy}</p>
                    </div>

                    <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-slate-700' : 'border-transparent'}`}>
                        <h3 className={`block text-md font-medium mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Competence Rating</h3>
                        <div className="space-y-3">
                            {competenceParameters.map(param => (
                                <div key={param} className="flex items-center justify-between">
                                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{param}</span>
                                    <StarRating rating={ratings[param]} onRatingChange={(rating) => handleRatingChange(param, rating)} theme={theme} />
                                </div>
                            ))}
                        </div>
                        <div className={`flex justify-end items-baseline mt-4 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                            <span className={`text-sm font-medium mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Average Rating:</span>
                            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{averageRating.toFixed(1)} / 5</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="remarks" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Remarks (Required)
                        </label>
                        <textarea
                            id="remarks"
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Provide a clear reason for termination..."
                            className={`w-full p-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                        ></textarea>
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!remarks.trim() || Object.values(ratings).some(r => r === 0)}
                        className="ml-3 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        Confirm Termination
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TerminateUserModal;



import React, { useState, useMemo } from 'react';
import { Theme, TemperamentType, TemperamentResult } from '../types';
import { TEMPERAMENT_DATA } from '../data';
import Icon from './Icon';

interface TemperamentTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (result: TemperamentResult) => void;
    theme: Theme;
}

type Step = 'intro' | 'strengths' | 'weaknesses' | 'calculating';

const TemperamentTestModal: React.FC<TemperamentTestModalProps> = ({ isOpen, onClose, onSave, theme }) => {
    const [step, setStep] = useState<Step>('intro');
    const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
    const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);
    
    // Helper to get random traits for the cloud
    const allStrengths = useMemo(() => {
        const traits: { type: TemperamentType, text: string }[] = [];
        Object.entries(TEMPERAMENT_DATA).forEach(([type, data]: [string, any]) => {
            data.strengths.forEach((trait: string) => traits.push({ type: type as TemperamentType, text: trait }));
        });
        return traits.sort(() => Math.random() - 0.5); // Shuffle
    }, []);

    const allWeaknesses = useMemo(() => {
        const traits: { type: TemperamentType, text: string }[] = [];
        Object.entries(TEMPERAMENT_DATA).forEach(([type, data]: [string, any]) => {
            data.weaknesses.forEach((trait: string) => traits.push({ type: type as TemperamentType, text: trait }));
        });
        return traits.sort(() => Math.random() - 0.5); // Shuffle
    }, []);

    const handleToggleStrength = (trait: string) => {
        if (selectedStrengths.includes(trait)) {
            setSelectedStrengths(prev => prev.filter(t => t !== trait));
        } else {
            setSelectedStrengths(prev => [...prev, trait]);
        }
    };

    const handleToggleWeakness = (trait: string) => {
        if (selectedWeaknesses.includes(trait)) {
            setSelectedWeaknesses(prev => prev.filter(t => t !== trait));
        } else {
            setSelectedWeaknesses(prev => [...prev, trait]);
        }
    };

    const calculateAndSave = () => {
        setStep('calculating');
        
        setTimeout(() => {
            const scores: Record<TemperamentType, number> = {
                'Choleric': 0, 'Sanguine': 0, 'Melancholic': 0, 'Phlegmatic': 0
            };
            const strengthScores: Record<TemperamentType, number> = {
                'Choleric': 0, 'Sanguine': 0, 'Melancholic': 0, 'Phlegmatic': 0
            };
            const weaknessScores: Record<TemperamentType, number> = {
                'Choleric': 0, 'Sanguine': 0, 'Melancholic': 0, 'Phlegmatic': 0
            };

            // Scoring: Strengths count + Weaknesses count mapped to types
            selectedStrengths.forEach(s => {
                Object.entries(TEMPERAMENT_DATA).forEach(([type, data]: [string, any]) => {
                    if (data.strengths.includes(s)) {
                        scores[type as TemperamentType]++;
                        strengthScores[type as TemperamentType]++;
                    }
                });
            });
            
            selectedWeaknesses.forEach(w => {
                 Object.entries(TEMPERAMENT_DATA).forEach(([type, data]: [string, any]) => {
                    if (data.weaknesses.includes(w)) {
                        scores[type as TemperamentType]++;
                        weaknessScores[type as TemperamentType]++;
                    }
                });
            });

            const sortedTypes = (Object.entries(scores) as [TemperamentType, number][]).sort((a, b) => b[1] - a[1]);
            
            const result: TemperamentResult = {
                id: `TR-${Date.now()}`,
                date: new Date().toISOString(),
                dominant: sortedTypes[0][0],
                secondary: sortedTypes[1][0], // Simple secondary selection, ties handled by order
                breakdown: scores,
                strengthBreakdown: strengthScores,
                weaknessBreakdown: weaknessScores
            };

            onSave(result);
            handleClose();
        }, 1500); // Fake processing time
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep('intro');
            setSelectedStrengths([]);
            setSelectedWeaknesses([]);
        }, 300);
    };

    if (!isOpen) return null;

    const cardClasses = `${theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'} rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]`;
    const pillClass = (isSelected: boolean) => `cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected 
        ? 'bg-yellow-500 text-slate-900 border-yellow-500 shadow-md transform scale-105' 
        : (theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-400')}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className={cardClasses}>
                
                {/* Header */}
                <div className={`px-6 py-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className="text-xl font-bold flex items-center">
                        <Icon name="analytics" className="h-6 w-6 mr-2 text-yellow-500" />
                        Temperament Analysis
                    </h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {step === 'intro' && (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon name="users" className="h-12 w-12 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold">Discover Your Personality</h3>
                            <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                This test will help identify your dominant and secondary temperaments by analyzing your natural strengths and weaknesses.
                            </p>
                            <div className="flex justify-center pt-4">
                                <button onClick={() => setStep('strengths')} className="px-8 py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-transform hover:-translate-y-1">
                                    Start Test
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'strengths' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-center">Select Your Strengths</h3>
                            <p className={`text-sm text-center mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Choose all the words that describe your positive traits naturally.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {allStrengths.map((item, idx) => (
                                    <button 
                                        key={`${item.text}-${idx}`}
                                        onClick={() => handleToggleStrength(item.text)}
                                        className={pillClass(selectedStrengths.includes(item.text))}
                                    >
                                        {item.text}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button 
                                    onClick={() => setStep('weaknesses')} 
                                    disabled={selectedStrengths.length === 0}
                                    className="px-6 py-2 bg-yellow-500 text-slate-900 font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'weaknesses' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-center">Select Your Weaknesses</h3>
                            <p className={`text-sm text-center mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Be honest. Choose the traits that represent your struggles or negative tendencies.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {allWeaknesses.map((item, idx) => (
                                    <button 
                                        key={`${item.text}-${idx}`}
                                        onClick={() => handleToggleWeakness(item.text)}
                                        className={pillClass(selectedWeaknesses.includes(item.text))}
                                    >
                                        {item.text}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-between">
                                <button 
                                    onClick={() => setStep('strengths')} 
                                    className={`px-6 py-2 border font-medium rounded-lg ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={calculateAndSave}
                                    disabled={selectedWeaknesses.length === 0}
                                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Finish & View Results
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'calculating' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
                            <h3 className="text-lg font-semibold">Analyzing your profile...</h3>
                        </div>
                    )}
                </div>

                {/* Progress Bar (only active steps) */}
                {(step === 'strengths' || step === 'weaknesses') && (
                    <div className="h-2 bg-gray-200 dark:bg-slate-800">
                        <div 
                            className="h-full bg-yellow-500 transition-all duration-300 ease-out" 
                            style={{ width: step === 'strengths' ? '50%' : '90%' }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemperamentTestModal;

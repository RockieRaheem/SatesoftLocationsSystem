import React from 'react';
import { Theme } from '../types';
import Icon from './Icon';
import { BarChart, DonutChart } from './Charts';

interface KPIDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    kpiData: any | null;
    theme: Theme;
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({ isOpen, onClose, kpiData, theme }) => {
    if (!isOpen || !kpiData) return null;

    const { title, value, historicalData, breakdown, insights } = kpiData;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h2>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{value}</p>
                    </div>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className={`lg:col-span-3 p-4 border rounded-lg ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                            <h3 className="font-semibold mb-2">Historical Performance (6 Months)</h3>
                            <div className="h-56">
                               <BarChart data={historicalData} theme={theme} />
                            </div>
                        </div>
                        <div className={`lg:col-span-2 p-4 border rounded-lg ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                             <h3 className="font-semibold mb-2">Breakdown</h3>
                             <div className="h-56">
                                <DonutChart 
                                    data={breakdown.map((b: any) => ({ name: b.category, value: b.amount, color: b.color }))}
                                    theme={theme}
                                    legendDirection="vertical"
                                    strokeWidth={25}
                                />
                             </div>
                        </div>
                    </div>
                    
                     <div className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                        <h3 className="font-semibold mb-3">Key Insights</h3>
                        <ul className="space-y-2 list-disc list-inside">
                            {insights.map((insight: string, index: number) => (
                                <li key={index} className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{insight}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={`flex justify-end items-center p-4 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={onClose} className={`px-5 py-2 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KPIDetailModal;


import React, { useState, useEffect } from 'react';
import { Theme, StockItem } from '../types';
import Icon from './Icon';

interface StockReconciliationModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: StockItem | null;
    theme: Theme;
    onReconcile: (item: StockItem, physicalCount: number, unit: string, remarks: string) => void;
}

const StockReconciliationModal: React.FC<StockReconciliationModalProps> = ({ isOpen, onClose, item, theme, onReconcile }) => {
    const [physicalCount, setPhysicalCount] = useState<number>(0);
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [resultType, setResultType] = useState<'more' | 'less' | 'equal' | null>(null);

    useEffect(() => {
        if (item) {
            setPhysicalCount(item.quantity);
            setSelectedUnit(item.unit);
            setRemarks('');
            setShowResult(false);
            setResultType(null);
        }
    }, [item, isOpen]);

    if (!isOpen || !item) return null;

    const handleReconcile = () => {
        const systemCount = item.quantity;
        let type: 'more' | 'less' | 'equal' = 'equal';
        let message = '';

        if (physicalCount > systemCount) {
            type = 'more';
            const diff = physicalCount - systemCount;
            message = `The physical count (${physicalCount} ${selectedUnit}) is MORE than the system record (${systemCount} ${selectedUnit}). The system quantity will be increased by ${diff} ${selectedUnit}. A purchase entry will be created with a flag "added due to stock reconciliation".`;
        } else if (physicalCount < systemCount) {
            type = 'less';
            const diff = systemCount - physicalCount;
            message = `The physical count (${physicalCount} ${selectedUnit}) is LESS than the system record (${systemCount} ${selectedUnit}). The system quantity will be reduced by ${diff} ${selectedUnit}. A correction entry will be created under purchases with a comment "reduced during reconciliation".`;
        } else {
            type = 'equal';
            message = `The physical count (${physicalCount} ${selectedUnit}) matches the system record. The records in the system are okay.`;
        }

        setResultType(type);
        setResultMessage(message);
        setShowResult(true);
    };

    const handleConfirm = () => {
        onReconcile(item, physicalCount, selectedUnit, remarks);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                {!showResult ? (
                    <>
                        <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Stock Reconciliation</h2>
                            <button onClick={onClose} className={`p-1 rounded-full hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                                <Icon name="x-mark" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className={`p-3 rounded-md border text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                <p className="font-semibold mb-1">Product Details:</p>
                                <p>{item.productName} ({item.productSN})</p>
                                <p>System Quantity: <span className="font-bold">{item.quantity} {item.unit}</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Unit of Quantity</label>
                                    <select
                                        value={selectedUnit}
                                        onChange={(e) => setSelectedUnit(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                                    >
                                        <option value={item.unit}>{item.unit}</option>
                                        <option value="Carton">Carton</option>
                                        <option value="Box">Box</option>
                                        <option value="Piece">Piece</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Physical Count</label>
                                    <input
                                        type="number"
                                        value={physicalCount}
                                        onChange={(e) => setPhysicalCount(Number(e.target.value))}
                                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                                        placeholder="Enter count"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReconcile}
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors"
                                >
                                    Reconcile
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`p-4 border-b flex items-center gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                            <div className={`p-2 rounded-full ${
                                resultType === 'more' ? 'bg-green-100 text-green-600' :
                                resultType === 'less' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                                <Icon name={resultType === 'more' ? 'arrow-up' : resultType === 'less' ? 'arrow-down' : 'check-circle'} className="h-5 w-5" />
                            </div>
                            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Reconciliation Result</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {resultMessage}
                            </p>

                            {resultType !== 'equal' && (
                                <div className="space-y-1">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks / Reason</label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows={3}
                                        placeholder="Enter reason for discrepancy..."
                                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                                    />
                                </div>
                            )}

                            <div className="mt-8 flex justify-end gap-3">
                                {resultType !== 'equal' ? (
                                    <>
                                        <button
                                            onClick={() => setShowResult(false)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors"
                                        >
                                            Confirm & Apply
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StockReconciliationModal;

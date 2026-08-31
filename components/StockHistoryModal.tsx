
import React from 'react';
import { Theme, StockItem, StockHistoryEntry } from '../types';
import Icon from './Icon';

interface StockHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: StockItem | null;
    theme: Theme;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ isOpen, onClose, item, theme }) => {
    if (!isOpen || !item) return null;

    // Mock history data for the item
    const mockHistory: StockHistoryEntry[] = [
        { id: 1, date: '2026-03-01 10:00', type: 'Initial' as const, quantityChange: 100, newQuantity: 100, unit: item.unit, performedBy: 'System Admin' },
        { id: 2, date: '2026-03-02 14:30', type: 'Sale' as const, quantityChange: -5, newQuantity: 95, unit: item.unit, performedBy: 'Cashier 1', remarks: 'Receipt #12345' },
        { id: 3, date: '2026-03-03 09:15', type: 'Purchase' as const, quantityChange: 50, newQuantity: 145, unit: item.unit, performedBy: 'Store Manager', remarks: 'Invoice #INV-99' },
        { id: 4, date: '2026-03-04 11:00', type: 'Reconciliation' as const, quantityChange: -2, newQuantity: 143, unit: item.unit, performedBy: 'Inventory Auditor', remarks: 'Stock correction' },
    ].reverse();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className={`w-full max-w-3xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <div>
                        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Stock Level History</h2>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.productName} ({item.productSN})</p>
                    </div>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-opacity-80 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">Date</th>
                                <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">Type</th>
                                <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 text-right">Change</th>
                                <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 text-right">Balance</th>
                                <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">Performed By</th>
                                <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                            {mockHistory.map((entry) => (
                                <tr key={entry.id} className={`${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                    <td className={`px-3 py-3 whitespace-nowrap ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{entry.date}</td>
                                    <td className="px-3 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            entry.type === 'Purchase' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            entry.type === 'Sale' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            entry.type === 'Reconciliation' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td className={`px-3 py-3 text-right font-medium ${entry.quantityChange > 0 ? 'text-green-500' : entry.quantityChange < 0 ? 'text-red-500' : ''}`}>
                                        {entry.quantityChange > 0 ? '+' : ''}{entry.quantityChange} {entry.unit}
                                    </td>
                                    <td className={`px-3 py-3 text-right font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                        {entry.newQuantity} {entry.unit}
                                    </td>
                                    <td className={`px-3 py-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{entry.performedBy}</td>
                                    <td className={`px-3 py-3 text-xs italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{entry.remarks || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={`p-4 border-t flex justify-end ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockHistoryModal;

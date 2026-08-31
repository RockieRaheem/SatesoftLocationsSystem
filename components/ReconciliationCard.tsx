import React, { useState, useMemo } from 'react';
import { SelectedProduct, Theme, ReconciliationDetails } from '../types';

interface ReconciliationCardProps {
  product: SelectedProduct;
  theme: Theme;
  onSave: (details: Omit<ReconciliationDetails, 'reconciledOn'>) => void;
  onCancel: () => void;
}

const ReconciliationCard: React.FC<ReconciliationCardProps> = ({ product, theme, onSave, onCancel }) => {
    const [physicalCount, setPhysicalCount] = useState<string>('');
    const [remarks, setRemarks] = useState('');

    const difference = useMemo(() => {
        const physical = parseInt(physicalCount, 10);
        if (isNaN(physical)) {
            return 0;
        }
        return physical - product.quantity;
    }, [physicalCount, product.quantity]);

    const handleSave = () => {
        const physical = parseInt(physicalCount, 10);
        if (isNaN(physical)) {
             // Or show an error message
            return;
        }
        onSave({
            physicalCount: physical,
            difference,
            remarks,
        });
    };
    
    const cardClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200';
    const inputClasses = theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
    const focusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

    const differenceColor = difference > 0 ? 'text-green-500' : difference < 0 ? 'text-red-500' : (theme === 'dark' ? 'text-slate-300' : 'text-slate-600');
    const differenceSign = difference > 0 ? '+' : '';

    return (
        <div className={`p-4 border-t ${cardClasses} transition-all duration-300 ease-in-out`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column 1: Counts */}
                <div className="space-y-4">
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>System Count</label>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.quantity} {product.unit}</p>
                    </div>
                     <div>
                        <label htmlFor={`physical-count-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Physical Count</label>
                        <input
                            id={`physical-count-${product.sku}`}
                            type="number"
                            value={physicalCount}
                            onChange={(e) => setPhysicalCount(e.target.value)}
                            className={`w-full rounded-md shadow-sm text-sm px-3 py-2 border ${inputClasses} ${focusClasses}`}
                            placeholder="Enter count..."
                        />
                    </div>
                     <div>
                        <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Difference</label>
                        <p className={`font-semibold ${differenceColor}`}>
                           {differenceSign}{difference} {product.unit}
                        </p>
                    </div>
                </div>
                {/* Column 2: Remarks */}
                <div className="md:col-span-2">
                     <label htmlFor={`remarks-${product.sku}`} className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Remarks</label>
                    <textarea
                        id={`remarks-${product.sku}`}
                        rows={5}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className={`w-full h-full rounded-md shadow-sm text-sm px-3 py-2 border ${inputClasses} ${focusClasses}`}
                        placeholder="Explain any difference..."
                    />
                </div>
            </div>
            {/* Actions */}
            <div className="flex justify-end space-x-2 mt-4">
                 <button onClick={onCancel} className={`px-4 py-2 text-sm font-medium border rounded-md ${theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-200'}`}>
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={physicalCount === ''}
                    className="px-4 py-2 text-sm font-semibold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Reconciliation
                </button>
            </div>
        </div>
    );
};

export default ReconciliationCard;

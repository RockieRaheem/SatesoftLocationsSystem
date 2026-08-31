import React, { useState, useEffect, useMemo } from 'react';
import { Shop, ActiveView } from '../types';
import Icon from './Icon';
import { motion, AnimatePresence } from 'motion/react';

interface CashFlowDetailPageProps {
    shop: Shop;
    onBack: () => void;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const years = ['2023', '2024', '2025'];

// MultiSelect component reused from BalanceSheetDetailPage
const MultiSelect = ({ 
    options, 
    selected, 
    onChange, 
    label,
    placeholder = "Select..."
}: { 
    options: string[], 
    selected: string[], 
    onChange: (vals: string[]) => void,
    label: string,
    placeholder?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-full md:w-64">
            <label className="block text-xs font-bold uppercase mb-1 opacity-60">{label}</label>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:border-slate-400 transition-colors shadow-sm"
            >
                <span className="truncate">
                    {selected.length === 0 ? placeholder : 
                     selected.length === options.length ? `All ${label}s` :
                     selected.join(', ')}
                </span>
                <Icon name="hamburger" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto p-2"
                        >
                            <div 
                                className="flex items-center px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors mb-1"
                                onClick={() => {
                                    if (selected.length === options.length) onChange([]);
                                    else onChange(options);
                                }}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${selected.length === options.length ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100' : 'border-slate-300'}`}>
                                    {selected.length === options.length && <Icon name="check" className="w-3.5 h-3.5 text-white dark:text-slate-900" />}
                                </div>
                                <span className="text-base font-medium">Select All</span>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                            {options.map(opt => (
                                <div 
                                    key={opt}
                                    className="flex items-center px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => {
                                        if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
                                        else onChange([...selected, opt]);
                                    }}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${selected.includes(opt) ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100' : 'border-slate-300'}`}>
                                        {selected.includes(opt) && <Icon name="check" className="w-3.5 h-3.5 text-white dark:text-slate-900" />}
                                    </div>
                                    <span className="text-base font-medium">{opt}</span>
                                </div>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const CashFlowDetailPage: React.FC<CashFlowDetailPageProps> = ({ shop, onBack }) => {
    const [selectedYears, setSelectedYears] = useState<string[]>(['2024']);
    const [selectedMonths, setSelectedMonths] = useState<string[]>(months);

    // When only one year is selected, default to all months
    useEffect(() => {
        if (selectedYears.length === 1) {
            setSelectedMonths(months);
        }
    }, [selectedYears]);

    const isMonthlyView = selectedYears.length === 1;
    const activeYear = selectedYears[0];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: shop.currency,
            maximumFractionDigits: 0
        }).format(val);
    };

    // Mock data generator for Cash Flow
    const getMonthValue = (base: number, year: string, monthIdx: number) => {
        const yearFactor = parseInt(year) - 2023 + 1;
        const monthFactor = 1 + (monthIdx / 12) * 0.2;
        return base * yearFactor * monthFactor * (0.9 + Math.random() * 0.2);
    };

    const getYearValue = (base: number, year: string) => {
        const yearFactor = parseInt(year) - 2023 + 1;
        return base * yearFactor * 12 * (0.95 + Math.random() * 0.1);
    };

    const calculateTotal = (items: any[], year: string, monthsToSum?: string[]) => {
        return items.reduce((sum, item) => {
            if (monthsToSum) {
                return sum + monthsToSum.reduce((mSum, m) => mSum + getMonthValue(item.base, year, months.indexOf(m)), 0);
            }
            return sum + getYearValue(item.base, year);
        }, 0);
    };

    const cashFlowData = {
        operating: [
            { label: 'Net Income', base: 50000 },
            { label: 'Depreciation & Amortization', base: 8000 },
            { label: 'Stock-based Compensation', base: 2000 },
            { label: 'Changes in Working Capital', base: -3000 },
            { label: 'Other Operating Activities', base: 1500 },
        ],
        investing: [
            { label: 'Capital Expenditures (CAPEX)', base: -15000 },
            { label: 'Acquisitions', base: -5000 },
            { label: 'Investment Sales/Purchases', base: 2000 },
        ],
        financing: [
            { label: 'Debt Issuance/Repayment', base: 10000 },
            { label: 'Dividend Payments', base: -4000 },
            { label: 'Stock Repurchases', base: -2000 },
        ]
    };

    const sortedSelectedYears = [...selectedYears].sort();

    return (
        <div className="max-w-full px-2 md:px-4 mx-auto py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <Icon name="hamburger" className="w-6 h-6 rotate-90" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">{shop.name}</h1>
                        <p className="text-sm opacity-60 font-medium">Cash Flow Statement • {shop.countryCode}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <MultiSelect 
                        label="Years"
                        options={years}
                        selected={selectedYears}
                        onChange={setSelectedYears}
                    />
                    {isMonthlyView && (
                        <MultiSelect 
                            label="Months"
                            options={months}
                            selected={selectedMonths}
                            onChange={setSelectedMonths}
                        />
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="p-4 md:p-8 min-w-[1000px]">
                        {/* OPERATING ACTIVITIES */}
                        <section className="mb-12">
                            <div 
                                className="grid border-b-2 border-slate-900 dark:border-slate-100 mb-4 pb-1"
                                style={{ 
                                    gridTemplateColumns: isMonthlyView 
                                        ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                        : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                }}
                            >
                                <h3 className="text-xl font-black uppercase">Operating Activities</h3>
                                {isMonthlyView ? (
                                    <>
                                        {selectedMonths.map(m => (
                                            <div key={m} className="text-right text-[10px] font-bold uppercase self-end pb-1 px-1">{m.substring(0, 3)}</div>
                                        ))}
                                        <div className="text-right text-xs font-bold uppercase self-end pb-1 text-blue-500">Total</div>
                                    </>
                                ) : (
                                    sortedSelectedYears.map(year => (
                                        <div key={year} className="text-right text-xs font-bold uppercase self-end pb-1">{year}</div>
                                    ))
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                {cashFlowData.operating.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="grid pl-6 items-center"
                                        style={{ 
                                            gridTemplateColumns: isMonthlyView 
                                                ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                                : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                        }}
                                    >
                                        <span className="opacity-80 text-sm">{item.label}</span>
                                        {isMonthlyView ? (
                                            <>
                                                {selectedMonths.map(m => (
                                                    <span key={m} className="text-right font-mono text-sm px-1">
                                                        {Math.round(getMonthValue(item.base, activeYear, months.indexOf(m))).toLocaleString()}
                                                    </span>
                                                ))}
                                                <span className="text-right font-mono font-bold text-blue-500/80 text-base">
                                                    {formatCurrency(calculateTotal([item], activeYear, selectedMonths))}
                                                </span>
                                            </>
                                        ) : (
                                            sortedSelectedYears.map(year => (
                                                <span key={year} className="text-right font-mono text-lg">
                                                    {formatCurrency(getYearValue(item.base, year))}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                ))}

                                <div 
                                    className="grid pt-4 border-t border-slate-300 dark:border-slate-600 items-center"
                                    style={{ 
                                        gridTemplateColumns: isMonthlyView 
                                            ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                            : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                    }}
                                >
                                    <span className="font-black uppercase">Net Cash from Operating</span>
                                    {isMonthlyView ? (
                                        <>
                                            {selectedMonths.map(m => (
                                                <span key={m} className="text-right font-mono text-base font-bold px-1">
                                                    {Math.round(calculateTotal(cashFlowData.operating, activeYear, [m])).toLocaleString()}
                                                </span>
                                            ))}
                                            <span className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                                {formatCurrency(calculateTotal(cashFlowData.operating, activeYear, selectedMonths))}
                                            </span>
                                        </>
                                    ) : (
                                        sortedSelectedYears.map(year => {
                                            const total = calculateTotal(cashFlowData.operating, year);
                                            return (
                                                <span key={year} className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                                    {formatCurrency(total)}
                                                </span>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* INVESTING ACTIVITIES */}
                        <section className="mb-12">
                            <div 
                                className="grid border-b-2 border-slate-900 dark:border-slate-100 mb-4 pb-1"
                                style={{ 
                                    gridTemplateColumns: isMonthlyView 
                                        ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                        : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                }}
                            >
                                <h3 className="text-xl font-black uppercase">Investing Activities</h3>
                            </div>
                            
                            <div className="space-y-3">
                                {cashFlowData.investing.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="grid pl-6 items-center"
                                        style={{ 
                                            gridTemplateColumns: isMonthlyView 
                                                ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                                : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                        }}
                                    >
                                        <span className="opacity-80 text-sm">{item.label}</span>
                                        {isMonthlyView ? (
                                            <>
                                                {selectedMonths.map(m => (
                                                    <span key={m} className="text-right font-mono text-sm px-1">
                                                        {Math.round(getMonthValue(item.base, activeYear, months.indexOf(m))).toLocaleString()}
                                                    </span>
                                                ))}
                                                <span className="text-right font-mono font-bold text-blue-500/80 text-base">
                                                    {formatCurrency(calculateTotal([item], activeYear, selectedMonths))}
                                                </span>
                                            </>
                                        ) : (
                                            sortedSelectedYears.map(year => (
                                                <span key={year} className="text-right font-mono text-lg">
                                                    {formatCurrency(getYearValue(item.base, year))}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                ))}

                                <div 
                                    className="grid pt-4 border-t border-slate-300 dark:border-slate-600 items-center"
                                    style={{ 
                                        gridTemplateColumns: isMonthlyView 
                                            ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                            : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                    }}
                                >
                                    <span className="font-black uppercase">Net Cash from Investing</span>
                                    {isMonthlyView ? (
                                        <>
                                            {selectedMonths.map(m => (
                                                <span key={m} className="text-right font-mono text-base font-bold px-1">
                                                    {Math.round(calculateTotal(cashFlowData.investing, activeYear, [m])).toLocaleString()}
                                                </span>
                                            ))}
                                            <span className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                                {formatCurrency(calculateTotal(cashFlowData.investing, activeYear, selectedMonths))}
                                            </span>
                                        </>
                                    ) : (
                                        sortedSelectedYears.map(year => {
                                            const total = calculateTotal(cashFlowData.investing, year);
                                            return (
                                                <span key={year} className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                                    {formatCurrency(total)}
                                                </span>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* FINANCING ACTIVITIES */}
                        <section className="mb-12">
                            <div 
                                className="grid border-b-2 border-slate-900 dark:border-slate-100 mb-4 pb-1"
                                style={{ 
                                    gridTemplateColumns: isMonthlyView 
                                        ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                        : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                }}
                            >
                                <h3 className="text-xl font-black uppercase">Financing Activities</h3>
                            </div>
                            
                            <div className="space-y-3">
                                {cashFlowData.financing.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="grid pl-6 items-center"
                                        style={{ 
                                            gridTemplateColumns: isMonthlyView 
                                                ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                                : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                        }}
                                    >
                                        <span className="opacity-80 text-sm">{item.label}</span>
                                        {isMonthlyView ? (
                                            <>
                                                {selectedMonths.map(m => (
                                                    <span key={m} className="text-right font-mono text-sm px-1">
                                                        {Math.round(getMonthValue(item.base, activeYear, months.indexOf(m))).toLocaleString()}
                                                    </span>
                                                ))}
                                                <span className="text-right font-mono font-bold text-blue-500/80 text-base">
                                                    {formatCurrency(calculateTotal([item], activeYear, selectedMonths))}
                                                </span>
                                            </>
                                        ) : (
                                            sortedSelectedYears.map(year => (
                                                <span key={year} className="text-right font-mono text-lg">
                                                    {formatCurrency(getYearValue(item.base, year))}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                ))}

                                <div 
                                    className="grid pt-4 border-t border-slate-300 dark:border-slate-600 items-center"
                                    style={{ 
                                        gridTemplateColumns: isMonthlyView 
                                            ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                            : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                    }}
                                >
                                    <span className="font-black uppercase">Net Cash from Financing</span>
                                    {isMonthlyView ? (
                                        <>
                                            {selectedMonths.map(m => (
                                                <span key={m} className="text-right font-mono text-base font-bold px-1">
                                                    {Math.round(calculateTotal(cashFlowData.financing, activeYear, [m])).toLocaleString()}
                                                </span>
                                            ))}
                                            <span className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                                {formatCurrency(calculateTotal(cashFlowData.financing, activeYear, selectedMonths))}
                                            </span>
                                        </>
                                    ) : (
                                        sortedSelectedYears.map(year => {
                                            const total = calculateTotal(cashFlowData.financing, year);
                                            return (
                                                <span key={year} className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                                    {formatCurrency(total)}
                                                </span>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* NET CHANGE IN CASH */}
                        <section>
                            <div 
                                className="grid pt-8 border-t-4 border-slate-900 dark:border-slate-100 items-center"
                                style={{ 
                                    gridTemplateColumns: isMonthlyView 
                                        ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                        : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                }}
                            >
                                <span className="text-lg font-black uppercase">Net Change in Cash</span>
                                {isMonthlyView ? (
                                    <>
                                        {selectedMonths.map(m => {
                                            const op = calculateTotal(cashFlowData.operating, activeYear, [m]);
                                            const inv = calculateTotal(cashFlowData.investing, activeYear, [m]);
                                            const fin = calculateTotal(cashFlowData.financing, activeYear, [m]);
                                            return (
                                                <span key={m} className="text-right font-mono text-base font-bold px-1">
                                                    {Math.round(op + inv + fin).toLocaleString()}
                                                </span>
                                            );
                                        })}
                                        <div className="text-right">
                                            <span className="text-xl font-black border-b-4 border-double border-slate-900 dark:border-slate-100 pb-1">
                                                {formatCurrency(
                                                    calculateTotal(cashFlowData.operating, activeYear, selectedMonths) +
                                                    calculateTotal(cashFlowData.investing, activeYear, selectedMonths) +
                                                    calculateTotal(cashFlowData.financing, activeYear, selectedMonths)
                                                )}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    sortedSelectedYears.map(year => {
                                        const op = calculateTotal(cashFlowData.operating, year);
                                        const inv = calculateTotal(cashFlowData.investing, year);
                                        const fin = calculateTotal(cashFlowData.financing, year);
                                        return (
                                            <div key={year} className="text-right">
                                                <span className="text-xl font-black border-b-4 border-double border-slate-900 dark:border-slate-100 pb-1">
                                                    {formatCurrency(op + inv + fin)}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashFlowDetailPage;

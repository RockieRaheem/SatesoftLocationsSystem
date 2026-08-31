import React, { useState, useRef, useEffect } from "react";
import { Theme, Shop, ActiveView } from "../types";
import Icon from "./Icon";

interface BalanceSheetDetailPageProps {
    theme: Theme;
    shop: Shop | null;
    onNavigate: (view: ActiveView) => void;
}

const MultiSelect: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  theme: Theme;
}> = ({ label, options, selected, onChange, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 ${
          isDark 
            ? 'bg-[#0F1115] border-[#EAB308] text-white hover:border-yellow-400 shadow-lg shadow-yellow-500/5' 
            : 'bg-white border-slate-200 text-slate-700 hover:border-yellow-500 shadow-sm'
        } w-full md:min-w-[180px]`}
      >
        <span className="truncate">
          {selected.length === 0 ? `Select ${label}` : 
           selected.length === options.length ? `All ${label}s` :
           `${selected.length} ${label}${selected.length > 1 ? 's' : ''} Selected`}
        </span>
        <Icon name={isOpen ? "chevron-up" : "chevron-down"} className={`h-4 w-4 ml-2 ${isDark ? 'text-white/70' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-2 w-full md:min-w-[220px] rounded-xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#0F1115] border-[#2D3139]' : 'bg-white border-slate-200'
        }`}>
          <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
            <button
              onClick={() => selected.length === options.length ? onChange([]) : onChange(options)}
              className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-2 transition-colors ${
                isDark 
                  ? 'text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/5' 
                  : 'text-yellow-600 hover:bg-yellow-50'
              }`}
            >
              {selected.length === options.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="space-y-1">
              {options.map(option => {
                const isSelected = selected.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-base rounded-lg transition-all duration-150 ${
                      isSelected
                        ? isDark 
                          ? 'bg-[#262116] text-[#EAB308] font-semibold' 
                          : 'bg-yellow-50 text-yellow-700 font-semibold'
                        : isDark
                          ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                          : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && <Icon name="check" className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BalanceSheetDetailPage: React.FC<BalanceSheetDetailPageProps> = ({ theme, shop, onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState("");
    
    const years = ['2024', '2023', '2022', '2021'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const baseData = {
        assets: {
            current: [
                { label: 'Cash and Cash Equivalents', base: 45000000 },
                { label: 'Accounts Receivable', base: 12000000 },
                { label: 'Inventory', base: 28000000 },
                { label: 'Prepaid Expenses', base: 3500000 },
            ],
            nonCurrent: [
                { label: 'Property, Plant and Equipment', base: 120000000 },
                { label: 'Intangible Assets', base: 15000000 },
                { label: 'Long-term Investments', base: 25000000 },
            ]
        },
        liabilities: {
            current: [
                { label: 'Accounts Payable', base: 18000000 },
                { label: 'Short-term Loans', base: 10000000 },
                { label: 'Accrued Liabilities', base: 5500000 },
            ],
            nonCurrent: [
                { label: 'Long-term Debt', base: 45000000 },
                { label: 'Deferred Tax Liabilities', base: 8000000 },
            ]
        },
        equity: [
            { label: 'Owner\'s Capital', base: 100000000 },
            { label: 'Retained Earnings', base: 59000000 },
        ]
    };

    const [selectedYears, setSelectedYears] = useState<string[]>(['2023']);
    const [selectedMonths, setSelectedMonths] = useState<string[]>(months);

    useEffect(() => {
        if (selectedYears.length === 1) {
            setSelectedMonths(months);
        }
    }, [selectedYears.length]);

    if (!shop) return <div className="p-8 text-center">Loading shop data...</div>;

    const sortedSelectedYears = [...selectedYears].sort((a, b) => parseInt(b) - parseInt(a));
    const isMonthlyView = selectedYears.length === 1;
    const activeYear = sortedSelectedYears[0];

    const getYearValue = (base: number, year: string) => {
        const yearDiff = parseInt(year) - 2023;
        const growthFactor = 1 + (yearDiff * 0.08); 
        return base * growthFactor;
    };

    const getMonthValue = (base: number, year: string, monthIndex: number) => {
        const yearVal = getYearValue(base, year);
        // Deterministic seasonal factor based on month index
        const seasonalFactor = 0.85 + (Math.sin(monthIndex * 0.5) * 0.15);
        return (yearVal / 12) * seasonalFactor;
    };

    const calculateTotal = (items: { base: number }[], year: string, monthsToInclude?: string[]) => {
        if (monthsToInclude) {
            return items.reduce((sum, item) => {
                return sum + monthsToInclude.reduce((mSum, m) => {
                    return mSum + getMonthValue(item.base, year, months.indexOf(m));
                }, 0);
            }, 0);
        }
        return items.reduce((sum, item) => sum + getYearValue(item.base, year), 0);
    };

    const formatCurrency = (value: number) => {
        return `UGX ${Math.round(value).toLocaleString()}`;
    };

    const lastMonth = selectedMonths.length > 0 ? selectedMonths[selectedMonths.length - 1] : 'December';

    return (
        <div className="space-y-6 max-w-full px-1 md:px-2 mx-auto">
            <header className={`flex flex-col md:flex-row justify-between items-start md:items-center p-3 md:p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div>
                    <button onClick={() => onNavigate('finances-balance-sheet')} className={`flex items-center text-sm font-medium mb-2 transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}`}>
                        <Icon name="chevron-left" className="h-4 w-4 mr-1" />
                        Back to Balance Sheets
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight uppercase">Balance Sheet</h1>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{shop.name} • Financial Position</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-6 md:mt-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters:</span>
                        <MultiSelect label="Year" options={years} selected={selectedYears} onChange={setSelectedYears} theme={theme} />
                        <MultiSelect label="Month" options={months} selected={selectedMonths} onChange={setSelectedMonths} theme={theme} />
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
                    <button className={`px-4 py-2 text-sm font-medium rounded border flex items-center gap-2 ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Icon name="download" className="h-4 w-4" />
                        Export PDF
                    </button>
                </div>
            </header>

            <div className={`p-2 md:p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-lg font-sans overflow-x-auto custom-scrollbar`}>
                <div className="text-center mb-12 border-b-2 border-slate-200 dark:border-slate-700 pb-6 min-w-[1000px]">
                    <h2 className="text-3xl font-black tracking-widest uppercase mb-2">
                        {sortedSelectedYears.length > 1 ? 'Comparative Balance Sheet' : 'Balance Sheet'}
                    </h2>
                    <p className="text-lg font-bold uppercase">{shop.name}</p>
                    <p className="text-sm opacity-70">
                        As of {lastMonth} {sortedSelectedYears[0] || '2024'}
                    </p>
                </div>

                <div className="space-y-12 min-w-[1200px]">
                    {/* ASSETS SECTION */}
                    <section>
                        <div 
                            className="grid border-b-2 border-slate-900 dark:border-slate-100 mb-4 pb-1"
                            style={{ 
                                gridTemplateColumns: isMonthlyView 
                                    ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                    : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                            }}
                        >
                            <h3 className="text-xl font-black uppercase">Assets</h3>
                            {isMonthlyView ? (
                                <>
                                    {selectedMonths.map(m => (
                                        <div key={m} className="text-right text-[10px] font-bold uppercase self-end pb-1 px-1">{m.substring(0, 3)}</div>
                                    ))}
                                    <div className="text-right text-xs font-bold uppercase self-end pb-1 text-yellow-500">Total</div>
                                </>
                            ) : (
                                sortedSelectedYears.map(year => (
                                    <div key={year} className="text-right text-xs font-bold uppercase self-end pb-1">{year}</div>
                                ))
                            )}
                        </div>
                        
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-bold mb-3 italic">Current Assets:</h4>
                                <div className="space-y-3">
                                    {baseData.assets.current.map((item, idx) => (
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
                                                    <span className="text-right font-mono font-bold text-yellow-500/80 text-base">
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
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold mb-3 italic">Non-Current Assets:</h4>
                                <div className="space-y-3">
                                    {baseData.assets.nonCurrent.map((item, idx) => (
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
                                                    <span className="text-right font-mono font-bold text-yellow-500/80 text-base">
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
                                </div>
                            </div>

                            <div 
                                className="grid pt-4 border-t border-slate-300 dark:border-slate-600 items-center"
                                style={{ 
                                    gridTemplateColumns: isMonthlyView 
                                        ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                        : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                }}
                            >
                                <span className="text-base font-black uppercase">Total Assets</span>
                                {isMonthlyView ? (
                                    <>
                                        {selectedMonths.map(m => (
                                            <span key={m} className="text-right font-mono text-base font-bold px-1">
                                                {Math.round(calculateTotal([...baseData.assets.current, ...baseData.assets.nonCurrent], activeYear, [m])).toLocaleString()}
                                            </span>
                                        ))}
                                        <div className="text-right">
                                            <span className="text-xl font-black border-b-4 border-double border-slate-900 dark:border-slate-100 pb-1">
                                                {formatCurrency(calculateTotal([...baseData.assets.current, ...baseData.assets.nonCurrent], activeYear, selectedMonths))}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    sortedSelectedYears.map(year => {
                                        const total = calculateTotal([...baseData.assets.current, ...baseData.assets.nonCurrent], year);
                                        return (
                                            <div key={year} className="text-right">
                                                <span className="text-xl font-black border-b-4 border-double border-slate-900 dark:border-slate-100 pb-1">
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </section>

                    {/* LIABILITIES SECTION */}
                    <section>
                        <div 
                            className="grid border-b-2 border-slate-900 dark:border-slate-100 mb-4 pb-1"
                            style={{ 
                                gridTemplateColumns: isMonthlyView 
                                    ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                    : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                            }}
                        >
                            <h3 className="text-xl font-black uppercase">Liabilities</h3>
                            {isMonthlyView ? (
                                <>
                                    {selectedMonths.map(m => (
                                        <div key={m} className="text-right text-[10px] font-bold uppercase self-end pb-1 px-1">{m.substring(0, 3)}</div>
                                    ))}
                                    <div className="text-right text-xs font-bold uppercase self-end pb-1 text-yellow-500">Total</div>
                                </>
                            ) : (
                                sortedSelectedYears.map(year => (
                                    <div key={year} className="text-right text-xs font-bold uppercase self-end pb-1">{year}</div>
                                ))
                            )}
                        </div>
                        
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-bold mb-3 italic">Current Liabilities:</h4>
                                <div className="space-y-3">
                                    {baseData.liabilities.current.map((item, idx) => (
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
                                                    <span className="text-right font-mono font-bold text-yellow-500/80 text-base">
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
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold mb-3 italic">Non-Current Liabilities:</h4>
                                <div className="space-y-3">
                                    {baseData.liabilities.nonCurrent.map((item, idx) => (
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
                                                    <span className="text-right font-mono font-bold text-yellow-500/80 text-base">
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
                                </div>
                            </div>

                            <div 
                                className="grid pt-4 border-t border-slate-300 dark:border-slate-600 items-center"
                                style={{ 
                                    gridTemplateColumns: isMonthlyView 
                                        ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                        : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                }}
                            >
                                <span className="font-black uppercase">Total Liabilities</span>
                                {isMonthlyView ? (
                                    <>
                                        {selectedMonths.map(m => (
                                            <span key={m} className="text-right font-mono text-base font-bold px-1">
                                                {Math.round(calculateTotal([...baseData.liabilities.current, ...baseData.liabilities.nonCurrent], activeYear, [m])).toLocaleString()}
                                            </span>
                                        ))}
                                        <span className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                            {formatCurrency(calculateTotal([...baseData.liabilities.current, ...baseData.liabilities.nonCurrent], activeYear, selectedMonths))}
                                        </span>
                                    </>
                                ) : (
                                    sortedSelectedYears.map(year => {
                                        const total = calculateTotal([...baseData.liabilities.current, ...baseData.liabilities.nonCurrent], year);
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

                    {/* OWNER'S EQUITY SECTION */}
                    <section>
                        <div 
                            className="grid border-b-2 border-slate-900 dark:border-slate-100 mb-4 pb-1"
                            style={{ 
                                gridTemplateColumns: isMonthlyView 
                                    ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                    : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                            }}
                        >
                            <h3 className="text-xl font-black uppercase">Owner's Equity</h3>
                            {isMonthlyView ? (
                                <>
                                    {selectedMonths.map(m => (
                                        <div key={m} className="text-right text-[10px] font-bold uppercase self-end pb-1 px-1">{m.substring(0, 3)}</div>
                                    ))}
                                    <div className="text-right text-xs font-bold uppercase self-end pb-1 text-yellow-500">Total</div>
                                </>
                            ) : (
                                sortedSelectedYears.map(year => (
                                    <div key={year} className="text-right text-xs font-bold uppercase self-end pb-1">{year}</div>
                                ))
                            )}
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                {baseData.equity.map((item, idx) => (
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
                                                <span className="text-right font-mono font-bold text-yellow-500/80 text-base">
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
                            </div>

                            <div 
                                className="grid pt-4 border-t border-slate-300 dark:border-slate-600 items-center"
                                style={{ 
                                    gridTemplateColumns: isMonthlyView 
                                        ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                        : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                                }}
                            >
                                <span className="font-black uppercase">Total Equity</span>
                                {isMonthlyView ? (
                                    <>
                                        {selectedMonths.map(m => (
                                            <span key={m} className="text-right font-mono text-base font-bold px-1">
                                                {Math.round(calculateTotal(baseData.equity, activeYear, [m])).toLocaleString()}
                                            </span>
                                        ))}
                                        <span key={activeYear} className="text-right font-black border-b-2 border-slate-900 dark:border-slate-100 pb-1 text-xl">
                                            {formatCurrency(calculateTotal(baseData.equity, activeYear, selectedMonths))}
                                        </span>
                                    </>
                                ) : (
                                    sortedSelectedYears.map(year => {
                                        const total = calculateTotal(baseData.equity, year);
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

                    {/* FINAL TOTAL */}
                    <div className="pt-10 border-t-4 border-slate-900 dark:border-slate-100">
                        <div 
                            className="grid items-center"
                            style={{ 
                                gridTemplateColumns: isMonthlyView 
                                    ? `1.5fr repeat(${selectedMonths.length}, 1fr) 1.2fr` 
                                    : `1.5fr repeat(${sortedSelectedYears.length}, 1.2fr)` 
                            }}
                        >
                            <span className="text-base font-black uppercase">Total Liabilities & Owner's Equity</span>
                            {isMonthlyView ? (
                                <>
                                    {selectedMonths.map(m => (
                                        <span key={m} className="text-right font-mono text-base font-bold px-1">
                                            {Math.round(
                                                calculateTotal([...baseData.liabilities.current, ...baseData.liabilities.nonCurrent], activeYear, [m]) + 
                                                calculateTotal(baseData.equity, activeYear, [m])
                                            ).toLocaleString()}
                                        </span>
                                    ))}
                                    <div className="text-right">
                                        <span className="text-xl font-black border-b-4 border-double border-slate-900 dark:border-slate-100 pb-1">
                                            {formatCurrency(
                                                calculateTotal([...baseData.liabilities.current, ...baseData.liabilities.nonCurrent], activeYear, selectedMonths) + 
                                                calculateTotal(baseData.equity, activeYear, selectedMonths)
                                            )}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                sortedSelectedYears.map(year => {
                                    const totalLiab = calculateTotal([...baseData.liabilities.current, ...baseData.liabilities.nonCurrent], year);
                                    const totalEq = calculateTotal(baseData.equity, year);
                                    return (
                                        <div key={year} className="text-right">
                                            <span className="text-xl font-black border-b-4 border-double border-slate-900 dark:border-slate-100 pb-1">
                                                {formatCurrency(totalLiab + totalEq)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center text-xs opacity-50 italic min-w-[600px]">
                    This balance sheet is a representation of the financial position of {shop.name} as of the date indicated.
                </div>
            </div>
        </div>
    );
};

export default BalanceSheetDetailPage;

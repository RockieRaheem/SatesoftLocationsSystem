import React, { useState, useRef, useEffect } from "react";
import { Theme, Shop, ActiveView } from "../types";
import Icon from "./Icon";
import KPIDetailModal from "./KPIDetailModal";

interface IncomeStatementDetailPageProps {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
          theme === 'dark' 
            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-yellow-500/50' 
            : 'bg-white border-slate-200 text-slate-600 hover:border-yellow-500/50 shadow-sm'
        } w-full md:w-40`}
      >
        <span className="truncate">
          {selected.length === 0 ? `Select ${label}` : 
           selected.length === options.length ? `All ${label}s` :
           `${selected.length} ${label}${selected.length > 1 ? 's' : ''}`}
        </span>
        <Icon name="chevron-down" className={`h-3 w-3 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full md:w-48 rounded-md shadow-lg border max-h-60 overflow-y-auto ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-2 space-y-1">
            <button
              onClick={() => selected.length === options.length ? onChange([]) : onChange(options)}
              className={`w-full text-left px-2 py-1.5 text-xs font-bold rounded hover:bg-opacity-10 ${
                theme === 'dark' ? 'text-yellow-400 hover:bg-yellow-400' : 'text-yellow-600 hover:bg-yellow-600'
              }`}
            >
              {selected.length === options.length ? 'Deselect All' : 'Select All'}
            </button>
            {options.map(option => (
              <label
                key={option}
                className={`flex items-center px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                  theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-2 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const IncomeStatementDetailPage: React.FC<IncomeStatementDetailPageProps> = ({ theme, shop, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const years = ['2024', '2023', '2022', '2021'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const [selectedYears, setSelectedYears] = useState<string[]>(['2023', '2022']);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(months);

  const sortedSelectedYears = [...selectedYears].sort((a, b) => parseInt(b) - parseInt(a));
  const monthFactor = selectedMonths.length / 12;

  // Base values for line items (representing a full year 2023)
  const baseData = [
    { label: 'Revenue', type: 'header' },
    { label: 'Sales Revenue', base: 56000, type: 'item' },
    { label: 'Service Revenue', base: 3200, type: 'item' },
    { label: 'Other Revenue', base: 1000, type: 'item' },
    { label: 'Total Revenue', type: 'subtotal', isTotalRevenue: true },
    { label: 'Cost of Sales', type: 'header' },
    { label: 'Opening Stock', base: 12000, type: 'item' },
    { label: 'Purchases', base: 25000, type: 'item' },
    { label: 'Closing Stock', base: -14000, type: 'item' },
    { label: 'Total Cost of Sales', type: 'subtotal', isTotalCOGS: true },
    { label: 'Gross Profit', type: 'subtotal', highlight: true, isGrossProfit: true },
    { label: 'Operating Expenses', type: 'header' },
    { label: 'Advertising', base: 600, type: 'item' },
    { label: 'Delivery/Freight Expense', base: 1500, type: 'item' },
    { label: 'Depreciation', base: 8000, type: 'item' },
    { label: 'Insurance', base: 550, type: 'item' },
    { label: 'Interest', base: 2300, type: 'item' },
    { label: 'Office Supplies', base: 1300, type: 'item' },
    { label: 'Rent/Lease', base: 5800, type: 'item' },
    { label: 'Maintenance and Repairs', base: 200, type: 'item' },
    { label: 'Travel', base: 100, type: 'item' },
    { label: 'Wages', base: 10000, type: 'item' },
    { label: 'Utilities/Telephone Expenses', base: 800, type: 'item' },
    { label: 'Other Expenses', base: 230, type: 'item' },
    { label: 'Total Operating Expenses', type: 'subtotal', isTotalExpenses: true },
    { label: 'Operating Income', type: 'subtotal', highlight: true, isOperatingIncome: true },
    { label: 'Other Income/Expenses', type: 'header' },
    { label: 'Interest Income', base: 150, type: 'item' },
    { label: 'Gain/Loss on Sale of Assets', base: 500, type: 'item' },
    { label: 'Income before tax', type: 'subtotal', isIBT: true },
    { label: 'Income tax expense', base: 1300, type: 'item' },
    { label: 'Net Profit (Loss)', type: 'final', isNetProfit: true }
  ];

  const getYearValue = (base: number, year: string) => {
    const yearDiff = parseInt(year) - 2023;
    const growthFactor = 1 + (yearDiff * 0.1); // 10% growth per year
    return base * growthFactor * monthFactor;
  };

  const calculateRowValues = (row: any, year: string) => {
    if (row.base !== undefined) return getYearValue(row.base, year);
    
    // Calculate subtotals dynamically
    if (row.isTotalRevenue) {
      return getYearValue(56000 + 3200 + 1000, year);
    }
    if (row.isTotalCOGS) {
      return getYearValue(12000 + 25000 - 14000, year);
    }
    if (row.isGrossProfit) {
      const rev = getYearValue(60200, year);
      const cogs = getYearValue(23000, year);
      return rev - cogs;
    }
    if (row.isTotalExpenses) {
      return getYearValue(31380, year);
    }
    if (row.isOperatingIncome) {
      const gp = getYearValue(37200, year);
      const exp = getYearValue(31380, year);
      return gp - exp;
    }
    if (row.isIBT) {
      const oi = getYearValue(5820, year);
      const other = getYearValue(150 + 500, year);
      return oi + other;
    }
    if (row.isNetProfit) {
      const ibt = getYearValue(6470, year);
      const tax = getYearValue(1300, year);
      return ibt - tax;
    }
    return 0;
  };

  // Detailed KPI data for drill-down
  const kpiDetails = {
    revenue: { 
      title: "Total Revenue", 
      value: "UGX 60,200.00", 
      historicalData: [ { month: "Jul", value: 158.5 }, { month: "Aug", value: 333.0 }, { month: "Sep", value: 618.5 }, { month: "Oct", value: 714.8 }, { month: "Nov", value: 920.8 }, { month: "Dec", value: 1296.3 }], 
      breakdown: [ 
        { category: "Sales Revenue", amount: 56000.0, percentage: 93, color: theme === 'dark' ? '#3b82f6' : '#60a5fa' }, 
        { category: "Service Revenue", amount: 3200.0, percentage: 5, color: theme === 'dark' ? '#16a34a' : '#34d399' }, 
        { category: "Other Revenue", amount: 1000.0, percentage: 2, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
      ], 
      insights: ["Revenue grew 26.5% compared to last period", "Sales Revenue remains the primary driver at 93%", "Service revenue showing steady 18.5% growth", "Other revenue remained flat during this period"] 
    },
  };

  const commonInputClasses = theme === 'dark' ? 'bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500';

  if (!shop) return <p>Loading shop data...</p>

  return (
    <div className="space-y-6">
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div>
          <button onClick={() => onNavigate('finances-income-statement')} className={`flex items-center text-sm font-medium mb-2 transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}`}>
            <Icon name="chevron-left" className="h-4 w-4 mr-1" />
            Back to Financial Reports
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Income Statement</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{shop.name} • Comparative Analysis</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-6 md:mt-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters:</span>
            <MultiSelect label="Year" options={years} selected={selectedYears} onChange={setSelectedYears} theme={theme} />
            <MultiSelect label="Month" options={months} selected={selectedMonths} onChange={setSelectedMonths} theme={theme} />
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
          <div className="relative w-full md:w-64">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search line items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 w-full rounded-lg shadow-sm sm:text-sm px-3 py-2 border transition-all ${commonInputClasses} focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none`}
            />
          </div>
        </div>
      </header>

      <div className={`rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden shadow-sm`}>
        <div className="p-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">{shop.name}</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Date: 1 March 2023</p>
            </div>
            <div className="flex gap-2">
              <button className={`px-4 py-2 text-sm font-medium rounded border flex items-center gap-2 ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <Icon name="download" className="h-4 w-4" />
                Export PDF
              </button>
              <button className={`px-4 py-2 text-sm font-medium rounded border flex items-center gap-2 ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <Icon name="download" className="h-4 w-4" />
                Export Excel
              </button>
            </div>
          </div>
          
          <div className={`inline-block px-4 py-2 rounded-t-lg font-bold text-white bg-emerald-900/90`}>
            Profit & Loss Statement
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className={theme === 'dark' ? 'bg-[#1e293b]' : 'bg-slate-50'}>
                <th rowSpan={2} className="px-5 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 sticky left-0 z-10 bg-inherit min-w-[180px]">Line Item</th>
                {sortedSelectedYears.map((year, yIdx) => (
                  <th key={year} colSpan={2} className={`px-1 py-3 text-center text-sm font-bold border-b border-slate-200 dark:border-slate-700 ${yIdx === sortedSelectedYears.length - 1 ? 'pr-6' : ''}`}>
                    <div className="flex flex-col">
                      <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>{year}</span>
                      <span className="text-[9px] font-normal opacity-70 italic">{yIdx === 0 ? 'Current' : 'Prior'} Period</span>
                    </div>
                  </th>
                ))}
              </tr>
              <tr className={theme === 'dark' ? 'bg-[#162031]' : 'bg-slate-100/30'}>
                {sortedSelectedYears.map((year, yIdx) => (
                  <React.Fragment key={`${year}-sub`}>
                    <th className="px-1 py-1.5 text-right text-[9px] font-bold text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 w-24">Amount</th>
                    <th className={`px-1 py-1.5 text-right text-[9px] font-bold text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 w-16 ${yIdx === sortedSelectedYears.length - 1 ? 'pr-6' : ''}`}>% Rev</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {baseData.map((row, idx) => {
                const isHeader = row.type === 'header';
                const isSubtotal = row.type === 'subtotal';
                const isFinal = row.type === 'final';
                
                if (isHeader) {
                  return (
                    <tr key={idx} className={theme === 'dark' ? 'bg-[#1b2537]' : 'bg-slate-100/50'}>
                      <td colSpan={1 + sortedSelectedYears.length * 2} className="px-5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide sticky left-0 z-10 bg-inherit">
                        {row.label}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={idx} className={`
                    ${isSubtotal ? 'font-bold' : ''} 
                    ${isFinal ? (theme === 'dark' ? 'bg-[#2d2a1a]' : 'bg-yellow-50') + ' font-bold border-y-2 border-yellow-500/20' : ''}
                    ${row.highlight ? (theme === 'dark' ? 'bg-[#062d1f]' : 'bg-emerald-50') + ' font-bold border-y border-emerald-500/10' : ''}
                    hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                  `}>
                    <td className={`px-6 py-2 text-sm sticky left-0 z-10 bg-inherit ${isSubtotal || isFinal ? 'font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                      {row.label}
                    </td>
                    {sortedSelectedYears.map((year, yIdx) => {
                      const val = calculateRowValues(row, year);
                      const totalRev = calculateRowValues({ isTotalRevenue: true }, year);
                      const percentage = totalRev !== 0 ? ((val / totalRev) * 100).toFixed(1) : '-';
                      
                      return (
                        <React.Fragment key={`${year}-${idx}`}>
                          <td className={`px-1 py-2 text-sm text-right ${isSubtotal || isFinal ? 'font-bold' : ''}`}>
                            {val === 0 ? '-' : (val < 0 ? `(${Math.abs(Math.round(val)).toLocaleString()})` : Math.round(val).toLocaleString())}
                          </td>
                          <td className={`px-1 py-2 text-[10px] text-right text-slate-400 font-mono italic ${yIdx === sortedSelectedYears.length - 1 ? 'pr-6' : ''}`}>
                            {val === 0 ? '-' : `${percentage}%`}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="text-lg font-bold mb-4">Revenue Breakdown</h3>
          <div className="flex flex-col gap-4">
            {kpiDetails.revenue.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold">{item.amount.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="text-lg font-bold mb-4">Key Insights</h3>
          <ul className="space-y-3">
            {kpiDetails.revenue.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></div>
                <p className="text-sm text-slate-500 leading-relaxed">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <KPIDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} kpiData={selectedKPI} theme={theme} />
    </div>
  );
};

export default IncomeStatementDetailPage;

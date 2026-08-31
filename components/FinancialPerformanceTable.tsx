import React from 'react';
import { Theme, Shop } from '../types';

interface FinancialPerformanceTableProps {
    theme: Theme;
    financials?: Shop['financials'];
}

type Status = 'Good' | 'Warning' | 'Poor' | 'N/A';

const financialData = [
    {
        statement: 'INCOME STATEMENT',
        color: { light: 'bg-green-100 text-green-800', dark: 'bg-green-900/50 text-green-300' },
        metrics: [
            { metric: 'Gross Margin', equation: { num: 'Gross Profit', den: 'Revenue' }, threshold: '>40%' },
            { metric: 'SG&A Margin', equation: { num: 'SG&A', den: 'Gross Profit' }, threshold: '<30%' },
            { metric: 'R&D Margin', equation: { num: 'R&D', den: 'Gross Profit' }, threshold: '<30%' },
            { metric: 'Depreciation Margin', equation: { num: 'Depreciation', den: 'Gross Profit' }, threshold: '<10%' },
            { metric: 'Interest Margin', equation: { num: 'Interest Expense', den: 'Operating Income' }, threshold: '<15%' },
            { metric: 'Tax Margin', equation: { num: 'Taxes', den: 'Pre-Tax Income' }, threshold: 'Corporate Tax Rate' },
            { metric: 'Net Income Margin', equation: { num: 'Net Income', den: 'Revenue' }, threshold: '>20%' },
            { metric: 'EPS Growth', equation: { num: 'Year 2 EPS', den: 'Year 1 EPS' }, threshold: 'Positive & Growing' },
        ],
    },
    {
        statement: 'BALANCE SHEET',
        color: { light: 'bg-yellow-100 text-yellow-800', dark: 'bg-yellow-900/50 text-yellow-300' },
        metrics: [
            { metric: 'Cash & Debt', equation: 'Cash > Debt', threshold: 'Cash > Debt' },
            { metric: 'Adjusted Debt to Equity', equation: { num: 'Total Liabilities', den: 'Equity + Treasury' }, threshold: 'Below 0.80' },
            { metric: 'Preferred Stock', equation: 'NONE', threshold: 'NONE' },
            { metric: 'Retained Earnings', equation: { num: 'Year 2 Retained', den: 'Year 1 Retained' }, threshold: 'Consistent Growth' },
            { metric: 'Treasury Stock', equation: 'Treasury Stock > 0', threshold: 'Exists' },
        ],
    },
    {
        statement: 'CASH FLOW STATEMENT',
        color: { light: 'bg-blue-100 text-blue-800', dark: 'bg-blue-900/50 text-blue-300' },
        metrics: [
            { metric: 'Capex Margin', equation: { num: 'Capex', den: 'Net income' }, threshold: '<25%' },
        ],
    },
];

const EquationCell: React.FC<{ equation: any, theme: Theme }> = ({ equation, theme }) => {
    if (typeof equation === 'string') {
        return <span>{equation}</span>;
    }
    return (
        <div className="inline-flex flex-col text-center">
            <span>{equation.num}</span>
            <hr className={`w-full my-0.5 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-400'}`} />
            <span>{equation.den}</span>
        </div>
    );
};

const StatusBadge: React.FC<{ status: Status, theme: Theme }> = ({ status, theme }) => {
  const styles: Record<Status, string> = {
    Good: theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800',
    Warning: theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
    Poor: theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800',
    'N/A': theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${styles[status]}`}>{status}</span>;
};

const FinancialPerformanceTable: React.FC<FinancialPerformanceTableProps> = ({ theme, financials }) => {
    const headerBg = theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100';
    const cellClasses = `px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`;
    const headerCellClasses = `px-4 py-3 font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`;
    
    const calculateRatioAndStatus = (metric: string): { formatted: string, status: Status } => {
        if (!financials) return { formatted: '-', status: 'N/A' };
        
        const { incomeStatement: is, balanceSheet: bs, cashFlowStatement: cfs } = financials;
        
        let value: number | boolean | null = null;
        let status: Status = 'N/A';
        let formatted = '-';

        try {
            // Income Statement
            if (is) {
                if (metric === 'Gross Margin') { value = is.revenue > 0 ? (is.grossProfit / is.revenue) * 100 : 0; status = value > 40 ? 'Good' : value > 30 ? 'Warning' : 'Poor'; formatted = `${value.toFixed(2)}%`; }
                else if (metric === 'SG&A Margin') { value = is.grossProfit > 0 ? (is.sgAndA / is.grossProfit) * 100 : 0; status = value < 30 ? 'Good' : value < 35 ? 'Warning' : 'Poor'; formatted = `${value.toFixed(2)}%`;}
                else if (metric === 'R&D Margin') { value = is.grossProfit > 0 ? (is.rd / is.grossProfit) * 100 : 0; status = value < 30 ? 'Good' : value < 35 ? 'Warning' : 'Poor'; formatted = `${value.toFixed(2)}%`; }
                else if (metric === 'Depreciation Margin') { value = is.grossProfit > 0 ? (is.depreciation / is.grossProfit) * 100 : 0; status = value < 10 ? 'Good' : value < 15 ? 'Warning' : 'Poor'; formatted = `${value.toFixed(2)}%`; }
                else if (metric === 'Interest Margin') { value = is.operatingIncome > 0 ? (is.interestExpense / is.operatingIncome) * 100 : 0; status = value < 15 ? 'Good' : value < 20 ? 'Warning' : 'Poor'; formatted = `${value.toFixed(2)}%`; }
                else if (metric === 'Tax Margin') { value = is.preTaxIncome > 0 ? (is.taxes / is.preTaxIncome) * 100 : 0; status = 'N/A'; formatted = `${value.toFixed(2)}%`; }
                else if (metric === 'Net Income Margin') { value = is.revenue > 0 ? (is.netIncome / is.revenue) * 100 : 0; status = value > 20 ? 'Good' : value > 15 ? 'Warning' : 'Poor'; formatted = `${value.toFixed(2)}%`; }
                else if (metric === 'EPS Growth') { value = is.year1EPS > 0 ? ((is.year2EPS / is.year1EPS) - 1) * 100 : 0; status = value > 0 ? 'Good' : 'Poor'; formatted = `${value.toFixed(2)}%`; }
            }
            
            // Balance Sheet
            if (bs) {
                if (metric === 'Cash & Debt') { value = bs.cashAndEquivalents > bs.totalLiabilities; status = value ? 'Good' : 'Poor'; formatted = value ? 'Cash > Debt' : 'Debt > Cash'; }
                else if (metric === 'Adjusted Debt to Equity') { const denominator = bs.shareholderEquity + bs.treasuryStock; value = denominator > 0 ? bs.totalLiabilities / denominator : Infinity; status = value < 0.8 ? 'Good' : value < 1.0 ? 'Warning' : 'Poor'; formatted = value.toFixed(2); }
                else if (metric === 'Preferred Stock') { value = bs.preferredStock === 0; status = value ? 'Good' : 'Poor'; formatted = value ? 'None' : 'Exists'; }
                else if (metric === 'Retained Earnings') { value = bs.retainedEarningsY2 > bs.retainedEarningsY1; status = value ? 'Good' : 'Poor'; formatted = value ? 'Growing' : 'Stagnant/Declining'; }
                else if (metric === 'Treasury Stock') { value = bs.treasuryStock > 0; status = value ? 'Good' : 'Poor'; formatted = value ? 'Yes' : 'No'; }
            }

            // Cash Flow Statement
            if (cfs && is) {
                if (metric === 'Capex Margin') { value = is.netIncome > 0 ? (cfs.capex / is.netIncome) * 100 : 0; status = value < 25 ? 'Good' : value < 50 ? 'Warning' : 'Poor'; formatted = `${value.toFixed(2)}%`; }
            }

        } catch {
            formatted = 'Error';
            status = 'N/A';
        }

        return { formatted, status };
    }

    return (
        <div className={`w-full overflow-x-auto border rounded-lg ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <table className="min-w-full text-sm">
                <thead className={headerBg}>
                    <tr>
                        <th className={`${headerCellClasses} w-48 text-left`}>FINANCIAL STATEMENT</th>
                        <th className={`${headerCellClasses} text-left`}>METRIC</th>
                        <th className={`${headerCellClasses} text-center`}>EQUATION</th>
                        <th className={`${headerCellClasses} text-left`}>THRESHOLD</th>
                        <th className={`${headerCellClasses} text-right`}>ACTUAL</th>
                        <th className={`${headerCellClasses} text-center`}>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {financialData.map((section) => (
                        <React.Fragment key={section.statement}>
                            {section.metrics.map((item, itemIndex) => {
                                const { formatted, status } = calculateRatioAndStatus(item.metric);
                                return (
                                <tr key={item.metric} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                    {itemIndex === 0 && (
                                        <td
                                            rowSpan={section.metrics.length}
                                            className={`${cellClasses} font-bold text-center align-middle ${theme === 'dark' ? section.color.dark : section.color.light}`}
                                        >
                                            {section.statement}
                                        </td>
                                    )}
                                    <td className={`${cellClasses} font-medium`}>{item.metric}</td>
                                    <td className={`${cellClasses} text-center`}>
                                        <EquationCell equation={item.equation} theme={theme} />
                                    </td>
                                    <td className={`${cellClasses} font-medium`}>{item.threshold}</td>
                                    <td className={`${cellClasses} font-semibold text-right`}>{formatted}</td>
                                    <td className={`${cellClasses} text-center`}><StatusBadge status={status} theme={theme} /></td>
                                </tr>
                            )})}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FinancialPerformanceTable;
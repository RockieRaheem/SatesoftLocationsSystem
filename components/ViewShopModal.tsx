
import React, { useState } from 'react';
import { Theme, Shop, Country, ShopUser, SuperUser } from '../types';
import Icon from './Icon';

interface ViewShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  theme: Theme;
  countries: Country[];
  users: (ShopUser | SuperUser)[];
}

const ViewShopModal: React.FC<ViewShopModalProps> = ({ isOpen, onClose, shop, theme, countries, users }) => {
    const [step, setStep] = useState(1);
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen && !isClosing || !shop) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setStep(1);
        }, 300);
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1 shop={shop} theme={theme} countries={countries} users={users} />;
            case 2: return <Step2 shop={shop} theme={theme} />;
            case 3: return <Step3 shop={shop} theme={theme} />;
            default: return null;
        }
    };

    const Stepper = () => {
        const steps = ["Details & Registration", "Income Statement", "Settings"];
        return (
            <div className="flex items-center justify-center px-6">
                {steps.map((label, index) => (
                    <React.Fragment key={label}>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step > index ? 'bg-[#FFB800] text-[#0F1115]' : step === index + 1 ? 'bg-[#FFB800] text-[#0F1115]' : (theme === 'dark' ? 'bg-white/10 text-gray-500' : 'bg-slate-200 text-slate-500')}`}>
                                {step > index ? <Icon name="check-circle" className="w-5 h-5" /> : index + 1}
                            </div>
                            <span className={`ml-2 text-[11px] font-bold uppercase tracking-wider ${step >= index + 1 ? (theme === 'dark' ? 'text-white' : 'text-slate-800') : (theme === 'dark' ? 'text-gray-500' : 'text-slate-400')}`}>{label}</span>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-auto border-t-2 mx-4 ${step > index + 1 ? 'border-[#FFB800]' : (theme === 'dark' ? 'border-white/5' : 'border-slate-200')}`}></div>}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-[#15181C] border border-white/10' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                    <div className="flex flex-col">
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Shop Details: {shop.name}</h2>
                        <p className="text-[10px] text-gray-500 uppercase">View shop configuration and status</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <Stepper />
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                    {renderStep()}
                </div>

                <div className={`flex justify-between items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-white/5 bg-black/50' : 'border-slate-100'}`}>
                    <button onClick={handleBack} disabled={step === 1} className={`px-6 py-2 text-sm font-medium border rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${theme === 'dark' ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        Back
                    </button>
                    {step < 3 ? (
                        <button onClick={handleNext} className="ml-3 px-6 py-2 text-sm font-bold text-[#0F1115] bg-[#FFB800] border border-transparent rounded-md shadow-sm hover:bg-[#FFB800]/90 transition-colors">
                            Next
                        </button>
                    ) : (
                        <button onClick={handleClose} className={`ml-3 px-6 py-2 text-sm font-bold text-white bg-slate-600 border border-transparent rounded-md shadow-sm hover:bg-slate-700 transition-colors`}>
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Step1 = ({ shop, theme, countries, users }: { shop: Shop, theme: Theme, countries: Country[], users: (ShopUser | SuperUser)[] }) => {
    const country = countries.find(c => c.countryCode === shop.countryCode);
    const owner = users.find(u => u.id === shop.ownerId);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Shop Name" value={shop.name} theme={theme} />
                <InfoItem label="Owner" value={owner?.name || 'Unknown'} theme={theme} />
                <InfoItem label="Category" value={shop.category} theme={theme} />
                <InfoItem label="Status" value={shop.status} theme={theme} status={shop.status} />
            </div>

            <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Location & Admin Levels</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InfoItem label="Country" value={country?.name || shop.countryCode} theme={theme} />
                    {shop.adminLevels.find(al => al.level === 1) && (() => {
                        const al = shop.adminLevels.find(l => l.level === 1)!;
                        const label = country?.adminLevelNames?.find(n => n.level === 1)?.name || 'Region';
                        return <InfoItem label={label} value={al.name} theme={theme} />;
                    })()}
                </div>

                {(shop.adminLevels.find(al => al.level === 2) || shop.adminLevels.find(al => al.level === 3)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {shop.adminLevels.find(al => al.level === 2) && (() => {
                            const al = shop.adminLevels.find(l => l.level === 2)!;
                            const label = country?.adminLevelNames?.find(n => n.level === 2)?.name || 'District';
                            return <InfoItem label={label} value={al.name} theme={theme} />;
                        })()}
                        {shop.adminLevels.find(al => al.level === 3) && (() => {
                            const al = shop.adminLevels.find(l => l.level === 3)!;
                            const label = country?.adminLevelNames?.find(n => n.level === 3)?.name || 'Village';
                            return <InfoItem label={label} value={al.name} theme={theme} />;
                        })()}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shop.adminLevels.filter(al => al.level > 3).map(al => {
                        const label = country?.adminLevelNames?.find(n => n.level === al.level)?.name || `Level ${al.level}`;
                        return (
                            <InfoItem key={al.level} label={label} value={al.name} theme={theme} />
                        );
                    })}
                    <InfoItem label="Latitude" value={shop.location.lat.toString()} theme={theme} />
                    <InfoItem label="Longitude" value={shop.location.lng.toString()} theme={theme} />
                </div>
            </div>

            <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Registration & Compliance</h3>
                <div className="space-y-4">
                    <InfoItem label="Registered" value={shop.isRegistered ? 'Yes' : 'No'} theme={theme} />
                    {shop.isRegistered && (
                        <>
                            <InfoItem label="Registration Number" value={shop.registrationNumber || 'N/A'} theme={theme} />
                            {shop.registrationCertificate && (
                                <div className="mt-2">
                                    <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Certificate</p>
                                    <div className={`p-4 border rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <Icon name="document" className="w-6 h-6 text-[#FFB800]" />
                                            <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Registration_Certificate.pdf</span>
                                        </div>
                                        <button className="text-[#FFB800] text-xs font-bold hover:underline">View</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    
                    {shop.tradingLicenses.length > 0 && (
                        <div className="mt-4 space-y-4">
                            <p className={`text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Trading Licenses</p>
                            {shop.tradingLicenses.map((license, idx) => {
                                const isExpired = license.hasExpiry && license.expiryDate && new Date(license.expiryDate) < new Date();
                                const statusText = license.hasExpiry ? (license.expiryDate ? (isExpired ? 'Expired' : 'Active') : 'Pending') : 'No Expiry';
                                const statusColor = !license.hasExpiry 
                                    ? (theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800')
                                    : (license.expiryDate 
                                        ? (isExpired 
                                            ? (theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800') 
                                            : (theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800'))
                                        : (theme === 'dark' ? 'bg-[#FFB800]/10 text-[#FFB800]' : 'bg-yellow-100 text-yellow-800'));

                                return (
                                    <div key={idx} className={`p-4 border rounded-lg relative space-y-4 ${theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full inline-block ${statusColor}`}>{statusText}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoItem label="Type" value={license.type} theme={theme} />
                                            <InfoItem label="License Number" value={license.number} theme={theme} />
                                            
                                            <div className="md:col-span-2">
                                                <ToggleDisplay label="Has Expiry Date?" enabled={license.hasExpiry} theme={theme} />
                                            </div>

                                            <div className={license.hasExpiry ? "" : "md:col-span-2"}>
                                                <InfoItem label="License/Certificate Name" value={license.name} theme={theme} />
                                            </div>
                                            {license.hasExpiry && (
                                                <InfoItem label="Expiry Date" value={license.expiryDate || 'N/A'} theme={theme} />
                                            )}
                                        </div>
                                        {license.certificate && (
                                            <div className="mt-2">
                                                <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Certificate</p>
                                                <div className={`p-4 border rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <Icon name="document" className="w-6 h-6 text-[#FFB800]" />
                                                        <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{license.type}_Document.pdf</span>
                                                    </div>
                                                    <button className="text-[#FFB800] text-xs font-bold hover:underline">View</button>
                                                </div>
                                            </div>
                                        )}
                                        {license.remarks && (
                                            <InfoItem label="Remarks" value={license.remarks} theme={theme} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Step2 = ({ shop, theme }: { shop: Shop, theme: Theme }) => {
    const financials = shop.financials;
    const incomeStatement = financials?.incomeStatement;
    const openingBalances = financials?.openingBalances;

    const formatValue = (val?: number) => {
        if (val === undefined) return '-';
        return `${shop.currency} ${val.toLocaleString()}`;
    };

    const Row = ({ label, value, isNegative, isBold, bgColor }: { label: string, value?: number, isNegative?: boolean, isBold?: boolean, bgColor?: string }) => (
        <tr className={`${bgColor || ''} ${isBold ? 'font-bold' : ''}`}>
            <td className="border border-slate-300 p-2 pl-4">{label}</td>
            <td className="border border-slate-300 p-2 text-right">
                {isNegative && value !== undefined && value !== 0 ? `(${formatValue(value)})` : formatValue(value)}
            </td>
        </tr>
    );

    const SectionHeader = ({ label, children, rowSpan }: { label: string, children: React.ReactNode, rowSpan: number }) => (
        <tr>
            <td rowSpan={rowSpan} className="border border-slate-300 p-2 font-bold bg-slate-100 dark:bg-white/5 text-center [writing-mode:vertical-lr] rotate-180">
                {label}
            </td>
            {children}
        </tr>
    );

    const formatDuePeriod = (totalDays: number) => {
        if (totalDays <= 0) return '0 days';
        
        if (totalDays >= 30) {
            const months = Math.floor(totalDays / 30);
            const remainingAfterMonths = totalDays % 30;
            const weeks = Math.floor(remainingAfterMonths / 7);
            const days = remainingAfterMonths % 7;
            
            const parts = [];
            if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
            if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
            if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
            return parts.join(', ');
        } else if (totalDays >= 7) {
            const weeks = Math.floor(totalDays / 7);
            const days = totalDays % 7;
            
            const parts = [];
            if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
            if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
            return parts.join(', ');
        } else {
            return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
        }
    };

    const FinancialTable = ({ items }: { items: { label: string, value: string | number, isCurrency?: boolean }[] }) => (
        <div className={`overflow-hidden rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
            <table className="w-full text-sm">
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                    {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-black/5 transition-colors">
                            <td className={`px-6 py-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{item.label}</td>
                            <td className={`px-6 py-4 text-right font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {item.isCurrency && <span className="text-[10px] mr-1 opacity-50 font-normal">{shop.currency}</span>}
                                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : 'text-slate-500 border-slate-200'}`}>Income Statement Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="Base Currency" value={shop.currency} theme={theme} />
                </div>
            </div>

            {incomeStatement && (
                <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-white/5">
                        <h3 className={`text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Income Statement (IFRS 18)</h3>
                    </div>
                    
                    <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="bg-yellow-400 text-center py-2 font-bold text-slate-900 mb-1">
                            Statement of Profit or Loss
                        </div>
                        <div className="bg-yellow-400 text-center py-1 font-bold text-slate-900 mb-4 text-sm">
                            For the Year Ended 31 December 20XX
                        </div>

                        <table className="w-full border-collapse border border-slate-300 text-sm">
                            <tbody>
                                {/* Operating Section */}
                                <SectionHeader label="Operating" rowSpan={8}>
                                    <td className="border border-slate-300 p-2">Revenue</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.revenue)}</td>
                                </SectionHeader>
                                <Row label="Cost of goods sold" value={incomeStatement.cogs} isNegative />
                                <Row label="Gross profit" value={incomeStatement.grossProfit} isBold bgColor="bg-orange-100 dark:bg-orange-900/30" />
                                <Row label="Selling and distribution expenses" value={incomeStatement.sellingDistributionExpenses} isNegative />
                                <Row label="Administrative expenses" value={incomeStatement.adminExpenses} isNegative />
                                <Row label="Research and development expenses" value={incomeStatement.rdExpenses} isNegative />
                                <Row label="Other operating income" value={incomeStatement.otherOperatingIncome} />
                                <Row label="Other operating expenses" value={incomeStatement.otherOperatingExpenses} isNegative />
                                <tr className="bg-yellow-400 font-bold text-slate-900">
                                    <td colSpan={2} className="border border-slate-300 p-2">Operating profit</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.operatingProfit)}</td>
                                </tr>

                                {/* Investing Section */}
                                <SectionHeader label="Investing" rowSpan={7}>
                                    <td className="border border-slate-300 p-2">Share of profit from associates</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.shareOfProfitFromAssociates)}</td>
                                </SectionHeader>
                                <Row label="Dividend income" value={incomeStatement.dividendIncome} />
                                <Row label="Interest income (investments)" value={incomeStatement.interestIncomeInvestments} />
                                <Row label="Gain on disposal of investments" value={incomeStatement.gainOnDisposalOfInvestments} />
                                <Row label="Loss on disposal of investments" value={incomeStatement.lossOnDisposalOfInvestments} isNegative />
                                <Row label="Total investing income/(expense)" value={incomeStatement.totalInvestingIncomeExpense} />
                                <tr className="bg-yellow-400 font-bold text-slate-900">
                                    <td colSpan={2} className="border border-slate-300 p-2">Profit before financing and income tax</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.profitBeforeFinancingAndIncomeTax)}</td>
                                </tr>

                                {/* Financing Section */}
                                <SectionHeader label="Financing" rowSpan={4}>
                                    <td className="border border-slate-300 p-2">Interest expense (on loans)</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.interestExpenseLoans)}</td>
                                </SectionHeader>
                                <Row label="Interest expense (on lease liabilities)" value={incomeStatement.interestExpenseLeaseLiabilities} isNegative />
                                <Row label="Other financing costs" value={incomeStatement.otherFinancingCosts} isNegative />
                                <Row label="Total financing expense" value={incomeStatement.totalFinancingExpense} isNegative />
                                
                                <Row label="Profit before income tax" value={incomeStatement.profitBeforeIncomeTax} isBold bgColor="bg-orange-100 dark:bg-orange-900/30" />

                                {/* Income Taxes Section */}
                                <SectionHeader label="Income taxes" rowSpan={1}>
                                    <td className="border border-slate-300 p-2">Income tax expense</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.incomeTaxExpense)}</td>
                                </SectionHeader>

                                <Row label="Profit from continuing operations" value={incomeStatement.profitFromContinuingOperations} isBold bgColor="bg-orange-100 dark:bg-orange-900/30" />

                                {/* Discontinued Operations Section */}
                                <SectionHeader label="Discontinued operations" rowSpan={1}>
                                    <td className="border border-slate-300 p-2">Profit from discontinued operations</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.profitFromDiscontinuedOperations)}</td>
                                </SectionHeader>

                                <tr className="bg-yellow-400 font-bold text-slate-900">
                                    <td colSpan={2} className="border border-slate-300 p-2">Net profit</td>
                                    <td className="border border-slate-300 p-2 text-right">{formatValue(incomeStatement.netProfit)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-8 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-400 border border-slate-300"></div>
                                    <span>Required Subtotals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/30 border border-slate-300"></div>
                                    <span>Additional Subtotals</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-green-600 text-white text-center py-2 font-bold text-sm rounded">
                            Prepared by DERRICK MUGIRI, CPA
                        </div>
                    </div>
                </div>
            )}

            {openingBalances && (
                <div>
                    <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : 'text-slate-500 border-slate-200'}`}>Opening Balances</h3>
                    <FinancialTable items={[
                        { label: "Cash at Hand", value: openingBalances.cashAtHand, isCurrency: true },
                        { label: "Outstanding Debt", value: openingBalances.outstandingDebt, isCurrency: true },
                        { label: "Credits (Receivables)", value: openingBalances.creditsReceivables, isCurrency: true },
                    ]} />
                </div>
            )}

            {financials?.loanDetails && (
                <div>
                    <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : 'text-slate-500 border-slate-200'}`}>Loan Details</h3>
                    <FinancialTable items={[
                        { label: "Loan Issuer", value: financials.loanDetails.issuer || 'N/A' },
                        { label: "Loan Amount", value: financials.loanDetails.amount, isCurrency: true },
                        { label: "Interest Rate", value: `${financials.loanDetails.interest}%` },
                        { label: "Total Loan", value: financials.loanDetails.totalLoan, isCurrency: true },
                        { label: "Paid Loan", value: financials.loanDetails.paidLoan, isCurrency: true },
                        { label: "Loan Balance", value: financials.loanDetails.loanBalance, isCurrency: true },
                        { label: "Start Date", value: financials.loanDetails.startDate || 'N/A' },
                        { label: "End Date", value: financials.loanDetails.endDate || 'N/A' },
                        { label: "Due Period", value: formatDuePeriod(financials.loanDetails.dueDays || 0) },
                    ]} />
                </div>
            )}
        </div>
    );
};

const Step3 = ({ shop, theme }: { shop: Shop, theme: Theme }) => {
    const settings = shop.settings;

    return (
        <div className="space-y-6">
            <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : 'text-slate-500 border-slate-200'}`}>General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ToggleDisplay label="Allow Credit Sales" enabled={settings.allowCredit} theme={theme} />
                    <ToggleDisplay label="Mandatory Client Info" enabled={settings.compulsoryClientInfo} theme={theme} />
                    <ToggleDisplay label="Collect Client Info" enabled={settings.collectClientInfo} theme={theme} />
                    <ToggleDisplay label="Allow Hold Transaction" enabled={settings.allowHoldTransaction} theme={theme} />
                    <ToggleDisplay label="Allow Price Per User" enabled={settings.allowPricePerUser} theme={theme} />
                    <ToggleDisplay label="VAT Registered" enabled={settings.isVatRegistered} theme={theme} />
                </div>
            </div>

            <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : 'text-slate-500 border-slate-200'}`}>Discounting Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ToggleDisplay label="Allow Percentage Discount" enabled={settings.allowDiscountPercentage} theme={theme} />
                    <ToggleDisplay label="Allow Amount Discount" enabled={settings.allowDiscountAmount} theme={theme} />
                    <ToggleDisplay label="Allow Discount on Debt" enabled={!settings.disableDiscountForDebt} theme={theme} />
                </div>
            </div>

            <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : 'text-slate-500 border-slate-200'}`}>Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ToggleDisplay label="Allow Mobile Money" enabled={settings.allowMobileMoneyPayment} theme={theme} />
                    <ToggleDisplay label="Allow Card Payment" enabled={settings.allowCardPayment} theme={theme} />
                    <ToggleDisplay label="Allow Wallet Checkout" enabled={settings.allowWalletCheckout} theme={theme} />
                </div>
            </div>

            <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : 'text-slate-500 border-slate-200'}`}>Wallet Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ToggleDisplay label="Enable Client Wallets" enabled={settings.enableWallets} theme={theme} />
                    {settings.enableWallets && (
                        <>
                            <ToggleDisplay label="Allow Wallet Debt" enabled={settings.allowWalletDebt} theme={theme} />
                            <ToggleDisplay label="Allow Wallet Deposits" enabled={settings.allowWalletDeposits} theme={theme} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ label: string, value: string, theme: Theme, status?: string }> = ({ label, value, theme, status }) => (
    <div className="space-y-1">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>{label}</p>
        <div className="flex items-center gap-2">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            {status && (
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {status}
                </span>
            )}
        </div>
    </div>
);

const FinancialItem: React.FC<{ label: string, value: number, currency: string, theme: Theme }> = ({ label, value, currency, theme }) => (
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <span className="text-[10px] mr-1 opacity-50">{currency}</span>
            {value.toLocaleString()}
        </p>
    </div>
);

const ToggleDisplay: React.FC<{ label: string, enabled?: boolean, theme: Theme }> = ({ label, enabled, theme }) => (
    <div className={`p-3 rounded-lg flex items-center justify-between border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>{label}</span>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-600'}`} />
            <span className={`text-[10px] font-bold uppercase ${enabled ? 'text-green-500' : 'text-gray-500'}`}>{enabled ? 'Enabled' : 'Disabled'}</span>
        </div>
    </div>
);

export default ViewShopModal;

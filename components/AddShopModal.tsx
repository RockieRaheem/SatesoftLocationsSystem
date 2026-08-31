
import React, { useState, useEffect } from 'react';
import { Theme, Shop, Country, ShopUser, SuperUser, TradingLicense } from '../types';
import Icon from './Icon';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shopData: Omit<Shop, 'id'>) => void;
  theme: Theme;
  countries: Country[];
  users: (ShopUser | SuperUser)[];
}

const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose, onSave, theme, countries, users }) => {
    const [step, setStep] = useState(1);
    const [isClosing, setIsClosing] = useState(false);
    const [shopData, setShopData] = useState<Partial<Omit<Shop, 'id'>>>({
        name: '',
        countryCode: '',
        currency: '',
        ownerId: undefined,
        location: { lat: 0, lng: 0 },
        adminLevels: [],
        isRegistered: false,
        tradingLicenses: [{ type: '', name: '', number: '', hasExpiry: false, expiryDate: '', certificate: null, remarks: '' }],
        settings: { 
            allowCredit: false, 
            compulsoryClientInfo: false,
            collectClientInfo: false,
            enableWallets: false, 
            allowWalletDebt: false, 
            allowWalletDeposits: false,
            allowWalletCheckout: false,
            allowMobileMoneyPayment: false,
            allowCardPayment: false,
            requireOtpForWalletUpdates: false,
            allowHoldTransaction: false,
            allowPricePerUser: false,
            allowDiscountPercentage: false,
            allowDiscountAmount: false,
            disableDiscountForDebt: false
        },
        financials: {
            openingBalances: { cashAtHand: 0, outstandingDebt: 0, creditsReceivables: 0 },
            loanDetails: {
                amount: 0,
                interest: 0,
                totalLoan: 0,
                paidLoan: 0,
                loanBalance: 0,
                startDate: '',
                endDate: '',
                issuer: '',
                dueDays: 0
            }
        },
        category: 'Uncategorized',
        createdBy: 'Paul Mboya', // Assuming current user
        createdAt: new Date().toISOString(),
    });

    useEffect(() => {
        if (shopData.countryCode) {
            const country = countries.find(c => c.countryCode === shopData.countryCode);
            if (country) {
                setShopData(prev => ({ ...prev, currency: country.currencyCode }));
            }
        }
    }, [shopData.countryCode, countries]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setStep(1); // Reset step
        }, 300);
    };

    const handleSave = () => {
        onSave(shopData as Omit<Shop, 'id'>);
        handleClose();
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const renderStep = () => {
        switch (step) {
            case 1: return <Step1 data={shopData} setData={setShopData} theme={theme} countries={countries} users={users} />;
            case 2: return <Step2 data={shopData} setData={setShopData} theme={theme} />;
            case 3: return <Step3 data={shopData} setData={setShopData} theme={theme} />;
            default: return null;
        }
    };

    if (!isOpen && !isClosing) return null;

    const Stepper = () => {
        const steps = ["Details & Registration", "Financials", "Settings"];
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
            <div className={`${theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Add New Shop</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <Stepper />
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    {renderStep()}
                </div>

                <div className={`flex justify-between items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-white/5 bg-black/50' : 'border-slate-100'}`}>
                    <button onClick={handleBack} disabled={step === 1} className={`px-6 py-2 text-sm font-medium border rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${theme === 'dark' ? 'border-white/10 text-gray-300 hover:bg-white/5' : ''}`}>
                        Back
                    </button>
                    {step < 3 ? (
                        <button onClick={handleNext} className="ml-3 px-6 py-2 text-sm font-bold text-[#0F1115] bg-[#FFB800] border border-transparent rounded-md shadow-sm hover:bg-[#FFB800]/90 transition-colors">
                            Next
                        </button>
                    ) : (
                        <button onClick={handleSave} className="ml-3 px-6 py-2 text-sm font-bold text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 transition-colors">
                            Save Shop
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const commonInputClasses = (theme: Theme) => `w-full px-4 py-2.5 rounded-md border text-sm outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`;
const labelClasses = (theme: Theme) => `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`;
const commonFocusClasses = '';

const Step1 = ({ data, setData, theme, countries, users }: { data: any, setData: Function, theme: Theme, countries: Country[], users: (ShopUser | SuperUser)[] }) => {
    // ... (Step 1 Implementation same as before)
    const selectedCountry = countries.find(c => c.countryCode === data.countryCode);
    const adminLevelDefs = selectedCountry?.adminLevelNames || [];
    const availableAdminAreas = selectedCountry?.adminLevels || [];
    const superUsers = users.filter(u => u.userType === 'Super User');

    const handleAdminLevelChange = (level: number, value: string) => {
        const newLevels = [...data.adminLevels.slice(0, level - 1), { level, name: value }];
        setData({ ...data, adminLevels: newLevels });
    };
    
    const handleAddLicense = () => {
        const newLicenses = [...(data.tradingLicenses || []), { type: '', name: '', number: '', hasExpiry: false, expiryDate: '', certificate: null, remarks: '' }];
        setData({ ...data, tradingLicenses: newLicenses });
    };

    const handleRemoveLicense = (index: number) => {
        const newLicenses = data.tradingLicenses.filter((_: any, i: number) => i !== index);
        setData({ ...data, tradingLicenses: newLicenses });
    };

    const handleLicenseChange = (index: number, field: keyof TradingLicense, value: any) => {
        const newLicenses = [...data.tradingLicenses];
        newLicenses[index] = { ...newLicenses[index], [field]: value };
        setData({ ...data, tradingLicenses: newLicenses });
    };

    const handleLicenseFileChange = (index: number, file: string | null) => {
        const newLicenses = [...data.tradingLicenses];
        newLicenses[index] = { ...newLicenses[index], certificate: file };
        setData({ ...data, tradingLicenses: newLicenses });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Shop Name" name="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} theme={theme} />
                <Select label="Assignee (Owner)" name="ownerId" value={data.ownerId || ''} onChange={(e) => setData({ ...data, ownerId: parseInt(e.target.value, 10) })} theme={theme}>
                    <option value="">Select an assignee</option>
                    {superUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Country" name="countryCode" value={data.countryCode} onChange={(e) => setData({ ...data, countryCode: e.target.value, adminLevels: [] })} theme={theme}>
                    <option value="">Select a country</option>
                    {countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}
                </Select>
                {adminLevelDefs.find(def => def.level === 1) && (() => {
                    const def = adminLevelDefs.find(d => d.level === 1)!;
                    const options = availableAdminAreas.filter(area => area.level === 1);
                    return (
                        <Select key={def.level} label={def.name} value={data.adminLevels.find((l: any) => l.level === def.level)?.name || ''} onChange={(e) => handleAdminLevelChange(def.level, e.target.value)} theme={theme}>
                            <option value="">Select {def.name}</option>
                            {options.map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                        </Select>
                    );
                })()}
            </div>

            {(adminLevelDefs.find(def => def.level === 2) || adminLevelDefs.find(def => def.level === 3)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[2, 3].map(level => {
                        const def = adminLevelDefs.find(d => d.level === level);
                        if (!def) return <div key={level} />;
                        
                        const parentLevelSelection = data.adminLevels.find((l: any) => l.level === level - 1)?.name;
                        const parentLevelId = parentLevelSelection ? availableAdminAreas.find(area => area.name === parentLevelSelection)?.id : undefined;
                        const options = availableAdminAreas.filter(area => area.level === level && area.parentAdminLevelId === parentLevelId);
                        
                        return (
                            <Select key={level} label={def.name} value={data.adminLevels.find((l: any) => l.level === level)?.name || ''} onChange={(e) => handleAdminLevelChange(level, e.target.value)} theme={theme} disabled={!parentLevelSelection}>
                                <option value="">Select {def.name}</option>
                                {options.map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                            </Select>
                        );
                    })}
                </div>
            )}

            {adminLevelDefs.filter(def => def.level > 3).sort((a,b) => a.level - b.level).map(def => {
                 const parentLevelSelection = data.adminLevels.find((l: any) => l.level === def.level - 1)?.name;
                 const parentLevelId = parentLevelSelection ? availableAdminAreas.find(area => area.name === parentLevelSelection)?.id : undefined;

                 const options = availableAdminAreas.filter(area => 
                    area.level === def.level && area.parentAdminLevelId === parentLevelId
                 );
                return (
                 <Select key={def.level} label={def.name} value={data.adminLevels.find((l: any) => l.level === def.level)?.name || ''} onChange={(e) => handleAdminLevelChange(def.level, e.target.value)} theme={theme} disabled={!parentLevelSelection}>
                    <option value="">Select {def.name}</option>
                    {options.map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                 </Select>
                )
            })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Latitude" name="location.lat" type="number" value={data.location.lat} onChange={(e) => setData({ ...data, location: { ...data.location, lat: parseFloat(e.target.value) } })} theme={theme} />
                <Input label="Longitude" name="location.lng" type="number" value={data.location.lng} onChange={(e) => setData({ ...data, location: { ...data.location, lng: parseFloat(e.target.value) } })} theme={theme} />
            </div>

             <div className={`pt-4 mt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                <Toggle label="Is the shop registered?" enabled={data.isRegistered} setEnabled={(val: boolean) => setData({ ...data, isRegistered: val })} theme={theme} />
                {data.isRegistered && (
                    <div className={`p-4 mt-4 border rounded-lg space-y-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200'}`}>
                        <h3 className={`text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : ''}`}>Registration Details</h3>
                        <Input label="Registration Number" name="registrationNumber" value={data.registrationNumber || ''} onChange={(e) => setData({ ...data, registrationNumber: e.target.value })} theme={theme} />
                        <FileInput label="Registration Certificate" theme={theme} onFileSelect={(file) => setData({ ...data, registrationCertificate: file })} />
                        
                        <div className={`pt-4 mt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                           <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-gray-500' : ''}`}>Licenses and certificates</h3>
                            <div className="space-y-4">
                                {data.tradingLicenses?.map((license: any, index: number) => {
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
                                        <div key={index} className={`p-4 border rounded-lg relative space-y-4 ${theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full inline-block ${statusColor}`}>{statusText}</span>
                                                {data.tradingLicenses.length > 1 && (
                                                    <button onClick={() => handleRemoveLicense(index)} className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-500 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                                                        <Icon name="delete" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Select label="Type" value={license.type} onChange={(e) => handleLicenseChange(index, 'type', e.target.value)} theme={theme}>
                                                    <option value="">Select Type</option>
                                                    <option value="Trading License">Trading License</option>
                                                    <option value="Health Certificate">Health Certificate</option>
                                                    <option value="Fire Safety Certificate">Fire Safety Certificate</option>
                                                    <option value="Professional Certificate">Professional Certificate</option>
                                                    <option value="Other">Other</option>
                                                </Select>
                                                <Input label="License Number" value={license.number} onChange={(e) => handleLicenseChange(index, 'number', e.target.value)} theme={theme} />
                                                
                                                <div className="md:col-span-2">
                                                    <Toggle label="Has Expiry Date?" enabled={license.hasExpiry} setEnabled={(val: boolean) => handleLicenseChange(index, 'hasExpiry', val)} theme={theme} />
                                                </div>

                                                <div className={license.hasExpiry ? "" : "md:col-span-2"}>
                                                    <Input label="License/Certificate Name" value={license.name} onChange={(e) => handleLicenseChange(index, 'name', e.target.value)} theme={theme} />
                                                </div>
                                                {license.hasExpiry && (
                                                    <Input label="Expiry Date" type="date" value={license.expiryDate} onChange={(e) => handleLicenseChange(index, 'expiryDate', e.target.value)} theme={theme} />
                                                )}
                                            </div>
                                            <FileInput label="Upload Document" theme={theme} onFileSelect={(file) => handleLicenseFileChange(index, file)} />
                                            <div className="space-y-1">
                                                <label className={`block ${labelClasses(theme)}`}>Remarks</label>
                                                <textarea 
                                                    value={license.remarks || ''} 
                                                    onChange={(e) => handleLicenseChange(index, 'remarks', e.target.value)}
                                                    className={`block w-full rounded-md shadow-sm text-xs px-3 py-2 border transition-colors ${commonInputClasses(theme)} ${commonFocusClasses}`}
                                                    rows={2}
                                                    placeholder="Additional notes..."
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                <button type="button" onClick={handleAddLicense} className={`w-full flex items-center justify-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 border-dashed rounded-md transition-all ${theme === 'dark' ? 'border-white/10 text-gray-500 hover:bg-white/5 hover:border-[#FFB800]/50 hover:text-white' : 'border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-400'}`}>
                                    <Icon name="plus" className="h-4 w-4" />
                                    <span>Add Another License/Certificate</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Step2 = ({ data, setData, theme }: { data: any, setData: Function, theme: Theme }) => {
    const handleFinancialChange = (field: string, value: string) => {
        setData({
            ...data,
            financials: {
                ...data.financials,
                openingBalances: {
                    ...data.financials.openingBalances,
                    [field]: parseFloat(value) || 0
                }
            }
        });
    };

    const handleLoanChange = (field: string, value: any) => {
        let val = value;
        if (field === 'interest') {
            const num = parseFloat(value) || 0;
            if (num < 0) val = 0;
            if (num > 100) val = 100;
            // Ensure 2 decimal places if it's a number
            if (typeof val === 'number') {
                val = parseFloat(num.toFixed(2));
            }
        } else if (['amount', 'paidLoan'].includes(field)) {
            val = parseFloat(value) || 0;
        }

        const updatedLoanDetails = {
            ...data.financials.loanDetails,
            [field]: val
        };

        // Calculate total loan if amount or interest changed
        if (field === 'amount' || field === 'interest') {
            const amount = field === 'amount' ? val : updatedLoanDetails.amount;
            const interest = field === 'interest' ? val : updatedLoanDetails.interest;
            updatedLoanDetails.totalLoan = amount + (amount * (interest / 100));
        }

        // Calculate due days if dates changed
        if (field === 'startDate' || field === 'endDate') {
            const start = field === 'startDate' ? val : updatedLoanDetails.startDate;
            const end = field === 'endDate' ? val : updatedLoanDetails.endDate;
            if (start && end) {
                const startDate = new Date(start);
                const endDate = new Date(end);
                const diffTime = endDate.getTime() - startDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                updatedLoanDetails.dueDays = diffDays > 0 ? diffDays : 0;
            } else {
                updatedLoanDetails.dueDays = 0;
            }
        }

        // Always recalculate balance
        updatedLoanDetails.loanBalance = updatedLoanDetails.totalLoan - updatedLoanDetails.paidLoan;

        setData({
            ...data,
            financials: {
                ...data.financials,
                loanDetails: updatedLoanDetails
            }
        });
    };

    const loanIssuers = [
        "Equity Bank",
        "KCB Bank",
        "Stanbic Bank",
        "Centenary Bank",
        "Absa Bank",
        "NCBA Bank",
        "Diamond Trust Bank",
        "Standard Chartered",
        "Bank of Africa",
        "PostBank Uganda",
        "Pride Microfinance",
        "FINCA Uganda",
        "Other"
    ];

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const parseFormattedNumber = (str: string) => {
        return parseFloat(str.replace(/,/g, '')) || 0;
    };

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

    return (
        <div className="space-y-6">
             <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : ''}`}>Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Input label="Shop Currency" name="currency" value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} theme={theme} />
                </div>

                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : ''}`}>Opening Balances</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Input 
                        label="Cash at hand" 
                        value={formatNumber(data.financials.openingBalances.cashAtHand)} 
                        onChange={e => handleFinancialChange('cashAtHand', parseFormattedNumber(e.target.value).toString())} 
                        theme={theme} 
                        alignRight 
                    />
                    <Input 
                        label="Outstanding debt" 
                        value={formatNumber(data.financials.openingBalances.outstandingDebt)} 
                        onChange={e => handleFinancialChange('outstandingDebt', parseFormattedNumber(e.target.value).toString())} 
                        theme={theme} 
                        alignRight 
                    />
                    <Input 
                        label="Credits (Receivables)" 
                        value={formatNumber(data.financials.openingBalances.creditsReceivables)} 
                        onChange={e => handleFinancialChange('creditsReceivables', parseFormattedNumber(e.target.value).toString())} 
                        theme={theme} 
                        alignRight 
                    />
                </div>

                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : ''}`}>Loan Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Row 1 */}
                    <Select 
                        label="Issuer of the Loan" 
                        value={data.financials.loanDetails.issuer} 
                        onChange={e => handleLoanChange('issuer', e.target.value)} 
                        theme={theme}
                    >
                        <option value="">Select Issuer</option>
                        {loanIssuers.map(issuer => (
                            <option key={issuer} value={issuer}>{issuer}</option>
                        ))}
                    </Select>
                    <Input 
                        label="Loan Amount" 
                        value={formatNumber(data.financials.loanDetails.amount)} 
                        onChange={e => handleLoanChange('amount', parseFormattedNumber(e.target.value))} 
                        theme={theme} 
                        alignRight 
                    />
                    <Input 
                        label="Interest (%)" 
                        type="text"
                        value={data.financials.loanDetails.interest + '%'} 
                        onChange={e => {
                            const val = e.target.value.replace('%', '');
                            handleLoanChange('interest', val);
                        }} 
                        theme={theme} 
                        alignRight 
                    />

                    {/* Row 2 */}
                    <Input 
                        label="Total Loan" 
                        value={formatNumber(data.financials.loanDetails.totalLoan)} 
                        readOnly
                        theme={theme} 
                        alignRight 
                    />
                    <Input 
                        label="Paid Loan" 
                        value={formatNumber(data.financials.loanDetails.paidLoan || 0)} 
                        onChange={e => handleLoanChange('paidLoan', parseFormattedNumber(e.target.value))} 
                        theme={theme} 
                        alignRight 
                    />
                    <Input 
                        label="Loan Balance" 
                        value={formatNumber(data.financials.loanDetails.loanBalance || 0)} 
                        readOnly
                        theme={theme} 
                        alignRight 
                    />

                    {/* Row 3 */}
                    <Input 
                        label="Start Issue Date" 
                        type="date" 
                        value={data.financials.loanDetails.startDate} 
                        onChange={e => handleLoanChange('startDate', e.target.value)} 
                        theme={theme} 
                    />
                    <Input 
                        label="End Date" 
                        type="date" 
                        value={data.financials.loanDetails.endDate} 
                        onChange={e => handleLoanChange('endDate', e.target.value)} 
                        theme={theme} 
                    />
                    <Input 
                        label="Due Period" 
                        type="text"
                        value={formatDuePeriod(data.financials.loanDetails.dueDays || 0)} 
                        readOnly
                        theme={theme} 
                        alignRight 
                    />
                </div>
            </div>
        </div>
    );
};

const Step3 = ({ data, setData, theme }: { data: any, setData: Function, theme: Theme }) => (
    <div className="space-y-4">
        <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : ''}`}>Shop Settings</h3>
        <Toggle label="Allow Credit Sales" description="Enable or disable credit sales for this shop." enabled={data.settings.allowCredit} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowCredit: val } })} theme={theme} />
        <Toggle label="Mandatory Client Info" description="Require client details for every sale." enabled={data.settings.compulsoryClientInfo} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, compulsoryClientInfo: val } })} theme={theme} />
        <Toggle label="Collect Client Information" description="Show input fields for Client Name and Phone Number on sales desk." enabled={data.settings.collectClientInfo} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, collectClientInfo: val } })} theme={theme} />
        <Toggle label="Allow Holding Transactions" description="Enable saving a transaction to complete later." enabled={data.settings.allowHoldTransaction} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowHoldTransaction: val } })} theme={theme} />
        <Toggle label="Allow Price Per User" description="Enable individual selling prices for different users." enabled={data.settings.allowPricePerUser} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowPricePerUser: val } })} theme={theme} />
        
        <h4 className={`text-[11px] font-bold uppercase tracking-wider mt-6 mb-3 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : ''}`}>Discounting Settings</h4>
        <Toggle label="Allow Percentage Discount" description="Allow discounting using percentage." enabled={data.settings.allowDiscountPercentage} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowDiscountPercentage: val } })} theme={theme} />
        <Toggle label="Allow Amount Discount" description="Allow discounting using amount of money." enabled={data.settings.allowDiscountAmount} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowDiscountAmount: val } })} theme={theme} />
        <Toggle label="Allow Discount on Debt" description="Allow or refuse discount when payment method is debt." enabled={!data.settings.disableDiscountForDebt} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, disableDiscountForDebt: !val } })} theme={theme} />

        <h4 className={`text-[11px] font-bold uppercase tracking-wider mt-6 mb-3 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : ''}`}>Payment Methods</h4>
        <Toggle label="Allow Mobile Money" description="Enable mobile money payments." enabled={data.settings.allowMobileMoneyPayment} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowMobileMoneyPayment: val } })} theme={theme} />
        <Toggle label="Allow Card Payment" description="Enable credit/debit card payments." enabled={data.settings.allowCardPayment} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowCardPayment: val } })} theme={theme} />
        <Toggle label="Allow Wallet Checkout" description="Allow customers to pay using their wallet balance." enabled={data.settings.allowWalletCheckout} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowWalletCheckout: val } })} theme={theme} />

        <h4 className={`text-[11px] font-bold uppercase tracking-wider mt-6 mb-3 pb-2 border-b ${theme === 'dark' ? 'text-gray-500 border-white/5' : ''}`}>Wallet Configuration</h4>
        <Toggle label="Enable Client Wallets" description="Allow clients to have digital wallets." enabled={data.settings.enableWallets} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, enableWallets: val } })} theme={theme} />
        
        {data.settings.enableWallets && (
            <div className="space-y-4 mt-4">
                <Toggle label="Allow Wallet Debt" description="Allow clients to purchase items even with insufficient wallet balance (up to credit limit)." enabled={data.settings.allowWalletDebt} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowWalletDebt: val } })} theme={theme} />
                <Toggle label="Allow Wallet Deposits" description="Allow clients to deposit funds into their wallets." enabled={data.settings.allowWalletDeposits} setEnabled={(val: boolean) => setData({ ...data, settings: { ...data.settings, allowWalletDeposits: val } })} theme={theme} />
            </div>
        )}
    </div>
);

// --- Reusable Form Components ---
const Input = ({ label, theme, hideSpinners, alignRight, ...props }: { label: string, theme: Theme, hideSpinners?: boolean, alignRight?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => {
    const [isFocused, setIsFocused] = useState(false);
    const val = props.value?.toString() || '';
    const displayValue = (isFocused && (val === '0' || val === '0%')) ? '' : val;

    return (
        <div>
            <label className={`block ${labelClasses(theme)}`}>{label}</label>
            <input 
                {...props} 
                value={displayValue}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    props.onBlur?.(e);
                }}
                className={`mt-1 block ${commonInputClasses(theme)} ${hideSpinners ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''} ${alignRight ? 'text-right' : ''}`} 
            />
        </div>
    );
};

const Select = ({ label, theme, children, ...props }: { label: string, theme: Theme, children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div>
        <label className={`block ${labelClasses(theme)}`}>{label}</label>
        <select {...props} className={`mt-1 block ${commonInputClasses(theme)}`}>{children}</select>
    </div>
);

const Toggle: React.FC<{ label: string, description?: string, enabled: boolean, setEnabled: (enabled: boolean) => void, theme: Theme }> = ({ label, description, enabled, setEnabled, theme }) => (
    <div className={`p-4 rounded-lg flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-200'}`}>
        <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{label}</p>
            {description && <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>{description}</p>}
        </div>
        <button type="button" onClick={() => setEnabled(!enabled)} role="switch" aria-checked={enabled} className={`relative inline-flex items-center h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FFB800] ${enabled ? 'bg-[#FFB800]' : (theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')}`}>
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const FileInput: React.FC<{ label: string, theme: Theme, onFileSelect: (base64: string | null) => void }> = ({ label, theme, onFileSelect }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => onFileSelect(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    return (
        <div>
            <label className={`block mb-1.5 ${labelClasses(theme)}`}>{label}</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 rounded-md transition-colors ${theme === 'dark' ? 'border-white/10 border-dashed bg-white/5 hover:border-[#FFB800]/50' : 'border-slate-300 border-dashed'}`}>
                <div className="space-y-1 text-center">
                    <Icon name="upload" className={`mx-auto h-10 w-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div className="flex text-xs text-gray-600">
                        <label htmlFor={label.replace(' ', '-')} className="relative cursor-pointer rounded-md font-bold text-[#FFB800] hover:text-[#FFB800]/80">
                            <span>Upload a file</span>
                            <input id={label.replace(' ', '-')} type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className={`pl-1 ${theme === 'dark' ? 'text-gray-500' : ''}`}>or drag and drop</p>
                    </div>
                    {fileName && <p className="text-[10px] font-bold text-green-500 mt-2">{fileName}</p>}
                </div>
            </div>
        </div>
    );
};

export default AddShopModal;

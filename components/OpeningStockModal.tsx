
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Theme, Shop, ProductDefinition, StockItem, ProductUnitDefinition, UnitPricing, User, UserPrice, Unit } from '../types';
import Icon from './Icon';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { availableProductUnits, allAfricanCountries } from '../data';

interface OpeningStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stockItem: StockItem) => void;
  onAddProduct?: (product: ProductDefinition) => void;
  theme: Theme;
  shops: Shop[];
  productDefinitions: ProductDefinition[];
  users: User[];
}

interface Portion {
    id: string;
    name: string;
    quantity: number;
    price: number;
    isSelected: boolean;
}

const manufacturers = ['Unknown Manufacturer', 'Samsung', 'LG', 'Sony', 'Apple', 'Coca Cola', 'Pepsi', 'Unilever', 'Mukwano'];
const categories = ['Adhesives', 'Cosmetics', 'Electronics', 'Chemicals', 'Household', 'Industrial', 'Beverages', 'Personal care', 'Baby care'];
const suppliers = ['Unknown', 'Microvet Agroinputs Hub Mublo', 'Equacare Pharmacy', 'Korine Distributors Limited', 'Mickey Tablets and More UG'];
const warehouses = [
    { id: 101, name: 'Main Warehouse - Kampala' },
    { id: 102, name: 'Distribution Center - Jinja' },
    { id: 103, name: 'Storage Unit B' }
];

const Toggle = ({ label, description, checked, onChange, theme, showSwitch = true }: { label: string, description?: string, checked: boolean, onChange: (val: boolean) => void, theme: Theme, showSwitch?: boolean }) => (
    <div className="flex items-center justify-between py-2 gap-4">
        <div>
            <div className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{label}</div>
            {description && <div className={`text-[9px] ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>{description}</div>}
        </div>
        {showSwitch && (
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FFB800] ${checked ? 'bg-[#FFB800]' : (theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')}`}
            >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        )}
    </div>
);

// --- Validation Components ---

const ValidatedInput = ({ label, name, value, onChange, error, type = "text", theme, required = false, className = "", ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full bg-[#0F1115] border rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FFB800]/50 ${
                error ? 'border-red-500' : 'border-white/10'
            } ${className}`}
            {...props}
        />
        {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
);

const ValidatedSelect = ({ label, name, value, onChange, error, children, theme, required = false, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full bg-[#0F1115] border rounded-md py-2 px-3 text-xs text-white appearance-none focus:outline-none focus:border-[#FFB800]/50 ${
                    error ? 'border-red-500' : 'border-white/10'
                }`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="chevron-down" className="w-4 h-4 text-gray-500" />
            </div>
        </div>
        {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
);

const ValidatedTextArea = ({ label, name, value, onChange, error, theme, rows = 3, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase">
            {label}
        </label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className={`w-full bg-[#0F1115] border rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FFB800]/50 ${
                error ? 'border-red-500' : 'border-white/10'
            }`}
            {...props}
        />
        {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
);

const MultiSelect = ({ label, options, selected, onChange, theme, placeholder = "Select options", required = false }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter((item: string) => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const removeOption = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        onChange(selected.filter((item: string) => item !== option));
    };

    return (
        <div className="space-y-1.5" ref={containerRef}>
            <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-[#0F1115] border border-white/10 rounded-md py-1.5 px-2 text-xs text-white text-left flex flex-wrap items-center gap-2 min-h-[38px] cursor-pointer hover:border-white/20 transition-colors"
                >
                    {selected.length > 0 ? (
                        selected.map((option: string) => (
                            <span 
                                key={option} 
                                className="inline-flex items-center gap-1.5 bg-[#FFB800] text-black px-2 py-1 rounded text-[10px] font-bold uppercase"
                            >
                                {option}
                                <button 
                                    type="button" 
                                    onClick={(e) => removeOption(e, option)}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <Icon name="x-mark" className="w-3 h-3" />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 px-2">{placeholder}</span>
                    )}
                    <div className="ml-auto pr-1">
                        <Icon name="chevron-down" className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-[#121418] border border-white/10 rounded-md shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
                        {options.map((option: string) => {
                            const isSelected = selected.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => toggleOption(option)}
                                    className={`w-full px-4 py-2.5 text-left text-xs transition-colors flex items-center justify-between group ${
                                        isSelected 
                                            ? 'bg-[#FFB800]/10 text-[#FFB800]' 
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                                    {isSelected && (
                                        <div className="flex items-center justify-center w-4 h-4 rounded-full border border-[#FFB800]">
                                            <Icon name="check" className="w-2.5 h-2.5 text-[#FFB800]" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Price Error Modal
const PriceErrorModal = ({ isOpen, onClose, message, theme }: { isOpen: boolean; onClose: () => void; message: string; theme: Theme }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg shadow-xl max-w-md w-full p-6 relative animate-bounce-in`}>
                 <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <Icon name="exclamation-triangle" className="w-6 h-6 text-red-600" />
                </div>
                <h3 className={`text-lg font-bold text-center mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                    Pricing Error
                </h3>
                <p className={`text-center mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {message}
                </p>
                <button 
                    onClick={onClose}
                    className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                >
                    Okay, I'll Fix It
                </button>
            </div>
        </div>
    );
};

interface OpeningStockFormData {
    isExistingProduct: boolean;
    productName: string;
    entityType: string;
    shopId: string;
    warehouseId: string;
    manufacturer: string;
    category: string;
    status: 'ACTIVE' | 'INACTIVE';
    baseUnit: string;
    baseQuantity: string;
    containerQuantity: string;
    containerUnit: string;
    description: string;
    hasBatchNumber: boolean;
    hasExpiryDate: boolean;
    imageUrl: string;
    isGlobal: boolean;
    continents: string[];
    economicZones: string[];
    countries: string[];
    country: string;
    customName: string;
    vatType: string;
    vatPercentage: number;
    purchasingUnit: string;
    reportingUnit: string;
    reorderPoint: string;
    remarks: string;
    unitPricings: UnitPricing[];
    stockUnit: string;
    date: string;
    quantity: string;
    unitPrice: string;
    buyingPrice: string;
    unitPurchasingPrice: string;
    purchaseAmount: string;
    batchNumber: string;
    expiryDate: string;
    supplier: string;
    invoiceNumber: string;
}

const OpeningStockModal: React.FC<OpeningStockModalProps> = ({ isOpen, onClose, onSave, onAddProduct, theme, shops, productDefinitions, users }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [priceError, setPriceError] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
    
    // Product Search State
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const productDropdownRef = useRef<HTMLDivElement>(null);

    // Unit Selection State
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [unitDetails, setUnitDetails] = useState<Record<string, ProductUnitDefinition>>({});

    const [userSectionCollapsed, setUserSectionCollapsed] = useState<Record<string, boolean>>({});
    const [userDropdownOpen, setUserDropdownOpen] = useState<Record<string, boolean>>({});

    // Portions State for Step 2
    const [portions, setPortions] = useState<Portion[]>([]);

    // Form State
    const [formData, setFormData] = useState<OpeningStockFormData>({
        // Product Selection
        isExistingProduct: true,
        productName: '',
        entityType: 'Shop',
        shopId: '',
        warehouseId: '',
        manufacturer: '',
        category: '',
        status: 'ACTIVE',
        baseUnit: '',
        baseQuantity: '',
        containerQuantity: '',
        containerUnit: '',
        description: '',
        hasBatchNumber: false,
        hasExpiryDate: false,
        imageUrl: '',
        isGlobal: true,
        continents: [],
        economicZones: [],
        countries: [],
        country: 'Uganda',
        customName: '',
        vatType: 'None',
        vatPercentage: 0,
        purchasingUnit: '',
        reportingUnit: '',
        reorderPoint: '0',
        remarks: '',
        unitPricings: [],
        
        // Stock Information (Opening Stock)
        stockUnit: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        unitPrice: '', // Selling Price
        buyingPrice: '', // Cost
        unitPurchasingPrice: '',
        purchaseAmount: '',
        batchNumber: '',
        expiryDate: '',
        supplier: 'Unknown',
        invoiceNumber: '',
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
                setIsProductDropdownOpen(false);
            }
        };
        if (isProductDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProductDropdownOpen]);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                isExistingProduct: true,
                productName: '',
                entityType: 'Shop',
                shopId: '',
                warehouseId: '',
                manufacturer: '',
                category: '',
                status: 'ACTIVE',
                baseUnit: '',
                baseQuantity: '',
                containerQuantity: '',
                containerUnit: '',
                description: '',
                hasBatchNumber: false,
                hasExpiryDate: false,
                imageUrl: '',
                isGlobal: true,
                continents: [],
                economicZones: [],
                countries: [],
                country: 'Uganda',
                customName: '',
                vatType: 'None',
                vatPercentage: 0,
                purchasingUnit: '',
                reportingUnit: '',
                reorderPoint: '0',
                remarks: '',
                unitPricings: [],
                stockUnit: '',
                date: new Date().toISOString().split('T')[0],
                quantity: '',
                unitPrice: '',
                buyingPrice: '',
                unitPurchasingPrice: '',
                purchaseAmount: '',
                batchNumber: '',
                expiryDate: '',
                supplier: 'Unknown',
                invoiceNumber: '',
            });
            setPortions([]);
            setSelectedUnits([]);
            setUnitDetails({});
            setErrors({});
            setIsClosing(false);
        }
    }, [isOpen, shops]);

    // Sync units for stock selection
    useEffect(() => {
        if (isOpen && formData.productName) {
            setPortions(() => {
                const newPortions: Portion[] = [];
                if (selectedUnits.length > 0) {
                    selectedUnits.forEach((u, idx) => {
                         const details = unitDetails[u];
                         let qty = details?.quantity || 1;
                         newPortions.push({ 
                             id: `unit-${idx}`, 
                             name: u, 
                             quantity: qty, 
                             price: 0, 
                             isSelected: true 
                         });
                    });
                } else {
                    if (formData.baseUnit) {
                        newPortions.push({ 
                            id: 'base', 
                            name: formData.baseUnit, 
                            quantity: 1, 
                            price: 0, 
                            isSelected: true 
                        });
                    }
                }
                return newPortions;
            });
        }
    }, [isOpen, formData.productName, selectedUnits, unitDetails, formData.baseUnit]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setStep(1);
            setErrors({});
        }, 300);
    };

    const maskPhone = (phone: string) => {
        if (!phone) return '';
        return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Handle numeric fields with 2 decimal places and no spin buttons
        if (['vatPercentage', 'reorderPoint', 'baseQuantity', 'containerQuantity'].includes(name)) {
            // Allow empty string, digits, and at most one dot with up to 2 decimal places
            const regex = /^\d*\.?\d{0,2}$/;
            if (value !== '' && !regex.test(value)) {
                return;
            }
        }

        if (name === 'stockUnit') {
            const pricing = formData.unitPricings.find(p => p.unit === value);
            if (pricing) {
                setFormData(prev => ({ ...prev, [name]: value, unitPrice: pricing.recommendedPrice.toString() }));
                if (errors[name]) {
                    setErrors(prev => ({ ...prev, [name]: '' }));
                }
                return;
            }
        }

        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'vatPercentage' ? (parseFloat(value) || 0) : value 
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleUnitPricingChange = (index: number, field: keyof UnitPricing, value: any) => {
        setFormData(prev => {
            const newPricings = [...prev.unitPricings];
            let pricing = { ...newPricings[index], [field]: value };
            
            // If setting as default selling unit, unset others
            if (field === 'isDefaultSellingUnit' && value === true) {
                newPricings.forEach((p, i) => {
                    if (i !== index) newPricings[i] = { ...p, isDefaultSellingUnit: false };
                });
            }

            // Logic for "Apply Default to All"
            if (pricing.useDefaultPriceForAll) {
                if (field === 'recommendedPrice' || field === 'lowestPrice') {
                    pricing.userPrices = pricing.userPrices.map(up => ({
                        ...up,
                        [field]: value
                    }));
                } else if (field === 'useDefaultPriceForAll' && value === true) {
                    // When toggled ON, sync all user prices to default
                    pricing.userPrices = pricing.userPrices.map(up => ({
                        ...up,
                        recommendedPrice: pricing.recommendedPrice,
                        lowestPrice: pricing.lowestPrice
                    }));
                }
            }
            
            newPricings[index] = pricing;
            
            // Sync unitPrice if this is the currently selected stock unit
            if (pricing.unit === prev.stockUnit && field === 'recommendedPrice') {
                return { ...prev, unitPricings: newPricings, unitPrice: value.toString() };
            }
            
            return { ...prev, unitPricings: newPricings };
        });
    };

    const handleUserPriceChange = (unitIndex: number, userIndex: number, field: keyof UserPrice, value: number) => {
        setFormData(prev => {
            const newPricings = [...prev.unitPricings];
            const pricing = { ...newPricings[unitIndex] };
            const newUserPrices = [...pricing.userPrices];
            newUserPrices[userIndex] = { ...newUserPrices[userIndex], [field]: value };
            
            pricing.userPrices = newUserPrices;
            newPricings[unitIndex] = pricing;
            return { ...prev, unitPricings: newPricings };
        });
    };

    const toggleUserSelection = (unitIndex: number, userId: string) => {
        setFormData(prev => {
            const nextPricings = [...prev.unitPricings];
            const up = { ...nextPricings[unitIndex] };
            const exists = up.userPrices.some(p => p.userId === userId);
            if (exists) {
                up.userPrices = up.userPrices.filter(p => p.userId !== userId);
            } else {
                up.userPrices = [...up.userPrices, { 
                    userId, 
                    recommendedPrice: up.recommendedPrice, 
                    lowestPrice: up.lowestPrice 
                }];
            }
            nextPricings[unitIndex] = up;
            return { ...prev, unitPricings: nextPricings };
        });
    };

    const handleStockCalculation = (field: 'quantity' | 'unitPrice' | 'buyingPrice' | 'unitPurchasingPrice' | 'purchaseAmount', value: string) => {
        // Handle numeric fields with 2 decimal places and no spin buttons
        const regex = /^\d*\.?\d{0,2}$/;
        if (value !== '' && !regex.test(value)) {
            return;
        }

        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            const qty = parseFloat(newData.quantity) || 0;
            const unitPurchasing = parseFloat(newData.unitPurchasingPrice) || 0;
            const totalPurchase = parseFloat(newData.purchaseAmount) || 0;

            if (field === 'quantity' || field === 'unitPurchasingPrice') {
                if (qty > 0 && unitPurchasing > 0) {
                    newData.purchaseAmount = (qty * unitPurchasing).toFixed(2);
                }
            } else if (field === 'purchaseAmount') {
                if (qty > 0 && totalPurchase > 0) {
                    newData.unitPurchasingPrice = (totalPurchase / qty).toFixed(2);
                }
            }

            // Keep buyingPrice in sync with unitPurchasingPrice for backward compatibility/internal use
            if (field === 'unitPurchasingPrice') {
                newData.buyingPrice = value;
            } else if (field === 'purchaseAmount' && qty > 0) {
                newData.buyingPrice = (totalPurchase / qty).toFixed(2);
            }

            return newData;
        });

        if (errors[field]) {
             setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleProductSelect = (product: ProductDefinition) => {
        const units = product.definedUnits?.map(u => u.unitName) || (product.saleUnits ? product.saleUnits.split(',').map(s => s.trim()) : []);
        setSelectedUnits(units);
        
        const details: Record<string, ProductUnitDefinition> = {};
        if (product.definedUnits) {
            product.definedUnits.forEach(u => details[u.unitName] = u);
        } else {
             units.forEach(u => {
                 details[u] = { unitName: u, quantity: 1, barcode: '' };
             });
        }
        setUnitDetails(details);

        setFormData(prev => ({
            ...prev,
            productName: product.name,
            customName: product.name,
            manufacturer: product.manufacturer,
            category: product.category || '',
            status: product.status || 'ACTIVE',
            baseUnit: product.baseUnit || '',
            baseQuantity: product.baseQuantity?.toString() || '',
            containerQuantity: product.containerQuantity?.toString() || '',
            containerUnit: product.containerUnit || '',
            description: product.remarks || '',
            hasBatchNumber: !!product.hasBatchNumber,
            hasExpiryDate: !!product.hasExpiryDate,
            imageUrl: product.imageUrl || '',
            isGlobal: product.isGlobal !== undefined ? product.isGlobal : true,
            continents: (product.continents || []).map((c: any) => typeof c === 'object' ? c.name : c),
            economicZones: (product.economicZones || []).map((ez: any) => typeof ez === 'object' ? ez.name : ez),
            countries: (product.countries || []).map((c: any) => typeof c === 'object' ? c.name : c),
            country: typeof product.country === 'object' ? (product.country as any).name : (product.country || 'Uganda'),
            unitPricings: (product.unitPricings || units.map(u => ({
                unit: u as Unit,
                quantityInUnit: details[u]?.quantity || 1,
                defaultPrice: 0,
                recommendedPrice: 0,
                lowestPrice: 0,
                useDefaultPriceForAll: true,
                userPrices: users.map(user => ({
                    userId: user.email,
                    recommendedPrice: 0,
                    lowestPrice: 0
                })),
                isDefaultSellingUnit: u === product.baseUnit
            }))) as UnitPricing[],
        }));
        setIsProductDropdownOpen(false);
        setProductSearch('');
        setErrors({});
    };

    const handleMultiUnitChange = (newSelected: string[]) => {
        setSelectedUnits(newSelected);
        setUnitDetails(prev => {
            const next = { ...prev };
            // Add new units
            newSelected.forEach(unit => {
                if (!next[unit]) {
                    next[unit] = { unitName: unit, quantity: 1, barcode: '' };
                }
            });
            // Do NOT remove units not in newSelected as per user request
            return next;
        });

        setFormData(prev => {
            const currentPricings = [...prev.unitPricings];
            // Ensure all newSelected are in currentPricings
            newSelected.forEach(unit => {
                const existing = currentPricings.find(p => p.unit === unit);
                if (!existing) {
                    currentPricings.push({
                        unit: unit as any,
                        quantityInUnit: 1,
                        defaultPrice: 0,
                        recommendedPrice: 0,
                        lowestPrice: 0,
                        useDefaultPriceForAll: true,
                        userPrices: users.map(user => ({
                            userId: user.email,
                            recommendedPrice: 0,
                            lowestPrice: 0
                        })),
                        isDefaultSellingUnit: unit === prev.baseUnit
                    });
                }
            });
            // Do NOT filter out units not in newSelected
            return { ...prev, unitPricings: currentPricings };
        });
    };

    const handleUnitDetailChange = (unit: string, field: keyof ProductUnitDefinition, value: string | number) => {
        setUnitDetails(prev => ({
            ...prev,
            [unit]: {
                ...prev[unit],
                [field]: value
            }
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMultiSelectChange = (name: string, value: string[]) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (step === 1) {
            if (!formData.productName) newErrors.productName = "Product is required";
            if (formData.entityType === 'Shop' && !formData.shopId) newErrors.shopId = "Shop is required";
            if (formData.entityType === 'Warehouse') {
                if (!formData.shopId) newErrors.shopId = "Shop is required";
                if (!formData.warehouseId) newErrors.warehouseId = "Warehouse is required";
            }
            if (!formData.category) newErrors.category = "Category is required";
            if (!formData.status) newErrors.status = "Status is required";
            if (!formData.baseUnit) newErrors.baseUnit = "Base unit is required";
            if (!formData.baseQuantity) newErrors.baseQuantity = "Base quantity is required";
            if (!formData.containerQuantity) newErrors.containerQuantity = "Container quantity is required";
            if (!formData.containerUnit) newErrors.containerUnit = "Container unit is required";
            
            if (!formData.isExistingProduct) {
                if (!formData.manufacturer) newErrors.manufacturer = "Manufacturer is required";
            }
        }

        if (step === 2) {
            if (!formData.customName) newErrors.customName = "Custom name is required";
        }

        if (step === 3) {
            if (!formData.stockUnit) newErrors.stockUnit = "Stock unit is required";
            if (!formData.quantity) newErrors.quantity = "Quantity is required";
            if (!formData.unitPurchasingPrice) newErrors.unitPurchasingPrice = "Unit purchasing price is required";
            if (!formData.purchaseAmount) newErrors.purchaseAmount = "Purchase amount is required";
            if (!formData.date) newErrors.date = "Date is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        } else {
            setErrors({});
        }
        return isValid;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        // PRICE VALIDATION
        const cost = parseFloat(formData.unitPurchasingPrice);
        const selling = parseFloat(formData.unitPrice);
        
        if (!isNaN(cost) && !isNaN(selling) && cost > selling) {
            setPriceError({
                isOpen: true,
                message: `The unit purchasing price (${cost}) is higher than the unit selling price (${selling}). Please adjust the prices.`
            });
            return;
        }

        let mainBarcode = '';
        if (selectedUnits.length > 0) {
             const unitWithBarcode = selectedUnits.find(u => unitDetails[u]?.barcode && unitDetails[u]?.barcode.trim() !== '');
             if (unitWithBarcode) mainBarcode = unitDetails[unitWithBarcode].barcode;
        }

        const selectedShop = shops.find(s => s.id.toString() === formData.shopId.toString());
        const selectedWarehouse = warehouses.find(w => w.id.toString() === formData.warehouseId.toString());

        const newStockItem: StockItem = {
            id: Date.now(),
            productName: formData.productName,
            productSN: `SN-${Date.now()}`, 
            customName: formData.customName || formData.productName,
            barcode: mainBarcode,
            category: formData.category || 'Unknown',
            quantity: parseFloat(formData.quantity),
            unit: formData.stockUnit,
            unitPrice: selling || 0, 
            currency: 'UGX',
            listedBy: 'Current User',
            listedOn: new Date(formData.date).toISOString(),
            shopName: formData.entityType === 'Shop' ? (selectedShop?.name || '') : `${selectedShop?.name || ''} - ${selectedWarehouse?.name || ''}`,
            shopId: parseInt(formData.shopId) || 0,
            manufacturer: formData.manufacturer,
            baseUnit: formData.baseUnit || 'Unit',
            hasMultipleSaleUnits: selectedUnits.length > 0,
            purchasingUnit: formData.purchasingUnit,
            reportUnit: formData.reportingUnit || formData.stockUnit, 
            containerPortion: formData.stockUnit,
            allowMix: false,
            remarks: formData.remarks || formData.description || `Opening Stock ${formData.invoiceNumber ? `(Inv: ${formData.invoiceNumber})` : ''}`,
            vatType: formData.vatType as any, 
            vatPercentage: formData.vatPercentage || 0,
            reorderPoint: parseFloat(formData.reorderPoint) || 0,
            supplier: formData.supplier || 'Unknown',
            unitPricings: formData.unitPricings.filter(p => selectedUnits.includes(p.unit)),
        };

        onSave(newStockItem);

        if ((formData as any).isNewProduct && onAddProduct) {
            const newProduct: ProductDefinition = {
                id: Date.now(),
                sn: `PDT-${Math.floor(Math.random() * 1000000)}`,
                name: formData.productName,
                barcode: mainBarcode,
                manufacturer: formData.manufacturer,
                status: 'ACTIVE',
                baseUnit: formData.baseUnit,
                baseQuantity: parseFloat(formData.baseQuantity) || 1,
                containerUnit: formData.containerUnit,
                containerQuantity: parseFloat(formData.containerQuantity) || 1,
                saleUnits: selectedUnits.join(', '),
                createdBy: 'Current User',
                createdAt: new Date().toISOString(),
                hasBatchNumber: true,
                hasExpiryDate: true,
                isGlobal: false,
                category: formData.category
            };
            onAddProduct(newProduct);
        }

        handleClose();
    };

    const unitOptions = Array.from(new Set([formData.baseUnit, ...Object.keys(unitDetails)])).filter(Boolean);

    const filteredProducts = productDefinitions.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.sn.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (!isOpen && !isClosing) return null;

    return (
        <>
        <PriceErrorModal 
            isOpen={priceError.isOpen} 
            onClose={() => setPriceError({ ...priceError, isOpen: false })} 
            message={priceError.message} 
            theme={theme} 
        />
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#15181C] w-full max-w-3xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-white">Add Opening Stock</h2>
                        <p className="text-[10px] text-gray-500 uppercase">Step {step} of 3: {step === 1 ? 'Product & Entity' : step === 2 ? 'Stock Listing' : 'Stock Information'}</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="px-6 pt-4 flex items-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 flex items-center gap-2">
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-[#FFB800]' : 'bg-white/10'}`} />
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Product & Entity Details</h3>
                                <div className="flex items-center gap-4">
                                    <Toggle 
                                        label="Existing Product" 
                                        checked={formData.isExistingProduct} 
                                        onChange={(val) => setFormData(prev => ({ ...prev, isExistingProduct: val, productName: '' }))} 
                                        theme={theme} 
                                    />
                                </div>
                            </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.isExistingProduct ? (
                                    <ValidatedSelect
                                        label="Product"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            const product = productDefinitions.find(p => p.name === e.target.value);
                                            if (product) handleProductSelect(product);
                                        }}
                                        error={errors.productName}
                                        required
                                        theme={theme}
                                    >
                                        <option value="">Select a product</option>
                                        {productDefinitions.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </ValidatedSelect>
                                ) : (
                                    <ValidatedInput
                                        label="Product Name"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleInputChange}
                                        error={errors.productName}
                                        required
                                        theme={theme}
                                        placeholder="Type product name"
                                    />
                                )}
                                <ValidatedSelect 
                                    label="Manufacturer" 
                                    name="manufacturer" 
                                    value={formData.manufacturer} 
                                    onChange={handleInputChange} 
                                    error={errors.manufacturer} 
                                    required 
                                    theme={theme}
                                >
                                    <option value="">Select Manufacturer</option>
                                    {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                                </ValidatedSelect>
                            </div>

                            {/* Entity Selection */}
                            <div className="grid grid-cols-1 gap-4">
                                {formData.entityType === 'Shop' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ValidatedSelect
                                            label="Entity Type"
                                            name="entityType"
                                            value={formData.entityType}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                setFormData(prev => ({ ...prev, entityType: e.target.value, shopId: '', warehouseId: '' }));
                                            }}
                                            theme={theme}
                                        >
                                            <option value="Shop">Shop</option>
                                            <option value="Warehouse">Warehouse</option>
                                        </ValidatedSelect>
                                        <ValidatedSelect
                                            label="Select Shop"
                                            name="shopId"
                                            value={formData.shopId}
                                            onChange={handleInputChange}
                                            error={errors.shopId}
                                            required
                                            theme={theme}
                                        >
                                            <option value="">Select a shop</option>
                                            {shops.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </ValidatedSelect>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-full">
                                            <ValidatedSelect
                                                label="Entity Type"
                                                name="entityType"
                                                value={formData.entityType}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    setFormData(prev => ({ ...prev, entityType: e.target.value, shopId: '', warehouseId: '' }));
                                                }}
                                                theme={theme}
                                            >
                                                <option value="Shop">Shop</option>
                                                <option value="Warehouse">Warehouse</option>
                                            </ValidatedSelect>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ValidatedSelect
                                                label="Select Shop"
                                                name="shopId"
                                                value={formData.shopId}
                                                onChange={handleInputChange}
                                                error={errors.shopId}
                                                required
                                                theme={theme}
                                            >
                                                <option value="">Select a shop</option>
                                                {shops.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </ValidatedSelect>
                                            <ValidatedSelect
                                                label="Select Warehouse"
                                                name="warehouseId"
                                                value={formData.warehouseId}
                                                onChange={handleInputChange}
                                                error={errors.warehouseId}
                                                required
                                                theme={theme}
                                            >
                                                <option value="">Select a warehouse</option>
                                                {warehouses.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                ))}
                                            </ValidatedSelect>
                                        </div>
                                    </>
                                )}
                            </div>

                                {/* Category and Status (Requested) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedSelect label="Category" name="category" value={formData.category} onChange={handleInputChange} error={errors.category} required theme={theme}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </ValidatedSelect>
                                    <ValidatedSelect label="Product Status" name="status" value={formData.status} onChange={handleInputChange} error={errors.status} required theme={theme}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="DISCONTINUED">Discontinued</option>
                                    </ValidatedSelect>
                                </div>

                                {/* Metrics Section (Requested) */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metrics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ValidatedSelect 
                                            label="Base Unit" 
                                            name="baseUnit" 
                                            value={formData.baseUnit} 
                                            onChange={handleInputChange} 
                                            error={errors.baseUnit} 
                                            required 
                                            theme={theme}
                                        >
                                            <option value="">Select Unit</option>
                                            {availableProductUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                        </ValidatedSelect>
                                        <ValidatedInput 
                                            label="Base Quantity" 
                                            name="baseQuantity" 
                                            value={formData.baseQuantity} 
                                            onChange={handleInputChange} 
                                            type="text" 
                                            error={errors.baseQuantity} 
                                            required 
                                            theme={theme} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ValidatedInput 
                                            label="Container Quantity" 
                                            name="containerQuantity" 
                                            value={formData.containerQuantity} 
                                            onChange={handleInputChange} 
                                            type="text" 
                                            error={errors.containerQuantity} 
                                            required 
                                            theme={theme} 
                                        />
                                        <ValidatedSelect 
                                            label="Container Unit" 
                                            name="containerUnit" 
                                            value={formData.containerUnit} 
                                            onChange={handleInputChange} 
                                            error={errors.containerUnit} 
                                            required 
                                            theme={theme}
                                        >
                                            <option value="">Select Unit</option>
                                            {availableProductUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                        </ValidatedSelect>
                                    </div>
                                </div>

                                 <div className="space-y-6 pt-4 border-t border-white/5">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Units</h4>
                                        <MultiSelect 
                                            label="Product Units" 
                                            options={availableProductUnits} 
                                            selected={selectedUnits} 
                                            onChange={handleMultiUnitChange} 
                                            required 
                                            theme={theme} 
                                            placeholder="Select additional units"
                                        />

                                        {selectedUnits.length > 0 && (
                                            <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/5">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit Name*</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quantity*</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Barcode</p>
                                                </div>
                                                {selectedUnits.map(unit => (
                                                    <div key={unit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                                        <ValidatedInput
                                                            value={unit}
                                                            readOnly
                                                            theme={theme}
                                                            className="w-full bg-[#0F1115] border border-white/10 rounded-md py-2 px-3 text-xs text-white opacity-70 cursor-not-allowed"
                                                        />
                                                        <ValidatedInput
                                                            value={unitDetails[unit]?.quantity || ''}
                                                            onChange={(e: any) => handleUnitDetailChange(unit, 'quantity', parseFloat(e.target.value))}
                                                            type="number"
                                                            theme={theme}
                                                            placeholder="1"
                                                        />
                                                        <ValidatedInput
                                                            value={unitDetails[unit]?.barcode || ''}
                                                            onChange={(e: any) => handleUnitDetailChange(unit, 'barcode', e.target.value)}
                                                            theme={theme}
                                                            placeholder="Barcode"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tracking & Availability</h4>
                                            <Toggle label="Batch Number Tracking" checked={formData.hasBatchNumber} onChange={(val) => setFormData(prev => ({ ...prev, hasBatchNumber: val }))} theme={theme} />
                                            <Toggle label="Expiry Date Tracking" checked={formData.hasExpiryDate} onChange={(val) => setFormData(prev => ({ ...prev, hasExpiryDate: val }))} theme={theme} />
                                            <Toggle label="Global Availability" checked={formData.isGlobal} onChange={(val) => setFormData(prev => ({ ...prev, isGlobal: val }))} theme={theme} />
                                            
                                            {!formData.isGlobal && (
                                                <div className="space-y-4 animate-fade-in">
                                                    <MultiSelect label="Continents" options={['Africa', 'Europe', 'Asia', 'North America', 'South America', 'Oceania']} selected={formData.continents} onChange={(val: string[]) => handleMultiSelectChange('continents', val)} theme={theme} />
                                                    <MultiSelect label="Economic Zones" options={['EAC', 'ECOWAS', 'SADC', 'COMESA', 'EU', 'ASEAN']} selected={formData.economicZones} onChange={(val: string[]) => handleMultiSelectChange('economicZones', val)} theme={theme} />
                                                    <MultiSelect label="Countries" options={allAfricanCountries.map(c => c.name)} selected={formData.countries} onChange={(val: string[]) => handleMultiSelectChange('countries', val)} theme={theme} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Image</h4>
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6 hover:border-[#FFB800]/30 transition-colors group relative overflow-hidden h-48">
                                                {formData.imageUrl ? (
                                                    <>
                                                        <img src={formData.imageUrl} alt="Product" className="absolute inset-0 w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                                                        <button onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Icon name="x-mark" className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="text-center">
                                                        <Icon name="camera" className="w-8 h-8 text-gray-500 mb-2 mx-auto group-hover:text-[#FFB800] transition-colors" />
                                                        <p className="text-xs text-gray-500">Click or drag to upload</p>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>

                                    <ValidatedTextArea label="Remarks / Description" name="description" value={formData.description} onChange={handleInputChange} theme={theme} />
                                </div>

                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Stock Listing Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedInput 
                                        label="Product Name" 
                                        name="productName" 
                                        value={formData.productName} 
                                        onChange={handleInputChange} 
                                        error={errors.productName} 
                                        required 
                                        theme={theme} 
                                        placeholder="Product Name"
                                        readOnly
                                    />
                                    <ValidatedInput 
                                        label="Custom Name" 
                                        name="customName" 
                                        value={formData.customName} 
                                        onChange={handleInputChange} 
                                        error={errors.customName} 
                                        required 
                                        theme={theme} 
                                        placeholder="e.g. Coca Cola 500ml (Promo)"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedSelect label="VAT Type" name="vatType" value={formData.vatType} onChange={handleInputChange} theme={theme}>
                                        <option value="None">None</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Zero">Zero Rated</option>
                                        <option value="Exempt">Exempt</option>
                                    </ValidatedSelect>
                                    <ValidatedSelect label="Default Purchasing Unit" name="purchasingUnit" value={formData.purchasingUnit} onChange={handleInputChange} theme={theme}>
                                        <option value="">Select Unit</option>
                                        {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                                    </ValidatedSelect>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedSelect label="Reporting Unit" name="reportingUnit" value={formData.reportingUnit} onChange={handleInputChange} theme={theme}>
                                        <option value="">Select Unit</option>
                                        {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                                    </ValidatedSelect>
                                    <ValidatedInput 
                                        label="Stock out alert quantity" 
                                        name="reorderPoint" 
                                        value={formData.reorderPoint} 
                                        onChange={handleInputChange} 
                                        type="text" 
                                        theme={theme} 
                                        placeholder="0.00"
                                    />
                                </div>

                                {formData.vatType !== 'None' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ValidatedInput 
                                            label="VAT Percentage (%)" 
                                            name="vatPercentage" 
                                            value={formData.vatPercentage} 
                                            onChange={(e: any) => {
                                                const val = e.target.value;
                                                if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                                                    setFormData(prev => ({ ...prev, vatPercentage: parseFloat(val) || 0 }));
                                                }
                                            }} 
                                            type="text" 
                                            theme={theme} 
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                            Available Units <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {unitOptions.map(unit => (
                                                <button
                                                    key={unit}
                                                    type="button"
                                                    onClick={() => {
                                                        const newSelected = selectedUnits.includes(unit)
                                                            ? selectedUnits.filter(u => u !== unit)
                                                            : [...selectedUnits, unit];
                                                        handleMultiUnitChange(newSelected);
                                                    }}
                                                    className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                                                        selectedUnits.includes(unit)
                                                            ? 'bg-[#FFB800] text-black'
                                                            : 'bg-transparent text-gray-400 border border-white/10 hover:border-[#FFB800]/50'
                                                    }`}
                                                >
                                                    {unit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.unitPricings.map((pricing, index) => {
                                            const isSelected = selectedUnits.includes(pricing.unit);
                                            return (
                                                <div 
                                                    key={pricing.unit} 
                                                    className={`bg-[#1A1D23] border rounded-lg overflow-hidden transition-all duration-300 ${
                                                        isSelected 
                                                            ? 'border-white/10 opacity-100 shadow-lg' 
                                                            : 'border-white/5 opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                >
                                                    <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Icon name="cog-6-tooth" className={`w-4 h-4 ${isSelected ? 'text-[#FFB800]' : 'text-gray-500'}`} />
                                                            <span className={`text-[11px] font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                                                Pricing Configuration for {pricing.unit}
                                                            </span>
                                                            {pricing.isDefaultSellingUnit && isSelected && (
                                                                <span className="bg-[#FFB800] text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                                                    Default Selling Unit
                                                                </span>
                                                            )}
                                                            {!isSelected && (
                                                                <span className="bg-white/5 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-white/5">
                                                                    Not Selected
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Icon name="chevron-up" className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div className="p-4 space-y-6">
                                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <Icon name="users" className="w-4 h-4 text-gray-500" />
                                                            <Toggle 
                                                                label="User-Specific Pricing" 
                                                                checked={true} 
                                                                onChange={() => {}} 
                                                                theme={theme}
                                                                showSwitch={false}
                                                            />
                                                        </div>
                                                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                                                        <Toggle 
                                                            label="Default Selling Unit" 
                                                            checked={pricing.isDefaultSellingUnit || false} 
                                                            onChange={(val: boolean) => handleUnitPricingChange(index, 'isDefaultSellingUnit', val)} 
                                                            theme={theme}
                                                        />
                                                        <Toggle 
                                                            label="Apply Default to All" 
                                                            checked={pricing.useDefaultPriceForAll} 
                                                            onChange={(val: boolean) => handleUnitPricingChange(index, 'useDefaultPriceForAll', val)} 
                                                            theme={theme}
                                                        />
                                                    </div>
                                                    <div className={pricing.useDefaultPriceForAll ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-4"}>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity in {pricing.unit}</label>
                                                            <div className="w-full bg-[#0F1115] border border-white/10 rounded-md py-2 px-3 text-xs text-gray-400">
                                                                {pricing.quantityInUnit} {pricing.unit}
                                                            </div>
                                                        </div>
                                                        {pricing.useDefaultPriceForAll && (
                                                            <>
                                                                <ValidatedInput 
                                                                    label="Lowest Price" 
                                                                    name={`lowestPrice-${index}`} 
                                                                    value={pricing.lowestPrice} 
                                                                    onChange={(e: any) => handleUnitPricingChange(index, 'lowestPrice', parseFloat(e.target.value) || 0)} 
                                                                    type="text" 
                                                                    theme={theme} 
                                                                    placeholder="0.00"
                                                                    className="text-right"
                                                                />
                                                                <ValidatedInput 
                                                                    label="Selling Price" 
                                                                    name={`recommendedPrice-${index}`} 
                                                                    value={pricing.recommendedPrice} 
                                                                    onChange={(e: any) => handleUnitPricingChange(index, 'recommendedPrice', parseFloat(e.target.value) || 0)} 
                                                                    type="text" 
                                                                    theme={theme} 
                                                                    placeholder="0.00"
                                                                    className="text-right"
                                                                />
                                                            </>
                                                        )}
                                                    </div>

                                                    {!pricing.useDefaultPriceForAll && (
                                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-bold text-gray-500 uppercase">Select Users</label>
                                                                <div className="relative">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setUserDropdownOpen(prev => ({ ...prev, [pricing.unit]: !prev[pricing.unit] }))}
                                                                        className={`w-full border border-white/5 rounded py-2 px-3 text-xs text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#15181C] text-gray-300 hover:border-white/10' : 'bg-white text-slate-700 hover:border-slate-300'}`}
                                                                    >
                                                                        <span className="truncate">
                                                                            {pricing.userPrices.length === 0 
                                                                                ? 'Select users...' 
                                                                                : pricing.userPrices.map(p => users.find(u => u.email === p.userId)?.name).join(', ')}
                                                                        </span>
                                                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userDropdownOpen[pricing.unit] ? 'rotate-180' : ''}`} />
                                                                    </button>

                                                                    <AnimatePresence>
                                                                        {userDropdownOpen[pricing.unit] && (
                                                                            <>
                                                                                <div 
                                                                                    className="fixed inset-0 z-[60]" 
                                                                                    onClick={() => setUserDropdownOpen(prev => ({ ...prev, [pricing.unit]: false }))}
                                                                                />
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, y: -10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: -10 }}
                                                                                    className={`absolute z-[70] left-0 right-0 mt-1 border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-[#1A1D21]' : 'bg-white'}`}
                                                                                >
                                                                                    {users.map(user => {
                                                                                        const isSelected = pricing.userPrices.some(p => p.userId === user.email);
                                                                                        return (
                                                                                            <div
                                                                                                key={user.email}
                                                                                                onClick={() => toggleUserSelection(index, user.email)}
                                                                                                className={`flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0`}
                                                                                            >
                                                                                                <div className="flex items-center gap-3 min-w-0">
                                                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FFB800] border-[#FFB800]' : 'border-white/20'}`}>
                                                                                                        {isSelected && <Check className="w-3 h-3 text-[#0F1115]" />}
                                                                                                    </div>
                                                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                                                        <div className="flex items-center justify-between gap-2">
                                                                                                            <span className={`text-xs font-bold truncate ${isSelected ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>
                                                                                                                {user.name}
                                                                                                            </span>
                                                                                                            <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                                                                                                                {maskPhone(user.phonePrimary)}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <span className="text-[9px] text-gray-500 uppercase tracking-wider">{user.role}</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </motion.div>
                                                                            </>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-3 gap-4 px-2 text-[9px] font-bold text-gray-500 uppercase">
                                                                    <span>User</span>
                                                                    <span className="text-right">Lowest</span>
                                                                    <span className="text-right">Selling Price</span>
                                                                </div>
                                                                {pricing.userPrices.map((up, userIdx) => {
                                                                    const user = users.find(u => u.email === up.userId);
                                                                    return (
                                                                        <div key={up.userId} className="grid grid-cols-3 items-center gap-4 p-2 bg-white/5 rounded border border-white/5">
                                                                            <div className="flex flex-col min-w-0">
                                                                                <div className="text-[10px] font-bold text-white truncate">{user?.name}</div>
                                                                                <div className="text-[8px] text-gray-500 uppercase">{user?.role}</div>
                                                                            </div>
                                                                            <div className="flex justify-end flex-col items-end">
                                                                                <input 
                                                                                    type="text" 
                                                                                    placeholder="0.00"
                                                                                    className="w-full bg-[#0F1115] border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFB800]/50 text-right"
                                                                                    value={up.lowestPrice} 
                                                                                    onChange={(e: any) => handleUserPriceChange(index, userIdx, 'lowestPrice', parseFloat(e.target.value) || 0)} 
                                                                                />
                                                                            </div>
                                                                            <div className="flex justify-end flex-col items-end">
                                                                                <input 
                                                                                    type="text" 
                                                                                    placeholder="0.00"
                                                                                    className="w-full bg-[#0F1115] border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFB800]/50 text-right"
                                                                                    value={up.recommendedPrice} 
                                                                                    onChange={(e: any) => handleUserPriceChange(index, userIdx, 'recommendedPrice', parseFloat(e.target.value) || 0)} 
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                                <ValidatedTextArea 
                                    label="Remarks" 
                                    name="remarks" 
                                    value={formData.remarks} 
                                    onChange={handleInputChange} 
                                    theme={theme} 
                                    placeholder="Add any additional remarks here..."
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Stock Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedSelect 
                                        label="Stock Unit" 
                                        name="stockUnit" 
                                        value={formData.stockUnit} 
                                        onChange={handleInputChange} 
                                        error={errors.stockUnit} 
                                        required 
                                        theme={theme}
                                    >
                                        <option value="">Select stocking unit</option>
                                        {portions.length > 0 ? (
                                            portions.map(p => <option key={p.name} value={p.name}>{p.name}</option>)
                                        ) : (
                                            availableProductUnits.map(u => <option key={u} value={u}>{u}</option>)
                                        )}
                                    </ValidatedSelect>
                                    <ValidatedInput 
                                        label="Opening Quantity" 
                                        name="quantity" 
                                        value={formData.quantity} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStockCalculation('quantity', e.target.value)} 
                                        error={errors.quantity} 
                                        required 
                                        type="number" 
                                        theme={theme} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedInput 
                                        label="Unit Purchasing Price" 
                                        name="unitPurchasingPrice" 
                                        value={formData.unitPurchasingPrice} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStockCalculation('unitPurchasingPrice', e.target.value)} 
                                        error={errors.unitPurchasingPrice} 
                                        required 
                                        type="number" 
                                        theme={theme} 
                                        placeholder="0.00"
                                    />
                                    <ValidatedInput 
                                        label="Purchase Amount" 
                                        name="purchaseAmount" 
                                        value={formData.purchaseAmount} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStockCalculation('purchaseAmount', e.target.value)} 
                                        error={errors.purchaseAmount} 
                                        required 
                                        type="number" 
                                        theme={theme} 
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedInput 
                                        label="Invoice Number" 
                                        name="invoiceNumber" 
                                        value={formData.invoiceNumber} 
                                        onChange={handleInputChange} 
                                        theme={theme} 
                                        placeholder="Invoice Number" 
                                    />
                                    <ValidatedInput 
                                        label="Purchase Date" 
                                        name="date" 
                                        value={formData.date} 
                                        onChange={handleInputChange} 
                                        error={errors.date} 
                                        required 
                                        type="date" 
                                        theme={theme} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedInput 
                                        label="Batch Number" 
                                        name="batchNumber" 
                                        value={formData.batchNumber} 
                                        onChange={handleInputChange} 
                                        theme={theme} 
                                        placeholder="Batch Number" 
                                    />
                                    <ValidatedInput 
                                        label="Expiry Date" 
                                        name="expiryDate" 
                                        value={formData.expiryDate} 
                                        onChange={handleInputChange} 
                                        type="date" 
                                        theme={theme} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <ValidatedSelect 
                                        label="Supplier" 
                                        name="supplier" 
                                        value={formData.supplier} 
                                        onChange={handleInputChange} 
                                        theme={theme}
                                    >
                                        {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                                    </ValidatedSelect>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex justify-between items-center p-6 border-t rounded-b-lg border-white/5 bg-black/50`}>
                    <div>
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm text-gray-300 bg-transparent border-white/10 hover:bg-white/5">
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm text-gray-300 bg-transparent border-white/10 hover:bg-white/5`}>
                            Cancel
                        </button>
                        {step < 3 ? (
                            <button 
                                onClick={() => {
                                    if (validateForm()) setStep(step + 1);
                                }} 
                                className="px-6 py-2.5 text-sm font-semibold text-[#0F1115] bg-[#FFB800] border border-transparent rounded-md shadow-sm hover:bg-[#FFB800]/90 flex items-center"
                            >
                                Next Step <Icon name="chevron-right" className="h-4 w-4 ml-2" />
                            </button>
                        ) : (
                            <button onClick={handleSave} className="px-6 py-2.5 text-sm font-semibold text-[#0F1115] bg-[#FFB800] border border-transparent rounded-md shadow-sm hover:bg-[#FFB800]/90 flex items-center">
                                <Icon name="check-circle" className="h-4 w-4 mr-2" /> Save Opening Stock
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default OpeningStockModal;

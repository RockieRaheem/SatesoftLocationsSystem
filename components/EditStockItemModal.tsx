
import React, { useState, useEffect } from 'react';
import { X, Info, ChevronDown, Check, Settings, Users, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Theme, StockItem, Shop, ProductDefinition, Unit, UnitPricing, User } from '../types';
import Icon from './Icon';
import { availableProductUnits } from '../data';

interface EditStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StockItem) => void;
  stockItem: StockItem | null; // If null, we are in "List Product" mode
  theme: Theme;
  shops?: Shop[];
  productDefinitions?: ProductDefinition[]; // Required for "List Product" mode
  users?: User[];
}

interface UnitRow {
    name: string;
    price: number;
}

const warehouses = [
    { id: 101, name: 'Main Warehouse - Kampala', isRegistered: true, settings: { isVatRegistered: true } },
    { id: 102, name: 'Distribution Center - Jinja', isRegistered: true, settings: { isVatRegistered: false } },
    { id: 103, name: 'Storage Unit B', isRegistered: false, settings: { isVatRegistered: false } }
];

const EditStockItemModal: React.FC<EditStockItemModalProps> = ({ isOpen, onClose, onSave, stockItem, theme, shops = [], productDefinitions = [], users = [] }) => {
    const [formData, setFormData] = useState<Partial<StockItem> & { defaultStockUnit?: string, lowStockAlert?: number }>({
        customName: '',
        quantity: 0,
        lowStockAlert: 0,
        unitPrice: 0,
        vatType: 'None',
        vatPercentage: 0,
        reportUnit: 'Piece',
        defaultStockUnit: 'Piece',
        containerPortion: 'Piece',
        allowMix: false,
        mixedProductIds: [],
        remarks: ''
    });
    const [isVatRegistered, setIsVatRegistered] = useState(false);
    const [selectedDefinitionId, setSelectedDefinitionId] = useState<number | ''>('');
    const [entityType, setEntityType] = useState<'Shop' | 'Warehouse'>('Shop');
    const [selectedShopIdForWarehouse, setSelectedShopIdForWarehouse] = useState<number | ''>('');
    const [selectableUnits, setSelectableUnits] = useState<string[]>(availableProductUnits);
    const [mixableProducts, setMixableProducts] = useState<ProductDefinition[]>([]);
    
    // State for managing multiple unit rows
    const [unitPricings, setUnitPricings] = useState<UnitPricing[]>([]);
    const [collapsedUnits, setCollapsedUnits] = useState<string[]>([]);
    const [userSectionCollapsed, setUserSectionCollapsed] = useState<Record<string, boolean>>({});
    const [userDropdownOpen, setUserDropdownOpen] = useState<Record<string, boolean>>({});
    const [mixDropdownOpen, setMixDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateMixableProducts = (currentDef: ProductDefinition | undefined) => {
        if (!currentDef || !productDefinitions) return [];
        
        return productDefinitions.filter(p => 
            p.id !== currentDef.id && 
            p.manufacturer === currentDef.manufacturer && 
            p.containerUnit === currentDef.containerUnit
        );
    };

    useEffect(() => {
        if (isOpen) {
            if (stockItem) {
                // Edit Mode
                setFormData({ 
                    ...stockItem,
                    customName: stockItem.customName || '',
                    quantity: stockItem.quantity || 0,
                    unitPrice: stockItem.unitPrice || 0,
                    vatType: stockItem.vatType || 'None',
                    vatPercentage: stockItem.vatPercentage || 0,
                    reportUnit: stockItem.reportUnit || stockItem.unit || 'Piece',
                    containerPortion: stockItem.containerPortion || stockItem.baseUnit || 'Piece',
                    allowMix: stockItem.allowMix || false,
                    mixedProductIds: stockItem.mixedProductIds || [],
                    remarks: stockItem.remarks || '',
                    defaultStockUnit: (stockItem as any).defaultStockUnit || stockItem.unit || 'Piece',
                    lowStockAlert: stockItem.reorderPoint || 0
                });
                setSelectedDefinitionId('');
                
                // Initialize unit pricings for edit
                if (stockItem.unitPricings && stockItem.unitPricings.length > 0) {
                    setUnitPricings(stockItem.unitPricings);
                } else {
                    setUnitPricings([{
                        unit: (stockItem.unit as Unit) || Unit.PIECE,
                        quantityInUnit: 1,
                        defaultPrice: stockItem.unitPrice,
                        recommendedPrice: stockItem.unitPrice,
                        lowestPrice: stockItem.unitPrice,
                        useDefaultPriceForAll: true,
                        userPrices: users.map(u => ({ userId: u.email, recommendedPrice: stockItem.unitPrice, lowestPrice: stockItem.unitPrice }))
                    }]);
                }

                // Determine VAT status based on location
                let entity: any = shops.find(s => s.id === stockItem.shopId);
                if (entity) {
                    setEntityType('Shop');
                } else {
                    entity = warehouses.find(w => w.id === stockItem.shopId);
                    if (entity) setEntityType('Warehouse');
                }
                
                setIsVatRegistered(!!(entity && entity.isRegistered && entity.settings && entity.settings.isVatRegistered));

                // Find product definition to get selectable units
                const def = productDefinitions?.find(p => p.sn === stockItem.productSN || p.name === stockItem.productName);
                if (def) {
                    const units = def.definedUnits ? def.definedUnits.map(du => du.unitName) : [];
                    if (def.baseUnit && !units.includes(def.baseUnit)) {
                        units.unshift(def.baseUnit);
                    }
                    setSelectableUnits(units.length > 0 ? units : availableProductUnits);
                    setMixableProducts(calculateMixableProducts(def));
                } else {
                    setSelectableUnits(availableProductUnits);
                    setMixableProducts([]);
                }

            } else {
                // Create Mode (List Product)
                setFormData({
                    customName: '',
                    quantity: 0,
                    lowStockAlert: 0,
                    unitPrice: 0,
                    vatType: 'None',
                    vatPercentage: 0,
                    reportUnit: 'Piece',
                    defaultStockUnit: 'Piece',
                    containerPortion: 'Piece',
                    allowMix: false,
                    mixedProductIds: [],
                    remarks: '',
                    shopId: shops.length > 0 ? shops[0].id : (warehouses.length > 0 ? warehouses[0].id : undefined)
                });
                setSelectedDefinitionId('');
                setEntityType(shops.length > 0 ? 'Shop' : 'Warehouse');
                setIsVatRegistered(false);
                setMixableProducts([]);
                
                // Default unit pricings
                setUnitPricings([{
                    unit: Unit.PIECE,
                    quantityInUnit: 1,
                    defaultPrice: 0,
                    recommendedPrice: 0,
                    lowestPrice: 0,
                    useDefaultPriceForAll: true,
                    userPrices: users.map(u => ({ userId: u.email, recommendedPrice: 0, lowestPrice: 0 }))
                }]);

                const initialEntity = shops.length > 0 ? shops[0] : (warehouses.length > 0 ? warehouses[0] : null);
                if (initialEntity) {
                    setIsVatRegistered(!!(initialEntity.isRegistered && initialEntity.settings?.isVatRegistered));
                }
                setSelectableUnits(availableProductUnits);
            }
        }
    }, [isOpen, stockItem, shops, users, productDefinitions]);

    const handleMixProductToggle = (productId: number) => {
        setFormData(prev => {
            const currentIds = prev.mixedProductIds || [];
            if (currentIds.includes(productId)) {
                return { ...prev, mixedProductIds: currentIds.filter(id => id !== productId) };
            } else {
                return { ...prev, mixedProductIds: [...currentIds, productId] };
            }
        });
    };

    const toggleCollapse = (unit: string) => {
        setCollapsedUnits(prev => 
            prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
        );
    };

    const toggleUserSection = (unit: string) => {
        setUserSectionCollapsed(prev => ({
            ...prev,
            [unit]: !prev[unit]
        }));
    };

    const getUnitDefaultQuantity = (unit: string): number => {
        switch (unit) {
            case 'Piece': return 1;
            case 'Box': return 24;
            case 'Pack': return 48;
            case 'Bottle': return 1;
            case 'Carton': return 144;
            default: return 1;
        }
    };

    const handlePriceInput = (value: string) => {
        const cleanValue = value.replace(/,/g, '');
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
    };

    const getInputValue = (value: number) => {
        if (value === 0) return '';
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getVatDetails = (price: number) => {
        const percentage = formData.vatPercentage || 0;
        if (formData.vatType === 'Standard' && percentage > 0) {
             const vatAmount = price * (percentage / 100);
             const finalPrice = price + vatAmount;
             return { vatAmount, baseAmount: price, finalPrice };
        }
        return { vatAmount: 0, baseAmount: price, finalPrice: price };
    };

    const formatPrice = (value: number) => {
        return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const defId = parseInt(e.target.value);
        setSelectedDefinitionId(defId);
        const def = productDefinitions?.find(p => p.id === defId);
        if (def) {
            setFormData(prev => ({
                ...prev,
                productName: def.name,
                productSN: def.sn,
                barcode: def.barcode,
                category: def.category || 'Unknown',
                unit: def.baseUnit,
                baseUnit: def.baseUnit,
                manufacturer: def.manufacturer,
                customName: def.name,
                reportUnit: def.baseUnit,
                defaultStockUnit: def.baseUnit,
                containerPortion: def.baseUnit
            }));
            // Update selectable units
            const units = def.definedUnits ? def.definedUnits.map(du => du.unitName) : [];
            if (def.baseUnit && !units.includes(def.baseUnit)) {
                units.unshift(def.baseUnit);
            }
            setSelectableUnits(units.length > 0 ? units : availableProductUnits);
            setMixableProducts(calculateMixableProducts(def));

            // Reset units to base unit of product
            setUnitPricings([{
                unit: (def.baseUnit as Unit) || Unit.PIECE,
                quantityInUnit: 1,
                defaultPrice: 0,
                recommendedPrice: 0,
                lowestPrice: 0,
                useDefaultPriceForAll: true,
                userPrices: users.map(u => ({ userId: u.email, recommendedPrice: 0, lowestPrice: 0 }))
            }]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        let val: any = value;
        if (type === 'checkbox') {
             val = (e.target as HTMLInputElement).checked;
        } else if (name === 'quantity' || name === 'unitPrice' || name === 'vatPercentage' || name === 'lowStockAlert') {
            val = value === '' ? '' : Number(value);
        }
        setFormData(prev => ({ ...prev, [name]: val }));
        
        // If changing default stock unit, sync price from rows
        if (name === 'defaultStockUnit') {
            const pricing = unitPricings.find(up => up.unit === value);
            if (pricing) {
                setFormData(prev => ({ ...prev, containerPortion: value, unitPrice: pricing.recommendedPrice }));
            }
        }
    };

    const handleToggleUnit = (unit: string) => {
        setUnitPricings(prev => {
            const exists = prev.find(up => up.unit === unit);
            if (exists) {
                if (prev.length <= 1) return prev;
                const newPricings = prev.filter(up => up.unit !== unit);
                if (formData.defaultStockUnit === unit && newPricings.length > 0) {
                     const newDefault = newPricings[0];
                     setFormData(f => ({ ...f, defaultStockUnit: newDefault.unit, containerPortion: newDefault.unit, unitPrice: newDefault.recommendedPrice }));
                }
                return newPricings;
            } else {
                return [...prev, {
                    unit: unit as Unit,
                    quantityInUnit: getUnitDefaultQuantity(unit),
                    defaultPrice: 0,
                    recommendedPrice: 0,
                    lowestPrice: 0,
                    useDefaultPriceForAll: true,
                    userPrices: users.map(u => ({ userId: u.email, recommendedPrice: 0, lowestPrice: 0 }))
                }].sort((a, b) => a.quantityInUnit - b.quantityInUnit);
            }
        });
    };

    const handleUnitPricingChange = (unit: string, field: keyof UnitPricing, value: any) => {
        setUnitPricings(prev => {
            const newPricings = prev.map(up => {
                if (up.unit !== unit) return up;
                const updated = { ...up, [field]: value };
                
                if (field === 'recommendedPrice' && up.useDefaultPriceForAll) {
                    updated.userPrices = up.userPrices.map(uprice => ({ ...uprice, recommendedPrice: value }));
                    if (up.unit === formData.defaultStockUnit) {
                        setFormData(f => ({ ...f, unitPrice: value }));
                    }
                }
                
                if (field === 'lowestPrice' && up.useDefaultPriceForAll) {
                    updated.userPrices = up.userPrices.map(uprice => ({ ...uprice, lowestPrice: value }));
                }
                
                if (field === 'useDefaultPriceForAll' && value === true) {
                    updated.userPrices = up.userPrices.map(uprice => ({ 
                        ...uprice, 
                        recommendedPrice: up.recommendedPrice,
                        lowestPrice: up.lowestPrice
                    }));
                }
                return updated;
            });

            if (field === 'quantityInUnit') {
                newPricings.sort((a, b) => a.quantityInUnit - b.quantityInUnit);
            }
            return newPricings;
        });
    };

    const handleUserPriceChange = (unit: string, userId: string, field: 'recommendedPrice' | 'lowestPrice', value: number) => {
        setUnitPricings(prev => prev.map(up => {
            if (up.unit !== unit) return up;
            return {
                ...up,
                userPrices: up.userPrices.map(userPrice => 
                    userPrice.userId === userId ? { ...userPrice, [field]: value } : userPrice
                )
            };
        }));
    };

    const toggleUserSelection = (unit: string, userId: string) => {
        setUnitPricings(prev => prev.map(up => {
            if (up.unit !== unit) return up;
            const exists = up.userPrices.some(p => p.userId === userId);
            if (exists) {
                return { ...up, userPrices: up.userPrices.filter(p => p.userId !== userId) };
            } else {
                return {
                    ...up,
                    userPrices: [...up.userPrices, { 
                        userId, 
                        recommendedPrice: up.recommendedPrice, 
                        lowestPrice: up.lowestPrice 
                    }]
                };
            }
        }));
    };

    const handleSetDefaultUnit = (unit: string) => {
        const pricing = unitPricings.find(up => up.unit === unit);
        setFormData(prev => ({
            ...prev,
            defaultStockUnit: unit,
            containerPortion: unit,
            unitPrice: pricing?.recommendedPrice || 0
        }));
    };

    const maskPhone = (phone: any) => {
        const phoneStr = typeof phone === 'string' ? phone : String(phone || '');
        if (!phoneStr || phoneStr.length < 4) return phoneStr;
        const countryCode = phoneStr.slice(0, 4);
        const prefix = phoneStr.slice(4, 7);
        const lastThree = phoneStr.slice(-3);
        return `${countryCode} ${prefix} *** ${lastThree}`;
    };
    
    const handleEntityTypeChange = (type: 'Shop' | 'Warehouse') => {
        setEntityType(type);
        const newEntities = type === 'Shop' ? shops : warehouses;
        if (newEntities.length > 0) {
            const firstEntity = newEntities[0];
            setFormData(prev => ({ ...prev, shopId: firstEntity.id }));
            setIsVatRegistered(!!(firstEntity.isRegistered && firstEntity.settings?.isVatRegistered));
        } else {
            setFormData(prev => ({ ...prev, shopId: undefined }));
            setIsVatRegistered(false);
        }
        
        if (type === 'Warehouse' && shops.length > 0) {
            setSelectedShopIdForWarehouse(shops[0].id);
        } else {
            setSelectedShopIdForWarehouse('');
        }
    };

    const handleEntityIdChange = (id: number) => {
        setFormData(prev => ({ ...prev, shopId: id }));
        const entity = entityType === 'Shop' ? shops.find(s => s.id === id) : warehouses.find(w => w.id === id);
        if (entity) {
            setIsVatRegistered(!!(entity.isRegistered && entity.settings?.isVatRegistered));
        }
    };

    const handleSave = () => {
        setError(null);
        // customName is no longer required
        if (formData.quantity === undefined) {
            setError("Please fill in required fields.");
            return;
        }
        
        // Ensure we have a product selected if in create mode
        if (!stockItem && !selectedDefinitionId) {
            setError("Please select a product.");
            return;
        }
        const defaultPricing = unitPricings.find(up => up.unit === formData.defaultStockUnit);
        if (!defaultPricing || defaultPricing.recommendedPrice <= 0) {
             setError("Please set a valid price for the selected product unit.");
             return;
        }

        const now = new Date().toISOString();

        const selectedEntity = entityType === 'Shop' 
            ? shops.find(s => s.id === formData.shopId) 
            : warehouses.find(w => w.id === formData.shopId);

        const payload: StockItem = {
            id: stockItem ? stockItem.id : Date.now(),
            productName: formData.productName || '',
            productSN: formData.productSN || '',
            customName: formData.customName || '',
            barcode: formData.barcode || '',
            category: formData.category || '',
            quantity: formData.quantity || 0,
            unit: formData.unit || defaultPricing.unit,
            unitPrice: defaultPricing.recommendedPrice,
            currency: formData.currency || 'UGX',
            listedBy: formData.listedBy || 'Current User',
            listedOn: stockItem ? stockItem.listedOn : now,
            shopName: selectedEntity ? selectedEntity.name : (stockItem ? stockItem.shopName : ''),
            shopId: formData.shopId || 0,
            manufacturer: formData.manufacturer || '',
            baseUnit: formData.baseUnit || '',
            hasMultipleSaleUnits: unitPricings.length > 1,
            reorderPoint: formData.lowStockAlert || 0,
            supplier: formData.supplier || '',
            vatType: formData.vatType as any,
            vatPercentage: formData.vatPercentage,
            reportUnit: formData.reportUnit,
            containerPortion: defaultPricing.unit,
            allowMix: formData.allowMix,
            mixedProductIds: formData.allowMix ? formData.mixedProductIds : [],
            remarks: formData.remarks,
            unitPricings: unitPricings
        };

        onSave(payload);
        onClose();
    };

    if (!isOpen) return null;

    const unitOptions = availableProductUnits.slice(0, 5); 

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`${theme === 'dark' ? 'bg-[#15181C] border-white/10' : 'bg-white border-slate-200'} w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex flex-col">
                        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {stockItem ? 'Edit listed product' : 'List product'}
                        </h2>
                        <p className="text-[10px] text-gray-500 uppercase">
                            {stockItem ? 'Update stock and pricing' : 'Configure stock and pricing'}
                        </p>
                    </div>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-colors`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* Entity Type and Shop Selection Row */}
                    {entityType === 'Shop' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Entity Type <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        value={entityType} 
                                        onChange={(e) => handleEntityTypeChange(e.target.value as 'Shop' | 'Warehouse')} 
                                        className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    >
                                        <option value="Shop">Shop</option>
                                        <option value="Warehouse">Warehouse</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Shop <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        value={formData.shopId || ''} 
                                        onChange={(e) => handleEntityIdChange(Number(e.target.value))} 
                                        className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    >
                                        {shops.map(entity => (
                                            <option key={entity.id} value={entity.id}>{entity.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Entity Type <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        value={entityType} 
                                        onChange={(e) => handleEntityTypeChange(e.target.value as 'Shop' | 'Warehouse')} 
                                        className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    >
                                        <option value="Shop">Shop</option>
                                        <option value="Warehouse">Warehouse</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Shop <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={selectedShopIdForWarehouse || ''} 
                                            onChange={(e) => setSelectedShopIdForWarehouse(Number(e.target.value))} 
                                            className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="">Select Shop...</option>
                                            {shops.map(entity => (
                                                <option key={entity.id} value={entity.id}>{entity.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Warehouse <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={formData.shopId || ''} 
                                            onChange={(e) => handleEntityIdChange(Number(e.target.value))} 
                                            className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            {warehouses.map(entity => (
                                                <option key={entity.id} value={entity.id}>{entity.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product and Custom Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!stockItem && productDefinitions && (
                            <div className="space-y-1.5">
                                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Select Product <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        value={selectedDefinitionId} 
                                        onChange={handleProductChange} 
                                        className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    >
                                        <option value="">Choose a product definition...</option>
                                        {productDefinitions.map(pd => (
                                            <option key={pd.id} value={pd.id}>{pd.name} ({pd.sn})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Custom name
                            </label>
                            <input 
                                type="text" 
                                name="customName" 
                                value={formData.customName || ''} 
                                onChange={handleInputChange} 
                                placeholder="Display name"
                                className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isVatRegistered && (
                            <div className="space-y-1.5">
                                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    VAT type <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        name="vatType" 
                                        value={formData.vatType} 
                                        onChange={handleInputChange} 
                                        className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    >
                                        <option value="None">None</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Zero Rated">Zero Rated</option>
                                        <option value="Exempt">Exempt</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Default Purchasing Unit <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select 
                                    name="defaultStockUnit" 
                                    value={formData.defaultStockUnit || ''} 
                                    onChange={handleInputChange} 
                                    disabled={!selectedDefinitionId && !stockItem}
                                    className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${!selectedDefinitionId && !stockItem ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                >
                                    <option value="">Select unit</option>
                                    {selectableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Report unit <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select 
                                    name="reportUnit" 
                                    value={formData.reportUnit || ''} 
                                    onChange={handleInputChange} 
                                    disabled={!selectedDefinitionId && !stockItem}
                                    className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${!selectedDefinitionId && !stockItem ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                >
                                    <option value="">Select unit</option>
                                    {selectableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Low stock alert quantity (based on {formData.reportUnit || 'report unit'})
                            </label>
                            <input 
                                type="number" 
                                name="lowStockAlert" 
                                value={formData.lowStockAlert} 
                                onChange={handleInputChange} 
                                className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            />
                        </div>
                    </div>

                    {(selectedDefinitionId || stockItem) && (
                        <>
                            <div className="space-y-3">
                                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Available Units <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectableUnits.map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleToggleUnit(opt)}
                                            className={`px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                                                unitPricings.some(up => up.unit === opt)
                                                ? 'bg-[#FFB800] text-[#0F1115]' 
                                                : (theme === 'dark' ? 'bg-[#0F1115] text-slate-500 border border-white/10 hover:border-white/20' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300')
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Rows for Selected Units */}
                            <AnimatePresence>
                                {unitPricings.map((up) => (
                                    <motion.div 
                                        key={up.unit}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-4 border-t border-white/5 overflow-hidden"
                                    >
                                        <div 
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => toggleCollapse(up.unit)}
                                        >
                                            <div className="flex items-center gap-3 text-[#FFB800]">
                                                <Settings className="w-4 h-4" />
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider">Pricing Configuration for {up.unit}</h3>
                                                    {formData.defaultStockUnit === up.unit && (
                                                        <span className="bg-[#FFB800] text-[#0F1115] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Default Selling Unit</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${collapsedUnits.includes(up.unit) ? '' : 'rotate-180'}`} />
                                        </div>

                                        {!collapsedUnits.includes(up.unit) && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4"
                                            >
                                                <div className={`${theme === 'dark' ? 'bg-[#0F1115] border-white/5' : 'bg-slate-50 border-slate-200'} p-4 rounded-lg border space-y-4`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div 
                                                                className="flex items-center gap-2 cursor-pointer"
                                                                onClick={() => toggleUserSection(up.unit)}
                                                            >
                                                                <Users className="w-4 h-4 text-gray-400" />
                                                                <span className="text-[10px] font-bold text-gray-300 uppercase">User-Specific Pricing</span>
                                                                <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${userSectionCollapsed[up.unit] ? '' : 'rotate-180'}`} />
                                                            </div>
                                                            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                                                                <span className="text-[9px] text-gray-500 uppercase font-bold">Default Selling Unit</span>
                                                                <button 
                                                                    onClick={() => handleSetDefaultUnit(up.unit)}
                                                                    className={`w-8 h-4 rounded-full relative transition-colors ${formData.defaultStockUnit === up.unit ? 'bg-[#FFB800]' : 'bg-gray-700'}`}
                                                                >
                                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.defaultStockUnit === up.unit ? 'right-0.5' : 'left-0.5'}`} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] text-gray-500 uppercase font-bold">Apply default to all</span>
                                                            <button 
                                                                onClick={() => handleUnitPricingChange(up.unit, 'useDefaultPriceForAll', !up.useDefaultPriceForAll)}
                                                                className={`w-8 h-4 rounded-full relative transition-colors ${up.useDefaultPriceForAll ? 'bg-[#FFB800]' : 'bg-gray-700'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${up.useDefaultPriceForAll ? 'right-0.5' : 'left-0.5'}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {up.useDefaultPriceForAll ? (
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity in {up.unit}</label>
                                                                    <input 
                                                                        type="text" 
                                                                        readOnly
                                                                        className={`w-full border border-white/5 rounded-md py-2 px-3 text-xs cursor-not-allowed ${theme === 'dark' ? 'bg-[#15181C] text-gray-400' : 'bg-white text-slate-500'}`}
                                                                        value={`${up.quantityInUnit} ${formData.defaultStockUnit}`}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase text-right block">Lowest Price</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="0.00"
                                                                        className={`w-full rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 text-right ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                                                        value={getInputValue(up.lowestPrice)}
                                                                        onChange={(e) => handleUnitPricingChange(up.unit, 'lowestPrice', handlePriceInput(e.target.value))}
                                                                    />
                                                                    {formData.vatType !== 'None' && up.lowestPrice > 0 && (
                                                                        <p className="text-[9px] text-gray-500 text-right">
                                                                            {`Final: ${formatPrice(getVatDetails(up.lowestPrice).finalPrice)} (VAT: +${formatPrice(getVatDetails(up.lowestPrice).vatAmount)})`}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase text-right block">Selling Price</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="0.00"
                                                                        className={`w-full rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 text-right ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                                                        value={getInputValue(up.recommendedPrice)}
                                                                        onChange={(e) => handleUnitPricingChange(up.unit, 'recommendedPrice', handlePriceInput(e.target.value))}
                                                                    />
                                                                    {formData.vatType !== 'None' && up.recommendedPrice > 0 && (
                                                                        <p className="text-[9px] text-gray-500 text-right">
                                                                            {`Final: ${formatPrice(getVatDetails(up.recommendedPrice).finalPrice)} (VAT: +${formatPrice(getVatDetails(up.recommendedPrice).vatAmount)})`}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity in {up.unit}</label>
                                                            <input 
                                                                type="text" 
                                                                readOnly
                                                                className={`w-full border border-white/5 rounded-md py-2 px-3 text-xs cursor-not-allowed ${theme === 'dark' ? 'bg-[#15181C] text-gray-400' : 'bg-white text-slate-500'}`}
                                                                value={`${up.quantityInUnit} ${formData.defaultStockUnit}`}
                                                            />
                                                        </div>

                                                        <div className="space-y-3 pt-2 border-t border-white/5">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-bold text-gray-500 uppercase">Select Users</label>
                                                                <div className="relative">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setUserDropdownOpen(prev => ({ ...prev, [up.unit]: !prev[up.unit] }))}
                                                                        className={`w-full border border-white/5 rounded py-2 px-3 text-xs text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#15181C] text-gray-300 hover:border-white/10' : 'bg-white text-slate-700 hover:border-slate-300'}`}
                                                                    >
                                                                        <span className="truncate">
                                                                            {up.userPrices.length === 0 
                                                                                ? 'Select users...' 
                                                                                : up.userPrices.map(p => users.find(u => u.email === p.userId)?.name).join(', ')}
                                                                        </span>
                                                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userDropdownOpen[up.unit] ? 'rotate-180' : ''}`} />
                                                                    </button>

                                                                    <AnimatePresence>
                                                                        {userDropdownOpen[up.unit] && (
                                                                            <>
                                                                                <div 
                                                                                    className="fixed inset-0 z-[60]" 
                                                                                    onClick={() => setUserDropdownOpen(prev => ({ ...prev, [up.unit]: false }))}
                                                                                />
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, y: -10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: -10 }}
                                                                                    className={`absolute z-[70] left-0 right-0 mt-1 border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-[#1A1D21]' : 'bg-white'}`}
                                                                                >
                                                                                    {users.map(user => {
                                                                                        const isSelected = up.userPrices.some(p => p.userId === user.email);
                                                                                        return (
                                                                                            <div
                                                                                                key={user.email}
                                                                                                onClick={() => toggleUserSelection(up.unit, user.email)}
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

                                                            {!userSectionCollapsed[up.unit] && (
                                                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                                                    <div className="grid grid-cols-3 gap-4 px-2 text-[9px] font-bold text-gray-500 uppercase">
                                                                        <span>User</span>
                                                                        <span className="text-center">Lowest</span>
                                                                        <span className="text-right">Selling Price</span>
                                                                    </div>
                                                                    {up.userPrices.map(userPrice => {
                                                                        const user = users.find(u => u.email === userPrice.userId);
                                                                        if (!user) return null;
                                                                        return (
                                                                            <div key={user.email} className={`grid grid-cols-3 items-center gap-4 p-2 rounded border border-white/5 ${theme === 'dark' ? 'bg-[#15181C]' : 'bg-white'}`}>
                                                                                <div className="flex flex-col min-w-0">
                                                                                    <span className={`text-[10px] font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
                                                                                    <span className="text-[8px] text-gray-500 uppercase">{user.role}</span>
                                                                                </div>
                                                                                <div className="flex justify-end flex-col items-end">
                                                                                    <input 
                                                                                        type="text" 
                                                                                        placeholder="0.00"
                                                                                        className={`w-full max-w-[80px] border border-white/10 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#FFB800]/50 text-right ${theme === 'dark' ? 'bg-[#0F1115] text-white' : 'bg-white text-slate-900'}`}
                                                                                        value={getInputValue(userPrice.lowestPrice)}
                                                                                        onChange={(e) => handleUserPriceChange(up.unit, user.email, 'lowestPrice', handlePriceInput(e.target.value))}
                                                                                    />
                                                                                    {formData.vatType !== 'None' && userPrice.lowestPrice > 0 && (
                                                                                        <span className="text-[8px] text-gray-500 mt-0.5">
                                                                                            {`+${formatPrice(getVatDetails(userPrice.lowestPrice).vatAmount)} VAT`}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex justify-end flex-col items-end">
                                                                                    <input 
                                                                                        type="text" 
                                                                                        placeholder="0.00"
                                                                                        className={`w-full max-w-[80px] border border-white/10 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#FFB800]/50 text-right ${theme === 'dark' ? 'bg-[#0F1115] text-white' : 'bg-white text-slate-900'}`}
                                                                                        value={getInputValue(userPrice.recommendedPrice)}
                                                                                        onChange={(e) => handleUserPriceChange(up.unit, user.email, 'recommendedPrice', handlePriceInput(e.target.value))}
                                                                                    />
                                                                                    {formData.vatType !== 'None' && userPrice.recommendedPrice > 0 && (
                                                                                        <span className="text-[8px] text-gray-500 mt-0.5">
                                                                                            {`+${formatPrice(getVatDetails(userPrice.recommendedPrice).vatAmount)} VAT`}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                        </>
                    )}

                    <div className={`flex flex-col gap-3 pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Allow mix</span>
                            <button 
                                type="button" 
                                disabled={mixableProducts.length === 0}
                                onClick={() => setFormData(prev => ({...prev, allowMix: !prev.allowMix}))}
                                className={`w-10 h-5 rounded-full relative transition-colors ${formData.allowMix ? 'bg-green-500' : (theme === 'dark' ? 'bg-gray-700' : 'bg-slate-200')} ${mixableProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.allowMix ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {formData.allowMix && mixableProducts.length > 0 && (
                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Select Mixed Products</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setMixDropdownOpen(!mixDropdownOpen)}
                                        className={`w-full border border-white/5 rounded py-2 px-3 text-xs text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#0F1115] text-gray-300 hover:border-white/10' : 'bg-white text-slate-700 hover:border-slate-300'}`}
                                    >
                                        <span className="truncate">
                                            {formData.mixedProductIds?.length === 0 
                                                ? 'Select products...' 
                                                : formData.mixedProductIds?.map(id => mixableProducts.find(p => p.id === id)?.name).join(', ')}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mixDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {mixDropdownOpen && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-[60]" 
                                                    onClick={() => setMixDropdownOpen(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className={`absolute z-[70] left-0 right-0 mt-1 border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-[#1A1D21]' : 'bg-white'}`}
                                                >
                                                    {mixableProducts.map(product => {
                                                        const isSelected = formData.mixedProductIds?.includes(product.id);
                                                        return (
                                                            <div
                                                                key={product.id}
                                                                onClick={() => handleMixProductToggle(product.id)}
                                                                className={`flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FFB800] border-[#FFB800]' : 'border-white/20'}`}>
                                                                        {isSelected && <Check className="w-3 h-3 text-[#0F1115]" />}
                                                                    </div>
                                                                    <span className={`text-xs font-bold truncate ${isSelected ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>
                                                                        {product.name}
                                                                    </span>
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
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className={`text-[11px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks</label>
                        <textarea 
                            name="remarks" 
                            value={formData.remarks || ''} 
                            onChange={handleInputChange} 
                            placeholder="Enter any additional notes..."
                            className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 min-h-[80px] ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            rows={3}
                        ></textarea>
                    </div>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex flex-col gap-3 ${theme === 'dark' ? 'border-white/5 bg-[#15181C]' : 'border-slate-100 bg-slate-50'}`}>
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase bg-red-500/10 px-3 py-2 rounded border border-red-500/20 mb-1">
                            <ShieldAlert className="w-3 h-3" />
                            {error}
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={onClose} 
                            className={`px-6 py-2 rounded-md text-xs font-bold transition-colors border ${theme === 'dark' ? 'text-white bg-[#0F1115] border-white/10 hover:bg-white/5' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'}`}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-6 py-2 rounded-md text-xs font-bold text-[#0F1115] bg-[#FFB800] hover:bg-[#E6A600] flex items-center gap-2 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditStockItemModal;

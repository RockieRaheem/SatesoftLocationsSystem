import React, { useState, useEffect } from 'react';
import { X, Info, ChevronDown, Check, Users, ShieldAlert, Settings, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Unit, User, Product, UserPrice, ProductFormData, UnitPricing, Shop } from '../types';

interface ListProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ProductFormData) => void;
  users: User[];
  initialData?: Product;
  shopSettings?: Shop['settings'];
  theme: 'light' | 'dark';
}

export const ListProductModal = ({ isOpen, onClose, onSave, users, initialData, shopSettings, theme }: ListProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    locationType: 'Shop',
    shop: '',
    product: initialData ? (initialData.name.includes('Colgate') ? 'p1' : 'p2') : '',
    customName: initialData?.customName || '',
    quantity: initialData?.quantity || 0,
    lowStockAlert: initialData?.lowStockAlert || 0,
    vatType: 'None',
        vatPercentage: (initialData?.vatPercentage || shopSettings?.vatPercentage || 0),
        defaultUnit: (initialData?.unit as Unit) || Unit.PIECE,
        reportUnit: (initialData?.unit as Unit) || Unit.PIECE,
    availableUnits: initialData?.unitPricings?.map(up => up.unit) || [Unit.PIECE],
    unitPricings: initialData?.unitPricings || [{
      unit: Unit.PIECE,
      quantityInUnit: 1,
      defaultPrice: 0,
      recommendedPrice: 0,
      lowestPrice: 0,
      useDefaultPriceForAll: true,
      userPrices: users.map(u => ({ userId: u.email, recommendedPrice: 0, lowestPrice: 0 }))
    }],
    allowMix: false,
    remarks: ''
  });

  // Default settings if none provided
  const settings = shopSettings || {
    allowCredit: true,
    compulsoryClientInfo: false,
    collectClientInfo: true,
    allowHoldTransaction: true,
    isVatRegistered: true,
    vatPercentage: 0,
    allowMobileMoneyPayment: true,
    allowCardPayment: false,
    allowWalletCheckout: true,
    enableWallets: true,
    allowWalletDebt: true,
    allowWalletDeposits: true,
    allowPricePerUser: true,
    allowMixFeature: true
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        locationType: 'Shop',
        shop: '',
        product: initialData.name.includes('Colgate') ? 'p1' : 'p2',
        customName: initialData.customName || '',
        quantity: initialData.quantity || 0,
        lowStockAlert: initialData.lowStockAlert || 0,
        vatType: 'None',
        vatPercentage: shopSettings?.vatPercentage || 0,
        defaultUnit: (initialData.unit as Unit) || Unit.PIECE,
        reportUnit: (initialData.unit as Unit) || Unit.PIECE,
        availableUnits: initialData.unitPricings?.map(up => up.unit) || [Unit.PIECE],
        unitPricings: initialData.unitPricings || [],
        allowMix: false,
        remarks: ''
      });
    }
  }, [initialData, shopSettings]);

  const getUnitDefaultQuantity = (unit: Unit): number => {
    switch (unit) {
      case Unit.PIECE: return 1;
      case Unit.BOX: return 24;
      case Unit.PACK: return 48;
      case Unit.BOTTLE: return 1;
      case Unit.CARTON: return 144;
      default: return 1;
    }
  };

  const toggleUnit = (unit: Unit) => {
    setFormData(prev => {
      const isSelected = prev.availableUnits.includes(unit);
      const newAvailableUnits = isSelected
        ? prev.availableUnits.filter(u => u !== unit)
        : [...prev.availableUnits, unit];
      
      let newUnitPricings = isSelected
        ? prev.unitPricings.filter(up => up.unit !== unit)
        : [...prev.unitPricings, {
            unit,
            quantityInUnit: getUnitDefaultQuantity(unit),
            defaultPrice: 0,
            recommendedPrice: 0,
            lowestPrice: 0,
            useDefaultPriceForAll: true,
            userPrices: users.map(u => ({ userId: u.email, recommendedPrice: 0, lowestPrice: 0 }))
          }];

      // Sort by quantityInUnit
      newUnitPricings = [...newUnitPricings].sort((a, b) => a.quantityInUnit - b.quantityInUnit);

      let newDefaultUnit = prev.defaultUnit;
      if (!newAvailableUnits.includes(prev.defaultUnit)) {
        newDefaultUnit = newAvailableUnits.length > 0 ? newAvailableUnits[0] : Unit.PIECE;
      }

      return {
        ...prev,
        availableUnits: newAvailableUnits,
        unitPricings: newUnitPricings,
        defaultUnit: newDefaultUnit
      };
    });
  };

  const handleUnitPricingChange = (unit: Unit, field: keyof UnitPricing, value: any) => {
    setFormData(prev => {
      const newUnitPricings = prev.unitPricings.map(up => {
        if (up.unit !== unit) return up;
        
        let updated = { ...up, [field]: value };
        
        // Logic for "Apply Default to All"
        if (updated.useDefaultPriceForAll) {
          if (field === 'recommendedPrice' || field === 'lowestPrice') {
            updated.userPrices = updated.userPrices.map(userPrice => ({
              ...userPrice,
              [field]: value
            }));
          } else if (field === 'useDefaultPriceForAll' && value === true) {
            // When toggled ON, sync all user prices to default
            updated.userPrices = updated.userPrices.map(userPrice => ({
              ...userPrice,
              recommendedPrice: updated.recommendedPrice,
              lowestPrice: updated.lowestPrice
            }));
          }
        }

        return updated;
      });

      // If quantityInUnit changed, re-sort
      if (field === 'quantityInUnit') {
        newUnitPricings.sort((a, b) => a.quantityInUnit - b.quantityInUnit);
      }

      return {
        ...prev,
        unitPricings: newUnitPricings,
      };
    });
  };

  const handleUserPriceChange = (unit: Unit, userId: string, field: keyof UserPrice, value: number) => {
    setFormData(prev => ({
      ...prev,
      unitPricings: prev.unitPricings.map(up => {
        if (up.unit !== unit) return up;
        return {
          ...up,
          userPrices: up.userPrices.map(userPrice => {
            if (userPrice.userId !== userId) return userPrice;
            return { ...userPrice, [field]: value };
          })
        };
      })
    }));
  };

  const handleSetDefaultUnit = (unit: Unit) => {
    setFormData(prev => ({
      ...prev,
      defaultUnit: unit
    }));
  };

  const [collapsedUnits, setCollapsedUnits] = useState<Unit[]>([]);

  const toggleCollapse = (unit: Unit) => {
    setCollapsedUnits(prev => 
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const [userSectionCollapsed, setUserSectionCollapsed] = useState<Record<string, boolean>>({});
  const [userDropdownOpen, setUserDropdownOpen] = useState<Record<string, boolean>>({});

  const maskPhone = (phone: any) => {
    const phoneStr = typeof phone === 'string' ? phone : String(phone || '');
    if (!phoneStr || phoneStr.length < 4) return phoneStr;
    // Assuming format +256701234567
    const countryCode = phoneStr.slice(0, 4); // +256
    const prefix = phoneStr.slice(4, 7); // 701
    const lastThree = phoneStr.slice(-3); // 567
    return `${countryCode} ${prefix} *** ${lastThree}`;
  };

  const toggleUserSection = (unit: Unit) => {
    setUserSectionCollapsed(prev => ({
      ...prev,
      [unit]: !prev[unit]
    }));
  };

  const toggleUserSelection = (unit: Unit, userId: string) => {
    setFormData(prev => ({
      ...prev,
      unitPricings: prev.unitPricings.map(up => {
        if (up.unit !== unit) return up;
        const exists = up.userPrices.some(p => p.userId === userId);
        if (exists) {
          return {
            ...up,
            userPrices: up.userPrices.filter(p => p.userId !== userId)
          };
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
      })
    }));
  };

  const validateForm = () => {
    if (!formData.product || !formData.customName || formData.quantity <= 0) {
      alert('Please fill in all required fields and ensure quantity is greater than 0.');
      return false;
    }

    for (const up of formData.unitPricings) {
      if (!up.useDefaultPriceForAll) {
        if (up.userPrices.length === 0) {
          alert(`Please select at least one user for ${up.unit} pricing or use default pricing.`);
          return false;
        }
        for (const userPrice of up.userPrices) {
          if (userPrice.recommendedPrice <= 0 || userPrice.lowestPrice <= 0) {
            alert(`Prices for user ${users.find(u => u.email === userPrice.userId)?.name} in ${up.unit} cannot be 0.`);
            return false;
          }
        }
      } else {
        if (up.recommendedPrice <= 0 || up.lowestPrice <= 0) {
          alert(`Default prices for ${up.unit} cannot be 0.`);
          return false;
        }
      }
    }
    return true;
  };

  const [showConfirmation, setShowConfirmation] = useState(false);

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
    const percentage = parseFloat(formData.vatPercentage.toString()) || 0;
    if (formData.vatType === 'Inclusive') {
      const vatAmount = price * (percentage / (100 + percentage));
      const baseAmount = price - vatAmount;
      return { vatAmount, baseAmount, finalPrice: price };
    } else if (formData.vatType === 'Exclusive') {
      const vatAmount = price * (percentage / 100);
      const finalPrice = price + vatAmount;
      return { vatAmount, baseAmount: price, finalPrice };
    }
    return { vatAmount: 0, baseAmount: price, finalPrice: price };
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isOpen) return null;

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
            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{initialData ? 'Edit product' : 'List product'}</h2>
            <p className="text-[10px] text-gray-500 uppercase">{initialData ? 'Update stock and pricing' : 'Configure stock and pricing'}</p>
          </div>
          <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-colors`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Select Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              >
                <option value="">Choose a product definition...</option>
                <option value="p1">Colgate Herbal Toothpaste 35g</option>
                <option value="p2">Coca Cola 500ml</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Custom name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="Display name"
              className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              value={formData.customName}
              onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.isVatRegistered && (
              <div className="space-y-1.5">
                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  VAT type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    value={formData.vatType}
                    onChange={(e) => setFormData({ ...formData, vatType: e.target.value })}
                  >
                    <option>None</option>
                    <option>Inclusive</option>
                    <option>Exclusive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            )}
            {settings.isVatRegistered && formData.vatType !== 'None' && (
              <div className="space-y-1.5">
                <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  VAT Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  value={formData.vatPercentage.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                      setFormData({ ...formData, vatPercentage: parseFloat(val) || 0 });
                    }
                  }}
                  placeholder="0.00"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Default Purchasing Unit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  value={formData.defaultUnit}
                  onChange={(e) => handleSetDefaultUnit(e.target.value as Unit)}
                >
                  {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Quantity <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                min="0"
                className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Low stock alert quantity
              </label>
              <input 
                type="number" 
                min="0"
                className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                value={formData.lowStockAlert}
                onChange={(e) => setFormData({ ...formData, lowStockAlert: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Report unit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 appearance-none ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                value={formData.reportUnit}
                onChange={(e) => setFormData({ ...formData, reportUnit: e.target.value as Unit })}
              >
                {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <label className={`text-[11px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Available Units <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(Unit).map(u => (
                <button
                  key={u}
                  onClick={() => toggleUnit(u)}
                  className={`px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                    formData.availableUnits.includes(u)
                      ? 'bg-[#FFB800] text-[#0F1115]'
                      : (theme === 'dark' ? 'bg-[#0F1115] text-slate-500 border border-white/10 hover:border-white/20' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300')
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Pricing Sections for Each Selected Unit */}
          <AnimatePresence>
            {formData.unitPricings.map((up) => (
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
                      {formData.defaultUnit === up.unit && (
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
                    <div className="bg-[#0F1115] p-4 rounded-lg border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {settings.allowPricePerUser && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-[10px] font-bold text-gray-300 uppercase">User-Specific Pricing</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-2 ${settings.allowPricePerUser ? 'pl-4 border-l border-white/10' : ''}`}>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Default Selling Unit</span>
                            <button 
                              onClick={() => handleSetDefaultUnit(up.unit)}
                              className={`w-8 h-4 rounded-full relative transition-colors ${formData.defaultUnit === up.unit ? 'bg-[#FFB800]' : 'bg-gray-700'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.defaultUnit === up.unit ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                        {settings.allowPricePerUser && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Apply default to all</span>
                            <button 
                              onClick={() => handleUnitPricingChange(up.unit, 'useDefaultPriceForAll', !up.useDefaultPriceForAll)}
                              className={`w-8 h-4 rounded-full relative transition-colors ${up.useDefaultPriceForAll ? 'bg-[#FFB800]' : 'bg-gray-700'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${up.useDefaultPriceForAll ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className={up.useDefaultPriceForAll ? "grid grid-cols-3 gap-4" : "space-y-4"}>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity in {up.unit}</label>
                            <input 
                              type="text" 
                              readOnly
                              className="w-full bg-[#15181C] border border-white/5 rounded-md py-2 px-3 text-xs text-gray-400 cursor-not-allowed"
                              value={`${up.quantityInUnit} ${formData.defaultUnit}`}
                            />
                          </div>
                          {up.useDefaultPriceForAll && (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase text-right block">Lowest Price</label>
                                <input 
                                  type="text" 
                                  placeholder="0.00"
                                  className="w-full bg-[#0F1115] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FFB800]/50 text-right"
                                  value={getInputValue(up.lowestPrice)}
                                  onChange={(e) => handleUnitPricingChange(up.unit, 'lowestPrice', handlePriceInput(e.target.value))}
                                />
                                {formData.vatType !== 'None' && up.lowestPrice > 0 && (
                                  <p className="text-[9px] text-gray-500 text-right">
                                    {formData.vatType === 'Inclusive' ? (
                                      `VAT: ${formatPrice(getVatDetails(up.lowestPrice).vatAmount)} | Base: ${formatPrice(getVatDetails(up.lowestPrice).baseAmount)}`
                                    ) : (
                                      `Final: ${formatPrice(getVatDetails(up.lowestPrice).finalPrice)} (VAT: +${formatPrice(getVatDetails(up.lowestPrice).vatAmount)})`
                                    )}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase text-right block">Selling Price</label>
                                <input 
                                  type="text" 
                                  placeholder="0.00"
                                  className="w-full bg-[#0F1115] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FFB800]/50 text-right"
                                  value={getInputValue(up.recommendedPrice)}
                                  onChange={(e) => handleUnitPricingChange(up.unit, 'recommendedPrice', handlePriceInput(e.target.value))}
                                />
                                {formData.vatType !== 'None' && up.recommendedPrice > 0 && (
                                  <p className="text-[9px] text-gray-500 text-right">
                                    {formData.vatType === 'Inclusive' ? (
                                      `VAT: ${formatPrice(getVatDetails(up.recommendedPrice).vatAmount)} | Base: ${formatPrice(getVatDetails(up.recommendedPrice).baseAmount)}`
                                    ) : (
                                      `Final: ${formatPrice(getVatDetails(up.recommendedPrice).finalPrice)} (VAT: +${formatPrice(getVatDetails(up.recommendedPrice).vatAmount)})`
                                    )}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {!up.useDefaultPriceForAll && (
                          <div className="space-y-4 pt-4 border-t border-white/5">
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

                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-4 px-2 text-[9px] font-bold text-gray-500 uppercase">
                                <span>User</span>
                                <span className="text-right">Lowest</span>
                                <span className="text-right">Selling Price</span>
                              </div>
                              {up.userPrices.map(userPrice => {
                                const user = users.find(u => u.email === userPrice.userId);
                                if (!user) return null;
                                return (
                                  <div key={user.email} className="grid grid-cols-3 items-center gap-4 p-2 bg-[#15181C] rounded border border-white/5">
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[10px] font-bold text-white truncate">{user.name}</span>
                                      <span className="text-[8px] text-gray-500 uppercase">{user.role}</span>
                                    </div>
                                    <div className="flex justify-end flex-col items-end">
                                      <input 
                                        type="text" 
                                        placeholder="0.00"
                                        className="w-full bg-[#0F1115] border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFB800]/50 text-right"
                                        value={getInputValue(userPrice.lowestPrice)}
                                        onChange={(e) => handleUserPriceChange(up.unit, user.email, 'lowestPrice', handlePriceInput(e.target.value))}
                                      />
                                      {formData.vatType !== 'None' && userPrice.lowestPrice > 0 && (
                                        <span className="text-[8px] text-gray-500 mt-0.5">
                                          {formData.vatType === 'Inclusive' ? `Base: ${formatPrice(getVatDetails(userPrice.lowestPrice).baseAmount)}` : `+${formatPrice(getVatDetails(userPrice.lowestPrice).vatAmount)} VAT`}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex justify-end flex-col items-end">
                                      <input 
                                        type="text" 
                                        placeholder="0.00"
                                        className="w-full bg-[#0F1115] border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFB800]/50 text-right"
                                        value={getInputValue(userPrice.recommendedPrice)}
                                        onChange={(e) => handleUserPriceChange(up.unit, user.email, 'recommendedPrice', handlePriceInput(e.target.value))}
                                      />
                                      {formData.vatType !== 'None' && userPrice.recommendedPrice > 0 && (
                                        <span className="text-[8px] text-gray-500 mt-0.5">
                                          {formData.vatType === 'Inclusive' ? `Base: ${formatPrice(getVatDetails(userPrice.recommendedPrice).baseAmount)}` : `+${formatPrice(getVatDetails(userPrice.recommendedPrice).vatAmount)} VAT`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

          {settings.allowMixFeature && (
            <div className={`flex items-center gap-3 pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
              <span className={`text-[11px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Allow mix</span>
              <button 
                onClick={() => setFormData({ ...formData, allowMix: !formData.allowMix })}
                className={`w-10 h-5 rounded-full relative transition-colors ${formData.allowMix ? 'bg-[#FFB800]' : (theme === 'dark' ? 'bg-gray-700' : 'bg-slate-200')}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.allowMix ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks</label>
            <textarea 
              className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 min-h-[80px] ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              placeholder="Enter any additional notes..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${theme === 'dark' ? 'border-white/5 bg-[#15181C]' : 'border-slate-100 bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className={`px-6 py-2 rounded-md text-xs font-bold transition-colors border ${theme === 'dark' ? 'text-white bg-[#0F1115] border-white/10 hover:bg-white/5' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'}`}
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (validateForm()) {
                setShowConfirmation(true);
              }
            }}
            className="px-6 py-2 rounded-md text-xs font-bold text-[#0F1115] bg-[#FFB800] hover:bg-[#E6A600] flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>

        {/* Confirmation Modal Overlay */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-[#0F1115]/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#1A1D21] w-full max-w-md rounded-xl border border-white/10 shadow-2xl flex flex-col max-h-[90%] overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <div className="flex flex-col">
                    <h2 className="text-sm font-bold text-white">Confirm Details</h2>
                    <p className="text-[9px] text-gray-500 uppercase">Review before saving</p>
                  </div>
                  <button onClick={() => setShowConfirmation(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">Product</p>
                      <p className="text-xs text-white truncate">{formData.product === 'p1' ? 'Colgate Herbal 35g' : 'Coca Cola 500ml'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">Custom Name</p>
                      <p className="text-xs text-white truncate">{formData.customName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">Quantity</p>
                      <p className="text-xs text-white">{formData.quantity} {formData.defaultUnit}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-[#FFB800] uppercase tracking-wider border-b border-white/5 pb-1.5">Pricing Summary</h3>
                    {formData.unitPricings.map(up => (
                      <div key={up.unit} className="bg-white/5 rounded-lg p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white uppercase">{up.unit}</span>
                          {up.useDefaultPriceForAll ? (
                            <span className="text-[8px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded uppercase">Default</span>
                          ) : (
                            <span className="text-[8px] bg-[#FFB800]/20 text-[#FFB800] px-1.5 py-0.5 rounded uppercase">Custom</span>
                          )}
                        </div>
                        
                        {up.useDefaultPriceForAll ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#0F1115] p-1.5 rounded">
                              <p className="text-[8px] text-gray-500 uppercase">Lowest</p>
                              <p className="text-[10px] font-bold text-white">{up.lowestPrice.toLocaleString()} UGX</p>
                            </div>
                            <div className="bg-[#0F1115] p-1.5 rounded">
                              <p className="text-[8px] text-gray-500 uppercase">Rec.</p>
                              <p className="text-[10px] font-bold text-white">{up.recommendedPrice.toLocaleString()} UGX</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {up.userPrices.map(upPrice => {
                              const user = users.find(u => u.email === upPrice.userId);
                              return (
                                <div key={upPrice.userId} className="flex items-center justify-between bg-[#0F1115] p-1.5 rounded">
                                  <span className="text-[9px] text-gray-300 truncate max-w-[80px]">{user?.name}</span>
                                  <div className="flex gap-3">
                                    <div className="text-right">
                                      <p className="text-[7px] text-gray-500 uppercase">Low</p>
                                      <p className="text-[9px] font-bold text-white">{upPrice.lowestPrice.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[7px] text-gray-500 uppercase">Rec.</p>
                                      <p className="text-[9px] font-bold text-white">{upPrice.recommendedPrice.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-white/5 flex justify-end gap-2 bg-[#15181C]">
                  <button 
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-1.5 rounded-md text-[10px] font-bold text-white bg-[#0F1115] border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      onSave(formData);
                      setShowConfirmation(false);
                    }}
                    className="px-4 py-1.5 rounded-md text-[10px] font-bold text-[#0F1115] bg-[#FFB800] hover:bg-[#E6A600] flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Confirm & Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

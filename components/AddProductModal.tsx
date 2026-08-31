
import React, { useState, useEffect, useRef } from 'react';
import { Theme, ProductDefinition, ProductUnitDefinition, Shop, Country } from '../types';
import Icon from './Icon';
import { availableProductUnits, mockShops, allAfricanCountries } from '../data';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<ProductDefinition, 'id' | 'sn' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => void;
  theme: Theme;
}

const manufacturers = ['Unknown Manufacturer', 'Samsung', 'LG', 'Sony', 'Apple', 'Coca Cola', 'Pepsi'];
const categories = ['Adhesives', 'Cosmetics', 'Electronics', 'Chemicals', 'Household', 'Industrial', 'Beverages'];
const warehouses = [
    { id: 101, name: 'Main Warehouse - Kampala' },
    { id: 102, name: 'Distribution Center - Jinja' },
    { id: 103, name: 'Storage Unit B' }
];

const Toggle = ({ label, description, checked, onChange, theme }: { label: string, description?: string, checked: boolean, onChange: (val: boolean) => void, theme: Theme }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex-1 pr-4">
            <div className={`text-sm font-bold uppercase tracking-tight ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{label}</div>
            {description && <div className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{description}</div>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#FFB800]' : (theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState({
        manufacturer: '',
        name: '',
        category: '',
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
        baseUnit: '',
        baseQuantity: '',
        containerQuantity: '',
        containerUnit: '',
        remarks: '',
        country: '',
        continents: [] as string[],
        economicZones: [] as string[],
        countries: [] as string[],
        hasBatchNumber: false,
        hasExpiryDate: false,
        isGlobal: true,
        imageUrl: '',
    });
    
    // Multi-select units state
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [unitDetails, setUnitDetails] = useState<Record<string, ProductUnitDefinition>>({});
    const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
    const unitDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
                setIsUnitDropdownOpen(false);
            }
        };
        if (isUnitDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUnitDropdownOpen]);

    const handleUnitToggle = (unit: string) => {
        if (selectedUnits.includes(unit)) {
            setSelectedUnits(prev => prev.filter(u => u !== unit));
            const newDetails = { ...unitDetails };
            delete newDetails[unit];
            setUnitDetails(newDetails);
        } else {
            setSelectedUnits(prev => [...prev, unit]);
            setUnitDetails(prev => ({
                ...prev,
                [unit]: { unitName: unit, quantity: 1, barcode: '' }
            }));
        }
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
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            // Reset form
            setFormData({
                manufacturer: '',
                name: '',
                category: '',
                status: 'ACTIVE',
                baseUnit: '',
                baseQuantity: '',
                containerQuantity: '',
                containerUnit: '',
                remarks: '',
                country: '',
                continents: [],
                economicZones: [],
                countries: [],
                hasBatchNumber: false,
                hasExpiryDate: false,
                isGlobal: true,
                imageUrl: '',
            });
            setSelectedUnits([]);
            setUnitDetails({});
        }, 300);
    };

    const handleSave = () => {
        if (!formData.name || !formData.manufacturer || !formData.category || !formData.baseUnit) {
            alert("Please fill in required fields (Manufacturer, Name, Category, Base Unit).");
            return;
        }

        let finalBarcode = '0000';

        // Validation for unit barcodes
        if (selectedUnits.length > 0) {
            const unitWithBarcode = selectedUnits.find(u => unitDetails[u]?.barcode && unitDetails[u]?.barcode.trim() !== '');
            if (!unitWithBarcode) {
                alert("When product units are selected, at least one unit must have a barcode.");
                return;
            }
            // Use the first valid barcode found as the main barcode if needed, or simply proceed
            finalBarcode = unitDetails[unitWithBarcode].barcode;
        }
        
        // Convert unit details map to array for saving
        const definedUnits = selectedUnits.map(u => unitDetails[u]);

        onSave({
            name: formData.name,
            manufacturer: formData.manufacturer,
            category: formData.category,
            status: formData.status,
            barcode: finalBarcode, // Main barcode derived from units or default
            baseUnit: formData.baseUnit,
            baseQuantity: parseFloat(formData.baseQuantity) || 0,
            containerQuantity: parseFloat(formData.containerQuantity) || 0,
            containerUnit: formData.containerUnit,
            saleUnits: selectedUnits.join(', '), // Store as comma separated string for display compat
            definedUnits: definedUnits,
            remarks: formData.remarks,
            country: formData.country || 'Unknown', 
            continents: formData.continents,
            economicZones: formData.economicZones,
            countries: formData.countries,
            hasBatchNumber: formData.hasBatchNumber,
            hasExpiryDate: formData.hasExpiryDate,
            isGlobal: formData.isGlobal,
            createdBy: 'Current User',
            imageUrl: formData.imageUrl,
        });
        handleClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen && !isClosing) return null;

    const commonInputClasses = `w-full rounded-md border shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`;
    const labelClasses = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`;

    const continents = Array.from(new Set(allAfricanCountries.map(c => c.continent)));
    const economicZones = Array.from(new Set(allAfricanCountries.flatMap(c => c.economicZones || [])));
    const countryOptions = allAfricanCountries.map(c => c.name);

    const handleMultiSelect = (name: 'continents' | 'economicZones' | 'countries', value: string) => {
        setFormData(prev => {
            const current = prev[name];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [name]: [...current, value] };
            }
        });
    };

    const MultiSelect = ({ label, options, selected, onToggle, theme }: { label: string, options: string[], selected: string[], onToggle: (val: string) => void, theme: Theme }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [isOpen]);

        return (
            <div className="relative" ref={dropdownRef}>
                <label className={labelClasses}>{label}</label>
                <div 
                    className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs min-h-[38px] flex flex-wrap gap-2 items-center cursor-pointer focus-within:ring-1 focus-within:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10' : 'bg-white border-slate-200'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selected.length === 0 && <span className="text-gray-500">Select {label.toLowerCase()}</span>}
                    {selected.map(val => (
                        <span key={val} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFB800] text-[#0F1115]">
                            {val}
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onToggle(val); }}
                                className="ml-1 hover:text-white focus:outline-none"
                            >
                                <Icon name="x-mark" className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    <div className="ml-auto"><Icon name="chevron-down" className="h-4 w-4 text-gray-500" /></div>
                </div>
                {isOpen && (
                    <div className={`absolute z-20 mt-1 w-full rounded-md shadow-lg max-h-48 overflow-auto border custom-scrollbar ${theme === 'dark' ? 'bg-[#1A1D21] border-white/10' : 'bg-white border-slate-200'}`}>
                        {options.map(opt => (
                            <div 
                                key={opt} 
                                className={`px-3 py-2 cursor-pointer text-xs flex items-center justify-between ${theme === 'dark' ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'} ${selected.includes(opt) ? 'bg-[#FFB800]/10 text-[#FFB800]' : ''}`}
                                onClick={() => onToggle(opt)}
                            >
                                {opt}
                                {selected.includes(opt) && <Icon name="check-circle" className="h-4 w-4 text-[#FFB800]" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`fixed inset-0 z-[80] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0'}`}>
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} rounded-xl shadow-2xl w-full max-w-3xl flex flex-col border transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} max-h-[90vh]`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex flex-col">
                        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Add Product</h2>
                        <p className="text-[10px] text-gray-500 uppercase">Define a new product in the system</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelClasses}>Manufacturer<span className="text-red-500">*</span></label>
                            <select name="manufacturer" value={formData.manufacturer} onChange={handleChange} className={commonInputClasses}>
                                <option value="">Select Manufacturer</option>
                                {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Name<span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={commonInputClasses} placeholder="Product Name" />
                        </div>
                        
                        {/* Category and Status Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Category<span className="text-red-500">*</span></label>
                                <select name="category" value={formData.category} onChange={handleChange} className={commonInputClasses}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Production status<span className="text-red-500">*</span></label>
                                <select name="status" value={formData.status} onChange={handleChange} className={commonInputClasses}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div>
                        <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 border-b pb-2 ${theme === 'dark' ? 'text-slate-500 border-white/5' : 'text-slate-400 border-slate-200'}`}>Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className={labelClasses}>Base Unit<span className="text-red-500">*</span></label>
                                <select name="baseUnit" value={formData.baseUnit} onChange={handleChange} className={commonInputClasses}>
                                    <option value="">Base unit</option>
                                    {availableProductUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Base quantity<span className="text-red-500">*</span></label>
                                <input type="number" name="baseQuantity" value={formData.baseQuantity} onChange={handleChange} className={commonInputClasses} placeholder="e.g. 20 (grams/ml)" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className={labelClasses}>Container quantity</label>
                                <input type="number" name="containerQuantity" value={formData.containerQuantity} onChange={handleChange} className={commonInputClasses} placeholder="e.g. 12 (items in container)" />
                            </div>
                            <div>
                                <label className={labelClasses}>Container Unit</label>
                                <select name="containerUnit" value={formData.containerUnit} onChange={handleChange} className={commonInputClasses}>
                                    <option value="">Container Unit</option>
                                    {availableProductUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Multi-select Product Units */}
                        <div className="mb-4">
                            <label className={labelClasses}>Product units<span className="text-red-500">*</span></label>
                            <div className="relative" ref={unitDropdownRef}>
                                <div 
                                    className={`w-full rounded-md border shadow-sm px-3 py-2 text-xs min-h-[38px] flex flex-wrap gap-2 items-center cursor-pointer focus-within:ring-1 focus-within:ring-[#FFB800]/50 ${theme === 'dark' ? 'bg-[#0F1115] border-white/10' : 'bg-white border-slate-200'}`}
                                    onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                                >
                                    {selectedUnits.length === 0 && <span className="text-gray-500">Select units</span>}
                                    {selectedUnits.map(unit => (
                                        <span key={unit} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFB800] text-[#0F1115]">
                                            {unit}
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleUnitToggle(unit); }}
                                                className="ml-1 hover:text-white focus:outline-none"
                                            >
                                                <Icon name="x-mark" className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <div className="ml-auto"><Icon name="chevron-down" className="h-4 w-4 text-gray-500" /></div>
                                </div>
                                {isUnitDropdownOpen && (
                                    <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg max-h-48 overflow-auto border custom-scrollbar ${theme === 'dark' ? 'bg-[#1A1D21] border-white/10' : 'bg-white border-slate-200'}`}>
                                        {availableProductUnits.map(unit => (
                                            <div 
                                                key={unit} 
                                                className={`px-3 py-2 cursor-pointer text-xs flex items-center justify-between ${theme === 'dark' ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'} ${selectedUnits.includes(unit) ? 'bg-[#FFB800]/10 text-[#FFB800]' : ''}`}
                                                onClick={() => handleUnitToggle(unit)}
                                            >
                                                {unit}
                                                {selectedUnits.includes(unit) && <Icon name="check-circle" className="h-4 w-4 text-[#FFB800]" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Unit Inputs */}
                        {selectedUnits.length > 0 && (
                            <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Unit name*</label>
                                    <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Quantity*</label>
                                    <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Barcode</label>
                                </div>
                                {selectedUnits.map(unit => (
                                    <div key={unit} className="grid grid-cols-3 gap-4">
                                        <input 
                                            type="text" 
                                            value={unitDetails[unit]?.unitName || unit} 
                                            onChange={(e) => handleUnitDetailChange(unit, 'unitName', e.target.value)}
                                            className={commonInputClasses} 
                                        />
                                        <input 
                                            type="number" 
                                            value={unitDetails[unit]?.quantity || 1} 
                                            onChange={(e) => handleUnitDetailChange(unit, 'quantity', parseFloat(e.target.value) || 0)}
                                            className={commonInputClasses} 
                                        />
                                        <input 
                                            type="text" 
                                            value={unitDetails[unit]?.barcode || ''} 
                                            onChange={(e) => handleUnitDetailChange(unit, 'barcode', e.target.value)}
                                            className={commonInputClasses} 
                                            placeholder="Barcode"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Tracking Settings & Remarks */}
                    <div>
                        <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 border-b pb-2 ${theme === 'dark' ? 'text-slate-500 border-white/5' : 'text-slate-400 border-slate-200'}`}>Tracking</h3>
                        <div className="space-y-4 mb-4">
                             <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Toggle 
                                        label="Batch Number Tracking" 
                                        description="Enable to track batch #."
                                        checked={formData.hasBatchNumber} 
                                        onChange={(val) => setFormData(prev => ({...prev, hasBatchNumber: val}))} 
                                        theme={theme} 
                                    />
                                    <Toggle 
                                        label="Expiry Date Tracking" 
                                        description="Enable to track expiry."
                                        checked={formData.hasExpiryDate} 
                                        onChange={(val) => setFormData(prev => ({...prev, hasExpiryDate: val}))} 
                                        theme={theme} 
                                    />
                                </div>
                                <div className={`border-t pt-2 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                                    <Toggle 
                                        label="Global Availability" 
                                        description="Global vs Region Based"
                                        checked={formData.isGlobal} 
                                        onChange={(val) => setFormData(prev => ({...prev, isGlobal: val}))} 
                                        theme={theme} 
                                    />
                                </div>
                            </div>

                            {!formData.isGlobal && (
                                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-dashed ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                                    <MultiSelect 
                                        label="Continents" 
                                        options={continents} 
                                        selected={formData.continents} 
                                        onToggle={(val) => handleMultiSelect('continents', val)} 
                                        theme={theme} 
                                    />
                                    <MultiSelect 
                                        label="Economic Zones" 
                                        options={economicZones} 
                                        selected={formData.economicZones} 
                                        onToggle={(val) => handleMultiSelect('economicZones', val)} 
                                        theme={theme} 
                                    />
                                    <MultiSelect 
                                        label="Countries" 
                                        options={countryOptions} 
                                        selected={formData.countries} 
                                        onToggle={(val) => handleMultiSelect('countries', val)} 
                                        theme={theme} 
                                    />
                                </div>
                            )}
                        </div>

                        {/* Image Uploader - Moved above remarks */}
                        <div className="mb-4">
                            <label className={labelClasses}>Product Image</label>
                            <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:border-[#FFB800]/50' : 'border-slate-200 bg-slate-50 hover:border-[#FFB800]/50'}`}>
                                {formData.imageUrl ? (
                                    <div className="relative group w-40 h-40">
                                        <img src={formData.imageUrl} alt="Product preview" className="w-full h-full object-cover rounded-md" />
                                        <button 
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <Icon name="x-mark" className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 w-full">
                                        <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                                            <Icon name="camera" className="h-8 w-8" />
                                        </div>
                                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Upload Product Image</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Remarks</label>
                            <textarea name="remarks" value={formData.remarks} onChange={handleChange} className={commonInputClasses} rows={3} placeholder="Product description"></textarea>
                        </div>
                    </div>
                </div>

                <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-white/5 bg-black/50' : 'border-slate-100 bg-slate-50'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-xs font-bold border rounded-md shadow-sm mr-3 transition-colors ${theme === 'dark' ? 'text-slate-300 bg-transparent border-white/10 hover:bg-white/5' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-xs font-bold text-[#0F1115] bg-[#FFB800] border border-transparent rounded-md shadow-sm hover:bg-[#E6A600] flex items-center transition-colors">
                        <Icon name="check-circle" className="h-4 w-4 mr-2" />
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;

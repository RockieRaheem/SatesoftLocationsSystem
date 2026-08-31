
import React from 'react';
import { X, Package, Barcode, Globe, MapPin, User, Calendar, Info, Settings, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Theme, ProductDefinition } from '../types';

interface ViewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductDefinition | null;
    theme: Theme;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ isOpen, onClose, product, theme }) => {
    if (!isOpen || !product) return null;

    const DetailItem = ({ label, value, icon: IconComponent }: { label: string, value: string | number | React.ReactNode, icon?: any }) => (
        <div className="space-y-1">
            <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                {IconComponent && <IconComponent className="w-3 h-3" />}
                {label}
            </div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {value || 'N/A'}
            </div>
        </div>
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`${theme === 'dark' ? 'bg-[#15181C] border-white/10' : 'bg-white border-slate-200'} w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg border overflow-hidden flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package className="h-6 w-6 text-slate-400" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{product.name}</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">SN: {product.sn}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-colors`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#FFB800]">
                            <Info className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Basic Information</h3>
                        </div>
                        <div className={`${theme === 'dark' ? 'bg-[#0F1115] border-white/5' : 'bg-slate-50 border-slate-200'} p-5 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-6`}>
                            <DetailItem label="Product Name" value={product.name} />
                            <DetailItem label="Barcode" value={product.barcode} icon={Barcode} />
                            <DetailItem label="Status" value={
                                <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-full ${product.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {product.status}
                                </span>
                            } />
                            <DetailItem label="Manufacturer" value={product.manufacturer} />
                            <DetailItem label="Category" value={product.category} />
                        </div>
                    </div>

                    {/* Unit & Packaging */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#FFB800]">
                            <Settings className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Unit & Packaging</h3>
                        </div>
                        <div className={`${theme === 'dark' ? 'bg-[#0F1115] border-white/5' : 'bg-slate-50 border-slate-200'} p-5 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-6`}>
                            <DetailItem label="Base Unit" value={product.baseUnit} />
                            <DetailItem label="Base Quantity" value={product.baseQuantity} />
                            <DetailItem label="Container Unit" value={product.containerUnit} />
                            <DetailItem label="Container Quantity" value={product.containerQuantity} />
                            <DetailItem label="Sale Units" value={product.saleUnits} />
                        </div>
                    </div>

                    {/* Tracking & System Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#FFB800]">
                            <ShieldAlert className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Tracking & System Info</h3>
                        </div>
                        <div className={`${theme === 'dark' ? 'bg-[#0F1115] border-white/5' : 'bg-slate-50 border-slate-200'} p-5 rounded-xl border space-y-6`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DetailItem label="Batch Tracking" value={product.hasBatchNumber ? 'Enabled' : 'Disabled'} />
                                <DetailItem label="Expiry Tracking" value={product.hasExpiryDate ? 'Enabled' : 'Disabled'} />
                                <DetailItem label="Availability" value={
                                    <div className="flex items-center gap-1.5">
                                        <Globe className="w-3 h-3 text-[#FFB800]" />
                                        {product.isGlobal ? 'Global' : 'Region Based'}
                                    </div>
                                } />
                            </div>

                            {!product.isGlobal && (
                                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} grid grid-cols-1 md:grid-cols-3 gap-6`}>
                                    <DetailItem label="Continents" value={product.continents?.join(', ')} icon={MapPin} />
                                    <DetailItem label="Economic Zones" value={product.economicZones?.join(', ')} icon={MapPin} />
                                    <DetailItem label="Countries" value={product.countries?.join(', ')} icon={MapPin} />
                                </div>
                            )}

                            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                                <DetailItem label="Created By" value={product.createdBy} icon={User} />
                                <DetailItem label="Created At" value={formatDate(product.createdAt)} icon={Calendar} />
                                <DetailItem label="Last Updated By" value={product.updatedBy} icon={User} />
                                <DetailItem label="Last Updated At" value={formatDate(product.updatedAt)} icon={Calendar} />
                            </div>
                        </div>
                    </div>

                    {product.remarks && (
                        <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks</label>
                            <div className={`${theme === 'dark' ? 'bg-[#0F1115] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'} p-4 rounded-lg border text-sm italic`}>
                                "{product.remarks}"
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-end ${theme === 'dark' ? 'border-white/5 bg-[#15181C]' : 'border-slate-100 bg-slate-50'}`}>
                    <button 
                        onClick={onClose} 
                        className={`px-8 py-2 rounded-md text-xs font-bold transition-colors border ${theme === 'dark' ? 'text-white bg-[#0F1115] border-white/10 hover:bg-white/5' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ViewProductModal;

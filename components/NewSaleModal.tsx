import React, { useState, useEffect } from 'react';
import { Purchase, SelectedProduct, StockSale, Theme, User } from '../types';
import Icon from './Icon';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: StockSale) => void;
  product: SelectedProduct | null;
  purchase: Purchase | null;
  remainingQuantity: number;
  theme: Theme;
  currentUser: User;
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen, onClose, onSave, product, purchase, remainingQuantity, theme, currentUser
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [clientName, setClientName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');

  useEffect(() => {
    if (product) {
      // Default markup of 20%
      setUnitPrice((product.unitPrice * 1.2).toFixed(2));
    }
  }, [product]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setClientName('');
      setQuantity('1');
    }, 300);
  };

  const handleSave = () => {
    if (!product || !purchase) return;

    const qty = parseInt(quantity, 10);
    const price = parseFloat(unitPrice);

    if (!clientName.trim() || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      alert('Please fill all fields with valid values.');
      return;
    }
    if (qty > remainingQuantity) {
      alert(`Quantity cannot exceed remaining stock of ${remainingQuantity}.`);
      return;
    }

    const newSale: StockSale = {
      saleId: `SALE-${Date.now()}`,
      saleDate: new Date().toISOString(),
      quantitySold: qty,
      saleUnitPrice: price,
      totalAmount: qty * price,
      receiptNumber: `RCPT-${Math.floor(Math.random() * 90000) + 10000}`,
      clientName: clientName,
      soldBy: currentUser.name,
    };

    onSave(newSale);
    handleClose();
  };

  if (!isOpen && !isClosing || !product) return null;

  const commonInputClasses = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900';
  const commonFocusClasses = 'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500';

  const qtyNum = parseInt(quantity, 10);
  const priceNum = parseFloat(unitPrice);
  const totalAmount = (isNaN(qtyNum) || isNaN(priceNum)) ? 0 : qtyNum * priceNum;
  
  const isFormValid = clientName.trim() && !isNaN(qtyNum) && qtyNum > 0 && qtyNum <= remainingQuantity && !isNaN(priceNum) && priceNum >= 0;

  return (
    <div className={`fixed inset-0 bg-black z-[70] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
      <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-lg flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Record New Sale</h2>
          <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <p className="font-semibold">{product.name}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Remaining stock from this batch: <span className="font-bold">{remainingQuantity} {product.unit}(s)</span></p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Client Name</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Quantity Sold</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" max={remainingQuantity} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Sale Unit Price</label>
              <input type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} min="0" step="0.01" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${commonInputClasses} ${commonFocusClasses}`} />
            </div>
          </div>
          <div className={`pt-4 mt-4 border-t text-right ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{totalAmount.toLocaleString(undefined, { style: 'currency', currency: purchase?.currency || 'UGX' })}</p>
          </div>
        </div>

        <div className={`flex justify-end items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
          <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={!isFormValid} className="ml-3 px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed">
            Save Sale
          </button>
        </div>
      </div>
    </div>
  );
};
export default NewSaleModal;
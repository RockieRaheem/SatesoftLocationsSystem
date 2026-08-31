import React, { useState, useEffect } from 'react';
import { Purchase, SelectedProduct, StockSale, Theme } from '../types';
import Icon from './Icon';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: StockSale | null;
  product: SelectedProduct | null;
  purchase: Purchase | null;
  theme: Theme;
}

const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({ isOpen, onClose, sale, product, purchase, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleGeneratePdf = async (action: 'download') => {
        if (isGeneratingPdf || !sale) return;
        setIsGeneratingPdf(true);
    
        const { jsPDF } = window.jspdf;
        const printContent = document.getElementById('sale-receipt-print-content');
        
        if (printContent) {
            const contentToPrint = printContent.cloneNode(true) as HTMLElement;
            contentToPrint.style.position = 'absolute';
            contentToPrint.style.left = '-9999px';
            contentToPrint.style.top = '0';
            contentToPrint.style.display = 'block';
            contentToPrint.style.width = '80mm'; // Receipt width
            document.body.appendChild(contentToPrint);

            try {
                const canvas = await window.html2canvas(contentToPrint, { scale: 3 });
                document.body.removeChild(contentToPrint);

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, canvas.height * 80 / canvas.width] });
                pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 80 / canvas.width);
                const fileName = `receipt_${sale.receiptNumber}.pdf`;
    
                if (action === 'download') {
                    pdf.save(fileName);
                }
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Failed to generate PDF.');
                if (document.body.contains(contentToPrint)) {
                     document.body.removeChild(contentToPrint);
                }
            }
        }
        setIsGeneratingPdf(false);
    };

    if (!isOpen && !isClosing || !sale || !product || !purchase) return null;
    
    const formattedDate = new Date(sale.saleDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const receiptContent = (isPrintView: boolean) => {
        if (isPrintView) {
            return (
                <div className="receipt-print-container">
                    <div className="logo-box"></div>
                    <h3>{purchase.shop}</h3>
                    <p className="receipt-subtitle">Official Receipt</p>
                    <hr />
                    <div className="details">
                        <p><span>Receipt #:</span> <span>{sale.receiptNumber}</span></p>
                        <p><span>Date:</span> <span>{formattedDate}</span></p>
                        <p><span>Client:</span> <span>{sale.clientName}</span></p>
                        <p><span>Cashier:</span> <span>{sale.soldBy}</span></p>
                    </div>
                    <hr />
                    <table>
                        <thead>
                            <tr>
                                <th className="text-left">Item</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right">Price</th>
                                <th className="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{product.name}</td>
                                <td className="text-center">{sale.quantitySold}</td>
                                <td className="text-right">{sale.saleUnitPrice.toLocaleString()}</td>
                                <td className="text-right">{sale.totalAmount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                    <table className="total-row">
                        <tbody>
                            <tr>
                                <td className="text-right">Grand Total:</td>
                                <td className="text-right">{sale.totalAmount.toLocaleString()} {purchase.currency}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="footer">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="p-6 space-y-4">
                <div className="text-center">
                    <h3 className={`font-bold text-xl`}>{purchase.shop}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Official Receipt</p>
                </div>
                <hr className={`my-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />
                <div className="grid grid-cols-2 gap-4">
                    <p><span className="font-semibold">Receipt #:</span> {sale.receiptNumber}</p>
                    <p><span className="font-semibold">Date:</span> {formattedDate}</p>
                    <p><span className="font-semibold">Client:</span> {sale.clientName}</p>
                    <p><span className="font-semibold">Cashier:</span> {sale.soldBy}</p>
                </div>
                <hr className={`my-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />
                
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="pb-2">Item</th>
                            <th className="pb-2 text-center">Qty</th>
                            <th className="pb-2 text-right">Price</th>
                            <th className="pb-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="align-top">{product.name}</td>
                            <td className="text-center align-top">{sale.quantitySold}</td>
                            <td className="text-right align-top">{sale.saleUnitPrice.toLocaleString()}</td>
                            <td className="text-right align-top">{sale.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                <hr className={`my-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />
                
                <div className="flex justify-end">
                    <div className="w-1/2">
                        <div className="flex justify-between font-bold">
                            <span>Grand Total:</span>
                            <span>{sale.totalAmount.toLocaleString()} {purchase.currency}</span>
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs mt-4">Thank you for your business!</p>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 bg-black z-[70] flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b print-hide ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Receipt: {sale.receiptNumber}</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="overflow-y-auto printable-area">
                    {/* Screen View */}
                    <div className="screen-view">{receiptContent(false)}</div>
                    {/* Print-Only View */}
                    <div id="sale-receipt-print-content" className="print-only">{receiptContent(true)}</div>
                </div>

                 <div className={`flex justify-between items-center p-6 border-t rounded-b-lg print-hide ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => window.print()} className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm flex items-center space-x-2 ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                            <Icon name="print" className="h-4 w-4" />
                            <span>Print</span>
                        </button>
                        <button onClick={() => handleGeneratePdf('download')} disabled={isGeneratingPdf} className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-wait ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                            <Icon name="download" className="h-4 w-4" />
                            <span>{isGeneratingPdf ? 'Downloading...' : 'Download PDF'}</span>
                        </button>
                    </div>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewReceiptModal;
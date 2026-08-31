
import React, { useState, useEffect } from 'react';
import { Purchase, Theme, User } from '../types';
import Icon from './Icon';
import StockSalesModal from './StockSalesModal';
import { formatDate } from '../utils';

// Declare jspdf and html2canvas from window object for TypeScript
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface ViewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  theme: Theme;
  currentUser: User;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode, theme: Theme }> = ({ label, value, theme }) => (
    <div>
        <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
        <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value}</div>
    </div>
);


const ViewPurchaseModal: React.FC<ViewPurchaseModalProps> = ({ isOpen, onClose, purchase, theme, currentUser }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setIsSalesModalOpen(false);
            setSelectedProduct(null);
        }
    }, [isOpen]);

    const handleViewSales = (product: any) => {
        setSelectedProduct(product);
        setIsSalesModalOpen(true);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleGeneratePdf = async (action: 'download' | 'share') => {
        if (isGeneratingPdf || !purchase) return;
        setIsGeneratingPdf(true);
    
        const { jsPDF } = window.jspdf;
        const printContent = document.getElementById('purchase-record-print-content');
        
        if (printContent) {
            // Clone the node, append it off-screen to render for html2canvas
            const contentToPrint = printContent.cloneNode(true) as HTMLElement;
            contentToPrint.style.position = 'absolute';
            contentToPrint.style.left = '-9999px';
            contentToPrint.style.top = '0';
            contentToPrint.style.display = 'block';
            contentToPrint.style.width = '210mm'; // A4 width for better scaling
            document.body.appendChild(contentToPrint);

            try {
                const canvas = await window.html2canvas(contentToPrint, { 
                    scale: 2,
                    useCORS: true,
                });
                
                document.body.removeChild(contentToPrint); // Clean up the clone

                const imgData = canvas.toDataURL('image/png');
                
                const pdfWidth = 210; // A4 width in mm
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = imgWidth / imgHeight;
                const pdfHeight = pdfWidth / ratio;
                
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });
    
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                const fileName = `purchase_${purchase.bulkEntrySerial}.pdf`;
    
                if (action === 'download') {
                    pdf.save(fileName);
                } else if (action === 'share') {
                    if (navigator.share) {
                        const pdfBlob = pdf.output('blob');
                        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
                        try {
                            await navigator.share({
                                files: [pdfFile],
                                title: `Purchase Record ${purchase.bulkEntrySerial}`,
                                text: `Here is the purchase record for ${purchase.shop}.`,
                            });
                        } catch (error) {
                            console.error('Error sharing:', error);
                            // Fallback to download if sharing fails (e.g., user cancels)
                            pdf.save(fileName);
                        }
                    } else {
                        alert('Sharing is not supported on this browser. The PDF will be downloaded instead.');
                        pdf.save(fileName);
                    }
                }
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Failed to generate PDF. Please try again.');
                if (document.body.contains(contentToPrint)) {
                     document.body.removeChild(contentToPrint); // Ensure cleanup on error
                }
            }
        }
        
        setIsGeneratingPdf(false);
    };

    if (!isOpen && !isClosing) return null;

    if (!purchase) return null;

    return (
        <>
            <StockSalesModal 
                isOpen={isSalesModalOpen}
                onClose={() => setIsSalesModalOpen(false)}
                purchase={purchase}
                product={selectedProduct}
                theme={theme}
                currentUser={currentUser}
            />
            <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b print-hide ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Purchase Details</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-y-auto printable-area">
                    {/* Screen View */}
                    <div className="screen-view p-6 space-y-6">
                        <div className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               <DetailItem theme={theme} label="Bulk Entry Serial" value={purchase.bulkEntrySerial} />
                               <DetailItem theme={theme} label="Supplier (Shop)" value={purchase.shop} />
                               <DetailItem theme={theme} label="Invoice #" value={purchase.invoiceNumber} />
                               <DetailItem theme={theme} label="Date of Purchase" value={formatDate(purchase.dateOfPurchase)} />
                               <DetailItem theme={theme} label="Total Amount" value={<span className="font-bold text-lg">{purchase.amount}</span>} />
                               <DetailItem theme={theme} label="Entries Made" value={purchase.entriesMade} />
                               <DetailItem theme={theme} label="Action By" value={purchase.actionBy} />
                               <DetailItem theme={theme} label="Date of Entry" value={purchase.dateOfEntry} />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Products</h3>
                             <div className={`border rounded-lg divide-y ${theme === 'dark' ? 'border-slate-700 divide-slate-700' : 'border-slate-200 divide-slate-200'}`}>
                                {purchase.products.map(product => (
                                    <div key={product.sku} className={`p-4 space-y-3 ${theme === 'light' ? 'bg-white' : ''}`}>
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{product.name}</p>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{product.sku}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 flex flex-col items-end">
                                                <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{`UGX ${(product.quantity * product.unitPrice).toLocaleString()}`}</p>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{`${product.quantity} ${product.unit}(s) at UGX ${product.unitPrice.toLocaleString()}`}</p>
                                                <button 
                                                    onClick={() => handleViewSales(product)}
                                                    className={`mt-2 flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                                                >
                                                    <Icon name="cash" className="h-3 w-3" />
                                                    <span>View Sales</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={`text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                            <p><span className={`font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Batch:</span> {product.batchNumber || 'N/A'}</p>
                                            <p><span className={`font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Expiry:</span> {product.expirationDate ? formatDate(product.expirationDate) : 'N/A'}</p>
                                        </div>
                                        {product.remarks && (
                                            <div className={`text-sm italic pt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                <span className={`font-medium not-italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Remarks:</span> {product.remarks}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Print Only View */}
                    <div id="purchase-record-print-content" className="print-only">
                        <div className="print-container">
                            <header className="print-header">
                                <div className="logo">
                                    <div className="logo-box"></div>
                                    <h1>Location Register</h1>
                                </div>
                                <div className="print-header-details">
                                    <h2>Purchase Record</h2>
                                    <p><strong>Serial:</strong> {purchase.bulkEntrySerial}</p>
                                    <p><strong>Invoice #:</strong> {purchase.invoiceNumber}</p>
                                </div>
                            </header>
                            <main>
                                <h3>Details</h3>
                                <div className="print-details-grid">
                                    <div className="detail-item">
                                        <div className="label">Supplier (Shop)</div>
                                        <div className="value">{purchase.shop}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="label">Date of Purchase</div>
                                        <div className="value">{formatDate(purchase.dateOfPurchase)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="label">Action By</div>
                                        <div className="value">{purchase.actionBy}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="label">Date of Entry</div>
                                        <div className="value">{purchase.dateOfEntry}</div>
                                    </div>
                                    <div className="detail-item detail-item-full">
                                        <div className="label">Total Amount</div>
                                        <div className="value value-large">{purchase.amount}</div>
                                    </div>
                                </div>
                                
                                <h3>Products</h3>
                                <table className="print-products-table">
                                    <thead>
                                    <tr>
                                        <th style={{ width: '5%' }}>#</th>
                                        <th style={{ width: '55%' }}>Product Name</th>
                                        <th className="text-right" style={{ width: '10%' }}>Qty</th>
                                        <th className="text-right" style={{ width: '15%' }}>Unit Price</th>
                                        <th className="text-right" style={{ width: '15%' }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {purchase.products.map((product, index) => (
                                        <tr key={product.sku}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {product.name}
                                                <div style={{fontSize: '8pt', color: '#000'}}>SKU: {product.sku}</div>
                                            </td>
                                            <td className="text-right">{product.quantity} {product.unit}</td>
                                            <td className="text-right">{(product.unitPrice).toLocaleString()}</td>
                                            <td className="text-right">{(product.quantity * product.unitPrice).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr className="total-row">
                                        <td colSpan={4} className="text-right">Grand Total</td>
                                        <td className="text-right">{purchase.amount}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </main>
                            <footer className="print-footer">
                                <p>Thank you for your business.</p>
                                <p>Location Register Systems &copy; {new Date().getFullYear()}</p>
                            </footer>
                        </div>
                    </div>
                </div>

                <div className={`flex justify-between items-center p-6 border-t rounded-b-lg print-hide ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => window.print()} className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm flex items-center space-x-2 ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                            <Icon name="print" className="h-4 w-4" />
                            <span>Print</span>
                        </button>
                        <button onClick={() => handleGeneratePdf('share')} disabled={isGeneratingPdf} className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-wait ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                             <Icon name="share" className="h-4 w-4" />
                            <span>{isGeneratingPdf ? 'Sharing...' : 'Share PDF'}</span>
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
        </>
    );
};

export default ViewPurchaseModal;

import React, { useState, useEffect } from 'react';
import { IDVerificationRequest, Theme, VerificationStatus } from '../types';
import Icon from './Icon';

interface IDVerificationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IDVerificationRequest | null;
  theme: Theme;
  onStatusChange: (id: number, status: VerificationStatus, remark?: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode, theme: Theme }> = ({ label, value, theme }) => (
    <div>
        <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
        <div className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value || 'N/A'}</div>
    </div>
);

const IDVerificationViewModal: React.FC<IDVerificationViewModalProps> = ({ isOpen, onClose, request, theme, onStatusChange }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [album, setAlbum] = useState<{ images: string[]; currentIndex: number } | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionRemark, setRejectionRemark] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setAlbum(null);
            setIsRejectModalOpen(false);
            setRejectionRemark('');
        }
    }, [isOpen]);

    // Reset zoom state when album is closed or image changes
    useEffect(() => {
        setIsZoomed(false);
    }, [album]);


    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleRejectClick = () => {
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = () => {
        if (request) {
            onStatusChange(request.id, 'Rejected', rejectionRemark);
        }
        setIsRejectModalOpen(false);
    };

    if (!isOpen && !isClosing) return null;
    if (!request) return null;

    const { status, idType, idNumber, idDocument, selfie, shopName, rejectionReason } = request;
    
    const idImages = [idDocument?.front, idDocument?.back].filter((img): img is string => !!img);

    const statusText = status;
    const statusIcon = status === 'Verified' ? 'shield-check' : status === 'Pending' ? 'exclamation-triangle' : 'x-mark';
    const statusColor = status === 'Verified' ? 'text-green-500' : status === 'Pending' ? 'text-yellow-500' : 'text-red-500';
    const statusBgColor = status === 'Verified' 
      ? (theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100')
      : status === 'Pending' ? (theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100')
      : (theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100');

    return (
      <>
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Verification Details</h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{request.userName} ({request.serial})</p>
                    </div>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className={`p-4 rounded-md flex items-center ${statusBgColor}`}>
                        <Icon name={statusIcon} className={`h-6 w-6 mr-3 ${statusColor}`} />
                        <div>
                            <p className={`font-semibold ${statusColor}`}>{statusText}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                {status === 'Pending' ? 'This submission is awaiting review.' : status === 'Verified' ? 'This user has been successfully verified.' : 'This submission was rejected.'}
                            </p>
                        </div>
                    </div>
                    
                    {status === 'Rejected' && rejectionReason && (
                        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Rejection Reason:</p>
                            <p className={`text-sm italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{rejectionReason}</p>
                        </div>
                    )}
                    
                    <div className={`space-y-6 p-4 border rounded-lg ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                        <div>
                            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Submitted Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DetailItem theme={theme} label="Shop Name" value={shopName} />
                                <DetailItem theme={theme} label="ID Type" value={idType} />
                                <DetailItem theme={theme} label="ID Number" value={idNumber} />
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>ID Document</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Front Side</p>
                                    {idDocument?.front ? (
                                        <button onClick={() => idImages.length > 0 && setAlbum({ images: idImages, currentIndex: 0 })} className="w-full text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                                            <img src={idDocument.front} alt="ID Document Front" className="rounded-lg max-w-full h-auto cursor-pointer border-2 border-transparent hover:border-yellow-500"/>
                                        </button>
                                    ) : <p className="text-sm italic">Not provided</p>}
                                </div>
                                <div>
                                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Back Side</p>
                                    {idDocument?.back ? (
                                        <button onClick={() => idImages.length > 0 && setAlbum({ images: idImages, currentIndex: idImages.indexOf(idDocument.back!) })} className="w-full text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                                            <img src={idDocument.back} alt="ID Document Back" className="rounded-lg max-w-full h-auto cursor-pointer border-2 border-transparent hover:border-yellow-500"/>
                                        </button>
                                    ) : <p className="text-sm italic">Not provided</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Selfie Images</h3>
                            {selfie && selfie.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                                    {selfie.map((imgSrc, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setAlbum({ images: selfie, currentIndex: index })}
                                            className="aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 group"
                                        >
                                            <img 
                                                src={imgSrc} 
                                                alt={`Selfie ${index + 1}`} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm italic">Not provided</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`flex justify-between items-center p-6 border-t rounded-b-lg ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    <button onClick={handleClose} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                        Close
                    </button>
                    {status === 'Pending' && (
                        <div className="flex items-center space-x-3">
                            <button onClick={handleRejectClick} className={`flex items-center space-x-2 px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700`}>
                                <Icon name="x-mark" className="h-5 w-5"/>
                                <span>Reject</span>
                            </button>
                            <button onClick={() => onStatusChange(request.id, 'Verified')} className={`flex items-center space-x-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700`}>
                                <Icon name="check-circle" className="h-5 w-5"/>
                                <span>Approve</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Album Viewer Modal with Zoom */}
        {album && (
            <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center p-4 transition-opacity" onClick={() => setAlbum(null)}>
                <button onClick={() => setAlbum(null)} className="absolute top-4 right-4 text-white z-[70]" aria-label="Close image viewer">
                    <Icon name="x-mark" className="h-8 w-8" />
                </button>
        
                {album.images.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setAlbum(prev => {
                                if (!prev) return null;
                                const newIndex = (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
                                return { ...prev, currentIndex: newIndex };
                            });
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 z-[70]"
                        aria-label="Previous image"
                    >
                        <Icon name="chevron-left" className="h-8 w-8" />
                    </button>
                )}
        
                <div 
                    className={`w-auto h-auto ${isZoomed ? 'w-full h-full overflow-auto' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img 
                        src={album.images[album.currentIndex]} 
                        alt="Enlarged view" 
                        className={`block transition-all duration-300 rounded-lg ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in object-contain max-w-[90vw] max-h-[90vh]'}`}
                        onClick={() => setIsZoomed(!isZoomed)}
                        style={isZoomed ? { maxWidth: 'none', maxHeight: 'none' } : {}}
                    />
                </div>
                
                {album.images.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setAlbum(prev => {
                                if (!prev) return null;
                                const newIndex = (prev.currentIndex + 1) % prev.images.length;
                                return { ...prev, currentIndex: newIndex };
                            });
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 z-[70]"
                        aria-label="Next image"
                    >
                        <Icon name="chevron-right" className="h-8 w-8" />
                    </button>
                )}
                
                {album.images.length > 1 && (
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-[70]">
                        <span>{album.currentIndex + 1} / {album.images.length}</span>
                    </div>
                )}
            </div>
        )}


        {/* Rejection Remarks Modal */}
        {isRejectModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
                <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
                    <div className="p-6">
                        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reason for Rejection</h3>
                        <div className="mt-2">
                            <textarea
                                rows={4}
                                value={rejectionRemark}
                                onChange={(e) => setRejectionRemark(e.target.value)}
                                placeholder="Provide a reason for rejecting this verification..."
                                className={`w-full p-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
                            ></textarea>
                        </div>
                    </div>
                    <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg ${theme === 'dark' ? 'bg-black/50' : 'bg-slate-50'}`}>
                        <button onClick={handleConfirmReject} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                            Confirm Rejection
                        </button>
                        <button onClick={() => setIsRejectModalOpen(false)} className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm ${theme === 'dark' ? 'border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
      </>
    );
};

export default IDVerificationViewModal;
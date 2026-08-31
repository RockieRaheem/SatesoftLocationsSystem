import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface SelfieVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selfieData: string) => void;
  theme: Theme;
}

// FIX: Implemented the SelfieVerificationModal component for camera-based image capture.
const SelfieVerificationModal: React.FC<SelfieVerificationModalProps> = ({ isOpen, onClose, onSave, theme }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480 } });
                setStream(streamData);
                if (videoRef.current) {
                    videoRef.current.srcObject = streamData;
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                alert("Could not access your camera. Please check permissions.");
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);
    
    useEffect(() => {
        if (isOpen) {
            if (!capturedImage) {
                startCamera();
            }
        } else {
            stopCamera();
        }

        return () => {
            // Ensure camera stops on unmount
            stopCamera();
        };
    }, [isOpen, capturedImage, startCamera, stopCamera]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setCapturedImage(null);
        }, 300);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
                stopCamera();
            }
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
        // The useEffect will automatically call startCamera() when capturedImage becomes null
    }
    
    const handleSaveSelfie = () => {
        if (capturedImage) {
            onSave(capturedImage);
            handleClose();
        }
    }

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100 bg-opacity-50' : 'opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg shadow-xl w-full max-w-lg flex flex-col transition-all duration-300 ease-in-out ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Take a Selfie</h2>
                    <button onClick={handleClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`} aria-label="Close modal">
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="w-full aspect-square bg-slate-800 rounded-lg overflow-hidden relative flex items-center justify-center">
                        {capturedImage ? (
                            <img src={capturedImage} alt="Captured selfie" className="object-cover h-full w-full" />
                        ) : (
                            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover"></video>
                        )}
                         {!capturedImage && stream && (
                            <div className="absolute inset-0 border-8 border-white/30 rounded-full m-8 border-dashed"></div>
                         )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                     <p className={`text-center text-sm mt-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {capturedImage ? "Looks good? You can retake if needed." : "Position your face in the circle and hold still."}
                    </p>
                </div>

                <div className={`flex justify-center items-center p-6 border-t rounded-b-lg space-x-4 ${theme === 'dark' ? 'border-slate-700 bg-black/50' : 'border-slate-200 bg-slate-100'}`}>
                    {capturedImage ? (
                        <>
                             <button onClick={handleRetake} className={`px-6 py-2.5 text-sm font-medium border rounded-md shadow-sm ${theme === 'dark' ? 'text-slate-300 bg-transparent border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'}`}>
                                Retake Photo
                            </button>
                            <button onClick={handleSaveSelfie} className="px-6 py-2.5 text-sm font-semibold text-slate-900 bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600">
                                Use this Photo
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={handleCapture}
                            disabled={!stream}
                            className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Capture photo"
                        >
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelfieVerificationModal;

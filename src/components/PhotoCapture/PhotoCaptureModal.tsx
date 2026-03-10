import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RotateCcw, Check, Zap, ZapOff, FlipHorizontal, Loader2 } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { useCamera } from '../../hooks/useCamera';
import { processWindowPhoto } from '../../utils/imageProcessing';
import type { PhotoData } from '../../types';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: PhotoData, processedUrl: string) => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [tab, setTab] = useState<'camera' | 'upload'>('camera');
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error: cameraError,
    hasFlash,
    flashOn,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    toggleCamera,
    toggleFlash,
  } = useCamera();

  React.useEffect(() => {
    if (isOpen && tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, tab]); // eslint-disable-line

  const handleCapture = useCallback(() => {
    const dataUrl = capturePhoto();
    if (dataUrl) {
      setPreview(dataUrl);
      stopCamera();
    }
  }, [capturePhoto, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUsePhoto = async () => {
    if (!preview) return;
    setProcessing(true);
    try {
      const processed = await processWindowPhoto(preview);
      const photo: PhotoData = {
        dataUrl: preview,
        fileName: `photo-${Date.now()}.jpg`,
        capturedAt: new Date(),
      };
      onCapture(photo, processed);
      handleClose();
    } catch (err) {
      console.error('Processing failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    stopCamera();
    onClose();
  };

  const handleRetake = () => {
    setPreview(null);
    if (tab === 'camera') startCamera();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Capture Window Photo" size="lg">
      <div className="p-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-lg">
          {['camera', 'upload'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t as 'camera' | 'upload');
                setPreview(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'camera' ? <Camera size={16} /> : <Upload size={16} />}
              {t === 'camera' ? 'Take Photo' : 'Upload Image'}
            </button>
          ))}
        </div>

        {/* Camera view */}
        {tab === 'camera' && !preview && (
          <div className="relative">
            {cameraError ? (
              <div className="aspect-[4/3] bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-3 p-6 text-center">
                <Camera size={40} className="text-slate-300" />
                <p className="text-sm text-slate-500">{cameraError}</p>
                <Button size="sm" onClick={startCamera}>Try Again</Button>
              </div>
            ) : (
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
                {/* Camera controls overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {hasFlash && (
                    <button
                      onClick={toggleFlash}
                      className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
                    >
                      {flashOn ? <Zap size={18} /> : <ZapOff size={18} />}
                    </button>
                  )}
                  <button
                    onClick={toggleCamera}
                    className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <FlipHorizontal size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Capture button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleCapture}
                disabled={!isStreaming}
                className="w-16 h-16 rounded-full bg-white border-4 border-teal-400 shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-teal-400" />
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              {facingMode === 'environment' ? 'Rear camera' : 'Front camera'}
            </p>
          </div>
        )}

        {/* Upload view */}
        {tab === 'upload' && !preview && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[4/3] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-teal-400 hover:bg-teal-50/50 transition-colors"
            >
              <Upload size={36} className="text-slate-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">Click to upload</p>
                <p className="text-xs text-slate-400">JPG, PNG, WebP, HEIC</p>
              </div>
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div>
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full rounded-xl" />
              {processing && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-teal-500" size={32} />
                  <p className="text-sm font-medium text-slate-600">Converting to 2D drawing...</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={handleRetake} className="flex-1">
                Retake
              </Button>
              <Button
                icon={processing ? undefined : <Check size={16} />}
                loading={processing}
                onClick={handleUsePhoto}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Use Photo'}
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Modal>
  );
};

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  error: string | null;
  hasFlash: boolean;
  flashOn: boolean;
  facingMode: 'environment' | 'user';
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => string | null;
  toggleCamera: () => void;
  toggleFlash: () => void;
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, aspectRatio: 4 / 3, width: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
      // Check flash capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      setHasFlash(!!capabilities?.torch);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (e.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera: ' + e.message);
      }
    }
  }, [facingMode, stopCamera]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'));
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !hasFlash) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as MediaStreamTrack & { applyConstraints: (c: object) => Promise<void> }).applyConstraints({
        advanced: [{ torch: !flashOn } as MediaTrackConstraintSet],
      });
      setFlashOn((f) => !f);
    } catch {
      // Flash not supported in this context
    }
  }, [hasFlash, flashOn]);

  useEffect(() => {
    if (isStreaming) {
      startCamera();
    }
  }, [facingMode]); // eslint-disable-line

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    hasFlash,
    flashOn,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    toggleCamera,
    toggleFlash,
  };
};

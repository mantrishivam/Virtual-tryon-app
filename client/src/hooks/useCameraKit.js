import { useRef, useState, useCallback } from 'react';

// YMK SDK is a global singleton — these flags must survive component remounts.
// Re-calling init() corrupts the SDK's internal React root → error #40.
let ymkInitialized = false;

function sdkReady() {
  return (
    typeof window.YMK !== 'undefined' &&
    typeof window.YMK.init === 'function' &&
    typeof window.YMK.openCameraKit === 'function'
  );
}

function cameraErrorMessage(err) {
  if (err.name === 'NotAllowedError') return 'Camera access denied. Please allow camera permissions and try again.';
  if (err.name === 'NotFoundError')   return 'No camera found on this device.';
  return 'Could not access camera: ' + err.message;
}

function base64ToFile(dataUrl, filename) {
  const [header, data] = dataUrl.split(',');
  const mime           = header.match(/:(.*?);/)[1];
  const byteStr        = atob(data);
  const arr            = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
  return new File([new Blob([arr], { type: mime })], filename, { type: mime });
}

export function useCameraKit() {
  const [streaming, setStreaming] = useState(false);
  const [usingSDK,  setUsingSDK]  = useState(false);
  const [error,     setError]     = useState(null);

  const videoRef      = useRef(null);   // <video> element for getUserMedia path
  const streamRef     = useRef(null);   // active MediaStream for getUserMedia path
  const facingModeRef = useRef('user'); // front/back camera toggle

  const captureHandlerRef = useRef(null); // SDK capture callback, updated on each open()
  const featureModeRef    = useRef(null); // current feature — read by startSDK() to pick SDK mode

  // ── SDK path (all features when SDK is available) ──────────────────────────

  // open() sets usingSDK = true so UploadComponent's effect mounts #YMK-module
  // into the container div. SDK calls happen in startSDK() — not here — because
  // the SDK must bind to a DOM element that is already in the document.
  const open = useCallback(async (featureMode, onCapture) => {
    setError(null);
    setStreaming(false);

    if (sdkReady() && featureMode !== 'nail') {
      featureModeRef.current    = featureMode;
      captureHandlerRef.current = (result) => {
        const images = result?.images || [];
        if (!images.length) return;
        const src  = images[0].image;
        const file = src instanceof Blob
          ? new File([src], 'camera-capture.jpg', { type: 'image/jpeg' })
          : base64ToFile(src, 'camera-capture.jpg');
        onCapture(file);
      };
      setUsingSDK(true);
      setStreaming(true);
      return;
    }

    // ── getUserMedia fallback (SDK unavailable) ───────────────────────────────
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingModeRef.current, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setUsingSDK(false);
      setStreaming(true);
    } catch (err) {
      setError(cameraErrorMessage(err));
    }
  }, []);

  // Called by UploadComponent after #YMK-module is in the DOM.
  const startSDK = useCallback(() => {
    if (!sdkReady() || !captureHandlerRef.current) return;
    try {
      if (!ymkInitialized) {
        // Init once without faceDetectionMode — pass it per openCameraKit() call
        // so hair ('hairlength') and nail ('nail') can share a single init.
        window.YMK.init({ imageFormat: 'base64', language: 'enu' });
        ymkInitialized = true;
      }
      const sdkMode = featureModeRef.current === 'nail' ? 'nail' : 'hairlength';
      try { window.YMK.removeEventListener('faceDetectionCaptured', captureHandlerRef.current); } catch {}
      window.YMK.addEventListener('faceDetectionCaptured', captureHandlerRef.current);
      window.YMK.openCameraKit({ faceDetectionMode: sdkMode });
    } catch (err) {
      setError('Camera SDK error: ' + err.message);
    }
  }, []);

  // Hides the camera UI (CSS) and clears listeners / stream.
  // Never calls YMK.close() — that unmounts the SDK's React tree and makes
  // the next openCameraKit() throw error #40.
  const close = useCallback(() => {
    if (captureHandlerRef.current) {
      try { window.YMK.removeEventListener('faceDetectionCaptured', captureHandlerRef.current); } catch {}
      captureHandlerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
    setUsingSDK(false);
    setError(null);
  }, []);

  // ── getUserMedia helpers (nail mode only) ───────────────────────────────────

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) throw new Error('Camera not ready yet.');
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob || blob.size === 0) {
          reject(new Error('Failed to capture image. Please try again.'));
          return;
        }
        resolve(new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
    });
  }, []);

  const switchCamera = useCallback(async () => {
    facingModeRef.current = facingModeRef.current === 'user' ? 'environment' : 'user';
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingModeRef.current, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError(cameraErrorMessage(err));
    }
  }, []);

  return { streaming, usingSDK, error, videoRef, open, startSDK, close, capture, switchCamera };
}

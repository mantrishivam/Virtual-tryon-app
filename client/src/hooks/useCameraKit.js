import { useRef, useState, useCallback } from 'react';

function base64ToFile(dataUrl, filename) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const byteStr = atob(data);
  const arr = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
  return new File([new Blob([arr], { type: mime })], filename, { type: mime });
}

function cameraErrorMessage(err) {
  if (err.name === 'NotAllowedError') return 'Camera access denied. Please allow camera permissions and try again.';
  if (err.name === 'NotFoundError')   return 'No camera found on this device.';
  return 'Could not access camera: ' + err.message;
}

const SDK_ENABLED = true;

function sdkReady() {
  return SDK_ENABLED &&
    typeof window.YMK !== 'undefined' &&
    typeof window.YMK.init === 'function' &&
    typeof window.YMK.openCameraKit === 'function';
}

export function useCameraKit() {
  const [streaming, setStreaming]   = useState(false);
  const [error, setError]           = useState(null);
  const [usingSDK, setUsingSDK]     = useState(false);

  // getUserMedia fallback
  const videoRef      = useRef(null);
  const streamRef     = useRef(null);
  const facingModeRef = useRef('user');

  // Keeps a ref to the faceDetectionCaptured handler so we can remove it on close
  const captureHandlerRef = useRef(null);

  const open = useCallback(async (featureMode, onCapture) => {
    setError(null);
    setStreaming(false);

    // SDK path — only for face-based modes (hairstyle / hair)
    // Nail has no face detection, so go straight to getUserMedia
    if (featureMode !== 'nail' && sdkReady()) {
      // Clean up any previous listener
      if (captureHandlerRef.current) {
        try { window.YMK.removeEventListener('faceDetectionCaptured', captureHandlerRef.current); } catch {}
      }

      captureHandlerRef.current = (result) => {
        const images = result?.images || [];
        if (!images.length) return;

        const src = images[0].image;
        const file = src instanceof Blob
          ? new File([src], 'camera-capture.jpg', { type: 'image/jpeg' })
          : base64ToFile(src, 'camera-capture.jpg');

        onCapture(file);
      };

      // Step 1: init
      window.YMK.init({
        faceDetectionMode: 'makeup',
        imageFormat: 'base64',
        language: 'enu',
      });

      // Step 2: register capture listener
      window.YMK.addEventListener('faceDetectionCaptured', captureHandlerRef.current);

      // Step 3: open camera
      window.YMK.openCameraKit();

      setUsingSDK(true);
      setStreaming(true);
      return;
    }

    // getUserMedia fallback — used for nail and when SDK is not available
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

  const close = useCallback(() => {
    // SDK cleanup
    if (captureHandlerRef.current) {
      try { window.YMK.removeEventListener('faceDetectionCaptured', captureHandlerRef.current); } catch {}
      captureHandlerRef.current = null;
    }
    if (window.YMK && typeof window.YMK.close === 'function') {
      try { window.YMK.close(); } catch {}
    }

    // getUserMedia cleanup
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setStreaming(false);
    setUsingSDK(false);
    setError(null);
  }, []);

  // Used only on the getUserMedia fallback path (nail mode)
  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) throw new Error('Camera not ready yet.');
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob || blob.size === 0) { reject(new Error('Failed to capture image. Please try again.')); return; }
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

  return { streaming, error, usingSDK, videoRef, open, close, capture, switchCamera };
}

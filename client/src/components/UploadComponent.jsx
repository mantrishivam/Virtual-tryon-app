import { useRef, useState, useEffect } from 'react';
import './UploadComponent.css';

export default function UploadComponent({ onFileSelect, previewUrl }) {
  const [mode, setMode]           = useState('upload');  // 'upload' | 'camera'
  const [cameraError, setCameraError] = useState(null);
  const [streaming, setStreaming] = useState(false);

  const inputRef  = useRef(null);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);  // holds the MediaStream to stop it later

  // Stop camera when switching away from camera mode
  useEffect(() => {
    if (mode !== 'camera') stopCamera();
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStreaming(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Could not access camera: ' + err.message);
      }
    }
  }

  function capturePhoto() {
    const video = videoRef.current;

    // Guard: video must have real dimensions before capture
    if (!video.videoWidth || !video.videoHeight) {
      alert('Camera not ready yet, please wait a moment and try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      // canvas.toBlob can return null if the canvas is empty or tainted
      if (!blob || blob.size === 0) {
        alert('Failed to capture image. Please try again.');
        return;
      }
      const file      = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(blob);
      onFileSelect(file, objectUrl);
      stopCamera();
      setMode('upload');
    }, 'image/jpeg', 0.92);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file.'); return; }
    onFileSelect(file, URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please drop a valid image file.'); return; }
    onFileSelect(file, URL.createObjectURL(file));
  }

  return (
    <div className="upload-wrapper">
      <h2 className="panel-title">1. Upload Image</h2>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          Upload Photo
        </button>
        <button
          className={`mode-btn ${mode === 'camera' ? 'active' : ''}`}
          onClick={() => { setMode('camera'); startCamera(); }}
        >
          Live Camera
        </button>
      </div>

      {/* ── Upload mode ── */}
      {mode === 'upload' && (
        <>
          <div
            className={`drop-zone ${previewUrl ? 'has-preview' : ''}`}
            onClick={() => inputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded preview" className="preview-img" />
            ) : (
              <div className="drop-placeholder">
                <span className="drop-icon">+</span>
                <p>Click or drag & drop an image</p>
                <p className="drop-hint">JPG, PNG, WEBP — max 10 MB</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {previewUrl && (
            <button className="btn-secondary" onClick={() => inputRef.current.click()}>
              Change Image
            </button>
          )}
        </>
      )}

      {/* ── Camera mode ── */}
      {mode === 'camera' && (
        <div className="camera-wrapper">
          {cameraError ? (
            <div className="camera-error">{cameraError}</div>
          ) : (
            <>
              <video ref={videoRef} className="camera-feed" playsInline muted />
              {streaming && (
                <button className="btn-capture" onClick={capturePhoto}>
                  Capture Photo
                </button>
              )}
              {!streaming && !cameraError && (
                <div className="camera-loading">Starting camera…</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

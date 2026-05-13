import { useRef, useState, useEffect } from 'react';
import { useCameraKit } from '../hooks/useCameraKit';
import { validateImage } from '../utils/validateImage';
import './UploadComponent.css';

const TIPS = {
  hairstyle: [
    'Face the camera directly — full face visible',
    'Use good, even lighting (avoid shadows)',
    'Keep hair away from face if possible',
    'Hold the phone steady — avoid blur',
  ],
  nail: [
    'Show the BACK of one hand only',
    'Spread all 5 fingers clearly apart',
    'Keep hand flat and nails unobstructed',
    'Use good lighting — avoid shadows on fingers',
    'Fill at least half the frame with your hand',
  ],
};

export default function UploadComponent({ onFileSelect, previewUrl, feature }) {
  const [mode, setMode]                       = useState('upload');
  const [validationError, setValidationError] = useState(null);

  const inputRef  = useRef(null);
  const camera    = useCameraKit();

  // Close camera when leaving camera mode or on unmount
  useEffect(() => {
    if (mode !== 'camera') camera.close();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => camera.close(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Called by both SDK (faceDetectionCaptured) and getUserMedia capture button
  async function handleCaptured(file) {
    setValidationError(null);
    // SDK path already validates quality; still run size / format checks
    const check = await validateImage(file);
    if (!check.ok) { setValidationError(check.reason); return; }
    onFileSelect(file, URL.createObjectURL(file));
    camera.close();
    setMode('upload');
  }

  async function capturePhoto() {
    try {
      const file = await camera.capture();
      await handleCaptured(file);
    } catch (err) {
      setValidationError(err.message);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setValidationError(null);
    const check = await validateImage(file);
    if (!check.ok) { setValidationError(check.reason); e.target.value = ''; return; }
    onFileSelect(file, URL.createObjectURL(file));
  }

  async function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setValidationError(null);
    const check = await validateImage(file);
    if (!check.ok) { setValidationError(check.reason); return; }
    onFileSelect(file, URL.createObjectURL(file));
  }

  const tips      = TIPS[feature] || TIPS.hairstyle;
  const tipsLabel = feature === 'nail' ? 'Hand photo tips:' : 'For best results:';

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
          onClick={() => { setMode('camera'); camera.open(feature, handleCaptured); }}
        >
          Live Camera
        </button>
      </div>

      {/* Tips — always visible */}
      <div className="camera-tips">
        <span>{tipsLabel}</span>
        <ul>
          {tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>

      {/* Validation / quality error */}
      {validationError && (
        <div className="validation-error">{validationError}</div>
      )}

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
            accept="image/jpeg,image/png,image/webp"
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
          {camera.error ? (
            <div className="camera-error">{camera.error}</div>
          ) : camera.usingSDK ? (
            /* SDK is open full-screen — its own overlay handles the camera UI */
            <div className="camera-loading">
              Camera overlay is open. Position your face and wait for auto-capture.
            </div>
          ) : (
            /* getUserMedia fallback — used for nail mode and when SDK unavailable */
            <>
              <video ref={camera.videoRef} className="camera-feed" playsInline muted />
              {!camera.streaming && <div className="camera-loading">Starting camera…</div>}
              {camera.streaming && (
                <div className="camera-actions">
                  <button className="btn-switch-camera" onClick={camera.switchCamera}>
                    ⇄ Switch
                  </button>
                  <button className="btn-capture" onClick={capturePhoto}>
                    Capture Photo
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

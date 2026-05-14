import { useRef, useState, useEffect } from 'react';
import { useCameraKit } from '../hooks/useCameraKit';
import { validateImage } from '../utils/validateImage';

const BG     = '#260B18';
const CARD   = '#340E24';
const ELEV   = '#3E172D';
const BORDER = 'rgba(240,220,232,0.1)';
const CREAM  = '#F0E4EC';
const MUTED  = 'rgba(240,228,236,0.5)';
const ACCENT = '#C4849A';

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

export default function UploadComponent({ feature, onFileSelect, previewUrl }) {
  const [mode,            setMode]            = useState('upload');
  const [validationError, setValidationError] = useState(null);

  const inputRef           = useRef(null);
  const cameraContainerRef = useRef(null); // container div that #YMK-module is moved into
  const ymkElRef           = useRef(null); // reference to #YMK-module for cleanup

  const camera = useCameraKit();

  // ── SDK: move #YMK-module into the container, then start the SDK ────────────
  // Runs when usingSDK flips to true (hair mode only).
  // #YMK-module must be in the document before calling startSDK().
  useEffect(() => {
    if (!camera.usingSDK || !cameraContainerRef.current) return;
    const ymkEl = document.getElementById('YMK-module');
    if (!ymkEl) return;
    ymkElRef.current = ymkEl;
    if (ymkEl.parentNode !== cameraContainerRef.current) {
      cameraContainerRef.current.appendChild(ymkEl);
    }
    Object.assign(ymkEl.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    camera.startSDK();
  }, [camera.usingSDK]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Close camera when leaving camera mode ───────────────────────────────────
  useEffect(() => {
    if (mode !== 'camera') camera.close();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── On unmount: park #YMK-module on body so the SDK stays alive ─────────────
  // If we remove #YMK-module from the document, the SDK's React tree detaches
  // and the next openCameraKit() call throws error #40.
  useEffect(() => () => {
    if (ymkElRef.current) {
      document.body.appendChild(ymkElRef.current);
      ymkElRef.current.style.cssText = 'display: none;';
    }
    camera.close();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── File handling ───────────────────────────────────────────────────────────

  async function validate(file) {
    try {
      const check = await validateImage(file);
      if (!check.ok) { setValidationError(check.reason); return false; }
    } catch {
      // validation errors should not block the user
    }
    return true;
  }

  async function handleCaptured(file) {
    setValidationError(null);
    if (!await validate(file)) return;
    onFileSelect(file, URL.createObjectURL(file));
    camera.close();
    setMode('upload');
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setValidationError(null);
    if (!await validate(file)) return;
    onFileSelect(file, URL.createObjectURL(file));
  }

  async function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setValidationError(null);
    if (!await validate(file)) return;
    onFileSelect(file, URL.createObjectURL(file));
  }

  async function capturePhoto() {
    try {
      const file = await camera.capture();
      await handleCaptured(file);
    } catch (err) {
      setValidationError(err.message);
    }
  }

  function openCamera() {
    setMode('camera');
    camera.open(feature, handleCaptured);
  }

  const tips = TIPS[feature] || TIPS.hairstyle;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* Upload mode */}
      {mode === 'upload' && (
        <>
          {/* Drop zone / preview */}
          <div
            className="rounded-2xl min-h-64 flex items-center justify-center cursor-pointer overflow-hidden transition-all"
            style={{
              background:   previewUrl ? 'transparent' : CARD,
              border:       previewUrl ? 'none' : '1.5px dashed rgba(240,220,232,0.2)',
              borderRadius: '16px',
            }}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded preview" className="w-full max-h-72 object-contain rounded-2xl" />
            ) : (
              <div className="text-center p-6 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: ELEV }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: CREAM }}>Upload a clear photo</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>
                    {feature === 'nail' ? 'Good light, hand spread flat' : 'Good light, hair away from face'}
                  </p>
                </div>
                <p className="text-[11px]" style={{ color: 'rgba(240,228,236,0.25)' }}>JPG, PNG, WEBP — max 10 MB</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Action buttons */}
          <div className="flex gap-2.5">
            <button
              className="flex-1 min-h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
              style={{ background: ELEV, color: CREAM, border: `1px solid ${BORDER}` }}
              onClick={openCamera}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {previewUrl ? 'Retake' : 'Take photo'}
            </button>
            <button
              className="flex-1 min-h-11 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: previewUrl ? ELEV : CREAM, color: previewUrl ? CREAM : BG, border: previewUrl ? `1px solid ${BORDER}` : 'none' }}
              onClick={() => inputRef.current?.click()}
            >
              {previewUrl ? 'Change photo' : 'Upload'}
            </button>
          </div>
        </>
      )}

      {/* Camera mode
          The outer div uses display toggle (not conditional render) so #YMK-module
          stays in an attached DOM node — unmounting it breaks the SDK. */}
      <div className="flex flex-col gap-3" style={{ display: mode === 'camera' ? 'flex' : 'none' }}>

        {camera.error && (
          <div className="text-sm px-4 py-3 rounded-2xl" style={{ background: 'rgba(248,113,113,0.12)', color: '#fca5a5' }}>
            {camera.error}
          </div>
        )}

        {/* SDK container (hair) — always in DOM, shown/hidden via display */}
        <div
          ref={cameraContainerRef}
          className="w-full rounded-2xl bg-black relative overflow-hidden"
          style={{ height: '480px', display: camera.usingSDK ? 'block' : 'none' }}
        />

        {/* getUserMedia video (nail) */}
        {!camera.usingSDK && !camera.error && (
          <div className="w-full aspect-4/3 rounded-2xl overflow-hidden relative" style={{ background: '#0a0008' }}>
            <video ref={camera.videoRef} className="w-full h-full object-cover block" playsInline muted />
            {!camera.streaming && (
              <p className="text-sm py-4 text-center absolute inset-0 flex items-center justify-center" style={{ color: MUTED }}>
                Starting camera…
              </p>
            )}
          </div>
        )}

        {/* Camera controls */}
        {(camera.usingSDK || camera.streaming) && (
          <div className="flex gap-2.5">
            <button
              className="px-4 min-h-11 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ background: ELEV, color: CREAM, border: `1px solid ${BORDER}` }}
              onClick={() => setMode('upload')}
            >
              Cancel
            </button>
            {!camera.usingSDK && (
              <>
                <button
                  className="px-4 min-h-11 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ background: ELEV, color: CREAM, border: `1px solid ${BORDER}` }}
                  onClick={camera.switchCamera}
                >
                  ⇄ Flip
                </button>
                <button
                  className="flex-1 min-h-11 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: CREAM, color: BG }}
                  onClick={capturePhoto}
                >
                  Capture Photo
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="text-sm px-4 py-3 rounded-2xl" style={{ background: 'rgba(248,113,113,0.12)', color: '#fca5a5' }}>
          {validationError}
        </div>
      )}

      {/* Tips */}
      <div className="rounded-2xl px-4 py-3.5" style={{ background: 'rgba(196,132,154,0.08)', border: '1px solid rgba(196,132,154,0.15)' }}>
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: ACCENT }}>
          {feature === 'nail' ? 'Hand photo tips' : 'For best results'}
        </p>
        <ul className="flex flex-col gap-1">
          {tips.map((tip, i) => (
            <li key={i} className="text-xs flex items-start gap-2" style={{ color: MUTED }}>
              <span className="mt-0.5 shrink-0" style={{ color: ACCENT }}>·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

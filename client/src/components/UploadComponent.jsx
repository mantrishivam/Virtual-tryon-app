import { useRef, useState, useEffect } from 'react';
import { useCameraKit } from '../hooks/useCameraKit';
import { validateImage } from '../utils/validateImage';

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

  const inputRef           = useRef(null);
  const cameraContainerRef = useRef(null);
  const camera             = useCameraKit();

  useEffect(() => {
    if (!camera.usingSDK || !cameraContainerRef.current) return;
    const ymkEl = document.getElementById('YMK-module');
    if (!ymkEl) return;
    cameraContainerRef.current.appendChild(ymkEl);
    Object.assign(ymkEl.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    return () => {
      document.body.appendChild(ymkEl);
      ymkEl.removeAttribute('style');
    };
  }, [camera.usingSDK]);

  useEffect(() => {
    if (mode !== 'camera') camera.close();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => camera.close(), []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCaptured(file) {
    setValidationError(null);
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
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold mb-1">1. Upload Image</h2>

      {/* Mode toggle */}
      <div className="flex border border-gray-300 rounded-lg overflow-hidden">
        <button
          className={`flex-1 min-h-11 px-3 text-sm transition-all border-r border-gray-300 ${mode === 'upload' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setMode('upload')}
        >
          Upload Photo
        </button>
        <button
          className={`flex-1 min-h-11 px-3 text-sm transition-all ${mode === 'camera' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          onClick={() => { setMode('camera'); camera.open(feature, handleCaptured); }}
        >
          Live Camera
        </button>
      </div>

      {/* Tips — always visible */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 text-xs text-yellow-800">
        <span className="font-semibold block mb-1">{tipsLabel}</span>
        <ul className="list-disc pl-4 flex flex-col gap-0.5">
          {tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">{validationError}</div>
      )}

      {/* ── Upload mode ── */}
      {mode === 'upload' && (
        <>
          <div
            className={`border-2 border-dashed rounded-lg min-h-[280px] flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${previewUrl ? 'border-solid border-gray-200' : 'border-gray-300 hover:border-gray-500'}`}
            onClick={() => inputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded preview" className="w-full max-h-[280px] object-contain" />
            ) : (
              <div className="text-center text-gray-400 p-4">
                <span className="text-4xl block mb-2 text-gray-300">+</span>
                <p>Click or drag & drop an image</p>
                <p className="text-xs mt-1">JPG, PNG, WEBP — max 10 MB</p>
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

          {previewUrl && (
            <button
              className="bg-transparent border border-gray-400 rounded-md px-4 min-h-11 text-sm text-gray-500 self-start hover:bg-gray-100 transition-colors"
              onClick={() => inputRef.current.click()}
            >
              Change Image
            </button>
          )}
        </>
      )}

      {/* ── Camera mode ── */}
      {mode === 'camera' && (
        <div className="flex flex-col gap-3 w-full">
          {camera.error ? (
            <div className="text-red-600 text-sm bg-red-50 px-3 py-2.5 rounded-lg w-full">{camera.error}</div>
          ) : camera.usingSDK ? (
            <div ref={cameraContainerRef} className="w-full aspect-2/3 rounded-lg  bg-black relative" />
          ) : (
            <>
              <div className="w-full aspect-4/3 rounded-lg overflow-hidden bg-black relative">
                <video ref={camera.videoRef} className="w-full h-full object-cover block" playsInline muted />
              </div>
              {!camera.streaming && (
                <p className="text-gray-400 text-sm py-4 text-center">Starting camera…</p>
              )}
              {camera.streaming && (
                <div className="flex gap-2">
                  <button
                    className="px-4 min-h-11 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm whitespace-nowrap hover:bg-gray-100 transition-colors"
                    onClick={camera.switchCamera}
                  >
                    ⇄ Switch
                  </button>
                  <button
                    className="flex-1 min-h-11 bg-gray-900 text-white rounded-lg text-base font-semibold hover:bg-gray-700 transition-colors"
                    onClick={capturePhoto}
                  >
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

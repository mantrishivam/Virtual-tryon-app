import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NailCustomizer  from '../components/NailCustomizer';
import UploadComponent from '../components/UploadComponent';
import StepNav         from '../components/StepNav';
import { applyNailTryon } from '../services/api';
import nailArtPatterns from '../data/nailArtPatterns';

const BG     = '#FDF8F5';
const CARD   = '#FFFFFF';
const BORDER = 'rgba(26,8,16,0.08)';
const TEXT   = '#1A0A10';
const MUTED  = '#8C6070';
const ACCENT = '#B5516A';
const PLUM   = '#2C0C1A';
const CREAM  = '#F0E4EC';

const STEPS = [
  { id: 'customize', label: 'Customize' },
  { id: 'photo',     label: 'Photo' },
  { id: 'result',    label: 'Result' },
];

export default function NailTryOnPage() {
  const [step, setStep]                     = useState('customize');
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Nail options
  const [nailColor,      setNailColor]      = useState('#FF0000');
  const [nailTexture,    setNailTexture]    = useState('cream');
  const [nailEffectType, setNailEffectType] = useState('nail_polish');
  const [nailShape,      setNailShape]      = useState('squoval_oval');
  const [nailLength,     setNailLength]     = useState(1.0);
  const [transparency,   setTransparency]   = useState(0);
  const [reflection,     setReflection]     = useState(50);
  const [contrast,       setContrast]       = useState(50);
  const [roughness,      setRoughness]      = useState(0);
  const [fingers,        setFingers]        = useState('all');
  const [nailArtPattern, setNailArtPattern] = useState(null);

  // Upload + result
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [comparePos,   setComparePos]   = useState(50);

  function markComplete(id) {
    setCompletedSteps(prev => new Set([...prev, id]));
  }

  function handleFileSelect(file, url) {
    setUploadedFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    setComparePos(50);
    markComplete('photo');
  }

  function handleReset() {
    setStep('customize');
    setUploadedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setComparePos(50);
    setCompletedSteps(new Set());
  }

  useEffect(() => {
    if (step !== 'result' || result || loading || !uploadedFile) return;
    setLoading(true);
    applyNailTryon(uploadedFile, { nailColor, nailTexture, nailEffectType, nailShape, nailLength })
      .then(data => { setResult(data); markComplete('result'); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived labels
  const modeLabel = nailEffectType === 'press_on_nails'
    ? 'Press-On Nails'
    : nailEffectType === 'nail_art'
    ? 'Nail Art'
    : 'Nail Polish';

  const selectedPattern = nailArtPatterns.find(p => p.id === nailArtPattern);

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: BG, color: TEXT }}>

      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 px-4 py-3.5 flex items-center gap-3"
        style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}
      >
        <Link
          to="/"
          className="text-sm no-underline shrink-0 transition-opacity hover:opacity-60"
          style={{ color: MUTED }}
        >
          ←
        </Link>
        <h1 className="font-black flex-1 text-center text-sm tracking-wide" style={{ color: TEXT }}>
          Nail Art Try-On
        </h1>
        {/* Desktop step dots */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black transition-all"
                  style={
                    step === s.id
                      ? { background: PLUM, color: CREAM }
                      : completedSteps.has(s.id)
                      ? { background: 'rgba(74,222,128,0.2)', color: '#16a34a' }
                      : { background: 'rgba(26,8,16,0.08)', color: MUTED }
                  }
                >
                  {i + 1}
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: step === s.id ? TEXT : MUTED }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-xs mx-0.5" style={{ color: BORDER }}>—</span>
              )}
            </div>
          ))}
        </div>
        <div className="w-5 md:hidden" />
      </header>

      <main className="px-4 pt-6">

        {/* ── Step 1: Customize ── */}
        {step === 'customize' && (
          <div className="max-w-lg mx-auto flex flex-col gap-5 pb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
                Step 01
              </p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: TEXT }}>
                Design Your Nails
              </h2>
              <p className="text-sm mt-1" style={{ color: MUTED }}>
                Choose your style, color, and finish
              </p>
            </div>

            <NailCustomizer
                nailColor={nailColor}           setNailColor={setNailColor}
                nailTexture={nailTexture}       setNailTexture={setNailTexture}
                nailEffectType={nailEffectType} setNailEffectType={setNailEffectType}
                nailShape={nailShape}           setNailShape={setNailShape}
                nailLength={nailLength}         setNailLength={setNailLength}
                transparency={transparency}     setTransparency={setTransparency}
                reflection={reflection}         setReflection={setReflection}
                contrast={contrast}             setContrast={setContrast}
                roughness={roughness}           setRoughness={setRoughness}
                fingers={fingers}               setFingers={setFingers}
                nailArtPattern={nailArtPattern} setNailArtPattern={setNailArtPattern}
              />

            <button
              className="w-full min-h-12 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: PLUM, color: CREAM }}
              onClick={() => { markComplete('customize'); setStep('photo'); }}
            >
              Next: Upload Photo →
            </button>
          </div>
        )}

        {/* ── Step 2: Photo ── */}
        {step === 'photo' && (
          <div className="max-w-lg mx-auto flex flex-col gap-5 pb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
                Step 02
              </p>
              <h2 className="text-xl font-black" style={{ color: TEXT }}>
                Add your photo
              </h2>
              <p className="text-sm mt-1" style={{ color: MUTED }}>
                Show the back of your hand clearly
              </p>
            </div>

            {/* Selection summary */}
            <div
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 1px 8px rgba(26,8,16,0.05)' }}
            >
              {nailEffectType === 'nail_art' ? (
                <div
                  className="w-10 h-10 rounded-xl shrink-0"
                  style={{
                    background: selectedPattern?.bg || BORDER,
                    border: `1px solid ${BORDER}`,
                  }}
                />
              ) : (
                <span
                  className="w-10 h-10 rounded-xl shrink-0"
                  style={{ background: nailColor, border: `1px solid ${BORDER}` }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: ACCENT }}>
                  Your selection
                </p>
                <p className="text-sm font-bold truncate" style={{ color: TEXT }}>
                  {modeLabel}
                  {nailEffectType === 'nail_art'
                    ? selectedPattern ? ` · ${selectedPattern.label}` : ''
                    : ` · ${nailTexture}`}
                </p>
              </div>
              <button
                className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 transition-opacity hover:opacity-70"
                style={{ color: ACCENT, background: 'rgba(181,81,106,0.1)' }}
                onClick={() => setStep('customize')}
              >
                Change
              </button>
            </div>

            {/* Upload area */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#340E24' }}
            >
              <div className="p-4">
                <UploadComponent
                  feature="nail"
                  onFileSelect={handleFileSelect}
                  previewUrl={previewUrl}
                />
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                className="px-5 min-h-11 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ background: CARD, color: MUTED, border: `1px solid ${BORDER}` }}
                onClick={() => setStep('customize')}
              >
                ← Back
              </button>
              <button
                className="flex-1 min-h-11 rounded-2xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: uploadedFile ? PLUM : 'rgba(26,8,16,0.06)',
                  color:      uploadedFile ? CREAM : MUTED,
                }}
                onClick={() => setStep('result')}
                disabled={!uploadedFile}
              >
                {uploadedFile ? 'Generate Result →' : 'Upload a photo to continue'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 'result' && (
          <div className="max-w-lg mx-auto flex flex-col gap-5 pb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
                AI Preview
              </p>
              <h2 className="text-xl font-black" style={{ color: TEXT }}>
                {loading ? 'Generating your nail art…' : 'Your nail result'}
              </h2>
              <p className="text-sm mt-1" style={{ color: MUTED }}>
                {loading ? 'This usually takes 15–30 seconds' : modeLabel}
              </p>
            </div>

            {/* Result card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 4px 24px rgba(26,8,16,0.08)' }}
            >
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center gap-4 p-14">
                  <div className="spinner" />
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>Generating your look…</p>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>This usually takes 15–30 seconds</p>
                  </div>
                </div>
              )}

              {/* Placeholder */}
              {!loading && !result && (
                <div className="flex flex-col items-center justify-center gap-3 p-14">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(181,81,106,0.08)' }}
                  >
                    <span style={{ color: ACCENT, fontSize: '22px' }}>✦</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: MUTED }}>AI NAIL PREVIEW</p>
                </div>
              )}

              {/* Placeholder result from API */}
              {!loading && result?.placeholder && (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <span
                    className="text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase"
                    style={{ background: 'rgba(181,81,106,0.1)', color: ACCENT }}
                  >
                    Preview
                  </span>
                  <p className="text-sm" style={{ color: TEXT }}>{result.message}</p>
                </div>
              )}

              {/* Before/After comparison slider */}
              {!loading && result?.resultImageUrl && previewUrl && (
                <div
                  className="relative select-none"
                  style={{ aspectRatio: '4/3' }}
                >
                  {/* Before */}
                  <img
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full object-cover block"
                    alt="Before"
                    draggable={false}
                  />
                  {/* After — clipped by slider position */}
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
                  >
                    <img
                      src={result.resultImageUrl}
                      className="w-full h-full object-cover block"
                      alt="After"
                      draggable={false}
                    />
                  </div>
                  {/* Invisible range input drives the drag */}
                  <input
                    type="range" min="0" max="100"
                    value={comparePos}
                    onChange={e => setComparePos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    style={{ margin: 0 }}
                  />
                  {/* Divider + drag handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
                    style={{ left: `${comparePos}%`, boxShadow: '0 0 8px rgba(0,0,0,0.3)' }}
                  >
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-sm"
                      style={{ color: PLUM, boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
                    >
                      ⇄
                    </div>
                  </div>
                  {/* Labels */}
                  <span
                    className="absolute bottom-3 left-3 text-[11px] font-bold text-white rounded-full px-2.5 py-1 pointer-events-none"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                  >
                    Before
                  </span>
                  <span
                    className="absolute bottom-3 right-3 text-[11px] font-bold text-white rounded-full px-2.5 py-1 pointer-events-none"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                  >
                    After
                  </span>
                </div>
              )}
            </div>

            {/* Download */}
            {result?.resultImageUrl && (
              <a
                href={result.resultImageUrl}
                download="nail-result.jpg"
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-11 rounded-2xl text-sm font-bold text-center flex items-center justify-center no-underline transition-all hover:opacity-90"
                style={{ background: PLUM, color: CREAM }}
              >
                Download Result
              </a>
            )}

            {/* Error */}
            {error && (
              <div
                className="text-sm px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                {error}
              </div>
            )}

            <button
              className="min-h-11 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ background: CARD, color: MUTED, border: `1px solid ${BORDER}` }}
              onClick={handleReset}
            >
              ← Try Another Look
            </button>
          </div>
        )}
      </main>

      <StepNav step={step} setStep={setStep} completedSteps={completedSteps} steps={STEPS} />
    </div>
  );
}

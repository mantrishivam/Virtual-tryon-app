import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HairStyleGallery from '../components/HairStyleGallery';
import UploadComponent  from '../components/UploadComponent';
import ResultViewer     from '../components/ResultViewer';
import StepNav          from '../components/StepNav';
import { applyHairStyleTryon } from '../services/api';

const PAGE_BG   = '#F5F0EB';
const PLUM      = '#2C0C1A';
const PLUM_CARD = '#360F26';
const CREAM     = '#F0E4EC';
const MUTED     = 'rgba(240,228,236,0.55)';
const ACCENT    = '#C4849A';
const DARK_TEXT = '#1A080F';
const MID_TEXT  = '#8C6070';
const BORDER_L  = 'rgba(26,8,16,0.09)';
const BORDER_D  = 'rgba(240,220,232,0.1)';

const STEPS = [
  { id: 'style',  label: 'Style' },
  { id: 'photo',  label: 'Photo' },
  { id: 'result', label: 'Result' },
];

const diffBadge = {
  easy:    { background: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
  medium:  { background: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  complex: { background: 'rgba(248,113,113,0.15)', color: '#f87171' },
};

// ── Style detail modal ─────────────────────────────────────────────
const MODAL_TEXT   = '#1A080F';
const MODAL_MUTED  = '#8C6070';
const MODAL_ACCENT = '#9B3060';
const MODAL_PILL   = 'rgba(26,8,16,0.06)';
const MODAL_TAG    = 'rgba(155,48,96,0.08)';

function StyleModal({ style, selectedId, onClose, onTryOn }) {
  const isSelected = selectedId === style.index;

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: 'rgba(6,2,5,0.88)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row"
        style={{
          background: '#FFFFFF',
          maxHeight:  '92vh',
          boxShadow:  '0 32px 80px rgba(0,0,0,0.65)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button — top right corner of the whole modal */}
        <button
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-75"
          style={{ background: 'rgba(255,255,255,0.88)', color: MODAL_TEXT, backdropFilter: 'blur(6px)' }}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Image panel */}
        <div className="relative shrink-0 md:w-[45%]">
          <img
            src={style.image}
            alt={style.name}
            className="w-full object-cover object-top"
            style={{ maxHeight: '45vh', minHeight: '240px', height: '100%' }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)' }}
          />

          {isSelected && (
            <div
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(74,222,128,0.88)', color: '#052e16' }}
            >
              ✓ Selected
            </div>
          )}
        </div>

        {/* Details panel — white bg, dark text */}
        <div className="flex flex-col gap-4 p-5 md:p-6 overflow-y-auto flex-1" style={{ background: '#F5F0EB' }}>
          {/* Category label */}
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: MODAL_ACCENT }}>
            HAIR · {(style.category || 'style').toUpperCase()}
          </p>

          {/* Name */}
          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight" style={{ color: MODAL_TEXT }}>
            {style.name}
          </h2>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            {style.difficulty && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={diffBadge[style.difficulty?.toLowerCase()] || { background: MODAL_PILL, color: MODAL_MUTED }}
              >
                {style.difficulty}
              </span>
            )}
            {style.duration && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: MODAL_PILL, color: MODAL_MUTED }}
              >
                ⏱ {style.duration}
              </span>
            )}
            {style.priceRange && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: MODAL_PILL, color: MODAL_MUTED }}
              >
                {style.priceRange}
              </span>
            )}
          </div>

          {/* Tags */}
          {style.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {style.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: MODAL_TAG, color: MODAL_ACCENT }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {style.description && (
            <p className="text-sm leading-relaxed" style={{ color: MODAL_MUTED }}>
              {style.description}
            </p>
          )}

          <div className="h-px" style={{ background: 'rgba(26,8,16,0.08)' }} />

          {/* CTA — dark plum button on white */}
          <button
            className="w-full min-h-12 rounded-2xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.01]"
            style={{ background: PLUM, color: CREAM }}
            onClick={onTryOn}
          >
            Try this on my photo →
          </button>

          <button
            className="w-full text-xs font-semibold py-2 transition-opacity hover:opacity-50"
            style={{ color: MODAL_MUTED }}
            onClick={onClose}
          >
            Back to gallery
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function HairTryOnPage() {
  const [step, setStep]                     = useState('style');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [selectedStyle, setSelectedStyle]   = useState(null);
  const [previewStyle, setPreviewStyle]     = useState(null);   // drives modal
  const [uploadedFile, setUploadedFile]     = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [result, setResult]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  function markComplete(id) {
    setCompletedSteps(prev => new Set([...prev, id]));
  }

  function handleFileSelect(file, url) {
    setUploadedFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    markComplete('photo');
  }

  function handleModalTryOn() {
    // If the user picked a different style, clear the previous photo so the
    // old captured image doesn't carry over to the new selection
    if (previewStyle?.index !== selectedStyle?.index) {
      setUploadedFile(null);
      setPreviewUrl(null);
      setResult(null);
      setError(null);
      setCompletedSteps(prev => {
        const next = new Set(prev);
        next.delete('photo');
        next.delete('result');
        return next;
      });
    }
    setSelectedStyle(previewStyle);
    setPreviewStyle(null);
    markComplete('style');
    setStep('photo');
  }

  function handleSetStep(id) {
    // Going back from photo → style would leave the YMK SDK in a partially-open
    // state that breaks on the next openCameraKit() call. A full reload is the
    // cleanest way to guarantee a fresh SDK init for the next session.
    if (step === 'photo' && id === 'style') {
      window.location.reload();
      return;
    }
    setStep(id);
  }

  function handleReset() {
    setStep('style');
    setSelectedStyle(null);
    setPreviewStyle(null);
    setUploadedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setCompletedSteps(new Set());
  }

  useEffect(() => {
    if (step !== 'result' || result || loading || !uploadedFile || !selectedStyle) return;
    setLoading(true);
    applyHairStyleTryon(uploadedFile, { styleIndex: selectedStyle.index })
      .then(data => { setResult(data); markComplete('result'); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: PAGE_BG }}>

      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 px-4 py-3.5 flex items-center gap-3"
        style={{ background: PAGE_BG, borderBottom: `1px solid ${BORDER_L}` }}
      >
        <Link
          to="/"
          className="text-sm no-underline shrink-0 transition-opacity hover:opacity-60"
          style={{ color: MID_TEXT }}
        >
          ←
        </Link>
        <h1 className="font-black flex-1 text-center text-sm tracking-wide" style={{ color: DARK_TEXT }}>
          Hair Style Try-On
        </h1>
        {/* Desktop step indicator */}
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
                      ? { background: 'rgba(74,222,128,0.2)', color: '#4ade80' }
                      : { background: 'rgba(26,8,16,0.08)', color: MID_TEXT }
                  }
                >
                  {i + 1}
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: step === s.id ? DARK_TEXT : MID_TEXT }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-xs mx-0.5" style={{ color: 'rgba(26,8,16,0.15)' }}>—</span>
              )}
            </div>
          ))}
        </div>
        <div className="w-5 md:hidden" />
      </header>

      <main className="px-4 pt-6">

        {/* ── Step 1: Gallery ── */}
        {step === 'style' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
                Step 01
              </p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: DARK_TEXT }}>
                Choose Your Style
              </h2>
              <p className="text-sm mt-1" style={{ color: MID_TEXT }}>
                Tap any style to preview details and select it
              </p>
            </div>

            <HairStyleGallery
              selectedId={selectedStyle?.index}
              onSelect={setPreviewStyle}
              scrollable={false}
            />
          </div>
        )}

        {/* ── Step 2: Upload Photo ── */}
        {step === 'photo' && (
          <div className="max-w-lg mx-auto flex flex-col gap-4 pb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
                Step 02
              </p>
              <h2 className="text-xl font-black" style={{ color: DARK_TEXT }}>
                {selectedStyle?.name || 'Your Style'} — on you.
              </h2>
              <p className="text-sm mt-1" style={{ color: MID_TEXT }}>
                Upload a clear front-facing photo
              </p>
            </div>

            {/* Selected style summary card */}
            {selectedStyle && (
              <div
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: PLUM_CARD, border: `1px solid ${BORDER_D}` }}
              >
                <img
                  src={selectedStyle.image}
                  alt={selectedStyle.name}
                  className="w-12 h-16 object-cover object-top rounded-xl shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate" style={{ color: CREAM }}>
                    {selectedStyle.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={diffBadge[selectedStyle.difficulty?.toLowerCase()] || { color: MUTED }}
                    >
                      {selectedStyle.difficulty}
                    </span>
                    {selectedStyle.duration && (
                      <span className="text-[11px]" style={{ color: MUTED }}>
                        {selectedStyle.duration}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: ACCENT, background: 'rgba(196,132,154,0.15)' }}
                  onClick={() => setPreviewStyle(selectedStyle)}
                >
                  Change
                </button>
              </div>
            )}

            {/* Upload component in dark card */}
            <div
              className="rounded-2xl p-4"
              style={{ background: PLUM_CARD, border: `1px solid ${BORDER_D}` }}
            >
              <UploadComponent
                feature="hairstyle"
                onFileSelect={handleFileSelect}
                previewUrl={previewUrl}
              />
            </div>

            <div className="flex gap-2.5">
              <button
                className="px-5 min-h-11 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ background: 'rgba(26,8,16,0.07)', color: MID_TEXT, border: `1px solid ${BORDER_L}` }}
                onClick={() => handleSetStep('style')}
              >
                ← Back
              </button>
              <button
                className="flex-1 min-h-11 rounded-2xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: uploadedFile ? PLUM : 'rgba(26,8,16,0.07)', color: uploadedFile ? CREAM : MID_TEXT }}
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
          <div className="max-w-lg mx-auto flex flex-col gap-4 pb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
                AI Preview
              </p>
              <h2 className="text-xl font-black" style={{ color: DARK_TEXT }}>
                {loading ? 'Generating your look…' : 'Your new look'}
              </h2>
              <p className="text-sm mt-1" style={{ color: MID_TEXT }}>
                {loading ? 'This usually takes 15–30 seconds' : selectedStyle?.name}
              </p>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: PLUM_CARD, border: `1px solid ${BORDER_D}` }}
            >
              <ResultViewer result={result} loading={loading} />
            </div>

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
              style={{ background: 'rgba(26,8,16,0.07)', color: MID_TEXT, border: `1px solid ${BORDER_L}` }}
              onClick={handleReset}
            >
              ← Try Another Style
            </button>
          </div>
        )}
      </main>

      {/* Style detail modal */}
      {previewStyle && (
        <StyleModal
          style={previewStyle}
          selectedId={selectedStyle?.index}
          onClose={() => setPreviewStyle(null)}
          onTryOn={handleModalTryOn}
        />
      )}

      <StepNav step={step} setStep={handleSetStep} completedSteps={completedSteps} steps={STEPS} />
    </div>
  );
}

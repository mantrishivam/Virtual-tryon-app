const CARD   = '#340E24';
const ELEV   = '#3E172D';
const BORDER = 'rgba(240,220,232,0.1)';
const CREAM  = '#F0E4EC';
const MUTED  = 'rgba(240,228,236,0.5)';
const ACCENT = '#C4849A';
const BG     = '#260B18';

export default function ResultViewer({ result, loading }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-2xl min-h-52 flex items-center justify-center overflow-hidden"
        style={{ background: CARD, border: `1px solid ${BORDER}` }}
      >
        {loading && (
          <div className="text-center p-6 flex flex-col items-center gap-4">
            <div className="spinner" />
            <div>
              <p className="text-sm font-semibold" style={{ color: CREAM }}>Generating your look…</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>This usually takes 15–30 seconds</p>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="text-center p-6 flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: ELEV }}
            >
              <span style={{ color: ACCENT, fontSize: '22px' }}>✦</span>
            </div>
            <p className="text-sm" style={{ color: MUTED }}>AI OVERLAY · PREVIEW</p>
          </div>
        )}

        {!loading && result?.placeholder && (
          <div className="text-center p-6 flex flex-col gap-2 items-center">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase"
              style={{ background: 'rgba(196,132,154,0.15)', color: ACCENT }}
            >
              Placeholder
            </span>
            <p className="text-sm" style={{ color: CREAM }}>{result.message}</p>
            <p className="text-xs" style={{ color: MUTED }}>
              Selected color: <strong style={{ color: CREAM }}>{result.selectedColor}</strong>
            </p>
          </div>
        )}

        {!loading && result?.resultImageUrl && (
          <div className="w-full flex flex-col items-center gap-3 p-3">
            <div className="relative w-full">
              <span
                className="absolute top-2 left-2 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase z-10"
                style={{ background: 'rgba(38,11,24,0.7)', color: ACCENT }}
              >
                ✦ AI preview
              </span>
              <img
                src={result.resultImageUrl}
                alt="Try-on result"
                className="w-full max-h-80 object-contain rounded-xl"
              />
            </div>
            <a
              href={result.resultImageUrl}
              download="tryon-result.jpg"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl text-sm font-bold text-center no-underline transition-opacity hover:opacity-90"
              style={{ background: CREAM, color: BG }}
            >
              Download Result
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import hairStyles from '../data/hairStyles';

// Light page + dark cards design (like the Discovery feed reference)
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

// Nail color swatches that mirror our NailCustomizer options
const NAIL_SWATCHES = [
  '#E8C9A0', '#FF6B9D', '#FF0000', '#FF4500', '#8B0000',
  '#800080', '#C0C0C0', '#FFD700', '#D4899A', '#2C0C1A',
];

function NailSwatchGrid() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 p-6">
      {/* Top 4 */}
      <div className="flex gap-2.5 justify-center">
        {NAIL_SWATCHES.slice(0, 5).map((col, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: '36px',
              height: '52px',
              background: col,
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              border: '1.5px solid rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>
      {/* Bottom 5 — offset */}
      <div className="flex gap-2.5 justify-center" style={{ marginLeft: '20px' }}>
        {NAIL_SWATCHES.slice(5).map((col, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: '36px',
              height: '52px',
              background: col,
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              border: '1.5px solid rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function HairGrid() {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
      {hairStyles.slice(0, 4).map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt={s.name}
          className="w-full h-full object-cover"
          style={{ borderRadius: '10px', maxHeight: '112px' }}
        />
      ))}
    </div>
  );
}

const HOW_IT_WORKS = [
  { n: '01', title: 'Choose Your Look',  desc: 'Browse curated hairstyles or design your nail art — color, finish, shape.' },
  { n: '02', title: 'Upload Your Photo', desc: 'Take a selfie with your camera or upload an existing photo from your gallery.' },
  { n: '03', title: 'See the Result',    desc: 'AI renders a realistic preview in seconds. Download and share.' },
];

export default function LandingPage() {
  return (
    <div style={{ background: PAGE_BG, color: DARK_TEXT, fontFamily: 'inherit' }}>

      {/* ── Nav ── */}
      <nav
        className="flex items-center justify-between px-6 py-4 md:px-10 sticky top-0 z-20"
        style={{ background: PAGE_BG, borderBottom: `1px solid ${BORDER_L}` }}
      >
        <span className="text-sm font-black tracking-[0.25em] uppercase" style={{ color: DARK_TEXT }}>
          GlamIQ
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/hair"
            className="no-underline text-xs font-bold px-3.5 py-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ background: PLUM, color: CREAM }}
          >
            Try Hair
          </Link>
          <Link
            to="/nail"
            className="no-underline text-xs font-bold px-3.5 py-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ border: `1.5px solid ${BORDER_L}`, color: MID_TEXT }}
          >
            Try Nails
          </Link>
        </div>
      </nav>

      {/* ── Hero card (dark plum) ── */}
      <section className="px-4 pt-5 md:px-10">
        <div
          className="relative rounded-3xl overflow-hidden px-8 pt-12 pb-10 md:px-14 md:pt-16"
          style={{ background: `linear-gradient(145deg, #260B18 0%, #3D1228 50%, #260B18 100%)` }}
        >
          {/* Ambient blobs */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(180,60,110,0.2) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(140,40,90,0.15) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }}
          />

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="h-px w-6" style={{ background: ACCENT, opacity: 0.6 }} />
              <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: ACCENT }}>
                AI Virtual Try-On
              </span>
            </div>

            <h1 className="font-black tracking-tight leading-[0.95] mb-4" style={{ color: CREAM }}>
              <span className="block text-4xl md:text-6xl">Virtual</span>
              <span
                className="block text-5xl md:text-7xl"
                style={{
                  background: 'linear-gradient(110deg, #F0D0E0 0%, #D890C0 50%, #B070A0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Try-On
              </span>
            </h1>

            <p className="text-sm md:text-base leading-relaxed mb-8 max-w-sm" style={{ color: MUTED }}>
              See hairstyles &amp; nail art on yourself — before you commit. Powered by AI.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/hair"
                className="no-underline px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 hover:scale-105"
                style={{ background: CREAM, color: PLUM }}
              >
                Try Hairstyles →
              </Link>
              <Link
                to="/nail"
                className="no-underline px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 hover:scale-105"
                style={{ border: '1.5px solid rgba(240,228,236,0.25)', color: 'rgba(240,228,236,0.75)' }}
              >
                Try Nail Art
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category cards (dark on light) ── */}
      <section className="px-4 py-8 md:px-10">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: MID_TEXT }}>
            Experiences
          </span>
          <span className="h-px flex-1" style={{ background: BORDER_L }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hair card */}
          <Link
            to="/hair"
            className="group rounded-3xl overflow-hidden no-underline block transition-transform duration-300 hover:scale-[1.015]"
            style={{ background: PLUM_CARD, border: `1px solid ${BORDER_D}` }}
          >
            {/* Hairstyle photo grid */}
            <div className="h-56 overflow-hidden" style={{ background: '#1E0814' }}>
              <HairGrid />
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-1.5" style={{ color: ACCENT }}>
                HAIR · STYLES
              </p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-1" style={{ color: CREAM }}>
                    Hair Style Try-On
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
                    Browse 10+ curated styles. See braids, curls, straight and more on your own photo.
                  </p>
                </div>
              </div>
              <div
                className="mt-4 flex items-center justify-between pt-3.5"
                style={{ borderTop: `1px solid ${BORDER_D}` }}
              >
                <span className="text-sm font-bold flex items-center gap-2 transition-all group-hover:gap-3" style={{ color: CREAM }}>
                  Try this on your photo
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(196,132,154,0.15)', color: ACCENT }}
                >
                  AI preview
                </span>
              </div>
            </div>
          </Link>

          {/* Nail card */}
          <Link
            to="/nail"
            className="group rounded-3xl overflow-hidden no-underline block transition-transform duration-300 hover:scale-[1.015]"
            style={{ background: PLUM_CARD, border: `1px solid ${BORDER_D}` }}
          >
            {/* Nail color swatch visual */}
            <div
              className="h-56 overflow-hidden relative"
              style={{ background: 'linear-gradient(145deg, #1E0814 0%, #2C1022 50%, #1A0810 100%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(180,60,110,0.25) 0%, transparent 65%)' }}
              />
              <NailSwatchGrid />
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-1.5" style={{ color: ACCENT }}>
                NAIL · ART
              </p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-1" style={{ color: CREAM }}>
                    Nail Art Try-On
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
                    Polish, press-ons, textures and shapes. Preview your nail art before you commit.
                  </p>
                </div>
              </div>
              <div
                className="mt-4 flex items-center justify-between pt-3.5"
                style={{ borderTop: `1px solid ${BORDER_D}` }}
              >
                <span className="text-sm font-bold flex items-center gap-2 transition-all group-hover:gap-3" style={{ color: CREAM }}>
                  Try this on your photo
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(196,132,154,0.15)', color: ACCENT }}
                >
                  AI preview
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── How it works (light) ── */}
      <section
        className="px-4 py-10 md:px-10"
        style={{ borderTop: `1px solid ${BORDER_L}` }}
      >
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: MID_TEXT }}>
            How It Works
          </span>
          <span className="h-px flex-1" style={{ background: BORDER_L }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.n} className="flex flex-col gap-3">
              <span
                className="text-3xl font-black tracking-tight"
                style={{ color: 'rgba(140,96,112,0.3)' }}
              >
                {item.n}
              </span>
              <div className="h-px w-8" style={{ background: `rgba(196,132,154,0.5)` }} />
              <h3 className="text-sm font-black" style={{ color: DARK_TEXT }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: MID_TEXT }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA (dark plum card) ── */}
      <section className="px-4 pb-10 md:px-10">
        <div
          className="rounded-3xl px-8 py-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
          style={{ background: PLUM, border: `1px solid ${BORDER_D}` }}
        >
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
              Ready to explore?
            </p>
            <p className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: CREAM }}>
              Your look awaits.
            </p>
            <p className="text-sm mt-2" style={{ color: MUTED }}>
              No account needed. Results in seconds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/hair"
              className="no-underline px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ background: CREAM, color: PLUM }}
            >
              Try Hairstyles →
            </Link>
            <Link
              to="/nail"
              className="no-underline px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ border: '1.5px solid rgba(240,228,236,0.2)', color: 'rgba(240,228,236,0.7)' }}
            >
              Try Nail Art
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-5 text-center text-xs"
        style={{ borderTop: `1px solid ${BORDER_L}`, color: MID_TEXT }}
      >
        <p>
          Powered by{' '}
          <span style={{ color: DARK_TEXT, fontWeight: 600 }}>Perfect Corp YCE API</span>
          {' '}· Built by GlamIQ
        </p>
      </footer>
    </div>
  );
}

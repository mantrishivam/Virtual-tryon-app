import { useState } from 'react';
import nailShapes from '../data/nailShapes';
import nailArtPatterns from '../data/nailArtPatterns';

const CARD   = '#FFFFFF';
const BORDER = 'rgba(26,8,16,0.08)';
const TEXT   = '#1A0A10';
const MUTED  = '#8C6070';
const ACCENT = '#B5516A';
const PLUM   = '#2C0C1A';
const CREAM  = '#F0E4EC';

const TABS = [
  { value: 'nail_polish',    label: 'Nail Polish' },
  { value: 'press_on_nails', label: 'Press-On' },
];

const NAIL_COLORS = [
  { value: '#FF0000', label: 'Red' },
  { value: '#FF6B9D', label: 'Pink' },
  { value: '#E8C9A0', label: 'Nude' },
  { value: '#FF4500', label: 'Coral' },
  { value: '#8B0000', label: 'Deep Red' },
  { value: '#800080', label: 'Purple' },
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#C0C0C0', label: 'Silver' },
  { value: '#FFD700', label: 'Gold' },
  { value: '#722F37', label: 'Burgundy' },
  { value: '#FFB6C1', label: 'Blush' },
  { value: '#967BB6', label: 'Lavender' },
  { value: '#000080', label: 'Navy' },
  { value: '#FF69B4', label: 'Hot Pink' },
  { value: '#CC4E2A', label: 'Terracotta' },
  { value: '#228B22', label: 'Forest' },
  { value: '#E8CCAF', label: 'Nude Beige' },
];

const LIGHT_SWATCHES = new Set(['#FFFFFF', '#C0C0C0', '#FFD700', '#FFB6C1', '#E8C9A0', '#E8CCAF']);

const NAIL_POLISH_TEXTURES = [
  { value: 'cream',          label: 'Cream' },
  { value: 'matte',          label: 'Matte' },
  { value: 'metallic',       label: 'Metallic' },
  { value: 'sheer',          label: 'Sheer' },
  { value: 'jelly',          label: 'Jelly' },
  { value: 'pearl',          label: 'Pearl' },
  { value: 'shimmer_fine',   label: 'Shimmer S' },
  { value: 'shimmer_coarse', label: 'Shimmer L' },
  { value: 'textured',       label: 'Textured' },
];

const PRESS_ON_TEXTURES = [
  { value: 'cream',    label: 'Cream' },
  { value: 'matte',    label: 'Matte' },
  { value: 'metallic', label: 'Metallic' },
];

const SHAPE_CATEGORIES = ['Square', 'Squoval', 'Oval', 'Almond', 'Stiletto'];
const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];

function getFinishBg(value, nailColor) {
  switch (value) {
    case 'cream':          return `linear-gradient(145deg,#fff 0%,${nailColor}cc 100%)`;
    case 'matte':          return nailColor;
    case 'metallic':       return 'linear-gradient(145deg,#f0f0f0 0%,#9a9a9a 40%,#f8f8f8 60%,#b8b8b8 100%)';
    case 'sheer':          return `${nailColor}44`;
    case 'jelly':          return `${nailColor}99`;
    case 'pearl':          return 'linear-gradient(145deg,#fce4ef 0%,#e4d0f0 40%,#cfe4f8 70%,#fce4ef 100%)';
    case 'shimmer_fine':   return `radial-gradient(circle,rgba(255,255,255,0.7) 1px,transparent 1px) 0 0/4px 4px,linear-gradient(145deg,${nailColor}dd,${nailColor}aa)`;
    case 'shimmer_coarse': return `radial-gradient(circle,rgba(255,255,255,0.6) 2px,transparent 2px) 0 0/8px 8px,linear-gradient(145deg,${nailColor}dd,${nailColor}99)`;
    case 'textured':       return `repeating-linear-gradient(45deg,${nailColor} 0px,${nailColor} 2px,${nailColor}77 2px,${nailColor}77 5px)`;
    default:               return nailColor;
  }
}

function NailShapeSVG({ category, size = 24 }) {
  const paths = {
    Square:   'M7 6 L7 26 L21 26 L21 6 Z',
    Squoval:  'M7 13 Q7 6 14 6 Q21 6 21 13 L21 26 L7 26 Z',
    Oval:     'M7 17 Q7 6 14 6 Q21 6 21 17 L21 26 L7 26 Z',
    Almond:   'M14 4 Q20 13 21 22 L21 26 L7 26 L7 22 Q8 13 14 4 Z',
    Stiletto: 'M14 3 L21 26 L7 26 Z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 28 30" fill="currentColor">
      <path d={paths[category] || paths.Square} />
    </svg>
  );
}

// Section card wrapper — each customization area gets its own card
function SectionCard({ label, children }) {
  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-2xl"
      style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 1px 8px rgba(26,8,16,0.05)' }}
    >
      <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: ACCENT }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function ColorSection({ nailColor, setNailColor }) {
  return (
    <SectionCard label="Color">
      {/* Wrapped color grid — no scrollbar */}
      <div className="flex flex-wrap gap-2.5">
        {NAIL_COLORS.map(c => {
          const selected = nailColor.toLowerCase() === c.value.toLowerCase();
          const isLight  = LIGHT_SWATCHES.has(c.value);
          return (
            <button
              key={c.value}
              title={c.label}
              className="w-9 h-9 rounded-full relative transition-all hover:scale-110"
              style={{
                background: c.value,
                border:     isLight ? `1px solid ${BORDER}` : 'none',
                boxShadow:  selected
                  ? `0 0 0 2.5px white, 0 0 0 4.5px ${ACCENT}`
                  : '0 1px 4px rgba(0,0,0,0.15)',
              }}
              onClick={() => setNailColor(c.value)}
            >
              {selected && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-[11px] font-black"
                  style={{ color: isLight ? TEXT : '#fff' }}
                >✓</span>
              )}
            </button>
          );
        })}
        {/* Custom color picker — always last */}
        <label
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden transition-all hover:scale-110"
          style={{ background: 'linear-gradient(135deg,#ff9de2,#a78bfa,#67e8f9)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
          title="Pick custom color"
        >
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            value={nailColor}
            onChange={e => setNailColor(e.target.value)}
          />
          <span className="text-white text-xs font-black pointer-events-none">+</span>
        </label>
      </div>
      {/* Selected color display */}
      <div className="flex items-center gap-2.5">
        <span
          className="w-5 h-5 rounded-full shrink-0"
          style={{ background: nailColor, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        />
        <span className="text-xs font-mono font-semibold" style={{ color: MUTED }}>
          {nailColor.toUpperCase()}
        </span>
      </div>
    </SectionCard>
  );
}

function FinishSection({ textures, nailTexture, setNailTexture, nailColor }) {
  return (
    <SectionCard label="Finish">
      {/* Wrapped finish grid — 3 columns, no scrollbar */}
      <div className="grid grid-cols-3 gap-3">
        {textures.map(t => {
          const selected = nailTexture === t.value;
          return (
            <button
              key={t.value}
              className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
              style={selected
                ? { background: 'rgba(181,81,106,0.08)', border: `1.5px solid ${ACCENT}` }
                : { background: 'rgba(26,8,16,0.03)', border: `1.5px solid transparent` }}
              onClick={() => setNailTexture(t.value)}
            >
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{
                  background: getFinishBg(t.value, nailColor),
                  boxShadow:  '0 1px 4px rgba(0,0,0,0.1)',
                }}
              />
              <span
                className="text-[11px] font-semibold leading-tight text-left"
                style={{ color: selected ? ACCENT : TEXT }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function FineTuneSection({ nailTexture, transparency, setTransparency, reflection, setReflection, contrast, setContrast, roughness, setRoughness }) {
  const [open, setOpen] = useState(false);
  const isMetallic = nailTexture === 'metallic';

  const sliders = [
    ...(!isMetallic ? [{ label: 'Transparency', value: transparency, set: setTransparency }] : []),
    { label: 'Reflection', value: reflection, set: setReflection },
    { label: 'Contrast',   value: contrast,   set: setContrast },
    { label: 'Roughness',  value: roughness,  set: setRoughness },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <button
        className="flex items-center justify-between w-full px-5 py-4"
        style={{ background: CARD }}
        onClick={() => setOpen(o => !o)}
      >
        <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: ACCENT }}>
          Advanced
        </p>
        <span className="text-xs font-bold" style={{ color: MUTED }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div
          className="flex flex-col gap-5 px-5 pb-5"
          style={{ background: CARD }}
        >
          <div className="h-px" style={{ background: BORDER }} />
          {sliders.map(s => (
            <div key={s.label} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold" style={{ color: TEXT }}>{s.label}</span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(181,81,106,0.08)', color: ACCENT }}
                >
                  {s.value}
                </span>
              </div>
              <input
                type="range" min="0" max="100" step="1"
                value={s.value}
                onChange={e => s.set(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: ACCENT }}
              />
              <div className="flex justify-between">
                <span className="text-[10px]" style={{ color: MUTED }}>0</span>
                <span className="text-[10px]" style={{ color: MUTED }}>100</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShapeSection({ nailShape, setNailShape }) {
  const [category, setCategory] = useState(() => {
    const found = nailShapes.find(s => s.value === nailShape);
    return found?.category || 'Square';
  });

  const variants = nailShapes.filter(s => s.category === category);

  return (
    <SectionCard label="Shape">
      {/* Category tabs — wrap on small screens */}
      <div className="flex gap-2 flex-wrap">
        {SHAPE_CATEGORIES.map(cat => {
          const active = category === cat;
          return (
            <button
              key={cat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={active
                ? { background: PLUM, color: CREAM }
                : { background: 'rgba(26,8,16,0.05)', color: MUTED }}
              onClick={() => setCategory(cat)}
            >
              <span style={{ color: active ? CREAM : MUTED }}>
                <NailShapeSVG category={cat} size={14} />
              </span>
              {cat}
            </button>
          );
        })}
      </div>
      {/* Shape variants — 3 columns */}
      <div className="grid grid-cols-3 gap-2.5">
        {variants.map(s => {
          const selected = nailShape === s.value;
          return (
            <button
              key={s.value}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl transition-all"
              style={selected
                ? { background: 'rgba(181,81,106,0.08)', border: `1.5px solid ${ACCENT}` }
                : { background: 'rgba(26,8,16,0.03)', border: `1.5px solid transparent` }}
              onClick={() => setNailShape(s.value)}
              title={s.description}
            >
              <span style={{ color: selected ? ACCENT : MUTED }}>
                <NailShapeSVG category={category} size={26} />
              </span>
              <span
                className="text-[10px] font-bold text-center leading-tight"
                style={{ color: selected ? ACCENT : TEXT }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function LengthSection({ nailLength, setNailLength }) {
  const labels = ['Short', 'Natural', 'Long', 'Extra Long'];
  return (
    <SectionCard label="Length">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold" style={{ color: TEXT }}>Nail length</span>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(181,81,106,0.08)', color: ACCENT }}
          >
            {parseFloat(nailLength).toFixed(2)}×
          </span>
        </div>
        <input
          type="range" min="0.8" max="2.15" step="0.05"
          value={nailLength}
          onChange={e => setNailLength(parseFloat(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: ACCENT }}
        />
        <div className="flex justify-between">
          {labels.map(l => (
            <span key={l} className="text-[10px] font-semibold" style={{ color: MUTED }}>{l}</span>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// function FingerChips({ fingers, setFingers }) {
//   const isAll = fingers === 'all';

//   function toggleFinger(f) {
//     if (isAll) {
//       setFingers([f]);
//     } else {
//       const next = fingers.includes(f)
//         ? fingers.filter(x => x !== f)
//         : [...fingers, f];
//       setFingers(next.length === 0 ? 'all' : next);
//     }
//   }

//   return (
//     <SectionCard label="Apply to">
//       <div className="flex gap-2 flex-wrap">
//         <button
//           className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
//           style={isAll
//             ? { background: PLUM, color: CREAM }
//             : { background: 'rgba(26,8,16,0.05)', color: MUTED }}
//           onClick={() => setFingers('all')}
//         >
//           All Fingers
//         </button>
//         {FINGERS.map(f => {
//           const active = !isAll && fingers.includes(f);
//           return (
//             <button
//               key={f}
//               className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
//               style={active
//                 ? { background: ACCENT, color: '#fff' }
//                 : { background: 'rgba(26,8,16,0.05)', color: MUTED }}
//               onClick={() => toggleFinger(f)}
//             >
//               {f}
//             </button>
//           );
//         })}
//       </div>
//     </SectionCard>
//   );
// }

function PatternGallery({ nailArtPattern, setNailArtPattern }) {
  return (
    <SectionCard label="Choose Design">
      <div className="grid grid-cols-3 gap-3">
        {nailArtPatterns.map(p => {
          const selected = nailArtPattern === p.id;
          return (
            <button
              key={p.id}
              className="flex flex-col items-center gap-2 transition-all"
              onClick={() => setNailArtPattern(selected ? null : p.id)}
            >
              <div
                className="w-full rounded-2xl relative overflow-hidden"
                style={{
                  aspectRatio: '1',
                  background:  p.bg,
                  boxShadow:   selected
                    ? `0 0 0 2.5px white, 0 0 0 4.5px ${ACCENT}`
                    : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {selected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-white"
                      style={{ color: ACCENT }}
                    >✓</div>
                  </div>
                )}
              </div>
              <span
                className="text-[10px] font-semibold text-center leading-tight"
                style={{ color: selected ? ACCENT : MUTED }}
              >
                {p.label}
              </span>
            </button>
          );
        })}
        {/* Upload placeholder */}
        <div className="flex flex-col items-center gap-2 opacity-40">
          <div
            className="w-full rounded-2xl flex items-center justify-center"
            style={{ aspectRatio: '1', border: `2px dashed ${BORDER}`, background: 'rgba(26,8,16,0.02)' }}
          >
            <span className="text-xl" style={{ color: MUTED }}>+</span>
          </div>
          <span className="text-[10px] font-semibold text-center" style={{ color: MUTED }}>Upload</span>
        </div>
      </div>
    </SectionCard>
  );
}

export default function NailCustomizer({
  nailColor,       setNailColor,
  nailTexture,     setNailTexture,
  nailEffectType,  setNailEffectType,
  nailShape,       setNailShape,
  nailLength,      setNailLength,
  transparency,    setTransparency,
  reflection,      setReflection,
  contrast,        setContrast,
  roughness,       setRoughness,
  fingers,         setFingers,
  nailArtPattern,  setNailArtPattern,
}) {
  const isPressOn   = nailEffectType === 'press_on_nails';
  const isNailArt   = nailEffectType === 'nail_art';
  const textures    = isPressOn ? PRESS_ON_TEXTURES : NAIL_POLISH_TEXTURES;
  const safeTexture = textures.find(t => t.value === nailTexture) ? nailTexture : textures[0].value;

  return (
    <div className="flex flex-col gap-4">

      {/* 3-tab mode toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl" style={{ background: 'rgba(26,8,16,0.06)' }}>
        {TABS.map(tab => (
          <button
            key={tab.value}
            className="py-3 rounded-xl text-xs font-bold transition-all"
            style={nailEffectType === tab.value
              ? { background: PLUM, color: CREAM, boxShadow: '0 2px 8px rgba(44,12,26,0.2)' }
              : { color: MUTED }}
            onClick={() => setNailEffectType(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nail Polish + Press-On controls */}
      {!isNailArt && (
        <>
          <ColorSection nailColor={nailColor} setNailColor={setNailColor} />

          <FinishSection
            textures={textures}
            nailTexture={safeTexture}
            setNailTexture={setNailTexture}
            nailColor={nailColor}
          />

          <FineTuneSection
            nailTexture={safeTexture}
            transparency={transparency} setTransparency={setTransparency}
            reflection={reflection}     setReflection={setReflection}
            contrast={contrast}         setContrast={setContrast}
            roughness={roughness}       setRoughness={setRoughness}
          />

          {isPressOn && (
            <>
              <ShapeSection nailShape={nailShape} setNailShape={setNailShape} />
              <LengthSection nailLength={nailLength} setNailLength={setNailLength} />
            </>
          )}

          {/* <FingerChips fingers={fingers} setFingers={setFingers} /> */}
        </>
      )}

      {/* Nail Art controls */}
      {isNailArt && (
        <>
          <PatternGallery nailArtPattern={nailArtPattern} setNailArtPattern={setNailArtPattern} />
          {/* <FingerChips fingers={fingers} setFingers={setFingers} /> */}
        </>
      )}
    </div>
  );
}

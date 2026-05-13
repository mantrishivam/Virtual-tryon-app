import HairStyleGallery from './HairStyleGallery';
import nailShapes from '../data/nailShapes';

const HAIR_PATTERNS = [
  { value: 'full',  label: 'Full Color' },
  { value: 'ombre', label: 'Ombre' },
];

const HAIR_COLORS = [
  { value: '#1a1a1a', label: 'Black' },
  { value: '#4a2c0a', label: 'Dark Brown' },
  { value: '#8B4513', label: 'Brown' },
  { value: '#c68642', label: 'Caramel' },
  { value: '#f5c842', label: 'Blonde' },
  { value: '#d4a0a0', label: 'Rose Gold' },
  { value: '#cc3333', label: 'Red' },
  { value: '#4444cc', label: 'Blue' },
  { value: '#cc44cc', label: 'Purple' },
  { value: '#888888', label: 'Gray' },
];

const NAIL_POLISH_TEXTURES = [
  { value: 'cream',          label: 'Cream' },
  { value: 'matte',          label: 'Matte' },
  { value: 'sheer',          label: 'Sheer' },
  { value: 'jelly',          label: 'Jelly' },
  { value: 'metallic',       label: 'Metallic' },
  { value: 'pearl',          label: 'Pearl' },
  { value: 'shimmer_fine',   label: 'Shimmer Fine' },
  { value: 'shimmer_coarse', label: 'Shimmer Coarse' },
  { value: 'textured',       label: 'Textured' },
];

const PRESS_ON_TEXTURES = [
  { value: 'cream',    label: 'Cream' },
  { value: 'matte',    label: 'Matte' },
  { value: 'metallic', label: 'Metallic' },
];

const NAIL_COLORS = [
  { value: '#FF0000', label: 'Red' },
  { value: '#FF6B9D', label: 'Pink' },
  { value: '#E8C9A0', label: 'Nude' },
  { value: '#FF4500', label: 'Coral' },
  { value: '#8B0000', label: 'Deep Red' },
  { value: '#800080', label: 'Purple' },
  { value: '#000000', label: 'Black' },
  { value: '#ffffff', label: 'White' },
  { value: '#C0C0C0', label: 'Silver' },
  { value: '#FFD700', label: 'Gold' },
];

const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';
const selectCls = 'px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-800';

export default function TryOnControls({
  feature, setFeature,
  hairColor, setHairColor,
  patternName, setPatternName,
  selectedTemplate, setSelectedTemplate,
  nailColor, setNailColor,
  nailTexture, setNailTexture,
  nailEffectType, setNailEffectType,
  nailShape, setNailShape,
  nailLength, setNailLength,
  onApply, loading, disabled,
}) {
  const isPressOn   = nailEffectType === 'press_on_nails';
  const textures    = isPressOn ? PRESS_ON_TEXTURES : NAIL_POLISH_TEXTURES;
  const safeTexture = textures.find(t => t.value === nailTexture) ? nailTexture : textures[0].value;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold mb-1">2. Customize</h2>

      {/* Feature toggle */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Feature</label>
        <div className="flex gap-1.5 flex-wrap">
          {[['hairstyle','Hair Style'],['nail','Nail']].map(([val, lbl]) => (
            <button
              key={val}
              className={`flex-1 py-2 min-h-11 border rounded-md text-sm transition-all cursor-pointer ${feature === val ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setFeature(val)}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hair Color ── */}
      {feature === 'hair' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hair-pattern" className={labelCls}>Pattern</label>
            <select id="hair-pattern" className={selectCls} value={patternName} onChange={e => setPatternName(e.target.value)}>
              {HAIR_PATTERNS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hair-color" className={labelCls}>Hair Color</label>
            <select id="hair-color" className={selectCls} value={hairColor} onChange={e => setHairColor(e.target.value)}>
              {HAIR_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-block w-6 h-6 rounded border border-gray-300 shrink-0" style={{ background: hairColor }} />
              <input type="color" className="w-8 h-7 p-0 border border-gray-300 rounded cursor-pointer" value={hairColor} onChange={e => setHairColor(e.target.value)} title="Pick custom color" />
              <span className="text-xs text-gray-500 font-mono">{hairColor}</span>
            </div>
          </div>
        </>
      )}

      {/* ── Hair Style ── */}
      {feature === 'hairstyle' && (
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Select a Style</label>
          {selectedTemplate && (
            <div className="flex items-start gap-2.5 p-2.5 bg-gray-100 rounded-lg mb-2 border border-gray-200">
              <img src={selectedTemplate.image} alt={selectedTemplate.name} className="w-[52px] h-[68px] object-cover rounded shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <strong className="text-sm font-bold text-gray-900 truncate">{selectedTemplate.name}</strong>
                <span className="text-xs text-gray-500">{selectedTemplate.priceRange}</span>
                <span className="text-xs text-gray-500">{selectedTemplate.duration} · {selectedTemplate.difficulty}</span>
                <p className="text-[11px] text-gray-400 m-0 leading-snug line-clamp-2">{selectedTemplate.description}</p>
              </div>
            </div>
          )}
          <HairStyleGallery selectedId={selectedTemplate?.index} onSelect={setSelectedTemplate} />
        </div>
      )}

      {/* ── Nail ── */}
      {feature === 'nail' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Nail Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {[['nail_polish','Nail Polish'],['press_on_nails','Press-On Nails']].map(([val, lbl]) => (
                <button
                  key={val}
                  className={`flex-1 py-2 min-h-11 border rounded-md text-sm transition-all cursor-pointer ${nailEffectType === val ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setNailEffectType(val)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nail-color" className={labelCls}>Color</label>
            <select id="nail-color" className={selectCls} value={nailColor} onChange={e => setNailColor(e.target.value)}>
              {NAIL_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-block w-6 h-6 rounded border border-gray-300 shrink-0" style={{ background: nailColor }} />
              <input type="color" className="w-8 h-7 p-0 border border-gray-300 rounded cursor-pointer" value={nailColor} onChange={e => setNailColor(e.target.value)} title="Pick custom color" />
              <span className="text-xs text-gray-500 font-mono">{nailColor}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nail-texture" className={labelCls}>Finish</label>
            <select id="nail-texture" className={selectCls} value={safeTexture} onChange={e => setNailTexture(e.target.value)}>
              {textures.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {isPressOn && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nail-shape" className={labelCls}>Shape</label>
                <select id="nail-shape" className={selectCls} value={nailShape} onChange={e => setNailShape(e.target.value)}>
                  {nailShapes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <p className="text-xs text-gray-400 leading-snug">
                  {nailShapes.find(s => s.value === nailShape)?.description}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="nail-length" className={labelCls}>
                  Length — <span className="font-bold text-gray-900">{parseFloat(nailLength).toFixed(1)}x</span>
                </label>
                <input
                  id="nail-length"
                  type="range"
                  min="0.8" max="2.15" step="0.05"
                  value={nailLength}
                  onChange={e => setNailLength(parseFloat(e.target.value))}
                  className="w-full accent-gray-900 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-0.5">
                  <span>Short</span><span>Natural</span><span>Long</span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <button
        className="mt-1 px-5 min-h-11 bg-gray-900 text-white rounded-lg text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        onClick={onApply}
        disabled={disabled || loading}
      >
        {loading ? 'Processing…' : 'Apply Try-On'}
      </button>

      {disabled && !loading && (
        <p className="text-xs text-gray-400 text-center">Upload an image to get started.</p>
      )}
    </div>
  );
}

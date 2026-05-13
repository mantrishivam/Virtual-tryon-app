import HairStyleGallery from './HairStyleGallery';
import nailShapes from '../data/nailShapes';
import './TryOnControls.css';

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

// Press-on nails only support these three textures per Perfect Corp API
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

export default function TryOnControls({
  feature, setFeature,
  // hair color
  hairColor, setHairColor,
  patternName, setPatternName,
  // hair style
  selectedTemplate, setSelectedTemplate,
  // nail
  nailColor, setNailColor,
  nailTexture, setNailTexture,
  nailEffectType, setNailEffectType,
  nailShape, setNailShape,
  nailLength, setNailLength,
  onApply, loading, disabled,
}) {
  const isPressOn  = nailEffectType === 'press_on_nails';
  const textures   = isPressOn ? PRESS_ON_TEXTURES : NAIL_POLISH_TEXTURES;
  const safeTexture = textures.find(t => t.value === nailTexture) ? nailTexture : textures[0].value;
  return (
    <div className="controls-wrapper">
      <h2 className="panel-title">2. Customize</h2>

      {/* Feature toggle */}
      <div className="field">
        <label>Feature</label>
        <div className="toggle-group">
          <button className={`toggle-btn ${feature === 'hairstyle' ? 'active' : ''}`} onClick={() => setFeature('hairstyle')}>
            Hair Style
          </button>
          <button className={`toggle-btn ${feature === 'nail' ? 'active' : ''}`} onClick={() => setFeature('nail')}>
            Nail
          </button>
        </div>
      </div>

      {/* ── Hair Color ── */}
      {feature === 'hair' && (
        <>
          <div className="field">
            <label htmlFor="hair-pattern">Pattern</label>
            <select id="hair-pattern" value={patternName} onChange={e => setPatternName(e.target.value)}>
              {HAIR_PATTERNS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="hair-color">Hair Color</label>
            <select id="hair-color" value={hairColor} onChange={e => setHairColor(e.target.value)}>
              {HAIR_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="color-row">
              <span className="color-swatch" style={{ background: hairColor }} />
              <input type="color" value={hairColor} onChange={e => setHairColor(e.target.value)} title="Pick custom color" />
              <span className="color-hex">{hairColor}</span>
            </div>
          </div>
        </>
      )}

      {/* ── Hair Style ── */}
      {feature === 'hairstyle' && (
        <div className="field">
          <label>Select a Style</label>
          {selectedTemplate && (
            <div className="selected-template">
              <img src={selectedTemplate.image} alt={selectedTemplate.name} />
              <div className="selected-template-info">
                <strong>{selectedTemplate.name}</strong>
                <span>{selectedTemplate.priceRange}</span>
                <span>{selectedTemplate.duration} · {selectedTemplate.difficulty}</span>
                <p>{selectedTemplate.description}</p>
              </div>
            </div>
          )}
          <HairStyleGallery
            selectedId={selectedTemplate?.index}
            onSelect={setSelectedTemplate}
          />
        </div>
      )}

      {/* ── Nail ── */}
      {feature === 'nail' && (
        <>
          {/* Effect type toggle */}
          <div className="field">
            <label>Nail Type</label>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${!isPressOn ? 'active' : ''}`}
                onClick={() => setNailEffectType('nail_polish')}
              >
                Nail Polish
              </button>
              <button
                className={`toggle-btn ${isPressOn ? 'active' : ''}`}
                onClick={() => setNailEffectType('press_on_nails')}
              >
                Press-On Nails
              </button>
            </div>
          </div>

          {/* Color picker */}
          <div className="field">
            <label htmlFor="nail-color">Color</label>
            <select id="nail-color" value={nailColor} onChange={e => setNailColor(e.target.value)}>
              {NAIL_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="color-row">
              <span className="color-swatch" style={{ background: nailColor }} />
              <input type="color" value={nailColor} onChange={e => setNailColor(e.target.value)} title="Pick custom color" />
              <span className="color-hex">{nailColor}</span>
            </div>
          </div>

          {/* Texture — filtered by effect type */}
          <div className="field">
            <label htmlFor="nail-texture">Finish</label>
            <select id="nail-texture" value={safeTexture} onChange={e => setNailTexture(e.target.value)}>
              {textures.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Press-on only: shape + length */}
          {isPressOn && (
            <>
              <div className="field">
                <label htmlFor="nail-shape">Shape</label>
                <select id="nail-shape" value={nailShape} onChange={e => setNailShape(e.target.value)}>
                  {nailShapes.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <p className="field-hint">
                  {nailShapes.find(s => s.value === nailShape)?.description}
                </p>
              </div>

              <div className="field">
                <label htmlFor="nail-length">
                  Length — <span className="length-value">{parseFloat(nailLength).toFixed(1)}x</span>
                </label>
                <input
                  id="nail-length"
                  type="range"
                  min="0.8"
                  max="2.15"
                  step="0.05"
                  value={nailLength}
                  onChange={e => setNailLength(parseFloat(e.target.value))}
                  className="length-slider"
                />
                <div className="length-labels">
                  <span>Short</span>
                  <span>Natural</span>
                  <span>Long</span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <button className="btn-primary" onClick={onApply} disabled={disabled || loading}>
        {loading ? 'Processing…' : 'Apply Try-On'}
      </button>

      {disabled && !loading && <p className="hint">Upload an image to get started.</p>}
    </div>
  );
}

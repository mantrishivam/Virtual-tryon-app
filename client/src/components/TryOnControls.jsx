import HairStyleGallery from './HairStyleGallery';
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

const NAIL_TEXTURES = [
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
  onApply, loading, disabled,
}) {
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
          <div className="field">
            <label htmlFor="nail-color">Nail Color</label>
            <select id="nail-color" value={nailColor} onChange={e => setNailColor(e.target.value)}>
              {NAIL_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="color-row">
              <span className="color-swatch" style={{ background: nailColor }} />
              <input type="color" value={nailColor} onChange={e => setNailColor(e.target.value)} title="Pick custom color" />
              <span className="color-hex">{nailColor}</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="nail-texture">Finish / Texture</label>
            <select id="nail-texture" value={nailTexture} onChange={e => setNailTexture(e.target.value)}>
              {NAIL_TEXTURES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </>
      )}

      <button className="btn-primary" onClick={onApply} disabled={disabled || loading}>
        {loading ? 'Processing…' : 'Apply Try-On'}
      </button>

      {disabled && !loading && <p className="hint">Upload an image to get started.</p>}
    </div>
  );
}

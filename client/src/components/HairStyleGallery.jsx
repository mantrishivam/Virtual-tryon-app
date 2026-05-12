import hairStyles from '../data/hairStyles';
import './HairStyleGallery.css';

export default function HairStyleGallery({ selectedId, onSelect }) {
  return (
    <div className="gallery-grid">
      {hairStyles.map(style => (
        <div
          key={style.index}
          className={`gallery-item ${selectedId === style.index ? 'selected' : ''}`}
          onClick={() => onSelect(style)}
          title={style.name}
        >
          <img src={style.image} alt={style.name} loading="lazy" />
          <span className="gallery-label">{style.name}</span>
          <span className={`gallery-difficulty ${style.difficulty.toLowerCase()}`}>
            {style.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}

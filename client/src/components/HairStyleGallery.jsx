import hairStyles from '../data/hairStyles';

const difficultyClasses = {
  easy:    'bg-green-100 text-green-800',
  medium:  'bg-yellow-100 text-yellow-800',
  complex: 'bg-red-100 text-red-800',
};

export default function HairStyleGallery({ selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2 max-h-[340px] overflow-y-auto pr-1">
      {hairStyles.map(style => (
        <div
          key={style.index}
          className={`cursor-pointer border-2 rounded-lg overflow-hidden flex flex-col transition-colors hover:border-gray-400 bg-gray-100 ${selectedId === style.index ? 'border-gray-900' : 'border-transparent'}`}
          onClick={() => onSelect(style)}
          title={style.name}
        >
          <img src={style.image} alt={style.name} loading="lazy" className="w-full aspect-3/4 object-cover block" />
          <span className="text-[11px] text-center px-1 py-0.5 text-gray-600 truncate bg-white">{style.name}</span>
          <span className={`text-[10px] text-center px-1 py-0.5 font-semibold tracking-wide ${difficultyClasses[style.difficulty.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
            {style.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}

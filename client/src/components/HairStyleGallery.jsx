import hairStyles from '../data/hairStyles';

export default function HairStyleGallery({ selectedId, onSelect, scrollable = true }) {
  return (
    <div className={`grid grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3 ${scrollable ? 'max-h-80 overflow-y-auto pr-0.5' : ''}`}>
      {hairStyles.map(style => {
        const isSelected = selectedId === style.index;
        return (
          <div
            key={style.index}
            className="relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.03]"
            style={{
              aspectRatio: '3/4',
              boxShadow: isSelected
                ? '0 0 0 2.5px #F0E4EC, 0 8px 24px rgba(44,12,26,0.18)'
                : '0 2px 10px rgba(44,12,26,0.1)',
            }}
            onClick={() => onSelect(style)}
          >
            <img
              src={style.image}
              alt={style.name}
              className="w-full h-full object-contain block"
              loading="lazy"
            />
            {/* Selected overlay */}
            {isSelected && (
              <>
                <div className="absolute inset-0" style={{ background: 'rgba(26,8,16,0.35)' }} />
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                  style={{ background: '#F0E4EC', color: '#260B18' }}
                >
                  ✓
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

'use client';

interface CompactIntensitySelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function CompactIntensitySelector({ value, onChange }: CompactIntensitySelectorProps) {
  const intensityLevels = [
    { value: 1, label: 'Minimal', shortLabel: 'Min', description: 'Subtle changes' },
    { value: 4, label: 'Moderate', shortLabel: 'Mod', description: 'Balanced technique' },
    { value: 8, label: 'Full', shortLabel: 'Full', description: 'Maximum technique' }
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Intensity:</span>
      <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
        {intensityLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${value === level.value 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
            title={level.description}
            aria-label={`Set intensity to ${level.label} (${level.description})`}
          >
            <span className="hidden sm:inline">{level.label}</span>
            <span className="sm:hidden">{level.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
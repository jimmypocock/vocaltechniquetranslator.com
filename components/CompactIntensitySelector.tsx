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
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Intensity:</span>
      <div className="inline-flex rounded-lg p-0.5 backdrop-blur-sm bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10">
        {intensityLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 transform
              ${value === level.value 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10'
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
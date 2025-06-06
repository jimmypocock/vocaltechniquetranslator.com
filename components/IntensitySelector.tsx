'use client';

interface IntensitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  isCondensed?: boolean;
}

const intensityLevels = [
  { value: 1, label: 'Minimal', shortLabel: 'Minimum', description: 'Subtle adjustments', icon: '🌱' },
  { value: 4, label: 'Moderate', shortLabel: 'Moderate', description: 'Balanced technique', icon: '🌿' },
  { value: 8, label: 'Maximum', shortLabel: 'Maximum', description: 'Full transformation', icon: '🌳' }
];

export default function IntensitySelector({ value, onChange, isCondensed = false }: IntensitySelectorProps) {
  // Map the 1-10 scale to our 3 levels
  const getActiveLevel = (value: number) => {
    if (value <= 3) return 1;
    if (value <= 7) return 4;
    return 8;
  };

  const activeLevel = getActiveLevel(value);

  return (
    <div className="w-full">
      {!isCondensed && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Intensity Level
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Press 1, 2, or 3
          </span>
        </div>
      )}

      <div className={`grid grid-cols-3 ${isCondensed ? 'gap-1' : 'gap-1.5'}`}>
        {intensityLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`
              relative flex flex-col items-center justify-center ${isCondensed ? 'p-2' : 'p-3'} rounded-md border transition-all duration-100
              ${activeLevel === level.value
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
          >
            {!isCondensed && <span className="text-lg mb-0.5">{level.icon}</span>}
            <span className={`${isCondensed ? 'text-sm' : 'text-xs'} font-medium ${
              activeLevel === level.value
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {isCondensed ? level.shortLabel : level.label}
            </span>
            {!isCondensed && (
              <span className={`text-xs ${
                activeLevel === level.value
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {level.description}
              </span>
            )}
            {activeLevel === level.value && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
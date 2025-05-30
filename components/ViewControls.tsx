'use client';

interface ViewControlsProps {
  isUppercase: boolean;
  onUppercaseChange: (value: boolean) => void;
  isExpanded: boolean;
  onExpandedChange: (value: boolean) => void;
}

export default function ViewControls({
  isUppercase,
  onUppercaseChange,
  isExpanded,
  onExpandedChange
}: ViewControlsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          View Options
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Press U or V
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {/* Uppercase Toggle */}
        <button
          onClick={() => onUppercaseChange(!isUppercase)}
          className={`
            relative flex flex-col items-center justify-center p-3 rounded-md border transition-all duration-100
            ${isUppercase
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
            }
          `}
          aria-label={isUppercase ? "Show original case" : "Show uppercase"}
        >
          <span className="text-lg mb-0.5">
            {isUppercase ? 'Aa' : 'AA'}
          </span>
          <span className={`text-xs font-medium ${
            isUppercase
              ? 'text-purple-700 dark:text-purple-300'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {isUppercase ? 'Original' : 'Uppercase'}
          </span>
          <span className={`text-xs ${
            isUppercase
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {isUppercase ? 'Mixed case' : 'ALL CAPS'}
          </span>
          {isUppercase && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* View Toggle */}
        <button
          onClick={() => onExpandedChange(!isExpanded)}
          className={`
            relative flex flex-col items-center justify-center p-3 rounded-md border transition-all duration-100
            ${isExpanded
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
            }
          `}
          aria-label={isExpanded ? "Show continuous view" : "Show word-by-word view"}
        >
          <span className="text-lg mb-0.5">
            {isExpanded ? '🎯' : '📝'}
          </span>
          <span className={`text-xs font-medium ${
            isExpanded
              ? 'text-purple-700 dark:text-purple-300'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {isExpanded ? 'Word-by-word' : 'Continuous'}
          </span>
          <span className={`text-xs ${
            isExpanded
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {isExpanded ? 'Interactive' : 'Full text'}
          </span>
          {isExpanded && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
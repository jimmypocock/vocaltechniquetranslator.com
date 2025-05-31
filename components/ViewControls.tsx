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

      <div className="space-y-2">
        {/* Case Options Group */}
        <div className="flex gap-1">
          <button
            onClick={() => onUppercaseChange(false)}
            className={`
              relative flex-1 flex flex-col items-center justify-center p-2.5 rounded-md border transition-all duration-100
              ${!isUppercase
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
            aria-label="Show original mixed case"
          >
            <span className="text-base mb-0.5">Aa</span>
            <span className={`text-xs font-medium ${
              !isUppercase
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              Original
            </span>
            {!isUppercase && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onUppercaseChange(true)}
            className={`
              relative flex-1 flex flex-col items-center justify-center p-2.5 rounded-md border transition-all duration-100
              ${isUppercase
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
            aria-label="Show uppercase"
          >
            <span className="text-base mb-0.5">AA</span>
            <span className={`text-xs font-medium ${
              isUppercase
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              Uppercase
            </span>
            {isUppercase && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* View Options Group */}
        <div className="flex gap-1">
          <button
            onClick={() => onExpandedChange(false)}
            className={`
              relative flex-1 flex flex-col items-center justify-center p-2.5 rounded-md border transition-all duration-100
              ${!isExpanded
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
            aria-label="Show continuous view"
          >
            <span className="text-base mb-0.5">📝</span>
            <span className={`text-xs font-medium ${
              !isExpanded
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              Continuous
            </span>
            {!isExpanded && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onExpandedChange(true)}
            className={`
              relative flex-1 flex flex-col items-center justify-center p-2.5 rounded-md border transition-all duration-100
              ${isExpanded
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
            aria-label="Show word-by-word view"
          >
            <span className="text-base mb-0.5">🎯</span>
            <span className={`text-xs font-medium ${
              isExpanded
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              Word-by-Word
            </span>
            {isExpanded && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
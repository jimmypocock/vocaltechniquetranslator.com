'use client';

import { useEffect, useState } from 'react';

interface CondensedViewToggleProps {
  onToggle?: (isCondensed: boolean) => void;
}

export default function CondensedViewToggle({ onToggle }: CondensedViewToggleProps) {
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    // Check for saved condensed view preference
    const savedPreference = localStorage.getItem('condensedView') === 'true';
    setIsCondensed(savedPreference);
    if (onToggle) {
      onToggle(savedPreference);
    }
  }, [onToggle]);

  const toggleView = () => {
    const newState = !isCondensed;
    setIsCondensed(newState);
    localStorage.setItem('condensedView', String(newState));
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <button
      onClick={toggleView}
      className="fixed top-4 left-4 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-100 z-50 max-w-[calc(100vw-2rem)] view-toggle-button"
      aria-label={`Switch to ${isCondensed ? 'expanded' : 'condensed'} view`}
    >
      {isCondensed ? (
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v5m0 0H4m5 0L4 4m11 0v5m0 0h5m-5 0l5-5M9 20v-5m0 0H4m5 0l-5 5m11 0v-5m0 0h5m-5 0l5 5" />
        </svg>
      )}
    </button>
  );
}
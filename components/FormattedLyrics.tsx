'use client';

import { useState, useEffect, useRef } from 'react';
import CompactIntensitySelector from './CompactIntensitySelector';
import WordTranslationModal from './WordTranslationModal';

interface FormattedLyricsProps {
  lyrics: string;
  originalLyrics?: string;
  intensity: number;
  onUppercaseChange?: (isUppercase: boolean) => void;
  onIntensityChange?: (intensity: number) => void;
}

export default function FormattedLyrics({ lyrics, originalLyrics, intensity, onUppercaseChange, onIntensityChange }: FormattedLyricsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasSetInitialView = useRef(false);

  // Set word-by-word view when first lyrics appear
  useEffect(() => {
    if (lyrics && !hasSetInitialView.current) {
      setIsExpanded(true);
      hasSetInitialView.current = true;
    }
  }, [lyrics]);

  if (!lyrics) return null;

  // Apply uppercase if toggle is on
  const displayLyrics = isUppercase ? lyrics.toUpperCase() : lyrics;
  const displayLines = displayLyrics.split('\n');

  // Create a mapping of translated words to original words
  const getOriginalWord = (translatedWord: string, lineIndex: number, wordIndex: number): string => {
    if (!originalLyrics) return translatedWord;
    
    const originalLines = originalLyrics.split('\n');
    const originalLine = originalLines[lineIndex];
    if (!originalLine) return translatedWord;
    
    const originalWords = originalLine.split(/\s+/).filter(word => word);
    const originalWord = originalWords[wordIndex];
    
    return originalWord || translatedWord;
  };

  const handleWordClick = (word: string, lineIndex: number, wordIndex: number) => {
    const originalWord = getOriginalWord(word, lineIndex, wordIndex);
    setSelectedWord(originalWord);
    setIsModalOpen(true);
  };

  // Color palette for word backgrounds
  const wordColorClasses = [
    'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
    'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700',
    'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700',
    'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700',
    'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
  ];

  // Format as structured view with words separated
  const renderStructuredView = () => {
    let globalWordIndex = 0;
    
    return displayLines.map((line, lineIndex) => {
      // Handle empty lines for verse separation
      if (line.trim() === '') {
        return <div key={lineIndex} className="mb-8" aria-hidden="true" />;
      }

      const words = line.split(/\s+/).filter(word => word);

      return (
        <div key={lineIndex} className="lyrics-line mb-3 flex flex-wrap items-baseline gap-2">
          {words.map((word, wordIndex) => {
            const colorClass = wordColorClasses[globalWordIndex % wordColorClasses.length];
            globalWordIndex++;
            
            return (
              <span
                key={`${lineIndex}-${wordIndex}`}
                className={`lyrics-word px-3 py-1.5 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 border shadow-sm cursor-pointer ${colorClass}`}
                onClick={() => handleWordClick(word, lineIndex, wordIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleWordClick(word, lineIndex, wordIndex);
                  }
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      );
    });
  };

  // Format as continuous text (original view)
  const renderContinuousView = () => {
    return displayLines.map((line, index) => {
      // Handle empty lines for verse separation
      if (line.trim() === '') {
        return <div key={index} className="mb-4" aria-hidden="true" />;
      }

      return (
        <div key={index} className="mb-2">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="formatted-lyrics">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CompactIntensitySelector
            value={intensity}
            onChange={(newIntensity) => onIntensityChange?.(newIntensity)}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsUppercase(!isUppercase);
                onUppercaseChange?.(!isUppercase);
              }}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200 flex items-center gap-1.5"
              aria-label={isUppercase ? "Show original case" : "Show uppercase"}
            >
              {isUppercase ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10m-7 4h4" />
                </svg>
              )}
              {isUppercase ? 'Original case' : 'UPPERCASE'}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200"
              aria-label={isExpanded ? "Show continuous view" : "Show word-by-word view"}
            >
              {isExpanded ? 'Continuous view' : 'Word-by-word view'}
            </button>
          </div>
        </div>
      </div>

      <div className="lyrics-content">
        {isExpanded ? renderStructuredView() : renderContinuousView()}
      </div>

      {isExpanded && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Tip:</span> Click on any word to see how it transforms at different intensity levels!
          </p>
        </div>
      )}

      <WordTranslationModal
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
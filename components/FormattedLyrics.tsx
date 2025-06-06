'use client';

import { useState, useEffect, useRef } from 'react';
import IntensitySelector from './IntensitySelector';
import ViewControls from './ViewControls';
import WordTranslationModal from './WordTranslationModal';

interface FormattedLyricsProps {
  lyrics: string;
  originalLyrics?: string;
  intensity: number;
  onUppercaseChange?: (isUppercase: boolean) => void;
  onIntensityChange?: (intensity: number) => void;
  isCondensed?: boolean;
}

export default function FormattedLyrics({ lyrics, originalLyrics, intensity, onUppercaseChange, onIntensityChange, isCondensed = false }: FormattedLyricsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasSetInitialView = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved view preferences on mount
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window !== 'undefined') {
      try {
        const savedUppercase = localStorage.getItem('vtt-uppercase');
        const savedExpanded = localStorage.getItem('vtt-expanded');
        
        if (savedUppercase !== null) {
          setIsUppercase(savedUppercase === 'true');
        }
        
        if (savedExpanded !== null) {
          setIsExpanded(savedExpanded === 'true');
          hasSetInitialView.current = true;
        }
      } catch {
        // Silently fail if localStorage is not available
      }
      
      setIsHydrated(true);
    }
  }, []);

  // Set word-by-word view when first lyrics appear (if no saved preference)
  useEffect(() => {
    if (lyrics && !hasSetInitialView.current) {
      setIsExpanded(true);
      hasSetInitialView.current = true;
    }
  }, [lyrics]);

  // Save uppercase preference
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('vtt-uppercase', isUppercase.toString());
    }
  }, [isUppercase, isHydrated]);

  // Save expanded preference
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('vtt-expanded', isExpanded.toString());
    }
  }, [isExpanded, isHydrated]);

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
                className={`lyrics-word px-3 py-1.5 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 border shadow-sm cursor-pointer select-text transition-all duration-100 hover:shadow-md hover:scale-103 hover:brightness-100 dark:hover:brightness-125 ${colorClass}`}
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
        return <div key={index} className="mb-8" aria-hidden="true" />;
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
      <div className="mb-8">
        <div className="flex flex-col gap-3">
          <IntensitySelector
            value={intensity}
            onChange={(newIntensity) => onIntensityChange?.(newIntensity)}
            isCondensed={isCondensed}
          />
          <ViewControls
            isUppercase={isUppercase}
            onUppercaseChange={(value) => {
              setIsUppercase(value);
              onUppercaseChange?.(value);
            }}
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
            isCondensed={isCondensed}
          />
        </div>
      </div>

      <div className="lyrics-content">
        {isExpanded ? renderStructuredView() : renderContinuousView()}
      </div>

      {isExpanded && (
        <div className="mt-6 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-md border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            💡 Click any word to see all transformation levels
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
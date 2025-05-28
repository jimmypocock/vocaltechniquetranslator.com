'use client';

import { useState } from 'react';
import CompactIntensitySelector from './CompactIntensitySelector';

interface FormattedLyricsProps {
  lyrics: string;
  intensity: number;
  onUppercaseChange?: (isUppercase: boolean) => void;
  onIntensityChange?: (intensity: number) => void;
}

export default function FormattedLyrics({ lyrics, intensity, onUppercaseChange, onIntensityChange }: FormattedLyricsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  
  if (!lyrics) return null;

  // Apply uppercase if toggle is on
  const displayLyrics = isUppercase ? lyrics.toUpperCase() : lyrics;
  const displayLines = displayLyrics.split('\n');
  
  // Format as structured view with words separated
  const renderStructuredView = () => {
    return displayLines.map((line, lineIndex) => {
      // Handle empty lines for verse separation
      if (line.trim() === '') {
        return <div key={lineIndex} className="mb-6" aria-hidden="true" />;
      }
      
      const words = line.split(/\s+/).filter(word => word);
      
      return (
        <div key={lineIndex} className="lyrics-line mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          {words.map((word, wordIndex) => (
            <span 
              key={`${lineIndex}-${wordIndex}`} 
              className="lyrics-word px-2 py-1 bg-purple-50 rounded-md border border-purple-200 text-lg font-semibold text-gray-800 hover:bg-purple-100 transition-colors duration-150"
            >
              {word}
            </span>
          ))}
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
      <div className="mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CompactIntensitySelector 
            value={intensity} 
            onChange={(newIntensity) => onIntensityChange?.(newIntensity)} 
          />
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => {
                setIsUppercase(!isUppercase);
                onUppercaseChange?.(!isUppercase);
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors flex items-center gap-1"
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
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
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
    </div>
  );
}
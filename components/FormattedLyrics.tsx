'use client';

import { useState } from 'react';

interface FormattedLyricsProps {
  lyrics: string;
  intensity: number;
}

export default function FormattedLyrics({ lyrics, intensity }: FormattedLyricsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!lyrics) return null;

  // Split lyrics into lines, keeping empty lines for verse separation
  const lines = lyrics.split('\n');
  
  // Format as structured view with words separated
  const renderStructuredView = () => {
    return lines.map((line, lineIndex) => {
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
    return lines.map((line, index) => {
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
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {intensity >= 8 ? 'Full technique applied' : `Intensity level ${intensity}`}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          aria-label={isExpanded ? "Show continuous view" : "Show word-by-word view"}
        >
          {isExpanded ? 'Continuous view' : 'Word-by-word view'}
        </button>
      </div>
      
      <div className="lyrics-content">
        {isExpanded ? renderStructuredView() : renderContinuousView()}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VocalTranslator } from '@/lib/vocal-translator';
import TechniqueInfo from './TechniqueInfo';
import Examples from './Examples';
import FormattedLyrics from './FormattedLyrics';

export default function VocalTranslatorApp() {
  const [intensity, setIntensity] = useState(4);
  const [inputLyrics, setInputLyrics] = useState('');
  const [outputLyrics, setOutputLyrics] = useState('');
  const [translator] = useState(() => new VocalTranslator());
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved data from local storage on mount
  useEffect(() => {
    const savedIntensity = localStorage.getItem('vtt-intensity');
    const savedLyrics = localStorage.getItem('vtt-lyrics');
    
    if (savedIntensity) {
      const parsedIntensity = parseInt(savedIntensity, 10);
      if (!isNaN(parsedIntensity) && parsedIntensity >= 1 && parsedIntensity <= 10) {
        setIntensity(parsedIntensity);
      }
    }
    
    if (savedLyrics) {
      setInputLyrics(savedLyrics);
    }
    
    setIsHydrated(true);
  }, []);

  // Save intensity to local storage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('vtt-intensity', intensity.toString());
    }
  }, [intensity, isHydrated]);

  // Save lyrics to local storage with debounce
  useEffect(() => {
    if (isHydrated) {
      const timeout = setTimeout(() => {
        localStorage.setItem('vtt-lyrics', inputLyrics);
      }, 1000); // Save after 1 second of no typing

      return () => clearTimeout(timeout);
    }
  }, [inputLyrics, isHydrated]);

  const translateLyrics = useCallback(() => {
    if (!inputLyrics.trim()) {
      setOutputLyrics('');
      return;
    }

    const translated = translator.translateLyrics(inputLyrics, intensity);
    setOutputLyrics(translated);
  }, [inputLyrics, intensity, translator]);

  // Auto-translate with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      translateLyrics();
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputLyrics, intensity, translateLyrics]);

  const handleCopy = async () => {
    if (!outputLyrics) return;

    const textToCopy = isUppercase ? outputLyrics.toUpperCase() : outputLyrics;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      if (outputTextareaRef.current) {
        outputTextareaRef.current.value = textToCopy;
        outputTextareaRef.current.select();
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Vocal Technique Translator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Transform lyrics for optimal vocal technique and open throat positioning
        </p>
      </div>

      <TechniqueInfo />

      <div className="space-y-6">
        {/* Input Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Original Lyrics
          </h2>
          <textarea
            id="lyricsInput"
            className="w-full min-h-[200px] p-4 text-base leading-relaxed resize-y rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            placeholder={`Enter your song lyrics here...`}
            value={inputLyrics}
            onChange={(e) => setInputLyrics(e.target.value)}
          />
        </section>

        {/* Output Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Translated for Vocal Technique
            </h2>
            {outputLyrics && (
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                title="Copy to clipboard"
                aria-label="Copy translated lyrics"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <div className="phonetic-text min-h-[200px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 font-medium text-gray-900 dark:text-white">
              {outputLyrics ? (
                <FormattedLyrics
                  lyrics={outputLyrics}
                  intensity={intensity}
                  onUppercaseChange={setIsUppercase}
                  onIntensityChange={setIntensity}
                />
              ) : (
                <p className="text-gray-400 dark:text-gray-500 font-normal">Your translated lyrics will appear here...</p>
              )}
            </div>
            {/* Hidden textarea for copy functionality */}
            <textarea
              ref={outputTextareaRef}
              value={outputLyrics}
              readOnly
              className="sr-only"
              aria-hidden="true"
            />
          </div>
        </section>

        <Examples />
      </div>
    </div>
  );
}
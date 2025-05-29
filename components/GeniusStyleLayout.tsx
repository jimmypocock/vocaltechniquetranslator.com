'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VocalTranslator } from '@/lib/vocal-translator';
// import TechniqueInfo from './TechniqueInfo';
// import Examples from './Examples';
import FormattedLyrics from './FormattedLyrics';
import { AdUnit } from './AdSense';

export default function GeniusStyleLayout() {
  const [intensity, setIntensity] = useState(8);
  const [inputLyrics, setInputLyrics] = useState('');
  const [outputLyrics, setOutputLyrics] = useState('');
  const [translator] = useState(() => new VocalTranslator());
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const testMode = !process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div className="app-wrapper">
      {/* Top Video Ad */}
      <div className="glass-card border-b border-gray-200/20 dark:border-gray-700/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AdUnit
            adSlot={process.env.NEXT_PUBLIC_AD_SLOT_HEADER || "1234567890"}
            adFormat="video"
            style={{ minHeight: '250px', maxWidth: '970px' }}
            className="mx-auto"
            testMode={testMode}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Vocal Technique Translator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
            Transform lyrics for optimal vocal technique and open throat positioning
          </p>
          <a 
            href="/how-it-works" 
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </a>
        </div>

        {/* <TechniqueInfo /> */}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Original Lyrics (2/3 width) */}
          <div className="lg:col-span-2">
            <section className="glass-card p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Original Lyrics
              </h2>
              <textarea
                id="lyricsInput"
                className="input-field w-full min-h-[400px] p-4 text-base leading-relaxed resize-y rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                placeholder={`Enter your song lyrics here...\n\nExample:\nBlue jean baby, L.A. lady\nSeamstress for the band\nPretty-eyed, pirate smile\nYou'll marry a music man`}
                value={inputLyrics}
                onChange={(e) => setInputLyrics(e.target.value)}
              />
            </section>
          </div>

          {/* Right Column - Side Ad (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <AdUnit
                adSlot={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || "2345678901"}
                adFormat="video"
                style={{ minHeight: '400px', width: '100%' }}
                className="mx-auto"
                testMode={testMode}
              />
            </div>
          </div>
        </div>

        {/* Full Width Output Section */}
        <section className="glass-card p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Translated for Vocal Technique
            </h2>
            {outputLyrics && (
              <button
                onClick={handleCopy}
                className="btn-primary text-sm flex items-center gap-2"
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
            <div className="phonetic-text input-field min-h-[200px] p-4 rounded-lg font-medium text-gray-900 dark:text-white">
              {outputLyrics ? (
                <FormattedLyrics
                  lyrics={outputLyrics}
                  originalLyrics={inputLyrics}
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

        {/* <Examples /> */}
      </div>

      {/* Bottom Ad */}
      <div className="glass-card border-t border-gray-200/20 dark:border-gray-700/20 backdrop-blur-lg mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <AdUnit
            adSlot={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER || "3456789012"}
            adFormat="horizontal"
            className="mx-auto mb-6"
            testMode={testMode}
          />

          {/* Footer */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Vocal Technique Translator. All rights reserved.
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <a href="/how-it-works" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                How It Works
              </a>
              <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
              <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Privacy Policy
              </a>
              <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
              <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
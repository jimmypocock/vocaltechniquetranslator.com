'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { VocalTranslator } from '@/lib/vocal-translator';
// import TechniqueInfo from './TechniqueInfo';
// import Examples from './Examples';
import FormattedLyrics from './FormattedLyrics';
import { AdUnit } from './AdSense';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAdsVisibility } from '@/hooks/useAdsVisibility';

export default function GeniusStyleLayout() {
  const [intensity, setIntensity] = useState(8); // Default to Maximum
  const [inputLyrics, setInputLyrics] = useState('');
  const [outputLyrics, setOutputLyrics] = useState('');
  const [translator] = useState(() => new VocalTranslator());
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const shouldShowAds = useAdsVisibility();

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

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => inputTextareaRef.current?.focus(),
      description: 'Focus on lyrics input'
    },
    {
      key: 'Enter',
      ctrl: true,
      action: handleCopy,
      description: 'Copy translated lyrics'
    },
    {
      key: 'v',
      action: () => {
        // This will be handled by FormattedLyrics component
        const viewToggle = document.querySelector('[aria-label*="view"]') as HTMLButtonElement;
        viewToggle?.click();
      },
      description: 'Toggle view'
    },
    {
      key: 'u',
      action: () => {
        // Find and click the uppercase toggle button - look for both possible aria-labels
        const uppercaseToggle = document.querySelector('[aria-label="Show uppercase"], [aria-label="Show original case"]') as HTMLButtonElement;
        uppercaseToggle?.click();
      },
      description: 'Toggle uppercase'
    },
    {
      key: '1',
      action: () => setIntensity(1),
      description: 'Minimal intensity'
    },
    {
      key: '2',
      action: () => setIntensity(5),
      description: 'Moderate intensity'
    },
    {
      key: '3',
      action: () => setIntensity(9),
      description: 'Full intensity'
    },
    {
      key: 'h',
      action: () => router.push('/how-it-works'),
      description: 'Go to How It Works'
    },
    {
      key: '?',
      action: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts'
    }
  ]);

  const testMode = !process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div className="app-wrapper">
      {/* Top Video Ad */}
      {shouldShowAds && (
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
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">🎤</span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Vocal Technique Translator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-2">
            Transform lyrics for optimal vocal technique and open throat positioning
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-0.5 bg-purple-300 dark:bg-purple-700 rounded-full"></span>
            <span className="w-3 h-3 bg-purple-400 dark:bg-purple-600 rounded-full animate-pulse"></span>
            <span className="w-8 h-0.5 bg-purple-300 dark:bg-purple-700 rounded-full"></span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/how-it-works"
              className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-sm text-purple-700 dark:text-purple-300"
            >
              <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </a>
            <button
              onClick={() => setShowShortcuts(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-sm text-purple-700 dark:text-purple-300"
              title="Keyboard shortcuts (press ?)"
            >
              <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Shortcuts
            </button>
          </div>
        </div>

        {/* <TechniqueInfo /> */}

        {/* Two Column Layout */}
        <div className={`grid grid-cols-1 ${shouldShowAds ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
          {/* Left Column - Original Lyrics (2/3 width when ads shown, full width when hidden) */}
          <div className={shouldShowAds ? "lg:col-span-2" : ""}>
            <section className="glass-card p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Paste in Original Lyrics:
              </h2>
              <textarea
                ref={inputTextareaRef}
                id="lyricsInput"
                className="input-field w-full min-h-[400px] p-4 text-sm leading-relaxed resize-y rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-100"
                placeholder={`Enter your song lyrics here...\n\nExample:\nBlue jean baby, L.A. lady\nSeamstress for the band\nPretty-eyed, pirate smile\nYou'll marry a music man`}
                value={inputLyrics}
                onChange={(e) => setInputLyrics(e.target.value)}
              />
            </section>
          </div>

          {/* Right Column - Side Ad (1/3 width) */}
          {shouldShowAds && (
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
          )}
        </div>

        {/* Full Width Output Section */}
        <section className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
              Translated for Vocal Technique
            </h2>
            {outputLyrics && (
              <button
                onClick={handleCopy}
                className={`
                  px-4 py-2 rounded-lg transition-all duration-100 flex items-center gap-2 text-sm font-semibold shadow-sm
                  ${copySuccess
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md hover:scale-105'
                  }
                `}
                title="Copy to clipboard (Ctrl+Enter)"
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
      <div className="glass-card border-t border-gray-200/20 dark:border-gray-700/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {shouldShowAds && (
            <AdUnit
              adSlot={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER || "3456789012"}
              adFormat="horizontal"
              className="mx-auto mb-6"
              testMode={testMode}
            />
          )}

          {/* Footer */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Vocal Technique Translator. All rights reserved.
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <a href="/about" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                About
              </a>
              <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
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

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Floating keyboard hint */}
      <div className="fixed bottom-4 left-4 z-50 hidden lg:block">
        <button
          onClick={() => setShowShortcuts(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-purple-500/50 bg-purple-50/90 dark:bg-purple-900/20 backdrop-blur-sm text-purple-700 dark:text-purple-300 text-sm hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-100 shadow-lg"
          title="Show keyboard shortcuts"
        >
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700 rounded text-purple-700 dark:text-purple-300">?</kbd>
          <span className="text-xs font-medium">Keyboard shortcuts</span>
        </button>
      </div>
    </div>
  );
}
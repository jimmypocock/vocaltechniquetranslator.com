'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { VocalTranslator } from '@/lib/vocal-translator';
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [favorites, setFavorites] = useState<Array<{id: string, title: string, lyrics: string, intensity: number}>>([]);
  const [lyricsHistory, setLyricsHistory] = useState<Array<{lyrics: string, timestamp: number}>>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [favoriteSuccess, setFavoriteSuccess] = useState(false);

  // Load saved data from local storage on mount
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window !== 'undefined') {
      try {
        const savedIntensity = localStorage.getItem('vtt-intensity');
        const savedLyrics = localStorage.getItem('vtt-lyrics');
        const savedFavorites = localStorage.getItem('vtt-favorites');
        const savedHistory = localStorage.getItem('vtt-history');

        if (savedIntensity) {
          const parsedIntensity = parseInt(savedIntensity, 10);
          if (!isNaN(parsedIntensity) && parsedIntensity >= 1 && parsedIntensity <= 10) {
            setIntensity(parsedIntensity);
          }
        }

        if (savedLyrics) {
          setInputLyrics(savedLyrics);
        }

        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }

        if (savedHistory) {
          setLyricsHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }

      setIsHydrated(true);
    }
  }, []);

  // Save intensity to local storage when it changes
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem('vtt-intensity', intensity.toString());
      } catch (error) {
        console.error('Error saving intensity:', error);
      }
    }
  }, [intensity, isHydrated]);

  // Save lyrics to local storage with debounce
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      const timeout = setTimeout(() => {
        try {
          localStorage.setItem('vtt-lyrics', inputLyrics);
        } catch (error) {
          console.error('Error saving lyrics:', error);
        }
      }, 1000); // Save after 1 second of no typing

      return () => clearTimeout(timeout);
    }
  }, [inputLyrics, isHydrated]);

  // Update history when lyrics change (with debounce)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined' && inputLyrics.trim()) {
      const timeout = setTimeout(() => {
        try {
          const newHistory = [...lyricsHistory];
          // Remove duplicate if exists
          const existingIndex = newHistory.findIndex(h => h.lyrics === inputLyrics);
          if (existingIndex > -1) {
            newHistory.splice(existingIndex, 1);
          }
          // Add to beginning
          newHistory.unshift({ lyrics: inputLyrics, timestamp: Date.now() });
          // Keep only last 10 entries
          const trimmedHistory = newHistory.slice(0, 10);
          setLyricsHistory(trimmedHistory);
          localStorage.setItem('vtt-history', JSON.stringify(trimmedHistory));
        } catch (error) {
          console.error('Error saving history:', error);
        }
      }, 3000); // Save to history after 3 seconds of no typing

      return () => clearTimeout(timeout);
    }
  }, [inputLyrics, isHydrated, lyricsHistory]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem('vtt-favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }
  }, [favorites, isHydrated]);

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

  const addToFavorites = () => {
    if (!inputLyrics.trim()) return;

    const title = inputLyrics.split('\n')[0].slice(0, 50) + (inputLyrics.split('\n')[0].length > 50 ? '...' : '');
    const newFavorite = {
      id: Date.now().toString(),
      title,
      lyrics: inputLyrics,
      intensity
    };

    setFavorites([newFavorite, ...favorites]);
    setFavoriteSuccess(true);
  };

  // Reset favorite success when lyrics or intensity changes
  useEffect(() => {
    setFavoriteSuccess(false);
  }, [inputLyrics, intensity]);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  const getIntensityLabel = (level: number): string => {
    if (level <= 3) return 'Minimal';
    if (level <= 7) return 'Moderate';
    return 'Maximum';
  };

  const loadFavorite = (favorite: typeof favorites[0]) => {
    setInputLyrics(favorite.lyrics);
    setIntensity(favorite.intensity);
    setShowFavorites(false);
  };

  const loadFromHistory = (historyItem: typeof lyricsHistory[0]) => {
    setInputLyrics(historyItem.lyrics);
    setShowHistory(false);
  };

  const loadRandomLyrics = async () => {
    try {
      // Read from LYRICS.md file
      const response = await fetch('/LYRICS.md');
      const text = await response.text();
      const passages = text.split('\n---\n').filter(p => p.trim());
      if (passages.length > 0) {
        const randomIndex = Math.floor(Math.random() * passages.length);
        setInputLyrics(passages[randomIndex].trim());
      }
    } catch (error) {
      console.error('Error loading random lyrics:', error);
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
      action: () => setIntensity(4),
      description: 'Moderate intensity'
    },
    {
      key: '3',
      action: () => setIntensity(8),
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
    },
    {
      key: 'f',
      action: () => setShowFavorites(true),
      description: 'Show favorites'
    },
    {
      key: 'r',
      action: () => setShowHistory(true),
      description: 'Show recent lyrics'
    },
    {
      key: 's',
      ctrl: true,
      action: () => {
        addToFavorites();
      },
      description: 'Save to favorites'
    },
    {
      key: 'd',
      action: () => loadRandomLyrics(),
      description: 'Load random lyrics'
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
            <Image
              src="/images/logo.svg"
              alt="Vocal Technique Translator Logo"
              width={48}
              height={48}
              className="mr-3 mt-2 hidden sm:inline-block"
              priority
            />
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-sm text-purple-700 dark:text-purple-300"
            >
              <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </a>
            <Link
              href="/articles"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-sm text-purple-700 dark:text-purple-300"
            >
              <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Vocal Health Articles
            </Link>
            <button
              onClick={() => setShowShortcuts(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-sm text-purple-700 dark:text-purple-300"
              title="Keyboard shortcuts (press ?)"
            >
              <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Shortcuts
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-3">
            <button
              onClick={() => setShowFavorites(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-sm text-purple-700 dark:text-purple-300"
              title="View favorites"
            >
              <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-sm text-purple-700 dark:text-purple-300"
              title="View history"
            >
              <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History ({lyricsHistory.length})
            </button>
          </div>
        </div>

        {/* <TechniqueInfo /> */}

        {/* Two Column Layout */}
        <div className={`grid grid-cols-1 ${shouldShowAds ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
          {/* Left Column - Original Lyrics (2/3 width when ads shown, full width when hidden) */}
          <div className={shouldShowAds ? "lg:col-span-2" : ""}>
            <section className="glass-card p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                  Original Lyrics
                </h2>
                <button
                  onClick={loadRandomLyrics}
                  className="inline-flex items-center px-3 py-1.5 rounded-md border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-100 text-xs text-purple-700 dark:text-purple-300"
                  title="Load random lyrics"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Random
                </button>
              </div>
              <textarea
                ref={inputTextareaRef}
                id="lyricsInput"
                className="input-field w-full min-h-[400px] p-4 text-sm leading-relaxed resize-y rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-100"
                placeholder={`Enter your song lyrics here...`}
                value={inputLyrics}
                onChange={(e) => setInputLyrics(e.target.value)}
              />
              {outputLyrics && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Scroll down for translation
                  </p>
                </div>
              )}
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

        {/* Educational Content Section for SEO */}
        <section className="glass-card p-6 md:p-8 mb-8">
          <div className="mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Mastering Vocal Technique
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  What is Singing Phonetics?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                  Singing phonetics transforms how you approach vocal technique by converting challenging English sounds
                  into singer-friendly alternatives. Our tool uses a custom phonetic system designed specifically
                  for vocal performance, helping singers achieve better resonance and reduce strain without the complexity of traditional IPA.
                </p>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 mt-auto">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                    Why Voice Teachers Recommend Phonetic Training
                  </h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Improves vowel consistency across registers</li>
                    <li>• Reduces tension from difficult consonant clusters</li>
                    <li>• Enhances legato phrasing and breath support</li>
                    <li>• Builds muscle memory for proper articulation</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Phonetics Exercises for Vocal Students
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                  Professional vocal training incorporates systematic phonetic practice. Start with simple
                  transformations like converting diphthongs (&quot;I&quot; → &quot;AH&quot;) and progress to complete
                  lyrical passages for advanced technique development.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-auto">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    How to Teach Phonetics to Singers
                  </h4>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Begin with vowel substitution exercises</li>
                    <li>Practice syllable separation on familiar songs</li>
                    <li>Gradually increase transformation intensity</li>
                    <li>Apply techniques to performance repertoire</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Vocal Technique Warm-ups with Phonetics
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🎵</div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    Diphthong Practice
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    &quot;I&quot; → &quot;AH-ee&quot; for smooth transitions
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🗣️</div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    Consonant Flow
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Soften hard sounds for legato singing
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">📚</div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    Syllable Work
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Break complex words into manageable parts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Width Output Section */}
        <section className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
              Translated for Vocal Technique
            </h2>
            {outputLyrics && (
              <div className="flex items-center gap-2">
                <button
                  onClick={addToFavorites}
                  className={`
                    px-4 py-2 rounded-lg transition-all duration-100 flex items-center gap-2 text-sm font-semibold shadow-sm
                    ${favoriteSuccess
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md hover:scale-105'
                    }
                  `}
                  title={favoriteSuccess ? "Already in favorites" : "Add to favorites (Ctrl+S)"}
                  disabled={favoriteSuccess}
                >
                  {favoriteSuccess ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Favorite
                    </>
                  )}
                </button>
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
              </div>
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
              <Link href="/articles" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Articles
              </Link>
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

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFavorites(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Favorites</h2>
              <button
                onClick={() => setShowFavorites(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {favorites.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No favorites yet. Add lyrics to see them here!</p>
              ) : (
                <div className="space-y-3">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="glass-card p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{favorite.title}</h3>
                        <button
                          onClick={() => removeFavorite(favorite.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                          title="Remove from favorites"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Intensity: {getIntensityLabel(favorite.intensity)}</p>
                      <button
                        onClick={() => loadFavorite(favorite)}
                        className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Lyrics</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {lyricsHistory.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No history yet. Start typing lyrics to see them here!</p>
              ) : (
                <div className="space-y-3">
                  {lyricsHistory.map((item, index) => (
                    <div key={index} className="glass-card p-4 hover:shadow-lg transition-shadow">
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {item.lyrics}
                      </p>
                      <button
                        onClick={() => loadFromHistory(item)}
                        className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Toast - Removed to reduce visual clutter since button already shows feedback */}

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
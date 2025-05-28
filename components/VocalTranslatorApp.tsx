'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { VocalTranslator } from '@/lib/vocal-translator';
import TechniqueInfo from './TechniqueInfo';
import Examples from './Examples';
import FormattedLyrics from './FormattedLyrics';
import { AdBanner, AdUnit } from './AdSense';

export default function VocalTranslatorApp() {
  const [intensity, setIntensity] = useState(4);
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

  return (
    <div className="container bg-white/95 rounded-[20px] p-[30px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-[10px] w-full max-w-[1000px]">
      <div className="header text-center mb-[30px]">
        <h1 className="mb-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          🎵 Vocal Technique Translator
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Transform lyrics for optimal vocal technique and open throat positioning
        </p>
      </div>

      <TechniqueInfo />

      {/* Ad placement 1: Below header info */}
      <AdBanner
        adSlot={process.env.NEXT_PUBLIC_AD_SLOT_HEADER || "1234567890"}
        className="my-6"
        testMode={!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      />


      <div className="input-section mb-5">
        <div className="section-title text-xl font-semibold text-gray-800 mb-3">
          Original Lyrics
        </div>
        <textarea
          id="lyricsInput"
          className="w-full min-h-[180px] p-4 border-2 border-gray-200 rounded-xl text-lg leading-relaxed transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-20"
          placeholder={`Enter your song lyrics here...\n\nExample:\nBlue jean baby, L.A. lady\nSeamstress for the band\nPretty-eyed, pirate smile\nYou'll marry a music man`}
          value={inputLyrics}
          onChange={(e) => setInputLyrics(e.target.value)}
        />
      </div>

      {/* Ad placement 2: Between input and output */}
      <div className="my-6">
        <AdUnit
          adSlot={process.env.NEXT_PUBLIC_AD_SLOT_CONTENT || "2345678901"}
          adFormat="auto"
          className="mx-auto"
          testMode={!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        />
      </div>

      <div className="output-section mb-5 relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title text-xl font-semibold text-gray-800">
            Translated for Vocal Technique
          </h2>
          {outputLyrics && (
            <button
              onClick={handleCopy}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
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
          <div className="phonetic-text min-h-[180px] p-4 border-2 border-gray-200 rounded-xl bg-gray-50 font-semibold text-gray-800">
            {outputLyrics ? (
              <FormattedLyrics 
                lyrics={outputLyrics} 
                intensity={intensity}
                onUppercaseChange={setIsUppercase}
                onIntensityChange={setIntensity}
              />
            ) : (
              <p className="text-gray-400 font-normal">Your translated lyrics will appear here...</p>
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
      </div>

      <Examples />

      {/* Ad placement 3: Footer area */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <AdBanner
          adSlot={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER || "3456789012"}
          className="mb-4"
          testMode={!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        />

        {/* Footer links */}
        <div className="text-center mt-6 space-y-2">
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} Vocal Technique Translator. All rights reserved.
          </div>
          <div className="text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <span className="mx-2 text-gray-400">•</span>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
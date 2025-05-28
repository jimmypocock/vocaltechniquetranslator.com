'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { VocalTranslator } from '@/lib/vocal-translator';
import IntensitySlider from './IntensitySlider';
import TechniqueInfo from './TechniqueInfo';
import Examples from './Examples';
import { AdBanner, AdUnit } from './AdSense';

export default function VocalTranslatorApp() {
  const [intensity, setIntensity] = useState(8);
  const [inputLyrics, setInputLyrics] = useState('');
  const [outputLyrics, setOutputLyrics] = useState('');
  const [translator] = useState(() => new VocalTranslator());

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

  return (
    <div className="container bg-white/95 rounded-[20px] p-[30px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-[10px] w-full max-w-[1000px]">
      <div className="header text-center mb-[30px]">
        <h1 className="text-[#333] text-[2.5em] mb-[10px] bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          🎵 Vocal Technique Translator
        </h1>
        <p className="text-[#666] text-[1.1em]">
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

      <div className="controls flex gap-5 mb-5 items-center flex-wrap">
        <IntensitySlider value={intensity} onChange={setIntensity} />
      </div>

      <div className="input-section mb-5">
        <div className="section-title text-[1.2em] font-semibold text-[#333] mb-[10px]">
          Original Lyrics
        </div>
        <textarea
          id="lyricsInput"
          className="w-full min-h-[150px] p-[15px] border-2 border-[#e0e0e0] rounded-[10px] text-base leading-[1.6] font-inherit transition-colors focus:outline-none focus:border-[#667eea]"
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

      <div className="output-section mb-5">
        <div className="section-title text-[1.2em] font-semibold text-[#333] mb-[10px]">
          Translated for Vocal Technique
        </div>
        <textarea
          id="lyricsOutput"
          className="output-textarea w-full min-h-[150px] p-[15px] border-2 border-[#e0e0e0] rounded-[10px] text-base leading-[1.6] bg-[#f8f9fa] font-['Courier_New',monospace] font-bold text-[#333]"
          placeholder="Your translated lyrics will appear here..."
          value={outputLyrics}
          readOnly
        />
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
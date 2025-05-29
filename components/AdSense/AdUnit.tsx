'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | 'video';
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
  testMode?: boolean;
}

export default function AdUnit({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
  fullWidthResponsive = true,
  testMode = false
}: AdUnitProps) {
  const isProduction = process.env.NODE_ENV === 'production';
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (isProduction && !testMode && adClient && consent === 'accepted') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [isProduction, testMode, adClient]);

  // Check for consent
  const consent = typeof window !== 'undefined' ? localStorage.getItem('cookie-consent') : null;
  
  // Show placeholder in development, test mode, or if no consent
  if (!isProduction || testMode || !adClient || consent !== 'accepted') {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-400 ${className}`}
        style={{
          minHeight: '90px',
          ...style
        }}
      >
        <div className="text-center p-4">
          <p className="font-semibold">
            {adFormat === 'video' ? '📹 Video Ad Placeholder' : 'Ad Placeholder'}
          </p>
          <p className="text-sm">Slot: {adSlot}</p>
          <p className="text-xs mt-1">
            {!adClient ? 'No AdSense Client ID' : 'Development Mode'}
          </p>
          {adFormat === 'video' && (
            <p className="text-xs mt-2 text-gray-500">
              Video ads typically have higher revenue
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          maxWidth: '100%',
          ...style
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
}
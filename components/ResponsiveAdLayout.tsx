'use client';

import { useEffect, useState } from 'react';
import { AdBanner, AdUnit } from './AdSense';
import { useAdsVisibility } from '@/hooks/useAdsVisibility';

interface ResponsiveAdLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveAdLayout({ children }: ResponsiveAdLayoutProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const shouldShowAds = useAdsVisibility();

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const adSlots = {
    header: process.env.NEXT_PUBLIC_AD_SLOT_HEADER || "1234567890",
    content: process.env.NEXT_PUBLIC_AD_SLOT_CONTENT || "2345678901",
    sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || "3456789012",
    footer: process.env.NEXT_PUBLIC_AD_SLOT_FOOTER || "4567890123"
  };

  const testMode = !process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div className="min-h-screen">
      {/* Top Banner - All screens */}
      {shouldShowAds && (
        <div className="w-full bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <AdBanner
              adSlot={adSlots.header}
              className="mx-auto"
              testMode={testMode}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Desktop Sidebar Ad - Left side */}
        {screenSize === 'desktop' && shouldShowAds && (
          <aside className="hidden lg:block w-64 flex-shrink-0 p-4">
            <div className="sticky top-20">
              <AdUnit
                adSlot={adSlots.sidebar}
                adFormat="vertical"
                style={{ width: '240px', height: '600px' }}
                className="mx-auto"
                testMode={testMode}
              />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 py-8">
          {children}

          {/* Mobile/Tablet: Content Ad after main content */}
          {screenSize !== 'desktop' && shouldShowAds && (
            <div className="mt-8 -mx-4 px-4 py-4 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
              <AdUnit
                adSlot={adSlots.content}
                adFormat="auto"
                fullWidthResponsive={true}
                testMode={testMode}
              />
            </div>
          )}
        </main>

        {/* Desktop Sidebar Ad - Right side */}
        {screenSize === 'desktop' && shouldShowAds && (
          <aside className="hidden lg:block w-64 flex-shrink-0 p-4">
            <div className="sticky top-20">
              <AdUnit
                adSlot={adSlots.sidebar}
                adFormat="rectangle"
                style={{ width: '240px', height: '400px' }}
                className="mx-auto"
                testMode={testMode}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Footer Ad - All screens */}
      <footer className="mt-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {shouldShowAds && (
            <AdBanner
              adSlot={adSlots.footer}
              className="mb-6"
              testMode={testMode}
            />
          )}
          
          {/* Footer links */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Vocal Technique Translator. All rights reserved.
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
      </footer>
    </div>
  );
}
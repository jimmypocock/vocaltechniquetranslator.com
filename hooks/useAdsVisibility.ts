'use client';

import { useState, useEffect } from 'react';

export function useAdsVisibility() {
  const [shouldShowAds, setShouldShowAds] = useState(false);
  
  useEffect(() => {
    // Check environment variable
    const showAdsEnv = process.env.NEXT_PUBLIC_SHOW_ADS === 'true';
    
    if (!showAdsEnv) {
      setShouldShowAds(false);
      return;
    }
    
    // Check consent from localStorage (set by CMP)
    const consent = localStorage.getItem('cookie-consent');
    setShouldShowAds(consent === 'accepted');
    
    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookie-consent') {
        setShouldShowAds(e.newValue === 'accepted');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return shouldShowAds;
}
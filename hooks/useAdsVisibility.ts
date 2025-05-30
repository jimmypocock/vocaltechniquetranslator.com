'use client';

export function useAdsVisibility() {
  // Simply check the environment variable
  return process.env.NEXT_PUBLIC_SHOW_ADS === 'true';
}
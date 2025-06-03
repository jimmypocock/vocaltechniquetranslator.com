'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="gradient-orb orb1" />
      <div className="gradient-orb orb2" />
      <div className="gradient-orb orb3" />
      <div className="gradient-orb orb4" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--accent)' }}>
            Oops!
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We encountered an unexpected error. Please try again or return to the home page.
          </p>
          <div className="space-y-4">
            <button
              onClick={reset}
              className="btn-primary inline-block"
            >
              Try Again
            </button>
            <div>
              <Link 
                href="/"
                className="text-sm hover:underline"
                style={{ color: 'var(--secondary)' }}
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
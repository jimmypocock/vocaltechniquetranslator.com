'use client';

import { useEffect } from 'react';
import { confirmSignIn } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import '@/lib/cognito-config';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have an authorization code in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          // OAuth flow completed, redirect to admin panel
          router.push('/admin/feedback');
        } else {
          // No code, something went wrong
          console.error('No authorization code found');
          router.push('/admin/feedback');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/admin/feedback');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}
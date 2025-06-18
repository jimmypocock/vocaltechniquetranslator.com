'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getCurrentUser, signIn, signOut } from 'aws-amplify/auth';
import { Lock, LogOut } from 'lucide-react';
import '@/lib/cognito-config'; // Initialize Amplify

interface User {
  username: string;
  userId?: string;
  signInDetails?: unknown;
}

interface CognitoAuthProps {
  onAuthenticated: (user: User) => void;
  children: React.ReactNode;
}

export default function CognitoAuth({ onAuthenticated, children }: CognitoAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      onAuthenticated(currentUser);
    } catch {
      // User not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [onAuthenticated]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSigningIn(true);

    try {
      const signInResult = await signIn({
        username: credentials.username,
        password: credentials.password,
      });

      if (signInResult.isSignedIn) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        onAuthenticated(currentUser);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError((error as Error).message || 'Failed to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      window.location.reload();
    } catch {
      console.error('Sign out error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Admin Access Required
            </h1>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Please sign in with your admin credentials
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSigningIn || !credentials.username || !credentials.password}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400
                         text-white font-medium rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                         disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSigningIn ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to Translator
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show admin panel with logout option
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                   bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg 
                   hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
          title={`Signed in as ${user.username}`}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
      {children}
    </div>
  );
}
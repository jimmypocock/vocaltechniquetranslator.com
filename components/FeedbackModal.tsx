'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { submitFeedback } from '@/lib/feedback-client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalWord: string;
  currentTransformation: string;
  intensity: number;
  context?: string;
}

interface FeedbackData {
  originalWord: string;
  currentTransformation: string;
  suggestedTransformation: string;
  intensity: number;
  context: string;
  reason?: string;
  timestamp: string;
  id: string;
}

export function FeedbackModal({
  isOpen,
  onClose,
  originalWord,
  currentTransformation,
  intensity,
  context = 'singing'
}: FeedbackModalProps) {
  const [suggestion, setSuggestion] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuggestion('');
      setReason('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestion.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create feedback object
      const feedback: FeedbackData = {
        originalWord,
        currentTransformation,
        suggestedTransformation: suggestion.trim(),
        intensity,
        context,
        reason: reason.trim(),
        timestamp: new Date().toISOString(),
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Store in localStorage (as backup)
      const existingFeedback = localStorage.getItem('vtt_feedback');
      const feedbackList: FeedbackData[] = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackList.push(feedback);
      localStorage.setItem('vtt_feedback', JSON.stringify(feedbackList));
      
      // Send to API
      try {
        await submitFeedback(feedback);
      } catch (error) {
        console.error('Error submitting feedback to server:', error);
        // Continue anyway - we have localStorage backup
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Suggest Better Pronunciation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showSuccess ? (
            <div className="py-8 text-center">
              <div className="text-green-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Thank you for your feedback!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your suggestion helps improve our translations.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Original Word
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                    {originalWord}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Transformation (Intensity {intensity})
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                    {currentTransformation}
                  </div>
                </div>

                <div>
                  <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Suggested Pronunciation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="suggestion"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="e.g., byoo-tih-ful"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use hyphens to show syllable breaks
                  </p>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Why is this better? (Optional)
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., More natural for singing, easier to pronounce..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Your feedback helps us improve translations for everyone. We review all suggestions regularly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 
                             dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !suggestion.trim()}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md 
                             hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed 
                             transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
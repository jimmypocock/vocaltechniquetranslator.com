'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Download, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CognitoAuth from './CognitoAuth';

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

// Memoized feedback item component to prevent unnecessary re-renders
const FeedbackItem = React.memo(({ item, onDelete }: { item: FeedbackData; onDelete: (id: string) => void }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Original</p>
              <p className="font-medium text-gray-900 dark:text-white break-words">{item.originalWord}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current (Level {item.intensity})</p>
              <p className="font-medium text-gray-900 dark:text-white break-words">{item.currentTransformation}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Suggested</p>
              <p className="font-medium text-green-600 dark:text-green-400 whitespace-pre-wrap break-words">{item.suggestedTransformation}</p>
            </div>
          </div>
          
          {item.reason && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Reason</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap break-words">{item.reason}</p>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Context: {item.context}</span>
            <span>•</span>
            <span>{new Date(item.timestamp).toLocaleString()}</span>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(item.id)}
          className="ml-4 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Delete this feedback"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

FeedbackItem.displayName = 'FeedbackItem';

export default function FeedbackAdmin() {
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Helper function to deduplicate feedback by ID
  const deduplicateFeedback = (feedback: FeedbackData[]): FeedbackData[] => {
    const seen = new Set<string>();
    return feedback.map(item => {
      if (!item.id || seen.has(item.id)) {
        // Create a new object with a new ID instead of mutating
        const newId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 4)}`;
        seen.add(newId);
        return { ...item, id: newId };
      }
      seen.add(item.id);
      return item;
    });
  };

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      // First try to load from API if configured
      const apiEndpoint = process.env.NEXT_PUBLIC_FEEDBACK_API_ENDPOINT;
      if (apiEndpoint && user) {
        try {
          const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // The API Gateway should be configured to validate Cognito tokens
              // If you need to pass auth, you can get the token from Cognito
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            const data = result.feedback || result.items || [];
            // Sort by timestamp, newest first, then deduplicate
            data.sort((a: FeedbackData, b: FeedbackData) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            const uniqueData = deduplicateFeedback(data);
            setFeedbackList(uniqueData);
            return;
          }
        } catch (error) {
          console.error('Error fetching from API:', error);
          // Fall back to localStorage
        }
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem('vtt_feedback');
      if (stored) {
        const data = JSON.parse(stored) as FeedbackData[];
        // Sort by timestamp, newest first, then deduplicate
        data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const uniqueData = deduplicateFeedback(data);
        setFeedbackList(uniqueData);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFeedback();
    }
  }, [user]);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(feedbackList, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `vtt-feedback-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Original', 'Current', 'Suggested', 'Intensity', 'Context', 'Reason', 'ID'];
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...feedbackList.map(item => [
        `"${new Date(item.timestamp).toLocaleString()}"`,
        `"${item.originalWord.replace(/"/g, '""')}"`,
        `"${item.currentTransformation.replace(/"/g, '""')}"`,
        `"${item.suggestedTransformation.replace(/"/g, '""')}"`,
        item.intensity,
        `"${item.context.replace(/"/g, '""')}"`,
        `"${(item.reason || '').replace(/"/g, '""')}"`,
        `"${item.id.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    const exportFileDefaultName = `vtt-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this feedback item?')) {
      const updated = feedbackList.filter(item => item.id !== id);
      setFeedbackList(updated);
      // Save updated list back to localStorage
      localStorage.setItem('vtt_feedback', JSON.stringify(updated));
    }
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to delete ALL feedback? This cannot be undone.')) {
      setFeedbackList([]);
      localStorage.removeItem('vtt_feedback');
    }
  };

  const handleAuthenticated = useCallback((authenticatedUser: { username: string }) => {
    setUser(authenticatedUser);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(feedbackList.length / itemsPerPage);
  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return feedbackList.slice(startIndex, endIndex);
  }, [feedbackList, currentPage, itemsPerPage]);

  // Reset to page 1 when feedback list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [feedbackList.length]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <CognitoAuth onAuthenticated={handleAuthenticated}>
      {user && (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Translator
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feedback Administration
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {feedbackList.length} feedback items collected
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={loadFeedback}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                
                {feedbackList.length > 0 && (
                  <>
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    
                    <button
                      onClick={exportToJSON}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export JSON
                    </button>
                    
                    <button
                      onClick={clearAll}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No feedback collected yet. Users can submit feedback using the feedback button on translated lyrics.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedFeedback.map((item) => (
                  <FeedbackItem 
                    key={item.id} 
                    item={item}
                    onDelete={deleteItem}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {feedbackList.length > itemsPerPage && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, feedbackList.length)} of {feedbackList.length} items
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Pro Tip</h2>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            Export feedback regularly and use it to improve your exception dictionary. 
            You can analyze patterns in the suggestions to identify commonly requested transformations.
          </p>
        </div>
      </div>
    </div>
      )}
    </CognitoAuth>
  );
}
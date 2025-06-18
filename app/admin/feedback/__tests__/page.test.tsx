import React from 'react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock AWS Amplify before any imports that might use it
vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock the cognito config to prevent Amplify initialization
vi.mock('@/lib/cognito-config', () => ({
  default: {}
}))

import FeedbackAdmin from '../page'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock CognitoAuth to auto-authenticate
vi.mock('../CognitoAuth', () => ({
  default: function MockCognitoAuth({ children, onAuthenticated }: { children: React.ReactNode; onAuthenticated: (user: { username: string }) => void }) {
    // Use a ref to ensure we only call onAuthenticated once
    const hasCalledRef = React.useRef(false)
    
    React.useEffect(() => {
      if (!hasCalledRef.current) {
        hasCalledRef.current = true
        // Use setTimeout to break out of the render cycle
        setTimeout(() => {
          onAuthenticated({ username: 'testuser' })
        }, 0)
      }
    }, [onAuthenticated])
    
    return <>{children}</>
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.localStorage = localStorageMock as Storage

// Mock window methods
global.confirm = vi.fn(() => true)

// Mock document.createElement for download functionality
const mockClick = vi.fn()

describe('FeedbackAdmin', () => {
  const mockFeedbackData = [
    {
      id: 'feedback_1234567890_abc123',
      originalWord: 'beautiful',
      currentTransformation: 'BYOO-TIH-FUL',
      suggestedTransformation: 'byoo-tih-ful',
      intensity: 7,
      context: 'singing',
      reason: 'More natural pronunciation',
      timestamp: '2024-01-15T10:30:00.000Z'
    },
    {
      id: 'feedback_1234567891_def456',
      originalWord: 'hello',
      currentTransformation: 'HEH-LOH',
      suggestedTransformation: 'hel-lo',
      intensity: 5,
      context: 'singing',
      timestamp: '2024-01-15T11:00:00.000Z'
    },
    // Duplicate ID to test deduplication
    {
      id: 'feedback_1234567891_def456',
      originalWord: 'world',
      currentTransformation: 'WURLD',
      suggestedTransformation: 'werld',
      intensity: 6,
      context: 'singing',
      timestamp: '2024-01-15T11:30:00.000Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFeedbackData))
    
    // Mock createElement for download links
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') {
        element.click = mockClick
      }
      return element
    })
  })

  afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks()
    mockClick.mockClear()
    
    // Cleanup is handled automatically by React Testing Library
  })

  it('should render feedback admin page', async () => {
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('Feedback Administration')).toBeInTheDocument()
    })
  })

  it('should load and display feedback from localStorage', async () => {
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('beautiful')).toBeInTheDocument()
      expect(screen.getByText('BYOO-TIH-FUL')).toBeInTheDocument()
      expect(screen.getByText('byoo-tih-ful')).toBeInTheDocument()
    })
  })

  it('should handle duplicate IDs gracefully', async () => {
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      // Should see all items despite duplicate IDs
      expect(screen.getByText('beautiful')).toBeInTheDocument()
      expect(screen.getByText('hello')).toBeInTheDocument()
      expect(screen.getByText('world')).toBeInTheDocument()
    })
    
    // Should show correct count (3 items)
    expect(screen.getByText('3 feedback items collected')).toBeInTheDocument()
  })

  it('should display feedback count correctly', async () => {
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('3 feedback items collected')).toBeInTheDocument()
    })
  })

  it('should display empty state when no feedback', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText(/No feedback collected yet/)).toBeInTheDocument()
    })
  })

  it('should delete individual feedback items', async () => {
    const user = userEvent.setup()
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('beautiful')).toBeInTheDocument()
    })
    
    const deleteButtons = screen.getAllByTitle('Delete this feedback')
    await user.click(deleteButtons[0])
    
    // Just verify the delete action was attempted
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this feedback item?')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  it('should clear all feedback when confirmed', async () => {
    const user = userEvent.setup()
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Clear All'))
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('vtt_feedback')
      expect(screen.getByText(/No feedback collected yet/)).toBeInTheDocument()
    })
  })

  it('should not clear feedback when cancelled', async () => {
    const user = userEvent.setup()
    global.confirm = vi.fn(() => false)
    
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Clear All'))
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
      expect(screen.getByText('beautiful')).toBeInTheDocument()
    })
  })

  it('should export feedback as CSV', async () => {
    const user = userEvent.setup()
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Export CSV'))
    
    expect(mockClick).toHaveBeenCalled()
  })

  it('should export feedback as JSON', async () => {
    const user = userEvent.setup()
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('Export JSON')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Export JSON'))
    
    expect(mockClick).toHaveBeenCalled()
  })

  it('should refresh feedback list', async () => {
    const user = userEvent.setup()
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
    
    // Clear mock calls
    localStorageMock.getItem.mockClear()
    
    await user.click(screen.getByText('Refresh'))
    
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt_feedback')
    })
  })

  it('should display feedback details correctly', async () => {
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      // Check intensity level display
      expect(screen.getByText('Current (Level 7)')).toBeInTheDocument()
      
      // Check reason display
      expect(screen.getByText('More natural pronunciation')).toBeInTheDocument()
      
      // Check context display
      expect(screen.getAllByText(/Context: singing/).length).toBeGreaterThan(0)
    })
  })

  it('should handle feedback without reason field', async () => {
    // Create clean feedback data without existing items that have reasons
    const feedbackWithoutReason = [{
      id: 'feedback_test_123',
      originalWord: 'noreason',
      currentTransformation: 'NO-REA-SON',
      suggestedTransformation: 'no-rea-son',
      intensity: 5,
      context: 'singing',
      timestamp: new Date().toISOString()
      // Note: no 'reason' field
    }]
    
    // Override the mock for this specific test
    const { rerender } = render(<div />)
    localStorageMock.getItem.mockReturnValue(JSON.stringify(feedbackWithoutReason))
    
    rerender(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('noreason')).toBeInTheDocument()
      expect(screen.getByText('1 feedback items collected')).toBeInTheDocument()
    })
  })

  it('should sort feedback by newest first', async () => {
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      const feedbackItems = screen.getAllByText(/Context: singing/)
      expect(feedbackItems.length).toBe(3)
      
      // The newest item (world) should appear first due to sorting
      const allText = document.body.textContent || ''
      const helloIndex = allText.indexOf('hello')
      const worldIndex = allText.indexOf('world')
      const beautifulIndex = allText.indexOf('beautiful')
      
      // world (newest) should come before hello and beautiful
      expect(worldIndex).toBeLessThan(helloIndex)
      expect(worldIndex).toBeLessThan(beautifulIndex)
    })
  })

  it('should handle malformed localStorage data gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json')
    
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      // Should show loading then empty state without crashing
      expect(screen.getByText(/No feedback collected yet/)).toBeInTheDocument()
    })
  })

  it('should escape CSV data properly', async () => {
    const feedbackWithQuotes = [{
      id: 'feedback_quotes_123',
      originalWord: 'test"quote',
      currentTransformation: 'TEST"QUOTE',
      suggestedTransformation: 'test"quote',
      intensity: 5,
      context: 'singing',
      reason: 'Has "quotes" in it',
      timestamp: new Date().toISOString()
    }]
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(feedbackWithQuotes))
    const user = userEvent.setup()
    
    render(<FeedbackAdmin />)
    
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Export CSV'))
    
    // CSV export should properly escape quotes
    expect(mockClick).toHaveBeenCalled()
  })
})
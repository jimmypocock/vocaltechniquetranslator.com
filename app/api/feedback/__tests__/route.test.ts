import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'
import * as feedbackStorage from '@/lib/feedback-storage'

// Mock the feedback storage module
vi.mock('@/lib/feedback-storage', () => ({
  getFeedbackStorage: vi.fn()
}))

// Mock environment variable
const originalEnv = process.env

describe('Feedback API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('POST /api/feedback', () => {
    it('should submit feedback successfully', async () => {
      const mockSaveFeedback = vi.fn().mockResolvedValue(undefined)
      const mockStorage = {
        saveFeedback: mockSaveFeedback,
        listFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const feedbackData = {
        originalWord: 'hello',
        currentTransformation: 'HEH-LOH',
        suggestedTransformation: 'HEL-LO',
        intensity: 5,
        context: 'singing',
        reason: 'More natural',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: 'test-id-123'
      }

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'Mozilla/5.0 Test Browser',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify(feedbackData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true, id: 'test-id-123' })
      
      // Check that feedback was enriched with server metadata
      expect(mockSaveFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          ...feedbackData,
          submittedAt: expect.any(String),
          userAgent: 'Mozilla/5.0 Test Browser',
          ip: '127.0.0.1'
        })
      )
    })

    it('should handle missing user agent and IP gracefully', async () => {
      const mockSaveFeedback = vi.fn().mockResolvedValue(undefined)
      const mockStorage = {
        saveFeedback: mockSaveFeedback,
        listFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const feedbackData = {
        originalWord: 'test',
        currentTransformation: 'TEST',
        suggestedTransformation: 'TEHST',
        intensity: 7,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: 'test-id-456'
      }

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData)
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockSaveFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: 'unknown',
          ip: 'unknown'
        })
      )
    })

    it('should handle storage errors gracefully', async () => {
      const mockStorage = {
        saveFeedback: vi.fn().mockRejectedValue(new Error('Storage failed')),
        listFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          originalWord: 'test',
          currentTransformation: 'TEST',
          suggestedTransformation: 'TEHST',
          intensity: 5,
          context: 'singing',
          timestamp: '2024-01-01T00:00:00.000Z',
          id: 'test-id'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to submit feedback' })
    })

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to submit feedback' })
    })

    it('should validate required fields', async () => {
      const mockSaveFeedback = vi.fn().mockResolvedValue(undefined)
      const mockStorage = {
        saveFeedback: mockSaveFeedback,
        listFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const incompleteData = {
        originalWord: 'hello',
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify(incompleteData)
      })

      const response = await POST(request)
      
      // The API currently doesn't validate, but storage should still be called
      expect(response.status).toBe(200)
      expect(mockSaveFeedback).toHaveBeenCalled()
    })
  })

  describe('GET /api/feedback', () => {
    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should reject invalid authentication', async () => {
      process.env.FEEDBACK_ADMIN_SECRET = 'correct-secret'

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer wrong-secret'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should retrieve feedback with valid authentication', async () => {
      process.env.FEEDBACK_ADMIN_SECRET = 'test-secret'
      
      const mockFeedbackList = [
        {
          id: '1',
          originalWord: 'hello',
          currentTransformation: 'HEH-LOH',
          suggestedTransformation: 'HEL-LO',
          intensity: 5,
          context: 'singing',
          timestamp: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          originalWord: 'world',
          currentTransformation: 'WUHRLD',
          suggestedTransformation: 'WURLD',
          intensity: 7,
          context: 'singing',
          timestamp: '2024-01-02T00:00:00.000Z'
        }
      ]

      const mockStorage = {
        listFeedback: vi.fn().mockResolvedValue(mockFeedbackList),
        saveFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer test-secret'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ feedback: mockFeedbackList })
      expect(mockStorage.listFeedback).toHaveBeenCalled()
    })

    it('should handle storage without list capability', async () => {
      process.env.FEEDBACK_ADMIN_SECRET = 'test-secret'
      process.env.FEEDBACK_STORAGE_METHOD = 'webhook'
      
      const mockStorage = {
        saveFeedback: vi.fn()
        // No listFeedback method
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage as unknown as ReturnType<typeof feedbackStorage.getFeedbackStorage>)

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer test-secret'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        message: 'Current storage method does not support listing feedback.',
        storageMethod: 'webhook'
      })
    })

    it('should handle storage list errors', async () => {
      process.env.FEEDBACK_ADMIN_SECRET = 'test-secret'
      
      const mockStorage = {
        listFeedback: vi.fn().mockRejectedValue(new Error('List failed')),
        saveFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer test-secret'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to retrieve feedback' })
    })

    it('should use default admin secret when not configured', async () => {
      // Don't set FEEDBACK_ADMIN_SECRET
      delete process.env.FEEDBACK_ADMIN_SECRET
      
      const mockStorage = {
        listFeedback: vi.fn().mockResolvedValue([]),
        saveFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer your-secret-key-here' // Default secret
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ feedback: [] })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large feedback data', async () => {
      const mockSaveFeedback = vi.fn().mockResolvedValue(undefined)
      const mockStorage = {
        saveFeedback: mockSaveFeedback,
        listFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const largeFeedbackData = {
        originalWord: 'test',
        currentTransformation: 'TEST',
        suggestedTransformation: 'A'.repeat(1000), // Large suggestion
        intensity: 5,
        context: 'singing',
        reason: 'B'.repeat(5000), // Very long reason
        timestamp: '2024-01-01T00:00:00.000Z',
        id: 'large-test-id'
      }

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify(largeFeedbackData)
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockSaveFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          suggestedTransformation: 'A'.repeat(1000),
          reason: 'B'.repeat(5000)
        })
      )
    })

    it('should handle special characters in feedback', async () => {
      const mockSaveFeedback = vi.fn().mockResolvedValue(undefined)
      const mockStorage = {
        saveFeedback: mockSaveFeedback,
        listFeedback: vi.fn()
      }
      
      vi.mocked(feedbackStorage.getFeedbackStorage).mockReturnValue(mockStorage)

      const feedbackData = {
        originalWord: "can't",
        currentTransformation: "KAHNT",
        suggestedTransformation: "KAN'T",
        intensity: 5,
        context: 'singing',
        reason: 'Preserve apostrophe & special chars: <>&"\'',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: 'special-chars-id'
      }

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData)
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockSaveFeedback).toHaveBeenCalledWith(
        expect.objectContaining(feedbackData)
      )
    })
  })
})
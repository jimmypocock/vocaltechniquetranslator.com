import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { submitFeedback, retrieveFeedback } from '../feedback-client'

// Mock global fetch
global.fetch = vi.fn()

// Store original env
const originalEnv = process.env

// Helper to create mock Response
const mockResponse = (data: unknown, init?: ResponseInit) => {
  return {
    ok: init?.status ? init.status >= 200 && init.status < 300 : true,
    status: init?.status || 200,
    statusText: init?.statusText || 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(init?.headers)
  } as Response
}

describe('Feedback Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('submitFeedback', () => {
    const mockFeedback = {
      id: 'test-123',
      originalWord: 'hello',
      currentTransformation: 'HEH-LOH',
      suggestedTransformation: 'HEL-LO',
      intensity: 5,
      context: 'singing',
      reason: 'More natural',
      timestamp: '2024-01-01T00:00:00.000Z'
    }

    it('should submit feedback to local API endpoint', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ success: true, id: 'test-123' }))

      await submitFeedback(mockFeedback)

      expect(global.fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockFeedback)
      })
    })

    it('should use production API endpoint when configured', async () => {
      process.env.NEXT_PUBLIC_FEEDBACK_API_ENDPOINT = 'https://api.example.com/feedback'
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ success: true }))

      await submitFeedback(mockFeedback)

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockFeedback)
      })
    })

    it('should handle HTTP error responses', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({}, { status: 500, statusText: 'Internal Server Error' }))

      await expect(submitFeedback(mockFeedback)).rejects.toThrow('HTTP error! status: 500')
    })

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network failure'))

      await expect(submitFeedback(mockFeedback)).rejects.toThrow('Network failure')
    })

    it('should log success on successful submission', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ success: true, id: 'test-123' }))

      await submitFeedback(mockFeedback)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Feedback submitted successfully:',
        { success: true, id: 'test-123' }
      )
      
      consoleSpy.mockRestore()
    })

    it('should handle rate limiting (429)', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({}, { status: 429, statusText: 'Too Many Requests' }))

      await expect(submitFeedback(mockFeedback)).rejects.toThrow('HTTP error! status: 429')
    })

    it('should handle validation errors (400)', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ error: 'Invalid feedback data' }, { status: 400, statusText: 'Bad Request' }))

      await expect(submitFeedback(mockFeedback)).rejects.toThrow('HTTP error! status: 400')
    })
  })

  describe('retrieveFeedback', () => {
    const adminSecret = 'test-admin-secret'

    it('should retrieve feedback with admin authentication', async () => {
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

      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ feedback: mockFeedbackList }))

      const result = await retrieveFeedback(adminSecret)

      expect(global.fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-admin-secret',
          'Content-Type': 'application/json'
        }
      })

      expect(result).toEqual(mockFeedbackList)
    })

    it('should use production API endpoint for retrieval', async () => {
      process.env.NEXT_PUBLIC_FEEDBACK_API_ENDPOINT = 'https://api.example.com/feedback'
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ feedback: [] }))

      await retrieveFeedback(adminSecret)

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/feedback', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-admin-secret',
          'Content-Type': 'application/json'
        }
      })
    })

    it('should handle unauthorized access', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({}, { status: 401, statusText: 'Unauthorized' }))

      await expect(retrieveFeedback('wrong-secret')).rejects.toThrow('Unauthorized: Invalid admin secret')
    })

    it('should handle server errors', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({}, { status: 500, statusText: 'Internal Server Error' }))

      await expect(retrieveFeedback(adminSecret)).rejects.toThrow('HTTP error! status: 500')
    })

    it('should handle empty feedback list', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ feedback: [] }))

      const result = await retrieveFeedback(adminSecret)

      expect(result).toEqual([])
    })

    it('should handle response without feedback array', async () => {
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ message: 'No feedback available' }))

      const result = await retrieveFeedback(adminSecret)

      expect(result).toEqual([])
    })

    it('should log errors on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

      await expect(retrieveFeedback(adminSecret)).rejects.toThrow('Network error')

      expect(consoleSpy).toHaveBeenCalledWith('Error retrieving feedback:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should handle malformed JSON response', async () => {
      const response = mockResponse({})
      response.json = async () => { throw new Error('Invalid JSON') }
      vi.mocked(global.fetch).mockResolvedValue(response)

      await expect(retrieveFeedback(adminSecret)).rejects.toThrow('Invalid JSON')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined environment variables', async () => {
      delete process.env.NEXT_PUBLIC_FEEDBACK_API_ENDPOINT
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ success: true }))

      const feedback = {
        id: 'test',
        originalWord: 'test',
        currentTransformation: 'TEST',
        suggestedTransformation: 'TEHST',
        intensity: 5,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      await submitFeedback(feedback)

      // Should use default local endpoint
      expect(global.fetch).toHaveBeenCalledWith('/api/feedback', expect.any(Object))
    })

    it('should handle very long admin secrets', async () => {
      const longSecret = 'a'.repeat(1000)
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ feedback: [] }))

      await retrieveFeedback(longSecret)

      expect(global.fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${longSecret}`,
          'Content-Type': 'application/json'
        }
      })
    })

    it('should handle special characters in feedback data', async () => {
      const feedbackWithSpecialChars = {
        id: 'test-special',
        originalWord: "can't",
        currentTransformation: "KAHNT",
        suggestedTransformation: "KAN'T",
        intensity: 5,
        context: 'singing & performing',
        reason: 'Preserve <special> & "quoted" text',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      vi.mocked(global.fetch).mockResolvedValue(mockResponse({ success: true }))

      await submitFeedback(feedbackWithSpecialChars)

      const callArgs = vi.mocked(global.fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      
      expect(body.originalWord).toBe("can't")
      expect(body.reason).toBe('Preserve <special> & "quoted" text')
    })
  })
})
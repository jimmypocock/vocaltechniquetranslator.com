import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { S3FeedbackStorage, WebhookFeedbackStorage, getFeedbackStorage } from '../feedback-storage'
import { S3Client } from '@aws-sdk/client-s3'

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn()
  })),
  PutObjectCommand: vi.fn().mockImplementation((params) => ({ params })),
  ListObjectsV2Command: vi.fn().mockImplementation((params) => ({ params })),
  GetObjectCommand: vi.fn().mockImplementation((params) => ({ params }))
}))

// Mock global fetch
global.fetch = vi.fn()

// Store original env
const originalEnv = process.env

describe('Feedback Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('S3FeedbackStorage', () => {
    let storage: S3FeedbackStorage
    let mockS3Client: { send: ReturnType<typeof vi.fn> }

    beforeEach(() => {
      process.env.FEEDBACK_BUCKET_NAME = 'test-bucket'
      process.env.AWS_REGION = 'us-west-2'
      
      storage = new S3FeedbackStorage()
      mockS3Client = (S3Client as unknown as { mock: { results: Array<{ value: { send: ReturnType<typeof vi.fn> } }> } }).mock.results[0].value
    })

    it('should save feedback to S3 with correct key structure', async () => {
      mockS3Client.send.mockResolvedValue({})

      const feedback = {
        id: 'test-123',
        originalWord: 'hello',
        currentTransformation: 'HEH-LOH',
        suggestedTransformation: 'HEL-LO',
        intensity: 5,
        context: 'singing',
        reason: 'More natural',
        timestamp: '2024-01-15T10:30:00.000Z',
        submittedAt: '2024-01-15T10:30:00.000Z'
      }

      await storage.saveFeedback(feedback)

      expect(mockS3Client.send).toHaveBeenCalledOnce()
      
      const command = mockS3Client.send.mock.calls[0][0]
      expect(command.params).toMatchObject({
        Bucket: 'test-bucket',
        Key: 'feedback/2024/01/15/test-123.json',
        ContentType: 'application/json',
        Metadata: {
          'original-word': 'hello',
          'intensity': '5',
          'context': 'singing'
        }
      })
    })

    it('should handle S3 save errors', async () => {
      mockS3Client.send.mockRejectedValue(new Error('S3 error'))

      const feedback = {
        id: 'test-456',
        originalWord: 'test',
        currentTransformation: 'TEST',
        suggestedTransformation: 'TEHST',
        intensity: 7,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      await expect(storage.saveFeedback(feedback)).rejects.toThrow('S3 error')
    })

    it('should list feedback from S3', async () => {
      // Mock list response
      mockS3Client.send.mockImplementation((command: { params: { Prefix?: string; Key?: string } }) => {
        if (command.params.Prefix === 'feedback/') {
          return Promise.resolve({
            Contents: [
              { Key: 'feedback/2024/01/15/feedback1.json' },
              { Key: 'feedback/2024/01/14/feedback2.json' },
              { Key: 'feedback/2024/01/15/not-json.txt' } // Should be ignored
            ]
          })
        }
        
        // Mock get object responses
        if (command.params.Key === 'feedback/2024/01/15/feedback1.json') {
          return Promise.resolve({
            Body: {
              transformToString: () => Promise.resolve(JSON.stringify({
                id: '1',
                originalWord: 'hello',
                submittedAt: '2024-01-15T10:00:00.000Z'
              }))
            }
          })
        }
        
        if (command.params.Key === 'feedback/2024/01/14/feedback2.json') {
          return Promise.resolve({
            Body: {
              transformToString: () => Promise.resolve(JSON.stringify({
                id: '2',
                originalWord: 'world',
                submittedAt: '2024-01-14T10:00:00.000Z'
              }))
            }
          })
        }
      })

      const feedbackList = await storage.listFeedback()

      expect(feedbackList).toHaveLength(2)
      expect(feedbackList[0].id).toBe('1') // Newer first
      expect(feedbackList[1].id).toBe('2')
    })

    it('should handle pagination when listing feedback', async () => {
      let listCallCount = 0
      mockS3Client.send.mockImplementation((command: { params: { Prefix?: string; Key?: string } }) => {
        if (command.params.Prefix === 'feedback/') {
          listCallCount++
          if (listCallCount === 1) {
            return Promise.resolve({
              Contents: [{ Key: 'feedback/2024/01/15/feedback1.json' }],
              NextContinuationToken: 'token123'
            })
          } else {
            return Promise.resolve({
              Contents: [{ Key: 'feedback/2024/01/15/feedback2.json' }]
            })
          }
        }
        
        // Mock get object responses
        return Promise.resolve({
          Body: {
            transformToString: () => Promise.resolve(JSON.stringify({
              id: `feedback${listCallCount}`,
              originalWord: 'test',
              submittedAt: '2024-01-15T10:00:00.000Z'
            }))
          }
        })
      })

      const feedbackList = await storage.listFeedback()

      expect(feedbackList).toHaveLength(2)
      expect(listCallCount).toBe(2)
    })

    it('should filter by date when listing feedback', async () => {
      mockS3Client.send.mockImplementation((command: { params: { Prefix?: string; Key?: string } }) => {
        if (command.params.Prefix === 'feedback/') {
          return Promise.resolve({
            Contents: [
              { Key: 'feedback/2024/01/15/feedback1.json' },
              { Key: 'feedback/2024/01/14/feedback2.json' },
              { Key: 'feedback/2024/01/13/feedback3.json' }
            ]
          })
        }
        
        // Mock get object responses with different dates
        const dates: Record<string, string> = {
          'feedback/2024/01/15/feedback1.json': '2024-01-15T10:00:00.000Z',
          'feedback/2024/01/14/feedback2.json': '2024-01-14T10:00:00.000Z',
          'feedback/2024/01/13/feedback3.json': '2024-01-13T10:00:00.000Z'
        }
        
        return Promise.resolve({
          Body: {
            transformToString: () => Promise.resolve(JSON.stringify({
              id: command.params.Key,
              originalWord: 'test',
              submittedAt: dates[command.params.Key || '']
            }))
          }
        })
      })

      const startDate = new Date('2024-01-14T00:00:00.000Z')
      const endDate = new Date('2024-01-14T23:59:59.999Z')
      
      const feedbackList = await storage.listFeedback(startDate, endDate)

      expect(feedbackList).toHaveLength(1)
      expect(feedbackList[0].submittedAt).toBe('2024-01-14T10:00:00.000Z')
    })

    it('should handle corrupted JSON gracefully', async () => {
      mockS3Client.send.mockImplementation((command: { params: { Prefix?: string; Key?: string } }) => {
        if (command.params.Prefix === 'feedback/') {
          return Promise.resolve({
            Contents: [
              { Key: 'feedback/2024/01/15/feedback1.json' },
              { Key: 'feedback/2024/01/15/corrupted.json' }
            ]
          })
        }
        
        if (command.params.Key === 'feedback/2024/01/15/feedback1.json') {
          return Promise.resolve({
            Body: {
              transformToString: () => Promise.resolve(JSON.stringify({
                id: '1',
                originalWord: 'hello',
                submittedAt: '2024-01-15T10:00:00.000Z'
              }))
            }
          })
        }
        
        if (command.params.Key === 'feedback/2024/01/15/corrupted.json') {
          return Promise.resolve({
            Body: {
              transformToString: () => Promise.resolve('invalid json')
            }
          })
        }
      })

      const feedbackList = await storage.listFeedback()

      // Should only return the valid feedback
      expect(feedbackList).toHaveLength(1)
      expect(feedbackList[0].id).toBe('1')
    })
  })

  describe('WebhookFeedbackStorage', () => {
    let storage: WebhookFeedbackStorage

    beforeEach(() => {
      process.env.FEEDBACK_WEBHOOK_URL = 'https://example.com/webhook'
      storage = new WebhookFeedbackStorage()
      vi.mocked(global.fetch).mockClear()
    })

    it('should send feedback to webhook', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200
      } as Response)

      const feedback = {
        id: 'test-123',
        originalWord: 'hello',
        currentTransformation: 'HEH-LOH',
        suggestedTransformation: 'HEL-LO',
        intensity: 5,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      await storage.saveFeedback(feedback)

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...feedback,
          source: 'vocal-technique-translator'
        })
      })
    })

    it('should handle webhook errors', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500
      } as Response)

      const feedback = {
        id: 'test-456',
        originalWord: 'test',
        currentTransformation: 'TEST',
        suggestedTransformation: 'TEHST',
        intensity: 7,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      await expect(storage.saveFeedback(feedback)).rejects.toThrow('Webhook returned 500')
    })

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

      const feedback = {
        id: 'test-789',
        originalWord: 'test',
        currentTransformation: 'TEST',
        suggestedTransformation: 'TEHST',
        intensity: 7,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      await expect(storage.saveFeedback(feedback)).rejects.toThrow('Network error')
    })

    it('should do nothing if webhook URL not configured', async () => {
      delete process.env.FEEDBACK_WEBHOOK_URL
      storage = new WebhookFeedbackStorage()

      const feedback = {
        id: 'test-no-webhook',
        originalWord: 'test',
        currentTransformation: 'TEST',
        suggestedTransformation: 'TEHST',
        intensity: 7,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      await storage.saveFeedback(feedback)

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('getFeedbackStorage Factory', () => {
    it('should return S3 storage when configured', () => {
      process.env.FEEDBACK_STORAGE_METHOD = 's3'
      
      const storage = getFeedbackStorage()
      
      expect(storage).toBeInstanceOf(S3FeedbackStorage)
    })

    it('should return webhook storage when configured', () => {
      process.env.FEEDBACK_STORAGE_METHOD = 'webhook'
      
      const storage = getFeedbackStorage()
      
      expect(storage).toBeInstanceOf(WebhookFeedbackStorage)
    })

    it('should return log storage by default', () => {
      delete process.env.FEEDBACK_STORAGE_METHOD
      
      const storage = getFeedbackStorage()
      
      expect(storage).toHaveProperty('saveFeedback')
      expect(storage).toHaveProperty('listFeedback')
      
      // Test that it logs to console
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      storage.saveFeedback({
        id: 'test',
        originalWord: 'hello',
        currentTransformation: 'HEH-LOH',
        suggestedTransformation: 'HEL-LO',
        intensity: 5,
        context: 'singing',
        timestamp: '2024-01-01T00:00:00.000Z'
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('[Feedback Log]:', expect.any(String))
      
      consoleSpy.mockRestore()
    })

    it('should return empty array for log storage list', async () => {
      process.env.FEEDBACK_STORAGE_METHOD = 'log'
      
      const storage = getFeedbackStorage()
      const list = await ((storage as { listFeedback?: () => Promise<unknown[]> }).listFeedback?.() || [])
      
      expect(list).toEqual([])
    })
  })
})
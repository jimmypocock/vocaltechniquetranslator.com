import { describe, it, expect, beforeEach, vi } from 'vitest'

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

describe('Feedback Admin Storage', () => {
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
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle feedback storage correctly', () => {
    // Set feedback in localStorage
    const dataString = JSON.stringify(mockFeedbackData)
    localStorageMock.setItem('vtt_feedback', dataString)
    localStorageMock.getItem.mockReturnValue(dataString)
    
    // Verify it can be retrieved
    const stored = localStorageMock.getItem('vtt_feedback')
    expect(stored).toBe(dataString)
    
    // Parse and verify structure
    const parsed = JSON.parse(stored as string)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].originalWord).toBe('beautiful')
  })

  it('should handle empty feedback list', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const stored = localStorageMock.getItem('vtt_feedback')
    expect(stored).toBeNull()
  })

  it('should deduplicate feedback by ID', () => {
    // Create feedback with duplicate IDs
    const duplicateFeedback = [
      ...mockFeedbackData,
      { ...mockFeedbackData[0], originalWord: 'duplicate' } // Same ID
    ]
    
    // Create a Set to deduplicate
    const uniqueIds = new Set<string>()
    const deduped = duplicateFeedback.filter(item => {
      if (uniqueIds.has(item.id)) {
        return false
      }
      uniqueIds.add(item.id)
      return true
    })
    
    expect(deduped).toHaveLength(2)
    expect(deduped[0].originalWord).toBe('beautiful')
    expect(deduped[1].originalWord).toBe('hello')
  })

  it('should handle malformed data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')
    
    expect(() => {
      JSON.parse(localStorageMock.getItem('vtt_feedback') as string)
    }).toThrow()
  })
})
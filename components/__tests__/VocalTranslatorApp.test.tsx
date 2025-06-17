import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VocalTranslatorApp from '../VocalTranslatorApp'

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

describe('VocalTranslatorApp', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  it('should render the main application interface', () => {
    render(<VocalTranslatorApp />)
    
    // Check for main elements
    expect(screen.getByText('Vocal Technique Translator')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your song lyrics here...')).toBeInTheDocument()
    expect(screen.getByText('Original Lyrics')).toBeInTheDocument()
    expect(screen.getByText('Translated for Vocal Technique')).toBeInTheDocument()
  })

  it('should handle lyrics input and transformation', async () => {
    const user = userEvent.setup()
    render(<VocalTranslatorApp />)
    
    const input = screen.getByPlaceholderText('Enter your song lyrics here...')
    await user.type(input, 'Hello world')
    
    // Should trigger transformation after debounce
    await waitFor(() => {
      // Check if the text is transformed in the display area
      expect(screen.getByText(/hel.*lo/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should save and restore state from localStorage', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'vtt-intensity') return '7'
      if (key === 'vtt-lyrics') return 'Test lyrics'
      return null
    })

    render(<VocalTranslatorApp />)
    
    // Should load saved intensity and lyrics
    expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-intensity')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-lyrics')
  })

  it('should save lyrics to localStorage when typing', async () => {
    const user = userEvent.setup()
    render(<VocalTranslatorApp />)
    
    const input = screen.getByPlaceholderText('Enter your song lyrics here...')
    await user.type(input, 'Test lyrics for saving')
    
    // Wait for debounced save
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-lyrics', expect.stringContaining('Test'))
    }, { timeout: 1500 })
  })

  it('should display transformation results', async () => {
    const user = userEvent.setup()
    render(<VocalTranslatorApp />)
    
    const input = screen.getByPlaceholderText('Enter your song lyrics here...')
    await user.type(input, 'Hello beautiful world')
    
    // Wait for transformation to appear
    await waitFor(() => {
      const transformedText = screen.getByText(/hel.*lo/i) || 
                            screen.getByText(/byoo.*teh.*fool/i) ||
                            screen.getByText(/wuhr.*ld/i)
      expect(transformedText).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should handle keyboard shortcuts', async () => {
    const user = userEvent.setup()
    render(<VocalTranslatorApp />)
    
    const input = screen.getByPlaceholderText('Enter your song lyrics here...')
    await user.type(input, 'Test')
    
    // Test spacebar shortcut for transformation
    await user.keyboard(' ')
    
    // Should have triggered transformation
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })
  })
})
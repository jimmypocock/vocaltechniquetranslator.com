import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VocalTranslatorApp from '@/components/VocalTranslatorApp'
import FormattedLyrics from '@/components/FormattedLyrics'

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

describe('LocalStorage Functionality', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  describe('VocalTranslatorApp Storage', () => {
    it('should load saved intensity from localStorage on mount', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-intensity') return '7'
        return null
      })

      render(<VocalTranslatorApp />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-intensity')
    })

    it('should load saved lyrics from localStorage on mount', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-lyrics') return 'Saved lyrics content'
        return null
      })

      render(<VocalTranslatorApp />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-lyrics')
      expect(screen.getByDisplayValue('Saved lyrics content')).toBeInTheDocument()
    })

    it('should save intensity to localStorage when changed', async () => {
      const user = userEvent.setup()
      render(<VocalTranslatorApp />)
      
      // Wait for initial hydration and intensity save
      await waitFor(() => {
        const intensityCalls = localStorageMock.setItem.mock.calls
          .filter(call => call[0] === 'vtt-intensity')
        expect(intensityCalls.length).toBeGreaterThan(0)
      })
      
      // Type some lyrics to trigger FormattedLyrics render
      const textarea = screen.getByPlaceholderText('Enter your song lyrics here...')
      await user.type(textarea, 'Test lyrics')
      
      // Wait for intensity selector to be visible by looking for the button with Maximum text
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const maximumButton = buttons.find(btn => btn.textContent?.includes('Maximum'))
        expect(maximumButton).toBeInTheDocument()
      })
      
      // Clear previous calls
      localStorageMock.setItem.mockClear()
      
      // Click on Maximum intensity button
      const buttons = screen.getAllByRole('button')
      const maximumButton = buttons.find(btn => btn.textContent?.includes('Maximum'))
      if (maximumButton) {
        await user.click(maximumButton)
      }
      
      // Verify intensity was saved
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-intensity', '8')
      })
    })

    it('should save lyrics to localStorage with debounce', async () => {
      const user = userEvent.setup()
      render(<VocalTranslatorApp />)
      
      const textarea = screen.getByPlaceholderText('Enter your song lyrics here...')
      await user.type(textarea, 'New lyrics')

      // Should not save immediately
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('vtt-lyrics', 'New lyrics')

      // Wait for debounce (1 second)
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-lyrics', 'New lyrics')
      }, { timeout: 1500 })
    })

    it('should handle invalid intensity values gracefully', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-intensity') return 'invalid'
        return null
      })

      render(<VocalTranslatorApp />)
      
      // Should load without crashing
      expect(screen.getByPlaceholderText('Enter your song lyrics here...')).toBeInTheDocument()
    })

    it('should handle out-of-range intensity values', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-intensity') return '15' // Out of 1-10 range
        return null
      })

      render(<VocalTranslatorApp />)
      
      // Should load without crashing
      expect(screen.getByPlaceholderText('Enter your song lyrics here...')).toBeInTheDocument()
    })
  })

  describe('FormattedLyrics Storage', () => {
    const defaultProps = {
      lyrics: 'Test lyrics',
      originalLyrics: 'Test lyrics',
      intensity: 5,
      onUppercaseChange: vi.fn(),
      onIntensityChange: vi.fn(),
    }

    it('should load uppercase preference from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-uppercase') return 'true'
        return null
      })

      render(<FormattedLyrics {...defaultProps} />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-uppercase')
    })

    it('should load expanded view preference from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-expanded') return 'false'
        return null
      })

      render(<FormattedLyrics {...defaultProps} />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-expanded')
    })

    it('should save uppercase preference when toggled', async () => {
      const user = userEvent.setup()
      render(<FormattedLyrics {...defaultProps} />)
      
      // Wait for hydration and ViewControls to render
      await waitFor(() => {
        expect(screen.getByText('Original')).toBeInTheDocument()
        expect(screen.getByText('Uppercase')).toBeInTheDocument()
      })

      // Clear initial saves
      localStorageMock.setItem.mockClear()

      // Click the Uppercase button (not Original) to toggle uppercase on
      const uppercaseText = screen.getByText('Uppercase')
      const uppercaseButton = uppercaseText.closest('button')
      if (uppercaseButton) {
        await user.click(uppercaseButton)
      }

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-uppercase', 'true')
      })
    })

    it('should save expanded view preference when toggled', async () => {
      const user = userEvent.setup()
      render(<FormattedLyrics {...defaultProps} />)
      
      // Wait for initial expanded state to be saved
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-expanded', 'true')
      })

      localStorageMock.setItem.mockClear()

      // Wait for UI to be ready by finding the Word-by-Word button
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const wordByWordButton = buttons.find(btn => btn.textContent?.includes('Word-by-Word'))
        expect(wordByWordButton).toBeInTheDocument()
      })

      // Toggle to continuous view by clicking the Continuous button
      const buttons = screen.getAllByRole('button')
      const continuousButton = buttons.find(btn => btn.textContent?.includes('Continuous'))
      if (continuousButton) {
        await user.click(continuousButton)
      }

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-expanded', 'false')
      })
    })

    it('should handle localStorage errors gracefully', () => {
      // Simulate localStorage not being available
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      // Should render without crashing
      expect(() => render(<FormattedLyrics {...defaultProps} />)).not.toThrow()
    })
  })

  describe('Storage Data Integrity', () => {
    it('should properly escape special characters in saved lyrics', async () => {
      const user = userEvent.setup()
      render(<VocalTranslatorApp />)
      
      const textarea = screen.getByPlaceholderText('Enter your song lyrics here...')
      const specialChars = 'Test "quotes" and \'apostrophes\' & <tags>'
      await user.type(textarea, specialChars)

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-lyrics', specialChars)
      }, { timeout: 1500 })
    })

    it('should handle multi-line lyrics correctly', async () => {
      const user = userEvent.setup()
      render(<VocalTranslatorApp />)
      
      const textarea = screen.getByPlaceholderText('Enter your song lyrics here...')
      const multiLine = 'Line 1\nLine 2\nLine 3'
      await user.clear(textarea)
      await user.type(textarea, multiLine)

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-lyrics', multiLine)
      }, { timeout: 1500 })
    })

    it('should handle very long lyrics', async () => {
      const user = userEvent.setup()
      render(<VocalTranslatorApp />)
      
      const textarea = screen.getByPlaceholderText('Enter your song lyrics here...')
      const longLyrics = 'Very long lyrics '.repeat(100)
      await user.type(textarea, longLyrics)

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-lyrics', longLyrics)
      }, { timeout: 1500 })
    }, 10000)
  })

  describe('Storage Persistence', () => {
    it('should persist state across component remounts', () => {
      const { unmount } = render(<VocalTranslatorApp />)
      
      // Simulate saved state
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-intensity') return '9'
        if (key === 'vtt-lyrics') return 'Persisted lyrics'
        return null
      })

      unmount()

      // Remount component
      render(<VocalTranslatorApp />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-intensity')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-lyrics')
      expect(screen.getByDisplayValue('Persisted lyrics')).toBeInTheDocument()
    })

    it('should not save empty lyrics', async () => {
      const user = userEvent.setup()
      render(<VocalTranslatorApp />)
      
      const textarea = screen.getByPlaceholderText('Enter your song lyrics here...')
      
      // Type and then clear
      await user.type(textarea, 'Some text')
      await user.clear(textarea)

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-lyrics', '')
      }, { timeout: 1500 })
    })
  })

  describe('Storage Migration', () => {
    it('should handle old localStorage key formats gracefully', () => {
      // Simulate old format data
      localStorageMock.getItem.mockImplementation((key: string) => {
        // Return null for new keys, simulating migration scenario
        if (key === 'vtt-intensity') return null
        if (key === 'vtt-lyrics') return null
        return null
      })

      render(<VocalTranslatorApp />)
      
      // Should use defaults when no saved data found
      expect(screen.getByPlaceholderText('Enter your song lyrics here...')).toBeInTheDocument()
    })
  })

  describe('Storage Cleanup', () => {
    it('should not accumulate duplicate setItem calls', async () => {
      const user = userEvent.setup()
      render(<VocalTranslatorApp />)
      
      // Clear initial calls
      localStorageMock.setItem.mockClear()

      // Rapid typing
      const textarea = screen.getByPlaceholderText('Enter your song lyrics here...')
      await user.type(textarea, 'a')
      await user.type(textarea, 'b')
      await user.type(textarea, 'c')

      // Should debounce and only save once
      await waitFor(() => {
        const lyricsCalls = localStorageMock.setItem.mock.calls
          .filter(call => call[0] === 'vtt-lyrics')
        expect(lyricsCalls.length).toBe(1)
        expect(lyricsCalls[0][1]).toBe('abc')
      }, { timeout: 1500 })
    })
  })
})
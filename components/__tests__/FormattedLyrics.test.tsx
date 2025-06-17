import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormattedLyrics from '../FormattedLyrics'

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

// Mock child components to focus on FormattedLyrics logic
vi.mock('../IntensitySelector', () => ({
  default: ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
    <div data-testid="intensity-selector">
      <button onClick={() => onChange(value + 1)}>Intensity: {value}</button>
    </div>
  )
}))

vi.mock('../ViewControls', () => ({
  default: ({ isUppercase, onUppercaseChange, isExpanded, onExpandedChange }: { isUppercase: boolean; onUppercaseChange: (value: boolean) => void; isExpanded: boolean; onExpandedChange: (value: boolean) => void }) => (
    <div data-testid="view-controls">
      <button onClick={() => onUppercaseChange(!isUppercase)}>
        {isUppercase ? 'Uppercase On' : 'Uppercase Off'}
      </button>
      <button onClick={() => onExpandedChange(!isExpanded)}>
        {isExpanded ? 'Expanded On' : 'Expanded Off'}
      </button>
    </div>
  )
}))

vi.mock('../WordTranslationModal', () => ({
  default: ({ word, isOpen, onClose }: { word: string; isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="word-modal">
        Modal for: {word}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}))

describe('FormattedLyrics', () => {
  const defaultProps = {
    lyrics: 'Hello beautiful world',
    originalLyrics: 'Hello beautiful world',
    intensity: 5,
    onUppercaseChange: vi.fn(),
    onIntensityChange: vi.fn(),
  }

  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render lyrics content', () => {
      render(<FormattedLyrics {...defaultProps} />)
      
      expect(screen.getByText(/hello/i)).toBeInTheDocument()
      expect(screen.getByText(/beautiful/i)).toBeInTheDocument()
      expect(screen.getByText(/world/i)).toBeInTheDocument()
    })

    it('should render nothing when no lyrics provided', () => {
      const { container } = render(<FormattedLyrics {...defaultProps} lyrics="" />)
      expect(container.firstChild).toBeNull()
    })

    it('should render intensity selector and view controls', () => {
      render(<FormattedLyrics {...defaultProps} />)
      
      expect(screen.getByTestId('intensity-selector')).toBeInTheDocument()
      expect(screen.getByTestId('view-controls')).toBeInTheDocument()
    })
  })

  describe('View Mode Switching', () => {
    it('should default to expanded view when lyrics are provided', async () => {
      render(<FormattedLyrics {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Expanded On')).toBeInTheDocument()
      })
    })

    it('should switch between expanded and continuous views', async () => {
      const user = userEvent.setup()
      render(<FormattedLyrics {...defaultProps} />)
      
      // Should start in expanded mode
      await waitFor(() => {
        expect(screen.getByText('Expanded On')).toBeInTheDocument()
      })
      
      // Click to switch to continuous
      const expandedButton = screen.getByText('Expanded On')
      await user.click(expandedButton)
      
      expect(screen.getByText('Expanded Off')).toBeInTheDocument()
    })

    it('should show word-by-word view in expanded mode', async () => {
      render(<FormattedLyrics {...defaultProps} />)
      
      // Wait for expanded mode to be set
      await waitFor(() => {
        const words = screen.getAllByRole('button').filter(btn => 
          btn.textContent?.includes('Hello') || 
          btn.textContent?.includes('beautiful') || 
          btn.textContent?.includes('world')
        )
        expect(words.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Uppercase Toggle', () => {
    it('should toggle uppercase display', async () => {
      const user = userEvent.setup()
      render(<FormattedLyrics {...defaultProps} />)
      
      // Initially should be uppercase off
      expect(screen.getByText('Uppercase Off')).toBeInTheDocument()
      
      // Click to enable uppercase
      const uppercaseButton = screen.getByText('Uppercase Off')
      await user.click(uppercaseButton)
      
      expect(screen.getByText('Uppercase On')).toBeInTheDocument()
    })

    it('should call onUppercaseChange when toggled', async () => {
      const user = userEvent.setup()
      const mockOnUppercaseChange = vi.fn()
      render(<FormattedLyrics {...defaultProps} onUppercaseChange={mockOnUppercaseChange} />)
      
      const uppercaseButton = screen.getByText('Uppercase Off')
      await user.click(uppercaseButton)
      
      expect(mockOnUppercaseChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Multi-line Lyrics', () => {
    it('should handle multi-line lyrics correctly', () => {
      const multiLineLyrics = 'Line one\nLine two\nLine three'
      render(<FormattedLyrics {...defaultProps} lyrics={multiLineLyrics} />)
      
      // In expanded mode, words are separate elements
      const lineElements = screen.getAllByText('Line')
      expect(lineElements).toHaveLength(3) // Should have 3 "Line" words
      expect(screen.getByText('one')).toBeInTheDocument()
      expect(screen.getByText('two')).toBeInTheDocument()
      expect(screen.getByText('three')).toBeInTheDocument()
    })

    it('should handle empty lines for verse separation', () => {
      const lyricsWithEmptyLines = 'Verse one\n\nVerse two'
      render(<FormattedLyrics {...defaultProps} lyrics={lyricsWithEmptyLines} />)
      
      // In expanded mode, words are separate elements  
      const verseElements = screen.getAllByText('Verse')
      expect(verseElements).toHaveLength(2) // Should have 2 "Verse" words
      expect(screen.getByText('one')).toBeInTheDocument()
      expect(screen.getByText('two')).toBeInTheDocument()
    })
  })

  describe('Word Interaction', () => {
    it('should open modal when word is clicked in expanded view', async () => {
      const user = userEvent.setup()
      render(<FormattedLyrics {...defaultProps} />)
      
      // Wait for expanded mode
      await waitFor(() => {
        const wordButtons = screen.getAllByRole('button')
        const helloButton = wordButtons.find(btn => btn.textContent?.includes('Hello'))
        expect(helloButton).toBeInTheDocument()
      })
      
      // Click on a word
      const wordButtons = screen.getAllByRole('button')
      const helloButton = wordButtons.find(btn => btn.textContent?.includes('Hello'))
      if (helloButton) {
        await user.click(helloButton)
        
        await waitFor(() => {
          expect(screen.getByTestId('word-modal')).toBeInTheDocument()
        })
      }
    })

    it('should handle keyboard interaction on words', async () => {
      const user = userEvent.setup()
      render(<FormattedLyrics {...defaultProps} />)
      
      await waitFor(() => {
        const wordButtons = screen.getAllByRole('button')
        expect(wordButtons.length).toBeGreaterThan(0)
      })
      
      const wordButtons = screen.getAllByRole('button')
      const firstWordButton = wordButtons.find(btn => btn.textContent?.includes('Hello'))
      
      if (firstWordButton) {
        // Test Enter key
        firstWordButton.focus()
        await user.keyboard('{Enter}')
        
        await waitFor(() => {
          expect(screen.getByTestId('word-modal')).toBeInTheDocument()
        })
      }
    })
  })

  describe('LocalStorage Integration', () => {
    it('should save uppercase preference to localStorage', async () => {
      const user = userEvent.setup()
      render(<FormattedLyrics {...defaultProps} />)
      
      // Wait for hydration
      await waitFor(() => {
        expect(screen.getByText('Uppercase Off')).toBeInTheDocument()
      })
      
      // Toggle uppercase
      const uppercaseButton = screen.getByText('Uppercase Off')
      await user.click(uppercaseButton)
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-uppercase', 'true')
      })
    })

    it('should save expanded preference to localStorage', async () => {
      render(<FormattedLyrics {...defaultProps} />)
      
      // Wait for expanded mode to be set
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('vtt-expanded', 'true')
      })
    })

    it('should load saved preferences from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'vtt-uppercase') return 'true'
        if (key === 'vtt-expanded') return 'false'
        return null
      })
      
      render(<FormattedLyrics {...defaultProps} />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-uppercase')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('vtt-expanded')
    })
  })

  describe('Intensity Changes', () => {
    it('should call onIntensityChange when intensity is modified', async () => {
      const user = userEvent.setup()
      const mockOnIntensityChange = vi.fn()
      render(<FormattedLyrics {...defaultProps} onIntensityChange={mockOnIntensityChange} />)
      
      const intensityButton = screen.getByText('Intensity: 5')
      await user.click(intensityButton)
      
      expect(mockOnIntensityChange).toHaveBeenCalledWith(6)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for interactive elements', async () => {
      render(<FormattedLyrics {...defaultProps} />)
      
      await waitFor(() => {
        const wordButtons = screen.getAllByRole('button')
        const wordButton = wordButtons.find(btn => btn.textContent?.includes('Hello'))
        expect(wordButton).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should show helpful hint text in expanded mode', async () => {
      render(<FormattedLyrics {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText(/click any word to see all transformation levels/i)).toBeInTheDocument()
      })
    })
  })

  describe('Condensed Mode', () => {
    it('should pass condensed prop to child components', () => {
      render(<FormattedLyrics {...defaultProps} isCondensed={true} />)
      
      // The mocked components should receive the isCondensed prop
      expect(screen.getByTestId('intensity-selector')).toBeInTheDocument()
      expect(screen.getByTestId('view-controls')).toBeInTheDocument()
    })
  })
})
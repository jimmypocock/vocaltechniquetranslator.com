import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IntensitySelector from '../IntensitySelector'

describe('IntensitySelector', () => {
  const defaultProps = {
    value: 4,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render all three intensity levels', () => {
      render(<IntensitySelector {...defaultProps} />)
      
      expect(screen.getByText('Minimal')).toBeInTheDocument()
      expect(screen.getByText('Moderate')).toBeInTheDocument()
      expect(screen.getByText('Maximum')).toBeInTheDocument()
    })

    it('should render intensity level label', () => {
      render(<IntensitySelector {...defaultProps} />)
      
      expect(screen.getByText('Intensity Level')).toBeInTheDocument()
    })

    it('should render keyboard shortcut hint', () => {
      render(<IntensitySelector {...defaultProps} />)
      
      expect(screen.getByText('Press 1, 2, or 3')).toBeInTheDocument()
    })

    it('should render level descriptions in normal mode', () => {
      render(<IntensitySelector {...defaultProps} />)
      
      expect(screen.getByText('Subtle adjustments')).toBeInTheDocument()
      expect(screen.getByText('Balanced technique')).toBeInTheDocument()
      expect(screen.getByText('Full transformation')).toBeInTheDocument()
    })

    it('should render level icons in normal mode', () => {
      render(<IntensitySelector {...defaultProps} />)
      
      expect(screen.getByText('🌱')).toBeInTheDocument()
      expect(screen.getByText('🌿')).toBeInTheDocument()
      expect(screen.getByText('🌳')).toBeInTheDocument()
    })
  })

  describe('Active Level Detection', () => {
    it('should highlight Minimal for values 1-3', () => {
      const { rerender } = render(<IntensitySelector {...defaultProps} value={1} />)
      expect(screen.getByText('Minimal')).toHaveClass('text-purple-700')
      
      rerender(<IntensitySelector {...defaultProps} value={2} />)
      expect(screen.getByText('Minimal')).toHaveClass('text-purple-700')
      
      rerender(<IntensitySelector {...defaultProps} value={3} />)
      expect(screen.getByText('Minimal')).toHaveClass('text-purple-700')
    })

    it('should highlight Moderate for values 4-7', () => {
      const { rerender } = render(<IntensitySelector {...defaultProps} value={4} />)
      expect(screen.getByText('Moderate')).toHaveClass('text-purple-700')
      
      rerender(<IntensitySelector {...defaultProps} value={5} />)
      expect(screen.getByText('Moderate')).toHaveClass('text-purple-700')
      
      rerender(<IntensitySelector {...defaultProps} value={7} />)
      expect(screen.getByText('Moderate')).toHaveClass('text-purple-700')
    })

    it('should highlight Maximum for values 8-10', () => {
      const { rerender } = render(<IntensitySelector {...defaultProps} value={8} />)
      expect(screen.getByText('Maximum')).toHaveClass('text-purple-700')
      
      rerender(<IntensitySelector {...defaultProps} value={9} />)
      expect(screen.getByText('Maximum')).toHaveClass('text-purple-700')
      
      rerender(<IntensitySelector {...defaultProps} value={10} />)
      expect(screen.getByText('Maximum')).toHaveClass('text-purple-700')
    })

    it('should show active indicator on selected level', () => {
      render(<IntensitySelector {...defaultProps} value={4} />)
      
      const moderateButton = screen.getByText('Moderate').closest('button')
      expect(moderateButton).toHaveClass('border-purple-500', 'bg-purple-50')
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when Minimal is clicked', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()
      render(<IntensitySelector {...defaultProps} onChange={mockOnChange} />)
      
      const minimalButton = screen.getByText('Minimal')
      await user.click(minimalButton)
      
      expect(mockOnChange).toHaveBeenCalledWith(1)
    })

    it('should call onChange when Moderate is clicked', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()
      render(<IntensitySelector {...defaultProps} onChange={mockOnChange} />)
      
      const moderateButton = screen.getByText('Moderate')
      await user.click(moderateButton)
      
      expect(mockOnChange).toHaveBeenCalledWith(4)
    })

    it('should call onChange when Maximum is clicked', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()
      render(<IntensitySelector {...defaultProps} onChange={mockOnChange} />)
      
      const maximumButton = screen.getByText('Maximum')
      await user.click(maximumButton)
      
      expect(mockOnChange).toHaveBeenCalledWith(8)
    })

    it('should be focusable via keyboard', async () => {
      const user = userEvent.setup()
      render(<IntensitySelector {...defaultProps} />)
      
      const minimalButton = screen.getByText('Minimal').closest('button')
      await user.click(minimalButton!)
      
      expect(minimalButton).toHaveFocus()
    })

    it('should support native button keyboard behavior', () => {
      const mockOnChange = vi.fn()
      render(<IntensitySelector {...defaultProps} onChange={mockOnChange} />)
      
      const maximumButton = screen.getByText('Maximum').closest('button')
      
      // Test that buttons are properly structured for keyboard navigation
      expect(maximumButton!.tagName).toBe('BUTTON')
      expect(maximumButton).not.toHaveAttribute('disabled')
    })
  })

  describe('Condensed Mode', () => {
    it('should use short labels in condensed mode', () => {
      render(<IntensitySelector {...defaultProps} isCondensed={true} />)
      
      expect(screen.getByText('Minimum')).toBeInTheDocument()
      expect(screen.getByText('Moderate')).toBeInTheDocument()
      expect(screen.getByText('Maximum')).toBeInTheDocument()
    })

    it('should hide icons in condensed mode', () => {
      render(<IntensitySelector {...defaultProps} isCondensed={true} />)
      
      expect(screen.queryByText('🌱')).not.toBeInTheDocument()
      expect(screen.queryByText('🌿')).not.toBeInTheDocument()
      expect(screen.queryByText('🌳')).not.toBeInTheDocument()
    })

    it('should hide descriptions in condensed mode', () => {
      render(<IntensitySelector {...defaultProps} isCondensed={true} />)
      
      expect(screen.queryByText('Subtle adjustments')).not.toBeInTheDocument()
      expect(screen.queryByText('Balanced technique')).not.toBeInTheDocument()
      expect(screen.queryByText('Full transformation')).not.toBeInTheDocument()
    })

    it('should hide label and keyboard hint in condensed mode', () => {
      render(<IntensitySelector {...defaultProps} isCondensed={true} />)
      
      expect(screen.queryByText('Intensity Level')).not.toBeInTheDocument()
      expect(screen.queryByText('Press 1, 2, or 3')).not.toBeInTheDocument()
    })

    it('should apply condensed styling classes', () => {
      render(<IntensitySelector {...defaultProps} isCondensed={true} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('p-2')
      })
    })
  })

  describe('Visual States', () => {
    it('should show pulse indicator on active level', () => {
      render(<IntensitySelector {...defaultProps} value={4} />)
      
      const moderateButton = screen.getByText('Moderate').closest('button')
      const pulseIndicator = moderateButton?.querySelector('.animate-pulse')
      expect(pulseIndicator).toBeInTheDocument()
      expect(pulseIndicator).toHaveClass('bg-purple-500', 'rounded-full')
    })

    it('should apply hover styles to inactive buttons', () => {
      render(<IntensitySelector {...defaultProps} value={4} />)
      
      const minimalButton = screen.getByText('Minimal').closest('button')
      expect(minimalButton).toHaveClass('hover:border-purple-300')
    })

    it('should apply different styles for active vs inactive buttons', () => {
      render(<IntensitySelector {...defaultProps} value={4} />)
      
      const activeButton = screen.getByText('Moderate').closest('button')
      const inactiveButton = screen.getByText('Minimal').closest('button')
      
      expect(activeButton).toHaveClass('border-purple-500', 'bg-purple-50')
      expect(inactiveButton).toHaveClass('border-gray-200', 'bg-white')
    })
  })

  describe('Accessibility', () => {
    it('should render buttons with proper button role', () => {
      render(<IntensitySelector {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<IntensitySelector {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      
      // Tab through buttons
      await user.tab()
      expect(buttons[0]).toHaveFocus()
      
      await user.tab()
      expect(buttons[1]).toHaveFocus()
      
      await user.tab()
      expect(buttons[2]).toHaveFocus()
    })

    it('should provide clear visual feedback for focused elements', async () => {
      const user = userEvent.setup()
      render(<IntensitySelector {...defaultProps} />)
      
      const firstButton = screen.getAllByRole('button')[0]
      await user.click(firstButton)
      
      expect(firstButton).toHaveFocus()
    })
  })

  describe('Props Handling', () => {
    it('should handle undefined isCondensed prop correctly', () => {
      const { value, onChange } = defaultProps
      render(<IntensitySelector value={value} onChange={onChange} />)
      
      // Should render in normal mode (not condensed)
      expect(screen.getByText('Intensity Level')).toBeInTheDocument()
      expect(screen.getByText('🌱')).toBeInTheDocument()
    })

    it('should handle value prop changes correctly', () => {
      const { rerender } = render(<IntensitySelector {...defaultProps} value={1} />)
      expect(screen.getByText('Minimal')).toHaveClass('text-purple-700')
      
      rerender(<IntensitySelector {...defaultProps} value={8} />)
      expect(screen.getByText('Maximum')).toHaveClass('text-purple-700')
      expect(screen.getByText('Minimal')).not.toHaveClass('text-purple-700')
    })
  })
})
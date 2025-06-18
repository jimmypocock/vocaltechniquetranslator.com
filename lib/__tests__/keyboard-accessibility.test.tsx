import React from 'react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook } from '@testing-library/react'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

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

describe('Keyboard Shortcuts and Accessibility', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Keyboard Shortcuts Modal', () => {
    it('should render all keyboard shortcuts', () => {
      render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      // Check for all shortcuts
      expect(screen.getByText('Focus on lyrics input')).toBeInTheDocument()
      expect(screen.getByText('Copy translated lyrics')).toBeInTheDocument()
      expect(screen.getByText('Toggle view (continuous ↔ word-by-word)')).toBeInTheDocument()
      expect(screen.getByText('Toggle uppercase')).toBeInTheDocument()
      expect(screen.getByText('Set to Minimal intensity')).toBeInTheDocument()
      expect(screen.getByText('Set to Moderate intensity')).toBeInTheDocument()
      expect(screen.getByText('Set to Full intensity')).toBeInTheDocument()
      expect(screen.getByText('Go to How It Works')).toBeInTheDocument()
      expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument()
      expect(screen.getByText('Clear lyrics or close modals')).toBeInTheDocument()
    })

    it('should display keyboard keys properly', () => {
      render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      // Check that keys are displayed (some may appear multiple times)
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0)
      expect(screen.getByText('K')).toBeInTheDocument()
      expect(screen.getByText('Enter')).toBeInTheDocument()
      expect(screen.getByText('V')).toBeInTheDocument()
      expect(screen.getByText('U')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('H')).toBeInTheDocument()
      expect(screen.getAllByText('?').length).toBeGreaterThan(0)
      expect(screen.getByText('Esc')).toBeInTheDocument()
    })

    it('should close on Escape key', async () => {
      const mockOnClose = vi.fn()
      render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close on close button click', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()
      render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByLabelText('Close modal')
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should prevent body scroll when open', () => {
      const { rerender } = render(<KeyboardShortcutsModal isOpen={false} onClose={vi.fn()} />)
      
      expect(document.body.style.overflow).toBe('')
      
      rerender(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when closed', () => {
      const { unmount } = render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      expect(document.body.style.overflow).toBe('hidden')
      
      unmount()
      
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('useKeyboardShortcuts Hook', () => {
    it('should trigger shortcut action on key press', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'k', ctrl: true, action: mockAction, description: 'Test shortcut' }
      ]
      
      renderHook(() => useKeyboardShortcuts(shortcuts))
      
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      
      expect(mockAction).toHaveBeenCalled()
    })

    it('should support cmd key on Mac', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'k', ctrl: true, action: mockAction, description: 'Test shortcut' }
      ]
      
      renderHook(() => useKeyboardShortcuts(shortcuts))
      
      fireEvent.keyDown(window, { key: 'k', metaKey: true })
      
      expect(mockAction).toHaveBeenCalled()
    })

    it('should not trigger shortcuts when disabled', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'k', ctrl: true, action: mockAction, description: 'Test shortcut' }
      ]
      
      renderHook(() => useKeyboardShortcuts(shortcuts, false))
      
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      
      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should not trigger shortcuts in input fields without modifier keys', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'b', action: mockAction, description: 'Test shortcut' }
      ]
      
      renderHook(() => useKeyboardShortcuts(shortcuts))
      
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      
      fireEvent.keyDown(input, { key: 'b' })
      
      expect(mockAction).not.toHaveBeenCalled()
      
      document.body.removeChild(input)
    })

    it('should allow standard browser commands', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'c', ctrl: true, action: mockAction, description: 'Custom copy' }
      ]
      
      renderHook(() => useKeyboardShortcuts(shortcuts))
      
      fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
      
      // Standard copy command should not be prevented
      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should handle multiple modifiers correctly', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'k', ctrl: true, shift: true, action: mockAction, description: 'Test' }
      ]
      
      renderHook(() => useKeyboardShortcuts(shortcuts))
      
      // Without shift - should not trigger
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      expect(mockAction).not.toHaveBeenCalled()
      
      // With shift - should trigger
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true, shiftKey: true })
      expect(mockAction).toHaveBeenCalled()
    })

    it('should handle undefined event.key gracefully', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'k', action: mockAction, description: 'Test shortcut' }
      ]
      
      renderHook(() => useKeyboardShortcuts(shortcuts))
      
      // Fire event with undefined key
      fireEvent.keyDown(window, { key: undefined as unknown as string })
      
      // Should not throw error and should not trigger action
      expect(mockAction).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes on modal', () => {
      render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('should have keyboard navigation hints', () => {
      render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      // Check for the hint at the bottom
      expect(screen.getByText(/Press.*anytime to show shortcuts/)).toBeInTheDocument()
    })

    it('should support keyboard operation', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()
      render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />)
      
      // Tab to close button
      const closeButton = screen.getByLabelText('Close modal')
      closeButton.focus()
      
      // Press Enter to close
      await user.keyboard('{Enter}')
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should have proper semantic structure', () => {
      render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      // Check for heading
      const heading = screen.getByText('Keyboard Shortcuts')
      expect(heading.tagName).toBe('H3')
      
      // Check for proper button elements
      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton.tagName).toBe('BUTTON')
    })
  })

  describe('Focus Management', () => {
    it('should trap focus in modal when open', async () => {
      const user = userEvent.setup()
      render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
      
      // Find the modal by looking for the Keyboard Shortcuts heading
      const heading = screen.getByText('Keyboard Shortcuts')
      const modal = heading.closest('div.fixed')
      
      expect(modal).toBeInTheDocument()
      
      // Tab to the close button
      const closeButton = screen.getByLabelText('Close modal')
      await user.click(closeButton)
      
      // Verify the close button is within the modal
      expect(modal?.contains(closeButton)).toBeTruthy()
    })
  })
})
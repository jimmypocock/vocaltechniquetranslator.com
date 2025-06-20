'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
  category: 'Input' | 'Intensity' | 'Display' | 'Actions' | 'Help'
}

const shortcuts: Shortcut[] = [
  // Text Input
  { keys: ['Ctrl/Cmd', 'L'], description: 'Focus on lyrics input', category: 'Input' },
  { keys: ['Esc'], description: 'Clear lyrics or close modals', category: 'Input' },
  
  // Intensity Control
  { keys: ['1'], description: 'Set to Minimal intensity', category: 'Intensity' },
  { keys: ['2'], description: 'Set to Moderate intensity', category: 'Intensity' },
  { keys: ['3'], description: 'Set to Maximum intensity', category: 'Intensity' },
  { keys: ['←', '→'], description: 'Decrease/Increase intensity', category: 'Intensity' },
  
  // View Toggles (available after translation)
  { keys: ['4'], description: 'Toggle uppercase/regular case*', category: 'Display' },
  { keys: ['5'], description: 'Toggle continuous/word-by-word view*', category: 'Display' },
  { keys: ['6'], description: 'Toggle expanded/condensed view', category: 'Display' },
  
  // Actions
  { keys: ['Ctrl/Cmd', 'Enter'], description: 'Copy translated lyrics', category: 'Actions' },
  { keys: ['Ctrl/Cmd', 'S'], description: 'Save to favorites', category: 'Actions' },
  
  // Help
  { keys: ['Shift', '?'], description: 'Show keyboard shortcuts', category: 'Help' },
]

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.15s ease-out forwards' }}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal */}
        <div 
          className="relative z-[10000] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full"
          style={{ animation: 'fadeIn 0.15s ease-out forwards' }}
        >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Keyboard Shortcuts
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Group shortcuts by category */}
          {['Input', 'Intensity', 'Display', 'Actions', 'Help'].map(category => {
            const categoryShortcuts = shortcuts.filter(s => s.category === category)
            if (categoryShortcuts.length === 0) return null
            
            return (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{category}</h4>
                <div className="space-y-1">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-gray-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">?</kbd> anytime to show shortcuts
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            * Available after translating lyrics
          </p>
        </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
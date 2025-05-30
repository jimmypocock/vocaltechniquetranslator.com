'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { VocalTranslator } from '@/lib/vocal-translator'

interface WordTranslationModalProps {
  word: string
  isOpen: boolean
  onClose: () => void
}

export default function WordTranslationModal({ word, isOpen, onClose }: WordTranslationModalProps) {
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && word) {
      const translator = new VocalTranslator()
      // Generate translations at different intensity levels
      const levels = {
        'Original': word,
        '🌱 Minimal': translator.translateWord(word, 1),
        '🌿 Moderate': translator.translateWord(word, 5),
        '🌳 Full': translator.translateWord(word, 9)
      }
      setTranslations(levels)
    }
  }, [word, isOpen])

  // Prevent body scroll when modal is open
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const modalContent = (
    <>
      {/* Full viewport backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.15s ease-out forwards' }}
      />
      
      {/* Modal card */}
      <div 
        className="fixed z-[10000] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 min-w-[320px] max-w-md left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ animation: 'fadeIn 0.15s ease-out forwards' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Translation Variations
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

        <div className="space-y-3">
          {Object.entries(translations).map(([level, translation]) => (
            <div key={level} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {level}:
              </span>
              <span className={`text-base font-mono ${
                level === 'Original' 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-purple-600 dark:text-purple-400 font-semibold'
              }`}>
                {translation}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click anywhere outside to close
          </p>
        </div>
      </div>
    </>
  )

  // Use React Portal to render modal at document body level
  return createPortal(modalContent, document.body)
}
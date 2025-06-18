import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'

// Custom render function that includes common providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add any global providers here (theme, context, etc.)
  return render(ui, { ...options })
}

// Export everything from testing library for convenience
export * from '@testing-library/react'

// Export userEvent with proper setup
export const user = userEvent.setup()

// Common test data
export const TEST_LYRICS = {
  simple: 'Hello world',
  withPunctuation: 'Hello, world!',
  multiLine: 'Line one\nLine two',
  withAbbreviation: 'L.A. lady',
  withContraction: "Don't stop",
  complex: 'Blue jean baby, L.A. lady, seamstress for the band',
  empty: '',
  whitespace: '   ',
  unicode: 'Café naïve résumé',
  numbers: 'Testing 123 with numbers',
  specialChars: 'Hello! How are you? (Very well)',
}

// Expected transformations for testing
export const EXPECTED_TRANSFORMATIONS = {
  intensity1: {
    simple: 'Hel-lo world',
    withContraction: "Don't stop",
  },
  intensity5: {
    simple: 'Heh-loh wuhrld',
    withContraction: 'Dohnt stahp',
  },
  intensity10: {
    simple: 'HEH-LOH WUHRLD',
    withContraction: 'DOHNT STAHP',
  },
}

// Performance testing utilities
export async function measurePerformance<T>(
  fn: () => T | Promise<T>,
  iterations: number = 100
): Promise<{ average: number; min: number; max: number; results: T }> {
  const times: number[] = []
  let result: T

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    result = await fn()
    const end = performance.now()
    times.push(end - start)
  }

  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    results: result!,
  }
}

// Mock data generators
export function generateLongText(words: number = 100): string {
  const sampleWords = [
    'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
    'and', 'runs', 'through', 'forest', 'meadow', 'mountain', 'valley',
  ]
  return Array.from({ length: words }, () => 
    sampleWords[Math.floor(Math.random() * sampleWords.length)]
  ).join(' ')
}

// Test helpers for async operations
export async function waitForLoadingToFinish() {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    expect(document.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })
}
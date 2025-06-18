import { describe, it, expect, beforeEach } from 'vitest'
import { VocalTranslator } from '../vocal-translator'
import { TEST_LYRICS, measurePerformance } from '../../test/utils'

describe('VocalTranslator', () => {
  let translator: VocalTranslator

  beforeEach(() => {
    translator = new VocalTranslator()
  })

  describe('Initialization', () => {
    it('should create an instance with default configuration', () => {
      expect(translator).toBeDefined()
      expect(translator).toBeInstanceOf(VocalTranslator)
    })
  })

  describe('Core Transformation Methods', () => {
    describe('translateLyrics', () => {
      it('should handle empty input', () => {
        expect(translator.translateLyrics('', 5)).toBe('')
        expect(translator.translateLyrics('   ', 5)).toBe('')
      })

      it('should preserve whitespace and line breaks', () => {
        const input = 'Hello\n\nWorld\n'
        const result = translator.translateLyrics(input, 1)
        expect(result).toContain('\n\n')
        expect(result).toMatch(/\n$/)
      })

      it('should handle special characters and punctuation', () => {
        const input = 'Hello! How are you? (Very well)'
        const result = translator.translateLyrics(input, 1)
        expect(result).toBeDefined()
        expect(result.length).toBeGreaterThan(0)
      })

      it('should handle unicode characters', () => {
        const result = translator.translateLyrics(TEST_LYRICS.unicode, 5)
        expect(result).toBeDefined()
        expect(result.length).toBeGreaterThan(0)
      })

      it('should handle numbers gracefully', () => {
        const result = translator.translateLyrics(TEST_LYRICS.numbers, 5)
        expect(result).toBeDefined()
        expect(result).toContain('123')
      })
    })

    describe('translateWord', () => {
      it('should handle single words', () => {
        const result = translator.translateWord('hello', 5)
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should preserve capitalization patterns', () => {
        // Test first letter capitalization
        const result1 = translator.translateWord('Hello', 5)
        expect(result1[0]).toBe(result1[0].toUpperCase())

        // Test all caps
        const result2 = translator.translateWord('HELLO', 5)
        expect(result2).toBe(result2.toUpperCase())
      })

      it('should handle contractions', () => {
        const contractions = ["don't", "won't", "you'll", "can't"]
        contractions.forEach(contraction => {
          const result = translator.translateWord(contraction, 5)
          expect(result).toBeDefined()
          expect(result.length).toBeGreaterThan(0)
        })
      })

      it('should handle words with punctuation', () => {
        const result = translator.translateWord('hello,', 5)
        expect(result).toBeDefined()
        // Should not include punctuation in vocal training output
        expect(result).not.toContain(',')
      })
    })
  })

  describe('Intensity Level Behavior', () => {
    const testWord = 'hello'

    it('should produce different outputs at different intensity levels', () => {
      const results = []
      for (let i = 1; i <= 10; i++) {
        results.push(translator.translateLyrics(testWord, i))
      }

      // Intensity 1-3 should be minimal transformation
      expect(results[0]).toBe(results[1])
      expect(results[1]).toBe(results[2])

      // At minimum, they should not all be identical
      const uniqueResults = new Set(results)
      expect(uniqueResults.size).toBeGreaterThan(1)
    })

    it('should maintain consistent output for same input and intensity', () => {
      const input = TEST_LYRICS.complex
      const result1 = translator.translateLyrics(input, 5)
      const result2 = translator.translateLyrics(input, 5)
      expect(result1).toBe(result2)
    })

    it('should handle all intensity levels (1-10)', () => {
      for (let intensity = 1; intensity <= 10; intensity++) {
        const result = translator.translateLyrics('hello world', intensity)
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Syllabification Integration', () => {
    it('should split words into syllables', () => {
      const syllables = translator.syllabify('hello')
      expect(syllables).toBeInstanceOf(Array)
      expect(syllables.length).toBeGreaterThan(0)
      expect(syllables.join('')).toBe('hello')
    })

    it('should handle single syllable words', () => {
      const syllables = translator.syllabify('cat')
      expect(syllables).toEqual(['cat'])
    })

    it('should handle multi-syllable words', () => {
      const syllables = translator.syllabify('computer')
      expect(syllables.length).toBeGreaterThan(1)
    })
  })

  describe('Exception Dictionary Integration', () => {
    it('should use exception dictionary for common words', () => {
      // Test some common words that should be in exception dictionary
      const commonWords = ['the', 'and', 'you', 'love', 'time']
      
      commonWords.forEach(word => {
        const result = translator.translateWord(word, 5)
        expect(result).toBeDefined()
        expect(result.length).toBeGreaterThan(0)
      })
    })

    it('should handle abbreviations properly', () => {
      const result = translator.translateLyrics('L.A. lady', 5)
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      // L.A. may be transformed for vocal training - this is expected behavior
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long strings', () => {
      const longText = 'word '.repeat(100)
      const result = translator.translateLyrics(longText, 5)
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle mixed case and special formatting', () => {
      const input = 'HeLLo WoRLd!!!'
      const result = translator.translateLyrics(input, 5)
      expect(result).toBeDefined()
      // Should preserve some capitalization pattern
      expect(/[A-Z]/.test(result)).toBe(true)
    })

    it('should handle null and undefined gracefully', () => {
      expect(() => translator.translateLyrics(null as unknown as string, 5)).not.toThrow()
      expect(() => translator.translateLyrics(undefined as unknown as string, 5)).not.toThrow()
    })

    it('should handle invalid intensity levels', () => {
      // Should not crash with out-of-range intensities
      expect(() => translator.translateLyrics('hello', 0)).not.toThrow()
      expect(() => translator.translateLyrics('hello', 15)).not.toThrow()
      expect(() => translator.translateLyrics('hello', -5)).not.toThrow()
    })
  })

  describe('Morphology Analysis', () => {
    it('should analyze word morphology', () => {
      const analysis = translator.analyzeMorphology('unhappy')
      expect(analysis).toHaveProperty('prefix')
      expect(analysis).toHaveProperty('root')
      expect(analysis).toHaveProperty('suffix')
      expect(analysis).toHaveProperty('compound')
    })

    it('should handle empty or invalid words', () => {
      const analysis = translator.analyzeMorphology('')
      expect(analysis.root).toBe('')
      expect(analysis.prefix).toBe('')
      expect(analysis.suffix).toBe('')
    })
  })

  describe('CVCe Pattern Recognition', () => {
    it('should recognize CVCe words', () => {
      // Test common CVCe patterns
      const cvceWords = ['make', 'time', 'hope', 'cute', 'love']
      
      cvceWords.forEach(word => {
        const result = translator.translateWord(word, 5)
        expect(result).toBeDefined()
        // CVCe words should be transformed differently than non-CVCe
        expect(result).not.toBe(word)
      })
    })
  })

  describe('Performance', () => {
    it('should transform single words quickly', async () => {
      const result = await measurePerformance(
        () => translator.translateWord('hello', 5),
        100
      )
      expect(result.average).toBeLessThan(5) // <5ms average
    })

    it('should transform paragraphs within performance target', async () => {
      const result = await measurePerformance(
        () => translator.translateLyrics(TEST_LYRICS.complex, 5),
        50
      )
      expect(result.average).toBeLessThan(20) // <20ms average
    })

    it('should handle full songs within performance target', async () => {
      const fullSong = TEST_LYRICS.complex + '\n' + TEST_LYRICS.complex + '\n' + TEST_LYRICS.complex
      const result = await measurePerformance(
        () => translator.translateLyrics(fullSong, 5),
        20
      )
      expect(result.average).toBeLessThan(50) // <50ms average
    })
  })

  describe('Integration with Real Examples', () => {
    it('should handle the signature test lyrics', () => {
      const lyrics = 'Blue jean baby, L.A. lady, seamstress for the band'
      const result = translator.translateLyrics(lyrics, 5)
      
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      // Should transform the lyrics for vocal training
      expect(result).toMatch(/bah-?bay/i) // Should contain transformed "baby"
    })

    it('should transform consistently across multiple runs', () => {
      const input = TEST_LYRICS.complex
      const results = Array.from({ length: 5 }, () => 
        translator.translateLyrics(input, 7)
      )
      
      // All results should be identical
      const firstResult = results[0]
      results.forEach(result => {
        expect(result).toBe(firstResult)
      })
    })
  })
})
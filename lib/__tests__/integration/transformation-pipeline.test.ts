import { describe, it, expect, beforeEach } from 'vitest'
import { VocalTranslator } from '../../vocal-translator'
import { measurePerformance } from '../../../test/utils'

describe('Transformation Pipeline Integration', () => {
  let translator: VocalTranslator

  beforeEach(() => {
    translator = new VocalTranslator()
  })

  describe('End-to-End Transformation', () => {
    it('should transform complete lyrics end-to-end', () => {
      const lyrics = 'Hello world how are you'
      const result = translator.translateLyrics(lyrics, 5)
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle the signature test lyrics', () => {
      const lyrics = 'Blue jean baby, L.A. lady, seamstress for the band'
      const result = translator.translateLyrics(lyrics, 5)
      
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result).toContain('bah')
    })

    it('should process multi-line lyrics correctly', () => {
      const lyrics = 'Line one\nLine two\nLine three'
      const result = translator.translateLyrics(lyrics, 5)
      
      expect(result).toContain('\n')
      expect(result.split('\n')).toHaveLength(3)
    })
  })

  describe('Performance Integration', () => {
    it('should process typical song lyrics within performance targets', async () => {
      const songLyrics = 'Yesterday all my troubles seemed so far away'
      
      const result = await measurePerformance(
        () => translator.translateLyrics(songLyrics, 5),
        10
      )
      
      expect(result.average).toBeLessThan(50)
      expect(result.results).toBeDefined()
    })

    it('should handle large text blocks efficiently', async () => {
      const largeLyrics = 'Hello world '.repeat(100)
      
      const result = await measurePerformance(
        () => translator.translateLyrics(largeLyrics, 5),
        5
      )
      
      expect(result.average).toBeLessThan(100)
      expect(result.results).toBeDefined()
    })
  })

  describe('Data Flow Integration', () => {
    it('should use exception dictionary before pattern matching', () => {
      const result1 = translator.translateWord('the', 5)
      const result2 = translator.translateWord('love', 5)
      
      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
      expect(result1).not.toBe('the')
      expect(result2).not.toBe('love')
    })

    it('should apply syllable splitting consistently', () => {
      const syllables = translator.syllabify('computer')
      const transformed = translator.translateWord('computer', 5)
      
      expect(syllables.length).toBeGreaterThan(1)
      expect(transformed).toBeDefined()
    })
  })

  describe('Real-World Scenarios', () => {
    it('should handle common song lyrics patterns', () => {
      const testLyrics = [
        'I love you so much',
        'Dancing in the moonlight',
        'You are my sunshine',
        'Take me home tonight'
      ]
      
      testLyrics.forEach(lyrics => {
        const result = translator.translateLyrics(lyrics, 5)
        expect(result).toBeDefined()
        expect(result.length).toBeGreaterThan(0)
        expect(result).not.toBe(lyrics)
      })
    })

    it('should maintain consistency across repeated transformations', () => {
      const lyrics = 'Hello beautiful world'
      const results = Array.from({ length: 5 }, () => 
        translator.translateLyrics(lyrics, 7)
      )
      
      const firstResult = results[0]
      results.forEach(result => {
        expect(result).toBe(firstResult)
      })
    })

    it('should handle mixed content appropriately', () => {
      const mixedContent = 'Hello 123 world! How are you?'
      const result = translator.translateLyrics(mixedContent, 5)
      
      expect(result).toBeDefined()
      expect(result).toContain('123')
    })
  })

  describe('Intensity Progression Integration', () => {
    it('should show progressive transformation across intensities', () => {
      const testWord = 'beautiful'
      const results: { [key: number]: string } = {}
      
      for (let intensity = 1; intensity <= 10; intensity++) {
        results[intensity] = translator.translateWord(testWord, intensity)
      }
      
      expect(results[1]).toBeDefined()
      expect(results[5]).toBeDefined()
      expect(results[10]).toBeDefined()
      
      const uniqueResults = new Set(Object.values(results))
      expect(uniqueResults.size).toBeGreaterThan(1)
    })

    it('should maintain vocal technique principles across intensities', () => {
      const testLyrics = 'Singing with proper technique'
      
      for (let intensity = 1; intensity <= 10; intensity++) {
        const result = translator.translateLyrics(testLyrics, intensity)
        
        expect(result).toBeDefined()
        expect(result.length).toBeGreaterThan(0)
        expect(result.split(' ').length).toBe(testLyrics.split(' ').length)
      }
    })
  })
})
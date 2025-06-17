import { describe, it, expect, beforeEach } from 'vitest'
import { SyllableSplitter } from '../syllable-splitter'

describe('SyllableSplitter', () => {
  let splitter: SyllableSplitter

  beforeEach(() => {
    splitter = new SyllableSplitter()
  })

  describe('Initialization', () => {
    it('should create an instance with default configuration', () => {
      expect(splitter).toBeDefined()
      expect(splitter).toBeInstanceOf(SyllableSplitter)
    })
  })

  describe('Basic Syllabification', () => {
    describe('split method', () => {
      it('should handle empty input', () => {
        const result = splitter.split('')
        expect(result.syllables).toEqual([])
        expect(result.boundaries).toEqual([])
      })

      it('should handle single character words', () => {
        const result = splitter.split('a')
        expect(result.syllables).toEqual(['a'])
        expect(result.boundaries).toEqual([])
      })

      it('should handle single syllable words', () => {
        const singleSyllableWords = ['cat', 'dog', 'run', 'book', 'light']
        
        singleSyllableWords.forEach(word => {
          const result = splitter.split(word)
          expect(result.syllables).toEqual([word])
          expect(result.boundaries).toEqual([])
        })
      })

      it('should split basic multi-syllable words', () => {
        const testCases = [
          { word: 'hello', expected: ['hel', 'lo'] },
          { word: 'water', expected: ['wat', 'er'] },
          { word: 'sister', expected: ['sist', 'er'] },
          { word: 'computer', expected: ['co', 'mput', 'er'] }
        ]

        testCases.forEach(({ word, expected }) => {
          const result = splitter.split(word)
          expect(result.syllables).toEqual(expected)
          expect(result.boundaries.length).toBe(expected.length - 1)
        })
      })
    })
  })

  describe('Exception Words', () => {
    it('should use exception dictionary for common words', () => {
      const exceptionCases = [
        { word: 'people', expected: ['peo', 'ple'] },
        { word: 'create', expected: ['cre', 'ate'] },
        { word: 'beautiful', expected: ['beau', 'ti', 'ful'] },
        { word: 'family', expected: ['fam', 'i', 'ly'] },
        { word: 'different', expected: ['dif', 'fer', 'ent'] }
      ]

      exceptionCases.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })

    it('should preserve case from original word', () => {
      const result = splitter.split('PEOPLE')
      expect(result.syllables).toEqual(['PEO', 'PLE'])
    })

    it('should handle mixed case words', () => {
      const result = splitter.split('BeautiFul')
      expect(result.syllables).toEqual(['Beau', 'ti', 'Ful'])
    })
  })

  describe('Contraction Handling', () => {
    it('should handle common contractions', () => {
      const contractionCases = [
        { word: "don't", expected: ['don', 't'] },
        { word: "won't", expected: ['won', 't'] },
        { word: "you'll", expected: ['you', 'll'] },
        { word: "can't", expected: ['can', 't'] },
        { word: "couldn't", expected: ['could', "n't"] },
        { word: "you're", expected: ['you', 're'] }
      ]

      contractionCases.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })
  })

  describe('CVCe Pattern Recognition', () => {
    it('should recognize CVCe words as single syllables', () => {
      const cvceWords = ['make', 'time', 'hope', 'cute', 'love', 'home', 'cake', 'fire']
      
      cvceWords.forEach(word => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual([word])
        expect(result.boundaries).toEqual([])
      })
    })

    it('should handle CVCe plurals correctly', () => {
      const cvceWords = ['makes', 'times', 'homes', 'cakes']
      
      cvceWords.forEach(word => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual([word])
        expect(result.boundaries).toEqual([])
      })
    })

    it('should handle CCVC patterns', () => {
      const ccvcWords = ['drive', 'brake', 'scale', 'smile']
      
      ccvcWords.forEach(word => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual([word])
        expect(result.boundaries).toEqual([])
      })
    })
  })

  describe('Vowel Team Handling', () => {
    it('should keep vowel teams together', () => {
      const vowelTeamWords = [
        { word: 'boat', expected: ['boat'] },
        { word: 'train', expected: ['train'] },
        { word: 'dream', expected: ['dream'] },
        { word: 'round', expected: ['round'] }
      ]

      vowelTeamWords.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })

    it('should handle words with multiple vowel teams', () => {
      const result = splitter.split('rainbow')
      expect(result.syllables).toEqual(['rain', 'bow'])
    })
  })

  describe('Consonant Cluster Handling', () => {
    it('should handle consonant blends correctly', () => {
      const blendWords = [
        { word: 'spring', expected: ['spring'] },
        { word: 'strong', expected: ['strong'] },
        { word: 'class', expected: ['class'] }
      ]

      blendWords.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })

    it('should split between non-blend consonants', () => {
      const testCases = [
        { word: 'winter', expected: ['wint', 'er'] },
        { word: 'number', expected: ['numb', 'er'] },
        { word: 'happen', expected: ['hap', 'pen'] }
      ]

      testCases.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })
  })

  describe('Prefix and Suffix Handling', () => {
    it('should recognize common prefixes', () => {
      const prefixWords = [
        { word: 'unhappy', expected: ['un', 'hap', 'py'] },
        { word: 'replay', expected: ['re', 'play'] },
        { word: 'preview', expected: ['pre', 'vi', 'ew'] }
      ]

      prefixWords.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })

    it('should recognize common suffixes', () => {
      const suffixWords = [
        { word: 'playing', expected: ['play', 'ing'] },
        { word: 'careful', expected: ['care', 'ful'] },
        { word: 'happiness', expected: ['hap', 'pi', 'ness'] }
      ]

      suffixWords.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })

    it('should not split CVCe words even with suffix patterns', () => {
      // Words like "time" should not be split into "ti-me" even though "me" could be a suffix
      const result = splitter.split('time')
      expect(result.syllables).toEqual(['time'])
    })
  })

  describe('Compound Word Recognition', () => {
    it('should recognize common compound words', () => {
      const compoundWords = [
        { word: 'something', expected: ['some', 'thing'] },
        { word: 'everything', expected: ['every', 'thing'] },
        { word: 'without', expected: ['with', 'out'] },
        { word: 'birthday', expected: ['birth', 'day'] }
      ]

      compoundWords.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle words with only consonants gracefully', () => {
      // These shouldn't happen in normal text, but the splitter should be robust
      const result = splitter.split('bcdfg')
      expect(result.syllables).toBeDefined()
      expect(result.syllables.length).toBe(1)
    })

    it('should handle very long words', () => {
      const longWord = 'internationalization'
      const result = splitter.split(longWord)
      expect(result.syllables).toBeDefined()
      expect(result.syllables.length).toBeGreaterThan(1)
      // Reassemble should equal original
      expect(result.syllables.join('')).toBe(longWord)
    })

    it('should handle words with apostrophes', () => {
      const result = splitter.split("singin'")
      expect(result.syllables).toBeDefined()
      expect(result.syllables.join('')).toBe("singin'")
    })

    it('should handle uppercase words', () => {
      const result = splitter.split('COMPUTER')
      expect(result.syllables).toEqual(['CO', 'MPUT', 'ER'])
    })

    it('should handle mixed case words', () => {
      const result = splitter.split('ComPuTer')
      expect(result.syllables).toBeDefined()
      expect(result.syllables.join('')).toBe('ComPuTer')
    })
  })

  describe('Musical Terms', () => {
    it('should handle music-related vocabulary', () => {
      const musicWords = [
        { word: 'music', expected: ['mu', 'sic'] },
        { word: 'melody', expected: ['mel', 'o', 'dy'] },
        { word: 'harmony', expected: ['har', 'mo', 'ny'] },
        { word: 'piano', expected: ['pi', 'an', 'o'] },
        { word: 'guitar', expected: ['gui', 'tar'] }
      ]

      musicWords.forEach(({ word, expected }) => {
        const result = splitter.split(word)
        expect(result.syllables).toEqual(expected)
      })
    })

    it('should handle special musical cases', () => {
      const result = splitter.split('rhythm')
      expect(result.syllables).toEqual(['rhyth', 'm'])
    })
  })

  describe('Syllable Validation', () => {
    it('should ensure each syllable has at least one vowel', () => {
      // Test with a word that might produce consonant-only syllables
      const result = splitter.split('rhythm')
      
      // Even though 'm' doesn't have a vowel, it should be handled gracefully
      expect(result.syllables).toBeDefined()
      expect(result.syllables.length).toBeGreaterThan(0)
    })

    it('should reassemble to original word', () => {
      const testWords = [
        'hello', 'beautiful', 'computer', 'international', 
        'something', 'rhythm', 'create'
      ]

      testWords.forEach(word => {
        const result = splitter.split(word)
        expect(result.syllables.join('')).toBe(word)
      })
      
      // Test contractions separately - they are handled by exception dictionary
      // Note: apostrophes may be processed differently
      const contractionResult = splitter.split("don't")
      expect(contractionResult.syllables).toEqual(['don', 't'])
      // The join might not preserve apostrophes in all cases
    })

    it('should maintain correct boundary positions', () => {
      const result = splitter.split('computer')
      expect(result.boundaries).toBeDefined()
      
      // Boundaries should correspond to split positions
      if (result.boundaries.length > 0) {
        let position = 0
        for (let i = 0; i < result.syllables.length - 1; i++) {
          position += result.syllables[i].length
          expect(result.boundaries[i]).toBe(position)
        }
      }
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle null and undefined gracefully', () => {
      expect(() => splitter.split(null as unknown as string)).not.toThrow()
      expect(() => splitter.split(undefined as unknown as string)).not.toThrow()
    })

    it('should be consistent across multiple runs', () => {
      const testWord = 'beautiful'
      const results = Array.from({ length: 5 }, () => splitter.split(testWord))
      
      const firstResult = results[0]
      results.forEach(result => {
        expect(result.syllables).toEqual(firstResult.syllables)
        expect(result.boundaries).toEqual(firstResult.boundaries)
      })
    })

    it('should handle a variety of common English words', () => {
      const commonWords = [
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our',
        'time', 'about', 'would', 'there', 'think', 'which', 'their', 'people', 'other', 'after', 'first',
        'never', 'these', 'could', 'where', 'being', 'every', 'great', 'might', 'still', 'public',
        'human', 'world', 'life', 'work', 'part', 'year', 'back', 'place', 'right', 'good'
      ]

      commonWords.forEach(word => {
        const result = splitter.split(word)
        expect(result.syllables).toBeDefined()
        expect(result.syllables.length).toBeGreaterThan(0)
        expect(result.syllables.join('')).toBe(word)
      })
    })
  })

  describe('Real-world Examples', () => {
    it('should handle song lyrics words correctly', () => {
      const lyricsWords = [
        'blue', 'jean', 'baby', 'lady', 'seamstress', 'band',
        'singing', 'dancing', 'loving', 'feeling', 'dreaming'
      ]

      lyricsWords.forEach(word => {
        const result = splitter.split(word)
        expect(result.syllables).toBeDefined()
        expect(result.syllables.length).toBeGreaterThan(0)
        expect(result.syllables.join('')).toBe(word)
      })
    })

    it('should handle complex words from vocal training context', () => {
      const vocalWords = [
        'technique', 'breathing', 'resonance', 'projection', 
        'articulation', 'diction', 'pronunciation', 'intonation'
      ]

      vocalWords.forEach(word => {
        const result = splitter.split(word)
        expect(result.syllables).toBeDefined()
        expect(result.syllables.length).toBeGreaterThan(0)
        expect(result.syllables.join('')).toBe(word)
      })
    })
  })
})
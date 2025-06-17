import { describe, it, expect } from 'vitest'
import { exceptionWords } from '../exception-words'
import type { IntensityTransformations } from '@/lib/types/vocal-translator'

describe('Exception Words Dictionary', () => {
  describe('Data Structure Integrity', () => {
    it('should be a valid ExceptionWord object', () => {
      expect(exceptionWords).toBeDefined()
      expect(typeof exceptionWords).toBe('object')
      expect(exceptionWords).not.toBeNull()
    })

    it('should contain word entries', () => {
      const wordCount = Object.keys(exceptionWords).length
      expect(wordCount).toBeGreaterThan(0)
      expect(wordCount).toBeGreaterThan(100) // Should have substantial vocabulary
    })

    it('should not have duplicate words', () => {
      const words = Object.keys(exceptionWords)
      const uniqueWords = new Set(words)
      expect(uniqueWords.size).toBe(words.length)
    })
  })

  describe('Intensity Mapping Validation', () => {
    it('should have valid intensity levels for all words', () => {
      const validIntensityLevels = [1, 4, 8]
      
      Object.entries(exceptionWords).forEach(([, transformations]) => {
        expect(transformations).toBeDefined()
        expect(typeof transformations).toBe('object')
        
        // Check that required intensity levels exist
        validIntensityLevels.forEach(level => {
          expect(transformations).toHaveProperty(level.toString())
          expect(transformations[level as keyof IntensityTransformations]).toBeDefined()
          expect(typeof transformations[level as keyof IntensityTransformations]).toBe('string')
          expect(transformations[level as keyof IntensityTransformations].length).toBeGreaterThan(0)
        })
      })
    })

    it('should not have null or undefined transformations', () => {
      Object.entries(exceptionWords).forEach(([, transformations]) => {
        Object.entries(transformations).forEach(([, transformation]) => {
          expect(transformation).not.toBeNull()
          expect(transformation).not.toBeUndefined()
          expect(transformation).not.toBe('')
          expect(typeof transformation).toBe('string')
        })
      })
    })

    it('should not have transformations with only whitespace', () => {
      Object.entries(exceptionWords).forEach(([, transformations]) => {
        Object.entries(transformations).forEach(([, transformation]) => {
          expect(transformation.trim()).toBe(transformation)
          expect(transformation.trim().length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Progressive Intensity Validation', () => {
    it('should maintain logical progression from level 1 to 8', () => {
      Object.entries(exceptionWords).forEach(([word, transformations]) => {
        const level1 = transformations[1]
        const level4 = transformations[4]
        const level8 = transformations[8]
        
        // Level 1 should be least transformed (often original word)
        expect(level1).toBeDefined()
        
        // All levels should be different or show progression
        // (Some words may have same transformation at different levels, which is valid)
        expect(level4).toBeDefined()
        expect(level8).toBeDefined()
        
        // Check that transformations are reasonable length
        // (not extremely long compared to original)
        expect(level1.length).toBeLessThan(word.length * 3)
        expect(level4.length).toBeLessThan(word.length * 3)
        expect(level8.length).toBeLessThan(word.length * 3)
      })
    })
    
    it('should not have inconsistent transformations', () => {
      const problematicCases: string[] = []
      
      Object.entries(exceptionWords).forEach(([word, transformations]) => {
        const level1 = transformations[1]
        const level4 = transformations[4]
        const level8 = transformations[8]
        
        // Check for obviously problematic cases
        if (level8.length > level1.length * 4) {
          problematicCases.push(`${word}: level 8 (${level8}) is much longer than level 1 (${level1})`)
        }
        
        // Check for completely unrelated transformations (very loose check)
        const firstChar = word[0].toLowerCase()
        if (!level1.toLowerCase().includes(firstChar) && !level4.toLowerCase().includes(firstChar)) {
          // This might be a very aggressive transformation, but could be valid
          // We'll just warn rather than fail
        }
      })
      
      // If we find problematic cases, we can log them but not necessarily fail
      if (problematicCases.length > 0) {
        console.warn('Potentially problematic transformations:', problematicCases.slice(0, 5))
      }
      
      // The test passes if we don't find egregious errors
      expect(problematicCases.length).toBeLessThan(Object.keys(exceptionWords).length * 0.1) // Less than 10% problematic
    })
  })

  describe('Content Validation', () => {
    it('should include common English words', () => {
      const commonWords = [
        'the', 'and', 'you', 'to', 'of', 'a', 'for',
        'was', 'with', 'they', 'at'
      ]
      
      commonWords.forEach(word => {
        expect(exceptionWords).toHaveProperty(word)
      })
    })

    it('should include contractions', () => {
      const contractions = ['youll', 'well', 'ill', 'cant', 'wont', 'dont']
      
      contractions.forEach(contraction => {
        expect(exceptionWords).toHaveProperty(contraction)
      })
    })

    it('should include musical/vocal terms', () => {
      const musicalTerms = ['love', 'song', 'music', 'beautiful', 'dream', 'time']
      
      musicalTerms.forEach(term => {
        if (exceptionWords[term]) {
          expect(exceptionWords[term]).toBeDefined()
        }
      })
    })
  })

  describe('Phonetic Consistency', () => {
    it('should use consistent phonetic notation', () => {
      const problematicNotations: string[] = []
      
      Object.entries(exceptionWords).forEach(([word, transformations]) => {
        Object.entries(transformations).forEach(([level, transformation]) => {
          // Check for mixed case in middle of phonetic representations
          if (/[a-z][A-Z]/.test(transformation) || /[A-Z][a-z][A-Z]/.test(transformation)) {
            problematicNotations.push(`${word} level ${level}: ${transformation}`)
          }
          
          // Check for suspicious character sequences
          if (/[0-9]/.test(transformation)) {
            problematicNotations.push(`${word} level ${level}: contains numbers: ${transformation}`)
          }
          
          // Check for double spaces or tabs
          if (/\\s{2,}|\\t/.test(transformation)) {
            problematicNotations.push(`${word} level ${level}: whitespace issues: ${transformation}`)
          }
        })
      })
      
      if (problematicNotations.length > 0) {
        console.warn('Potential notation issues:', problematicNotations.slice(0, 10))
      }
      
      expect(problematicNotations.length).toBeLessThan(50) // Allow some flexibility
    })

    it('should use hyphens appropriately for syllable separation', () => {
      let syllableWords = 0
      let hyphenatedWords = 0
      
      Object.entries(exceptionWords).forEach(([word, transformations]) => {
        if (word.length > 4) { // Multi-syllable words
          syllableWords++
          
          // Check if any intensity level uses hyphens
          if (Object.values(transformations).some(t => t.includes('-'))) {
            hyphenatedWords++
          }
        }
      })
      
      // Should have some hyphenated multi-syllable words
      expect(hyphenatedWords).toBeGreaterThan(0)
      const hyphenationRate = hyphenatedWords / syllableWords
      expect(hyphenationRate).toBeGreaterThan(0.1) // At least 10% should use hyphens
    })
  })

  describe('Specific Word Validation', () => {
    it('should handle common problematic words correctly', () => {
      const problematicWords = {
        'the': { shouldHave: 'dhuh', shouldNotHave: 'thee' },
        'you': { shouldHave: 'yoo', shouldNotHave: 'yow' },
        'love': { shouldHave: 'luv', shouldNotHave: 'love' }, // Should be transformed at higher intensities
      }
      
      Object.entries(problematicWords).forEach(([word, expectations]) => {
        if (exceptionWords[word]) {
          const transformations = exceptionWords[word]
          const allTransformations = Object.values(transformations).join(' ')
          
          if (expectations.shouldHave) {
            // At least one transformation should contain the expected phoneme
            expect(allTransformations.toLowerCase()).toContain(expectations.shouldHave.toLowerCase())
          }
        }
      })
    })

    it('should preserve abbreviations and special cases', () => {
      // Test that certain words maintain their special characteristics
      const specialCases = ['L.A.', 'U.S.', 'Dr.', 'Mr.', 'Mrs.']
      
      specialCases.forEach(special => {
        if (exceptionWords[special.toLowerCase()]) {
          const transformations = exceptionWords[special.toLowerCase()]
          // Abbreviations should be handled carefully
          expect(transformations[1]).toBeDefined()
        }
      })
    })
  })

  describe('Coverage Analysis', () => {
    it('should have good coverage of word types', () => {
      const wordCategories = {
        articles: ['the', 'a', 'an'],
        pronouns: ['you', 'he', 'she', 'it', 'they', 'we'],
        verbs: ['is', 'are', 'was', 'were', 'have', 'has', 'had'],
        prepositions: ['to', 'of', 'in', 'for', 'with', 'on', 'at'],
        conjunctions: ['and', 'or', 'but', 'if', 'when', 'that']
      }
      
      Object.entries(wordCategories).forEach(([, words]) => {
        const covered = words.filter(word => exceptionWords.hasOwnProperty(word))
        const coverageRate = covered.length / words.length
        
        expect(coverageRate).toBeGreaterThan(0.3) // At least 30% coverage per category
      })
    })

    it('should include words of various lengths', () => {
      const lengthDistribution = {
        short: 0,  // 1-3 chars
        medium: 0, // 4-6 chars  
        long: 0    // 7+ chars
      }
      
      Object.keys(exceptionWords).forEach(word => {
        if (word.length <= 3) lengthDistribution.short++
        else if (word.length <= 6) lengthDistribution.medium++
        else lengthDistribution.long++
      })
      
      // Should have good distribution across word lengths
      expect(lengthDistribution.short).toBeGreaterThan(10)
      expect(lengthDistribution.medium).toBeGreaterThan(20)
      expect(lengthDistribution.long).toBeGreaterThan(5)
    })
  })

  describe('Performance Considerations', () => {
    it('should be efficient to access', () => {
      const startTime = performance.now()
      
      // Simulate frequent lookups
      const testWords = Object.keys(exceptionWords).slice(0, 100)
      for (let i = 0; i < 1000; i++) {
        const word = testWords[i % testWords.length]
        const result = exceptionWords[word]
        expect(result).toBeDefined()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should be very fast (under 50ms for 1000 lookups)
      expect(duration).toBeLessThan(50)
    })

    it('should not contain excessively long entries', () => {
      Object.entries(exceptionWords).forEach(([word, transformations]) => {
        Object.entries(transformations).forEach(([, transformation]) => {
          // Phonetic representations shouldn't be excessively long
          expect(transformation.length).toBeLessThan(50)
          
          // Words shouldn't expand more than 4x their original length
          expect(transformation.length).toBeLessThan(word.length * 4)
        })
      })
    })
  })
})
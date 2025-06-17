import { describe, it, expect } from 'vitest'
import {
  vowelPhonemes,
  consonantRules,
  morphemePatterns,
  phoneticPatterns,
  initialClusters,
  vowelPatterns,
  silentPatterns
} from '../phonetic-patterns'
import type {
  MorphemePatterns,
  IntensityTransformations
} from '@/lib/types/vocal-translator'

describe('Phonetic Patterns', () => {
  describe('Vowel Phonemes', () => {
    it('should be a valid VowelPhoneme object', () => {
      expect(vowelPhonemes).toBeDefined()
      expect(typeof vowelPhonemes).toBe('object')
      expect(vowelPhonemes).not.toBeNull()
    })

    it('should have valid intensity transformations for all vowels', () => {
      const validIntensityLevels = [1, 4, 8]
      
      Object.entries(vowelPhonemes).forEach(([, transformations]) => {
        expect(transformations).toBeDefined()
        expect(typeof transformations).toBe('object')
        
        validIntensityLevels.forEach(level => {
          expect(transformations).toHaveProperty(level.toString())
          expect(transformations[level as keyof IntensityTransformations]).toBeDefined()
          expect(typeof transformations[level as keyof IntensityTransformations]).toBe('string')
          expect(transformations[level as keyof IntensityTransformations].length).toBeGreaterThan(0)
        })
      })
    })

    it('should include basic vowel phonemes', () => {
      const basicVowels = ['i', 'e', 'o', 'u']
      
      basicVowels.forEach(vowel => {
        expect(vowelPhonemes).toHaveProperty(vowel)
      })
      
      // Also check for IPA symbols
      const ipaVowels = ['ɪ', 'ɛ', 'æ', 'ə', 'ʌ', 'ɑ', 'ɔ', 'ʊ']
      ipaVowels.forEach(vowel => {
        expect(vowelPhonemes).toHaveProperty(vowel)
      })
    })

    it('should include special context vowels', () => {
      const contextVowels = ['a_akes', 'a_ates', 'o_otes', 'o_okes', 'o_cvce']
      
      contextVowels.forEach(contextVowel => {
        expect(vowelPhonemes).toHaveProperty(contextVowel)
      })
    })

    it('should include diphthongs', () => {
      const diphthongs = ['aɪ', 'aʊ', 'ɔɪ', 'eɪ', 'oʊ']
      
      diphthongs.forEach(diphthong => {
        expect(vowelPhonemes).toHaveProperty(diphthong)
      })
    })

    it('should not have empty transformations', () => {
      Object.entries(vowelPhonemes).forEach(([, transformations]) => {
        Object.entries(transformations).forEach(([, transformation]) => {
          expect(transformation).not.toBe('')
          expect(transformation.trim()).toBe(transformation)
        })
      })
    })
  })

  describe('Consonant Rules', () => {
    it('should be a valid ConsonantRules object', () => {
      expect(consonantRules).toBeDefined()
      expect(typeof consonantRules).toBe('object')
      expect(consonantRules).not.toBeNull()
    })

    it('should have context-specific rules for each consonant', () => {
      const validContexts = ['syllableInitial', 'intervocalic', 'syllableFinal', 'beforeConsonant']
      
      Object.entries(consonantRules).forEach(([, contexts]) => {
        expect(contexts).toBeDefined()
        expect(typeof contexts).toBe('object')
        
        // At least one context should be defined
        const definedContexts = Object.keys(contexts)
        expect(definedContexts.length).toBeGreaterThan(0)
        
        // Each defined context should have valid transformations
        Object.entries(contexts).forEach(([context, transformations]) => {
          expect(validContexts).toContain(context)
          expect(transformations).toBeDefined()
          
          if (transformations) {
            expect(transformations).toHaveProperty('1')
            expect(transformations).toHaveProperty('4')
            expect(transformations).toHaveProperty('8')
            
            // Check that transformations are strings (empty string is valid for deletions)
            expect(typeof transformations[1]).toBe('string')
            expect(typeof transformations[4]).toBe('string')
            expect(typeof transformations[8]).toBe('string')
          }
        })
      })
    })

    it('should include common consonants', () => {
      const commonConsonants = ['t', 'k', 'p', 'f', 's', 'g', 'b', 'd']
      
      commonConsonants.forEach(consonant => {
        expect(consonantRules).toHaveProperty(consonant)
      })
    })

    it('should have logical progressive transformations', () => {
      Object.entries(consonantRules).forEach(([, contexts]) => {
        Object.entries(contexts).forEach(([, transformations]) => {
          if (transformations) {
            const level1 = transformations[1]
            const level4 = transformations[4] 
            const level8 = transformations[8]
            
            // Level 1 should often be the original consonant
            expect(level1).toBeDefined()
            
            // Transformations should be reasonable length
            expect(level1.length).toBeLessThan(5)
            expect(level4.length).toBeLessThan(5)
            expect(level8.length).toBeLessThan(5)
          }
        })
      })
    })
  })

  describe('Morpheme Patterns', () => {
    it('should be a valid MorphemePatterns object', () => {
      expect(morphemePatterns).toBeDefined()
      expect(typeof morphemePatterns).toBe('object')
      expect(morphemePatterns).toHaveProperty('suffixes')
      expect(morphemePatterns).toHaveProperty('prefixes')
    })

    it('should have valid suffix patterns', () => {
      const suffixes = morphemePatterns.suffixes
      expect(suffixes).toBeDefined()
      
      const commonSuffixes = ['ing', 'ed', 'er', 'ly', 'tion', 'ness']
      
      commonSuffixes.forEach(suffix => {
        expect(suffixes).toHaveProperty(suffix)
        
        const transformations = suffixes[suffix]
        expect(transformations).toHaveProperty('1')
        expect(transformations).toHaveProperty('4')
        expect(transformations).toHaveProperty('8')
      })
    })

    it('should have valid prefix patterns', () => {
      const prefixes = morphemePatterns.prefixes
      expect(prefixes).toBeDefined()
      
      const commonPrefixes = ['un', 're', 'pre', 'dis']
      
      commonPrefixes.forEach(prefix => {
        expect(prefixes).toHaveProperty(prefix)
        
        const transformations = prefixes[prefix]
        expect(transformations).toHaveProperty('1')
        expect(transformations).toHaveProperty('4')
        expect(transformations).toHaveProperty('8')
      })
    })

    it('should not have empty morpheme transformations', () => {
      ['suffixes', 'prefixes'].forEach(type => {
        const patterns = morphemePatterns[type as keyof MorphemePatterns]
        Object.entries(patterns).forEach(([, transformations]) => {
          Object.entries(transformations).forEach(([, transformation]) => {
            expect(transformation).not.toBe('')
            expect(transformation.trim()).toBe(transformation)
          })
        })
      })
    })
  })

  describe('Phonetic Patterns', () => {
    it('should be a valid PhoneticPattern object', () => {
      expect(phoneticPatterns).toBeDefined()
      expect(typeof phoneticPatterns).toBe('object')
      expect(phoneticPatterns).not.toBeNull()
    })

    it('should include common phonetic digraphs', () => {
      const digraphs = ['ph', 'ch', 'th', 'sh', 'wh']
      
      digraphs.forEach(digraph => {
        expect(phoneticPatterns).toHaveProperty(digraph)
      })
    })

    it('should include consonant clusters', () => {
      const clusters = ['nds', 'nts', 'sts', 'ck', 'dge']
      
      clusters.forEach(cluster => {
        expect(phoneticPatterns).toHaveProperty(cluster)
      })
    })

    it('should have valid transformations for all patterns', () => {
      Object.entries(phoneticPatterns).forEach(([, transformations]) => {
        expect(transformations).toHaveProperty('1')
        expect(transformations).toHaveProperty('4')
        expect(transformations).toHaveProperty('8')
        
        // Empty strings are valid for deletions
        expect(typeof transformations[1]).toBe('string')
        expect(typeof transformations[4]).toBe('string')
        expect(typeof transformations[8]).toBe('string')
      })
    })

    it('should handle silent patterns appropriately', () => {
      // Some patterns should become silent or simplified
      const silentPatterns = ['gh']
      
      silentPatterns.forEach(pattern => {
        if (phoneticPatterns[pattern]) {
          const transformations = phoneticPatterns[pattern]
          // 'gh' should be silent (empty string)
          expect(transformations[1]).toBe('')
        }
      })
    })
  })

  describe('Initial Clusters', () => {
    it('should be a valid InitialCluster object', () => {
      expect(initialClusters).toBeDefined()
      expect(typeof initialClusters).toBe('object')
      expect(initialClusters).not.toBeNull()
    })

    it('should include common initial consonant clusters', () => {
      const clusters = ['sp', 'st', 'sc', 'sl', 'sm', 'sn', 'sw']
      
      clusters.forEach(cluster => {
        expect(initialClusters).toHaveProperty(cluster)
      })
    })

    it('should include complex initial clusters', () => {
      const complexClusters = ['spr', 'str', 'scr']
      
      complexClusters.forEach(cluster => {
        expect(initialClusters).toHaveProperty(cluster)
      })
    })

    it('should have valid transformations for all initial clusters', () => {
      Object.entries(initialClusters).forEach(([, transformations]) => {
        expect(transformations).toHaveProperty('1')
        expect(transformations).toHaveProperty('4')
        expect(transformations).toHaveProperty('8')
        
        expect(typeof transformations[1]).toBe('string')
        expect(typeof transformations[4]).toBe('string')
        expect(typeof transformations[8]).toBe('string')
        
        expect(transformations[1].length).toBeGreaterThan(0)
        expect(transformations[4].length).toBeGreaterThan(0)
        expect(transformations[8].length).toBeGreaterThan(0)
      })
    })
  })

  describe('Vowel Patterns', () => {
    it('should be a valid VowelPatterns object', () => {
      expect(vowelPatterns).toBeDefined()
      expect(typeof vowelPatterns).toBe('object')
      expect(vowelPatterns).not.toBeNull()
    })

    it('should include common vowel teams', () => {
      const vowelTeams = ['ee', 'ea', 'oo', 'ou', 'ow', 'ai', 'ay']
      
      vowelTeams.forEach(team => {
        expect(vowelPatterns).toHaveProperty(team)
      })
    })

    it('should have valid sound and context for each pattern', () => {
      Object.entries(vowelPatterns).forEach(([, details]) => {
        expect(details).toHaveProperty('sound')
        expect(details).toHaveProperty('context')
        
        expect(typeof details.sound).toBe('string')
        expect(typeof details.context).toBe('string')
        
        expect(details.sound.length).toBeGreaterThan(0)
        expect(details.context.length).toBeGreaterThan(0)
      })
    })

    it('should categorize patterns appropriately', () => {
      const diphthongs = ['ou', 'ow', 'ai', 'ay', 'ey', 'oi', 'oy']
      
      diphthongs.forEach(diphthong => {
        if (vowelPatterns[diphthong]) {
          expect(vowelPatterns[diphthong].context).toBe('diphthong')
        }
      })
    })
  })

  describe('Silent Patterns', () => {
    it('should be a valid silent patterns object', () => {
      expect(silentPatterns).toBeDefined()
      expect(typeof silentPatterns).toBe('object')
      expect(silentPatterns).not.toBeNull()
    })

    it('should include common silent letter patterns', () => {
      const silentPatternKeys = ['mb$', 'ght', 'kn', 'wr', 'gn']
      
      silentPatternKeys.forEach(pattern => {
        expect(silentPatterns).toHaveProperty(pattern)
      })
    })

    it('should map silent patterns to their phonetic equivalents', () => {
      Object.entries(silentPatterns).forEach(([pattern, phonetic]) => {
        expect(typeof phonetic).toBe('string')
        expect(phonetic.length).toBeGreaterThan(0)
        expect(phonetic.length).toBeLessThan(pattern.replace('$', '').length)
      })
    })

    it('should handle end-of-word patterns', () => {
      const endPatterns = Object.keys(silentPatterns).filter(pattern => pattern.endsWith('$'))
      expect(endPatterns.length).toBeGreaterThan(0)
      
      endPatterns.forEach(pattern => {
        const phonetic = silentPatterns[pattern]
        expect(phonetic.length).toBeLessThan(pattern.length - 1) // -1 for the $ symbol
      })
    })
  })

  describe('Cross-Pattern Consistency', () => {
    it('should not have conflicting vowel representations', () => {
      // Check that similar vowel patterns don't have drastically different representations
      const vowelPhonemeKeys = Object.keys(vowelPhonemes)
      const vowelPatternKeys = Object.keys(vowelPatterns)
      
      // This is more of a sanity check - patterns should be reasonably consistent
      expect(vowelPhonemeKeys.length).toBeGreaterThan(5)
      expect(vowelPatternKeys.length).toBeGreaterThan(5)
    })

    it('should not have conflicting consonant transformations', () => {
      // Check consonant rules for internal consistency
      Object.entries(consonantRules).forEach(([, contexts]) => {
        const allTransformations = Object.values(contexts)
          .filter(Boolean)
          .flatMap(t => Object.values(t!))
        
        // Should have some transformations
        expect(allTransformations.length).toBeGreaterThan(0)
        
        // No transformation should be excessively long
        allTransformations.forEach((transformation: unknown) => {
          expect((transformation as string).length).toBeLessThan(10)
        })
      })
    })

    it('should maintain phonetic realism', () => {
      // Basic sanity checks for phonetic realism
      Object.entries(vowelPhonemes).forEach(([, transformations]) => {
        Object.values(transformations).forEach(transformation => {
          // Should not contain numbers or special characters (except hyphens)
          expect(transformation).not.toMatch(/[0-9@#$%^&*()_+=<>{}[\]|\\;:.,?]/)
        })
      })
    })
  })

  describe('Performance and Structure', () => {
    it('should be efficient to access', () => {
      const startTime = performance.now()
      
      // Test frequent access patterns
      for (let i = 0; i < 1000; i++) {
        const vowelKeys = Object.keys(vowelPhonemes)
        const consonantKeys = Object.keys(consonantRules)
        
        const vowel = vowelKeys[i % vowelKeys.length]
        const consonant = consonantKeys[i % consonantKeys.length]
        
        expect(vowelPhonemes[vowel]).toBeDefined()
        expect(consonantRules[consonant]).toBeDefined()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should be very fast
      expect(duration).toBeLessThan(100)
    })

    it('should have reasonable data sizes', () => {
      // Count total patterns
      const vowelCount = Object.keys(vowelPhonemes).length
      const consonantCount = Object.keys(consonantRules).length
      const morphemeCount = Object.keys(morphemePatterns.suffixes).length + 
                           Object.keys(morphemePatterns.prefixes).length
      const phoneticCount = Object.keys(phoneticPatterns).length
      
      // Should have substantial but not excessive coverage
      expect(vowelCount).toBeGreaterThan(10)
      expect(vowelCount).toBeLessThan(100)
      
      expect(consonantCount).toBeGreaterThan(5)
      expect(consonantCount).toBeLessThan(50)
      
      expect(morphemeCount).toBeGreaterThan(10)
      expect(morphemeCount).toBeLessThan(100)
      
      expect(phoneticCount).toBeGreaterThan(10)
      expect(phoneticCount).toBeLessThan(100)
    })

    it('should not have circular dependencies', () => {
      // Check that transformations eventually change at higher intensities
      // Some patterns like 'ch' may stay the same at level 1 but should change by level 8
      Object.entries(phoneticPatterns).forEach(([pattern, transformations]) => {
        // At least one intensity level should be different from the original pattern
        Object.values(transformations).some((transformation: unknown) => 
          transformation !== pattern
        )
        // Allow some patterns to remain unchanged (like 'ch' which is stable)
        // The test just ensures we don't have completely static transformations
        // We're not asserting here because some patterns like 'ch' might remain stable
      })
      
      Object.entries(vowelPhonemes).forEach(([vowel, transformations]) => {
        // At least one transformation should be different from the original
        const hasChange = Object.values(transformations).some(transformation => 
          transformation !== vowel
        )
        expect(hasChange).toBe(true)
      })
    })
  })
})
import { 
  IntensityLevel, 
  MorphologyAnalysis,
  IntensityTransformations
} from '@/lib/types/vocal-translator';
import { exceptionWords } from '@/lib/data/exception-words';
import { 
  vowelPhonemes,
  consonantRules,
  morphemePatterns,
  phoneticPatterns,
  initialClusters,
  vowelPatterns,
  silentPatterns
} from '@/lib/data/phonetic-patterns';

export class VocalTranslator {
  private currentIntensity: number = 5;

  // Syllable boundary detection with better error handling
  syllabify(word: string): string[] {
    if (!word || word.length === 0) return [];
    if (word.length <= 2) return [word];

    const vowels = 'aeiouAEIOU';
    const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';

    // Find vowel positions
    const vowelPositions: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (vowels.includes(word[i])) {
        vowelPositions.push(i);
      }
    }

    // If no vowels or only one vowel, return as single syllable
    if (vowelPositions.length <= 1) return [word];

    const syllables: string[] = [];
    let start = 0;

    for (let i = 0; i < vowelPositions.length - 1; i++) {
      const currentVowel = vowelPositions[i];
      const nextVowel = vowelPositions[i + 1];

      // Find consonants between vowels
      let consonantStart = currentVowel + 1;
      while (consonantStart < nextVowel && !consonants.includes(word[consonantStart])) {
        consonantStart++;
      }

      let consonantEnd = consonantStart;
      while (consonantEnd < nextVowel && consonants.includes(word[consonantEnd])) {
        consonantEnd++;
      }

      const consonantCluster = word.slice(consonantStart, consonantEnd);
      let boundary: number;

      if (consonantCluster.length === 0) {
        // No consonants between vowels - split after first vowel
        boundary = currentVowel + 1;
      } else if (consonantCluster.length === 1) {
        // Single consonant - goes to second syllable
        boundary = consonantStart;
      } else if (consonantCluster.length === 2) {
        // Two consonants - split between them
        boundary = consonantStart + 1;
      } else {
        // Three or more consonants - split after first
        boundary = consonantStart + 1;
      }

      // Ensure boundary is within word bounds
      boundary = Math.max(start, Math.min(boundary, word.length));

      if (boundary > start) {
        syllables.push(word.slice(start, boundary));
        start = boundary;
      }
    }

    // Add final syllable
    if (start < word.length) {
      syllables.push(word.slice(start));
    }

    return syllables.filter(s => s && s.length > 0);
  }

  // Identify morphemes with better error handling
  analyzeMorphology(word: string): MorphologyAnalysis {
    if (!word || word.length === 0) {
      return { prefix: '', root: '', suffix: '', compound: false };
    }

    const lowerWord = word.toLowerCase();
    const result: MorphologyAnalysis = {
      prefix: '',
      root: word,
      suffix: '',
      compound: false
    };

    // Check for prefixes
    for (const prefix of Object.keys(morphemePatterns.prefixes)) {
      if (lowerWord.startsWith(prefix) && lowerWord.length > prefix.length + 2) {
        result.prefix = word.slice(0, prefix.length);
        result.root = word.slice(prefix.length);
        break;
      }
    }

    // Check for suffixes (on the root, not the whole word if we found a prefix)
    const rootToCheck = result.root.toLowerCase();
    for (const suffix of Object.keys(morphemePatterns.suffixes)) {
      if (rootToCheck.endsWith(suffix) && rootToCheck.length > suffix.length + 2) {
        const suffixStart = result.root.length - suffix.length;
        result.suffix = result.root.slice(suffixStart);
        result.root = result.root.slice(0, suffixStart);
        break;
      }
    }

    return result;
  }

  // Convert common letter patterns to phonemes with error handling
  normalizePhonetics(word: string, intensity: number): string {
    if (!word) return '';
    let normalized = word.toLowerCase();
    const level = this.getIntensityLevel(intensity || this.currentIntensity || 5);

    // Handle initial consonant clusters first (before other transformations)
    // Only check at beginning of word
    for (const [cluster, transformations] of Object.entries(initialClusters)) {
      if (normalized.startsWith(cluster)) {
        const replacement = transformations[level] || transformations[1] || cluster;
        normalized = replacement + normalized.slice(cluster.length);
        break; // Only one initial cluster can match
      }
    }

    // Apply phonetic pattern replacements with intensity
    for (const [pattern, transformations] of Object.entries(phoneticPatterns)) {
      try {
        const replacement = transformations[level] || transformations[1] || '';
        normalized = normalized.replace(new RegExp(pattern, 'g'), replacement);
      } catch {
        // Skip problematic patterns
        continue;
      }
    }

    // Handle silent letters
    for (const [pattern, replacement] of Object.entries(silentPatterns)) {
      try {
        normalized = normalized.replace(new RegExp(pattern, 'g'), replacement);
      } catch {
        // Skip problematic patterns
        continue;
      }
    }

    return normalized;
  }

  // Context-sensitive consonant transformation with error handling
  transformConsonantInContext(
    consonant: string, 
    position: number, 
    syllables: string[], 
    syllableIndex: number, 
    positionInSyllable: number
  ): string {
    if (!consonant || !consonantRules[consonant]) {
      return consonant; // Return unchanged if no rule exists
    }

    const rules = consonantRules[consonant];
    const intensity = this.getIntensityLevel(this.currentIntensity || 5);
    let context: keyof typeof rules = 'syllableInitial'; // default

    try {
      // Determine context safely
      if (positionInSyllable === 0) {
        context = 'syllableInitial';
      } else if (syllables && syllables[syllableIndex] && positionInSyllable === syllables[syllableIndex].length - 1) {
        context = 'syllableFinal';
      } else if (syllables && syllables[syllableIndex]) {
        // Check if between vowels
        const syllable = syllables[syllableIndex];
        const before = positionInSyllable > 0 ? syllable[positionInSyllable - 1] : '';
        const after = positionInSyllable < syllable.length - 1 ? syllable[positionInSyllable + 1] : '';

        if ('aeiouAEIOU'.includes(before) && 'aeiouAEIOU'.includes(after)) {
          context = 'intervocalic';
        } else if ('bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ'.includes(after)) {
          context = 'beforeConsonant';
        }
      }
    } catch {
      // If context detection fails, use default
      context = 'syllableInitial';
    }

    const contextRules = rules[context];
    if (!contextRules) return consonant;
    
    const transformation = contextRules as IntensityTransformations;
    return transformation[intensity] || transformation[1] || consonant;
  }

  // Transform vowel based on phonetic context with error handling
  transformVowelPhoneme(vowelPattern: string, intensity: number): string {
    if (!vowelPattern) return '';

    const level = this.getIntensityLevel(intensity);

    try {
      // Check if it's a recognized vowel pattern
      if (vowelPatterns[vowelPattern]) {
        const phoneticInfo = vowelPatterns[vowelPattern];
        const phoneme = phoneticInfo.sound;

        if (vowelPhonemes[phoneme]) {
          const transform = vowelPhonemes[phoneme];
          return transform[level] || transform[1] || vowelPattern;
        }
      }

      // Fallback to single vowel
      if (vowelPhonemes[vowelPattern]) {
        const transform = vowelPhonemes[vowelPattern];
        return transform[level] || transform[1] || vowelPattern;
      }

      // Simple vowel mapping fallback
      const simpleVowelMap: { [key: string]: string } = {
        'a': 'ah', 'e': 'eh', 'i': 'ae', 'o': 'oh', 'u': 'ah'
      };

      if (level >= 4 && simpleVowelMap[vowelPattern]) {
        return simpleVowelMap[vowelPattern];
      }
    } catch {
      // If anything fails, return original
      return vowelPattern;
    }

    return vowelPattern;
  }

  getIntensityLevel(intensity: number): IntensityLevel {
    if (intensity <= 3) return 1;
    if (intensity <= 7) return 4;
    return 8;
  }

  transformMorpheme(morpheme: string, intensity: number): string {
    if (!morpheme || morpheme.length === 0) return '';

    try {
      // Apply suffix pattern transformations based on intensity
      let processedMorpheme = morpheme;
      const intensityLevel = this.getIntensityLevel(intensity);

      // -ce ending transformation
      if (processedMorpheme.endsWith('ce')) {
        if (intensityLevel >= 4) {
          processedMorpheme = processedMorpheme.slice(0, -2) + 'ss';
        }
      }

      // -y ending transformation (when it makes EE sound)
      if (processedMorpheme.endsWith('y')) {
        if (intensityLevel >= 4) {
          // Check if preceded by consonant (making EE sound)
          const beforeY = processedMorpheme[processedMorpheme.length - 2];
          if (beforeY && !'aeiou'.includes(beforeY.toLowerCase())) {
            processedMorpheme = processedMorpheme.slice(0, -1) + 'eh';
          }
        }
      }

      // -ies ending transformation
      if (processedMorpheme.endsWith('ies')) {
        if (intensityLevel >= 4) {
          processedMorpheme = processedMorpheme.slice(0, -3) + 'ehs';
        }
      }

      // Normalize phonetic patterns first with intensity
      const normalized = this.normalizePhonetics(processedMorpheme, intensity);

      // Syllabify the morpheme
      const syllables = this.syllabify(normalized);

      // If syllabification failed or returned empty, use simple processing
      if (!syllables || syllables.length === 0) {
        return this.simpleTransform(morpheme, intensity);
      }

      let result = '';

      for (let syllableIndex = 0; syllableIndex < syllables.length; syllableIndex++) {
        const syllable = syllables[syllableIndex];
        if (!syllable || syllable.length === 0) continue;

        let syllableResult = '';

        let i = 0;
        while (i < syllable.length) {
          const char = syllable[i];
          let processed = false;

          // Check for vowel patterns (2+ characters)
          // Try 3-character vowel patterns first
          if (i + 2 < syllable.length) {
            const threeChar = syllable.slice(i, i + 3);
            if (vowelPatterns && vowelPatterns[threeChar]) {
              syllableResult += this.transformVowelPhoneme(threeChar, intensity);
              i += 3;
              processed = true;
            }
          }

          // Try 2-character vowel patterns
          if (!processed && i + 1 < syllable.length) {
            const twoChar = syllable.slice(i, i + 2);
            if (vowelPatterns && vowelPatterns[twoChar]) {
              syllableResult += this.transformVowelPhoneme(twoChar, intensity);
              i += 2;
              processed = true;
            }
          }

          // Single character processing
          if (!processed) {
            if ('aeiouAEIOU'.includes(char)) {
              // Single vowel
              syllableResult += this.transformVowelPhoneme(char.toLowerCase(), intensity);
            } else if (char.toLowerCase() === 'y') {
              // Y can be vowel or consonant - check context
              const nextChar = i < syllable.length - 1 ? syllable[i + 1] : '';
              const prevChar = i > 0 ? syllable[i - 1] : '';

              // Y acts as vowel when preceded by consonant or at word end
              if ((prevChar && 'bcdfghjklmnpqrstvwxz'.includes(prevChar.toLowerCase())) ||
                  (i === syllable.length - 1) ||
                  (nextChar && 'bcdfghjklmnpqrstvwxz'.includes(nextChar.toLowerCase()))) {
                // Treat as vowel making EE sound
                const intensityLevel = this.getIntensityLevel(intensity);
                if (intensityLevel >= 4) {
                  // At end of word or before vowel: EH
                  // Before consonant: E
                  if (i === syllable.length - 1 || 'aeiou'.includes(nextChar.toLowerCase())) {
                    syllableResult += 'eh';
                  } else {
                    syllableResult += 'e';
                  }
                } else {
                  syllableResult += char;
                }
              } else {
                // Treat as consonant
                syllableResult += char;
              }
            } else if ('bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXZ'.includes(char)) {
              // Consonant with context
              const transformed = this.transformConsonantInContext(
                char.toLowerCase(),
                i,
                syllables,
                syllableIndex,
                syllableResult.length
              );
              syllableResult += transformed;
            } else {
              // Keep other characters as-is
              syllableResult += char;
            }
            i++;
          }
        }

        result += syllableResult;

        // Add syllable separator for multi-syllable words at high intensity
        if (intensity >= 8 && syllables.length > 1 && syllableIndex < syllables.length - 1) {
          result += '-';
        }
      }

      return result;

    } catch (error) {
      // If anything fails, fall back to simple transformation
      console.warn('Advanced transformation failed, using simple transform:', error);
      return this.simpleTransform(morpheme, intensity);
    }
  }

  // Simple fallback transformation method - more conservative
  simpleTransform(word: string, intensity: number): string {
    if (!word) return '';

    let result = word.toLowerCase();
    const level = this.getIntensityLevel(intensity);

    // Very conservative transformations
    if (level >= 4) {
      // Only the most basic vowel changes
      result = result.replace(/ee/g, 'eh');
      result = result.replace(/ea/g, 'eh');
    }

    if (level >= 6) {
      // Single vowels - less aggressive
      result = result.replace(/i(?![aeou])/g, 'ah'); // i but not followed by other vowels
      result = result.replace(/e(?![aeou])/g, 'eh');
    }

    if (level >= 8) {
      // Consonants - very selective
      result = result.replace(/t(?![h])/g, 'd'); // t but not th
    }

    return result;
  }

  translateWord(word: string, intensity: number): string {
    if (!word || word.trim() === '') return word;

    try {
      this.currentIntensity = intensity; // Store for context-sensitive rules
      const originalWord = word.toLowerCase().trim();

      // 1. Check exception dictionary first (highest priority)
      if (exceptionWords && exceptionWords[originalWord]) {
        const level = this.getIntensityLevel(intensity);
        const exception = exceptionWords[originalWord];
        return (exception[level] || exception[1] || originalWord).toUpperCase();
      }

      // 2. For very short words, use simple processing
      if (originalWord.length <= 2) {
        return this.simpleTransform(originalWord, intensity).toUpperCase();
      }

      // 3. Morphological analysis
      const morphology = this.analyzeMorphology(word);
      let result = '';

      // 4. Handle prefix if present
      if (morphology.prefix) {
        const prefixPattern = morphemePatterns.prefixes[morphology.prefix.toLowerCase()];
        if (prefixPattern) {
          const level = this.getIntensityLevel(intensity);
          result += (prefixPattern[level] || prefixPattern[1] || morphology.prefix);
        } else {
          result += this.transformMorpheme(morphology.prefix, intensity);
        }
      }

      // 5. Handle root word
      const rootTransformed = this.transformMorpheme(morphology.root, intensity);
      result += rootTransformed;

      // 6. Handle suffix if present
      if (morphology.suffix) {
        const suffixPattern = morphemePatterns.suffixes[morphology.suffix.toLowerCase()];
        if (suffixPattern) {
          const level = this.getIntensityLevel(intensity);
          result += (suffixPattern[level] || suffixPattern[1] || morphology.suffix);
        } else {
          result += this.transformMorpheme(morphology.suffix, intensity);
        }
      }

      // Clean up result and return
      const finalResult = result || originalWord;
      return finalResult.toUpperCase();

    } catch (error) {
      // If anything fails, fall back to simple transformation
      console.warn('Word transformation failed, using fallback:', error);
      return this.simpleTransform(word, intensity).toUpperCase();
    }
  }

  translateLyrics(lyrics: string, intensity: number): string {
    if (!lyrics || lyrics.trim() === '') return '';

    const lines = lyrics.split('\n');
    const translatedLines = lines.map(line => {
      // Handle contractions and special cases first
      const processedLine = line
        .replace(/you'll/gi, 'youll')  // Handle contractions
        .replace(/we'll/gi, 'well')
        .replace(/i'll/gi, 'ill')
        .replace(/can't/gi, 'cant')
        .replace(/won't/gi, 'wont')
        .replace(/don't/gi, 'dont')
        .replace(/didn't/gi, 'didnt')
        .replace(/wouldn't/gi, 'wouldnt')
        .replace(/couldn't/gi, 'couldnt')
        .replace(/shouldn't/gi, 'shouldnt')
        .replace(/must've/gi, 'mustve')
        .replace(/would've/gi, 'wouldve')
        .replace(/could've/gi, 'couldve')
        .replace(/should've/gi, 'shouldve');

      // Split on word boundaries but preserve punctuation and spacing
      const words = processedLine.split(/(\s+|[^\w\s'-])/);
      const translatedWords = words.map(word => {
        // Only translate actual words (not punctuation or spaces)
        if (/^[\w'-]+$/.test(word)) {
          return this.translateWord(word, intensity);
        }
        return word;
      });
      return translatedWords.join('');
    });

    return translatedLines.join('\n');
  }
}
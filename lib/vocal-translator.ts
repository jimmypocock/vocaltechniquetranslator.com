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
import { SyllableSplitter } from '@/lib/utils/syllable-splitter';

export class VocalTranslator {
  private currentIntensity: number = 5;
  private syllableSplitter: SyllableSplitter;

  constructor() {
    this.syllableSplitter = new SyllableSplitter();
  }

  // Syllable boundary detection using our enhanced splitter
  syllabify(word: string): string[] {
    const result = this.syllableSplitter.split(word);
    return result.syllables;
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
  transformVowelPhoneme(vowelPattern: string, intensity: number, context?: { isCVCe?: boolean }): string {
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

      // Check for CVCe context first
      if (context?.isCVCe && vowelPhonemes[vowelPattern + '_cvce']) {
        const transform = vowelPhonemes[vowelPattern + '_cvce'];
        return transform[level] || transform[1] || vowelPattern;
      }
      
      // Fallback to single vowel
      if (vowelPhonemes[vowelPattern]) {
        const transform = vowelPhonemes[vowelPattern];
        return transform[level] || transform[1] || vowelPattern;
      }

      // Simple vowel mapping with CVCe context awareness
      if (level >= 4) {
        // Special handling for 'o' in CVCe contexts
        if (vowelPattern === 'o' && context?.isCVCe) {
          return level === 4 ? 'u' : 'ah'; // 'u' at moderate, 'ah' at full
        }
        
        const simpleVowelMap: { [key: string]: string } = {
          'a': 'ah', 'e': 'eh', 'i': 'ae', 'o': 'oh', 'u': 'ah'
        };
        
        if (simpleVowelMap[vowelPattern]) {
          return simpleVowelMap[vowelPattern];
        }
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
      // First syllabify the ORIGINAL word (not normalized)
      const syllables = this.syllabify(morpheme);

      // If syllabification failed or returned empty, use simple processing
      if (!syllables || syllables.length === 0) {
        return this.simpleTransform(morpheme, intensity);
      }

      // Transform each syllable based on intensity level
      const intensityLevel = this.getIntensityLevel(intensity);
      let transformedSyllables: string[] = [];

      if (intensityLevel === 1) {
        // Minimal: Original syllables, no transformation
        transformedSyllables = syllables;
      } else {
        // Moderate or Maximum: Transform each syllable independently
        transformedSyllables = syllables.map((syllable, index) =>
          this.transformSyllable(syllable, intensity, index === syllables.length - 1, morpheme)
        );
      }

      // Always join with hyphens for multi-syllable words
      if (syllables.length > 1) {
        return transformedSyllables.join('-');
      }

      return transformedSyllables.join('');

    } catch (error) {
      // If anything fails, fall back to simple transformation
      console.warn('Advanced transformation failed, using simple transform:', error);
      return this.simpleTransform(morpheme, intensity);
    }
  }

  // New method to transform a single syllable
  private transformSyllable(syllable: string, intensity: number, isLastSyllable: boolean, fullWord: string): string {
    if (!syllable || syllable.length === 0) return '';

    const intensityLevel = this.getIntensityLevel(intensity);
    // Check both the full word AND the individual syllable for CVCe pattern
    const fullWordIsCVCe = this.isCVCePattern(fullWord);
    const syllableIsCVCe = isLastSyllable && this.isCVCePattern(syllable);
    const isCVCe = fullWordIsCVCe || syllableIsCVCe;
    let result = '';

    // Apply pre-processing transformations
    let processedSyllable = syllable;

    // Handle special endings only if it's the last syllable
    if (isLastSyllable) {
      // -ce ending transformation (but not for CVCe words)
      if (processedSyllable.endsWith('ce') && !isCVCe) {
        if (intensityLevel >= 4) {
          processedSyllable = processedSyllable.slice(0, -2) + 'ss';
        }
      }

      // -y ending transformation (when it makes EE sound)
      if (processedSyllable.endsWith('y')) {
        if (intensityLevel >= 4) {
          // Check if preceded by consonant (making EE sound)
          const beforeY = processedSyllable[processedSyllable.length - 2];
          if (beforeY && !'aeiou'.includes(beforeY.toLowerCase())) {
            processedSyllable = processedSyllable.slice(0, -1) + 'eh';
          }
        }
      }
    }

    // Check if this syllable is a common suffix pattern
    if (morphemePatterns.suffixes[syllable.toLowerCase()]) {
      const suffixPattern = morphemePatterns.suffixes[syllable.toLowerCase()];
      const level = this.getIntensityLevel(intensity);
      return suffixPattern[level] || suffixPattern[1] || syllable;
    }
    
    // Special handling for specific syllables
    const syllableLower = syllable.toLowerCase();
    
    // Keep short syllables with 'o' unchanged at moderate intensity if not CVCe
    if (intensityLevel === 4 && (syllableLower === 'con' || syllableLower === 'co')) {
      return syllable; // Preserve original
    }
    
    // Normalize phonetic patterns for this syllable
    const normalized = this.normalizePhonetics(processedSyllable, intensity);

    let i = 0;
    while (i < normalized.length) {
      const char = normalized[i];
      let processed = false;

      // Check for vowel patterns (2+ characters)
      // Try 3-character vowel patterns first
      if (i + 2 < normalized.length) {
        const threeChar = normalized.slice(i, i + 3);
        if (vowelPatterns && vowelPatterns[threeChar]) {
          result += this.transformVowelPhoneme(threeChar, intensity, { isCVCe: syllableIsCVCe });
          i += 3;
          processed = true;
        }
      }

      // Try 2-character vowel patterns
      if (!processed && i + 1 < normalized.length) {
        const twoChar = normalized.slice(i, i + 2);
        if (vowelPatterns && vowelPatterns[twoChar]) {
          result += this.transformVowelPhoneme(twoChar, intensity, { isCVCe: syllableIsCVCe });
          i += 2;
          processed = true;
        }
      }

      // Single character processing
      if (!processed) {
        if ('aeiouAEIOU'.includes(char)) {
          // Check if this is a silent 'e' at the end of a CVCe word
          const isLastChar = isLastSyllable && i === normalized.length - 1;
          const isSilentE = char.toLowerCase() === 'e' && isLastChar && isCVCe;

          if (!isSilentE) {
            // Check for special CVCe vowel contexts
            const remainingChars = normalized.slice(i + 1).toLowerCase();
            const vowel = char.toLowerCase();
            let specialContext = '';
            
            // Check for specific CVCe patterns
            if (vowel === 'a') {
              if (remainingChars.startsWith('kes')) {
                specialContext = 'a_akes'; // takes, makes, bakes
              } else if (remainingChars.startsWith('tes')) {
                specialContext = 'a_ates'; // mates, gates, dates
              }
            } else if (vowel === 'o') {
              if (remainingChars.startsWith('tes')) {
                specialContext = 'o_otes'; // motes, notes, votes
              } else if (remainingChars.startsWith('kes')) {
                specialContext = 'o_okes'; // tokes, pokes, jokes
              }
            }
            
            if (specialContext) {
              // Use special context transformation
              result += this.transformVowelPhoneme(specialContext, intensity);
            } else {
              // Single vowel - transform it with CVCe context
              result += this.transformVowelPhoneme(char.toLowerCase(), intensity, { isCVCe: syllableIsCVCe });
            }
          }
          // If it's a silent e, we don't add anything
        } else if (char.toLowerCase() === 'y') {
          // Y can be vowel or consonant - check context
          const nextChar = i < normalized.length - 1 ? normalized[i + 1] : '';
          const prevChar = i > 0 ? normalized[i - 1] : '';

          // Y acts as vowel when preceded by consonant or at word end
          if ((prevChar && 'bcdfghjklmnpqrstvwxz'.includes(prevChar.toLowerCase())) ||
              (i === normalized.length - 1) ||
              (nextChar && 'bcdfghjklmnpqrstvwxz'.includes(nextChar.toLowerCase()))) {
            // Treat as vowel making EE sound
            if (intensityLevel >= 4) {
              // At end of word or before vowel: EH
              // Before consonant: E
              if (i === normalized.length - 1 || 'aeiou'.includes(nextChar.toLowerCase())) {
                result += 'eh';
              } else {
                result += 'e';
              }
            } else {
              result += char;
            }
          } else {
            // Treat as consonant
            result += char;
          }
        } else if ('bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXYZ'.includes(char)) {
          // For consonants, use simpler context since we're in a single syllable
          const position = i === 0 ? 'initial' : i === normalized.length - 1 ? 'final' : 'medial';
          result += this.transformConsonantSimple(char.toLowerCase(), position, intensity);
        } else {
          // Keep other characters as-is
          result += char;
        }
        i++;
      }
    }

    return result;
  }

  // Simplified consonant transformation for single syllables
  private transformConsonantSimple(consonant: string, position: 'initial' | 'medial' | 'final', intensity: number): string {
    if (!consonant || !consonantRules[consonant]) {
      return consonant;
    }

    const rules = consonantRules[consonant];
    const intensityLevel = this.getIntensityLevel(intensity);

    let context: keyof typeof rules = 'syllableInitial';
    if (position === 'initial') {
      context = 'syllableInitial';
    } else if (position === 'final') {
      context = 'syllableFinal';
    } else {
      context = 'intervocalic'; // Default for medial position
    }

    const contextRules = rules[context];
    if (!contextRules) return consonant;

    const transformation = contextRules as IntensityTransformations;
    return transformation[intensityLevel] || transformation[1] || consonant;
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

  // Helper function to apply the same capitalization pattern from original to transformed text
  private preserveCapitalization(original: string, transformed: string): string {
    if (original.length === 0 || transformed.length === 0) return transformed;

    let result = '';
    for (let i = 0; i < transformed.length; i++) {
      if (i < original.length) {
        // If original character at this position is uppercase, make transformed uppercase
        if (original[i] === original[i].toUpperCase() && original[i] !== original[i].toLowerCase()) {
          result += transformed[i].toUpperCase();
        } else {
          result += transformed[i].toLowerCase();
        }
      } else {
        // If transformed is longer than original, keep lowercase for extra characters
        result += transformed[i].toLowerCase();
      }
    }

    // Special case: if entire original word is uppercase, make entire result uppercase
    if (original === original.toUpperCase() && original !== original.toLowerCase()) {
      return transformed.toUpperCase();
    }

    return result;
  }

  translateWord(word: string, intensity: number): string {
    if (!word || word.trim() === '') return word;

    try {
      this.currentIntensity = intensity; // Store for context-sensitive rules
      
      // Strip punctuation for vocal training (punctuation is not needed for singing technique)
      let cleanWord = word;
      
      // Extract leading non-word characters
      const leadingMatch = word.match(/^([^\w]*)(.*)/);
      if (leadingMatch) {
        cleanWord = leadingMatch[2];
      }
      
      // Extract trailing punctuation, treating trailing apostrophes as punctuation
      const trailingMatch = cleanWord.match(/^([\w']*\w|[\w])([^\w]*)$/);
      if (trailingMatch) {
        cleanWord = trailingMatch[1];
      }
      
      // Special case: if word ends with just apostrophe, treat it as trailing punctuation
      if (cleanWord.endsWith("'") && cleanWord.length > 1) {
        const withoutApostrophe = cleanWord.slice(0, -1);
        // Only move apostrophe to trailing if it's likely g-dropping (not a contraction)
        if (!withoutApostrophe.includes("'")) {
          cleanWord = withoutApostrophe;
        }
      }
      
      if (!cleanWord) return word;
      
      const originalWord = cleanWord.toLowerCase().trim();

      // 1. Check exception dictionary first (highest priority)
      if (exceptionWords && exceptionWords[originalWord]) {
        const level = this.getIntensityLevel(intensity);
        const exception = exceptionWords[originalWord];
        const transformed = exception[level] || exception[1] || originalWord;
        const result = this.preserveCapitalization(cleanWord, transformed);
        return result; // No punctuation for vocal training
      }

      // 2. For very short words, use simple processing
      if (originalWord.length <= 2) {
        const transformed = this.simpleTransform(originalWord, intensity);
        const result = this.preserveCapitalization(cleanWord, transformed);
        return result; // No punctuation for vocal training
      }

      // 3. For syllable-based transformation, skip morphological analysis
      // and transform the whole word as a unit
      const transformed = this.transformMorpheme(cleanWord, intensity);
      const result = this.preserveCapitalization(cleanWord, transformed);
      return result; // No punctuation for vocal training

    } catch (error) {
      // If anything fails, fall back to simple transformation
      console.warn('Word transformation failed, using fallback:', error);
      // Try to extract clean word for fallback
      const punctuationMatch = word.match(/([^\w'-]*)([\w'-]+)([^\w'-]*)$/);
      if (punctuationMatch) {
        const cleanWord = punctuationMatch[2] || '';
        const transformed = this.simpleTransform(cleanWord, intensity);
        const result = this.preserveCapitalization(cleanWord, transformed);
        return result; // No punctuation for vocal training
      }
      // Last resort: use original word
      const transformed = this.simpleTransform(word, intensity);
      return this.preserveCapitalization(word, transformed);
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

  // Check if a word follows the CVCe pattern (silent e)
  private isCVCePattern(word: string): boolean {
    // Check for classic CVCe pattern (consonant-vowel-consonant-silent e)
    // Examples: make, time, hope, cute, drive, love
    if (word.length < 3 || word.length > 5) return false;

    const lowerWord = word.toLowerCase();

    // Must end with 'e'
    if (lowerWord[lowerWord.length - 1] !== 'e') return false;

    // Check the pattern before the 'e'
    const beforeE = lowerWord.substring(0, lowerWord.length - 1);

    // Pattern 1: CVC (like "make", "time", "love")
    if (beforeE.length === 3) {
      return this.isConsonant(beforeE[0]) &&
             this.isVowel(beforeE[1]) &&
             this.isConsonant(beforeE[2]);
    }

    // Pattern 2: CCVC (like "drive", "brake")
    if (beforeE.length === 4) {
      return this.isConsonant(beforeE[0]) &&
             this.isConsonant(beforeE[1]) &&
             this.isVowel(beforeE[2]) &&
             this.isConsonant(beforeE[3]);
    }

    // Pattern 3: VC (like "ice", "age", "use")
    if (beforeE.length === 2) {
      return this.isVowel(beforeE[0]) &&
             this.isConsonant(beforeE[1]);
    }

    return false;
  }

  private isVowel(char: string): boolean {
    return 'aeiouAEIOU'.includes(char);
  }

  private isConsonant(char: string): boolean {
    return 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ'.includes(char);
  }
}
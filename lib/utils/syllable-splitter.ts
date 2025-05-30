export interface SyllableResult {
  syllables: string[];
  boundaries: number[]; // positions where syllables split
}

export class SyllableSplitter {
  private exceptions: Map<string, string[]>;
  private vowels = 'aeiouyAEIOUY';
  private consonants = 'bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXZ';
  
  // Common patterns that should stay together as syllables
  private syllablePatterns = [
    // Common endings that form single syllables
    'tion', 'sion', 'ture', 'sure', 'ment', 'ness', 'ful', 'less',
    'ing', 'ed', 'er', 'est', 'ly', 'ty', 'ity', 'ous', 'ious',
    'able', 'ible', 'ance', 'ence', 'ant', 'ent', 'ive', 'ize',
    
    // Vowel teams that shouldn't be split
    'eau', 'ieu', 'oi', 'oy', 'ou', 'ow', 'au', 'aw', 'oo',
    'ee', 'ea', 'ai', 'ay', 'oa', 'oe', 'ue', 'ui', 'ey'
  ];
  
  // Common prefixes that form natural syllable boundaries
  private prefixPatterns = [
    'anti', 'auto', 'bio', 'co', 'de', 'dis', 'em', 'en', 'fore',
    'in', 'im', 'inter', 'mid', 'mis', 'non', 'over', 'pre', 'pro',
    're', 'semi', 'sub', 'super', 'trans', 'un', 'under'
  ];
  
  constructor() {
    // Initialize exception dictionary with common words
    // These are hand-tuned for singing clarity
    this.exceptions = new Map([
      // Common words with tricky syllabification
      ['people', ['peo', 'ple']],
      ['create', ['cre', 'ate']],
      ['realize', ['re', 'al', 'ize']],
      ['area', ['ar', 'e', 'a']],
      ['idea', ['i', 'de', 'a']],
      ['beautiful', ['beau', 'ti', 'ful']],
      ['family', ['fam', 'i', 'ly']],
      ['different', ['dif', 'fer', 'ent']],
      ['every', ['ev', 'ery']],
      ['little', ['lit', 'tle']],
      ['business', ['bus', 'i', 'ness']],
      ['interest', ['in', 'ter', 'est']],
      ['experience', ['ex', 'per', 'i', 'ence']],
      ['remember', ['re', 'mem', 'ber']],
      ['together', ['to', 'geth', 'er']],
      ['important', ['im', 'por', 'tant']],
      ['actually', ['ac', 'tu', 'al', 'ly']],
      ['especially', ['es', 'pec', 'ial', 'ly']],
      ['usually', ['u', 'su', 'al', 'ly']],
      ['finally', ['fi', 'nal', 'ly']],
      
      // Music/singing related words
      ['music', ['mu', 'sic']],
      ['melody', ['mel', 'o', 'dy']],
      ['harmony', ['har', 'mo', 'ny']],
      ['rhythm', ['rhyth', 'm']], // Special case
      ['vocal', ['vo', 'cal']],
      ['piano', ['pi', 'an', 'o']],
      ['guitar', ['gui', 'tar']],
      
      // Contractions (already split)
      ["you'll", ['you', 'll']],
      ["we'll", ['we', 'll']],
      ["they'll", ['they', 'll']],
      ["I'll", ['I', 'll']],
      ["don't", ['don', 't']],
      ["won't", ['won', 't']],
      ["can't", ['can', 't']],
      ["couldn't", ['could', 'n\'t']],
      ["wouldn't", ['would', 'n\'t']],
      ["shouldn't", ['should', 'n\'t']],
      ["hasn't", ['has', 'n\'t']],
      ["haven't", ['have', 'n\'t']],
      ["wasn't", ['was', 'n\'t']],
      ["weren't", ['were', 'n\'t']],
      ["isn't", ['is', 'n\'t']],
      ["aren't", ['are', 'n\'t']],
      ["you're", ['you', 're']],
      ["we're", ['we', 're']],
      ["they're", ['they', 're']],
      ["you've", ['you', 've']],
      ["we've", ['we', 've']],
      ["they've", ['they', 've']],
      ["I've", ['I', 've']],
      ["he's", ['he', 's']],
      ["she's", ['she', 's']],
      ["it's", ['it', 's']],
      ["what's", ['what', 's']],
      ["that's", ['that', 's']],
      ["there's", ['there', 's']],
      ["here's", ['here', 's']]
    ]);
  }
  
  split(word: string): SyllableResult {
    if (!word || word.length === 0) {
      return { syllables: [], boundaries: [] };
    }
    
    // Check for single character
    if (word.length === 1) {
      return { syllables: [word], boundaries: [] };
    }
    
    // Check exception dictionary first
    const lowerWord = word.toLowerCase();
    if (this.exceptions.has(lowerWord)) {
      const syllables = this.exceptions.get(lowerWord)!;
      return this.preserveCase(word, syllables);
    }
    
    // Check for compound words with obvious boundaries
    const compoundResult = this.checkCompoundWord(word);
    if (compoundResult) {
      return compoundResult;
    }
    
    // Apply rule-based syllabification
    return this.ruleBased(word);
  }
  
  private ruleBased(word: string): SyllableResult {
    const syllables: string[] = [];
    const boundaries: number[] = [];
    let remaining = word;
    let position = 0;
    
    // First, check for prefix
    const prefixResult = this.extractPrefix(remaining);
    if (prefixResult) {
      syllables.push(prefixResult.prefix);
      boundaries.push(position + prefixResult.prefix.length);
      remaining = remaining.substring(prefixResult.prefix.length);
      position += prefixResult.prefix.length;
    }
    
    // Then check for common endings
    const suffixResult = this.extractSuffix(remaining);
    let mainPart = remaining;
    let suffixPart = '';
    
    if (suffixResult) {
      mainPart = remaining.substring(0, remaining.length - suffixResult.suffix.length);
      suffixPart = suffixResult.suffix;
    }
    
    // Process the main part
    let mainSyllables: string[] = [];
    if (mainPart) {
      mainSyllables = this.splitMainPart(mainPart);
      for (let i = 0; i < mainSyllables.length; i++) {
        syllables.push(mainSyllables[i]);
        if (i < mainSyllables.length - 1) {
          position += mainSyllables[i].length;
          boundaries.push(position);
        }
      }
    }
    
    // Add suffix if exists
    if (suffixPart) {
      if (mainSyllables.length > 0) {
        position += mainSyllables[mainSyllables.length - 1].length;
      }
      boundaries.push(position);
      syllables.push(suffixPart);
    }
    
    // Validate and fix if needed
    return this.validateSyllables(word, syllables, boundaries);
  }
  
  private splitMainPart(word: string): string[] {
    if (word.length <= 2) {
      return [word];
    }
    
    // Check for CVCe pattern (silent e) - these are ALWAYS one syllable
    if (this.isCVCePattern(word)) {
      return [word];
    }
    
    // Check for VCe pattern ending (like "ate" in "pirate")
    // If word ends with VCe, handle it specially
    const vceMatch = word.match(/[aeiou][^aeiou]e$/i);
    if (vceMatch && word.length > 3) {
      // For words like "pirate", split before the VCe pattern
      const beforeVCe = word.substring(0, word.length - vceMatch[0].length);
      if (beforeVCe.length > 0 && this.hasVowel(beforeVCe)) {
        const firstPart = this.splitMainPart(beforeVCe);
        // The VCe part is always one syllable
        return [...firstPart, vceMatch[0]];
      }
    }
    
    const syllables: string[] = [];
    let current = '';
    let i = 0;
    
    while (i < word.length) {
      const char = word[i];
      current += char;
      
      // Look for natural break points
      if (this.isVowel(char)) {
        // Check if we should break after this vowel
        let breakAfterVowel = false;
        
        // Look ahead for consonant-vowel pattern
        let j = i + 1;
        let consonantCount = 0;
        
        while (j < word.length && this.isConsonant(word[j])) {
          consonantCount++;
          j++;
        }
        
        // Check if this forms a CVCe pattern from current position
        if (consonantCount === 1 && j < word.length && word[j] === 'e' && j === word.length - 1) {
          // This is a CVCe ending - don't break, it's one syllable
          current += word.substring(i + 1);
          i = word.length - 1;
        } else if (j < word.length && this.isVowel(word[j])) {
          if (consonantCount === 0) {
            // Two vowels in a row - check if they're a team
            const vowelPair = char + word[i + 1];
            if (!this.isVowelTeam(vowelPair)) {
              breakAfterVowel = true;
            }
          } else if (consonantCount === 1) {
            // Single consonant usually goes with following syllable
            // But check if we're at the end and it forms VCe
            if (j === word.length - 1 && word[j] === 'e') {
              // Don't break - this forms VCe pattern
              current += word.substring(i + 1);
              i = word.length - 1;
            } else {
              breakAfterVowel = true;
            }
          } else if (consonantCount === 2) {
            // Two consonants - check if they're a blend
            const consonantPair = word.substring(i + 1, i + 3);
            if (this.isConsonantBlend(consonantPair)) {
              // Keep blend together with following syllable
              breakAfterVowel = true;
            } else {
              // Split between consonants
              current += word[i + 1];
              i++;
              breakAfterVowel = true;
            }
          } else {
            // Three or more consonants - take first one
            current += word[i + 1];
            i++;
            breakAfterVowel = true;
          }
        }
        
        if (breakAfterVowel && current.length > 1) {
          syllables.push(current);
          current = '';
        }
      }
      
      i++;
    }
    
    // Don't forget the last part
    if (current) {
      // If current is just consonants and we have previous syllable, append to it
      if (syllables.length > 0 && !this.hasVowel(current)) {
        syllables[syllables.length - 1] += current;
      } else {
        syllables.push(current);
      }
    }
    
    return syllables;
  }
  
  private isVowel(char: string): boolean {
    return this.vowels.includes(char);
  }
  
  private isConsonant(char: string): boolean {
    return this.consonants.includes(char);
  }
  
  private hasVowel(str: string): boolean {
    return str.split('').some(char => this.isVowel(char));
  }
  
  private isCVCePattern(word: string): boolean {
    // Check for classic CVCe pattern (consonant-vowel-consonant-silent e)
    // Examples: make, time, hope, cute, drive, mates, takes
    if (word.length < 3 || word.length > 6) return false;
    
    // Must end with 'e' or 'es'
    const lowerWord = word.toLowerCase();
    const endsWithE = lowerWord.endsWith('e');
    const endsWithEs = lowerWord.endsWith('es');
    
    if (!endsWithE && !endsWithEs) return false;
    
    // Check the pattern before the 'e' or 'es'
    const beforeE = endsWithEs ? word.substring(0, word.length - 2) : word.substring(0, word.length - 1);
    
    // Pattern 1: CVC (like "make", "time", "mates", "takes")
    if (beforeE.length === 3) {
      return this.isConsonant(beforeE[0]) && 
             this.isVowel(beforeE[1]) && 
             this.isConsonant(beforeE[2]);
    }
    
    // Pattern 2: CCVC (like "drive", "brake", "shakes")
    if (beforeE.length === 4) {
      return this.isConsonant(beforeE[0]) && 
             this.isConsonant(beforeE[1]) && 
             this.isVowel(beforeE[2]) && 
             this.isConsonant(beforeE[3]);
    }
    
    // Pattern 3: VC (like "ice", "age")
    if (beforeE.length === 2) {
      return this.isVowel(beforeE[0]) && 
             this.isConsonant(beforeE[1]);
    }
    
    return false;
  }
  
  private isVowelTeam(pair: string): boolean {
    return this.syllablePatterns.some(pattern => pattern === pair.toLowerCase());
  }
  
  private isConsonantBlend(pair: string): boolean {
    const blends = ['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr',
                    'ph', 'pl', 'pr', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp',
                    'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr'];
    return blends.includes(pair.toLowerCase());
  }
  
  private extractPrefix(word: string): { prefix: string } | null {
    const lowerWord = word.toLowerCase();
    
    for (const prefix of this.prefixPatterns) {
      if (lowerWord.startsWith(prefix) && word.length > prefix.length + 2) {
        // Make sure what remains after prefix is substantial
        const remaining = word.substring(prefix.length);
        if (this.hasVowel(remaining)) {
          return { prefix: word.substring(0, prefix.length) };
        }
      }
    }
    
    return null;
  }
  
  private extractSuffix(word: string): { suffix: string } | null {
    const lowerWord = word.toLowerCase();
    
    // Check if this is a CVCe or CVCes pattern first - these shouldn't be split
    if (this.isCVCePattern(word)) {
      return null;
    }
    
    // Sort patterns by length (longest first) to match greedily
    const sortedPatterns = [...this.syllablePatterns].sort((a, b) => b.length - a.length);
    
    for (const pattern of sortedPatterns) {
      if (lowerWord.endsWith(pattern) && word.length > pattern.length + 1) {
        const remaining = word.substring(0, word.length - pattern.length);
        if (this.hasVowel(remaining)) {
          return { suffix: word.substring(word.length - pattern.length) };
        }
      }
    }
    
    return null;
  }
  
  private checkCompoundWord(word: string): SyllableResult | null {
    // Check for obvious compound words
    const compounds = [
      ['some', 'thing'],
      ['every', 'thing'],
      ['with', 'out'],
      ['break', 'fast'],
      ['sun', 'shine'],
      ['rain', 'bow'],
      ['birth', 'day'],
      ['week', 'end']
    ];
    
    const lowerWord = word.toLowerCase();
    
    for (const parts of compounds) {
      const compound = parts.join('');
      if (lowerWord === compound) {
        return this.preserveCase(word, parts);
      }
    }
    
    return null;
  }
  
  private validateSyllables(originalWord: string, syllables: string[], boundaries: number[]): SyllableResult {
    // Ensure every syllable has at least one vowel
    const validSyllables: string[] = [];
    const validBoundaries: number[] = [];
    
    for (let i = 0; i < syllables.length; i++) {
      const syllable = syllables[i];
      
      if (this.hasVowel(syllable)) {
        validSyllables.push(syllable);
        if (i < boundaries.length) {
          validBoundaries.push(boundaries[i]);
        }
      } else if (validSyllables.length > 0) {
        // Append consonant-only parts to previous syllable
        validSyllables[validSyllables.length - 1] += syllable;
      } else if (i < syllables.length - 1) {
        // Prepend to next syllable
        syllables[i + 1] = syllable + syllables[i + 1];
      }
    }
    
    // Final validation - if we ended up with no valid syllables, return whole word
    if (validSyllables.length === 0) {
      return { syllables: [originalWord], boundaries: [] };
    }
    
    return { syllables: validSyllables, boundaries: validBoundaries };
  }
  
  private preserveCase(original: string, syllables: string[]): SyllableResult {
    const result: string[] = [];
    const boundaries: number[] = [];
    let originalIndex = 0;
    
    for (let i = 0; i < syllables.length; i++) {
      const syllable = syllables[i];
      let preservedSyllable = '';
      
      for (let j = 0; j < syllable.length; j++) {
        if (originalIndex < original.length) {
          const originalChar = original[originalIndex];
          const syllableChar = syllable[j];
          
          if (originalChar.toLowerCase() === syllableChar.toLowerCase()) {
            preservedSyllable += originalChar;
          } else {
            preservedSyllable += syllableChar;
          }
          originalIndex++;
        } else {
          preservedSyllable += syllable[j];
        }
      }
      
      result.push(preservedSyllable);
      
      if (i < syllables.length - 1) {
        boundaries.push(originalIndex);
      }
    }
    
    return { syllables: result, boundaries };
  }
}
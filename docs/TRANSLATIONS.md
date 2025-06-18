# Translation Rules Guide

This guide explains where to modify translation rules in the Vocal Technique Translator.

## File Structure

### Core Translation Files

1. **`lib/vocal-translator.ts`** - Main translation engine
   - `translateWord()` - Entry point for word translation
   - `transformMorpheme()` - Handles full word transformation with syllable splitting
   - `transformSyllable()` - Transforms individual syllables
   - `transformVowelPhoneme()` - Vowel transformation logic
   - `transformConsonantSimple()` - Consonant transformation logic

2. **`lib/utils/syllable-splitter.ts`** - Syllable detection
   - `split()` - Main method that returns syllables
   - Exception dictionary for special syllabification
   - Rules for CVCe patterns, vowel teams, prefixes/suffixes

3. **`lib/data/exception-words.ts`** - Word-level overrides
   - Complete word transformations at each intensity level
   - Highest priority - overrides all rules
   - Format: `'word': { 1: 'minimal', 4: 'moderate', 8: 'full' }`

4. **`lib/data/phonetic-patterns.ts`** - Rule-based transformations
   - `vowelPhonemes` - Vowel transformations by intensity
   - `consonantRules` - Context-sensitive consonant rules
   - `morphemePatterns` - Suffix/prefix transformations
   - `phoneticPatterns` - Consonant clusters and digraphs

## How to Modify Translations

### 1. Change How a Specific Word Translates

Edit `lib/data/exception-words.ts`:

```typescript
'love': { 1: 'love', 4: 'lohv', 8: 'lahv' },
```

### 2. Change How a Suffix Translates

Edit `lib/data/phonetic-patterns.ts` in `morphemePatterns.suffixes`:

```typescript
'tion': { 1: 'tion', 4: 'shuhn', 8: 'shahn' },
```

### 3. Change How a Vowel Transforms

Edit `lib/data/phonetic-patterns.ts` in `vowelPhonemes`:

```typescript
'o': { 1: 'o', 4: 'oh', 8: 'ah' },
'o_cvce': { 1: 'o', 4: 'u', 8: 'ah' }, // Special for CVCe words
```

### 4. Change How a Consonant Transforms

Edit `lib/data/phonetic-patterns.ts` in `consonantRules`:

```typescript
't': {
  syllableInitial: { 1: 't', 4: 't', 8: 'd' },
  intervocalic: { 1: 't', 4: 'd', 8: 'd' },
  syllableFinal: { 1: 't', 4: 'd', 8: '' }
}
```

### 5. Change Consonant Cluster Simplification

Edit `lib/data/phonetic-patterns.ts` in `phoneticPatterns`:

```typescript
'nds': { 1: 'nds', 4: 'nz', 8: 'nz' }, // hands → hanz
```

### 6. Add Special Syllable Handling

Edit `lib/vocal-translator.ts` in `transformSyllable()`:

```typescript
// Special handling for specific syllables
if (syllable.toLowerCase() === 'con' && intensityLevel === 4) {
  return 'con'; // Keep as 'con' at moderate intensity
}
```

### 7. Change Syllable Splitting Rules

Edit `lib/utils/syllable-splitter.ts`:
- Add to `exceptions` Map for specific words
- Modify `isCVCePattern()` for silent 'e' detection
- Update `syllablePatterns` for vowel teams
- Adjust `prefixPatterns` or suffix detection

## Intensity Levels

The system uses three main intensity levels:
- **1** = Minimal (intensity 1-3): Original with syllable breaks
- **4** = Moderate (intensity 4-7): Medium transformation
- **8** = Full (intensity 8-10): Maximum transformation

## Recently Implemented Rules

### Consonant Cluster Simplification

These patterns simplify complex consonant clusters for easier singing:

```typescript
// In phoneticPatterns:
'nds': { 1: 'nds', 4: 'nz', 8: 'nz' },   // hands → hanz
'nts': { 1: 'nts', 4: 'ns', 8: 'ns' },   // wants → wans
'lds': { 1: 'lds', 4: 'lz', 8: 'lz' },   // holds → holz
'rds': { 1: 'rds', 4: 'rz', 8: 'rz' },   // words → worz
'mps': { 1: 'mps', 4: 'ms', 8: 'ms' },   // jumps → jums
'nks': { 1: 'nks', 4: 'ngs', 8: 'ngs' }, // thinks → things
'sts': { 1: 'sts', 4: 'ss', 8: 's' },    // lists → liss → lis
'sks': { 1: 'sks', 4: 'sks', 8: 'ss' }   // asks → ass
```

### Special Vowel Contexts

These handle specific vowel patterns in CVCe words:

```typescript
// In vowelPhonemes:
'a_akes': { 1: 'a', 4: 'ae', 8: 'ah' },  // takes → taegz → dahgz
'a_ates': { 1: 'a', 4: 'ae', 8: 'ah' },  // mates → maetz → mahdz
'o_otes': { 1: 'o', 4: 'oh', 8: 'ah' },  // motes → mohtz → mahdz
'o_okes': { 1: 'o', 4: 'oh', 8: 'ah' },  // tokes → tohgz → dahgz
'o_cvce': { 1: 'o', 4: 'u', 8: 'ah' },   // home → hum → hahm
```

### Greek-Origin 'ch' Words

Words where 'ch' makes a /k/ sound are in the exception dictionary:

```typescript
// In exception-words.ts:
'chorus': { 1: 'cho-rus', 4: 'koh-ruz', 8: 'kah-rahz' },
'chemistry': { 1: 'chem-is-try', 4: 'kehm-ihs-tree', 8: 'kahm-ahs-drae' },
'chrome': { 1: 'chrome', 4: 'krohm', 8: 'krahm' },
'chaos': { 1: 'cha-os', 4: 'kah-ahs', 8: 'kah-ahs' },
'character': { 1: 'char-ac-ter', 4: 'kahr-ahk-tehr', 8: 'kahr-ahg-dahr' },
'echo': { 1: 'e-cho', 4: 'eh-koh', 8: 'ah-gah' }
```

## Examples of Common Modifications

### Make "oo" Sound Different

In `vowelPhonemes`:
```typescript
'oo': { 1: 'oo', 4: 'uh', 8: 'ah' }, // Current
'oo': { 1: 'oo', 4: 'oo', 8: 'uh' }, // Modified
```

### Change How "ing" Endings Work

In `morphemePatterns.suffixes`:
```typescript
'ing': { 1: 'ing', 4: 'eeng', 8: 'ahng' }, // Current
'ing': { 1: 'ing', 4: 'in', 8: 'uhn' },    // Modified
```

### Make "th" Stay as "th" at All Levels

In `phoneticPatterns`:
```typescript
'th': { 1: 'th', 4: 'th', 8: 'd' },  // Current
'th': { 1: 'th', 4: 'th', 8: 'th' }, // Modified
```

### Add a New Exception Word

In `exception-words.ts`:
```typescript
'special': { 1: 'spe-cial', 4: 'speh-shul', 8: 'sbeh-zhul' },
```

## Testing Your Changes

1. Run the development server: `npm run dev`
2. Test with sample words at different intensity levels
3. Check that syllable breaks appear correctly
4. Verify CVCe words don't add extra vowels
5. Test similar words to ensure rules apply consistently

## Tips

- Exception words override all rules - use sparingly
- Suffix patterns are checked before general phonetic rules
- CVCe detection happens at the syllable level
- Consonant context matters (initial/medial/final position)
- Test with real song lyrics for best results

## Transformation Flow

### Word Processing Order

1. **Check Exception Dictionary** (`exception-words.ts`)
   - If word exists, use predefined transformations
   - Highest priority - overrides all other rules

2. **Syllable Splitting** (`syllable-splitter.ts`)
   - Split word into natural singing syllables
   - Check for CVCe patterns (silent 'e')
   - Preserve compound words and contractions

3. **Transform Each Syllable** (`transformSyllable()`)
   - Check for suffix patterns (-tion, -ing, etc.)
   - Apply vowel transformations based on context
   - Apply consonant transformations based on position
   - Handle special cases (CVCe, consonant clusters)

4. **Join Syllables**
   - Multi-syllable words always get hyphens
   - Single syllables remain unhyphenated

### Example Transformation

**"condition" at intensity 5 (moderate):**

1. Not in exception dictionary
2. Split: "con" • "di" • "tion"
3. Transform each:
   - "con" → "con" (special rule keeps it unchanged)
   - "di" → "deh" (i → eh at moderate)
   - "tion" → "shuhn" (suffix pattern)
4. Result: "con-deh-shuhn"

### CVCe Pattern Handling

Words ending in silent 'e' are detected and handled specially:

- **Single syllable**: love, make, time → Silent 'e' ignored
- **Multi-syllable ending in CVCe**: handsome → "ome" treated as CVCe
- **CVCes patterns**: mates, takes → Recognized as single syllable

## Notes on Claude

To communicate that a translation fix is needed, use this format:

```bash
I found a translation that needs to be fixed. Here is the correct translation:

Original: emotion
Syllables: e • mo • tion
Minimal: e-mo-tion
Moderate: eh-moh-shun
Maximum: eh-mah-shahn

Could we build a rule from these updates to make sure we catch similar translation issues?
```
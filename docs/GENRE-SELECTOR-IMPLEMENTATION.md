# Genre Selector Feature Implementation Guide

## Overview

The Genre Selector feature allows singers to choose their vocal style (Classical, Pop, Jazz, Musical Theater, etc.) and receive genre-appropriate phonetic transformations. This feature recognizes that different musical genres have distinct vocal techniques, aesthetic preferences, and pronunciation requirements.

## UI Design

### Visual Layout

```
┌─────────────────────────────────────────────┐
│ 🎵 Vocal Style                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Pop/Contemporary                      ▼ │ │
│ └─────────────────────────────────────────┘ │
│ Modern commercial vocal style               │
│ with speech-like delivery                   │
└─────────────────────────────────────────────┘
```

### Placement Options

1. **Above Intensity Selector** (Recommended)
   - Genre affects transformation more than intensity
   - Logical hierarchy: Genre → Intensity → Translation

2. **In Settings Panel**
   - Keep main interface clean
   - Good for advanced users

3. **As Tab Options**
   - Each genre as a tab
   - More visual space but takes more room

### Responsive Design

```tsx
// Mobile: Full width dropdown
<div className="w-full mb-4">
  <GenreSelector />
</div>

// Desktop: Inline with intensity
<div className="flex gap-4 items-start">
  <div className="flex-1">
    <GenreSelector />
  </div>
  <div className="flex-1">
    <IntensitySelector />
  </div>
</div>
```

## Technical Implementation

### 1. Data Structure

#### Genre Configuration Object

```typescript
// lib/data/genre-configs.ts

export interface GenreRule {
  vowelModification: 'minimal' | 'moderate' | 'aggressive' | 'stylistic';
  consonantSoftening: 'minimal' | 'moderate' | 'selective' | 'aggressive';
  preferredVowels?: Record<string, string>;
  specialRules?: {
    preserveContractions?: boolean;
    maintainWordClarity?: boolean;
    enableScatSyllables?: boolean;
    vowelPreference?: 'italian' | 'germanic' | 'neutral';
  };
}

export interface GenreConfig {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rules: GenreRule;
  exampleArtists?: string[];
  // Override specific patterns for this genre
  overrides?: Record<string, Record<number, string>>;
}

export const genreConfigs: Record<string, GenreConfig> = {
  classical: {
    id: 'classical',
    name: 'Classical (Bel Canto)',
    description: 'Traditional operatic technique with pure, open vowels',
    icon: '🎭',
    rules: {
      vowelModification: 'aggressive',
      consonantSoftening: 'minimal',
      preferredVowels: {
        'i': 'ee', // Bright, forward
        'e': 'eh', // Open
        'a': 'ah', // Pure, rounded
        'o': 'oh', // Round, deep
        'u': 'oo', // Very round
      },
      specialRules: {
        vowelPreference: 'italian',
        maintainWordClarity: true,
      }
    },
    exampleArtists: ['Pavarotti', 'Maria Callas', 'Renée Fleming'],
    overrides: {
      'love': { 4: 'loh-veh', 8: 'loh-veh' },
      'heart': { 4: 'hahrt', 8: 'hahrt' },
      'soul': { 4: 'soh-ool', 8: 'soh-ool' },
    }
  },
  
  pop: {
    id: 'pop',
    name: 'Pop/Contemporary',
    description: 'Modern commercial style with conversational delivery',
    icon: '🎤',
    rules: {
      vowelModification: 'moderate',
      consonantSoftening: 'moderate',
      preferredVowels: {
        'ing': 'in', // Relaxed ending
        'er': 'uh',  // Casual
        'a': 'ay',   // Brighter
      },
      specialRules: {
        preserveContractions: true,
        vowelPreference: 'neutral',
      }
    },
    exampleArtists: ['Ariana Grande', 'Ed Sheeran', 'Billie Eilish'],
  },
  
  jazz: {
    id: 'jazz',
    name: 'Jazz',
    description: 'Flexible style with unique vowel colors and phrasing',
    icon: '🎷',
    rules: {
      vowelModification: 'stylistic',
      consonantSoftening: 'selective',
      preferredVowels: {
        'oo': 'uh', // Darker, cooler
        'ee': 'ih', // Relaxed
        'ay': 'ah', // Laid back
      },
      specialRules: {
        enableScatSyllables: true,
      }
    },
    exampleArtists: ['Ella Fitzgerald', 'Frank Sinatra', 'Diana Krall'],
  },
  
  musicalTheater: {
    id: 'musicalTheater',
    name: 'Musical Theater',
    description: 'Clear diction with dramatic expression',
    icon: '🎭',
    rules: {
      vowelModification: 'moderate',
      consonantSoftening: 'selective',
      specialRules: {
        maintainWordClarity: true,
        preserveContractions: true,
      }
    },
    exampleArtists: ['Idina Menzel', 'Jeremy Jordan', 'Patti LuPone'],
  },
  
  rnb: {
    id: 'rnb',
    name: 'R&B/Soul',
    description: 'Smooth, melismatic style with emotional delivery',
    icon: '🎵',
    rules: {
      vowelModification: 'moderate',
      consonantSoftening: 'aggressive',
      preferredVowels: {
        'i': 'ah', // More open
        'ay': 'ah', // Soulful
      },
    },
    exampleArtists: ['Beyoncé', 'John Legend', 'Alicia Keys'],
  },
  
  country: {
    id: 'country',
    name: 'Country',
    description: 'Authentic, twangy delivery with clear storytelling',
    icon: '🤠',
    rules: {
      vowelModification: 'minimal',
      consonantSoftening: 'minimal',
      preferredVowels: {
        'i': 'ah', // Southern drawl
        'ing': 'in\'', // Dropped g
      },
    },
    exampleArtists: ['Dolly Parton', 'Johnny Cash', 'Carrie Underwood'],
  }
};
```

### 2. Component Implementation

#### Genre Selector Component

```tsx
// components/GenreSelector.tsx

import React from 'react';
import { genreConfigs } from '@/lib/data/genre-configs';

interface GenreSelectorProps {
  value: string;
  onChange: (genre: string) => void;
  compact?: boolean;
}

export function GenreSelector({ value, onChange, compact = false }: GenreSelectorProps) {
  const currentGenre = genreConfigs[value] || genreConfigs.pop;
  
  if (compact) {
    // Compact mode for mobile or condensed view
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-300 
                     dark:border-gray-600 bg-white dark:bg-gray-800 
                     focus:ring-2 focus:ring-purple-500"
          aria-label="Select vocal style"
        >
          {Object.values(genreConfigs).map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.icon} {genre.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
  // Full mode with description and examples
  return (
    <div className="genre-selector-container">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{currentGenre.icon}</span>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Vocal Style
        </label>
      </div>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 
                   dark:border-gray-600 bg-white dark:bg-gray-800 
                   hover:border-purple-400 dark:hover:border-purple-600
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                   transition-colors cursor-pointer"
      >
        {Object.values(genreConfigs).map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
      
      <div className="mt-2 space-y-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {currentGenre.description}
        </p>
        {currentGenre.exampleArtists && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            <span className="font-medium">Style examples:</span>{' '}
            {currentGenre.exampleArtists.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
```

### 3. Integration with VocalTranslator

#### Modified VocalTranslator Class

```typescript
// lib/vocal-translator.ts

import { genreConfigs, GenreConfig } from './data/genre-configs';

export class VocalTranslator {
  private genre: string;
  private genreConfig: GenreConfig;
  
  constructor(genre: string = 'pop') {
    this.genre = genre;
    this.genreConfig = genreConfigs[genre] || genreConfigs.pop;
  }
  
  setGenre(genre: string) {
    this.genre = genre;
    this.genreConfig = genreConfigs[genre] || genreConfigs.pop;
  }
  
  transformWord(word: string, intensity: number): string {
    // Check genre-specific overrides first
    const override = this.genreConfig.overrides?.[word.toLowerCase()];
    if (override && override[intensity]) {
      return override[intensity].toUpperCase();
    }
    
    // Apply genre-specific rules
    let result = word;
    
    // Adjust intensity based on genre vowel modification preference
    const adjustedIntensity = this.adjustGenreIntensity(intensity);
    
    // Apply transformations with genre rules
    result = this.applyGenreTransformations(result, adjustedIntensity);
    
    return result.toUpperCase();
  }
  
  private adjustGenreIntensity(intensity: number): number {
    const { vowelModification } = this.genreConfig.rules;
    
    switch (vowelModification) {
      case 'minimal':
        return Math.max(1, intensity - 2);
      case 'aggressive':
        return Math.min(10, intensity + 2);
      case 'stylistic':
        // Jazz keeps original but adds style
        return intensity;
      default:
        return intensity;
    }
  }
  
  private applyGenreTransformations(word: string, intensity: number): string {
    const { rules } = this.genreConfig;
    let result = word;
    
    // Apply preferred vowels for this genre
    if (rules.preferredVowels) {
      for (const [pattern, replacement] of Object.entries(rules.preferredVowels)) {
        if (intensity >= 4) {
          result = result.replace(new RegExp(pattern, 'gi'), replacement);
        }
      }
    }
    
    // Apply special rules
    if (rules.specialRules?.preserveContractions && word.includes("'")) {
      // Keep contractions more natural for pop/musical theater
      return this.handleContractionGenre(word, intensity);
    }
    
    if (rules.specialRules?.enableScatSyllables && intensity >= 8) {
      // Add jazz scat possibilities
      result = this.addJazzInflection(result);
    }
    
    // Continue with standard transformations
    return this.standardTransform(result, intensity);
  }
  
  private addJazzInflection(word: string): string {
    // Add jazz-specific endings and inflections
    if (word.endsWith('ing')) {
      return word.replace(/ing$/, "in'");
    }
    if (word.endsWith('y')) {
      return word.replace(/y$/, 'eh');
    }
    return word;
  }
}
```

### 4. State Management

#### Local Storage Integration

```typescript
// lib/local-storage-utils.ts

const GENRE_KEY = 'vtt-genre';

export function saveGenre(genre: string): void {
  try {
    localStorage.setItem(GENRE_KEY, genre);
  } catch (e) {
    console.error('Failed to save genre preference:', e);
  }
}

export function loadGenre(): string {
  try {
    return localStorage.getItem(GENRE_KEY) || 'pop';
  } catch (e) {
    console.error('Failed to load genre preference:', e);
    return 'pop';
  }
}
```

#### React Hook

```typescript
// hooks/useGenre.ts

import { useState, useEffect } from 'react';
import { saveGenre, loadGenre } from '@/lib/local-storage-utils';

export function useGenre() {
  const [genre, setGenreState] = useState<string>('pop');
  
  useEffect(() => {
    // Load saved genre on mount
    const saved = loadGenre();
    setGenreState(saved);
  }, []);
  
  const setGenre = (newGenre: string) => {
    setGenreState(newGenre);
    saveGenre(newGenre);
  };
  
  return { genre, setGenre };
}
```

### 5. Integration in Main App

```tsx
// components/GeniusStyleLayout.tsx (simplified)

export default function GeniusStyleLayout() {
  const { genre, setGenre } = useGenre();
  const [translator] = useState(() => new VocalTranslator(genre));
  
  // Update translator when genre changes
  useEffect(() => {
    translator.setGenre(genre);
    // Re-translate current lyrics if any
    if (inputLyrics) {
      handleTranslation();
    }
  }, [genre]);
  
  return (
    <div className="container">
      {/* Genre and Intensity Controls */}
      <div className="controls-section grid md:grid-cols-2 gap-4 mb-6">
        <GenreSelector 
          value={genre} 
          onChange={setGenre}
          compact={isCondensedView}
        />
        <IntensitySelector 
          value={intensity} 
          onChange={setIntensity}
        />
      </div>
      
      {/* Rest of the app */}
    </div>
  );
}
```

## Testing Strategy

### Unit Tests

```typescript
// lib/__tests__/genre-configs.test.ts

describe('Genre Configurations', () => {
  it('should have all required fields for each genre', () => {
    Object.values(genreConfigs).forEach(config => {
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('rules');
      expect(config.rules).toHaveProperty('vowelModification');
      expect(config.rules).toHaveProperty('consonantSoftening');
    });
  });
  
  it('should apply classical genre rules correctly', () => {
    const translator = new VocalTranslator('classical');
    expect(translator.transformWord('love', 8)).toBe('LOH-VEH');
  });
  
  it('should preserve contractions in pop genre', () => {
    const translator = new VocalTranslator('pop');
    expect(translator.transformWord("don't", 5)).toBe("DOHNT");
  });
});
```

### E2E Tests

```typescript
// e2e/tests/genre-selector.spec.ts

test('should change transformations when genre changes', async ({ page }) => {
  await page.goto('/');
  
  // Enter test lyrics
  await page.fill('[data-testid="lyrics-input"]', 'love');
  
  // Select classical genre
  await page.selectOption('[aria-label="Select vocal style"]', 'classical');
  
  // Check transformation changed
  const translation = await page.textContent('[data-testid="translation-output"]');
  expect(translation).toContain('LOH-VEH');
  
  // Switch to jazz
  await page.selectOption('[aria-label="Select vocal style"]', 'jazz');
  
  // Check transformation changed again
  const jazzTranslation = await page.textContent('[data-testid="translation-output"]');
  expect(jazzTranslation).not.toBe(translation);
});
```

## Accessibility Considerations

1. **Keyboard Navigation**
   - Genre selector fully keyboard accessible
   - Arrow keys to navigate options
   - Enter to select

2. **Screen Reader Support**
   - Proper ARIA labels
   - Genre descriptions announced
   - Change announcements

3. **Visual Design**
   - High contrast options
   - Clear visual hierarchy
   - Genre icons are decorative (not required)

## Performance Considerations

1. **Lazy Loading**
   - Load genre configs on demand
   - Could split large exception dictionaries

2. **Caching**
   - Cache transformed results per genre
   - Clear cache on genre change

3. **Bundle Size**
   - Genre configs ~5KB
   - Consider code splitting if adding audio examples

## Future Enhancements

### Phase 1: Enhanced Genre Features
- Sub-genres (e.g., Opera vs. Art Song, Bebop vs. Smooth Jazz)
- Custom genre creation for teachers
- Genre blending (e.g., 70% Pop, 30% Classical)

### Phase 2: Educational Features
- Audio examples for each genre
- "Sing like..." celebrity voice matching
- Genre-specific warm-up exercises
- Historical context for each style

### Phase 3: Advanced Integration
- MIDI tempo sync for different genres
- Genre-specific breathing mark suggestions
- Performance tips for each style
- Integration with sheet music (style markings)

### Phase 4: AI Enhancement
- Auto-detect genre from lyrics
- Suggest best genre for song
- Learn user's preferred style mix
- Regional dialect options within genres

## Implementation Timeline

1. **Week 1**: Core data structure and configuration
2. **Week 2**: UI component and integration
3. **Week 3**: Genre-specific transformation rules
4. **Week 4**: Testing and refinement
5. **Week 5**: Documentation and examples
6. **Week 6**: Beta testing with vocal coaches

## Conclusion

The Genre Selector feature transforms the Vocal Technique Translator from a one-size-fits-all tool into a versatile platform that respects the unique requirements of different musical styles. By implementing genre-specific rules while maintaining the core transformation engine, we can serve singers across all musical genres while helping them maintain proper vocal technique within their chosen style.
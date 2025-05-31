# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Vocal Technique Translator is a Next.js web application that transforms song lyrics into phonetic representations to help singers maintain proper vocal technique. The project uses a syllable-based approach where words are split into syllables before transformation, ensuring natural break points for singing.

## Architecture

This is a modern Next.js application with TypeScript:

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom color palette
- **Deployment**: AWS CDK infrastructure
- **Processing**: Client-side transformation for privacy

### Key Components

- **VocalTranslator Class** (`lib/vocal-translator.ts`): Main transformation engine
- **SyllableSplitter Class** (`lib/utils/syllable-splitter.ts`): Advanced syllable detection with linguistic rules
- **Exception Dictionary** (`lib/data/exception-words.ts`): 650+ pre-defined word transformations
- **Phonetic Patterns** (`lib/data/phonetic-patterns.ts`): Rule-based transformations for vowels, consonants, and clusters
- **UI Components**: React components for interactive translation interface

## Core Transformation Philosophy

The system uses a "Syllable-Based Technique" approach:

### Transformation Flow
1. **Syllable Splitting First**: Words are split into syllables BEFORE any transformation
2. **Independent Processing**: Each syllable is transformed independently based on its own context
3. **Progressive Intensity**:
   - Levels 1-3 (Minimal): Original syllables with hyphens, no phonetic changes
   - Levels 4-7 (Moderate): Medium transformation per syllable with hyphens
   - Levels 8-10 (Full): Maximum transformation per syllable with hyphens

### Rule Hierarchy
1. **Exception Dictionary**: Pre-defined transformations for common words (highest priority)
2. **Suffix Patterns**: Common endings like -tion → shuhn/shahn
3. **Phonetic Patterns**: Consonant clusters (nds → nz), vowel teams, etc.
4. **CVCe Detection**: Silent 'e' patterns handled specially (love → lahv, not lahveh)
5. **Context Rules**: Consonant and vowel transformations based on position

## Key Features to Maintain

### Exception Dictionary System
- 650+ common words with intensity-specific transformations
- Handles contractions (you'll → youll → YAH-LL)
- Preserves abbreviations (L.A. remains unchanged)
- Song-specific vocabulary with natural phonetic representations

### Intelligent Processing
- **Syllable Detection**: Advanced algorithm handles CVCe patterns, vowel teams, consonant blends
- **Context-Sensitive Transformations**: Consonants transform differently at syllable start/middle/end
- **Pattern Recognition**: Automatic handling of suffixes (-tion, -ment), prefixes, and clusters
- **CVCe Awareness**: Special vowel handling in silent 'e' contexts (home → hum at moderate)

### Transformation Rules
- **Always Show Syllables**: Multi-syllable words always display with hyphens
- **Progressive Changes**: Each intensity level builds on the previous
- **Consonant Clusters**: Simplify for easier singing (hands → hanz)
- **Suffix Recognition**: Common endings transform predictably (-tion → shuhn)
- **Silent E Handling**: No extra vowel sounds added (love → lahv, not lahveh)

## Development Guidelines

### When Adding New Features
- Test with the provided example lyrics ("Blue jean baby, L.A. lady...")
- Ensure readability is maintained at all intensity levels
- Verify exception dictionary takes precedence over pattern matching
- Test abbreviation and contraction handling

### Code Organization
- Exception dictionary should remain the primary transformation method
- Pattern-based rules serve as fallbacks
- Error handling should gracefully degrade to simple transformations
- Maintain single-file architecture for portability

### Testing Approach
- Use real song lyrics for validation
- Compare outputs at different intensity levels
- Verify consistent behavior (same input = same output)
- Check that transformations build progressively (level 8 includes level 4 changes)

## Performance Characteristics
- Target <50ms processing for typical song lyrics
- Memory usage <2MB for full application
- Single HTML file deployment (~45KB)
- No external dependencies or build process required

## Brand Color Palette

The Vocal Technique Translator uses a carefully curated color palette. These colors should be used consistently throughout the application:

### Official Brand Colors

- **Primary**: `#9436eb` (Purple) - Main brand color for primary actions, buttons, and key UI elements
- **Secondary**: `#2196f3` (Blue) - Secondary actions, links, and complementary elements
- **Accent**: `#ec4899` (Pink) - Highlights, special features, and emphasis
- **Neutral**: `#9ca3af` (Gray-400) - Base neutral for text, borders, and backgrounds

### Usage Guidelines
- These colors are defined as CSS variables in `app/globals.css`
- Use `var(--primary)`, `var(--secondary)`, `var(--accent)`, and `var(--neutral)` in CSS
- For Tailwind classes, use the corresponding color families:
  - Primary: `purple-500`, `purple-600`, `purple-700`
  - Secondary: `blue-500`, `blue-600`
  - Accent: `pink-500`
  - Neutral: `gray-400`
- Maintain color consistency across light and dark themes

## Important Development Notes
- **Environment Variables**: This project uses `.env` file (NOT `.env.local`) for configuration
- The `.env` file contains AWS credentials, Google Analytics ID, and AdSense configuration
- Always update `.env` file for new environment variables, not `.env.local`
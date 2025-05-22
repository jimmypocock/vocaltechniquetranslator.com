# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Vocal Technique Translator is a single-file web application that transforms song lyrics into phonetic representations to help singers maintain proper vocal technique. The project emphasizes readability while providing vocal benefits through strategic vowel modifications and consonant softening.

## Architecture

This is a self-contained HTML application with embedded CSS and JavaScript:

- **Single File Structure**: All code is contained in `index.html` 
- **No Dependencies**: Uses vanilla JavaScript with no external libraries
- **Client-Side Only**: All processing happens in the browser
- **Exception-Driven**: Core functionality relies on a comprehensive exception dictionary for common words

### Key Components

- **VocalTranslator Class**: Main transformation engine with linguistic intelligence
- **Exception Dictionary**: 650+ pre-defined word transformations across intensity levels
- **Morphological Analysis**: Handles prefixes, suffixes, and compound words
- **Syllable Detection**: Intelligent syllable boundary identification
- **Context-Sensitive Rules**: Different transformations based on phonetic context

## Core Transformation Philosophy

The system uses a "Readable Technique" approach:
1. **Readability First**: Transformations maintain word recognition
2. **Conservative Scaling**: Intensity levels 1-3 minimal, 4-5 conservative, 6-7 moderate, 8-10 full technique
3. **Exception Priority**: Common words use pre-defined phonetic representations
4. **Strategic Enhancement**: Target specific vocal challenges without overwhelming changes

## Key Features to Maintain

### Exception Dictionary System
- 650+ common words with intensity-specific transformations
- Handles contractions (you'll → youll → YAH-LL)
- Preserves abbreviations (L.A. remains unchanged)
- Song-specific vocabulary with natural phonetic representations

### Intelligent Processing
- Morphological analysis for prefixes/suffixes
- Context-sensitive consonant transformations
- Position-aware syllable breaks (only at intensity 8+ for 6+ character words)
- Phoneme-based vowel modifications

### Conservative Transformation Rules
- Single-pass processing prevents over-transformation
- Position tracking system avoids double modifications
- Intensity-gated features (consonant softening only at level 8+)
- Fallback mechanisms for edge cases

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
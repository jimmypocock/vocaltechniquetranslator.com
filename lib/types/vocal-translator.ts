// Type definitions for the Vocal Technique Translator

export type IntensityLevel = 1 | 4 | 8;

export interface IntensityTransformations {
  1: string;
  4: string;
  8: string;
}

export interface VowelPhoneme {
  [key: string]: IntensityTransformations;
}

export interface ConsonantContext {
  syllableInitial?: IntensityTransformations;
  intervocalic?: IntensityTransformations;
  syllableFinal?: IntensityTransformations;
  beforeConsonant?: IntensityTransformations;
}

export interface ConsonantRules {
  [consonant: string]: ConsonantContext;
}

export interface MorphemePattern {
  [morpheme: string]: IntensityTransformations;
}

export interface MorphemePatterns {
  suffixes: MorphemePattern;
  prefixes: MorphemePattern;
}

export interface PhoneticPattern {
  [pattern: string]: IntensityTransformations;
}

export interface VowelPattern {
  sound: string;
  context: string;
}

export interface VowelPatterns {
  [pattern: string]: VowelPattern;
}

export interface InitialCluster {
  [cluster: string]: IntensityTransformations;
}

export interface ExceptionWord {
  [word: string]: IntensityTransformations;
}

export interface MorphologyAnalysis {
  prefix: string;
  root: string;
  suffix: string;
  compound: boolean;
}
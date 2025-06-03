'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Translator
          </Link>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            How the Vocal Translator Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transform lyrics into singer-friendly phonetics using advanced linguistic analysis
          </p>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg p-1 border border-purple-200/50 dark:border-purple-800/50">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-300 dark:border-purple-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('technique')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === 'technique'
                  ? 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-300 dark:border-purple-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              The Technique
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === 'examples'
                  ? 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-300 dark:border-purple-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Examples
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === 'tips'
                  ? 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-300 dark:border-purple-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Pro Tips
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === 'shortcuts'
                  ? 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-300 dark:border-purple-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Shortcuts
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">What Is Vocal Translation?</h2>
                  <p className="text-base text-muted-foreground mb-4">
                    Vocal translation is a technique that transforms regular English lyrics using our custom phonetic system
                    designed specifically for singers. It&apos;s like having a vocal coach whisper in your ear exactly
                    how to pronounce each word for optimal vocal performance, without the complexity of traditional IPA.
                  </p>
                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold mb-2">The Core Principle</h3>
                    <p className="text-sm text-muted-foreground">
                      Instead of fighting against difficult sounds, we transform them into singer-friendly alternatives
                      while maintaining the essence and recognizability of the original lyrics.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">The Science Behind It</h2>
                  <p className="text-base text-muted-foreground mb-4">
                    Our algorithm uses a syllable-first approach with multiple layers of analysis:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/10 border border-muted/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">1. Syllable Splitting First</h3>
                      <p className="text-sm text-muted-foreground">
                        Words are broken into syllables before any transformation, ensuring natural break points for singing
                      </p>
                    </div>
                    <div className="bg-muted/10 border border-muted/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">2. Exception Dictionary</h3>
                      <p className="text-sm text-muted-foreground">
                        Over 650 common words have hand-crafted transformations based on professional vocal technique
                      </p>
                    </div>
                    <div className="bg-muted/10 border border-muted/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">3. Phonetic Patterns</h3>
                      <p className="text-sm text-muted-foreground">
                        Recognition of consonant clusters, diphthongs, and silent letters for accurate transformation
                      </p>
                    </div>
                    <div className="bg-muted/10 border border-muted/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">4. Context Awareness</h3>
                      <p className="text-sm text-muted-foreground">
                        Different rules apply based on where sounds appear in a word or syllable
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Intensity Levels Explained</h2>
                  <p className="text-base text-muted-foreground mb-4">
                    Choose from three intensity levels to control how much transformation to apply:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-20 text-sm font-semibold text-muted-foreground">Minimal</div>
                      <div className="flex-1">
                        <div className="font-semibold">🌱 Syllable Foundation</div>
                        <div className="text-sm text-muted-foreground">Words are broken into syllables with minimal phonetic changes. Perfect for beginners to practice syllable separation.</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-20 text-sm font-semibold text-muted-foreground">Moderate</div>
                      <div className="flex-1">
                        <div className="font-semibold">🌿 Balanced Technique</div>
                        <div className="text-sm text-muted-foreground">A sweet spot that improves vocal health without sacrificing too much clarity. Ideal for most singing situations.</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-20 text-sm font-semibold text-muted-foreground">Maximum</div>
                      <div className="flex-1">
                        <div className="font-semibold">🌳 Full Transformation</div>
                        <div className="text-sm text-muted-foreground">Complete vocal technique with syllable separation and all modifications. Best for challenging songs or professional performance.</div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'technique' && (
              <>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Core Transformation Rules</h2>
                  <p className="text-base text-muted-foreground mb-4">
                    The translator applies these key techniques to make singing easier:
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Diphthong Management</h3>
                  <p className="text-base text-muted-foreground mb-4">
                    Diphthongs (two-vowel sounds) are the trickiest part of singing. We transform them to hold the first sound longer:
                  </p>
                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-4 space-y-2 font-mono text-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-muted-foreground">Original</div>
                      <div>→</div>
                      <div className="text-primary">Transformed</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>I</div>
                      <div>→</div>
                      <div>AH-ee (90% AH)</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>time</div>
                      <div>→</div>
                      <div>TAH-eem</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>day</div>
                      <div>→</div>
                      <div>DEH-ee</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Consonant Softening</h3>
                  <p className="text-base text-muted-foreground mb-4">
                    Hard consonants create tension. We soften them based on their position:
                  </p>
                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-4 space-y-2 font-mono text-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-muted-foreground">Hard Sound</div>
                      <div>→</div>
                      <div className="text-primary">Soft Alternative</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>T (final)</div>
                      <div>→</div>
                      <div>D or silent</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>K</div>
                      <div>→</div>
                      <div>G (softer)</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>P</div>
                      <div>→</div>
                      <div>B (voiced)</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. Vowel Opening</h3>
                  <p className="text-base text-muted-foreground mb-4">
                    Closed vowels create strain. We open them for better resonance:
                  </p>
                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-4 space-y-2 font-mono text-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-muted-foreground">Closed Vowel</div>
                      <div>→</div>
                      <div className="text-primary">Open Alternative</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>i (sit)</div>
                      <div>→</div>
                      <div>ih or eh</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>e (bed)</div>
                      <div>→</div>
                      <div>eh (more open)</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>u (but)</div>
                      <div>→</div>
                      <div>uh (neutral)</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Cluster Simplification</h3>
                  <p className="text-base text-muted-foreground mb-4">
                    Consonant clusters are broken up or simplified:
                  </p>
                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-4 space-y-2 font-mono text-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-muted-foreground">Cluster</div>
                      <div>→</div>
                      <div className="text-primary">Simplified</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>str (street)</div>
                      <div>→</div>
                      <div>s-tr (quick)</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>spl (split)</div>
                      <div>→</div>
                      <div>s-pl</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>ght (night)</div>
                      <div>→</div>
                      <div>t (silent gh)</div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'examples' && (
              <>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Real Song Examples</h2>
                  <p className="text-base text-muted-foreground mb-4">
                    See how popular song lyrics transform at different intensity levels:
                  </p>
                </section>

                <section className="space-y-6">
                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">&quot;I will always love you&quot;</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌱 Minimal:</div>
                        <div className="text-primary">I will al-ways love you</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌿 Moderate:</div>
                        <div className="text-primary">AH wehl ahl-wehz luv yoo</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌳 Maximum:</div>
                        <div className="text-primary">AE wahl ahl-waez lahv yah</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">&quot;Don&apos;t stop believing&quot;</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌱 Minimal:</div>
                        <div className="text-primary">dont stop be-li-ev-ing</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌿 Moderate:</div>
                        <div className="text-primary">dohnt stahp beh-leh-ehv-eeng</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌳 Maximum:</div>
                        <div className="text-primary">dohnt zdahp beh-lah-ehv-ahng</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">&quot;Somewhere over the rainbow&quot;</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌱 Minimal:</div>
                        <div className="text-primary">Some-where o-ver the rain-bow</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌿 Moderate:</div>
                        <div className="text-primary">Sohm-wehr oh-vuhr dhuh rehn-bah</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-muted-foreground">🌳 Maximum:</div>
                        <div className="text-primary">Zah-wehr ah-vahr duh raen-bah</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Common Word Transformations</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/10 border border-muted/20 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Pronouns</h4>
                      <div className="space-y-1 font-mono text-sm">
                        <div>I → ah → AH</div>
                        <div>you → yoo → YAH</div>
                        <div>me → mee → MEE</div>
                        <div>we → wee → WEE</div>
                      </div>
                    </div>
                    <div className="bg-muted/10 border border-muted/20 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Common Verbs</h4>
                      <div className="space-y-1 font-mono text-sm">
                        <div>love → luhv → LUHV</div>
                        <div>want → wahnt → WAHN</div>
                        <div>need → need → NEE</div>
                        <div>feel → feel → FEE-uhl</div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'tips' && (
              <>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Pro Tips for Better Singing</h2>
                  <p className="text-base text-muted-foreground mb-4">
                    Get the most out of the Vocal Translator with these professional techniques:
                  </p>
                </section>

                <section className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <span className="text-2xl mr-3">💡</span>
                      Start Conservative
                    </h3>
                    <p className="text-base text-muted-foreground">
                      Begin with Moderate intensity (🌿). This gives you noticeable improvements without overwhelming changes.
                      You can always increase to Full intensity (🌳) as you get comfortable.
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <span className="text-2xl mr-3">🎯</span>
                      Focus on Diphthongs
                    </h3>
                    <p className="text-base text-muted-foreground">
                      Words with &quot;I&quot; sounds (like, time, night) and &quot;AY&quot; sounds (say, way, day) are the most challenging.
                      Practice holding the first vowel sound for 80-90% of the note duration.
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <span className="text-2xl mr-3">🎵</span>
                      Adjust for Pitch
                    </h3>
                    <p className="text-base text-muted-foreground">
                      Higher notes need more open vowels. When singing above your comfortable range, increase the intensity
                      level or manually open the vowels more than indicated.
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <span className="text-2xl mr-3">🎤</span>
                      Keep It Musical
                    </h3>
                    <p className="text-base text-muted-foreground">
                      The transformations are guidelines, not rules. Always prioritize musicality and emotional expression.
                      If a transformation doesn&apos;t feel right, trust your instincts.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4">Quick Reference</h3>
                  <div className="bg-muted/10 border border-muted/20 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">The Golden Rules of Vocal Technique</h4>
                    <ol className="space-y-2 list-decimal list-inside text-base text-muted-foreground">
                      <li>Diphthongs: Hold the first vowel for 80-90% of the note</li>
                      <li>Consonant clusters: Make them quick and light</li>
                      <li>Word endings: Release gently, never cut off hard</li>
                      <li>Word beginnings: Start with air, not from your throat</li>
                      <li>High notes: Open vowels more than indicated</li>
                      <li>Breathing: Take breaths at punctuation marks</li>
                    </ol>
                  </div>
                </section>

                <section className="mt-12 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    Ready to transform your singing?
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Try the Vocal Translator
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </section>
              </>
            )}

            {activeTab === 'shortcuts' && (
              <>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Keyboard Shortcuts</h2>
                  <p className="text-base text-muted-foreground mb-4">
                    Navigate the Vocal Translator faster with these handy keyboard shortcuts.
                    Press <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">?</kbd> at any time to see this list.
                  </p>
                </section>

                <section className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Navigation & Input</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">Ctrl+K</kbd>
                        <span className="text-sm text-muted-foreground">Focus on lyrics input</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">Ctrl+Enter</kbd>
                        <span className="text-sm text-muted-foreground">Copy translated lyrics</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">H</kbd>
                        <span className="text-sm text-muted-foreground">Go to How It Works</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">View Controls</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">V</kbd>
                        <span className="text-sm text-muted-foreground">Toggle continuous ↔ word-by-word view</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">U</kbd>
                        <span className="text-sm text-muted-foreground">Toggle uppercase</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Intensity Levels</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">1</kbd>
                        <span className="text-sm text-muted-foreground">Set to Minimal intensity</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">2</kbd>
                        <span className="text-sm text-muted-foreground">Set to Moderate intensity</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">3</kbd>
                        <span className="text-sm text-muted-foreground">Set to Full intensity</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Help & Info</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">?</kbd>
                        <span className="text-sm text-muted-foreground">Show keyboard shortcuts</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg">
                        <kbd className="text-sm font-mono">Esc</kbd>
                        <span className="text-sm text-muted-foreground">Close modals</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mt-8">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <span className="text-2xl mr-3">💡</span>
                      Pro Tip: Efficiency First
                    </h3>
                    <p className="text-base text-muted-foreground">
                      These shortcuts are designed to keep your hands on the keyboard while working with lyrics.
                      The most useful ones are the intensity controls (1, 2, 3) and the quick copy (Ctrl+Enter).
                    </p>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Vocal Technique Translator',
  description: 'Learn about the Vocal Technique Translator - a revolutionary phonetic tool for singers and voice teachers. Discover our mission, technology, and the creator behind the innovation.',
  keywords: 'about vocal technique translator, phonetic transformation, singing tool, voice training technology, Jimmy Pocock',
  alternates: {
    canonical: 'https://www.vocaltechniquetranslator.com/about',
  },
  openGraph: {
    title: 'About Vocal Technique Translator',
    description: 'Discover the technology and mission behind the revolutionary phonetic tool that\'s transforming how singers learn proper vocal technique.',
    url: 'https://www.vocaltechniquetranslator.com/about',
    type: 'website',
  },
}

export default function AboutPage() {
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
            About Vocal Technique Translator
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Empowering singers with better vocal health through intelligent phonetic translation
          </p>

          <div className="space-y-12">
            {/* Mission Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Our Mission
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-base text-muted-foreground">
                  We&apos;re revolutionizing vocal training by making professional singing techniques instantly accessible to teachers and students worldwide. Our tool transforms any song into a powerful learning experience, bridging the gap between vocal theory and the music people love to sing.
                </p>
              </div>
            </section>

            {/* Story Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Why We Built This
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-base text-muted-foreground mb-4">
                  Every vocal teacher knows the moment: a student brings in their favorite song, eyes bright with excitement, ready to tackle those challenging notes. But between enthusiasm and execution lies a complex challenge—how do you help them apply proper vowel placement and syllable technique to contemporary music?
                </p>
                <p className="text-base text-muted-foreground mb-4">
                  Traditional vocal training often feels disconnected from the songs students actually want to perform. Teachers spend countless hours manually converting lyrics into phonetic syllables, crafting custom exercises for each piece. It&apos;s time-consuming work that limits how many songs students can properly learn.
                </p>
                <p className="text-base text-muted-foreground">
                  That&apos;s why we created the Vocal Technique Translator. Born from watching dedicated vocal coaches laboriously transcribe song after song, we&apos;ve automated this essential teaching process. Now, what once took hours happens in seconds—giving teachers more time to focus on what matters most: helping students find their voice.
                </p>
              </div>
            </section>

            {/* Who We Serve Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Who We Serve
              </h2>

              {/* Professional Educators */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-300">Professional Educators</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Vocal Teachers & Coaches</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transform lesson planning from hours to minutes while maintaining pedagogical excellence
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Choir Directors</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quickly prepare phonetic guides for entire repertoires, ensuring consistent technique across all voice parts
                    </p>
                  </div>
                </div>
              </div>

              {/* Performers */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-300">Performers at Every Level</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Professional Singers</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fine-tune challenging passages with precision vowel placement
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Aspiring Artists</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bridge the gap between technique classes and real-world performance
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Backup Vocalists</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Master blend and consistency through proper syllable formation
                    </p>
                  </div>
                </div>
              </div>

              {/* Music Enthusiasts */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-300">Music Enthusiasts</h3>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Whether you&apos;re preparing for an audition, leading worship, or simply wanting to nail that karaoke performance, our tool helps you understand not just what to sing, but <em className="text-purple-600 dark:text-purple-300">how</em> to sing it.
                </p>
              </div>
            </section>

            {/* Technology Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Our Technology
              </h2>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-300">Innovation in Vocal Pedagogy</h3>
                <p className="text-base text-muted-foreground mb-6">
                  A syllable-based phonetic transformation engine designed specifically for singers. Here&apos;s what makes it revolutionary:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🎯</span>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">Precision-Crafted Intelligence</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our system features hand-selected vowel transformations and consonant rules. Each transformation prioritizes how words actually feel when sung, not just how they look on paper.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🎵</span>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Natural Syllable Recognition</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unlike basic text processors, our advanced algorithm thinks like a singer—identifying natural breath points, recognizing CVCe patterns, vowel teams, compound words, and preserving musical flow.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/30 rounded-lg p-6 border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🎚️</span>
                    <h4 className="font-semibold text-pink-700 dark:text-pink-300">Progressive Intensity Control</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Choose your challenge level with our multi-level system:
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li><strong>Minimum:</strong> Perfect for beginners, maintaining original syllables with helpful hyphenation</li>
                    <li><strong>Moderate:</strong> Targeted adjustments for developing technique</li>
                    <li><strong>Maximum:</strong> Complete vocal transformations for advanced training</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">⚡</span>
                    <h4 className="font-semibold text-green-700 dark:text-green-300">Lightning-Fast & Private</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Process entire songs in under 50 milliseconds, with all transformations happening directly in your browser. Your repertoire stays completely private—no data ever leaves your device.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🧠</span>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300">Context-Aware Processing</h4>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  With 31 vowel transformations and 44 consonant rules that adapt based on position and surrounding sounds, our engine mimics how professional singers naturally adjust their pronunciation for optimal resonance and clarity.
                </p>
              </div>
            </section>

            {/* Creator Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Meet the Creator
              </h2>
              
              <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-pink-900/20 rounded-xl p-8 border border-purple-200 dark:border-purple-800">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      JP
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2 text-purple-700 dark:text-purple-300">Jimmy Pocock</h3>
                    <p className="text-lg text-purple-600 dark:text-purple-400 mb-4 font-medium">Professional Application Engineer, Amateur Singer</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-purple-500">💻</span>
                        <span className="text-base text-gray-600 dark:text-gray-400">Building apps for 10 years</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-blue-500">🎸</span>
                        <span className="text-base text-gray-600 dark:text-gray-400">Playing guitar for 25 years</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-pink-500">🎤</span>
                        <span className="text-base text-gray-600 dark:text-gray-400">Singing since I could talk, understanding vocal technique for 2 years</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <a
                        href="https://www.jimmypocock.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-200 text-sm text-purple-700 dark:text-purple-300"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Visit Website
                      </a>
                      <a
                        href="mailto:jimmycpocock+VTT@gmail.com"
                        className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-all duration-200 text-sm text-blue-700 dark:text-blue-300"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Get in Touch
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left italic">
                    &quot;Combining a decade of software engineering experience with a recent deep dive into vocal pedagogy, I created this tool to bridge the gap between technical innovation and musical education.&quot;
                  </p>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center py-12 mt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to Transform Your Vocal Training?
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Visit <a href="https://www.vocaltechniquetranslator.com/" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">vocaltechniquetranslator.com</a> to experience the future of singing education.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:scale-105 transition-all duration-200 text-lg"
                >
                  Try the Vocal Translator
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
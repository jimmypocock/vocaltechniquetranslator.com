'use client'

import Link from 'next/link'

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
                  [Your mission statement here - why you created this tool, what problem it solves]
                </p>
              </div>
            </section>

            {/* Story Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                The Story Behind VTT
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-base text-muted-foreground">
                  [How this project came to be - personal story, inspiration, journey]
                </p>
              </div>
            </section>

            {/* Who It's For Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Who This Is For
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Professional Singers</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    [How professionals can benefit]
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Voice Teachers</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    [How teachers can use this tool]
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Choir Directors</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    [Benefits for choir work]
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Aspiring Vocalists</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    [How beginners can learn proper technique]
                  </p>
                </div>
              </div>
            </section>

            {/* Technology Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                The Technology
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-base text-muted-foreground mb-4">
                  [Brief overview of the linguistic analysis and vocal technique principles]
                </p>
                <ul className="list-disc list-inside text-base text-muted-foreground space-y-2">
                  <li>600+ hand-crafted word transformations</li>
                  <li>Advanced morphological analysis</li>
                  <li>Context-aware phonetic rules</li>
                  <li>Three intensity levels for different needs</li>
                </ul>
              </div>
            </section>

            {/* Team/Creator Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Meet the Creator
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-base text-muted-foreground">
                  [Your bio, background, credentials]
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Get in Touch
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-base text-muted-foreground mb-4">
                  Have questions, suggestions, or feedback? We&apos;d love to hear from you!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:[jimmycpocock+VocalTechniqueTranslatorGIT@gmail.com]"
                    className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-all duration-200 text-sm text-purple-700 dark:text-purple-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Us
                  </a>
                  {/* Add more contact methods as needed */}
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Ready to Transform Your Singing?</h3>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 hover:shadow-md hover:scale-105 transition-all duration-200"
              >
                Try the Vocal Translator
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
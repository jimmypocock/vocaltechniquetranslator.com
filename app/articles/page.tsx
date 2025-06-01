'use client'

import Link from 'next/link'
import { useState } from 'react'

// This will eventually come from a CMS or markdown files
const articles = [
  {
    id: 'beyond-water-singers-nutrition',
    title: 'Beyond Water: The Complete Singer\'s Nutrition and Hydration Science',
    excerpt: 'Cutting-edge research reveals why "just drink water" oversimplifies vocal health. Learn evidence-based nutrition strategies that actually support vocal excellence.',
    category: 'Health',
    readTime: '12 min read',
    publishedAt: '2024-12-15',
    featured: true,
    author: 'Jimmy Pocock'
  },
  {
    id: 'hybrid-voice-teacher-business',
    title: 'The Hybrid Voice Teacher\'s Business Blueprint',
    excerpt: 'Master the five essential elements of successful hybrid voice teaching: technology, pricing, scheduling, revenue diversification, and emerging trends.',
    category: 'Business',
    readTime: '15 min read',
    publishedAt: '2024-12-10',
    featured: true,
    author: 'Jimmy Pocock'
  },
  {
    id: 'vocal-biomarkers-voice-teachers',
    title: 'Vocal biomarkers: A game-changer for voice teachers',
    excerpt: 'Discover how AI-powered vocal biomarkers are revolutionizing voice teaching through objective health monitoring and evidence-based pedagogy.',
    category: 'Technology',
    readTime: '10 min read',
    publishedAt: '2024-12-05',
    featured: false,
    author: 'Jimmy Pocock'
  }
]

const categories = ['All', 'Health', 'Business', 'Technology', 'Technique']

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredArticles = articles.filter(article => article.featured)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Translator
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Vocal Health Articles
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert insights on vocal technique, health, and performance to help you sing better and protect your voice.
            </p>
          </div>

          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                Featured Articles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map(article => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <article className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:shadow-lg group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{article.readTime}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>By {article.author}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
              All Articles ({filteredArticles.length})
            </h2>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.881-6.25-2.344.875-.378 1.847-.756 2.5-.844 1.312-.176 2.188-.8 2.188-1.812 0-1.012-.876-1.636-2.188-1.812" />
                </svg>
                <p className="text-muted-foreground">No articles found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(article => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <article className="bg-card rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:shadow-lg group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{article.readTime}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>By {article.author}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Call to Action */}
          <section className="text-center py-12 mt-12 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Ready to Improve Your Vocal Technique?</h3>
            <p className="text-muted-foreground mb-6">
              Try our Vocal Technique Translator to practice proper phonetic pronunciation.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              Try the Translator
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AdSenseScript from "@/components/AdSense/AdSenseScript";
import GoogleCMP from "@/components/GoogleCMP";
import GoogleConsentInit from "@/components/GoogleConsentInit";
import ThemeToggle from "@/components/ThemeToggle";

// Configure Noto Sans for UI text with phonetic support
const notoSans = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
  preload: true,
});

// Configure Noto Serif for optional use in content areas
const notoSerif = Noto_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Vocal Technique Translator | Free IPA & Phonetics Tool for Singers",
  description: "Professional vocal phonetics tool for singers and voice teachers. Transform lyrics using IPA notation and syllable-based techniques for improved vocal technique and open throat positioning.",
  keywords: "IPA for singers, vocal phonetics, singing technique, voice training, phonetic transcription, vocal exercises, singing pronunciation, voice coaching tools",
  metadataBase: new URL('https://vocaltechniquetranslator.com'),
  alternates: {
    canonical: 'https://vocaltechniquetranslator.com',
  },
  openGraph: {
    title: "Vocal Technique Translator | Free IPA & Phonetics Tool for Singers",
    description: "Professional vocal phonetics tool for singers and voice teachers. Transform lyrics using IPA notation and syllable-based techniques.",
    type: "website",
    locale: "en_US",
    url: 'https://vocaltechniquetranslator.com',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vocal Technique Translator - Transform lyrics for better singing',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocal Technique Translator | Free IPA & Phonetics Tool for Singers",
    description: "Professional vocal phonetics tool for singers and voice teachers. Transform lyrics using IPA notation and syllable-based techniques.",
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <GoogleConsentInit />
        <GoogleAnalytics />
        <AdSenseScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Web Application Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Vocal Technique Translator",
              "description": "A free online tool that transforms song lyrics into phonetic notation to help singers improve vocal technique and maintain healthy singing practices.",
              "url": "https://vocaltechniquetranslator.com",
              "applicationCategory": "UtilityApplication",
              "applicationSubCategory": "Music Education Tool",
              "operatingSystem": "Any",
              "browserRequirements": "Requires JavaScript enabled",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2030-12-31"
              },
              "creator": {
                "@type": "Person",
                "name": "Jimmy Pocock",
                "url": "https://www.jimmypocock.com"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Vocal Technique Translator",
                "url": "https://vocaltechniquetranslator.com"
              },
              "datePublished": "2024-01-01",
              "dateModified": "2025-02-06",
              "inLanguage": "en-US",
              "isAccessibleForFree": true,
              "featureList": [
                "Real-time lyric transformation",
                "Three intensity levels (Minimal, Moderate, Maximum)",
                "Syllable-based phonetic analysis",
                "Export and copy functionality",
                "No registration required",
                "Privacy-focused (all processing done locally)"
              ],
              "screenshot": "https://vocaltechniquetranslator.com/images/screenshot.png",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150",
                "bestRating": "5",
                "worstRating": "1"
              },
              "potentialAction": {
                "@type": "UseAction",
                "target": {
                  "@type": "EntryPoint",
                  "@id": "https://vocaltechniquetranslator.com",
                  "urlTemplate": "https://vocaltechniquetranslator.com",
                  "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                  ]
                },
                "object": {
                  "@type": "CreativeWork",
                  "name": "Song lyrics to transform"
                }
              }
            })
          }}
        />
        
        {/* Organization Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Vocal Technique Translator",
              "url": "https://vocaltechniquetranslator.com",
              "logo": "https://vocaltechniquetranslator.com/images/logo.svg",
              "description": "Creators of the free phonetic transformation tool for singers and voice teachers.",
              "founder": {
                "@type": "Person",
                "name": "Jimmy Pocock"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "jimmycpocock+VTT@gmail.com",
                "contactType": "Technical Support"
              },
              "sameAs": [
                "https://www.jimmypocock.com"
              ]
            })
          }}
        />
      </head>
      <body className={notoSans.className}>
        {/* Gradient orbs container to prevent overflow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="gradient-orb orb1" />
          <div className="gradient-orb orb2" />
          <div className="gradient-orb orb3" />
          <div className="gradient-orb orb4" />
        </div>
        
        <ThemeToggle />
        {children}
        <GoogleCMP />
      </body>
    </html>
  );
}

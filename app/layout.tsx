import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AdSenseScript from "@/components/AdSense/AdSenseScript";
import CookieConsent from "@/components/CookieConsent";
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
  openGraph: {
    title: "Vocal Technique Translator | Free IPA & Phonetics Tool for Singers",
    description: "Professional vocal phonetics tool for singers and voice teachers. Transform lyrics using IPA notation and syllable-based techniques.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocal Technique Translator | Free IPA & Phonetics Tool for Singers",
    description: "Professional vocal phonetics tool for singers and voice teachers. Transform lyrics using IPA notation and syllable-based techniques.",
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
        <GoogleAnalytics />
        <AdSenseScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Educational Tool Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["WebApplication", "EducationalResource"],
              "name": "Vocal Technique Translator",
              "description": "A professional phonetics tool that transforms song lyrics using IPA notation and syllable-based techniques to help singers improve vocal technique and open throat positioning.",
              "url": "https://vocaltechniquetranslator.com",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Vocal Technique Translator"
              },
              "educationalUse": ["Vocal Training", "Music Education", "Voice Coaching", "Phonetics Study"],
              "learningResourceType": ["Interactive Tool", "Phonetic Transcription", "Vocal Exercise"],
              "educationalLevel": ["Beginner", "Intermediate", "Advanced"],
              "audience": {
                "@type": "EducationalAudience",
                "educationalRole": ["Singer", "Voice Teacher", "Music Student", "Voice Coach"]
              },
              "teaches": ["Vocal Technique", "IPA Notation", "Phonetic Transcription", "Singing Pronunciation"],
              "about": [
                {
                  "@type": "Thing",
                  "name": "Vocal Technique"
                },
                {
                  "@type": "Thing",
                  "name": "International Phonetic Alphabet"
                },
                {
                  "@type": "Thing",
                  "name": "Voice Training"
                },
                {
                  "@type": "Thing",
                  "name": "Singing Phonetics"
                }
              ],
              "mainEntity": {
                "@type": "Course",
                "name": "Interactive Vocal Phonetics Training",
                "description": "Learn proper vocal technique through syllable-based phonetic transformation of song lyrics",
                "provider": {
                  "@type": "Organization",
                  "name": "Vocal Technique Translator"
                },
                "educationalCredentialAwarded": "Certificate of Completion",
                "courseMode": "online",
                "hasCourseInstance": {
                  "@type": "CourseInstance",
                  "courseMode": "online",
                  "courseWorkload": "Self-paced"
                }
              },
              "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", ".description", ".how-it-works"]
              }
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
        <CookieConsent />
      </body>
    </html>
  );
}

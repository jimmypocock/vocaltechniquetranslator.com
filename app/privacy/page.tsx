import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Vocal Technique Translator',
  description: 'Privacy Policy for Vocal Technique Translator. Learn how we protect your data and respect your privacy.',
  alternates: {
    canonical: 'https://www.vocaltechniquetranslator.com/privacy',
  },
};

export default function PrivacyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "description": "Privacy Policy for Vocal Technique Translator. Learn how we protect your data and respect your privacy.",
    "url": "https://www.vocaltechniquetranslator.com/privacy",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Vocal Technique Translator",
      "url": "https://www.vocaltechniquetranslator.com"
    },
    "about": {
      "@type": "Thing",
      "name": "Privacy Policy"
    },
    "dateModified": new Date().toISOString(),
    "inLanguage": "en-US"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-start justify-center p-5 pt-20">
      <div className="container bg-white/95 rounded-[20px] p-[30px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-[10px] w-full max-w-[800px]">
        <h1 className="text-[2.5em] mb-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent text-center">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
          <p>
            The Vocal Technique Translator respects your privacy. We collect minimal information necessary to provide and improve our service:
          </p>
          <ul>
            <li>Usage data through Google Analytics (page views, session duration)</li>
            <li>Technical information (browser type, device type) for optimization</li>
            <li>No personal information or lyrics data is stored on our servers</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Advertising</h2>
          <p>
            This site is affiliated with Google AdSense, which uses cookies to serve ads based on your prior visits to this website or other websites. 
            Third-party vendors, including Google, use cookies to serve ads based on someone&apos;s past visits to this website.
          </p>
          <p>
            Google&apos;s use of advertising cookies enables it and its partners to serve ads based on visits to this site and/or other sites on the Internet.
            Users may opt out of personalized advertising by visiting{' '}
            <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Google Ads Settings
            </a>.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Cookies</h2>
          <p>
            We use cookies to:
          </p>
          <ul>
            <li>Remember your consent preferences</li>
            <li>Analyze site traffic through Google Analytics</li>
            <li>Serve relevant advertisements through Google AdSense</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our site.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Data Processing</h2>
          <p>
            All vocal technique translations are processed locally in your browser. We do not store, transmit, or have access to the lyrics you input.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Third-Party Services</h2>
          <p>
            We use the following third-party services:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> For understanding site usage patterns</li>
            <li><strong>Google AdSense:</strong> For displaying advertisements</li>
            <li><strong>AWS CloudFront:</strong> For content delivery and site performance</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Opt out of personalized advertising</li>
            <li>Disable cookies in your browser</li>
            <li>Use the site without accepting non-essential cookies</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:jimmycpocock@gmail.com" className="text-blue-600 hover:underline">
              jimmycpocock@gmail.com
            </a>.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Terms of Service</h2>
          <p>
            Your use of the Vocal Technique Translator is also governed by our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.
          </p>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Vocal Technique Translator
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Vocal Technique Translator',
  description: 'Terms of Service for Vocal Technique Translator. Read our terms and conditions for using our vocal phonetics tool.',
  alternates: {
    canonical: 'https://www.vocaltechniquetranslator.com/terms',
  },
};

export default function TermsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service",
    "description": "Terms of Service for Vocal Technique Translator. Read our terms and conditions for using our vocal phonetics tool.",
    "url": "https://www.vocaltechniquetranslator.com/terms",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Vocal Technique Translator",
      "url": "https://www.vocaltechniquetranslator.com"
    },
    "about": {
      "@type": "Thing",
      "name": "Terms of Service"
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
          Terms of Service
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Effective Date: {new Date().toLocaleDateString()} | Last Updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Vocal Technique Translator (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Service.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. License to Use</h2>
          <p>
            Subject to your compliance with these Terms, you are granted a limited, non-exclusive, non-transferable license to:
          </p>
          <ul>
            <li>Access and use the Vocal Technique Translator website for personal, non-commercial purposes</li>
            <li>Use the Service for educational and practice purposes related to vocal technique</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. Restrictions</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Copy, modify, or create derivative works of the Service</li>
            <li>Distribute, sell, rent, lease, sublicense, or otherwise transfer the Service</li>
            <li>Reverse engineer, decompile, or disassemble the Service</li>
            <li>Use the Service for commercial purposes without written permission</li>
            <li>Remove or alter any proprietary notices or labels</li>
            <li>Use the Service to create a competing product or service</li>
            <li>Use the Service in any way that violates applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to the Service or its servers</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Intellectual Property</h2>
          <p>
            The Service, including all content, features, and functionality, is owned by Jimmy Pocock and is protected by 
            international copyright, trademark, and other intellectual property laws. The name &ldquo;Vocal Technique Translator&rdquo; 
            and all associated branding, logos, and content remain the exclusive property of Jimmy Pocock.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. User Content</h2>
          <p>
            The Service processes lyrics you input locally in your browser. We do not store, transmit, or have access to 
            any lyrics or content you input into the Service. You retain all rights to any content you input.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Privacy</h2>
          <p>
            Your use of the Service is also governed by our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Third-Party Services</h2>
          <p>
            The Service may display advertisements through Google AdSense and collect analytics through Google Analytics. 
            Your interaction with these third-party services is governed by their respective terms and privacy policies.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Disclaimer of Warranties</h2>
          <p className="uppercase">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
            INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Service will be uninterrupted, secure, or error-free. The phonetic translations 
            provided are for educational purposes and may not be suitable for all vocal situations.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Limitation of Liability</h2>
          <p className="uppercase">
            IN NO EVENT SHALL JIMMY POCOCK OR ANY AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
            OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p>
            Our total liability to you for all claims arising from or related to the Service shall not exceed $100.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Jimmy Pocock from any claims, damages, losses, or expenses 
            (including reasonable attorneys&apos; fees) arising from your use of the Service or violation of these Terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">11. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your access to the Service at any time, without notice, 
            for any reason, including violation of these Terms. Upon termination, all licenses granted to you will immediately cease.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">12. Modifications</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. 
            Your continued use of the Service after changes constitutes acceptance of the modified Terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
            the copyright holder resides, without regard to conflict of law principles.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">14. Contact Information</h2>
          <p>
            For questions about these Terms, licensing inquiries, or permission requests, please contact:{' '}
            <a href="mailto:jimmycpocock@gmail.com" className="text-blue-600 hover:underline">
              jimmycpocock@gmail.com
            </a>
          </p>
          
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">
              By using the Vocal Technique Translator, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </p>
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
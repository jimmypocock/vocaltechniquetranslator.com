import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AdSenseScript from "@/components/AdSense/AdSenseScript";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Vocal Technique Translator",
  description: "Transform lyrics for optimal vocal technique and open throat positioning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <AdSenseScript />
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

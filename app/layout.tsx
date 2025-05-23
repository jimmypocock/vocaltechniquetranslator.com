import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}

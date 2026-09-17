import type { Metadata } from "next";
import { Playfair_Display, Courier_Prime, Newsreader } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif-header"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-body"
});

const courier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-typewriter"
});

export const metadata: Metadata = {
  title: "Pragati • Career Intelligence & Application Pipeline",
  description: "Track 03 • Smart, data-driven career optimization and job application tracking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${newsreader.variable} ${courier.variable} bg-[#f4f0e6] text-[#1a1a1a] antialiased min-h-screen selection:bg-[#222] selection:text-[#f4f0e6]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


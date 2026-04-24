import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Open_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { SITE_NAME } from "@/lib/constants";
import { GoogleAnalytics } from '@next/third-parties/google'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const unbounded = Open_Sans({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });

export const metadata: Metadata = {
  metadataBase: new URL('https://tsquarey.store'),
  title: "Tsquarey",
  description: "We have parts that suit your electronics and which you're proud to build. Shop Arduino, sensors, modules, and DIY kits.",
  openGraph: {
    images: ['/logo.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${unbounded.variable} ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} ${openSans.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>

        <GoogleAnalytics gaId="G-00SZCS1HEH" />
      </body>
    </html>
  );
}
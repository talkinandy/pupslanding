import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientBody from "./ClientBody";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "PUPS Bot - Advanced Runes Trading Bot",
  description: "The first advanced Runes Telegram trading bot for Odin!",
  metadataBase: new URL('https://pupslanding.netlify.app'),
  openGraph: {
    title: "PUPS Bot - Advanced Runes Trading Bot",
    description: "The first advanced Runes Telegram trading bot for Odin!",
    url: 'https://pupslanding.netlify.app',
    siteName: 'PUPS Bot',
    images: [
      {
        url: '/images/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'PUPS Bot Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUPS Bot - Advanced Runes Trading Bot',
    description: 'The first advanced Runes Telegram trading bot for Odin!',
    images: ['/images/social-preview.png'],
    creator: '@pupsbot',
  },
  icons: {
    icon: [
      {
        url: "/favicon/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta property="og:title" content="PUPS Bot - Advanced Runes Trading Bot" />
        <meta property="og:description" content="The first advanced Runes Telegram trading bot for Odin!" />
        <meta property="og:image" content="https://pupslanding.netlify.app/images/social-preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://pupslanding.netlify.app" />
        <meta property="og:type" content="website" />
        <meta name="telegram:image" content="https://pupslanding.netlify.app/images/social-preview.png" />
        <meta name="telegram:title" content="PUPS Bot - Advanced Runes Trading Bot" />
        <meta name="telegram:description" content="The first advanced Runes Telegram trading bot for Odin!" />
        <meta name="theme-color" content="#25ad59" />
        <link
          rel="stylesheet"
          href="https://web-assets.same.dev/629347999/863155112.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={cn(
        "min-h-screen antialiased",
        spaceGrotesk.variable,
        outfit.variable,
      )}>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}

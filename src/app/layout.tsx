import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: 'swap',
});

const dion = localFont({
  src: [
    {
      path: '../../public/fonts/Dion.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-dion',
  display: 'swap',
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${dion.variable}`}>
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
        <link rel="preload" href="/fonts/Dion.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Dion.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Dion.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Dion.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

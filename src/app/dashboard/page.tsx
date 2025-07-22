import { Metadata } from 'next';
import DashboardPage from './components/DashboardPage';

export const metadata: Metadata = {
  title: "Odin Dashboard - Top Traders & Analytics | PUPS Bot",
  description: "Track top traders on Odin.fun, monitor performance metrics, and analyze market trends. Real-time data and insights for the Rune ecosystem.",
  metadataBase: new URL('https://pupsbot.com'),
  openGraph: {
    title: "Odin Dashboard - Top Traders & Analytics",
    description: "Track top traders on Odin.fun, monitor performance metrics, and analyze market trends.",
    url: 'https://pupsbot.com/dashboard',
    siteName: 'PUPS Bot',
    images: [
      {
        url: '/images/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'Odin Dashboard',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Odin Dashboard - Top Traders & Analytics',
    description: 'Track top traders on Odin.fun and analyze market trends.',
    images: ['/images/social-preview.png'],
    creator: '@pupsbot',
  },
};

export default function Dashboard() {
  return <DashboardPage />;
}
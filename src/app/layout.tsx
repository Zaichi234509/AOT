import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ScrollProvider } from '@/components/providers/ScrollProvider'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aot-archive.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AoT Archive — Attack on Titan 3D Scrollytelling Archive',
    template: '%s · AoT Archive',
  },
  description:
    'A cinematic, scroll-driven 3D archive of Attack on Titan (進撃の巨人). Relive the Fall of Shiganshina, the Three Walls, the Survey Corps, the Nine Titans, Trost, the Basement and the Rumbling.',
  keywords: [
    'Attack on Titan',
    'Shingeki no Kyojin',
    '進撃の巨人',
    'AoT',
    'Survey Corps',
    'Nine Titans',
    'scrollytelling',
    'Three.js',
    'fan archive',
  ],
  authors: [{ name: 'AoT Archive — Fan Project' }],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'AoT Archive — Attack on Titan 3D Scrollytelling Archive',
    description:
      'Scroll through seven cinematic 3D scenes, then explore the world map, character encyclopedia, Titan bestiary, episode guide, timeline and soundtrack.',
    siteName: 'AoT Archive',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1376,
        height: 768,
        alt: 'AoT Archive — a colossal titan above the walls, wings emblem and title',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AoT Archive — Attack on Titan 3D Scrollytelling Archive',
    description:
      'Seven cinematic 3D scenes, a full character encyclopedia, the Nine Titans, every episode and the complete timeline.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  alternates: { canonical: '/' },
  category: 'entertainment',
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AoT Archive',
  url: siteUrl,
  description:
    'A non-commercial fan-made Attack on Titan archive featuring a 3D scroll-driven retelling, character encyclopedia, Titan bestiary, episode guide, timeline and soundtrack.',
  inLanguage: 'en',
  about: { '@type': 'TVSeries', name: 'Attack on Titan', alternateName: 'Shingeki no Kyojin' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Noto+Serif+JP:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-ink-950 text-parchment antialiased">
        <ScrollProvider>
          <LoadingScreen />
          {children}
        </ScrollProvider>
      </body>
    </html>
  )
}

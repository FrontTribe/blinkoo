import React from 'react'
import { Bricolage_Grotesque } from 'next/font/google'
import { ConditionalNavigation } from '@/components/ConditionalNavigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ServiceWorkerRegister } from './service-worker-register'
import { Toaster } from 'react-hot-toast'
import './styles.css'
import 'react-datepicker/dist/react-datepicker.css'
import 'mapbox-gl/dist/mapbox-gl.css'

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage-grotesque',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

export const metadata = {
  title: {
    default: 'Blinkoo - Exclusive Time-Limited Offers at Local Venues',
    template: '%s | Blinkoo',
  },
  description:
    'Discover exclusive time-boxed offers at local restaurants, cafes, gyms, and venues. Save up to 50% during off-peak hours. Free for customers, powerful for merchants.',
  keywords: [
    'local offers',
    'off-peak deals',
    'time-limited discounts',
    'restaurant deals',
    'exclusive offers',
    'local business discounts',
  ],
  authors: [{ name: 'Off-Peak Team' }],
  openGraph: {
    title: 'Off-Peak - Exclusive Time-Limited Offers at Local Venues',
    description:
      'Turn cold hours into foot traffic. Discover exclusive time-boxed offers at local venues.',
    url: 'https://off-peak.com',
    siteName: 'Off-Peak',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Off-Peak - Exclusive Time-Limited Offers',
    description:
      'Discover exclusive time-boxed offers at local venues. Save up to 50% during off-peak hours.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Off-Peak',
    description:
      'Platform connecting local businesses with customers through time-limited exclusive offers',
    url: 'https://off-peak.com',
    logo: 'https://off-peak.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@off-peak.com',
    },
    sameAs: [
      'https://www.facebook.com/offpeak',
      'https://www.twitter.com/offpeak',
      'https://www.instagram.com/offpeak',
    ],
  }

  return (
    <html lang="en" className={bricolageGrotesque.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="canonical" href="https://off-peak.com" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff385c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Off-Peak" />
        {process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && (
          <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer />
        )}
      </head>
      <body>
        <ErrorBoundary>
          <ServiceWorkerRegister />
          <ConditionalNavigation />
          <main className="pb-16 md:pb-0">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-black border border-gray-800 text-white',
              duration: 3000,
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  )
}

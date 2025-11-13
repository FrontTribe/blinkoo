import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Bricolage_Grotesque } from 'next/font/google'
import { getCurrentUser } from '@/lib/getCurrentUser'
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

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

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
  authors: [{ name: 'Blinkoo Team' }],
  openGraph: {
    title: 'Blinkoo - Exclusive Time-Limited Offers at Local Venues',
    description:
      'Turn cold hours into foot traffic. Discover exclusive time-boxed offers at local venues.',
    url: 'https://blinkoo.com',
    siteName: 'Blinkoo',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blinkoo - Exclusive Time-Limited Offers',
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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()
  const currentUser = await getCurrentUser()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Blinkoo',
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
    <html lang={locale} className={bricolageGrotesque.variable}>
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
        <meta name="apple-mobile-web-app-title" content="Blinkoo" />
        {process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && (
          <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer />
        )}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            <ServiceWorkerRegister />
            <ConditionalNavigation initialUser={currentUser} />
            <main className="pb-16 md:pb-0">{children}</main>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'bg-black border border-gray-800 text-white',
                duration: 3000,
              }}
            />
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

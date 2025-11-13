import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Your Next.js config here
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Add fallbacks for mapbox-gl
    webpackConfig.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    }

    // Exclude mapbox-gl from server-side bundle
    if (!isServer) {
      webpackConfig.externals = [...(webpackConfig.externals || []), { canvas: 'commonjs canvas' }]
    }

    // Prevent WebAssembly from being processed by webpack for mapbox-gl
    webpackConfig.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      type: 'asset/resource',
    })

    return webpackConfig
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })

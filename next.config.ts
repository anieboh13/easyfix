import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: false,

  async headers() {
    return [
      {
        // Applies to every route in the app
        source: '/(.*)',
        headers: [
          {
            // Stops the site from ever being embedded in an iframe on
            // another domain — the standard defense against clickjacking.
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Stops the browser from "guessing" a file's type based on
            // content rather than trusting the declared Content-Type —
            // closes off a class of file-upload/MIME-sniffing attacks.
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Limits how much of your URL gets sent as a Referer header
            // when someone clicks a link away from your site (e.g. to
            // WhatsApp) — sends the full URL to your own pages, but only
            // the origin to other sites.
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Explicitly disables browser features this site never uses,
            // so they can't be abused even via an injected script.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // Tells browsers to always use HTTPS for this domain for the
            // next year, including subdomains — Vercel already serves
            // everything over HTTPS, this just makes it non-negotiable.
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "webconverx",

  project: "easyfix",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});

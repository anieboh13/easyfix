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

export default nextConfig;
# Easy Fix Screens

A production e-commerce catalog site that imports phone-screen replacement parts from AliExpress, applies a configurable markup, and lets customers browse and order via WhatsApp — with a full admin back office for managing products, pricing, and data freshness.

**Live site:** [https://easyfix-opal.vercel.app](https://easyfix-opal.vercel.app)

---

## What this project does

Easy Fix Screens is a real, deployed business tool — not a tutorial project. It serves a Nigerian audience shopping for phone screen replacement parts, sourcing inventory from AliExpress's Affiliate Program and reselling with a markup. Since order fulfillment is manual (no payment gateway), the "checkout" is a pre-filled WhatsApp message to the store owner, who completes the AliExpress purchase on the customer's behalf and earns affiliate commission on top of the product markup.

The interesting engineering problems here aren't in the storefront — they're in reliably pulling, normalizing, and keeping fresh a large catalog of third-party product data (including per-color pricing) from an API that turned out to have several undocumented quirks, rate limits, and data-quality issues that had to be discovered and handled defensively.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, React Server Components) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Supabase, accessed through Prisma ORM |
| File storage | Supabase Storage (product/variant images, resized and re-hosted rather than hotlinked) |
| External data | AliExpress Affiliate API + AliExpress SKU Dimension API (OAuth 2.0) |
| Hosting | Vercel, with Vercel Cron for scheduled background jobs |
| Auth | Custom lightweight admin auth (bcrypt + signed JWT session cookie) — no third-party auth provider, since there's exactly one admin user |
| Automation | GitHub Actions (scheduled database keep-alive job) |

---

## Feature highlights

**Storefront**
- Server-rendered product catalog with category browsing, search, and pagination
- Per-product image gallery with lightbox
- Per-color/variant picker — price and photo update live based on the selected variant, sourced from AliExpress's SKU-level pricing API
- One-click WhatsApp ordering with a pre-filled message (product, selected variant, price) — no cart or payment flow, by design

**Admin back office** (auth-protected)
- Dashboard with catalog stats and recent activity
- Product search/import tool against the live AliExpress catalog
- Product management: edit, hide, delete, per-product price overrides
- Configurable markup rules at global, category, or per-product scope
- Live USD→NGN exchange-rate integration with an adjustable buffer to approximate real-world market rates, plus a manual override

**Background jobs**
- Scheduled price/stock refresh for the entire catalog (Vercel Cron), with automatic delisting detection
- Separate scheduled job for refreshing variant/color pricing
- Both jobs distinguish a *temporary* upstream failure (e.g. a rate limit) from a *genuine* state change (e.g. a product being delisted) — a transient API hiccup never gets mistaken for real data and never overwrites good data with nothing
- A small GitHub Actions workflow independently pings the database on a schedule to prevent the hosting platform's free tier from auto-pausing it during quiet periods

---

## Notable engineering challenges

A few things worth calling out, since they involved real debugging and design decisions rather than following a tutorial:

- **No official Node.js SDK for AliExpress's newer Open Platform.** Authenticating against the SKU-level pricing API required implementing an OAuth 2.0 authorization-code flow by hand, working around gaps and inaccuracies in AliExpress's own developer documentation and testing tools along the way, and settling on a community-maintained SDK after verifying its actual published behavior against its (partially inaccurate) documentation.
- **Defensive handling of inconsistent upstream data.** Real-world API responses from AliExpress's SKU endpoint were found to contain duplicate "unique" IDs across different product variants and occasionally malformed entries — the ingestion logic treats the upstream ID as a non-unique reference field only, generates its own primary keys, and skips malformed records individually rather than failing an entire import.
- **Rate-limit-safe refresh jobs.** Early versions of the scheduled refresh job silently mis-marked rate-limited products as "delisted." The retry/backoff logic was redesigned so a transient failure is always distinguishable from a genuine state change, and refresh jobs never overwrite existing good data based on a failed fetch.
- **Deployment parity issues.** A platform-specific native dependency (image processing) worked locally but crashed in the Linux production environment due to an upstream version regression; diagnosed and pinned to a known-good version. Separately, a production 500 was traced back to environment variables that existed locally but hadn't propagated to the hosting platform — a reminder that "works on my machine" and "works in production" are genuinely different claims worth verifying independently.

---

## Project structure

```
app/
  page.tsx, category/[slug], search/         — public storefront pages
  product/[id]/                              — product detail, image gallery, variant picker
  admin/                                      — auth-protected back office
  api/admin/                                  — admin-only API routes
  api/cron/                                   — scheduled background jobs
lib/
  aliexpress-api.ts                           — AliExpress Affiliate API + SKU API client
  aliexpress-token.ts                         — OAuth token storage and auto-refresh
  markup-engine.ts                            — pricing rule resolution
  image-storage.ts                            — image download/resize/re-host pipeline
  refresh.ts, refresh-variants.ts             — scheduled catalog refresh logic
prisma/
  schema.prisma                               — data model
```

---

## Running locally

```bash
npm install
npx prisma generate
npm run dev
```

Requires a `.env` file with database, Supabase, and AliExpress affiliate credentials (see `prisma/schema.prisma` for the data model these connect to). Not included in this repo, since they're per-account secrets.

---

## About this build

This project was built end-to-end — schema design, API integration, admin tooling, and deployment — while learning the stack hands-on. It's a genuine, still-evolving production tool rather than a portfolio-only exercise, which is part of why it includes some of the messier realities of working with a third-party API: rate limits, inconsistent data, and deployment environment differences that don't show up in a typical tutorial.

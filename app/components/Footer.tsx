import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#22304A] text-white/70 mt-10">
      <div className="max-w-[100rem] mx-auto px-6 py-14 flex flex-col sm:flex-row justify-between gap-8">
        <div>
          <div className="bg-white rounded-md p-1.5 inline-block mb-3">
            <img src="/logo.png" alt="Easy Fix Screens" className="h-8" />
          </div>
          <p className="text-sm max-w-xs">Real replacement screens, fair prices, shipped to you.</p>
        </div>
        <div className="text-sm">
          <p className="text-white font-medium mb-2">Support</p>
          <p>Contact Us</p>
          <p>Shipping</p>
        </div>
        <div className="text-sm">
          <p className="text-white font-medium mb-2">Legal</p>
          <Link href="/privacy-policy" className="block hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="block hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/returns-policy" className="block hover:text-white transition-colors">
            Returns &amp; Refunds
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4">
        <p className="max-w-[100rem] mx-auto text-[11px] leading-relaxed text-white/40">
          Easy Fix Screens is an independent reseller of replacement device parts and is not
          affiliated with, endorsed by, or sponsored by Samsung, Apple, or any other original
          device manufacturer. Product names, brands, and images are used for identification
          purposes only, and all trademarks remain the property of their respective owners.
        </p>
      </div>
      <div className="border-t border-white/10 text-center text-xs py-4">
        © {new Date().getFullYear()} Easy Fix Screens. All Rights Reserved.
      </div>
    </footer>
  )
}

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Easy Fix Screens — Phone Screen Replacement Parts",
  description: "Find the exact replacement screen for your phone. Real parts, fair prices.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-full flex flex-col bg-white text-[#22304A]" suppressHydrationWarning>
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#E5E7EB] px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Easy Fix Screens" className="h-14" />
            </a>
            <nav className="flex gap-6 text-sm text-[#5B6472] font-medium">
              <a href="/" className="hover:text-[#22304A] transition-colors">Shop</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
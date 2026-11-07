import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import { Coffee } from "lucide-react";
import BackgroundMotion from "@/components/BackgroundMotion";
import { BMC_URL } from "@/lib/config";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Pitchside — Live sports",
  description: "Watch live sports from around the world. No account needed.",
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#080b14", width: "device-width", initialScale: 1 };

function Coffeee({ className = "" }: { className?: string }) {
  return (
    <a href={BMC_URL} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg bg-[#FFDD00] px-4 py-2 text-sm font-bold text-black transition hover:brightness-95 ${className}`}>
      <Coffee className="h-4 w-4" aria-hidden /> Buy me a coffee
    </a>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="flex min-h-screen flex-col">
        <BackgroundMotion />
        <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-md">
          <div className="page-x flex h-16 items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Pitch<span className="text-live">side</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm font-medium text-mute md:inline">Support the page</span>
              <Coffeee />
            </div>
          </div>
        </header>
        <main className="page-x w-full flex-1 py-8 sm:py-10">{children}</main>
        <footer className="page-x border-t border-line bg-bg/60 py-8">
          <div className="flex flex-col gap-4 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
            <span className="text-base font-bold text-white">Pitch<span className="text-live">side</span></span>
            <span>Pitchside hosts no media. It only links to streams provided by third parties.</span>
            <Coffeee className="w-fit" />
          </div>
        </footer>
      </body>
    </html>
  );
}

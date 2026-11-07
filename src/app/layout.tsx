import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Pitchside — Live sports",
  description: "Watch live sports from around the world. No account needed.",
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#080b14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
          <div className="page-x flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Pitch<span className="text-live">side</span>
            </Link>
            <span className="flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs font-semibold text-mute">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live" /> Free · No account needed
            </span>
          </div>
        </header>
        <main className="page-x w-full flex-1 py-8 sm:py-10">{children}</main>
        <footer className="page-x border-t border-line py-8">
          <div className="flex flex-col gap-2 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
            <span className="text-base font-bold text-white">Pitch<span className="text-live">side</span></span>
            <span>Pitchside hosts no media. It only links to streams provided by third parties.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

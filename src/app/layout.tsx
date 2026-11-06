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
export const viewport: Viewport = { themeColor: "#080b14" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex h-16 max-w-[1880px] items-center px-5 sm:px-10">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Pitch<span className="text-live">side</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1880px] flex-1 px-5 py-8 sm:px-10">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-mute">
          Pitchside hosts no media. It only links to streams provided by third parties.
        </footer>
      </body>
    </html>
  );
}

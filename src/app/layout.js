import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SimplePlate",
  description: "Framework developed by Next.JS for APU FYP.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/* Header */}
        <header className="flex items-center justify-between bg-neutral-800 text-black p-5">
        <div className="flex-1"></div>
        <Link href="/" className="text-xl font-bold flex-1 text-center text-white hover:text-green-400">SimplePlate</Link>
        <div className="flex flex-1 justify-end gap-4">
          <Link href="/login" className="text-sm text-green-800 hover:underline">Login</Link>
          <Link href="/register" className="text-sm text-green-800 hover:underline">Register</Link>
        </div>
        </header>

      {children}
      {/* Footer */}
      <footer className="flex bg-neutral-800 text-black justify-center items-center text-center p-4">
        <p className="text-sm">© 2025 SimplePlate. All rights reserved.</p>
      </footer>

      </body>
    </html>
  );
}

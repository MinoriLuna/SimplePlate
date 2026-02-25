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
        <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-white/80 backdrop-blur-md text-black p-5">
        <div className="flex-1"></div>
        <Link href="/" className="text-2xl font-bold flex-1 text-center text-gray-900 hover:text-green-800">SimplePlate</Link>
        <div className="flex flex-1 justify-end gap-4">
          <Link href="/login" className="text-sm text-xl font-bold text-green-800 hover:underline">Login</Link>
          <Link href="/register" className="text-sm text-xl font-bold text-green-800 hover:underline">Register</Link>
        </div>
        </header>

      {children}
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex bg-white/80 backdrop-blur-md text-black justify-center items-center text-center p-4">
        <p className="text-sm text-black font-bold">© 2026 SimplePlate. All rights reserved.</p>
      </footer>

      </body>
    </html>
  );
}

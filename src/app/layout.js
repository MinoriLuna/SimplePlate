import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import Header from "../components/Header"; 

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/* Header Component */}
        <Header />

        {children}

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md text-black p-4">
          <div className="flex flex-col items-center text-center gap-1">
            <p className="text-sm font-bold">© 2026 SimplePlate. All rights reserved.</p>

            <p className="text-sm text-slate-500">
              <a
                href="https://www.flaticon.com"
                className="underline hover:text-slate-700"
              >
                Icons created by Freepik - Flaticon
              </a>
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        <header className="bg-white text-black justify-center items-center text-center p-4">
          <link rel="icon" href="/favicon.ico" />
          <title>SimplePlate</title>
        <h1 className="text-xl font-bold">SimplePlate</h1>
      </header>
        {children}
      <footer className="bg-white text-black justify-center items-center text-center p-4">
        <p className="text-sm">© 2025 SimplePlate. All rights reserved.</p>
      </footer>  
      </body>
    </html>
  );
}

// src/components/Footer.js
export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md text-black p-4 border-t border-slate-100">
      <div className="flex flex-col items-center text-center gap-1">
        {/* Your original font-sm bold text */}
        <p className="text-sm font-bold">
          © 2026 SimplePlate. All rights reserved.
        </p>

        {/* Your original attribution link */}
        <p className="text-sm text-slate-500">
          <a
            href="https://www.flaticon.com"
            className="underline hover:text-slate-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Icons created by Freepik - Flaticon
          </a>
        </p>
      </div>
    </footer>
  );
}
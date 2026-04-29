/**
 * SVG Icon Library for SimplePlate
 * All icons are scalable and colorizable via Tailwind classes
 */

export function GiftIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v-1m0 0H8m4 0h4M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2h-3V3a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export function PlateIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" strokeDasharray="2 2" opacity="0.5" />
      <path d="M17 8V16M19 8V16M15 8V12C15 13.1 15.9 14 17 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8V16M5 8V10C5 11.1 5.9 12 7 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrainIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5h.01" />
    </svg>
  );
}

export function SparkIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function LightningIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function WandIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function FireIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2c1 0 1 1 1 1v2c0 1-.5 2-1 3-1 1-1 2-1 3v1c0 2 1 4 3 5 2 1 4 1 6 0 2-1 3-3 3-5v-1c0-1 0-2-1-3-.5-1-1-2-1-3V3c0 0 0-1 1-1h1c0 0 1 0 1 1v2c0 1 .5 2 1 3 1 1 1 2 1 3v1c0 3-2 6-5 7-3 1-6 1-9 0-3-1-5-4-5-7v-1c0-1 0-2 1-3 .5-1 1-2 1-3V3c0 0 0-1 1-1z" />
    </svg>
  );
}

export function CheckIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function XIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

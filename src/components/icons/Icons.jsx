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
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      {/* Actual Magic Wand Path */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

export function FireIcon({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 30 30"
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M12.945 2.25c-1.026 0-1.92.65-2.22 1.628L8.187 11.23a.75.75 0 01-1.426-.14c-.114-.543-.173-1.103-.173-1.677 0-.58.06-1.144.173-1.69a.75.75 0 00-1.146-.807 8.25 8.25 0 003.543 13.92.75.75 0 01.378 1.182 4.498 4.498 0 01-3.522 1.747 9.75 9.75 0 1010.14-15.656.75.75 0 00-.814.793c.063.456.095.92.095 1.391 0 1.63-.385 3.17-1.066 4.534a.75.75 0 01-1.35-.045L12.945 2.25z" 
      />
    </svg>
  );
}

export function CameraIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function DrinkIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c0-1.3-.8-2.4-2-2.8V4h4v1.2C12.8 5.6 12 6.7 12 8v8m-3 0h6m-7 2h8a1 1 0 001-1V5H4v12a1 1 0 001 1z" />
    </svg>
  );
}

export function RepeatIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

export function CutleryIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8V16M19 8V16M15 8V12C15 13.1 15.9 14 17 14M7 8V16M5 8V10C5 11.1 5.9 12 7 12" />
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

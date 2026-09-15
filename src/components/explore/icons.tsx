type IconProps = { className?: string };

export function CheckBadgeIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path
        d="M7 1.5l1.4 1.05 1.74-.16.68 1.6L12.5 5l-.56 1.7L12.5 8.4l-1.68 1-.68 1.6-1.74-.16L7 12l-1.4-1.05-1.74.16-.68-1.6L1.5 8.4l.56-1.7-.56-1.7 1.68-1 .68-1.6 1.74.16L7 1.5z"
        fill="currentColor"
      />
      <path d="M5 7l1.3 1.3L9 5.5" stroke="#141A35" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 4.2V7l2 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.2 2.2" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="6.2" width="9" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.3 6.2V4.6a2.7 2.7 0 015.4 0v1.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function MegaphoneIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path
        d="M2 5.8v2.4a1 1 0 001 1h.6l1 3 1.2-.3-.9-2.7 6.1 1.9V4.9L4.6 6.8H3a1 1 0 00-1 1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path
        d="M2 3.6c0-.66.54-1.2 1.2-1.2h7.6c.66 0 1.2.54 1.2 1.2v4.4c0 .66-.54 1.2-1.2 1.2H6.1L3.6 11V9.2h-.4A1.2 1.2 0 012 8V3.6z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlugIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M6 2v3.2M10 2v3.2M4.6 5.2h6.8v2.4a3.4 3.4 0 01-3.4 3.4 3.4 3.4 0 01-3.4-3.4V5.2zM8 11v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

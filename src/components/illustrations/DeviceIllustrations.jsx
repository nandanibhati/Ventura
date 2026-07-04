function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function HeadphonesIllustration({ className = "h-full w-full" }) {
  const g = uid("hp");
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${g}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${g}-cup`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <path
        d="M28 58V46a32 32 0 0 1 64 0v12"
        stroke={`url(#${g}-band)`}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="16" y="54" width="20" height="34" rx="9" fill={`url(#${g}-cup)`} />
      <rect x="84" y="54" width="20" height="34" rx="9" fill={`url(#${g}-cup)`} />
      <rect x="21" y="63" width="10" height="14" rx="4" fill="#0a0a0a" opacity="0.25" />
      <rect x="89" y="63" width="10" height="14" rx="4" fill="#0a0a0a" opacity="0.25" />
    </svg>
  );
}

export function SmartwatchIllustration({ className = "h-full w-full" }) {
  const g = uid("sw");
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${g}-strap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${g}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.68" />
        </linearGradient>
      </defs>
      <rect x="45" y="6" width="30" height="24" rx="8" fill={`url(#${g}-strap)`} />
      <rect x="45" y="90" width="30" height="24" rx="8" fill={`url(#${g}-strap)`} />
      <rect x="32" y="34" width="56" height="52" rx="16" fill={`url(#${g}-face)`} />
      <rect x="41" y="43" width="38" height="34" rx="9" fill="#0a0a0a" opacity="0.28" />
      <rect x="88" y="52" width="4" height="10" rx="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

export function PhoneIllustration({ className = "h-full w-full" }) {
  const g = uid("ph");
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${g}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="34" y="8" width="52" height="104" rx="13" fill={`url(#${g}-body)`} />
      <rect x="40" y="20" width="40" height="72" rx="4" fill="#0a0a0a" opacity="0.28" />
      <circle cx="60" cy="102" r="4" fill="#0a0a0a" opacity="0.3" />
      <rect x="52" y="14" width="16" height="3" rx="1.5" fill="#0a0a0a" opacity="0.3" />
    </svg>
  );
}

export function SpeakerIllustration({ className = "h-full w-full" }) {
  const g = uid("sp");
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${g}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="24" y="14" width="72" height="92" rx="20" fill={`url(#${g}-body)`} />
      <circle cx="60" cy="46" r="16" fill="#0a0a0a" opacity="0.25" />
      <circle cx="60" cy="46" r="8" fill="#0a0a0a" opacity="0.35" />
      <circle cx="60" cy="82" r="9" fill="#0a0a0a" opacity="0.25" />
      <circle cx="60" cy="82" r="4" fill="#0a0a0a" opacity="0.35" />
    </svg>
  );
}

interface AmenitiesGridProps {
  facilities: string[];
}

function getAmenityIcon(label: string): React.ReactNode {
  const lower = label.toLowerCase();

  if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("internet") || lower.includes("wireless")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (lower.includes("pool") || lower.includes("swimming")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.4.5 2.5 1" />
        <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.4.5 2.5 1" />
        <path d="M14 6a2 2 0 1 0-4 0" />
        <path d="M12 4v7" />
      </svg>
    );
  }

  if (lower.includes("spa") || lower.includes("wellness") || lower.includes("massage")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9.96 9.96 0 0 0-2 .2 10 10 0 1 0 4 0A9.96 9.96 0 0 0 12 2z" />
        <path d="M12 8c-1.7 2.2-2 3.8-2 5a2 2 0 0 0 4 0c0-1.2-.3-2.8-2-5z" />
      </svg>
    );
  }

  if (lower.includes("park") || lower.includes("garage")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }

  if (lower.includes("restaurant") || lower.includes("dining") || lower.includes("food")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    );
  }

  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 5H6a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z" />
        <path d="m8 9 3 3-3 3" />
        <path d="M13 15h3" />
      </svg>
    );
  }

  if (lower.includes("room service") || lower.includes("concierge")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0" />
        <line x1="2" y1="14" x2="22" y2="14" />
        <path d="M18 14v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
        <line x1="12" y1="8" x2="12" y2="14" />
      </svg>
    );
  }

  if (lower.includes("pet") || lower.includes("dog") || lower.includes("animal")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="4" r="2" />
        <circle cx="18" cy="8" r="2" />
        <circle cx="20" cy="16" r="2" />
        <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
      </svg>
    );
  }

  if (lower.includes("air") || lower.includes("conditioning") || lower.includes("ac")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="m19 8-4 4 4 4" />
        <path d="m5 8 4 4-4 4" />
        <path d="M12 2v4" />
        <path d="M12 18v4" />
      </svg>
    );
  }

  if (lower.includes("bar") || lower.includes("lounge") || lower.includes("drink")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8" />
        <path d="M12 11v11" />
        <path d="M20 3H4l8 9.46L20 3z" />
      </svg>
    );
  }

  if (lower.includes("laundry") || lower.includes("wash") || lower.includes("dry clean")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <circle cx="12" cy="13" r="5" />
        <circle cx="7" cy="7" r="1" fill="currentColor" />
        <circle cx="11" cy="7" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (lower.includes("business") || lower.includes("meeting") || lower.includes("conference")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    );
  }

  if (lower.includes("breakfast") || lower.includes("brunch")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    );
  }

  if (lower.includes("elevator") || lower.includes("lift")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="m9 9 3-3 3 3" />
        <path d="m9 15 3 3 3-3" />
      </svg>
    );
  }

  if (lower.includes("safe") || lower.includes("security") || lower.includes("lock")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }

  if (lower.includes("transfer") || lower.includes("shuttle") || lower.includes("airport")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    );
  }

  // Generic check icon fallback
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AmenitiesGrid({ facilities }: AmenitiesGridProps) {
  if (!facilities || facilities.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-text mb-4">Amenities</h2>
      <div className="grid grid-cols-2 gap-3">
        {facilities.map((facility, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-brand/8 border border-brand/15 flex items-center justify-center text-brand shrink-0">
              {getAmenityIcon(facility)}
            </div>
            <span className="text-sm text-text">{facility}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

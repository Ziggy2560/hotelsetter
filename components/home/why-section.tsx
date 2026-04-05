export function WhySection() {
  return (
    <section className="bg-surface py-20">
      <div className="max-w-[1320px] mx-auto px-8">
        <h2 className="text-[32px] font-bold tracking-tight text-text mb-10">Why HotelSetter</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="group bg-white border border-border rounded-[20px] p-8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg hover:-translate-y-0.5">
      {/* Icon container */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{
          backgroundColor: "rgba(0,122,255,0.08)",
          border: "1px solid rgba(0,122,255,0.10)",
        }}
      >
        {feature.icon}
      </div>

      <h3 className="text-[16px] font-semibold text-text mb-2">{feature.title}</h3>
      <p className="text-[14px] text-text-muted leading-relaxed">{feature.description}</p>
    </div>
  );
}

const FEATURES: Feature[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 1.5C7.1 1.5 4.75 3.85 4.75 6.75C4.75 10.5 10 18.5 10 18.5C10 18.5 15.25 10.5 15.25 6.75C15.25 3.85 12.9 1.5 10 1.5ZM10 9C8.62 9 7.5 7.88 7.5 6.5C7.5 5.12 8.62 4 10 4C11.38 4 12.5 5.12 12.5 6.5C12.5 7.88 11.38 9 10 9Z"
          fill="#007AFF"
        />
      </svg>
    ),
    title: "2M+ properties",
    description:
      "Access over two million hotels, resorts, and apartments across every major destination worldwide.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7.5" stroke="#007AFF" strokeWidth="1.5" fill="none" />
        <path
          d="M10 5.5V10.5L13.5 12.5"
          stroke="#007AFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 3.5C4.07 4.72 2.75 6.71 2.75 9C2.75 12.45 5.55 15.25 9 15.25"
          stroke="#007AFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    ),
    title: "Real-time rates",
    description:
      "Live pricing direct from hotels — no stale cache, no inflated markups. What you see is what you pay.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7.5" stroke="#007AFF" strokeWidth="1.5" fill="none" />
        <path
          d="M6.5 10.5L8.5 12.5L13.5 7.5"
          stroke="#007AFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Instant confirmation",
    description:
      "Your booking is confirmed immediately — no waiting, no follow-up calls, no uncertainty.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="9" width="13" height="9.5" rx="2" stroke="#007AFF" strokeWidth="1.5" fill="none" />
        <path
          d="M6.5 9V6.5C6.5 4.57 8.07 3 10 3C11.93 3 13.5 4.57 13.5 6.5V9"
          stroke="#007AFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="13.5" r="1.25" fill="#007AFF" />
      </svg>
    ),
    title: "Secure checkout",
    description:
      "Bank-level encryption and PCI-compliant payment processing keeps every transaction safe.",
  },
];

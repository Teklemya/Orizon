interface Principle {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const PRINCIPLES: Principle[] = [
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    title: "Belonging from day one",
    body: "We believe international students shouldn't have to figure things out alone. Orizon creates a space where your questions are welcomed, your experiences are valued, and your ambitions are shared.",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Clarity over confusion",
    body: "The study abroad journey is complex. We're committed to making it less so — with structured guidance, clear tools, and resources that cut through the noise so you know exactly what to do next.",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Designed for momentum",
    body: "Access and opportunity shouldn't depend on who you know. Orizon levels the playing field — giving every international student the tools, community, and information they need to move forward with confidence.",
  },
];

export default function CommunitySection() {
  return (
    <section id="community" className="py-24 bg-gradient-to-br from-teal-700 to-teal-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-teal-600/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-teal-200 uppercase tracking-widest mb-3">
            Our mission
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-5">
            Built for students navigating big transitions.
          </h2>
          <p className="text-lg text-teal-100 leading-relaxed">
            The study abroad journey is one of the most meaningful — and most
            challenging — things a student can undertake. We built Orizon to
            make it less confusing and more connected.
          </p>
        </div>

        {/* Principles */}
        <div className="grid sm:grid-cols-3 gap-6">
          {PRINCIPLES.map((p) => (
            <PrincipleCard key={p.title} principle={p} />
          ))}
        </div>

        {/* Quote / mission statement */}
        <div className="mt-16 text-center">
          <blockquote className="text-xl font-medium text-white/90 max-w-3xl mx-auto leading-relaxed italic">
            "We created Orizon to support ambition, belonging, and access — because
            every international student deserves a clear path forward."
          </blockquote>
          <p className="mt-4 text-sm text-teal-300">— The Orizon Team</p>
        </div>
      </div>
    </section>
  );
}

function PrincipleCard({ principle }: { principle: Principle }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white mb-5">
        {principle.icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2.5">
        {principle.title}
      </h3>
      <p className="text-sm text-teal-100 leading-relaxed">{principle.body}</p>
    </div>
  );
}

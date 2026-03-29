interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
}

const FEATURES: Feature[] = [
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    title: "Dashboard",
    description:
      "A personalized hub for staying organized, tracking your application progress, and managing every milestone of your study abroad journey.",
    accent: "text-teal-600",
    iconBg: "bg-teal-50 text-teal-600",
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    title: "Essay Studio",
    description:
      "AI-powered support for writing, refining, and polishing your application essays. Get structured feedback and turn your drafts into compelling narratives.",
    accent: "text-violet-600",
    iconBg: "bg-violet-50 text-violet-600",
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
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
        />
      </svg>
    ),
    title: "Community Q&A",
    description:
      "A dedicated space to ask questions, share experiences, and learn from fellow international students who are on the same path as you.",
    accent: "text-blue-600",
    iconBg: "bg-blue-50 text-blue-600",
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
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Opportunities",
    description:
      "Discover scholarships, internships, fellowships, and growth opportunities curated specifically for international students building their future.",
    accent: "text-amber-600",
    iconBg: "bg-amber-50 text-amber-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            One platform. Four powerful tools.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Orizon gives international students the full support system they
            deserve — from planning to community to opportunity.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="group bg-white rounded-2xl p-7 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200">
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${feature.iconBg}`}
      >
        {feature.icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2.5">
        {feature.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

interface Differentiator {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DIFFERENTIATORS: Differentiator[] = [
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
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Built for international students",
    description:
      "Most tools are built for domestic students. Orizon is designed from the ground up for the unique challenges international students face — visa navigation, cultural transitions, language barriers, and more.",
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
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
    title: "More than information — real tools",
    description:
      "Information is everywhere. What students need are tools that help them act. Orizon combines AI-powered essay support, structured roadmaps, and live community interaction — not just articles.",
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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Community + opportunity in one ecosystem",
    description:
      "No more jumping between forums, job boards, and writing tools. Orizon brings your community, your resources, and your opportunities into a single cohesive environment.",
  },
];

export default function WhyOrizonSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Narrative */}
          <div className="sticky top-28">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-widest mb-4">
              Why Orizon
            </p>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6">
              International students deserve a better support system.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Navigating the study abroad journey is hard — not because students
              aren't capable, but because the resources are scattered, the
              process is confusing, and support is rarely designed with
              international students in mind.
            </p>
            <p className="text-base text-slate-500 leading-relaxed">
              Orizon was built to fix that. We bring guidance, writing support,
              community, and opportunity into a single platform — so students
              can focus on their journey, not on figuring out where to start.
            </p>
          </div>

          {/* Right — Differentiators */}
          <div className="space-y-6">
            {DIFFERENTIATORS.map((item) => (
              <DifferentiatorCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DifferentiatorCard({ item }: { item: Differentiator }) {
  return (
    <div className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 group-hover:bg-teal-700 transition-colors">
        {item.icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}

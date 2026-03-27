interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up in seconds with your email or Google account. No lengthy forms — just you and your goals.",
  },
  {
    number: "02",
    title: "Explore tools built for you",
    description:
      "Access your personalized dashboard, essay support, community space, and curated opportunities the moment you log in.",
  },
  {
    number: "03",
    title: "Connect, prepare, and grow",
    description:
      "Engage with a community of students on similar journeys, refine your essays, and track every step of your application.",
  },
  {
    number: "04",
    title: "Access your student ecosystem",
    description:
      "Everything you need to navigate studying abroad is in one place — organized, actionable, and designed around your success.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-widest mb-3">
            Simple to start
          </p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            How Orizon works
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Getting started is straightforward. From signup to your full student
            support system in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <StepCard key={step.number} step={step} isLast={index === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  return (
    <div className="relative flex flex-col">
      {/* Connector line — shown between steps on lg screens */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-6 left-[calc(100%_-_16px)] w-full h-px bg-slate-100 z-0"
          aria-hidden="true"
        />
      )}

      {/* Step number */}
      <div className="relative z-10 flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">{step.number}</span>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-slate-900 mb-2">
        {step.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">
        {step.description}
      </p>
    </div>
  );
}

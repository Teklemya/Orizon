import { Link } from "react-router-dom";

// TODO: Update these paths if your auth routes ever change
const SIGNUP_PATH = "/login";
const LOGIN_PATH = "/login";

export default function CTASection() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative gradient accent */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8">
          <span
            className="w-1.5 h-1.5 rounded-full bg-teal-500"
            aria-hidden="true"
          />
          Start your journey today
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
          Start building your future with Orizon
        </h2>

        <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl mx-auto">
          Join Orizon and access the student support system you've been looking
          for — personalized, powerful, and built for your journey.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={SIGNUP_PATH}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors"
          >
            Get Started — It's Free
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            to={LOGIN_PATH}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Log In to Continue
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          No credit card required. Built for students, by students.
        </p>
      </div>
    </section>
  );
}

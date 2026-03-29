import { Link } from "react-router-dom";

// TODO: Update these paths if your auth routes ever change
const SIGNUP_PATH = "/login";
const LOGIN_PATH = "/login";

export default function HeroSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center pt-16 pb-20 overflow-hidden bg-white"
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-teal-50/70 via-white to-white pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-teal-50/50 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {/* Decorative circle blobs */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-100/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-teal-100/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Copy */}
          <div className="max-w-xl">
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-7">
              <span
                className="w-1.5 h-1.5 rounded-full bg-teal-500"
                aria-hidden="true"
              />
              Built for international students
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Your path to{" "}
              <span className="text-teal-600">studying abroad,</span>{" "}
              all in one place
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Orizon brings together everything international students need —
              personalized roadmaps, essay support, a trusted community, and
              curated opportunities — in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={SIGNUP_PATH}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors"
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
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Log In
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              No credit card required. Join students navigating their journey
              with confidence.
            </p>
          </div>

          {/* Right — Mock UI Preview */}
          <div className="relative hidden lg:block">
            <HeroUIPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Stylized mock of the product UI — swap with a real screenshot later */
function HeroUIPreview() {
  return (
    <div className="relative w-full max-w-md ml-auto">
      {/* Main card — Dashboard */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
        {/* Card header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-0.5">
              Dashboard
            </p>
            <h3 className="text-sm font-semibold text-slate-800">
              Your Roadmap
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
            <svg
              className="w-4.5 h-4.5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-500">Application Progress</span>
            <span className="text-teal-600 font-semibold">68%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-[68%] bg-teal-500 rounded-full" />
          </div>
        </div>

        {/* Roadmap items */}
        <div className="space-y-0.5">
          {ROADMAP_ITEMS.map((item) => (
            <RoadmapItem key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* Floating card — Essay Studio */}
      <div className="absolute -bottom-8 -left-10 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-52 z-20">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-violet-600"
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
          </div>
          <span className="text-xs font-semibold text-slate-800">Essay Studio</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          AI-powered feedback to refine your essays.
        </p>
        <div className="flex gap-1.5">
          {["Draft", "Review", "Polish"].map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Floating card — Opportunities */}
      <div className="absolute -top-6 -right-8 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-48 z-20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-amber-600"
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
          </div>
          <span className="text-xs font-semibold text-slate-800">
            Opportunities
          </span>
        </div>
        <div className="space-y-2">
          {[
            { label: "Merit Scholarship", color: "bg-teal-500" },
            { label: "Research Fellowship", color: "bg-amber-500" },
            { label: "Summer Internship", color: "bg-blue-500" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} aria-hidden="true" />
              <span className="text-xs text-slate-500 truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Community ping — bottom right */}
      <div className="absolute -bottom-4 right-4 bg-white rounded-xl shadow-lg border border-slate-100 px-3.5 py-2.5 z-20 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <svg
            className="w-3.5 h-3.5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Community Q&A</p>
          <p className="text-xs text-slate-400">Live discussions</p>
        </div>
      </div>
    </div>
  );
}

type RoadmapItemStatus = "done" | "active" | "pending";

interface RoadmapItemProps {
  label: string;
  status: RoadmapItemStatus;
}

const ROADMAP_ITEMS: RoadmapItemProps[] = [
  { label: "Personal Statement", status: "done" },
  { label: "Language Test Prep", status: "done" },
  { label: "University Shortlist", status: "active" },
  { label: "Scholarship Research", status: "pending" },
];

function RoadmapItem({ label, status }: RoadmapItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          status === "done"
            ? "bg-teal-500"
            : status === "active"
            ? "bg-white border-2 border-teal-500"
            : "bg-slate-100 border border-slate-200"
        }`}
      >
        {status === "done" && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-sm flex-1 ${
          status === "done"
            ? "text-slate-400 line-through"
            : "text-slate-700 font-medium"
        }`}
      >
        {label}
      </span>
      {status === "active" && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-semibold shrink-0">
          Active
        </span>
      )}
    </div>
  );
}

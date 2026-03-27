import { Link } from "react-router-dom";

// TODO: Update this path if your auth route changes
const SIGNUP_PATH = "/login";

export default function PlatformPreviewSection() {
  return (
    <section className="py-24 bg-slate-900 overflow-hidden relative">
      {/* Subtle background accents */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-teal-600/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-teal-600/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-3">
            Your private workspace
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
            A more powerful experience awaits inside
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Once you sign in, you enter a private student ecosystem built around
            your journey — organized, intelligent, and built to help you move
            forward.
          </p>
        </div>

        {/* Preview grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <PreviewCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            iconColor="text-teal-400"
            iconBg="bg-teal-900/60"
            title="Dashboard"
            subtitle="Roadmap & Progress"
            preview={<DashboardPreview />}
          />
          <PreviewCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            iconColor="text-violet-400"
            iconBg="bg-violet-900/60"
            title="Essay Studio"
            subtitle="Write & Refine"
            preview={<EssayPreview />}
          />
          <PreviewCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
            iconColor="text-blue-400"
            iconBg="bg-blue-900/60"
            title="Community Q&A"
            subtitle="Ask & Connect"
            preview={<CommunityPreview />}
          />
          <PreviewCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            iconColor="text-amber-400"
            iconBg="bg-amber-900/60"
            title="Opportunities"
            subtitle="Discover & Apply"
            preview={<OpportunitiesPreview />}
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to={SIGNUP_PATH}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-colors"
          >
            Unlock Your Workspace
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Free to join. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

interface PreviewCardProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  preview: React.ReactNode;
}

function PreviewCard({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  preview,
}: PreviewCardProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1">{preview}</div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-teal-500/80 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <span className="text-xs text-slate-400 line-through">Personal Statement</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-teal-500 shrink-0" />
        <span className="text-xs text-slate-300">University Shortlist</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-600 shrink-0" />
        <span className="text-xs text-slate-500">Scholarship Research</span>
      </div>
      <div className="mt-3 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full w-[68%] bg-teal-500 rounded-full" />
      </div>
      <p className="text-xs text-slate-500">68% complete</p>
    </div>
  );
}

function EssayPreview() {
  return (
    <div className="space-y-2">
      <div className="bg-slate-700/50 rounded-lg p-2.5">
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          "Growing up between two cultures taught me to navigate uncertainty with curiosity..."
        </p>
      </div>
      <div className="flex gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded-md bg-violet-900/60 text-violet-400 font-medium">Clarity</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-violet-900/60 text-violet-400 font-medium">Tone</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-violet-900/60 text-violet-400 font-medium">Impact</span>
      </div>
    </div>
  );
}

function CommunityPreview() {
  return (
    <div className="space-y-2.5">
      {[
        { q: "Best way to prepare for IELTS?", replies: 12 },
        { q: "SOP for engineering programs?", replies: 8 },
      ].map((item) => (
        <div key={item.q} className="bg-slate-700/50 rounded-lg p-2.5">
          <p className="text-xs text-slate-300 mb-1 leading-snug">{item.q}</p>
          <p className="text-xs text-slate-500">{item.replies} replies</p>
        </div>
      ))}
    </div>
  );
}

function OpportunitiesPreview() {
  return (
    <div className="space-y-2">
      {[
        { title: "Merit Scholarship", tag: "Scholarship", color: "text-teal-400 bg-teal-900/60" },
        { title: "Research Fellowship", tag: "Fellowship", color: "text-amber-400 bg-amber-900/60" },
        { title: "Summer Internship", tag: "Internship", color: "text-blue-400 bg-blue-900/60" },
      ].map((item) => (
        <div key={item.title} className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-300 truncate">{item.title}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium shrink-0 ${item.color}`}>
            {item.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

import { Link } from "react-router-dom";
import type { LegalDocument } from "../../content/legal";
import HomeFooter from "../home/HomeFooter";
import HomeNavbar from "../home/HomeNavbar";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function LegalDocumentPage({
  document,
}: {
  document: LegalDocument;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HomeNavbar />

      <main className="pt-24 pb-16">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div
            className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-slate-50"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                {document.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {document.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {document.summary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  Effective: {document.effectiveDate}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  Last updated: {document.lastUpdated}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Back to home
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  On this page
                </h2>
                <nav className="mt-4 space-y-1" aria-label="Document sections">
                  {document.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <article className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="space-y-4 text-base leading-8 text-slate-700">
                  {document.intro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {document.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={joinClasses(
                    "scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8",
                    index === 0 && "border-teal-100"
                  )}
                >
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {section.title}
                  </h2>

                  <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.bullets && (
                    <ul className="mt-5 space-y-3 text-base leading-8 text-slate-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </article>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

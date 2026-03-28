import type { Step } from "../lib/api";

type Props = {
  steps: Step[];
  sources?: { title: string; url: string }[];
  saveLabel?: string;
  onChangeSaveLabel?: (value: string) => void;
  onSaveCurrent?: () => void;
};

export default function RoadmapList({
  steps,
  sources = [],
  saveLabel = "",
  onChangeSaveLabel,
  onSaveCurrent,
}: Props) {
  const hasSteps = steps.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSaveCurrent) onSaveCurrent();
  }

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Generated Roadmap</h2>
          <p className="text-sm text-gray-600">
            Checklist of your current application steps.
          </p>
        </div>

        {hasSteps && onSaveCurrent && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 sm:items-center"
          >
            <input
              className="w-full sm:w-64 rounded-lg border px-3 py-1.5 text-sm"
              placeholder="Label this roadmap (e.g. UC CS 2026)"
              value={saveLabel}
              onChange={(e) =>
                onChangeSaveLabel && onChangeSaveLabel(e.target.value)
              }
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-xl px-3 py-1.5 bg-black text-white text-xs sm:text-sm hover:bg-gray-800"
            >
              Save roadmap
            </button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <article
            key={step.id}
            className="border rounded-2xl px-4 py-3 hover:border-gray-300"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-sm sm:text-base">
                    {step.title}
                  </h3>

                  {step.dueDate && (
                    <span className="text-xs text-gray-400">
                      due {new Date(step.dueDate).toLocaleDateString()}
                    </span>
                  )}

                  <span className="ml-auto text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">
                    {step.stage}
                  </span>
                </div>

                {step.description && (
                  <p className="mt-1 text-xs text-gray-600 whitespace-pre-line">
                    {step.description}
                  </p>
                )}

                {step.links && step.links.length > 0 && (
                  <details className="mt-3 group">
                    <summary className="flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-wide text-gray-400 list-none [&::-webkit-details-marker]:hidden">
                      <span className="transition-transform group-open:rotate-90">
                        ▸
                      </span>
                      <span>Helpful pages</span>
                    </summary>

                    <ul className="mt-2 ml-5 space-y-1">
                      {step.links.map((link) => (
                        <li key={link.url}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wide text-gray-400 list-none [&::-webkit-details-marker]:hidden">
              <span className="transition-transform group-open:rotate-90">
                ▸
              </span>
              <span>Sources</span>
            </summary>

            <ul className="mt-3 ml-5 list-disc space-y-1 text-sm text-gray-600">
              {sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </section>
  );
}
import { useMemo, useRef, useState } from "react";
import { API_BASE } from "../lib/apiBase";
import RichTextEditor from "../components/RichTextEditor";

type EssayFeedback = {
  overall: string;
  strengths: string[];
  suggestions: string[];
};

type PracticePromptCategory =
  | "personal-statement"
  | "why-major"
  | "scholarship"
  | "leadership"
  | "challenge-growth";

type PracticePrompt = {
  title: string;
  prompt: string;
};

function htmlToPlainText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const DEFAULT_CONTEXT = "U.S. college application personal statement";

const CATEGORY_OPTIONS: {
  value: PracticePromptCategory;
  label: string;
}[] = [
  { value: "personal-statement", label: "Personal Statement" },
  { value: "why-major", label: "Why This Major" },
  { value: "scholarship", label: "Scholarship" },
  { value: "leadership", label: "Leadership" },
  { value: "challenge-growth", label: "Challenge & Growth" },
];

export default function EssayStudio() {
  const [draftHtml, setDraftHtml] = useState("<p></p>");
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);

  const [promptCategory, setPromptCategory] =
    useState<PracticePromptCategory>("personal-statement");
  const [intendedMajor, setIntendedMajor] = useState("Information Technology");
  const [practicePrompts, setPracticePrompts] = useState<PracticePrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PracticePrompt | null>(
    null
  );

  const draftSectionRef = useRef<HTMLDivElement | null>(null);

  const draftText = useMemo(() => htmlToPlainText(draftHtml), [draftHtml]);
  const wordCount = useMemo(() => {
    if (!draftText) return 0;
    return draftText.split(/\s+/).filter(Boolean).length;
  }, [draftText]);

  async function handleGeneratePrompts() {
    setPromptLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/ai/essay/practice-prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: promptCategory,
          intendedMajor,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as { prompts?: PracticePrompt[] };
      setPracticePrompts(Array.isArray(data.prompts) ? data.prompts : []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to generate prompts."
      );
    } finally {
      setPromptLoading(false);
    }
  }

  function handleUsePrompt(item: PracticePrompt) {
    setSelectedPrompt(item);
    setContext(item.prompt);
    setFeedback(null);
    setError(null);

    requestAnimationFrame(() => {
      draftSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleContextChange(value: string) {
    setContext(value);

    if (selectedPrompt && value !== selectedPrompt.prompt) {
      setSelectedPrompt(null);
    }
  }

  function handleClearSelectedPrompt() {
    setSelectedPrompt((current) => {
      if (current && context === current.prompt) {
        setContext("");
      }
      return null;
    });
  }

  async function handleGetFeedback(e: React.FormEvent) {
    e.preventDefault();

    if (!draftText) {
      setError("Please enter your essay draft.");
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/ai/essay/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptContext: context,
          draftHtml,
          draftText,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as EssayFeedback;
      setFeedback(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Essay Studio</h1>
        <p className="text-sm text-gray-500">
          Write or paste your essay and get structured AI feedback on content,
          clarity, tone, structure, and formatting choices.
        </p>
      </header>

      <section
        ref={draftSectionRef}
        className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm space-y-4"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Get Feedback on Your Draft
          </h2>
          <p className="text-sm text-gray-500">
            Paste your essay and get structured feedback on clarity, tone,
            organization, and formatting.
          </p>
        </div>

        <form onSubmit={handleGetFeedback} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-600">Essay prompt or context</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={context}
              onChange={(e) => handleContextChange(e.target.value)}
              placeholder="e.g. Common App personal statement for Information Technology"
            />
          </label>

          {selectedPrompt && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Selected prompt
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">
                    {selectedPrompt.prompt}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelectedPrompt}
                  aria-label="Remove selected prompt"
                  title="Remove selected prompt"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6h18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 6V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 6 7.5 19.25A1.75 1.75 0 0 0 9.25 21h5.5A1.75 1.75 0 0 0 16.5 19.25L17.25 6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 10.25v6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 10.25v6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your draft</span>
              <span className="text-xs text-gray-500">{wordCount} words</span>
            </div>

            <div className="mt-1">
              <RichTextEditor
                content={draftHtml}
                onChange={setDraftHtml}
                placeholder="Paste your essay here..."
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-xl px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Get Feedback"}
            </button>

            <button
              type="button"
              onClick={() => {
                setDraftHtml("<p></p>");
                setFeedback(null);
                setError(null);
                setSelectedPrompt(null);
                setContext(DEFAULT_CONTEXT);
              }}
              className="inline-flex items-center rounded-xl px-4 py-2 border text-sm hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {feedback && (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3 bg-gray-50 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-1">Overall summary</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {feedback.overall}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Strengths</h3>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              {feedback.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
            <h3 className="text-sm font-semibold mb-2">Suggestions</h3>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              {feedback.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900">
              Practice a Prompt
            </h2>

            <span className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-[10px] font-medium text-white">
              AI Powered
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Generate practice prompts inspired by current Common App-style
            admissions themes.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-gray-600">Category</span>
            <select
              value={promptCategory}
              onChange={(e) =>
                setPromptCategory(e.target.value as PracticePromptCategory)
              }
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
            >
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-600">Intended major</span>
            <input
              value={intendedMajor}
              onChange={(e) => setIntendedMajor(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="e.g. Information Technology"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGeneratePrompts}
            disabled={promptLoading}
            className="inline-flex items-center rounded-xl px-4 py-2 border bg-white text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
          >
            {promptLoading ? "Generating..." : "Generate prompts"}
          </button>
        </div>

        {practicePrompts.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {practicePrompts.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-2xl border bg-white p-4 space-y-3"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{item.prompt}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleUsePrompt(item)}
                  className="inline-flex items-center rounded-xl px-3 py-2 text-sm border hover:bg-gray-50"
                >
                  Use prompt
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
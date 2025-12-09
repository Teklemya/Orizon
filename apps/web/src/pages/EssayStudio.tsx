import { useState } from "react";

type EssayFeedback = {
  overall: string;
  strengths: string[];
  suggestions: string[];
};

export default function EssayStudio() {
  const [draft, setDraft] = useState("");
  const [context, setContext] = useState(
    "U.S. college application personal statement"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);

  async function handleGetFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/ai/essay/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptContext: context,
          draft,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as EssayFeedback;
      setFeedback(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Essay Studio</h1>
        <p className="text-sm text-gray-500">
          Paste your draft and get structured AI feedback: overall summary,
          strengths, and concrete suggestions.
        </p>
      </header>

      <form onSubmit={handleGetFeedback} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Context</span>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Common App personal statement for Computer Science"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Your draft</span>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-3 text-sm min-h-[180px]"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste your essay here..."
          />
        </label>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-xl px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Get Feedback"}
        </button>
      </form>

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
    </div>
  );
}

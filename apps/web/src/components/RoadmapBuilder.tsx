import { useState } from "react";

type Level = "Undergrad" | "Graduate";
type Step = {
  id: number;
  title: string;
  stage: "Pre-Arrival" | "Visa" | "Post-Arrival";
  status: "pending" | "in-progress" | "done";
  dueDate: string | null;
  deps: number[];
  description?: string;
};

export default function RoadmapBuilder({
  onGenerated,
}: {
  onGenerated: (steps: Step[], sources: { title: string; url: string }[]) => void;
}) {
  const [country, setCountry] = useState("Peru");
  const [level, setLevel] = useState<Level>("Undergrad");
  const [intakeMonth, setIntakeMonth] = useState("August");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);
  const [targets, setTargets] = useState("purdue,ucincinnati");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // <-- important: avoid full page reload
    setLoading(true);
    setErr(null);
    try {
      const targetUniversities = targets
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/ai/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: "demo",
          country,
          level,
          intakeMonth,
          targetYear,
          targetUniversities,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const { steps, sources } = await res.json();
      onGenerated(steps, sources);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-xl font-semibold mb-4">AI Roadmap Generator</h3>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-gray-600">Country</span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Level</span>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
          >
            <option>Undergrad</option>
            <option>Graduate</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Intake month</span>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={intakeMonth}
            onChange={(e) => setIntakeMonth(e.target.value)}
          >
            {["January", "May", "August"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Target year</span>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
          />
        </label>

        <label className="sm:col-span-2 block">
          <span className="text-sm text-gray-600">Universities (IDs, comma-separated)</span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="purdue,ucincinnati"
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
          />
          <span className="text-xs text-gray-500">IDs must match your KB (schools.json).</span>
        </label>

        {err && (
          <div className="sm:col-span-2 text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2">
            {err}
          </div>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate Roadmap"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { API_BASE } from "../lib/apiBase";
import type { Step } from "../lib/api";

type Level = "Undergrad" | "Graduate";

type School = {
  id: string;
  name: string;
};

export default function RoadmapBuilder({
  onGenerated,
}: {
  onGenerated: (steps: Step[], sources: { title: string; url: string }[]) => void;
}) {
  const [country, setCountry] = useState("Peru"); // home / citizenship country
  const [level, setLevel] = useState<Level>("Undergrad");
  const [intakeMonth, setIntakeMonth] = useState("August");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);

  // NEW: intended major (optional)
  const [intendedMajor, setIntendedMajor] = useState("");

  // schools + selected university
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const loadingMessages = [
    "Analyzing your profile...",
    "Retrieving university requirements...",
    "Building your personalized roadmap...",
    "Finalizing your roadmap...",
  ];

  useEffect(() => {
    if (!loading) return;

    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
      prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 10800);

    return () => clearInterval(interval);
    }, [loading]);

  // ---- load schools from backend once ----
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function load() {
      try {
        setLoadingSchools(true);
        setErr(null);
        const res = await fetch(`${API_BASE}/ai/schools`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to load universities`);
        const data = await res.json();
        if (!mounted) return;
        const simple: School[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
        }));
        setSchools(simple);
        if (simple.length > 0) {
          setSelectedSchoolId(simple[0].id); // default to first school
        }
      } catch (e: any) {
        if (controller.signal.aborted) return;
        console.error(e);
        setErr(e?.message ?? "Error loading universities");
      } finally {
        if (!mounted) return;
        setLoadingSchools(false);
      }
    }
    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      if (!selectedSchoolId) {
        throw new Error("Please choose a university.");
      }

      const targetUniversities = [selectedSchoolId];

      // Build payload and only include intendedMajor if provided
      const payload: any = {
        profileId: "demo",
        country, // home country
        destinationCountry: "United States", // purely informational if you want
        level,
        intakeMonth,
        targetYear,
        targetUniversities,
      };

      if (intendedMajor.trim()) {
        payload.intendedMajor = intendedMajor.trim();
      }

      const res = await fetch(`${API_BASE}/ai/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-semibold">Roadmap Generator</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white/90">
          AI Powered
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-gray-600">Home country</span>
          <input
            disabled={loading}
            className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Level</span>
          <select
            disabled={loading}
            className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
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
            disabled={loading}
            className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
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
            disabled={loading}
            type="number"
            className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
          />
        </label>

        <label className="sm:col-span-2 block">
          <span className="text-sm text-gray-600">
            Intended major{" "}
            <span className="text-xs text-gray-400">(optional)</span>
          </span>
          <input
            disabled={loading}
            className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="e.g. Computer Science, Business, Mechanical Engineering"
            value={intendedMajor}
            onChange={(e) => setIntendedMajor(e.target.value)}
          />
        </label>

        <label className="sm:col-span-2 block">
          <span className="text-sm text-gray-600">University (USA)</span>
          {loadingSchools ? (
            <p className="mt-1 text-sm text-gray-500">
              Loading universities…
            </p>
          ) : (
            <select
              disabled={loading}
              className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <span className="text-xs text-gray-500">
            Options are loaded from the Orizon schools knowledge base.
          </span>
        </label>

        {err && (
          <div className="sm:col-span-2 text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2">
            {err}
          </div>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading || loadingSchools}
            className="inline-flex items-center rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Generating roadmap..." : "Generate Roadmap"}
          </button>

          {loading && (
            <div className="mt-3 rounded-xl border bg-gray-50 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-black animate-pulse" />
                <p className="text-sm text-gray-700">
                  {loadingMessages[loadingStep]}
                </p>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-black transition-all duration-500"
                  style={{
                    width: `${((loadingStep + 1) / loadingMessages.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
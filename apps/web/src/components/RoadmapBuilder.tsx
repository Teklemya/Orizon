import { useEffect, useState } from "react";

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
  const [err, setErr] = useState<string | null>(null);

  // ---- load schools from backend once ----
  useEffect(() => {
    async function load() {
      try {
        setLoadingSchools(true);
        setErr(null);
        const res = await fetch("/ai/schools");
        if (!res.ok) throw new Error(`Failed to load universities`);
        const data = await res.json();
        const simple: School[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
        }));
        setSchools(simple);
        if (simple.length > 0) {
          setSelectedSchoolId(simple[0].id); // default to first school
        }
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Error loading universities");
      } finally {
        setLoadingSchools(false);
      }
    }
    load();
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
        country,           // home country
        destinationCountry: "United States", // purely informational if you want
        level,
        intakeMonth,
        targetYear,
        targetUniversities,
      };

      if (intendedMajor.trim()) {
        payload.intendedMajor = intendedMajor.trim();
      }

      const res = await fetch("/ai/roadmap/generate", {
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
      <h3 className="text-xl font-semibold mb-4">AI Roadmap Generator</h3>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-gray-600">Home country</span>
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

        {/* NEW: intended major (optional) */}
        <label className="sm:col-span-2 block">
          <span className="text-sm text-gray-600">
            Intended major{" "}
            <span className="text-xs text-gray-400">(optional)</span>
          </span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="e.g. Computer Science, Business, Mechanical Engineering"
            value={intendedMajor}
            onChange={(e) => setIntendedMajor(e.target.value)}
          />
        </label>

        {/* University dropdown */}
        <label className="sm:col-span-2 block">
          <span className="text-sm text-gray-600">University (USA)</span>
          {loadingSchools ? (
            <p className="mt-1 text-sm text-gray-500">
              Loading universities…
            </p>
          ) : (
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
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
            {loading ? "Generating…" : "Generate Roadmap"}
          </button>
        </div>
      </form>
    </div>
  );
}

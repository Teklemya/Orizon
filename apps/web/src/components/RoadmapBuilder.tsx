import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../lib/apiBase";
import type { Step } from "../lib/api";

type Level = "Undergrad" | "Graduate";

type School = {
  id: string;
  name: string;
};

type SchoolApiItem = {
  id: string;
  name: string;
};

type RoadmapGeneratePayload = {
  profileId: string;
  country: string;
  destinationCountry: string;
  level: Level;
  intakeMonth: string;
  targetYear: number;
  targetUniversities: string[];
  intendedMajor?: string;
};

const LOADING_MESSAGES = [
  "Analyzing your profile...",
  "Retrieving university requirements...",
  "Building your personalized roadmap...",
  "Finalizing your roadmap...",
];

function isSchoolApiItem(value: unknown): value is SchoolApiItem {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.name === "string";
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function RoadmapBuilder({
  onGenerated,
}: {
  onGenerated: (steps: Step[], sources: { title: string; url: string }[]) => void;
}) {
  const [country, setCountry] = useState("Peru");
  const [level, setLevel] = useState<Level>("Undergrad");
  const [intakeMonth, setIntakeMonth] = useState("August");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);
  const [intendedMajor, setIntendedMajor] = useState("");

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const [schoolMenuOpen, setSchoolMenuOpen] = useState(false);
  const schoolMenuRef = useRef<HTMLDivElement | null>(null);

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  useEffect(() => {
    if (!loading) return;

    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 10800);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        schoolMenuRef.current &&
        !schoolMenuRef.current.contains(event.target as Node)
      ) {
        setSchoolMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSchoolMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

        if (!res.ok) throw new Error("Failed to load universities");

        const data: unknown = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid universities response");
        }

        const simple: School[] = data.map((s) => {
          if (!isSchoolApiItem(s)) {
            throw new Error("Invalid university data");
          }

          return {
            id: s.id,
            name: s.name,
          };
        });

        if (!mounted) return;

        setSchools(simple);

        if (simple.length > 0) {
          setSelectedSchoolId(simple[0].id);
        }
      } catch (e: unknown) {
        if (controller.signal.aborted) return;
        console.error(e);
        setErr(getErrorMessage(e, "Error loading universities"));
      } finally {
        if (mounted) {
          setLoadingSchools(false);
        }
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

      const payload: RoadmapGeneratePayload = {
        profileId: "demo",
        country,
        destinationCountry: "United States",
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

      const data: {
        steps: Step[];
        sources: { title: string; url: string }[];
      } = await res.json();

      onGenerated(data.steps, data.sources);
    } catch (e: unknown) {
      console.error(e);
      setErr(getErrorMessage(e, "Failed to generate roadmap"));
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
            <p className="mt-1 text-sm text-gray-500">Loading universities…</p>
          ) : (
            <div ref={schoolMenuRef} className="relative mt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => setSchoolMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left disabled:bg-gray-100 disabled:text-gray-500"
              >
                <span className="truncate">
                  {selectedSchool?.name || "Select a university"}
                </span>

                <svg
                  className={`ml-3 h-4 w-4 shrink-0 transition-transform ${
                    schoolMenuOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {schoolMenuOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg">
                  {schools.map((s) => {
                    const isSelected = s.id === selectedSchoolId;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSchoolId(s.id);
                          setSchoolMenuOpen(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                          isSelected
                            ? "bg-gray-50 font-medium text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
                  {LOADING_MESSAGES[loadingStep]}
                </p>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-black transition-all duration-500"
                  style={{
                    width: `${((loadingStep + 1) / LOADING_MESSAGES.length) * 100}%`,
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
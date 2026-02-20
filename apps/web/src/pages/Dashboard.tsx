import { useEffect, useState } from "react";
import RoadmapBuilder from "../components/RoadmapBuilder";
import RoadmapList from "../components/RoadmapList";
import type { Step } from "../lib/api";
import { API_BASE } from "../lib/apiBase";

type SavedRoadmap = {
  id: number;
  label: string;
  steps: Step[];
  savedAt: string; // ISO string
};

const STORAGE_KEY = "orizon_saved_roadmaps";

export default function Dashboard() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);

  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [saveLabel, setSaveLabel] = useState("");
  const [openSavedId, setOpenSavedId] = useState<number | null>(null);

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [oppLoading, setOppLoading] = useState(true);
  const [oppError, setOppError] = useState<string | null>(null);

  // Load saved roadmaps from localStorage (front-end only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedRoadmaps(parsed);
      }
    } catch {
      // ignore parse errors for demo
    }
  }, []);

  // Fetch opportunities from API
  useEffect(() => {
    fetch(`${API_BASE}/api/opportunities`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        setOpportunities(data);
        setOppLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load opportunities:", err);
        setOppError("Failed to load opportunities");
        setOppLoading(false);
      });
  }, []);

  function persistSaved(next: SavedRoadmap[]) {
    setSavedRoadmaps(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore for demo
    }
  }

  function handleSaveCurrentRoadmap() {
    if (!steps.length) return;

    const label =
      saveLabel.trim() ||
      (steps[0]?.title ? `${steps[0].title.slice(0, 24)}…` : "Untitled roadmap");

    const item: SavedRoadmap = {
      id: Date.now(),
      label,
      steps,
      savedAt: new Date().toISOString(),
    };

    const next = [item, ...savedRoadmaps].slice(0, 6);
    persistSaved(next);
    setSaveLabel("");
    setOpenSavedId(item.id); // immediately open the one we just saved
  }

  function toggleSaved(id: number) {
    setOpenSavedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Guide for international students — roadmap, opportunities, and more.
        </p>
      </header>

      {/* Top grid: generator + side cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <RoadmapBuilder
          onGenerated={(generatedSteps, srcs) => {
            setSteps(generatedSteps);
            setSources(srcs);
          }}
        />
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold">Opportunities</h3>

                <div className="space-y-3 mt-3">
                  {oppLoading && <div className="text-sm text-gray-500">Loading…</div>}
                  {oppError && <div className="text-sm text-red-500">{oppError}</div>}
                  {!oppLoading && opportunities.length === 0 && <div className="text-sm text-gray-500">No opportunities yet.</div>}

                  {opportunities.slice(0, 3).map((o) => (
                    <div key={o.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <a
                            href={o.link || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-gray-800 hover:underline"
                          >
                            {o.title}
                          </a>
                          <div className="text-xs text-gray-500 mt-1">
                            {o.type} • {o.location} • {o.paid ? "Paid" : "Unpaid"}
                          </div>
                        </div>
                        {o.deadline && (
                          <div className="text-[11px] text-gray-400">
                            due {new Date(o.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-2 text-right">
                    <a
                      href="/opportunities"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View all opportunities →
                    </a>
                  </div>
                </div>
              </div>

              {sources.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">Sources</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {sources.map((s) => (
                      <li key={s.url}>
                        <a
                          className="text-blue-600 hover:underline"
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
      </div>

      {/* Generated Roadmap (current) with inline "Save roadmap" */}
      <RoadmapList
        steps={steps}
        saveLabel={saveLabel}
        onChangeSaveLabel={setSaveLabel}
        onSaveCurrent={steps.length ? handleSaveCurrentRoadmap : undefined}
      />

      {/* Saved roadmaps that expand to show their checklist */}
      {savedRoadmaps.length > 0 && (
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">My Roadmaps</h2>
          <p className="text-xs text-gray-500 mb-3">
            Click a saved roadmap to show its checklist below.
          </p>

          <ul className="divide-y divide-gray-100">
            {savedRoadmaps.map((r) => (
              <SavedRoadmapCard
                key={r.id}
                roadmap={r}
                isOpen={openSavedId === r.id}
                onToggle={() => toggleSaved(r.id)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * A single saved roadmap row that can expand and has its own local checklist
 * state (checkboxes are demo-only, not persisted).
 */
function SavedRoadmapCard({
  roadmap,
  isOpen,
  onToggle,
}: {
  roadmap: SavedRoadmap;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  function toggleStep(id: number) {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <li className="py-2">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">📌</span>
          <span className="text-sm font-medium text-gray-800">
            {roadmap.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">
            {new Date(roadmap.savedAt).toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400">
            {isOpen ? "▴" : "▾"}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 ml-6 border-l pl-4 space-y-2">
          {roadmap.steps.map((step) => {
            const checked = completedIds.includes(step.id);
            return (
              <div
                key={step.id}
                className="border rounded-xl px-3 py-2 bg-gray-50"
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                    checked={checked}
                    onChange={() => toggleStep(step.id)}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-gray-800">
                        {step.title}
                      </span>
                      {step.dueDate && (
                        <span className="text-[11px] text-gray-400">
                          due {new Date(step.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="ml-auto text-[11px] rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">
                        {step.stage}
                      </span>
                    </div>
                    {step.description && (
                      <p className="mt-1 text-[11px] text-gray-600 whitespace-pre-line">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}

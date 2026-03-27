import { useEffect, useState } from "react";
import RoadmapBuilder from "../components/RoadmapBuilder";
import { useAuth } from "../lib/auth";
import RoadmapList from "../components/RoadmapList";
import type { Step } from "../lib/api";
import { API_BASE } from "../lib/apiBase";

type SavedRoadmap = {
  id: string;
  label: string;
  steps: Step[];
  savedAt: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [steps, setSteps] = useState<Step[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);

  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [saveLabel, setSaveLabel] = useState("");
  const [openSavedId, setOpenSavedId] = useState<string | null>(null);

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [oppLoading, setOppLoading] = useState(true);
  const [oppError, setOppError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoadmaps() {
      try {
        if (!user?.id) return;

        const res = await fetch(`${API_BASE}/api/roadmaps?author_id=${user.id}`);
        if (!res.ok) throw new Error("Failed to load roadmaps");

        const data = await res.json();

        const mapped = data.map((r: any) => ({
          id: r.id,
          label: r.label,
          steps: r.steps,
          savedAt: r.created_at,
        }));

        setSavedRoadmaps(mapped);
      } catch (err) {
        console.error("Failed to load saved roadmaps:", err);
      }
    }

    loadRoadmaps();
  }, [user?.id]);

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

  async function handleSaveCurrentRoadmap() {
    if (!steps.length || !user?.id) return;

    const label =
      saveLabel.trim() ||
      (steps[0]?.title ? `${steps[0].title.slice(0, 24)}…` : "Untitled roadmap");

    try {
      const res = await fetch(`${API_BASE}/api/roadmaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: user.id,
          label,
          steps,
          sources,
        }),
      });

      if (!res.ok) throw new Error("Failed to save roadmap");

      const saved = await res.json();

      const mapped = {
        id: saved.id,
        label: saved.label,
        steps: saved.steps,
        savedAt: saved.created_at,
      };

      setSavedRoadmaps((prev) => [mapped, ...prev]);
      setSaveLabel("");
      setOpenSavedId(saved.id);
    } catch (err) {
      console.error("Failed to save roadmap:", err);
    }
  }

  async function handleDeleteRoadmap(roadmapId: string) {
    if (!user?.id) return;

    const ok = confirm("Delete this roadmap?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/roadmaps/${roadmapId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_id: user.id }),
      });

      if (!res.ok) throw new Error("Failed to delete roadmap");

      setSavedRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
      setOpenSavedId((prev) => (prev === roadmapId ? null : prev));
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
    }
  }

  function toggleSaved(id: string) {
    setOpenSavedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Guide for international students — roadmap, opportunities, and more.
        </p>
      </header>

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
              {oppLoading && (
                <div className="text-sm text-gray-500">Loading…</div>
              )}
              {oppError && <div className="text-sm text-red-500">{oppError}</div>}
              {!oppLoading && opportunities.length === 0 && (
                <div className="text-sm text-gray-500">No opportunities yet.</div>
              )}

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
            </div>
          </div>
        </div>
      </div>

      {steps.length > 0 && (
        <RoadmapList
          steps={steps}
          sources={sources}
          saveLabel={saveLabel}
          onChangeSaveLabel={setSaveLabel}
          onSaveCurrent={handleSaveCurrentRoadmap}
        />
      )}

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">My Roadmaps</h2>

        {savedRoadmaps.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border">
            You haven’t saved any roadmaps yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {savedRoadmaps.map((r) => (
              <SavedRoadmapCard
                roadmap={r}
                key={r.id}
                onToggle={() => toggleSaved(r.id)}
                isOpen={openSavedId === r.id}
                onUpdate={(updatedSteps, updatedLabel) => {
                  setSavedRoadmaps((prev) =>
                    prev.map((rm) =>
                      rm.id === r.id
                        ? {
                            ...rm,
                            steps: updatedSteps ?? rm.steps,
                            label: updatedLabel ?? rm.label,
                          }
                        : rm
                    )
                  );
                }}
                onDelete={() => handleDeleteRoadmap(r.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SavedRoadmapCard({
  roadmap,
  isOpen,
  onToggle,
  onUpdate,
  onDelete,
}: {
  roadmap: SavedRoadmap;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (updatedSteps?: Step[] | null, updatedLabel?: string | null) => void;
  onDelete: () => void;
}) {
  const { user } = useAuth();

  const totalSteps = roadmap.steps.length;
  const completedSteps = roadmap.steps.filter((s) => s.status === "done").length;
  const progressPercent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(roadmap.label);

  async function toggleStep(stepId: number) {
    if (!user?.id) return;

    const updatedSteps: Step[] = roadmap.steps.map((s) =>
      s.id === stepId
        ? { ...s, status: s.status === "done" ? "pending" : "done" }
        : s
    );

    try {
      const res = await fetch(`${API_BASE}/api/roadmaps/${roadmap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: user.id,
          steps: updatedSteps,
        }),
      });

      if (!res.ok) throw new Error("Failed to update roadmap");

      onUpdate(updatedSteps, null);
    } catch (err) {
      console.error("Failed to update step:", err);
    }
  }

  async function handleRename() {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_BASE}/api/roadmaps/${roadmap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: user.id,
          label: draftLabel,
        }),
      });

      if (!res.ok) throw new Error("Rename failed");

      onUpdate(null, draftLabel);
      setEditing(false);
    } catch (err) {
      console.error("Rename failed:", err);
    }
  }

  return (
    <li className="py-2">
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 text-left hover:bg-gray-50 rounded-md px-2 py-1 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">📌</span>

          {editing ? (
            <input
              value={draftLabel}
              autoFocus
              onChange={(e) => setDraftLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRename();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setDraftLabel(roadmap.label);
                  setEditing(false);
                }
              }}
              onBlur={handleRename}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium border rounded px-2 py-1"
            />
          ) : (
            <>
              <span className="text-sm font-medium text-gray-800">
                {roadmap.label}
              </span>

              {/* ✅ More obvious edit button */}
              <span
                role="button"
                tabIndex={0}
                title="Rename roadmap"
                className="text-[12px] text-gray-400 hover:text-gray-700 cursor-pointer select-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDraftLabel(roadmap.label);
                  setEditing(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setDraftLabel(roadmap.label);
                    setEditing(true);
                  }
                }}
              >
                ✎
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {completedSteps}/{totalSteps}
          </span>
          <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            {progressPercent}%
          </span>

          <span className="text-[11px] text-gray-400">
            {new Date(roadmap.savedAt).toLocaleString()}
          </span>

          <span
            role="button"
            tabIndex={0}
            title="Delete roadmap"
            className="text-[12px] text-red-500 hover:text-red-700 cursor-pointer select-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          >
            🗑
          </span>

          <span className="text-[11px] text-gray-400">{isOpen ? "▴" : "▾"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-2 ml-6 border-l pl-4 space-y-2">
          {roadmap.steps.map((step) => {
            const checked = step.status === "done";

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
                    onClick={(e) => e.stopPropagation()}
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
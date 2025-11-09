import { useEffect, useState } from "react";
import type { Step } from "../lib/api";

export default function RoadmapList({ steps }: { steps: Step[] }) {
  // Keep a local copy so checkboxes can toggle without regenerating
  const [local, setLocal] = useState<Step[]>(steps);
  useEffect(() => setLocal(steps), [steps]);

  function toggle(id: number) {
    setLocal((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "done" ? "pending" : "done" } : s
      )
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">My Roadmap</h3>

      {local.length === 0 ? (
        <p className="italic text-gray-500">
          No roadmap yet — use <span className="not-italic font-medium">AI Roadmap Generator</span> to
          create your plan.
        </p>
      ) : (
        <ul className="space-y-3">
          {local.map((step) => (
            <li key={step.id} className="rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Mark "${step.title}" as ${
                    step.status === "done" ? "pending" : "done"
                  }`}
                  checked={step.status === "done"}
                  onChange={() => toggle(step.id)}
                  className="mt-1 size-5 rounded-md"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{step.title}</span>

                    {step.dueDate && (
                      <span className="text-xs text-gray-500">
                        due {new Date(step.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5">
                      {step.stage}
                    </span>
                  </div>

                  {step.description && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">
                        How to complete
                      </summary>
                      <p className="mt-2 text-sm text-gray-700">{step.description}</p>
                    </details>
                  )}
                </div>
              </div>

              {/* Optional: show dependencies */}
              {step.deps && step.deps.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Depends on: {step.deps.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

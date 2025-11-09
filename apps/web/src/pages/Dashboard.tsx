import { useState } from "react";
import RoadmapBuilder from "../components/RoadmapBuilder";
import RoadmapList from "../components/RoadmapList";
import type { Step } from "../lib/api";

export default function Dashboard() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);

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
            <p className="text-sm text-gray-600">No data yet (stub).</p>
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

      {/* Always render the Roadmap section; it shows its own empty state */}
      <RoadmapList steps={steps} />
    </div>
  );
}

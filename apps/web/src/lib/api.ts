export type Level = "Undergrad" | "Graduate";

export type Step = {
  id: number;
  title: string;
  stage: "Pre-Arrival" | "Visa" | "Post-Arrival";
  status: "pending" | "in-progress" | "done";
  dueDate: string | null;
  deps: number[];
  description?: string;
};

export async function generateRoadmap(input: {
  profileId: string;
  country: string;
  level: Level;
  intakeMonth: string;
  targetYear: number;
  targetUniversities?: string[];
}): Promise<{ steps: Step[]; sources: { title: string; url: string }[] }> {
  const res = await fetch("/ai/roadmap/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

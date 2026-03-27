import OpenAI from "openai";
import type { GenInput, Step, SourceRef, SchoolKB } from "../types";
import { schoolSources } from "../kb";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ==========================
// Date Helpers
// ==========================

function isoFromYearMonth(targetYear: number, intakeMonth: string): string {
  const monthIndex = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december",
  ].findIndex((m) => m.startsWith(intakeMonth.toLowerCase()));

  const m = Math.max(0, monthIndex);
  const d = new Date(Date.UTC(targetYear, m, 15));
  return d.toISOString();
}

function addMonthsISO(iso: string, delta: number): string {
  const d = new Date(iso);
  const nd = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 15)
  );
  return nd.toISOString();
}

type AiStep = {
  id: number;
  title: string;
  description: string;
  monthOffset: number;
  deps?: number[];
};

// ==========================
// Main Generator
// ==========================

export async function generateRoadmap(
  input: GenInput,
  schools: SchoolKB[]
): Promise<{ steps: Step[]; sources: SourceRef[] }> {

  const anchor = isoFromYearMonth(input.targetYear, input.intakeMonth);

  // Structured context sent to AI
  const context = {
    studentProfile: {
      country: input.country,
      level: input.level,
      intakeMonth: input.intakeMonth,
      targetYear: input.targetYear,
      intendedMajor: input.intendedMajor ?? null,
      gpa: input["gpa"] ?? null, // safe if later added
    },
    universities: schools.map((s) => ({
      id: s.id,
      name: s.name,
      location: {
        city: s.city,
        state: s.state,
        country: s.country ?? "USA",
      },
      requirements: s.requirements ?? null,
    })),
  };

  const systemPrompt =
    "You are an expert advisor helping international students apply to U.S. universities.";

  const instructions = `
Generate ONLY the APPLICATION PHASE roadmap (before visa stage).

The student has NOT taken any exams yet.

Your job is to:

- Tell the student WHAT they need to do to be eligible to apply.
- Use the structured "requirements" object provided for each university.
- Mention specific exams required (TOEFL iBT, IELTS Academic, Duolingo, SAT, ACT, GRE, GMAT).
- When minimum scores exist in the requirements object, include them clearly.
- If a requirement is missing, tell the student to verify on the official university site.
- If SAT/ACT policy is "blind", clearly state that standardized tests are not considered.
- Tailor advice slightly based on intendedMajor if provided.
- Keep steps concrete and actionable.

Rules:
- Return between 6 and 10 steps.
- Use specific exam names.
- Mention realistic target score ranges when available.
- Each step must include:
    id (number)
    title (string)
    description (string)
    monthOffset (integer, negative = months before intake)
    deps (optional array of ids)
- Do NOT return explanations outside JSON.

Return ONLY valid JSON in this format:

{
  "steps": [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "monthOffset": -10,
      "deps": [1]
    }
  ]
}
`;

  let aiStepsRaw: any[] = [];
  let content = "";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: instructions },
        { role: "user", content: JSON.stringify(context, null, 2) },
      ],
    });

    content = completion.choices[0]?.message?.content ?? "";

    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    const jsonText =
      start !== -1 && end !== -1 ? content.slice(start, end + 1) : content;

    const parsed = JSON.parse(jsonText);

    if (Array.isArray(parsed.steps)) {
      aiStepsRaw = parsed.steps;
    }
  } catch (err) {
    console.error("AI generation failed:", err);
  }

  // ==========================
  // Fallback
  // ==========================

  if (!aiStepsRaw.length) {
    aiStepsRaw = [
      {
        id: 1,
        title: "Research university requirements",
        description:
          "Carefully review admission requirements for each target university, including English proficiency exams and standardized test policies.",
        monthOffset: -12,
      },
      {
        id: 2,
        title: "Plan and register for English proficiency exam",
        description:
          "Register for TOEFL iBT, IELTS Academic, or Duolingo English Test depending on what your universities accept. Aim to meet or exceed published minimum scores.",
        monthOffset: -11,
        deps: [1],
      },
      {
        id: 3,
        title: "Prepare for SAT / ACT or GRE / GMAT (if required)",
        description:
          "If your universities require or recommend standardized tests (SAT/ACT for undergraduate, GRE/GMAT for graduate), begin preparation and schedule exam dates early.",
        monthOffset: -10,
        deps: [1],
      },
      {
        id: 4,
        title: "Request transcripts and recommendation letters",
        description:
          "Contact your school and recommenders early to secure official transcripts and strong recommendation letters.",
        monthOffset: -9,
        deps: [1],
      },
      {
        id: 5,
        title: "Prepare personal statement and resume",
        description:
          "Draft and refine your personal statement, tailoring it to your intended major and each university.",
        monthOffset: -8,
        deps: [4],
      },
      {
        id: 6,
        title: "Submit applications before deadlines",
        description:
          "Complete and submit all applications before official deadlines. Pay attention to early action or rolling admissions policies.",
        monthOffset: -6,
        deps: [2, 3, 5],
      },
    ];
  }

  const steps: Step[] = aiStepsRaw.map((s: AiStep | any, index: number) => {
    const id =
      typeof s.id === "number" && Number.isFinite(s.id) ? s.id : index + 1;

    const monthOffset =
      typeof s.monthOffset === "number" ? s.monthOffset : -12 + index * 2;

    const deps: number[] = Array.isArray(s.deps)
      ? s.deps
          .map((d: unknown) => Number(d))
          .filter((n: number) => Number.isFinite(n))
      : [];

    return {
      id,
      title: String(s.title ?? `Step ${id}`),
      description: String(
        s.description ?? "Follow university application instructions carefully."
      ),
      stage: "Pre-Arrival",
      status: "pending",
      deps,
      dueDate: addMonthsISO(anchor, monthOffset),
    };
  });

  const sources = schoolSources(schools);

  return { steps, sources };
}